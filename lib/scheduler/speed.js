function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Scheduler from "./scheduler.js";
/**
 * @class Speed-based scheduler
 */
var Speed = /*#__PURE__*/function (_Scheduler) {
  _inheritsLoose(Speed, _Scheduler);
  function Speed() {
    return _Scheduler.apply(this, arguments) || this;
  }
  var _proto = Speed.prototype;
  /**
   * @param {object} item anything with "getSpeed" method
   * @param {bool} repeat
   * @param {number} [time=1/item.getSpeed()]
   * @see ROT.Scheduler#add
   */
  _proto.add = function add(item, repeat, time) {
    this._queue.add(item, time !== undefined ? time : 1 / item.getSpeed());
    return _Scheduler.prototype.add.call(this, item, repeat);
  }

  /**
   * @see ROT.Scheduler#next
   */;
  _proto.next = function next() {
    if (this._current && this._repeat.indexOf(this._current) != -1) {
      this._queue.add(this._current, 1 / this._current.getSpeed());
    }
    return _Scheduler.prototype.next.call(this);
  };
  return Speed;
}(Scheduler);
export { Speed as default };