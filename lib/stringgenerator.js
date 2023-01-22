import RNG from "./rng.js";
/**
 * @class (Markov process)-based string generator. 
 * Copied from a <a href="http://www.roguebasin.roguelikedevelopment.org/index.php?title=Names_from_a_high_order_Markov_Process_and_a_simplified_Katz_back-off_scheme">RogueBasin article</a>. 
 * Offers configurable order and prior.
 */
var StringGenerator = /*#__PURE__*/function () {
  function StringGenerator(options) {
    this._options = {
      words: false,
      order: 3,
      prior: 0.001
    };
    Object.assign(this._options, options);
    this._boundary = String.fromCharCode(0);
    this._suffix = this._boundary;
    this._prefix = [];
    for (var i = 0; i < this._options.order; i++) {
      this._prefix.push(this._boundary);
    }
    this._priorValues = {};
    this._priorValues[this._boundary] = this._options.prior;
    this._data = {};
  }

  /**
   * Remove all learning data
   */
  var _proto = StringGenerator.prototype;
  _proto.clear = function clear() {
    this._data = {};
    this._priorValues = {};
  }

  /**
   * @returns {string} Generated string
   */;
  _proto.generate = function generate() {
    var result = [this._sample(this._prefix)];
    while (result[result.length - 1] != this._boundary) {
      result.push(this._sample(result));
    }
    return this._join(result.slice(0, -1));
  }

  /**
   * Observe (learn) a string from a training set
   */;
  _proto.observe = function observe(string) {
    var tokens = this._split(string);
    for (var i = 0; i < tokens.length; i++) {
      this._priorValues[tokens[i]] = this._options.prior;
    }
    tokens = this._prefix.concat(tokens).concat(this._suffix); /* add boundary symbols */

    for (var _i = this._options.order; _i < tokens.length; _i++) {
      var context = tokens.slice(_i - this._options.order, _i);
      var event = tokens[_i];
      for (var j = 0; j < context.length; j++) {
        var subcontext = context.slice(j);
        this._observeEvent(subcontext, event);
      }
    }
  };
  _proto.getStats = function getStats() {
    var parts = [];
    var priorCount = Object.keys(this._priorValues).length;
    priorCount--; // boundary
    parts.push("distinct samples: " + priorCount);
    var dataCount = Object.keys(this._data).length;
    var eventCount = 0;
    for (var p in this._data) {
      eventCount += Object.keys(this._data[p]).length;
    }
    parts.push("dictionary size (contexts): " + dataCount);
    parts.push("dictionary size (events): " + eventCount);
    return parts.join(", ");
  }

  /**
   * @param {string}
   * @returns {string[]}
   */;
  _proto._split = function _split(str) {
    return str.split(this._options.words ? /\s+/ : "");
  }

  /**
   * @param {string[]}
   * @returns {string} 
   */;
  _proto._join = function _join(arr) {
    return arr.join(this._options.words ? " " : "");
  }

  /**
   * @param {string[]} context
   * @param {string} event
   */;
  _proto._observeEvent = function _observeEvent(context, event) {
    var key = this._join(context);
    if (!(key in this._data)) {
      this._data[key] = {};
    }
    var data = this._data[key];
    if (!(event in data)) {
      data[event] = 0;
    }
    data[event]++;
  }

  /**
   * @param {string[]}
   * @returns {string}
   */;
  _proto._sample = function _sample(context) {
    context = this._backoff(context);
    var key = this._join(context);
    var data = this._data[key];
    var available = {};
    if (this._options.prior) {
      for (var event in this._priorValues) {
        available[event] = this._priorValues[event];
      }
      for (var _event in data) {
        available[_event] += data[_event];
      }
    } else {
      available = data;
    }
    return RNG.getWeightedValue(available);
  }

  /**
   * @param {string[]}
   * @returns {string[]}
   */;
  _proto._backoff = function _backoff(context) {
    if (context.length > this._options.order) {
      context = context.slice(-this._options.order);
    } else if (context.length < this._options.order) {
      context = this._prefix.slice(0, this._options.order - context.length).concat(context);
    }
    while (!(this._join(context) in this._data) && context.length > 0) {
      context = context.slice(1);
    }
    return context;
  };
  return StringGenerator;
}();
export { StringGenerator as default };