function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
export var MinHeap = /*#__PURE__*/function () {
  function MinHeap() {
    this.heap = [];
    this.timestamp = 0;
  }
  var _proto = MinHeap.prototype;
  _proto.lessThan = function lessThan(a, b) {
    return a.key == b.key ? a.timestamp < b.timestamp : a.key < b.key;
  };
  _proto.shift = function shift(v) {
    this.heap = this.heap.map(function (_ref) {
      var key = _ref.key,
        value = _ref.value,
        timestamp = _ref.timestamp;
      return {
        key: key + v,
        value: value,
        timestamp: timestamp
      };
    });
  };
  _proto.len = function len() {
    return this.heap.length;
  };
  _proto.push = function push(value, key) {
    this.timestamp += 1;
    var loc = this.len();
    this.heap.push({
      value: value,
      timestamp: this.timestamp,
      key: key
    });
    this.updateUp(loc);
  };
  _proto.pop = function pop() {
    if (this.len() == 0) {
      throw new Error("no element to pop");
    }
    var top = this.heap[0];
    if (this.len() > 1) {
      this.heap[0] = this.heap.pop();
      this.updateDown(0);
    } else {
      this.heap.pop();
    }
    return top;
  };
  _proto.find = function find(v) {
    for (var i = 0; i < this.len(); i++) {
      if (v == this.heap[i].value) {
        return this.heap[i];
      }
    }
    return null;
  };
  _proto.remove = function remove(v) {
    var index = null;
    for (var i = 0; i < this.len(); i++) {
      if (v == this.heap[i].value) {
        index = i;
      }
    }
    if (index === null) {
      return false;
    }
    if (this.len() > 1) {
      var last = this.heap.pop();
      if (last.value != v) {
        // if the last one is being removed, do nothing
        this.heap[index] = last;
        this.updateDown(index);
      }
      return true;
    } else {
      this.heap.pop();
    }
    return true;
  };
  _proto.parentNode = function parentNode(x) {
    return Math.floor((x - 1) / 2);
  };
  _proto.leftChildNode = function leftChildNode(x) {
    return 2 * x + 1;
  };
  _proto.rightChildNode = function rightChildNode(x) {
    return 2 * x + 2;
  };
  _proto.existNode = function existNode(x) {
    return x >= 0 && x < this.heap.length;
  };
  _proto.swap = function swap(x, y) {
    var t = this.heap[x];
    this.heap[x] = this.heap[y];
    this.heap[y] = t;
  };
  _proto.minNode = function minNode(numbers) {
    var validnumbers = numbers.filter(this.existNode.bind(this));
    var minimal = validnumbers[0];
    for (var _iterator = _createForOfIteratorHelperLoose(validnumbers), _step; !(_step = _iterator()).done;) {
      var i = _step.value;
      if (this.lessThan(this.heap[i], this.heap[minimal])) {
        minimal = i;
      }
    }
    return minimal;
  };
  _proto.updateUp = function updateUp(x) {
    if (x == 0) {
      return;
    }
    var parent = this.parentNode(x);
    if (this.existNode(parent) && this.lessThan(this.heap[x], this.heap[parent])) {
      this.swap(x, parent);
      this.updateUp(parent);
    }
  };
  _proto.updateDown = function updateDown(x) {
    var leftChild = this.leftChildNode(x);
    var rightChild = this.rightChildNode(x);
    if (!this.existNode(leftChild)) {
      return;
    }
    var m = this.minNode([x, leftChild, rightChild]);
    if (m != x) {
      this.swap(x, m);
      this.updateDown(m);
    }
  };
  _proto.debugPrint = function debugPrint() {
    console.log(this.heap);
  };
  return MinHeap;
}();