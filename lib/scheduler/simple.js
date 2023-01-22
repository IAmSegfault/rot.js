function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Scheduler from "./scheduler.js";

/**
 * @class Simple fair scheduler (round-robin style)
 */
var Simple = /*#__PURE__*/function (_Scheduler) {
  _inheritsLoose(Simple, _Scheduler);
  function Simple() {
    return _Scheduler.apply(this, arguments) || this;
  }
  var _proto = Simple.prototype;
  _proto.add = function add(item, repeat) {
    this._queue.add(item, 0);
    return _Scheduler.prototype.add.call(this, item, repeat);
  };
  _proto.next = function next() {
    if (this._current !== null && this._repeat.indexOf(this._current) != -1) {
      this._queue.add(this._current, 0);
    }
    return _Scheduler.prototype.next.call(this);
  };
  return Simple;
}(Scheduler);
export { Simple as default };