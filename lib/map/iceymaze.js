function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Map from "./map.js";
import RNG from "../rng.js";

/**
 * Icey's Maze generator
 * See http://www.roguebasin.roguelikedevelopment.org/index.php?title=Simple_maze for explanation
 */
var IceyMaze = /*#__PURE__*/function (_Map) {
  _inheritsLoose(IceyMaze, _Map);
  function IceyMaze(width, height, regularity) {
    var _this;
    if (regularity === void 0) {
      regularity = 0;
    }
    _this = _Map.call(this, width, height) || this;
    _this._regularity = regularity;
    _this._map = [];
    return _this;
  }
  var _proto = IceyMaze.prototype;
  _proto.create = function create(callback) {
    var width = this._width;
    var height = this._height;
    var map = this._fillMap(1);
    width -= width % 2 ? 1 : 2;
    height -= height % 2 ? 1 : 2;
    var cx = 0;
    var cy = 0;
    var nx = 0;
    var ny = 0;
    var done = 0;
    var blocked = false;
    var dirs = [[0, 0], [0, 0], [0, 0], [0, 0]];
    do {
      cx = 1 + 2 * Math.floor(RNG.getUniform() * (width - 1) / 2);
      cy = 1 + 2 * Math.floor(RNG.getUniform() * (height - 1) / 2);
      if (!done) {
        map[cx][cy] = 0;
      }
      if (!map[cx][cy]) {
        this._randomize(dirs);
        do {
          if (Math.floor(RNG.getUniform() * (this._regularity + 1)) == 0) {
            this._randomize(dirs);
          }
          blocked = true;
          for (var i = 0; i < 4; i++) {
            nx = cx + dirs[i][0] * 2;
            ny = cy + dirs[i][1] * 2;
            if (this._isFree(map, nx, ny, width, height)) {
              map[nx][ny] = 0;
              map[cx + dirs[i][0]][cy + dirs[i][1]] = 0;
              cx = nx;
              cy = ny;
              blocked = false;
              done++;
              break;
            }
          }
        } while (!blocked);
      }
    } while (done + 1 < width * height / 4);
    for (var _i = 0; _i < this._width; _i++) {
      for (var j = 0; j < this._height; j++) {
        callback(_i, j, map[_i][j]);
      }
    }
    this._map = [];
    return this;
  };
  _proto._randomize = function _randomize(dirs) {
    for (var i = 0; i < 4; i++) {
      dirs[i][0] = 0;
      dirs[i][1] = 0;
    }
    switch (Math.floor(RNG.getUniform() * 4)) {
      case 0:
        dirs[0][0] = -1;
        dirs[1][0] = 1;
        dirs[2][1] = -1;
        dirs[3][1] = 1;
        break;
      case 1:
        dirs[3][0] = -1;
        dirs[2][0] = 1;
        dirs[1][1] = -1;
        dirs[0][1] = 1;
        break;
      case 2:
        dirs[2][0] = -1;
        dirs[3][0] = 1;
        dirs[0][1] = -1;
        dirs[1][1] = 1;
        break;
      case 3:
        dirs[1][0] = -1;
        dirs[0][0] = 1;
        dirs[3][1] = -1;
        dirs[2][1] = 1;
        break;
    }
  };
  _proto._isFree = function _isFree(map, x, y, width, height) {
    if (x < 1 || y < 1 || x >= width || y >= height) {
      return false;
    }
    return map[x][y];
  };
  return IceyMaze;
}(Map);
export { IceyMaze as default };