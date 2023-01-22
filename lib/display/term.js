function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Backend from "./backend.js";
import * as Color from "../color.js";
function clearToAnsi(bg) {
  return "\x1B[0;48;5;" + termcolor(bg) + "m\x1B[2J";
}
function colorToAnsi(fg, bg) {
  return "\x1B[0;38;5;" + termcolor(fg) + ";48;5;" + termcolor(bg) + "m";
}
function positionToAnsi(x, y) {
  return "\x1B[" + (y + 1) + ";" + (x + 1) + "H";
}
function termcolor(color) {
  var SRC_COLORS = 256.0;
  var DST_COLORS = 6.0;
  var COLOR_RATIO = DST_COLORS / SRC_COLORS;
  var rgb = Color.fromString(color);
  var r = Math.floor(rgb[0] * COLOR_RATIO);
  var g = Math.floor(rgb[1] * COLOR_RATIO);
  var b = Math.floor(rgb[2] * COLOR_RATIO);
  return r * 36 + g * 6 + b * 1 + 16;
}
var Term = /*#__PURE__*/function (_Backend) {
  _inheritsLoose(Term, _Backend);
  function Term() {
    var _this;
    _this = _Backend.call(this) || this;
    _this._offset = [0, 0];
    _this._cursor = [-1, -1];
    _this._lastColor = "";
    return _this;
  }
  var _proto = Term.prototype;
  _proto.schedule = function schedule(cb) {
    setTimeout(cb, 1000 / 60);
  };
  _proto.setOptions = function setOptions(options) {
    _Backend.prototype.setOptions.call(this, options);
    var size = [options.width, options.height];
    var avail = this.computeSize();
    this._offset = avail.map(function (val, index) {
      return Math.floor((val - size[index]) / 2);
    });
  };
  _proto.clear = function clear() {
    process.stdout.write(clearToAnsi(this._options.bg));
  };
  _proto.draw = function draw(data, clearBefore) {
    // determine where to draw what with what colors
    var x = data[0],
      y = data[1],
      ch = data[2],
      fg = data[3],
      bg = data[4];

    // determine if we need to move the terminal cursor
    var dx = this._offset[0] + x;
    var dy = this._offset[1] + y;
    var size = this.computeSize();
    if (dx < 0 || dx >= size[0]) {
      return;
    }
    if (dy < 0 || dy >= size[1]) {
      return;
    }
    if (dx !== this._cursor[0] || dy !== this._cursor[1]) {
      process.stdout.write(positionToAnsi(dx, dy));
      this._cursor[0] = dx;
      this._cursor[1] = dy;
    }

    // terminals automatically clear, but if we're clearing when we're
    // not otherwise provided with a character, just use a space instead
    if (clearBefore) {
      if (!ch) {
        ch = " ";
      }
    }

    // if we're not clearing and not provided with a character, do nothing
    if (!ch) {
      return;
    }

    // determine if we need to change colors
    var newColor = colorToAnsi(fg, bg);
    if (newColor !== this._lastColor) {
      process.stdout.write(newColor);
      this._lastColor = newColor;
    }
    if (ch != '\t') {
      // write the provided symbol to the display
      var chars = [].concat(ch);
      process.stdout.write(chars[0]);
    }

    // update our position, given that we wrote a character
    this._cursor[0]++;
    if (this._cursor[0] >= size[0]) {
      this._cursor[0] = 0;
      this._cursor[1]++;
    }
  };
  _proto.computeFontSize = function computeFontSize() {
    throw new Error("Terminal backend has no notion of font size");
  };
  _proto.eventToPosition = function eventToPosition(x, y) {
    return [x, y];
  };
  _proto.computeSize = function computeSize() {
    return [process.stdout.columns, process.stdout.rows];
  };
  return Term;
}(Backend);
export { Term as default };