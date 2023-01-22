function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Map from "./map.js";
import RNG from "../rng.js";
/**
 * @class Recursively divided maze, http://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method
 * @augments ROT.Map
 */
var DividedMaze = /*#__PURE__*/function (_Map) {
  _inheritsLoose(DividedMaze, _Map);
  function DividedMaze() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Map.call.apply(_Map, [this].concat(args)) || this;
    _this._stack = [];
    _this._map = [];
    return _this;
  }
  var _proto = DividedMaze.prototype;
  _proto.create = function create(callback) {
    var w = this._width;
    var h = this._height;
    this._map = [];
    for (var i = 0; i < w; i++) {
      this._map.push([]);
      for (var j = 0; j < h; j++) {
        var border = i == 0 || j == 0 || i + 1 == w || j + 1 == h;
        this._map[i].push(border ? 1 : 0);
      }
    }
    this._stack = [[1, 1, w - 2, h - 2]];
    this._process();
    for (var _i = 0; _i < w; _i++) {
      for (var _j = 0; _j < h; _j++) {
        callback(_i, _j, this._map[_i][_j]);
      }
    }
    this._map = [];
    return this;
  };
  _proto._process = function _process() {
    while (this._stack.length) {
      var room = this._stack.shift(); /* [left, top, right, bottom] */
      this._partitionRoom(room);
    }
  };
  _proto._partitionRoom = function _partitionRoom(room) {
    var availX = [];
    var availY = [];
    for (var i = room[0] + 1; i < room[2]; i++) {
      var top = this._map[i][room[1] - 1];
      var bottom = this._map[i][room[3] + 1];
      if (top && bottom && !(i % 2)) {
        availX.push(i);
      }
    }
    for (var j = room[1] + 1; j < room[3]; j++) {
      var left = this._map[room[0] - 1][j];
      var right = this._map[room[2] + 1][j];
      if (left && right && !(j % 2)) {
        availY.push(j);
      }
    }
    if (!availX.length || !availY.length) {
      return;
    }
    var x = RNG.getItem(availX);
    var y = RNG.getItem(availY);
    this._map[x][y] = 1;
    var walls = [];
    var w = [];
    walls.push(w); /* left part */
    for (var _i2 = room[0]; _i2 < x; _i2++) {
      this._map[_i2][y] = 1;
      if (_i2 % 2) w.push([_i2, y]);
    }
    w = [];
    walls.push(w); /* right part */
    for (var _i3 = x + 1; _i3 <= room[2]; _i3++) {
      this._map[_i3][y] = 1;
      if (_i3 % 2) w.push([_i3, y]);
    }
    w = [];
    walls.push(w); /* top part */
    for (var _j2 = room[1]; _j2 < y; _j2++) {
      this._map[x][_j2] = 1;
      if (_j2 % 2) w.push([x, _j2]);
    }
    w = [];
    walls.push(w); /* bottom part */
    for (var _j3 = y + 1; _j3 <= room[3]; _j3++) {
      this._map[x][_j3] = 1;
      if (_j3 % 2) w.push([x, _j3]);
    }
    var solid = RNG.getItem(walls);
    for (var _i4 = 0; _i4 < walls.length; _i4++) {
      var _w = walls[_i4];
      if (_w == solid) {
        continue;
      }
      var hole = RNG.getItem(_w);
      this._map[hole[0]][hole[1]] = 0;
    }
    this._stack.push([room[0], room[1], x - 1, y - 1]); /* left top */
    this._stack.push([x + 1, room[1], room[2], y - 1]); /* right top */
    this._stack.push([room[0], y + 1, x - 1, room[3]]); /* left bottom */
    this._stack.push([x + 1, y + 1, room[2], room[3]]); /* right bottom */
  };
  return DividedMaze;
}(Map);
export { DividedMaze as default };