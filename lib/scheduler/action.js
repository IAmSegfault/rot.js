function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Scheduler from "./scheduler.js";

/**
 * @class Action-based scheduler
 * @augments ROT.Scheduler
 */
var Action = /*#__PURE__*/function (_Scheduler) {
  _inheritsLoose(Action, _Scheduler);
  function Action() {
    var _this;
    _this = _Scheduler.call(this) || this;
    _this._defaultDuration = 1; /* for newly added */
    _this._duration = _this._defaultDuration; /* for this._current */
    return _this;
  }

  /**
   * @param {object} item
   * @param {bool} repeat
   * @param {number} [time=1]
   * @see ROT.Scheduler#add
   */
  var _proto = Action.prototype;
  _proto.add = function add(item, repeat, time) {
    this._queue.add(item, time || this._defaultDuration);
    return _Scheduler.prototype.add.call(this, item, repeat);
  };
  _proto.clear = function clear() {
    this._duration = this._defaultDuration;
    return _Scheduler.prototype.clear.call(this);
  };
  _proto.remove = function remove(item) {
    if (item == this._current) {
      this._duration = this._defaultDuration;
    }
    return _Scheduler.prototype.remove.call(this, item);
  }

  /**
   * @see ROT.Scheduler#next
   */;
  _proto.next = function next() {
    if (this._current !== null && this._repeat.indexOf(this._current) != -1) {
      this._queue.add(this._current, this._duration || this._defaultDuration);
      this._duration = this._defaultDuration;
    }
    return _Scheduler.prototype.next.call(this);
  }

  /**
   * Set duration for the active item
   */;
  _proto.setDuration = function setDuration(time) {
    if (this._current) {
      this._duration = time;
    }
    return this;
  };
  return Action;
}(Scheduler);
export { Action as default };