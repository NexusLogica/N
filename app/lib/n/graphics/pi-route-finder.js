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

N.UI.PiRouteFinder.prototype.FindRoute = function(startNeuron, endNeuron, endAngle, routeInfo) {
  // Draw a line from start to end
  var startPoints = routeInfo.GetNeuronOutputPosition(startNeuron);
  this.Start = { Base: startPoints[0], End: startPoints[1] };

  var nStart = routeInfo.GetNeuron(startNeuron);
  var nEnd   = routeInfo.GetNeuron(endNeuron);

  // Determine the end point.
  // First, are traveling down on the screen or up?
  var startAboveEnd = (nStart.Row < nEnd.Row ? true : false);
  var fromX = routeInfo.GetNeuronOutputPosition(startNeuron)[0].X;
  var toX   = routeInfo.GetNeuronOutputPosition(endNeuron)[0].X;
  var laneRows = routeInfo.LaneRows[nEnd.Row];
  var lane = laneRows[(fromX < toX ? nEnd.Col : nEnd.Col+1)];
  this.End = new N.UI.Vector(lane.Mid, (startAboveEnd ? lane.ThruNeg.Mid : lane.ThruPos.Mid));

  // Which direction do we go?
  this.IncVert = (nStart.Row < nEnd.Row ? 1 : -1);

  // The last vertex on the past found.
  var currentVertex = this.Start.End;

  this.NeuronEnd = this.FindEndAngle(routeInfo, endNeuron, new N.UI.Vector(-(this.Start.End.X-nEnd.X), -(this.Start.End.Y-nEnd.Y)), this.End);

  // For each thruway...
  this.VerticalPassages = [];
  var startNeuronRow = (this.IncVert > 0 ? nStart.Row+1 : nStart.Row);
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

    this.VerticalPassages.push( { LaneRowIndex: i, LaneIndex: laneIndex } );
  }
}

/**
 * This routine performs the not all so trivial task of finding the orientation of the final segment of the path, the one
 * that ends in the input compartment of the sink neuron.
 * @method FindEndAngle
 * @param {N.UI.RouteInfo} routeInfo
 * @param {N.UI.PiNeuron} endNeuron
 * @param {N.UI.Vector} directionVector
 * @param {N.UI.Vector} endPoint
 * @returns {{RequiresVert: *, VertDirection: *, VertSide: string, Last: N.UI.Vector, NextToLast: N.UI.Vector}}
 */
N.UI.PiRouteFinder.prototype.FindEndAngle = function(routeInfo, endNeuron, directionVector, endPoint) {
  var n = routeInfo.GetNeuron(endNeuron);
  var comp = n.CompartmentsById[N.CompFromPath(endNeuron)];
  var angles = comp.DockAngles;
  var quadrants = [ [], [], [], [] ]; // 0->90, 90->180, 180->270, 270->360
  for (var i in angles) {
    // Go through each quadrant.
    var angle = angles[i];
    var from = angle.From;
    var to = angle.To;
    if (from > to) { from -= 360.0; }
    if (to > 360 || from > 360) { to -= 360.0; from -= 360.0; }

    for (var j=0; j<4; j++) {
      var low = 90*j;
      var high = low+90;
      if (from <= high || to >= low) {
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

  var exitAngle = qi*90+45;
  exitAngle += (qi === 0 || qi === 2 ? -1.0 : 1.0) * 20.0;

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

N.UI.PiRouteFinder.prototype.CreateSimpleVertices = function(routeInfo) {
  var vertices = [];

  // Add the two vertices from the base of the output to its drop position directly below it.
  vertices.push(this.Start.Base);
  vertices.push(this.Start.End);

  // Go through all the thruways and lanes to get near the output neuron.
  for(var i=0; i<this.VerticalPassages.length; i++) {
    var vp = this.VerticalPassages[i];
    var lane = routeInfo.LaneRows[vp.LaneRowIndex][vp.LaneIndex];
    var x = lane.Mid;
    var yPos = lane.ThruPos.Mid;
    var yNeg = lane.ThruNeg.Mid;
    if(this.IncVert > 0) { var temp = yPos; yPos = yNeg; yNeg = temp; }
    vertices.push( new N.UI.Vector(x, yPos) );
    vertices.push( new N.UI.Vector(x, yNeg) );
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

  for(i=0; i<2; i++) {
    var iNextToLast = vertices.length-1;
    var v0 = vertices[iNextToLast-1];
    var v1 = vertices[iNextToLast];
    var v2 = this.NeuronEnd.NextToLast;
    var v3 = this.NeuronEnd.Last;
    var vIntersection = this.FindIntersection(v0.X, v0.Y, v1.X, v1.Y, v2.X, v2.Y, v3.X, v3.Y);

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
      var corner1 = simpleVertices[i].Shorten(simpleVertices[i-1], this.ChamferSize);
      var corner2 = simpleVertices[i].Shorten(simpleVertices[i+1], this.ChamferSize);
      this.Vertices.push(corner1);
      this.Vertices.push(corner2);
      //this.Vertices.push(simpleVertices[i]);
    }
    else {
      this.Vertices.push(simpleVertices[i]);
    }
  }

//  this.Vertices.push(simpleVertices[simpleVertices.length-1]);
}

N.UI.PiRouteFinder.prototype.CalculateLengths = function(simpleVertices) {
  for(var i=0; i<simpleVertices.length-1; i++) {
    var len =  simpleVertices[i].Distance(simpleVertices[i+1]);
    if(len < this.MinSegmentLength) {
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

