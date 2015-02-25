/**********************************************************************

File     : pi-route-finder.js
Project  : N Simulator Library
Purpose  : Source file for connection graphics testing.
Revisions: Original definition by Lawrence Gunn.
           2014/03/21

Notes    : This is a three part process.
             1) Find the thruways and lanes that will be taken.
             2) Determine the vertex positions for line segments along the thruways and lanes.
             3) Chamfer and clean up the lines.

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //**********************
  //* N.UI.PiRouteFinder *
  //**********************

N.UI.PiRouteFinder = function(piConnection) {
  this.piConnection = piConnection;
  this.connection = this.piConnection.connection;
  this.chamferSize = 5.0;
  this.minSegmentLength = 10.0;
  this.chamfer = true;
  this.thruwayOffsets = [];
  this.debug = true;
}

/**
 * Find the general path for the route. This is the first of two steps, the other being BuildPath.
 * @method FindRoute
 * @param startNeuron
 * @param endNeuron
 * @param routeInfo
 * @param manager
 * @constructor
 */
N.UI.PiRouteFinder.prototype.findRoute = function(manager) {
  var connectionPath = this.piConnection.connection.getPath();
  this.routeInfo = this.piConnection.network.routeInfo;
  var startNeuron = N.sourceFromConnectionPath(connectionPath);
  var endNeuron = N.sinkFromConnectionPath(connectionPath);

  // Draw a line from start to end
  var startPoints = this.routeInfo.getNeuronOutputPosition(this.piConnection.network, startNeuron);
  this.start = { base: startPoints[0], end: startPoints[1] };

  var nStart = this.routeInfo.getNeuron(this.piConnection.network, startNeuron);
  var nEnd   = this.routeInfo.getNeuron(this.piConnection.network, endNeuron);
  this.startRow = this.getRow(nStart);
  this.endRow   = this.getRow(nEnd);

  this.neuronEnd = this.findEndAngle(endNeuron, new N.UI.Vector(-(this.start.end.x-(nEnd.x+nEnd.network.x)), -(this.start.end.y-(nEnd.y+nEnd.network.y))));

  // Determine the end point.
  // First, are traveling down on the screen or up?
  var startAboveEnd = (this.startRow < this.endRow ? true : false);
  var fromX = this.routeInfo.getNeuronOutputPosition(this.piConnection.network, startNeuron)[0].x;
  var toX   = this.neuronEnd.nextToLast.x;
  var laneRows = this.routeInfo.laneRows[this.endRow];
  var lane = laneRows[(nEnd.x > toX ? nEnd.col : nEnd.col+1)];
  this.end = new N.UI.Vector(lane.mid, (startAboveEnd ? lane.thruNeg.mid : lane.thruPos.mid));

  // Which direction do we go?
  this.incVert = (this.startRow < this.endRow ? 1 : -1);

  // The last vertex on the past found.
  var currentVertex = this.start.end;

  // For each thruway...
  this.verticalPassages = [];
  var startRow = (this.incVert > 0 ? this.startRow+1 : this.startRow);
  this.startNeuronRow = this.startRow+1;
  var thruwayIndex = this.startNeuronRow;
  manager.addThruwaySegment(this, thruwayIndex, -1, 0, this.incVert);

  var previousLaneSegment = null;
  for(var i = startRow; i !== this.endRow; i += this.incVert) {
    // Start by drawing a line from the last vertex exit to the end point.
    var targetVec = (new N.UI.Vector(this.end, currentVertex)).normalize();
    var slope = targetVec.y/targetVec.x;
    thruwayIndex += this.incVert;

    var lanes = this.routeInfo.laneRows[i];
    var diffs = [];
    for(var j=0; j<lanes.length; j++) {
      lane = lanes[j];
      var dTarget = (lane.mid-currentVertex.x)*slope+currentVertex.y;
      var dLane = lane.yMid;
      var diff = dTarget-dLane;
      diffs.push(Math.abs(diff));
    }

    var laneIndex = N.indexOfMin(diffs);

    this.verticalPassages.push( { laneRowIndex: i, laneIndex: laneIndex, offset: 0.0, vertOffset: 0.0 } );

    // Add information to the manager related to segment passage. Used for offsets on crowded thruways and lanes.

    if(previousLaneSegment !== null) {
      manager.addLaneSegment(this, previousLaneSegment.neuronRow, previousLaneSegment.laneIndex, laneIndex, previousLaneSegment.verticalPassageIndex);
    }
    manager.addThruwaySegment(this, thruwayIndex, this.verticalPassages.length-2, this.verticalPassages.length-1, this.incVert);

    previousLaneSegment = { neuronRow: i, laneIndex: laneIndex, verticalPassageIndex: this.verticalPassages.length-1 };
  }

  if(previousLaneSegment !== null) {
    var lastLaneIndex = nEnd.col+0.5;
    manager.addLaneSegment(this, previousLaneSegment.neuronRow, previousLaneSegment.laneIndex, lastLaneIndex, previousLaneSegment.verticalPassageIndex);
  }
//  manager.addThruwaySegment(this, i+1, this.verticalPassages.length-1, this.verticalPassages.length, this.incVert);

  // Finally, get to the correct lateral position in the thruway.
  var endLanes = this.routeInfo.laneRows[this.endRow];
  var endDiffs = [];
  for(var k=0; k<endLanes.length; k++) {
    lane = endLanes[k];
    var endDiff = lane.mid-toX;
    endDiffs.push(Math.abs(endDiff));
  }
  this.lastPassageLane = N.indexOfMin(endDiffs);
  this.lastPassageX = this.routeInfo.laneRows[this.endRow][this.lastPassageLane].mid;

  if(this.debug) {
    console.log('**** Route Found for '+this.connection.path);
    console.log('**** Vertical Passages:\n'+JSON.stringify(this.verticalPassages, undefined, 2));
    console.log('**** Neuron End:\n'+JSON.stringify(this.neuronEnd, undefined, 2));
    console.log('**** End:\n'+JSON.stringify(this.end, undefined, 2));
  }
}

