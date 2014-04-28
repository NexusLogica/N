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

N.UI.PiRouteFinder = function(network) {
  this.Network = network;
  this.ChamferSize = 5.0;
  this.MinSegmentLength = 10.0;
  this.Chamfer = true;
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
N.UI.PiRouteFinder.prototype.FindRoute = function(connection, routeInfo, manager) {
  var startNeuron = N.SourceFromConnectionPath(connection);
  var endNeuron = N.SinkFromConnectionPath(connection);

  // Draw a line from start to end
  var startPoints = routeInfo.GetNeuronOutputPosition(startNeuron);
  this.Start = { Base: startPoints[0], End: startPoints[1] };

  var nStart = routeInfo.GetNeuron(startNeuron);
  var nEnd   = routeInfo.GetNeuron(endNeuron);

  this.NeuronEnd = this.FindEndAngle(routeInfo, endNeuron, new N.UI.Vector(-(this.Start.End.X-nEnd.X), -(this.Start.End.Y-nEnd.Y)));

  // Determine the end point.
  // First, are traveling down on the screen or up?
  var startAboveEnd = (nStart.Row < nEnd.Row ? true : false);
  var fromX = routeInfo.GetNeuronOutputPosition(startNeuron)[0].X;
  var toX   = this.NeuronEnd.NextToLast.X;
  var laneRows = routeInfo.LaneRows[nEnd.Row];
  var lane = laneRows[(nEnd.X > toX ? nEnd.Col : nEnd.Col+1)];
  this.End = new N.UI.Vector(lane.Mid, (startAboveEnd ? lane.ThruNeg.Mid : lane.ThruPos.Mid));

  // Which direction do we go?
  this.IncVert = (nStart.Row < nEnd.Row ? 1 : -1);

  // The last vertex on the past found.
  var currentVertex = this.Start.End;

  // For each thruway...
  this.VerticalPassages = [];
  var startNeuronRow = (this.IncVert > 0 ? nStart.Row+1 : nStart.Row);
  manager.AddThruwaySegment(this, startNeuronRow, -1, 0, this.IncVert);

  var previousLaneSegment = null;
  for(var i = startNeuronRow; i !== nEnd.Row; i += this.IncVert) {
    // Start by drawing a line from the last vertex exit to the end point.
    var targetVec = (new N.UI.Vector(this.End, currentVertex)).Normalize();
    var slope = targetVec.Y/targetVec.X;

    var lanes = routeInfo.LaneRows[i];
    var diffs = [];
    for(var j=0; j<lanes.length; j++) {
      lane = lanes[j];
      var dTarget = (lane.Mid-currentVertex.X)*slope+currentVertex.Y;
      var dLane = lane.YMid;
      var diff = dTarget-dLane;
      diffs.push(Math.abs(diff));
    }

    var laneIndex = N.IndexOfMin(diffs);


    this.VerticalPassages.push( { LaneRowIndex: i, LaneIndex: laneIndex, Offset: 0.0, VertOffset: 0.0 } );

    // Add information to the manager related to segment passage. Used for offsets on crowded thruways and lanes.

    if(previousLaneSegment !== null) {
      manager.AddLaneSegment(this, previousLaneSegment.NeuronRow, previousLaneSegment.LaneIndex, laneIndex, previousLaneSegment.VerticalPassageIndex);
    }
    manager.AddThruwaySegment(this, i+1, this.VerticalPassages.length-2, this.VerticalPassages.length-1, this.IncVert);

    previousLaneSegment = { NeuronRow: i, LaneIndex: laneIndex, VerticalPassageIndex: this.VerticalPassages.length-1 };
  }

  if(previousLaneSegment !== null) {
    var lastLaneIndex = nEnd.Col+0.5;
    manager.AddLaneSegment(this, previousLaneSegment.NeuronRow, previousLaneSegment.LaneIndex, lastLaneIndex, previousLaneSegment.VerticalPassageIndex);
  }
  manager.AddThruwaySegment(this, i+1, this.VerticalPassages.length-1, this.VerticalPassages.length, this.IncVert);

  // Finally, get to the correct lateral position in the thruway.
  var endLanes = routeInfo.LaneRows[nEnd.Row];
  var endDiffs = [];
  for(var k=0; k<endLanes.length; k++) {
    lane = endLanes[k];
    var endDiff = lane.Mid-toX;
    endDiffs.push(Math.abs(endDiff));
  }
  this.LastPassageLane = N.IndexOfMin(endDiffs);
  this.LastPassageX = routeInfo.LaneRows[nEnd.Row][this.LastPassageLane].Mid;
}

N.UI.PiRouteFinder.prototype.BuildPath = function(routeInfo) {

  var simpleVertices = this.CreateSimpleVertices(routeInfo);
  this.CalculateLengths(simpleVertices);

  // Add chamfers.
  this.Vertices = [];
  this.Vertices.push(simpleVertices[0]);

  for(var i=1; i<simpleVertices.length; i++) {
    // Remove a segment.
    if(simpleVertices[i].Join && i < simpleVertices.length-2) {
      // From the points, construct
      var v0 = simpleVertices[i-1];
      var v1 = simpleVertices[i];
      var v2 = simpleVertices[i+1];
      var v3 = simpleVertices[i+2];
      var half = Math.abs(0.5*(v1.X-v2.X));
      v1.Y += half*(v0.Y > v1.Y ? 1.0 : -1.0);
      v2.Y += half*(v2.Y < v3.Y ? 1.0 : -1.0);
      this.Vertices.push(v1);
      this.Vertices.push(v2);
      i++;
    }
    // Add a segment...
    else if(this.Chamfer && i<simpleVertices.length-1) {
      var angle = this.AngleBetween(simpleVertices[i-1], simpleVertices[i], simpleVertices[i+1]);
      var chamfer = this.ChamferSize;
      if(angle < 75) {
        chamfer = 0.5*this.ChamferSize;
      }
      var corner1 = simpleVertices[i].Shorten(simpleVertices[i-1], chamfer);
      var corner2 = simpleVertices[i].Shorten(simpleVertices[i+1], chamfer);
      this.Vertices.push(corner1);
      this.Vertices.push(corner2);
    }
    else {
      this.Vertices.push(simpleVertices[i]);
    }
  }
}

N.UI.PiRouteFinder.prototype.SetVerticalPassageOffset = function(verticalPassageIndex, offset) {
  this.VerticalPassages[verticalPassageIndex].Offset = offset;
}

N.UI.PiRouteFinder.prototype.SetHorizontalPassageOffset = function(routeInfo, offset) {
// Finder: finder, StartSegIndex: startSegIndex, EndSegIndex: endSegIndex, VerticalDirection: verticalDirection
  if(routeInfo.StartSegIndex === -1) {
    this.Start.End += offset;
  }
  if(routeInfo.StartSegIndex >= 0) {
    this.VerticalPassages[routeInfo.StartSegIndex].VertOffset = offset;
  }
  if(routeInfo.EndSegIndex < this.VerticalPassages-1) {
    this.VerticalPassages[routeInfo.EndSegIndex].VertOffset = offset;
  }
}


/**
 * This routine performs the not all so trivial task of finding the orientation of the final segment of the path, the one
 * that ends in the input compartment of the sink neuron.
 * @method FindEndAngle
 * @param {N.UI.RouteInfo} routeInfo
 * @param {N.UI.PiNeuron} endNeuron
 * @param {N.UI.Vector} directionVector
 * @returns {{RequiresVert: *, VertDirection: *, VertSide: string, Last: N.UI.Vector, NextToLast: N.UI.Vector}}
 */
N.UI.PiRouteFinder.prototype.FindEndAngle = function(routeInfo, endNeuron, directionVector) {
  var n = routeInfo.GetNeuron(endNeuron);
  var comp = n.CompartmentsById[N.CompFromPath(endNeuron)];
  var dockAngles = comp.DockAngles;
  var quadrants = [ [], [], [], [] ]; // 0->90, 90->180, 180->270, 270->360
  var angleRange, from, to;

  // Is angle range
  for (var i in dockAngles) {
    // Go through each quadrant.
    angleRange = dockAngles[i];
    for (var j=0; j<4; j++) {
      if(this.IsRangeWithinLimitAngles(angleRange.From, angleRange.To, j*90, (j+1)*90)) {
        quadrants[j].push(i);
      }
    }
  }

  // Which quadrant is ideal?
  var directionQuadrant = (directionVector.X < 0 ? (directionVector.Y > 0.0 ? 3 : 0) : (directionVector.Y > 0.0 ? 2 : 1));

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
    if(this.IsAngleWithinLimitAngles(exitAngle, angleRange.From, angleRange.To)) {
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
      var intersection = this.IntersectionOfRangeAndLimitAngles(angleRange.From, angleRange.To, quadLimitLow, quadLimitHigh);
      ranges.push(intersection);
      totals.push(-intersection.Total);
    }
    var toUse = N.IndexOfMin(totals);
    var bestIntersection = ranges[toUse];
    exitAngle = bestIntersection.From+0.5*bestIntersection.Total;
  }

  var vertAngle = qi*90+45;
  var requiresVert;
  var vertDir;
  switch(qi) {
    case 0: requiresVert = exitAngle < vertAngle; vertDir = -1.0; break;
    case 1: requiresVert = exitAngle > vertAngle; vertDir = -1.0; break;
    case 2: requiresVert = exitAngle < vertAngle; vertDir =  1.0; break;
    case 3: requiresVert = exitAngle > vertAngle; vertDir =  1.0; break;
  }

  var dx = Math.cos(N.Rad(exitAngle));
  var dy = Math.sin(N.Rad(exitAngle));
  var last = new N.UI.Vector(dx*n.Radius+n.X, dy*n.Radius+n.Y);
  var nextToLast = new N.UI.Vector( dx*(n.Radius+10.0)+n.X, dy*(n.Radius+10.0)+n.Y);

  return { RequiresVert: requiresVert, VertDirection: vertDir, VertSide: (qi === 1 || qi === 2 ? 'L' : 'R'), Last: last, NextToLast: nextToLast };
}

