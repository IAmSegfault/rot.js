function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import FOV from "./fov.js";

/** Octants used for translating recursive shadowcasting offsets */
var OCTANTS = [[-1, 0, 0, 1], [0, -1, 1, 0], [0, -1, -1, 0], [-1, 0, 0, -1], [1, 0, 0, -1], [0, 1, -1, 0], [0, 1, 1, 0], [1, 0, 0, 1]];

/**
 * @class Recursive shadowcasting algorithm
 * Currently only supports 4/8 topologies, not hexagonal.
 * Based on Peter Harkins' implementation of Björn Bergström's algorithm described here: http://www.roguebasin.com/index.php?title=FOV_using_recursive_shadowcasting
 * @augments ROT.FOV
 */
var RecursiveShadowcasting = /*#__PURE__*/function (_FOV) {
  _inheritsLoose(RecursiveShadowcasting, _FOV);
  function RecursiveShadowcasting() {
    return _FOV.apply(this, arguments) || this;
  }
  var _proto = RecursiveShadowcasting.prototype;
  /**
   * Compute visibility for a 360-degree circle
   * @param {int} x
   * @param {int} y
   * @param {int} R Maximum visibility radius
   * @param {function} callback
   */
  _proto.compute = function compute(x, y, R, callback) {
    //You can always see your own tile
    callback(x, y, 0, 1);
    for (var i = 0; i < OCTANTS.length; i++) {
      this._renderOctant(x, y, OCTANTS[i], R, callback);
    }
  }

  /**
   * Compute visibility for a 180-degree arc
   * @param {int} x
   * @param {int} y
   * @param {int} R Maximum visibility radius
   * @param {int} dir Direction to look in (expressed in a ROT.DIRS value);
   * @param {function} callback
   */;
  _proto.compute180 = function compute180(x, y, R, dir, callback) {
    //You can always see your own tile
    callback(x, y, 0, 1);
    var previousOctant = (dir - 1 + 8) % 8; //Need to retrieve the previous octant to render a full 180 degrees
    var nextPreviousOctant = (dir - 2 + 8) % 8; //Need to retrieve the previous two octants to render a full 180 degrees
    var nextOctant = (dir + 1 + 8) % 8; //Need to grab to next octant to render a full 180 degrees
    this._renderOctant(x, y, OCTANTS[nextPreviousOctant], R, callback);
    this._renderOctant(x, y, OCTANTS[previousOctant], R, callback);
    this._renderOctant(x, y, OCTANTS[dir], R, callback);
    this._renderOctant(x, y, OCTANTS[nextOctant], R, callback);
  };
  /**
   * Compute visibility for a 90-degree arc
   * @param {int} x
   * @param {int} y
   * @param {int} R Maximum visibility radius
   * @param {int} dir Direction to look in (expressed in a ROT.DIRS value);
   * @param {function} callback
   */
  _proto.compute90 = function compute90(x, y, R, dir, callback) {
    //You can always see your own tile
    callback(x, y, 0, 1);
    var previousOctant = (dir - 1 + 8) % 8; //Need to retrieve the previous octant to render a full 90 degrees
    this._renderOctant(x, y, OCTANTS[dir], R, callback);
    this._renderOctant(x, y, OCTANTS[previousOctant], R, callback);
  }

  /**
   * Render one octant (45-degree arc) of the viewshed
   * @param {int} x
   * @param {int} y
   * @param {int} octant Octant to be rendered
   * @param {int} R Maximum visibility radius
   * @param {function} callback
   */;
  _proto._renderOctant = function _renderOctant(x, y, octant, R, callback) {
    //Radius incremented by 1 to provide same coverage area as other shadowcasting radiuses
    this._castVisibility(x, y, 1, 1.0, 0.0, R + 1, octant[0], octant[1], octant[2], octant[3], callback);
  }

  /**
   * Actually calculates the visibility
   * @param {int} startX The starting X coordinate
   * @param {int} startY The starting Y coordinate
   * @param {int} row The row to render
   * @param {float} visSlopeStart The slope to start at
   * @param {float} visSlopeEnd The slope to end at
   * @param {int} radius The radius to reach out to
   * @param {int} xx 
   * @param {int} xy 
   * @param {int} yx 
   * @param {int} yy 
   * @param {function} callback The callback to use when we hit a block that is visible
   */;
  _proto._castVisibility = function _castVisibility(startX, startY, row, visSlopeStart, visSlopeEnd, radius, xx, xy, yx, yy, callback) {
    if (visSlopeStart < visSlopeEnd) {
      return;
    }
    for (var i = row; i <= radius; i++) {
      var dx = -i - 1;
      var dy = -i;
      var blocked = false;
      var newStart = 0;

      //'Row' could be column, names here assume octant 0 and would be flipped for half the octants
      while (dx <= 0) {
        dx += 1;

        //Translate from relative coordinates to map coordinates
        var mapX = startX + dx * xx + dy * xy;
        var mapY = startY + dx * yx + dy * yy;

        //Range of the row
        var slopeStart = (dx - 0.5) / (dy + 0.5);
        var slopeEnd = (dx + 0.5) / (dy - 0.5);

        //Ignore if not yet at left edge of Octant
        if (slopeEnd > visSlopeStart) {
          continue;
        }

        //Done if past right edge
        if (slopeStart < visSlopeEnd) {
          break;
        }

        //If it's in range, it's visible
        if (dx * dx + dy * dy < radius * radius) {
          callback(mapX, mapY, i, 1);
        }
        if (!blocked) {
          //If tile is a blocking tile, cast around it
          if (!this._lightPasses(mapX, mapY) && i < radius) {
            blocked = true;
            this._castVisibility(startX, startY, i + 1, visSlopeStart, slopeStart, radius, xx, xy, yx, yy, callback);
            newStart = slopeEnd;
          }
        } else {
          //Keep narrowing if scanning across a block
          if (!this._lightPasses(mapX, mapY)) {
            newStart = slopeEnd;
            continue;
          }

          //Block has ended
          blocked = false;
          visSlopeStart = newStart;
        }
      }
      if (blocked) {
        break;
      }
    }
  };
  return RecursiveShadowcasting;
}(FOV);
export { RecursiveShadowcasting as default };