N.UI.PiRouteFinder.prototype.buildPath = function() {

  var simpleVertices = this.createSimpleVertices(this.routeInfo);
  this.calculateLengths(simpleVertices);

  // Add chamfers.
  this.vertices = [];
  this.vertices.push(simpleVertices[0]);

  for(var i=1; i<simpleVertices.length; i++) {
    // Remove a segment.
    if(simpleVertices[i].join && i < simpleVertices.length-2) {
      // From the points, construct
      var v0 = simpleVertices[i-1];
      var v1 = simpleVertices[i];
      var v2 = simpleVertices[i+1];
      var v3 = simpleVertices[i+2];
      var half = Math.abs(0.5*(v1.x-v2.x));
      v1.y += half*(v0.y > v1.y ? 1.0 : -1.0);
      v2.y += half*(v2.y < v3.y ? 1.0 : -1.0);
      this.vertices.push(v1);
      this.vertices.push(v2);
      i++;
    }
    // Add a segment...
    else if(this.chamfer && i<simpleVertices.length-1) {
      var angle = this.angleBetween(simpleVertices[i-1], simpleVertices[i], simpleVertices[i+1]);
      var chamfer = this.chamferSize;
      if(angle < 75) {
        chamfer = 0.5*this.chamferSize;
      }
      var corner1 = simpleVertices[i].shorten(simpleVertices[i-1], chamfer);
      var corner2 = simpleVertices[i].shorten(simpleVertices[i+1], chamfer);
      this.vertices.push(corner1);
      this.vertices.push(corner2);
    }
    else {
      this.vertices.push(simpleVertices[i]);
    }
  }
}

N.UI.PiRouteFinder.prototype.getEndInfo = function() {
  return { endNeuronCenter: this.neuronEnd.endNeuronCenter, endNeuronOuter: this.neuronEnd.last };
}

N.UI.PiRouteFinder.prototype.setVerticalPassageOffset = function(verticalPassageIndex, offset) {
  this.verticalPassages[verticalPassageIndex].offset = offset;
}

N.UI.PiRouteFinder.prototype.setHorizontalPassageOffset = function(routeData, offset) {
  routeData.offset = offset;
  this.thruwayOffsets[routeData.thruwayIndex] = routeData;
}

