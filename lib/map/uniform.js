function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Dungeon from "./dungeon.js";
import { Room, Corridor } from "./features.js";
import RNG from "../rng.js";
;
/**
 * @class Dungeon generator which tries to fill the space evenly. Generates independent rooms and tries to connect them.
 * @augments ROT.Map.Dungeon
 */
var Uniform = /*#__PURE__*/function (_Dungeon) {
  _inheritsLoose(Uniform, _Dungeon);
  function Uniform(width, height, options) {
    var _this;
    _this = _Dungeon.call(this, width, height) || this;
    _this._options = {
      roomWidth: [3, 9],
      /* room minimum and maximum width */
      roomHeight: [3, 5],
      /* room minimum and maximum height */
      roomDugPercentage: 0.1,
      /* we stop after this percentage of level area has been dug out by rooms */
      timeLimit: 1000 /* we stop after this much time has passed (msec) */
    };

    Object.assign(_this._options, options);
    _this._map = [];
    _this._dug = 0;
    _this._roomAttempts = 20; /* new room is created N-times until is considered as impossible to generate */
    _this._corridorAttempts = 20; /* corridors are tried N-times until the level is considered as impossible to connect */

    _this._connected = []; /* list of already connected rooms */
    _this._unconnected = []; /* list of remaining unconnected rooms */

    _this._digCallback = _this._digCallback.bind(_assertThisInitialized(_this));
    _this._canBeDugCallback = _this._canBeDugCallback.bind(_assertThisInitialized(_this));
    _this._isWallCallback = _this._isWallCallback.bind(_assertThisInitialized(_this));
    return _this;
  }

  /**
   * Create a map. If the time limit has been hit, returns null.
   * @see ROT.Map#create
   */
  var _proto = Uniform.prototype;
  _proto.create = function create(callback) {
    var t1 = Date.now();
    while (1) {
      var t2 = Date.now();
      if (t2 - t1 > this._options.timeLimit) {
        return null;
      } /* time limit! */

      this._map = this._fillMap(1);
      this._dug = 0;
      this._rooms = [];
      this._unconnected = [];
      this._generateRooms();
      if (this._rooms.length < 2) {
        continue;
      }
      if (this._generateCorridors()) {
        break;
      }
    }
    if (callback) {
      for (var i = 0; i < this._width; i++) {
        for (var j = 0; j < this._height; j++) {
          callback(i, j, this._map[i][j]);
        }
      }
    }
    return this;
  }

  /**
   * Generates a suitable amount of rooms
   */;
  _proto._generateRooms = function _generateRooms() {
    var w = this._width - 2;
    var h = this._height - 2;
    var room;
    do {
      room = this._generateRoom();
      if (this._dug / (w * h) > this._options.roomDugPercentage) {
        break;
      } /* achieved requested amount of free space */
    } while (room);

    /* either enough rooms, or not able to generate more of them :) */
  }

  /**
   * Try to generate one room
   */;
  _proto._generateRoom = function _generateRoom() {
    var count = 0;
    while (count < this._roomAttempts) {
      count++;
      var room = Room.createRandom(this._width, this._height, this._options);
      if (!room.isValid(this._isWallCallback, this._canBeDugCallback)) {
        continue;
      }
      room.create(this._digCallback);
      this._rooms.push(room);
      return room;
    }

    /* no room was generated in a given number of attempts */
    return null;
  }

  /**
   * Generates connectors beween rooms
   * @returns {bool} success Was this attempt successfull?
   */;
  _proto._generateCorridors = function _generateCorridors() {
    var cnt = 0;
    while (cnt < this._corridorAttempts) {
      cnt++;
      this._corridors = [];

      /* dig rooms into a clear map */
      this._map = this._fillMap(1);
      for (var i = 0; i < this._rooms.length; i++) {
        var room = this._rooms[i];
        room.clearDoors();
        room.create(this._digCallback);
      }
      this._unconnected = RNG.shuffle(this._rooms.slice());
      this._connected = [];
      if (this._unconnected.length) {
        this._connected.push(this._unconnected.pop());
      } /* first one is always connected */

      while (1) {
        /* 1. pick random connected room */
        var connected = RNG.getItem(this._connected);
        if (!connected) {
          break;
        }

        /* 2. find closest unconnected */
        var room1 = this._closestRoom(this._unconnected, connected);
        if (!room1) {
          break;
        }

        /* 3. connect it to closest connected */
        var room2 = this._closestRoom(this._connected, room1);
        if (!room2) {
          break;
        }
        var ok = this._connectRooms(room1, room2);
        if (!ok) {
          break;
        } /* stop connecting, re-shuffle */

        if (!this._unconnected.length) {
          return true;
        } /* done; no rooms remain */
      }
    }

    return false;
  };
  /**
   * For a given room, find the closest one from the list
   */
  _proto._closestRoom = function _closestRoom(rooms, room) {
    var dist = Infinity;
    var center = room.getCenter();
    var result = null;
    for (var i = 0; i < rooms.length; i++) {
      var r = rooms[i];
      var c = r.getCenter();
      var dx = c[0] - center[0];
      var dy = c[1] - center[1];
      var d = dx * dx + dy * dy;
      if (d < dist) {
        dist = d;
        result = r;
      }
    }
    return result;
  };
  _proto._connectRooms = function _connectRooms(room1, room2) {
    /*
    	room1.debug();
    	room2.debug();
    */
    var center1 = room1.getCenter();
    var center2 = room2.getCenter();
    var diffX = center2[0] - center1[0];
    var diffY = center2[1] - center1[1];
    var start;
    var end;
    var dirIndex1, dirIndex2, min, max, index;
    if (Math.abs(diffX) < Math.abs(diffY)) {
      /* first try connecting north-south walls */
      dirIndex1 = diffY > 0 ? 2 : 0;
      dirIndex2 = (dirIndex1 + 2) % 4;
      min = room2.getLeft();
      max = room2.getRight();
      index = 0;
    } else {
      /* first try connecting east-west walls */
      dirIndex1 = diffX > 0 ? 1 : 3;
      dirIndex2 = (dirIndex1 + 2) % 4;
      min = room2.getTop();
      max = room2.getBottom();
      index = 1;
    }
    start = this._placeInWall(room1, dirIndex1); /* corridor will start here */
    if (!start) {
      return false;
    }
    if (start[index] >= min && start[index] <= max) {
      /* possible to connect with straight line (I-like) */
      end = start.slice();
      var value = 0;
      switch (dirIndex2) {
        case 0:
          value = room2.getTop() - 1;
          break;
        case 1:
          value = room2.getRight() + 1;
          break;
        case 2:
          value = room2.getBottom() + 1;
          break;
        case 3:
          value = room2.getLeft() - 1;
          break;
      }
      end[(index + 1) % 2] = value;
      this._digLine([start, end]);
    } else if (start[index] < min - 1 || start[index] > max + 1) {
      /* need to switch target wall (L-like) */

      var diff = start[index] - center2[index];
      var rotation = 0;
      switch (dirIndex2) {
        case 0:
        case 1:
          rotation = diff < 0 ? 3 : 1;
          break;
        case 2:
        case 3:
          rotation = diff < 0 ? 1 : 3;
          break;
      }
      dirIndex2 = (dirIndex2 + rotation) % 4;
      end = this._placeInWall(room2, dirIndex2);
      if (!end) {
        return false;
      }
      var mid = [0, 0];
      mid[index] = start[index];
      var index2 = (index + 1) % 2;
      mid[index2] = end[index2];
      this._digLine([start, mid, end]);
    } else {
      /* use current wall pair, but adjust the line in the middle (S-like) */

      var _index = (index + 1) % 2;
      end = this._placeInWall(room2, dirIndex2);
      if (!end) {
        return false;
      }
      var _mid = Math.round((end[_index] + start[_index]) / 2);
      var mid1 = [0, 0];
      var mid2 = [0, 0];
      mid1[index] = start[index];
      mid1[_index] = _mid;
      mid2[index] = end[index];
      mid2[_index] = _mid;
      this._digLine([start, mid1, mid2, end]);
    }
    room1.addDoor(start[0], start[1]);
    room2.addDoor(end[0], end[1]);
    index = this._unconnected.indexOf(room1);
    if (index != -1) {
      this._unconnected.splice(index, 1);
      this._connected.push(room1);
    }
    index = this._unconnected.indexOf(room2);
    if (index != -1) {
      this._unconnected.splice(index, 1);
      this._connected.push(room2);
    }
    return true;
  };
  _proto._placeInWall = function _placeInWall(room, dirIndex) {
    var start = [0, 0];
    var dir = [0, 0];
    var length = 0;
    switch (dirIndex) {
      case 0:
        dir = [1, 0];
        start = [room.getLeft(), room.getTop() - 1];
        length = room.getRight() - room.getLeft() + 1;
        break;
      case 1:
        dir = [0, 1];
        start = [room.getRight() + 1, room.getTop()];
        length = room.getBottom() - room.getTop() + 1;
        break;
      case 2:
        dir = [1, 0];
        start = [room.getLeft(), room.getBottom() + 1];
        length = room.getRight() - room.getLeft() + 1;
        break;
      case 3:
        dir = [0, 1];
        start = [room.getLeft() - 1, room.getTop()];
        length = room.getBottom() - room.getTop() + 1;
        break;
    }
    var avail = [];
    var lastBadIndex = -2;
    for (var i = 0; i < length; i++) {
      var x = start[0] + i * dir[0];
      var y = start[1] + i * dir[1];
      avail.push(null);
      var isWall = this._map[x][y] == 1;
      if (isWall) {
        if (lastBadIndex != i - 1) {
          avail[i] = [x, y];
        }
      } else {
        lastBadIndex = i;
        if (i) {
          avail[i - 1] = null;
        }
      }
    }
    for (var _i = avail.length - 1; _i >= 0; _i--) {
      if (!avail[_i]) {
        avail.splice(_i, 1);
      }
    }
    return avail.length ? RNG.getItem(avail) : null;
  }

  /**
   * Dig a polyline.
   */;
  _proto._digLine = function _digLine(points) {
    for (var i = 1; i < points.length; i++) {
      var start = points[i - 1];
      var end = points[i];
      var corridor = new Corridor(start[0], start[1], end[0], end[1]);
      corridor.create(this._digCallback);
      this._corridors.push(corridor);
    }
  };
  _proto._digCallback = function _digCallback(x, y, value) {
    this._map[x][y] = value;
    if (value == 0) {
      this._dug++;
    }
  };
  _proto._isWallCallback = function _isWallCallback(x, y) {
    if (x < 0 || y < 0 || x >= this._width || y >= this._height) {
      return false;
    }
    return this._map[x][y] == 1;
  };
  _proto._canBeDugCallback = function _canBeDugCallback(x, y) {
    if (x < 1 || y < 1 || x + 1 >= this._width || y + 1 >= this._height) {
      return false;
    }
    return this._map[x][y] == 1;
  };
  return Uniform;
}(Dungeon);
export { Uniform as default };