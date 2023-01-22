import Hex from "./hex.js";
import Rect from "./rect.js";
import Tile from "./tile.js";
import TileGL from "./tile-gl.js";
import TileGLES2 from "./tile-gles2.js";
import Term from "./term.js";
import * as Text from "../text.js";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../constants.js";
var BACKENDS = {
  "hex": Hex,
  "rect": Rect,
  "tile": Tile,
  "tile-gl": TileGL,
  "tile-gles2": TileGLES2,
  "term": Term
};
var DEFAULT_OPTIONS = {
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  transpose: false,
  layout: "rect",
  fontSize: 15,
  spacing: 1,
  border: 0,
  forceSquareRatio: false,
  fontFamily: "monospace",
  fontStyle: "",
  fg: "#ccc",
  bg: "#000",
  tileWidth: 32,
  tileHeight: 32,
  tileMap: {},
  tileSet: null,
  tileColorize: false
};

/**
 * @class Visual map display
 */
var Display = /*#__PURE__*/function () {
  function Display(options) {
    if (options === void 0) {
      options = {};
    }
    this._data = {};
    this._dirty = false; // false = nothing, true = all, object = dirty cells
    this._options = {};
    options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.setOptions(options);
    this.DEBUG = this.DEBUG.bind(this);
    this._tick = this._tick.bind(this);
    this._backend.schedule(this._tick);
  }

  /**
   * Debug helper, ideal as a map generator callback. Always bound to this.
   * @param {int} x
   * @param {int} y
   * @param {int} what
   */
  var _proto = Display.prototype;
  _proto.DEBUG = function DEBUG(x, y, what) {
    var colors = [this._options.bg, this._options.fg];
    this.draw(x, y, null, null, colors[what % colors.length]);
  }

  /**
   * Clear the whole display (cover it with background color)
   */;
  _proto.clear = function clear() {
    this._data = {};
    this._dirty = true;
  }

  /**
   * @see ROT.Display
   */;
  _proto.setOptions = function setOptions(options) {
    Object.assign(this._options, options);
    if (options.width || options.height || options.fontSize || options.fontFamily || options.spacing || options.layout) {
      if (options.layout) {
        var ctor = BACKENDS[options.layout];
        this._backend = new ctor();
      }
      this._backend.setOptions(this._options);
      this._dirty = true;
    }
    return this;
  }

  /**
   * Returns currently set options
   */;
  _proto.getOptions = function getOptions() {
    return this._options;
  }

  /**
   * Returns the DOM node of this display
   */;
  _proto.getContainer = function getContainer() {
    return this._backend.getContainer();
  }

  /**
   * Compute the maximum width/height to fit into a set of given constraints
   * @param {int} availWidth Maximum allowed pixel width
   * @param {int} availHeight Maximum allowed pixel height
   * @returns {int[2]} cellWidth,cellHeight
   */;
  _proto.computeSize = function computeSize(availWidth, availHeight) {
    return this._backend.computeSize(availWidth, availHeight);
  }

  /**
   * Compute the maximum font size to fit into a set of given constraints
   * @param {int} availWidth Maximum allowed pixel width
   * @param {int} availHeight Maximum allowed pixel height
   * @returns {int} fontSize
   */;
  _proto.computeFontSize = function computeFontSize(availWidth, availHeight) {
    return this._backend.computeFontSize(availWidth, availHeight);
  };
  _proto.computeTileSize = function computeTileSize(availWidth, availHeight) {
    var width = Math.floor(availWidth / this._options.width);
    var height = Math.floor(availHeight / this._options.height);
    return [width, height];
  }

  /**
   * Convert a DOM event (mouse or touch) to map coordinates. Uses first touch for multi-touch.
   * @param {Event} e event
   * @returns {int[2]} -1 for values outside of the canvas
   */;
  _proto.eventToPosition = function eventToPosition(e) {
    var x, y;
    if ("touches" in e) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    return this._backend.eventToPosition(x, y);
  }

  /**
   * @param {int} x
   * @param {int} y
   * @param {string || string[]} ch One or more chars (will be overlapping themselves)
   * @param {string} [fg] foreground color
   * @param {string} [bg] background color
   */;
  _proto.draw = function draw(x, y, ch, fg, bg) {
    if (!fg) {
      fg = this._options.fg;
    }
    if (!bg) {
      bg = this._options.bg;
    }
    var key = x + "," + y;
    this._data[key] = [x, y, ch, fg, bg];
    if (this._dirty === true) {
      return;
    } // will already redraw everything 
    if (!this._dirty) {
      this._dirty = {};
    } // first!
    this._dirty[key] = true;
  }

  /**
   * @param {int} x
   * @param {int} y
   * @param {string || string[]} ch One or more chars (will be overlapping themselves)
   * @param {string || null} [fg] foreground color
   * @param {string || null} [bg] background color
   */;
  _proto.drawOver = function drawOver(x, y, ch, fg, bg) {
    var key = x + "," + y;
    var existing = this._data[key];
    if (existing) {
      existing[2] = ch || existing[2];
      existing[3] = fg || existing[3];
      existing[4] = bg || existing[4];
    } else {
      this.draw(x, y, ch, fg, bg);
    }
  }

  /**
   * Draws a text at given position. Optionally wraps at a maximum length. Currently does not work with hex layout.
   * @param {int} x
   * @param {int} y
   * @param {string} text May contain color/background format specifiers, %c{name}/%b{name}, both optional. %c{}/%b{} resets to default.
   * @param {int} [maxWidth] wrap at what width?
   * @returns {int} lines drawn
   */;
  _proto.drawText = function drawText(x, y, text, maxWidth) {
    var fg = null;
    var bg = null;
    var cx = x;
    var cy = y;
    var lines = 1;
    if (!maxWidth) {
      maxWidth = this._options.width - x;
    }
    var tokens = Text.tokenize(text, maxWidth);
    while (tokens.length) {
      // interpret tokenized opcode stream
      var token = tokens.shift();
      switch (token.type) {
        case Text.TYPE_TEXT:
          var isSpace = false,
            isPrevSpace = false,
            isFullWidth = false,
            isPrevFullWidth = false;
          for (var i = 0; i < token.value.length; i++) {
            var cc = token.value.charCodeAt(i);
            var c = token.value.charAt(i);
            if (this._options.layout === "term") {
              var cch = cc >> 8;
              var isCJK = cch === 0x11 || cch >= 0x2e && cch <= 0x9f || cch >= 0xac && cch <= 0xd7 || cc >= 0xA960 && cc <= 0xA97F;
              if (isCJK) {
                this.draw(cx + 0, cy, c, fg, bg);
                this.draw(cx + 1, cy, "\t", fg, bg);
                cx += 2;
                continue;
              }
            }

            // Assign to `true` when the current char is full-width.
            isFullWidth = cc > 0xff00 && cc < 0xff61 || cc > 0xffdc && cc < 0xffe8 || cc > 0xffee;
            // Current char is space, whatever full-width or half-width both are OK.
            isSpace = c.charCodeAt(0) == 0x20 || c.charCodeAt(0) == 0x3000;
            // The previous char is full-width and
            // current char is nether half-width nor a space.
            if (isPrevFullWidth && !isFullWidth && !isSpace) {
              cx++;
            } // add an extra position
            // The current char is full-width and
            // the previous char is not a space.
            if (isFullWidth && !isPrevSpace) {
              cx++;
            } // add an extra position
            this.draw(cx++, cy, c, fg, bg);
            isPrevSpace = isSpace;
            isPrevFullWidth = isFullWidth;
          }
          break;
        case Text.TYPE_FG:
          fg = token.value || null;
          break;
        case Text.TYPE_BG:
          bg = token.value || null;
          break;
        case Text.TYPE_NEWLINE:
          cx = x;
          cy++;
          lines++;
          break;
      }
    }
    return lines;
  }

  /**
   * Timer tick: update dirty parts
   */;
  _proto._tick = function _tick() {
    this._backend.schedule(this._tick);
    if (!this._dirty) {
      return;
    }
    if (this._dirty === true) {
      // draw all
      this._backend.clear();
      for (var id in this._data) {
        this._draw(id, false);
      } // redraw cached data 
    } else {
      // draw only dirty 
      for (var key in this._dirty) {
        this._draw(key, true);
      }
    }
    this._dirty = false;
  }

  /**
   * @param {string} key What to draw
   * @param {bool} clearBefore Is it necessary to clean before?
   */;
  _proto._draw = function _draw(key, clearBefore) {
    var data = this._data[key];
    if (data[4] != this._options.bg) {
      clearBefore = true;
    }
    this._backend.draw(data, clearBefore);
  };
  return Display;
}();
Display.Rect = Rect;
Display.Hex = Hex;
Display.Tile = Tile;
Display.TileGL = TileGL;
Display.TileGLES2 = TileGLES2;
Display.Term = Term;
export { Display as default };