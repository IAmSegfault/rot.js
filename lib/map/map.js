import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../constants.js";
;
var Map = /*#__PURE__*/function () {
  /**
   * @class Base map generator
   * @param {int} [width=ROT.DEFAULT_WIDTH]
   * @param {int} [height=ROT.DEFAULT_HEIGHT]
   */
  function Map(width, height) {
    if (width === void 0) {
      width = DEFAULT_WIDTH;
    }
    if (height === void 0) {
      height = DEFAULT_HEIGHT;
    }
    this._width = width;
    this._height = height;
  }
  var _proto = Map.prototype;
  _proto._fillMap = function _fillMap(value) {
    var map = [];
    for (var i = 0; i < this._width; i++) {
      map.push([]);
      for (var j = 0; j < this._height; j++) {
        map[i].push(value);
      }
    }
    return map;
  };
  return Map;
}();
export { Map as default };