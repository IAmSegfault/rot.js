function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import Backend from "./backend.js";
import * as Color from "../color.js";

/**
 * @class Tile backend
 * @private
 */
var TileGLES2 = /*#__PURE__*/function (_Backend) {
  _inheritsLoose(TileGLES2, _Backend);
  TileGLES2.isSupported = function isSupported() {
    return !!document.createElement("canvas").getContext("webgl", {
      preserveDrawingBuffer: true
    });
  };
  function TileGLES2() {
    var _this;
    _this = _Backend.call(this) || this;
    _this._uniforms = {};
    _this._glVersion = "webgl";
    try {
      _this._gl = _this._initWebGL();
    } catch (e) {
      if (typeof e === "string") {
        alert(e);
      } else if (e instanceof Error) {
        alert(e.message);
      }
    }
    return _this;
  }
  var _proto = TileGLES2.prototype;
  _proto.schedule = function schedule(cb) {
    requestAnimationFrame(cb);
  };
  _proto.getContainer = function getContainer() {
    return this._gl.canvas;
  };
  _proto.setOptions = function setOptions(opts) {
    var _this2 = this;
    _Backend.prototype.setOptions.call(this, opts);
    this._updateSize();
    var tileSet = this._options.tileSet;
    if (tileSet && "complete" in tileSet && !tileSet.complete) {
      tileSet.addEventListener("load", function () {
        return _this2._updateTexture(tileSet);
      });
    } else {
      this._updateTexture(tileSet);
    }
  };
  _proto.draw = function draw(data, clearBefore) {
    var gl = this._gl;
    var opts = this._options;
    var x = data[0],
      y = data[1],
      ch = data[2],
      fg = data[3],
      bg = data[4];
    var scissorY = gl.canvas.height - (y + 1) * opts.tileHeight;
    gl.scissor(x * opts.tileWidth, scissorY, opts.tileWidth, opts.tileHeight);
    if (clearBefore) {
      if (opts.tileColorize) {
        gl.clearColor(0, 0, 0, 0);
      } else {
        gl.clearColor.apply(gl, parseColor(bg));
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    if (!ch) {
      return;
    }
    var chars = [].concat(ch);
    var bgs = [].concat(bg);
    var fgs = [].concat(fg);
    gl.uniform2fv(this._uniforms["targetPosRel"], [x, y]);
    for (var i = 0; i < chars.length; i++) {
      var tile = this._options.tileMap[chars[i]];
      if (!tile) {
        throw new Error("Char \"" + chars[i] + "\" not found in tileMap");
      }
      gl.uniform1f(this._uniforms["colorize"], opts.tileColorize ? 1 : 0);
      gl.uniform2fv(this._uniforms["tilesetPosAbs"], tile);
      if (opts.tileColorize) {
        gl.uniform4fv(this._uniforms["tint"], parseColor(fgs[i]));
        gl.uniform4fv(this._uniforms["bg"], parseColor(bgs[i]));
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /*
    
    
    		for (let i=0;i<chars.length;i++) {
    
    			if (this._options.tileColorize) { // apply colorization
    				let canvas = this._colorCanvas;
    				let context = canvas.getContext("2d") as CanvasRenderingContext2D;
    				context.globalCompositeOperation = "source-over";
    				context.clearRect(0, 0, tileWidth, tileHeight);
    
    				let fg = fgs[i];
    				let bg = bgs[i];
    
    				context.drawImage(
    					this._options.tileSet!,
    					tile[0], tile[1], tileWidth, tileHeight,
    					0, 0, tileWidth, tileHeight
    				);
    
    				if (fg != "transparent") {
    					context.fillStyle = fg;
    					context.globalCompositeOperation = "source-atop";
    					context.fillRect(0, 0, tileWidth, tileHeight);
    				}
    
    				if (bg != "transparent") {
    					context.fillStyle = bg;
    					context.globalCompositeOperation = "destination-over";
    					context.fillRect(0, 0, tileWidth, tileHeight);
    				}
    
    				this._ctx.drawImage(canvas, x*tileWidth, y*tileHeight, tileWidth, tileHeight);
    			} else { // no colorizing, easy
    				this._ctx.drawImage(
    					this._options.tileSet!,
    					tile[0], tile[1], tileWidth, tileHeight,
    					x*tileWidth, y*tileHeight, tileWidth, tileHeight
    				);
    			}
    		}
    
    */
  };
  _proto.clear = function clear() {
    var gl = this._gl;
    gl.clearColor.apply(gl, parseColor(this._options.bg));
    gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };
  _proto.computeSize = function computeSize(availWidth, availHeight) {
    var width = Math.floor(availWidth / this._options.tileWidth);
    var height = Math.floor(availHeight / this._options.tileHeight);
    return [width, height];
  };
  _proto.computeFontSize = function computeFontSize() {
    throw new Error("Tile backend does not understand font size");
  };
  _proto.eventToPosition = function eventToPosition(x, y) {
    var canvas = this._gl.canvas;
    var rect = canvas.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;
    x *= canvas.width / rect.width;
    y *= canvas.height / rect.height;
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
      return [-1, -1];
    }
    return this._normalizedEventToPosition(x, y);
  };
  _proto._initWebGL = function _initWebGL() {
    var _this3 = this;
    var gl = document.createElement("canvas").getContext(this._glVersion, {
      preserveDrawingBuffer: true
    });
    window.gl = gl;
    var program = createProgram(gl, VS, FS);
    gl.useProgram(program);
    createQuad(gl);
    UNIFORMS.forEach(function (name) {
      return _this3._uniforms[name] = gl.getUniformLocation(program, name);
    });
    this._program = program;
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.SCISSOR_TEST);
    return gl;
  };
  _proto._normalizedEventToPosition = function _normalizedEventToPosition(x, y) {
    return [Math.floor(x / this._options.tileWidth), Math.floor(y / this._options.tileHeight)];
  };
  _proto._updateSize = function _updateSize() {
    var gl = this._gl;
    var opts = this._options;
    var canvasSize = [opts.width * opts.tileWidth, opts.height * opts.tileHeight];
    gl.canvas.width = canvasSize[0];
    gl.canvas.height = canvasSize[1];
    gl.viewport(0, 0, canvasSize[0], canvasSize[1]);
    gl.uniform2fv(this._uniforms["tileSize"], [opts.tileWidth, opts.tileHeight]);
    gl.uniform2fv(this._uniforms["targetSize"], canvasSize);
  };
  _proto._updateTexture = function _updateTexture(tileSet) {
    var textureWidth = tileSet.width;
    var textureHeight = tileSet.height;
    this._gl.uniform2fv(this._uniforms["textureSize"], [textureWidth, textureHeight]);
    createTexture(this._gl, tileSet);
  };
  return TileGLES2;
}(Backend);
export { TileGLES2 as default };
var UNIFORMS = ["targetPosRel", "tilesetPosAbs", "tileSize", "targetSize", "colorize", "bg", "tint", "textureSize"];
var VS = "\n#version 100\n\nattribute vec2 tilePosRel;\nattribute vec2 tilesetPosPx;\n\nuniform vec2 tilesetPosAbs;\nuniform vec2 tileSize;\nuniform vec2 targetSize;\nuniform vec2 targetPosRel;\nvarying vec2 vTilePosRel;\nvarying vec2 vTilesetPosPx;\n\nvoid main() {\n\n\tvTilePosRel = tilePosRel;\n\tvTilesetPosPx = tilesetPosPx;\n\tvec2 targetPosPx = (targetPosRel + vTilePosRel) * tileSize;\n\tvec2 targetPosNdc = ((targetPosPx / targetSize)-0.5)*2.0;\n\ttargetPosNdc.y *= -1.0;\n\n\tgl_Position = vec4(targetPosNdc, 0.0, 1.0);\n\tvTilesetPosPx = tilesetPosAbs + vTilePosRel * tileSize;\n}".trim();
var FS = "\n#version 100\nprecision highp float;\nvarying vec2 vTilePosRel;\nvarying vec2 vTilesetPosPx;\nuniform sampler2D image;\nuniform bool colorize;\nuniform vec4 bg;\nuniform vec4 tint;\nuniform vec2 textureSize;\n\nvec4 texelFetch(sampler2D tex, vec2 size, vec2 coord) {\n    return texture2D(tex, vec2(float(coord.x) / float(size.x), float(coord.y) / float(size.y)));\n}\n\nvoid main() {\n\n\tvec4 vFragColor = vec4(0, 0, 0, 1);\n\tvec4 texel = texelFetch(image, textureSize, vTilesetPosPx);\n\n\tif (colorize) {\n\t\ttexel.rgb = tint.a * tint.rgb + (1.0-tint.a) * texel.rgb;\n\t\tvFragColor.rgb = texel.a*texel.rgb + (1.0-texel.a)*bg.rgb;\n\t\tvFragColor.a = texel.a + (1.0-texel.a)*bg.a;\n\t} else {\n\t\tvFragColor = texel;\n\t}\n\tgl_FragColor = vFragColor;\n}".trim();
function createProgram(gl, vss, fss) {
  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vss);
  gl.compileShader(vs);
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(vs) || "");
  }
  var fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fss);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(fs) || "");
  }
  var p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) || "");
  }
  return p;
}
function createQuad(gl) {
  var pos = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}
function createTexture(gl, data) {
  var t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
  return t;
}
var colorCache = {};
function parseColor(color) {
  if (!(color in colorCache)) {
    var parsed;
    if (color == "transparent") {
      parsed = [0, 0, 0, 0];
    } else if (color.indexOf("rgba") > -1) {
      parsed = (color.match(/[\d.]+/g) || []).map(Number);
      for (var i = 0; i < 3; i++) {
        parsed[i] = parsed[i] / 255;
      }
    } else {
      parsed = Color.fromString(color).map(function ($) {
        return $ / 255;
      });
      parsed.push(1);
    }
    colorCache[color] = parsed;
  }
  return colorCache[color];
}