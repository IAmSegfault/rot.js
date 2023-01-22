import * as Color from "./color.js";
;

/** Will be called for every lit cell */
;
;
;
/**
 * Lighting computation, based on a traditional FOV for multiple light sources and multiple passes.
 */
var Lighting = /*#__PURE__*/function () {
  function Lighting(reflectivityCallback, options) {
    if (options === void 0) {
      options = {};
    }
    this._reflectivityCallback = reflectivityCallback;
    this._options = {};
    options = Object.assign({
      passes: 1,
      emissionThreshold: 100,
      range: 10
    }, options);
    this._lights = {};
    this._reflectivityCache = {};
    this._fovCache = {};
    this.setOptions(options);
  }

  /**
   * Adjust options at runtime
   */
  var _proto = Lighting.prototype;
  _proto.setOptions = function setOptions(options) {
    Object.assign(this._options, options);
    if (options && options.range) {
      this.reset();
    }
    return this;
  }

  /**
   * Set the used Field-Of-View algo
   */;
  _proto.setFOV = function setFOV(fov) {
    this._fov = fov;
    this._fovCache = {};
    return this;
  }

  /**
   * Set (or remove) a light source
   */;
  _proto.setLight = function setLight(x, y, color) {
    var key = x + "," + y;
    if (color) {
      this._lights[key] = typeof color == "string" ? Color.fromString(color) : color;
    } else {
      delete this._lights[key];
    }
    return this;
  }

  /**
   * Remove all light sources
   */;
  _proto.clearLights = function clearLights() {
    this._lights = {};
  }

  /**
   * Reset the pre-computed topology values. Call whenever the underlying map changes its light-passability.
   */;
  _proto.reset = function reset() {
    this._reflectivityCache = {};
    this._fovCache = {};
    return this;
  }

  /**
   * Compute the lighting
   */;
  _proto.compute = function compute(lightingCallback) {
    var doneCells = {};
    var emittingCells = {};
    var litCells = {};
    for (var _key in this._lights) {
      /* prepare emitters for first pass */
      var light = this._lights[_key];
      emittingCells[_key] = [0, 0, 0];
      Color.add_(emittingCells[_key], light);
    }
    for (var i = 0; i < this._options.passes; i++) {
      /* main loop */
      this._emitLight(emittingCells, litCells, doneCells);
      if (i + 1 == this._options.passes) {
        continue;
      } /* not for the last pass */
      emittingCells = this._computeEmitters(litCells, doneCells);
    }
    for (var litKey in litCells) {
      /* let the user know what and how is lit */
      var parts = litKey.split(",");
      var _x = parseInt(parts[0]);
      var _y = parseInt(parts[1]);
      lightingCallback(_x, _y, litCells[litKey]);
    }
    return this;
  }

  /**
   * Compute one iteration from all emitting cells
   * @param emittingCells These emit light
   * @param litCells Add projected light to these
   * @param doneCells These already emitted, forbid them from further calculations
   */;
  _proto._emitLight = function _emitLight(emittingCells, litCells, doneCells) {
    for (var _key2 in emittingCells) {
      var parts = _key2.split(",");
      var _x2 = parseInt(parts[0]);
      var _y2 = parseInt(parts[1]);
      this._emitLightFromCell(_x2, _y2, emittingCells[_key2], litCells);
      doneCells[_key2] = 1;
    }
    return this;
  }

  /**
   * Prepare a list of emitters for next pass
   */;
  _proto._computeEmitters = function _computeEmitters(litCells, doneCells) {
    var result = {};
    for (var _key3 in litCells) {
      if (_key3 in doneCells) {
        continue;
      } /* already emitted */

      var _color = litCells[_key3];
      var reflectivity = void 0;
      if (_key3 in this._reflectivityCache) {
        reflectivity = this._reflectivityCache[_key3];
      } else {
        var parts = _key3.split(",");
        var _x3 = parseInt(parts[0]);
        var _y3 = parseInt(parts[1]);
        reflectivity = this._reflectivityCallback(_x3, _y3);
        this._reflectivityCache[_key3] = reflectivity;
      }
      if (reflectivity == 0) {
        continue;
      } /* will not reflect at all */

      /* compute emission color */
      var emission = [0, 0, 0];
      var intensity = 0;
      for (var i = 0; i < 3; i++) {
        var part = Math.round(_color[i] * reflectivity);
        emission[i] = part;
        intensity += part;
      }
      if (intensity > this._options.emissionThreshold) {
        result[_key3] = emission;
      }
    }
    return result;
  }

  /**
   * Compute one iteration from one cell
   */;
  _proto._emitLightFromCell = function _emitLightFromCell(x, y, color, litCells) {
    var key = x + "," + y;
    var fov;
    if (key in this._fovCache) {
      fov = this._fovCache[key];
    } else {
      fov = this._updateFOV(x, y);
    }
    for (var fovKey in fov) {
      var formFactor = fov[fovKey];
      var result = void 0;
      if (fovKey in litCells) {
        /* already lit */
        result = litCells[fovKey];
      } else {
        /* newly lit */
        result = [0, 0, 0];
        litCells[fovKey] = result;
      }
      for (var i = 0; i < 3; i++) {
        result[i] += Math.round(color[i] * formFactor);
      } /* add light color */
    }

    return this;
  }

  /**
   * Compute FOV ("form factor") for a potential light source at [x,y]
   */;
  _proto._updateFOV = function _updateFOV(x, y) {
    var key1 = x + "," + y;
    var cache = {};
    this._fovCache[key1] = cache;
    var range = this._options.range;
    function cb(x, y, r, vis) {
      var key2 = x + "," + y;
      var formFactor = vis * (1 - r / range);
      if (formFactor == 0) {
        return;
      }
      cache[key2] = formFactor;
    }
    ;
    this._fov.compute(x, y, range, cb.bind(this));
    return cache;
  };
  return Lighting;
}();
export { Lighting as default };