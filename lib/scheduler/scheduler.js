import EventQueue from "../eventqueue.js";
var Scheduler = /*#__PURE__*/function () {
  /**
   * @class Abstract scheduler
   */
  function Scheduler() {
    this._queue = new EventQueue();
    this._repeat = [];
    this._current = null;
  }

  /**
   * @see ROT.EventQueue#getTime
   */
  var _proto = Scheduler.prototype;
  _proto.getTime = function getTime() {
    return this._queue.getTime();
  }

  /**
   * @param {?} item
   * @param {bool} repeat
   */;
  _proto.add = function add(item, repeat) {
    if (repeat) {
      this._repeat.push(item);
    }
    return this;
  }

  /**
   * Get the time the given item is scheduled for
   * @param {?} item
   * @returns {number} time
   */;
  _proto.getTimeOf = function getTimeOf(item) {
    return this._queue.getEventTime(item);
  }

  /**
   * Clear all items
   */;
  _proto.clear = function clear() {
    this._queue.clear();
    this._repeat = [];
    this._current = null;
    return this;
  }

  /**
   * Remove a previously added item
   * @param {?} item
   * @returns {bool} successful?
   */;
  _proto.remove = function remove(item) {
    var result = this._queue.remove(item);
    var index = this._repeat.indexOf(item);
    if (index != -1) {
      this._repeat.splice(index, 1);
    }
    if (this._current == item) {
      this._current = null;
    }
    return result;
  }

  /**
   * Schedule next item
   * @returns {?}
   */;
  _proto.next = function next() {
    this._current = this._queue.get();
    return this._current;
  };
  return Scheduler;
}();
export { Scheduler as default };