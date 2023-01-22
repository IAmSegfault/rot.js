function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Path from "./path.js";
/**
 * @class Simplified A* algorithm: all edges have a value of 1
 * @augments ROT.Path
 * @see ROT.Path
 */
var AStar = /*#__PURE__*/function (_Path) {
  _inheritsLoose(AStar, _Path);
  function AStar(toX, toY, passableCallback, options) {
    var _this;
    if (options === void 0) {
      options = {};
    }
    _this = _Path.call(this, toX, toY, passableCallback, options) || this;
    _this._todo = [];
    _this._done = {};
    return _this;
  }

  /**
   * Compute a path from a given point
   * @see ROT.Path#compute
   */
  var _proto = AStar.prototype;
  _proto.compute = function compute(fromX, fromY, callback) {
    this._todo = [];
    this._done = {};
    this._fromX = fromX;
    this._fromY = fromY;
    this._add(this._toX, this._toY, null);
    while (this._todo.length) {
      var _item = this._todo.shift();
      var id = _item.x + "," + _item.y;
      if (id in this._done) {
        continue;
      }
      this._done[id] = _item;
      if (_item.x == fromX && _item.y == fromY) {
        break;
      }
      var neighbors = this._getNeighbors(_item.x, _item.y);
      for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];
        var x = neighbor[0];
        var y = neighbor[1];
        var _id = x + "," + y;
        if (_id in this._done) {
          continue;
        }
        this._add(x, y, _item);
      }
    }
    var item = this._done[fromX + "," + fromY];
    if (!item) {
      return;
    }
    while (item) {
      callback(item.x, item.y);
      item = item.prev;
    }
  };
  _proto._add = function _add(x, y, prev) {
    var h = this._distance(x, y);
    var obj = {
      x: x,
      y: y,
      prev: prev,
      g: prev ? prev.g + 1 : 0,
      h: h
    };

    /* insert into priority queue */

    var f = obj.g + obj.h;
    for (var i = 0; i < this._todo.length; i++) {
      var item = this._todo[i];
      var itemF = item.g + item.h;
      if (f < itemF || f == itemF && h < item.h) {
        this._todo.splice(i, 0, obj);
        return;
      }
    }
    this._todo.push(obj);
  };
  _proto._distance = function _distance(x, y) {
    switch (this._options.topology) {
      case 4:
        return Math.abs(x - this._fromX) + Math.abs(y - this._fromY);
        break;
      case 6:
        var dx = Math.abs(x - this._fromX);
        var dy = Math.abs(y - this._fromY);
        return dy + Math.max(0, (dx - dy) / 2);
        break;
      case 8:
        return Math.max(Math.abs(x - this._fromX), Math.abs(y - this._fromY));
        break;
    }
  };
  return AStar;
}(Path);
export { AStar as default };