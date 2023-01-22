import { MinHeap } from "./MinHeap.js";
var EventQueue = /*#__PURE__*/function () {
  /**
   * @class Generic event queue: stores events and retrieves them based on their time
   */
  function EventQueue() {
    this._time = 0;
    this._events = new MinHeap();
  }

  /**
   * @returns {number} Elapsed time
   */
  var _proto = EventQueue.prototype;
  _proto.getTime = function getTime() {
    return this._time;
  }

  /**
   * Clear all scheduled events
   */;
  _proto.clear = function clear() {
    this._events = new MinHeap();
    return this;
  }

  /**
   * @param {?} event
   * @param {number} time
   */;
  _proto.add = function add(event, time) {
    this._events.push(event, time);
  }

  /**
   * Locates the nearest event, advances time if necessary. Returns that event and removes it from the queue.
   * @returns {? || null} The event previously added by addEvent, null if no event available
   */;
  _proto.get = function get() {
    if (!this._events.len()) {
      return null;
    }
    var _this$_events$pop = this._events.pop(),
      time = _this$_events$pop.key,
      event = _this$_events$pop.value;
    if (time > 0) {
      /* advance */
      this._time += time;
      this._events.shift(-time);
    }
    return event;
  }

  /**
   * Get the time associated with the given event
   * @param {?} event
   * @returns {number} time
   */;
  _proto.getEventTime = function getEventTime(event) {
    var r = this._events.find(event);
    if (r) {
      var key = r.key;
      return key;
    }
    return undefined;
  }

  /**
   * Remove an event from the queue
   * @param {?} event
   * @returns {bool} success?
   */;
  _proto.remove = function remove(event) {
    return this._events.remove(event);
  };
  return EventQueue;
}();
export { EventQueue as default };