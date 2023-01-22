function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Map from "./map.js";

/**
 * @class Simple empty rectangular room
 * @augments ROT.Map
 */
var Arena = /*#__PURE__*/function (_Map) {
  _inheritsLoose(Arena, _Map);
  function Arena() {
    return _Map.apply(this, arguments) || this;
  }
  var _proto = Arena.prototype;
  _proto.create = function create(callback) {
    var w = this._width - 1;
    var h = this._height - 1;
    for (var i = 0; i <= w; i++) {
      for (var j = 0; j <= h; j++) {
        var empty = i && j && i < w && j < h;
        callback(i, j, empty ? 0 : 1);
      }
    }
    return this;
  };
  return Arena;
}(Map);
export { Arena as default };