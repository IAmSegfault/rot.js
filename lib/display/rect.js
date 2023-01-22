function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Canvas from "./canvas.js";
/**
 * @class Rectangular backend
 * @private
 */
var Rect = /*#__PURE__*/function (_Canvas) {
  _inheritsLoose(Rect, _Canvas);
  function Rect() {
    var _this;
    _this = _Canvas.call(this) || this;
    _this._spacingX = 0;
    _this._spacingY = 0;
    _this._canvasCache = {};
    return _this;
  }
  var _proto = Rect.prototype;
  _proto.setOptions = function setOptions(options) {
    _Canvas.prototype.setOptions.call(this, options);
    this._canvasCache = {};
  };
  _proto.draw = function draw(data, clearBefore) {
    if (Rect.cache) {
      this._drawWithCache(data);
    } else {
      this._drawNoCache(data, clearBefore);
    }
  };
  _proto._drawWithCache = function _drawWithCache(data) {
    var x = data[0],
      y = data[1],
      ch = data[2],
      fg = data[3],
      bg = data[4];
    var hash = "" + ch + fg + bg;
    var canvas;
    if (hash in this._canvasCache) {
      canvas = this._canvasCache[hash];
    } else {
      var b = this._options.border;
      canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      canvas.width = this._spacingX;
      canvas.height = this._spacingY;
      ctx.fillStyle = bg;
      ctx.fillRect(b, b, canvas.width - b, canvas.height - b);
      if (ch) {
        ctx.fillStyle = fg;
        ctx.font = this._ctx.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var chars = [].concat(ch);
        for (var i = 0; i < chars.length; i++) {
          ctx.fillText(chars[i], this._spacingX / 2, Math.ceil(this._spacingY / 2));
        }
      }
      this._canvasCache[hash] = canvas;
    }
    this._ctx.drawImage(canvas, x * this._spacingX, y * this._spacingY);
  };
  _proto._drawNoCache = function _drawNoCache(data, clearBefore) {
    var x = data[0],
      y = data[1],
      ch = data[2],
      fg = data[3],
      bg = data[4];
    if (clearBefore) {
      var b = this._options.border;
      this._ctx.fillStyle = bg;
      this._ctx.fillRect(x * this._spacingX + b, y * this._spacingY + b, this._spacingX - b, this._spacingY - b);
    }
    if (!ch) {
      return;
    }
    this._ctx.fillStyle = fg;
    var chars = [].concat(ch);
    for (var i = 0; i < chars.length; i++) {
      this._ctx.fillText(chars[i], (x + 0.5) * this._spacingX, Math.ceil((y + 0.5) * this._spacingY));
    }
  };
  _proto.computeSize = function computeSize(availWidth, availHeight) {
    var width = Math.floor(availWidth / this._spacingX);
    var height = Math.floor(availHeight / this._spacingY);
    return [width, height];
  };
  _proto.computeFontSize = function computeFontSize(availWidth, availHeight) {
    var boxWidth = Math.floor(availWidth / this._options.width);
    var boxHeight = Math.floor(availHeight / this._options.height);

    /* compute char ratio */
    var oldFont = this._ctx.font;
    this._ctx.font = "100px " + this._options.fontFamily;
    var width = Math.ceil(this._ctx.measureText("W").width);
    this._ctx.font = oldFont;
    var ratio = width / 100;
    var widthFraction = ratio * boxHeight / boxWidth;
    if (widthFraction > 1) {
      /* too wide with current aspect ratio */
      boxHeight = Math.floor(boxHeight / widthFraction);
    }
    return Math.floor(boxHeight / this._options.spacing);
  };
  _proto._normalizedEventToPosition = function _normalizedEventToPosition(x, y) {
    return [Math.floor(x / this._spacingX), Math.floor(y / this._spacingY)];
  };
  _proto._updateSize = function _updateSize() {
    var opts = this._options;
    var charWidth = Math.ceil(this._ctx.measureText("W").width);
    this._spacingX = Math.ceil(opts.spacing * charWidth);
    this._spacingY = Math.ceil(opts.spacing * opts.fontSize);
    if (opts.forceSquareRatio) {
      this._spacingX = this._spacingY = Math.max(this._spacingX, this._spacingY);
    }
    this._ctx.canvas.width = opts.width * this._spacingX;
    this._ctx.canvas.height = opts.height * this._spacingY;
  };
  return Rect;
}(Canvas);
Rect.cache = false;
export { Rect as default };