N.UI.PiRouteFinder.prototype.updateThruwayInfo = function(thruwayRouteInfo) {
  var iStart = thruwayRouteInfo.startSegIndex;
  var iEnd = thruwayRouteInfo.endSegIndex;
  var x1, x2;
  if(iStart === -1) {
    x1 = this.start.base.x;
  } else {
    x1 = this.routeInfo.laneRows[this.verticalPassages[iStart].laneRowIndex][this.verticalPassages[iStart].laneIndex].mid;
  }
  if(iEnd >= this.verticalPassages.length) {
    x2 = this.end.x;
  } else {
    x2 = this.routeInfo.laneRows[this.verticalPassages[iEnd].laneRowIndex][this.verticalPassages[iEnd].laneIndex].mid;
  }
  if(x2 > x1) {
    thruwayRouteInfo.xMin = x1;
    thruwayRouteInfo.xMax = x2;
  } else {
    thruwayRouteInfo.xMin = x2;
    thruwayRouteInfo.xMax = x1;
  }
}

/**
 * This routine performs the not all so trivial task of finding the orientation of the final segment of the path, the one
 * that ends in the input compartment of the sink neuron.
 * @method findEndAngle
 * @param {N.UI.PiNeuron} endNeuron
 * @param {N.UI.Vector} directionVector
 * @returns {{requiresVert: *, vertDirection: *, vertSide: string, last: N.UI.Vector, nextToLast: N.UI.Vector, endNeuronCenter: N.UI.Vector}}
 */
N.UI.PiRouteFinder.prototype.findEndAngle = function(endNeuron, directionVector) {
  var n = this.routeInfo.getNeuron(this.piConnection.network, endNeuron);
  var comp = n.compartmentsById[N.compFromPath(endNeuron)];
  var dockAngles = comp.dockAngles;
  var quadrants = [ [], [], [], [] ]; // 0->90, 90->180, 180->270, 270->360
  var angleRange, from, to;

  // Is angle range
  for (var i in dockAngles) {
    // Go through each quadrant.
    angleRange = dockAngles[i];
    for (var j=0; j<4; j++) {
      if(this.isRangeWithinLimitAngles(angleRange.from, angleRange.to, j*90, (j+1)*90)) {
        quadrants[j].push(i);
      }
    }
  }

  // Which quadrant is ideal?
  var directionQuadrant = (directionVector.x < 0 ? (directionVector.y > 0.0 ? 3 : 0) : (directionVector.y > 0.0 ? 2 : 1));

  var qi = directionQuadrant;
  if(quadrants[directionQuadrant].length === 0) {
    qi = (directionQuadrant+1 < 3 ? directionQuadrant+1 : 0);
    if(quadrants[qi].length === 0) {
      qi = (directionQuadrant-1 < 3 ? directionQuadrant-1 : 0);
      if(quadrants[qi].length === 0) {
        qi = (directionQuadrant-2 < 3 ? directionQuadrant-2 : 0);
      }
    }
  }

  // At this point we have already decided on a quadrant and we know it is a reasonable choice. Next
  // see if a 45 degree exit angle is possible.
  var exitAngle = qi*90+45;
  var success = false;
  for(i in quadrants[qi]) {
    angleRange = dockAngles[quadrants[qi][i]];
    if(this.isAngleWithinLimitAngles(exitAngle, angleRange.from, angleRange.to)) {
      success = true;
      break;
    }
  }

  if(!success) {
    var ranges = [];
    var totals = [];
    var quadLimitLow = qi*90;
    var quadLimitHigh = quadLimitLow+90;
    for(i in quadrants[qi]) {
      angleRange = dockAngles[quadrants[qi][i]];
      var intersection = this.intersectionOfRangeAndLimitAngles(angleRange.from, angleRange.to, quadLimitLow, quadLimitHigh);
      ranges.push(intersection);
      totals.push(-intersection.total);
    }
    var toUse = N.indexOfMin(totals);
    var bestIntersection = ranges[toUse];
    exitAngle = bestIntersection.from+0.5*bestIntersection.total;
  }

  var vertAngle = qi*90+45;
  var requiresVert;
  var vertDir;
  switch(qi) {
    case 0: requiresVert = exitAngle <= vertAngle; vertDir = -1.0; break;
    case 1: requiresVert = exitAngle >= vertAngle; vertDir = -1.0; break;
    case 2: requiresVert = exitAngle <= vertAngle; vertDir =  1.0; break;
    case 3: requiresVert = exitAngle >= vertAngle; vertDir =  1.0; break;
  }

  var dx = Math.cos(N.rad(exitAngle));
  var dy = Math.sin(N.rad(exitAngle));
  var networkY = n.network.y;
  var last = new N.UI.Vector(dx*n.radius+n.x, dy*n.radius+n.y+networkY);
  var nextToLast = new N.UI.Vector( dx*(n.radius+10.0)+n.x, dy*(n.radius+10.0)+n.y+networkY);

  return { requiresVert: requiresVert, vertDirection: vertDir, vertSide: (qi === 1 || qi === 2 ? 'L' : 'R'), last: last, nextToLast: nextToLast, endNeuronCenter: new N.UI.Vector(n.x, n.y+networkY)  };
}

