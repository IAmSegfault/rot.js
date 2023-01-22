function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Noise from "./noise.js";
import RNG from "../rng.js";
import { mod } from "../util.js";
var F2 = 0.5 * (Math.sqrt(3) - 1);
var G2 = (3 - Math.sqrt(3)) / 6;

/**
 * A simple 2d implementation of simplex noise by Ondrej Zara
 *
 * Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
 * Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 */
var Simplex = /*#__PURE__*/function (_Noise) {
  _inheritsLoose(Simplex, _Noise);
  /**
   * @param gradients Random gradients
   */
  function Simplex(gradients) {
    var _this;
    if (gradients === void 0) {
      gradients = 256;
    }
    _this = _Noise.call(this) || this;
    _this._gradients = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
    var permutations = [];
    for (var i = 0; i < gradients; i++) {
      permutations.push(i);
    }
    permutations = RNG.shuffle(permutations);
    _this._perms = [];
    _this._indexes = [];
    for (var _i = 0; _i < 2 * gradients; _i++) {
      _this._perms.push(permutations[_i % gradients]);
      _this._indexes.push(_this._perms[_i] % _this._gradients.length);
    }
    return _this;
  }
  var _proto = Simplex.prototype;
  _proto.get = function get(xin, yin) {
    var perms = this._perms;
    var indexes = this._indexes;
    var count = perms.length / 2;
    var n0 = 0,
      n1 = 0,
      n2 = 0,
      gi; // Noise contributions from the three corners

    // Skew the input space to determine which simplex cell we're in
    var s = (xin + yin) * F2; // Hairy factor for 2D
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var t = (i + j) * G2;
    var X0 = i - t; // Unskew the cell origin back to (x,y) space
    var Y0 = j - t;
    var x0 = xin - X0; // The x,y distances from the cell origin
    var y0 = yin - Y0;

    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1 = 0;
      j1 = 1;
    } // upper triangle, YX order: (0,0)->(0,1)->(1,1)

    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1 + 2 * G2;

    // Work out the hashed gradient indices of the three simplex corners
    var ii = mod(i, count);
    var jj = mod(j, count);

    // Calculate the contribution from the three corners
    var t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      gi = indexes[ii + perms[jj]];
      var grad = this._gradients[gi];
      n0 = t0 * t0 * (grad[0] * x0 + grad[1] * y0);
    }
    var t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      gi = indexes[ii + i1 + perms[jj + j1]];
      var _grad = this._gradients[gi];
      n1 = t1 * t1 * (_grad[0] * x1 + _grad[1] * y1);
    }
    var t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      gi = indexes[ii + 1 + perms[jj + 1]];
      var _grad2 = this._gradients[gi];
      n2 = t2 * t2 * (_grad2[0] * x2 + _grad2[1] * y2);
    }

    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70 * (n0 + n1 + n2);
  };
  return Simplex;
}(Noise);
export { Simplex as default };