N.UI.PiRouteFinder.prototype.GetPath = function(routeInfo) {
  this.BuildPath(routeInfo);

  var path = 'M'+this.Vertices[0].X+' '+this.Vertices[0].Y;
  for(var i=1; i<this.Vertices.length; i++) {
    var s = this.Vertices[i];
    path += 'L'+s.X+' '+s.Y;
  }
  return path;
}

N.UI.PiRouteFinder.prototype.IsRangeWithinLimitAngles = function(from, to, lowerLimit, upperLimit) {
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
N.UI.PiRouteFinder.prototype.IsAngleWithinLimitAngles = function(angle, lowerLimit, upperLimit) {
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
 * @method IntersectionOfRangeAndLimitAngles
 * @param from
 * @param to
 * @param lowerLimit
 * @param upperLimit
 * @returns {{Lower: number, Upper: number, Total: number}} Returns the new from/to intersection values and total angle
 * @constructor
 */
N.UI.PiRouteFinder.prototype.IntersectionOfRangeAndLimitAngles = function(from, to, lowerLimit, upperLimit) {
  var low = (from > lowerLimit ? from : lowerLimit);
  var high = (from > lowerLimit ? from : lowerLimit);
  return { From: low, To: high, Total: high-low };
}

N.UI.PiRouteFinder.prototype.CreateSimpleVertices = function(routeInfo) {
  var vertices = [];

  // Add the two vertices from the base of the output to its drop position directly below it.
  vertices.push(this.Start.Base);
  vertices.push(this.Start.End.Offset(0, (this.VerticalPassages.length > 0 ? this.VerticalPassages[0].VertOffset : 0.0)));

  // Go through all the thruways and lanes to get near the output neuron.
  for(var i=0; i<this.VerticalPassages.length; i++) {
    var vp = this.VerticalPassages[i];
    var lane = routeInfo.LaneRows[vp.LaneRowIndex][vp.LaneIndex];
    var x = lane.Mid+vp.Offset;
    var yPos = lane.ThruPos.Mid;
    var yNeg = lane.ThruNeg.Mid;
    if(this.IncVert > 0) { var temp = yPos; yPos = yNeg; yNeg = temp; }

    var vertOffsetFirst = this.VerticalPassages[i].VertOffset
    var vertOffsetLast = (i < this.VerticalPassages.length-1 ? this.VerticalPassages[i+1].VertOffset : 0.0);
    vertices.push( new N.UI.Vector(x, yPos+vertOffsetFirst) ); // First vertex of the lane.
    vertices.push( new N.UI.Vector(x, yNeg+vertOffsetLast) ); // Second vertex of the lane.
  }

  if(Math.abs(this.LastPassageX-vertices[vertices.length-1].X) > this.MinSegmentLength) {
    vertices.push( new N.UI.Vector(this.LastPassageX, vertices[vertices.length-1].Y) );
  }

  // We are almost there. If final connection into the neuron is more horizontal than vertical we need to
  // to add a path up the side of the neuron.
  if (this.NeuronEnd.RequiresVert) {
    vertices.push(this.End);
    var vertical = vertices[vertices.length-1].Clone();
    vertical.Offset(0.0, this.NeuronEnd.VertDirection*100.0);
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
    var v2 = this.NeuronEnd.NextToLast;
    var v3 = this.NeuronEnd.Last;
    var vIntersection = this.FindIntersection(v0.X, v0.Y, v1.X, v1.Y, v2.X, v2.Y, v3.X, v3.Y);

    var dir = v1.Y-v0.Y;
    if(!horizontalAdded && !this.NeuronEnd.RequiresVert && dir !== 0.0) {
      if((dir < 0.0 && vIntersection.Y > v1.Y) || (dir > 0.0 && vIntersection.Y < v1.Y)) {
        var horiz = vertices[vertices.length-1].Clone();
        horiz.Offset(-1.0, 0.0);
        vertices.push(horiz);
        i--;
        horizontalAdded = true;
        continue;
      }
    }

    // Is the last vertex way too small?
    var len = vIntersection.Distance(v0);
    if(len >= this.MinSegmentLength) {
      vertices.length = vertices.length-1;
      vertices.push(vIntersection);
      vertices.push(this.NeuronEnd.Last);
      break;
    } else {
      vertices.length = vertices.length-1;
    }
  }

  return vertices;
}

N.UI.PiRouteFinder.prototype.AngleBetween = function(v0, v1, v2) {
  var dv0 = (new N.UI.Vector(v0, v1)).Normalize();
  var dv1 = (new N.UI.Vector(v1, v2)).Normalize();
  var dot = (dv0.X*dv1.X+dv0.Y*dv1.Y);
  return N.Deg(Math.acos(dot));
}

N.UI.PiRouteFinder.prototype.CalculateLengths = function(simpleVertices) {
  for(var i=0; i<simpleVertices.length-1; i++) {
    var len =  simpleVertices[i].Distance(simpleVertices[i+1]);
    if(len < 0.001) {
      simpleVertices.splice(i, 1);
      i--;
    }
    else if(len < this.MinSegmentLength && (simpleVertices[i].X !== simpleVertices[i+1].X)) {
      simpleVertices[i].Join = true;
    }
  }
}

N.UI.PiRouteFinder.prototype.FindIntersection = function(p0X, p0Y, p1X, p1Y, p2X, p2Y, p3X, p3Y) {
  var s1X = p1X - p0X;
  var s1Y = p1Y - p0Y;
  var s2X = p3X - p2X;
  var s2Y = p3Y - p2Y;

  var s = (-s1Y * (p0X - p2X) + s1X * (p0Y - p2Y)) / (-s2X * s1Y + s1X * s2Y);
  var t = ( s2X * (p0Y - p2Y) - s2Y * (p0X - p2X)) / (-s2X * s1Y + s1X * s2Y);

  return new N.UI.Vector(p0X + (t * s1X), p0Y + (t * s1Y));
}

