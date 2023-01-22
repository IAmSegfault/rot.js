import { DIRS } from "../constants.js";
/**
 * @class Abstract pathfinder
 * @param {int} toX Target X coord
 * @param {int} toY Target Y coord
 * @param {function} passableCallback Callback to determine map passability
 * @param {object} [options]
 * @param {int} [options.topology=8]
 */
var Path = /*#__PURE__*/function () {
  function Path(toX, toY, passableCallback, options) {
    if (options === void 0) {
      options = {};
    }
    this._toX = toX;
    this._toY = toY;
    this._passableCallback = passableCallback;
    this._options = Object.assign({
      topology: 8
    }, options);
    this._dirs = DIRS[this._options.topology];
    if (this._options.topology == 8) {
      /* reorder dirs for more aesthetic result (vertical/horizontal first) */
      this._dirs = [this._dirs[0], this._dirs[2], this._dirs[4], this._dirs[6], this._dirs[1], this._dirs[3], this._dirs[5], this._dirs[7]];
    }
  }

  /**
   * Compute a path from a given point
   * @param {int} fromX
   * @param {int} fromY
   * @param {function} callback Will be called for every path item with arguments "x" and "y"
   */
  var _proto = Path.prototype;
  _proto._getNeighbors = function _getNeighbors(cx, cy) {
    var result = [];
    for (var i = 0; i < this._dirs.length; i++) {
      var dir = this._dirs[i];
      var _x = cx + dir[0];
      var _y = cy + dir[1];
      if (!this._passableCallback(_x, _y)) {
        continue;
      }
      result.push([_x, _y]);
    }
    return result;
  };
  return Path;
}();
export { Path as default };