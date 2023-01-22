function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Path from "./path.js";
/**
 * @class Simplified Dijkstra's algorithm: all edges have a value of 1
 * @augments ROT.Path
 * @see ROT.Path
 */
var Dijkstra = /*#__PURE__*/function (_Path) {
  _inheritsLoose(Dijkstra, _Path);
  function Dijkstra(toX, toY, passableCallback, options) {
    var _this;
    _this = _Path.call(this, toX, toY, passableCallback, options) || this;
    _this._computed = {};
    _this._todo = [];
    _this._add(toX, toY, null);
    return _this;
  }

  /**
   * Compute a path from a given point
   * @see ROT.Path#compute
   */
  var _proto = Dijkstra.prototype;
  _proto.compute = function compute(fromX, fromY, callback) {
    var key = fromX + "," + fromY;
    if (!(key in this._computed)) {
      this._compute(fromX, fromY);
    }
    if (!(key in this._computed)) {
      return;
    }
    var item = this._computed[key];
    while (item) {
      callback(item.x, item.y);
      item = item.prev;
    }
  }

  /**
   * Compute a non-cached value
   */;
  _proto._compute = function _compute(fromX, fromY) {
    while (this._todo.length) {
      var item = this._todo.shift();
      if (item.x == fromX && item.y == fromY) {
        return;
      }
      var neighbors = this._getNeighbors(item.x, item.y);
      for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];
        var x = neighbor[0];
        var y = neighbor[1];
        var id = x + "," + y;
        if (id in this._computed) {
          continue;
        } /* already done */
        this._add(x, y, item);
      }
    }
  };
  _proto._add = function _add(x, y, prev) {
    var obj = {
      x: x,
      y: y,
      prev: prev
    };
    this._computed[x + "," + y] = obj;
    this._todo.push(obj);
  };
  return Dijkstra;
}(Path);
export { Dijkstra as default };