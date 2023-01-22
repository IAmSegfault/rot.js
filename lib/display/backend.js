/**
 * @class Abstract display backend module
 * @private
 */
var Backend = /*#__PURE__*/function () {
  function Backend() {}
  var _proto = Backend.prototype;
  _proto.getContainer = function getContainer() {
    return null;
  };
  _proto.setOptions = function setOptions(options) {
    this._options = options;
  };
  return Backend;
}();
export { Backend as default };