function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Canvas from "./canvas.js";
import { mod } from "../util.js";

/**
 * @class Hexagonal backend
 * @private
 */
var Hex = /*#__PURE__*/function (_Canvas) {
  _inheritsLoose(Hex, _Canvas);
  function Hex() {
    var _this;
    _this = _Canvas.call(this) || this;
    _this._spacingX = 0;
    _this._spacingY = 0;
    _this._hexSize = 0;
    return _this;
  }
  var _proto = Hex.prototype;
  _proto.draw = function draw(data, clearBefore) {
    var x = data[0],
      y = data[1],
      ch = data[2],
      fg = data[3],
      bg = data[4];
    var px = [(x + 1) * this._spacingX, y * this._spacingY + this._hexSize];
    if (this._options.transpose) {
      px.reverse();
    }
    if (clearBefore) {
      this._ctx.fillStyle = bg;
      this._fill(px[0], px[1]);
    }
    if (!ch) {
      return;
    }
    this._ctx.fillStyle = fg;
    var chars = [].concat(ch);
    for (var i = 0; i < chars.length; i++) {
      this._ctx.fillText(chars[i], px[0], Math.ceil(px[1]));
    }
  };
  _proto.computeSize = function computeSize(availWidth, availHeight) {
    if (this._options.transpose) {
      availWidth += availHeight;
      availHeight = availWidth - availHeight;
      availWidth -= availHeight;
    }
    var width = Math.floor(availWidth / this._spacingX) - 1;
    var height = Math.floor((availHeight - 2 * this._hexSize) / this._spacingY + 1);
    return [width, height];
  };
  _proto.computeFontSize = function computeFontSize(availWidth, availHeight) {
    if (this._options.transpose) {
      availWidth += availHeight;
      availHeight = availWidth - availHeight;
      availWidth -= availHeight;
    }
    var hexSizeWidth = 2 * availWidth / ((this._options.width + 1) * Math.sqrt(3)) - 1;
    var hexSizeHeight = availHeight / (2 + 1.5 * (this._options.height - 1));
    var hexSize = Math.min(hexSizeWidth, hexSizeHeight);

    // compute char ratio
    var oldFont = this._ctx.font;
    this._ctx.font = "100px " + this._options.fontFamily;
    var width = Math.ceil(this._ctx.measureText("W").width);
    this._ctx.font = oldFont;
    var ratio = width / 100;
    hexSize = Math.floor(hexSize) + 1; // closest larger hexSize

    // FIXME char size computation does not respect transposed hexes
    var fontSize = 2 * hexSize / (this._options.spacing * (1 + ratio / Math.sqrt(3)));

    // closest smaller fontSize
    return Math.ceil(fontSize) - 1;
  };
  _proto._normalizedEventToPosition = function _normalizedEventToPosition(x, y) {
    var nodeSize;
    if (this._options.transpose) {
      x += y;
      y = x - y;
      x -= y;
      nodeSize = this._ctx.canvas.width;
    } else {
      nodeSize = this._ctx.canvas.height;
    }
    var size = nodeSize / this._options.height;
    y = Math.floor(y / size);
    if (mod(y, 2)) {
      /* odd row */
      x -= this._spacingX;
      x = 1 + 2 * Math.floor(x / (2 * this._spacingX));
    } else {
      x = 2 * Math.floor(x / (2 * this._spacingX));
    }
    return [x, y];
  }

  /**
   * Arguments are pixel values. If "transposed" mode is enabled, then these two are already swapped.
   */;
  _proto._fill = function _fill(cx, cy) {
    var a = this._hexSize;
    var b = this._options.border;
    var ctx = this._ctx;
    ctx.beginPath();
    if (this._options.transpose) {
      ctx.moveTo(cx - a + b, cy);
      ctx.lineTo(cx - a / 2 + b, cy + this._spacingX - b);
      ctx.lineTo(cx + a / 2 - b, cy + this._spacingX - b);
      ctx.lineTo(cx + a - b, cy);
      ctx.lineTo(cx + a / 2 - b, cy - this._spacingX + b);
      ctx.lineTo(cx - a / 2 + b, cy - this._spacingX + b);
      ctx.lineTo(cx - a + b, cy);
    } else {
      ctx.moveTo(cx, cy - a + b);
      ctx.lineTo(cx + this._spacingX - b, cy - a / 2 + b);
      ctx.lineTo(cx + this._spacingX - b, cy + a / 2 - b);
      ctx.lineTo(cx, cy + a - b);
      ctx.lineTo(cx - this._spacingX + b, cy + a / 2 - b);
      ctx.lineTo(cx - this._spacingX + b, cy - a / 2 + b);
      ctx.lineTo(cx, cy - a + b);
    }
    ctx.fill();
  };
  _proto._updateSize = function _updateSize() {
    var opts = this._options;
    var charWidth = Math.ceil(this._ctx.measureText("W").width);
    this._hexSize = Math.floor(opts.spacing * (opts.fontSize + charWidth / Math.sqrt(3)) / 2);
    this._spacingX = this._hexSize * Math.sqrt(3) / 2;
    this._spacingY = this._hexSize * 1.5;
    var xprop;
    var yprop;
    if (opts.transpose) {
      xprop = "height";
      yprop = "width";
    } else {
      xprop = "width";
      yprop = "height";
    }
    this._ctx.canvas[xprop] = Math.ceil((opts.width + 1) * this._spacingX);
    this._ctx.canvas[yprop] = Math.ceil((opts.height - 1) * this._spacingY + 2 * this._hexSize);
  };
  return Hex;
}(Canvas);
export { Hex as default };