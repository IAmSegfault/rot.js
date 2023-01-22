function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Map from "./map.js";
/**
 * @class Dungeon map: has rooms and corridors
 * @augments ROT.Map
 */
var Dungeon = /*#__PURE__*/function (_Map) {
  _inheritsLoose(Dungeon, _Map);
  function Dungeon(width, height) {
    var _this;
    _this = _Map.call(this, width, height) || this;
    _this._rooms = [];
    _this._corridors = [];
    return _this;
  }

  /**
   * Get all generated rooms
   * @returns {ROT.Map.Feature.Room[]}
   */
  var _proto = Dungeon.prototype;
  _proto.getRooms = function getRooms() {
    return this._rooms;
  }

  /**
   * Get all generated corridors
   * @returns {ROT.Map.Feature.Corridor[]}
   */;
  _proto.getCorridors = function getCorridors() {
    return this._corridors;
  };
  return Dungeon;
}(Map);
export { Dungeon as default };