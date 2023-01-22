function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import RNG from "../rng.js";
;
/**
 * @class Dungeon feature; has own .create() method
 */
var Feature = function Feature() {};
/**
 * @class Room
 * @augments ROT.Map.Feature
 * @param {int} x1
 * @param {int} y1
 * @param {int} x2
 * @param {int} y2
 * @param {int} [doorX]
 * @param {int} [doorY]
 */
export var Room = /*#__PURE__*/function (_Feature) {
  _inheritsLoose(Room, _Feature);
  function Room(x1, y1, x2, y2, doorX, doorY) {
    var _this;
    _this = _Feature.call(this) || this;
    _this._x1 = x1;
    _this._y1 = y1;
    _this._x2 = x2;
    _this._y2 = y2;
    _this._doors = {};
    if (doorX !== undefined && doorY !== undefined) {
      _this.addDoor(doorX, doorY);
    }
    return _this;
  }
  /**
   * Room of random size, with a given doors and direction
   */
  Room.createRandomAt = function createRandomAt(x, y, dx, dy, options) {
    var min = options.roomWidth[0];
    var max = options.roomWidth[1];
    var width = RNG.getUniformInt(min, max);
    min = options.roomHeight[0];
    max = options.roomHeight[1];
    var height = RNG.getUniformInt(min, max);
    if (dx == 1) {
      /* to the right */
      var y2 = y - Math.floor(RNG.getUniform() * height);
      return new this(x + 1, y2, x + width, y2 + height - 1, x, y);
    }
    if (dx == -1) {
      /* to the left */
      var _y = y - Math.floor(RNG.getUniform() * height);
      return new this(x - width, _y, x - 1, _y + height - 1, x, y);
    }
    if (dy == 1) {
      /* to the bottom */
      var x2 = x - Math.floor(RNG.getUniform() * width);
      return new this(x2, y + 1, x2 + width - 1, y + height, x, y);
    }
    if (dy == -1) {
      /* to the top */
      var _x = x - Math.floor(RNG.getUniform() * width);
      return new this(_x, y - height, _x + width - 1, y - 1, x, y);
    }
    throw new Error("dx or dy must be 1 or -1");
  }

  /**
   * Room of random size, positioned around center coords
   */;
  Room.createRandomCenter = function createRandomCenter(cx, cy, options) {
    var min = options.roomWidth[0];
    var max = options.roomWidth[1];
    var width = RNG.getUniformInt(min, max);
    min = options.roomHeight[0];
    max = options.roomHeight[1];
    var height = RNG.getUniformInt(min, max);
    var x1 = cx - Math.floor(RNG.getUniform() * width);
    var y1 = cy - Math.floor(RNG.getUniform() * height);
    var x2 = x1 + width - 1;
    var y2 = y1 + height - 1;
    return new this(x1, y1, x2, y2);
  }

  /**
   * Room of random size within a given dimensions
   */;
  Room.createRandom = function createRandom(availWidth, availHeight, options) {
    var min = options.roomWidth[0];
    var max = options.roomWidth[1];
    var width = RNG.getUniformInt(min, max);
    min = options.roomHeight[0];
    max = options.roomHeight[1];
    var height = RNG.getUniformInt(min, max);
    var left = availWidth - width - 1;
    var top = availHeight - height - 1;
    var x1 = 1 + Math.floor(RNG.getUniform() * left);
    var y1 = 1 + Math.floor(RNG.getUniform() * top);
    var x2 = x1 + width - 1;
    var y2 = y1 + height - 1;
    return new this(x1, y1, x2, y2);
  };
  var _proto = Room.prototype;
  _proto.addDoor = function addDoor(x, y) {
    this._doors[x + "," + y] = 1;
    return this;
  }

  /**
   * @param {function}
   */;
  _proto.getDoors = function getDoors(cb) {
    for (var _key in this._doors) {
      var parts = _key.split(",");
      cb(parseInt(parts[0]), parseInt(parts[1]));
    }
    return this;
  };
  _proto.clearDoors = function clearDoors() {
    this._doors = {};
    return this;
  };
  _proto.addDoors = function addDoors(isWallCallback) {
    var left = this._x1 - 1;
    var right = this._x2 + 1;
    var top = this._y1 - 1;
    var bottom = this._y2 + 1;
    for (var _x2 = left; _x2 <= right; _x2++) {
      for (var _y2 = top; _y2 <= bottom; _y2++) {
        if (_x2 != left && _x2 != right && _y2 != top && _y2 != bottom) {
          continue;
        }
        if (isWallCallback(_x2, _y2)) {
          continue;
        }
        this.addDoor(_x2, _y2);
      }
    }
    return this;
  };
  _proto.debug = function debug() {
    console.log("room", this._x1, this._y1, this._x2, this._y2);
  };
  _proto.isValid = function isValid(isWallCallback, canBeDugCallback) {
    var left = this._x1 - 1;
    var right = this._x2 + 1;
    var top = this._y1 - 1;
    var bottom = this._y2 + 1;
    for (var _x3 = left; _x3 <= right; _x3++) {
      for (var _y3 = top; _y3 <= bottom; _y3++) {
        if (_x3 == left || _x3 == right || _y3 == top || _y3 == bottom) {
          if (!isWallCallback(_x3, _y3)) {
            return false;
          }
        } else {
          if (!canBeDugCallback(_x3, _y3)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty, 1 = wall, 2 = door. Multiple doors are allowed.
   */;
  _proto.create = function create(digCallback) {
    var left = this._x1 - 1;
    var right = this._x2 + 1;
    var top = this._y1 - 1;
    var bottom = this._y2 + 1;
    var value = 0;
    for (var _x4 = left; _x4 <= right; _x4++) {
      for (var _y4 = top; _y4 <= bottom; _y4++) {
        if (_x4 + "," + _y4 in this._doors) {
          value = 2;
        } else if (_x4 == left || _x4 == right || _y4 == top || _y4 == bottom) {
          value = 1;
        } else {
          value = 0;
        }
        digCallback(_x4, _y4, value);
      }
    }
  };
  _proto.getCenter = function getCenter() {
    return [Math.round((this._x1 + this._x2) / 2), Math.round((this._y1 + this._y2) / 2)];
  };
  _proto.getLeft = function getLeft() {
    return this._x1;
  };
  _proto.getRight = function getRight() {
    return this._x2;
  };
  _proto.getTop = function getTop() {
    return this._y1;
  };
  _proto.getBottom = function getBottom() {
    return this._y2;
  };
  return Room;
}(Feature);

/**
 * @class Corridor
 * @augments ROT.Map.Feature
 * @param {int} startX
 * @param {int} startY
 * @param {int} endX
 * @param {int} endY
 */
export var Corridor = /*#__PURE__*/function (_Feature2) {
  _inheritsLoose(Corridor, _Feature2);
  function Corridor(startX, startY, endX, endY) {
    var _this2;
    _this2 = _Feature2.call(this) || this;
    _this2._startX = startX;
    _this2._startY = startY;
    _this2._endX = endX;
    _this2._endY = endY;
    _this2._endsWithAWall = true;
    return _this2;
  }
  Corridor.createRandomAt = function createRandomAt(x, y, dx, dy, options) {
    var min = options.corridorLength[0];
    var max = options.corridorLength[1];
    var length = RNG.getUniformInt(min, max);
    return new this(x, y, x + dx * length, y + dy * length);
  };
  var _proto2 = Corridor.prototype;
  _proto2.debug = function debug() {
    console.log("corridor", this._startX, this._startY, this._endX, this._endY);
  };
  _proto2.isValid = function isValid(isWallCallback, canBeDugCallback) {
    var sx = this._startX;
    var sy = this._startY;
    var dx = this._endX - sx;
    var dy = this._endY - sy;
    var length = 1 + Math.max(Math.abs(dx), Math.abs(dy));
    if (dx) {
      dx = dx / Math.abs(dx);
    }
    if (dy) {
      dy = dy / Math.abs(dy);
    }
    var nx = dy;
    var ny = -dx;
    var ok = true;
    for (var i = 0; i < length; i++) {
      var _x5 = sx + i * dx;
      var _y5 = sy + i * dy;
      if (!canBeDugCallback(_x5, _y5)) {
        ok = false;
      }
      if (!isWallCallback(_x5 + nx, _y5 + ny)) {
        ok = false;
      }
      if (!isWallCallback(_x5 - nx, _y5 - ny)) {
        ok = false;
      }
      if (!ok) {
        length = i;
        this._endX = _x5 - dx;
        this._endY = _y5 - dy;
        break;
      }
    }

    /**
     * If the length degenerated, this corridor might be invalid
     */

    /* not supported */
    if (length == 0) {
      return false;
    }

    /* length 1 allowed only if the next space is empty */
    if (length == 1 && isWallCallback(this._endX + dx, this._endY + dy)) {
      return false;
    }

    /**
     * We do not want the corridor to crash into a corner of a room;
     * if any of the ending corners is empty, the N+1th cell of this corridor must be empty too.
     * 
     * Situation:
     * #######1
     * .......?
     * #######2
     * 
     * The corridor was dug from left to right.
     * 1, 2 - problematic corners, ? = N+1th cell (not dug)
     */
    var firstCornerBad = !isWallCallback(this._endX + dx + nx, this._endY + dy + ny);
    var secondCornerBad = !isWallCallback(this._endX + dx - nx, this._endY + dy - ny);
    this._endsWithAWall = isWallCallback(this._endX + dx, this._endY + dy);
    if ((firstCornerBad || secondCornerBad) && this._endsWithAWall) {
      return false;
    }
    return true;
  }

  /**
   * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty.
   */;
  _proto2.create = function create(digCallback) {
    var sx = this._startX;
    var sy = this._startY;
    var dx = this._endX - sx;
    var dy = this._endY - sy;
    var length = 1 + Math.max(Math.abs(dx), Math.abs(dy));
    if (dx) {
      dx = dx / Math.abs(dx);
    }
    if (dy) {
      dy = dy / Math.abs(dy);
    }
    for (var i = 0; i < length; i++) {
      var _x6 = sx + i * dx;
      var _y6 = sy + i * dy;
      digCallback(_x6, _y6, 0);
    }
    return true;
  };
  _proto2.createPriorityWalls = function createPriorityWalls(priorityWallCallback) {
    if (!this._endsWithAWall) {
      return;
    }
    var sx = this._startX;
    var sy = this._startY;
    var dx = this._endX - sx;
    var dy = this._endY - sy;
    if (dx) {
      dx = dx / Math.abs(dx);
    }
    if (dy) {
      dy = dy / Math.abs(dy);
    }
    var nx = dy;
    var ny = -dx;
    priorityWallCallback(this._endX + dx, this._endY + dy);
    priorityWallCallback(this._endX + nx, this._endY + ny);
    priorityWallCallback(this._endX - nx, this._endY - ny);
  };
  return Corridor;
}(Feature);