N.UI.PiRouteFinder.prototype.getPath = function() {
  this.buildPath();

  var path = 'M'+this.vertices[0].x+' '+this.vertices[0].y;
  for(var i=1; i<this.vertices.length; i++) {
    var s = this.vertices[i];
    path += 'L'+s.x+' '+s.y;
  }
  return path;
}

N.UI.PiRouteFinder.prototype.isRangeWithinLimitAngles = function(from, to, lowerLimit, upperLimit) {
  var lower = lowerLimit-360;
  var upper = upperLimit-360;
  for(var i=0; i<3; i++) {
    if(from >= lower && from <= upper) {
      return true;
    }
    if(to >= lower && to <= upper) {
      return true;
    }
    if(from <= lower && to >= upper) {
      return true;
    }
    lower += 360.0;
    upper += 360.0;
  }
  return false;
}

/**
 * Returns a boolean indicating if the
 * @method IsAngleWithinLimitAngles
 * @param angle
 * @param lowerLimit
 * @param upperLimit
 * @returns {boolean}
 * @constructor
 */
N.UI.PiRouteFinder.prototype.isAngleWithinLimitAngles = function(angle, lowerLimit, upperLimit) {
  var lower = lowerLimit-360;
  var upper = upperLimit-360;
  for(var i=0; i<3; i++) {
    if(angle >= lower && angle <= upper) {
      return true;
    }
    lower += 360.0;
    upper += 360.0;
  }
  return false;
}

/**
 * Finds the range, within this quadrant specified by the upper and lower limits, that is within the limits and
 * within the to/from range. It assumes that the to/from range is definitely within the limit angles.
 * @method intersectionOfRangeAndLimitAngles
 * @param from
 * @param to
 * @param lowerLimit
 * @param upperLimit
 * @returns {{Lower: number, Upper: number, Total: number}} Returns the new from/to intersection values and total angle
 * @constructor
 */
N.UI.PiRouteFinder.prototype.intersectionOfRangeAndLimitAngles = function(from, to, lowerLimit, upperLimit) {
  var low = (from > lowerLimit ? from : lowerLimit);
  var high = (from > lowerLimit ? from : lowerLimit);
  return { From: low, To: high, Total: high-low };
}

