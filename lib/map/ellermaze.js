function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Map from "./map.js";
import RNG from "../rng.js";
/**
 * Join lists with "i" and "i+1"
 */
function addToList(i, L, R) {
  R[L[i + 1]] = R[i];
  L[R[i]] = L[i + 1];
  R[i] = i + 1;
  L[i + 1] = i;
}

/**
 * Remove "i" from its list
 */
function removeFromList(i, L, R) {
  R[L[i]] = R[i];
  L[R[i]] = L[i];
  R[i] = i;
  L[i] = i;
}

/**
 * Maze generator - Eller's algorithm
 * See http://homepages.cwi.nl/~tromp/maze.html for explanation
 */
var EllerMaze = /*#__PURE__*/function (_Map) {
  _inheritsLoose(EllerMaze, _Map);
  function EllerMaze() {
    return _Map.apply(this, arguments) || this;
  }
  var _proto = EllerMaze.prototype;
  _proto.create = function create(callback) {
    var map = this._fillMap(1);
    var w = Math.ceil((this._width - 2) / 2);
    var rand = 9 / 24;
    var L = [];
    var R = [];
    for (var i = 0; i < w; i++) {
      L.push(i);
      R.push(i);
    }
    L.push(w - 1); /* fake stop-block at the right side */

    var j;
    for (j = 1; j + 3 < this._height; j += 2) {
      /* one row */
      for (var _i = 0; _i < w; _i++) {
        /* cell coords (will be always empty) */
        var x = 2 * _i + 1;
        var y = j;
        map[x][y] = 0;

        /* right connection */
        if (_i != L[_i + 1] && RNG.getUniform() > rand) {
          addToList(_i, L, R);
          map[x + 1][y] = 0;
        }

        /* bottom connection */
        if (_i != L[_i] && RNG.getUniform() > rand) {
          /* remove connection */
          removeFromList(_i, L, R);
        } else {
          /* create connection */
          map[x][y + 1] = 0;
        }
      }
    }

    /* last row */
    for (var _i2 = 0; _i2 < w; _i2++) {
      /* cell coords (will be always empty) */
      var _x = 2 * _i2 + 1;
      var _y = j;
      map[_x][_y] = 0;

      /* right connection */
      if (_i2 != L[_i2 + 1] && (_i2 == L[_i2] || RNG.getUniform() > rand)) {
        /* dig right also if the cell is separated, so it gets connected to the rest of maze */
        addToList(_i2, L, R);
        map[_x + 1][_y] = 0;
      }
      removeFromList(_i2, L, R);
    }
    for (var _i3 = 0; _i3 < this._width; _i3++) {
      for (var _j = 0; _j < this._height; _j++) {
        callback(_i3, _j, map[_i3][_j]);
      }
    }
    return this;
  };
  return EllerMaze;
}(Map);
export { EllerMaze as default };