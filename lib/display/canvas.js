function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Backend from "./backend.js";
var Canvas = /*#__PURE__*/function (_Backend) {
  _inheritsLoose(Canvas, _Backend);
  function Canvas() {
    var _this;
    _this = _Backend.call(this) || this;
    _this._ctx = document.createElement("canvas").getContext("2d");
    return _this;
  }
  var _proto = Canvas.prototype;
  _proto.schedule = function schedule(cb) {
    requestAnimationFrame(cb);
  };
  _proto.getContainer = function getContainer() {
    return this._ctx.canvas;
  };
  _proto.setOptions = function setOptions(opts) {
    _Backend.prototype.setOptions.call(this, opts);
    var style = opts.fontStyle ? opts.fontStyle + " " : "";
    var font = style + " " + opts.fontSize + "px " + opts.fontFamily;
    this._ctx.font = font;
    this._updateSize();
    this._ctx.font = font;
    this._ctx.textAlign = "center";
    this._ctx.textBaseline = "middle";
  };
  _proto.clear = function clear() {
    this._ctx.fillStyle = this._options.bg;
    this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
  };
  _proto.eventToPosition = function eventToPosition(x, y) {
    var canvas = this._ctx.canvas;
    var rect = canvas.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;
    x *= canvas.width / rect.width;
    y *= canvas.height / rect.height;
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
      return [-1, -1];
    }
    return this._normalizedEventToPosition(x, y);
  };
  return Canvas;
}(Backend);
export { Canvas as default };