N.UI.PiRouteFinder.prototype.createSimpleVertices = function() {
  var vertices = [];

  // Add the two vertices from the base of the output to its drop position directly below it.
  vertices.push(this.start.base);
  var thruwayIndex = this.startNeuronRow;
  var endOffset = 0.0;
  if(this.thruwayOffsets[thruwayIndex]) {
    endOffset = this.thruwayOffsets[thruwayIndex].offset;
  }
  vertices.push(this.start.end.clone().offset(0.0, endOffset));

//  vertices.push(this.start.end.offset(0, (this.verticalPassages.length > 0 ? this.verticalPassages[0].vertOffset : 0.0)));

  // Go through all the thruways and lanes to get near the output neuron.
  for(var i=0; i<this.verticalPassages.length; i++) {
    var vp = this.verticalPassages[i];
    var lane = this.routeInfo.laneRows[vp.laneRowIndex][vp.laneIndex];
    var x = lane.mid+vp.offset;
    var yPos = lane.thruPos.mid;
    var yNeg = lane.thruNeg.mid;
    if(this.incVert > 0) { var temp = yPos; yPos = yNeg; yNeg = temp; }

    var vertOffsetFirst = 0.0;
    if(this.thruwayOffsets[thruwayIndex]) {
      vertOffsetFirst += this.thruwayOffsets[thruwayIndex].offset;
    }

    thruwayIndex += this.incVert;

    var vertOffsetLast = 0.0;
    if(this.thruwayOffsets[thruwayIndex]) {
      vertOffsetLast += this.thruwayOffsets[thruwayIndex].offset;
    }

    vertices.push( new N.UI.Vector(x, yPos+vertOffsetFirst) ); // First vertex of the lane.
    vertices.push( new N.UI.Vector(x, yNeg+vertOffsetLast) ); // Second vertex of the lane.
  }

  if(Math.abs(this.lastPassageX-vertices[vertices.length-1].x) > this.minSegmentLength) {
    vertices.push( new N.UI.Vector(this.lastPassageX, vertices[vertices.length-1].y) );
  }

  // We are almost there. If final connection into the neuron is more horizontal than vertical we need to
  // to add a path up the side of the neuron.
  if (this.neuronEnd.requiresVert) {
    vertices.push(this.end.clone().offset(0, (this.thruwayOffsets[thruwayIndex] ? this.thruwayOffsets[thruwayIndex].offset : 0.0)));
    var vertical = vertices[vertices.length-1].clone();
    vertical.offset(0.0, this.neuronEnd.vertDirection*100.0);
    vertices.push(vertical);
  }

  // Now we need to determine the length and starting position of the next to final connection segment. To do this we
  // take the last segment from above and find the intersection with the final segment. There are two possible problems
  // that can arise.
  //   1) The next to final segment can be too short.
  //   2) The next to final segment can run backwards, adding a weird spike to the path. This is determined
  //      by calculating the angle between that two final segments. If abs(angle) < 90 the we need to remove it.
  var horizontalAdded = false;
  for(i=0; i<2; i++) {
    var iNextToLast = vertices.length-1;
    var v0 = vertices[iNextToLast-1];
    var v1 = vertices[iNextToLast];
    var v2 = this.neuronEnd.nextToLast;
    var v3 = this.neuronEnd.last;
    var vIntersection = this.findIntersection(v0.x, v0.y, v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);

    var dir = v1.y-v0.y;
    if(!horizontalAdded && !this.neuronEnd.requiresVert && dir !== 0.0) {
      if((dir < 0.0 && vIntersection.y > v1.y) || (dir > 0.0 && vIntersection.y < v1.y)) {
        var horiz = vertices[vertices.length-1].clone();
        horiz.offset(-1.0, 0.0);
        vertices.push(horiz);
        i--;
        horizontalAdded = true;
        continue;
      }
    }

    // Is the last vertex way too small?
    var len = vIntersection.distance(v0);
    if(len >= this.minSegmentLength) {
      vertices.length = vertices.length-1;
      vertices.push(vIntersection);
      vertices.push(this.neuronEnd.last);
      break;
    } else {
      vertices.length = vertices.length-1;
    }
  }

  return vertices;
}

N.UI.PiRouteFinder.prototype.getRow = function(neuron) {
  if(neuron.network === this.piConnection.network) {
    return neuron.row;
  } else {
    var row = 0;
    var top = this.piConnection.network;
    for(var i in top.networks) {
      if(neuron.network === top.networks[i]) {
        return row+neuron.row;
      }
      row += top.networks[i].rows.length;
    }
  }
}


N.UI.PiRouteFinder.prototype.angleBetween = function(v0, v1, v2) {
  var dv0 = (new N.UI.Vector(v0, v1)).normalize();
  var dv1 = (new N.UI.Vector(v1, v2)).normalize();
  var dot = (dv0.x*dv1.x+dv0.y*dv1.y);
  return N.deg(Math.acos(dot));
}

N.UI.PiRouteFinder.prototype.calculateLengths = function(simpleVertices) {
  for(var i=0; i<simpleVertices.length-1; i++) {
    var len =  simpleVertices[i].distance(simpleVertices[i+1]);
    if(len < 0.001) {
      simpleVertices.splice(i, 1);
      i--;
    }
    else if(len < this.minSegmentLength && (simpleVertices[i].x !== simpleVertices[i+1].x)) {
      simpleVertices[i].join = true;
    }
  }
}

N.UI.PiRouteFinder.prototype.findIntersection = function(p0X, p0Y, p1X, p1Y, p2X, p2Y, p3X, p3Y) {
  var s1X = p1X - p0X;
  var s1Y = p1Y - p0Y;
  var s2X = p3X - p2X;
  var s2Y = p3Y - p2Y;

  var s = (-s1Y * (p0X - p2X) + s1X * (p0Y - p2Y)) / (-s2X * s1Y + s1X * s2Y);
  var t = ( s2X * (p0Y - p2Y) - s2Y * (p0X - p2X)) / (-s2X * s1Y + s1X * s2Y);

  return new N.UI.Vector(p0X + (t * s1X), p0Y + (t * s1Y));
}
