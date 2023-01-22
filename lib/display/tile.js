function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Canvas from "./canvas.js";
/**
 * @class Tile backend
 * @private
 */
var Tile = /*#__PURE__*/function (_Canvas) {
  _inheritsLoose(Tile, _Canvas);
  function Tile() {
    var _this;
    _this = _Canvas.call(this) || this;
    _this._colorCanvas = document.createElement("canvas");
    return _this;
  }
  var _proto = Tile.prototype;
  _proto.draw = function draw(data, clearBefore) {
    var x = data[0],
      y = data[1],
      ch = data[2],
      fg = data[3],
      bg = data[4];
    var tileWidth = this._options.tileWidth;
    var tileHeight = this._options.tileHeight;
    if (clearBefore) {
      if (this._options.tileColorize) {
        this._ctx.clearRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
      } else {
        this._ctx.fillStyle = bg;
        this._ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
      }
    }
    if (!ch) {
      return;
    }
    var chars = [].concat(ch);
    var fgs = [].concat(fg);
    var bgs = [].concat(bg);
    for (var i = 0; i < chars.length; i++) {
      var tile = this._options.tileMap[chars[i]];
      if (!tile) {
        throw new Error("Char \"" + chars[i] + "\" not found in tileMap");
      }
      if (this._options.tileColorize) {
        // apply colorization
        var canvas = this._colorCanvas;
        var context = canvas.getContext("2d");
        context.globalCompositeOperation = "source-over";
        context.clearRect(0, 0, tileWidth, tileHeight);
        var _fg = fgs[i];
        var _bg = bgs[i];
        context.drawImage(this._options.tileSet, tile[0], tile[1], tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);
        if (_fg != "transparent") {
          context.fillStyle = _fg;
          context.globalCompositeOperation = "source-atop";
          context.fillRect(0, 0, tileWidth, tileHeight);
        }
        if (_bg != "transparent") {
          context.fillStyle = _bg;
          context.globalCompositeOperation = "destination-over";
          context.fillRect(0, 0, tileWidth, tileHeight);
        }
        this._ctx.drawImage(canvas, x * tileWidth, y * tileHeight, tileWidth, tileHeight);
      } else {
        // no colorizing, easy
        this._ctx.drawImage(this._options.tileSet, tile[0], tile[1], tileWidth, tileHeight, x * tileWidth, y * tileHeight, tileWidth, tileHeight);
      }
    }
  };
  _proto.computeSize = function computeSize(availWidth, availHeight) {
    var width = Math.floor(availWidth / this._options.tileWidth);
    var height = Math.floor(availHeight / this._options.tileHeight);
    return [width, height];
  };
  _proto.computeFontSize = function computeFontSize() {
    throw new Error("Tile backend does not understand font size");
  };
  _proto._normalizedEventToPosition = function _normalizedEventToPosition(x, y) {
    return [Math.floor(x / this._options.tileWidth), Math.floor(y / this._options.tileHeight)];
  };
  _proto._updateSize = function _updateSize() {
    var opts = this._options;
    this._ctx.canvas.width = opts.width * opts.tileWidth;
    this._ctx.canvas.height = opts.height * opts.tileHeight;
    this._colorCanvas.width = opts.tileWidth;
    this._colorCanvas.height = opts.tileHeight;
  };
  return Tile;
}(Canvas);
export { Tile as default };