/**********************************************************************

File     : pi-router.js
Project  : N Simulator Library
Purpose  : Source file for pi connection router.
Revisions: Original definition by Lawrence Gunn.
           2014/03/21

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};
N.UI = N.UI || {};

/**
 * A class for routing connections between neuron compartments in a network. There are two arrays of information.
 *
 *   Thruway: These are the horizontal passages between neuron rows and at the top and bottom of the network container.
 *   Lane: These are the vertical passageways between the thruways. Each lane is between neurons, and can be arbitrarily wide, depending on neurons spacing.
 *   LaneRow: This is the collection of lanes in a row of neurons.
 *
 *   Note that a complicating issue is 'top' and 'bottom'. In the windows world top is higher on the screen but lower in y value. So to avoid this
 *   complication the are YNeg and YPos, meaning a more negative y value or more positive one respectively, so YNeg will be higher on the screen
 *   than YPos.
 *
 * @class UI.Router
 * @param {N.UI.PiNetwork} network
 * @constructor
 */
N.UI.Router = function(network) {
  this.Network = network;
  this.Thruways = [];
  this.LaneRows = [];
}

/**
 * Build the thruway and lane information from the network and neuron layouts. This must be called prior to doing any actual routing of connectors.
 * @method BuildPassageInformation
 * @return {N.UI.Router} Returns a reference to self.
 */
N.UI.Router.prototype.BuildPassageInformation = function() {
  var rows = this.Network.Rows;

  // Calculate the thruway information.
  // Note that there is one more thruway than neuron rows.
  // See note above on YNeg and YPos.
  for(var i=0; i<=rows.length; i++) {
    var yNeg = (i === 0 ? this.Network.Rect.Top : this.MaximumNeuronRowY(i-1));
    var yPos = (i === rows.length ? this.Network.Rect.Bottom : this.MinimumNeuronRowY(i));

    this.Thruways.push({ YNeg: yNeg, YPos: yPos, Mid: 0.5*(yNeg+yPos) });
  }

  var networkLeft = this.Network.Rect.Left;
  var networkRight = this.Network.Rect.Right;

  // Calculate the lane information
  for(i=0; i<rows.length; i++) {

    var lanes = [];
    var row = this.Network.Rows[i];
    var left = networkLeft;
    var thruNeg = this.Thruways[i];
    var thruPos = this.Thruways[i+1];
    lanes.ThruNeg = thruNeg;
    lanes.ThruPos = thruPos;

    for(var j=0; j<row.Cols.length; j++) {
      var name = row.Cols[j].Name;
      if(name && name.length) {
        var n = this.Network.NeuronsByName[name];
        var right = n.X-n.Radius;
        lanes.push({ Left: left, Right: right, Mid: 0.5*(left+right), ThruNeg: thruNeg, ThruPos: thruPos, YMid: 0.5*(thruPos.YNeg+thruNeg.YPos) });
        left = n.X+n.Radius;
      }
    }
    lanes.push({ Left: left, Right: networkRight, Mid: 0.5*(left+networkRight), ThruNeg: thruNeg, ThruPos: thruPos, YMid: 0.5*(thruPos.YNeg+thruNeg.YPos) });

    this.LaneRows.push(lanes);
  }

  return this;
}

N.UI.Router.prototype.GetNeuronOutputPosition = function(neuron) {
  var name = neuron;
  if(!_.isString(neuron)) {
    name = this.Network.Rows[neuron.R].Cols[neuron.C].Name;
  }
  var  n = this.Network.NeuronsByName[name];
  var x = n.X;
  var y = n.Y+n.Radius;
  var lane = this.LaneRows[n.Row];

  return [{ X: x, Y: y}, { X: x, Y: lane.ThruPos.Mid }];
}

N.UI.Router.prototype.GetLaneCenter = function(rowIndex, laneIndex) {
  var lanes = this.LaneRows[rowIndex];
  var lane = lanes[laneIndex];

  return { X: lane.Mid, Y: lane.YMid };
}

N.UI.Router.prototype.GetPoint = function(rc) {
  var pos = [];
  var name, x, y, rx, ry, drop, n;
  if(rc.hasOwnProperty('Src')) {
    name = rc.Src.split('>')[0];
    n = this.Network.NeuronsByName[name];
    x = n.X;
    y = n.Y+n.Radius;
    drop = this.Thruways[n.Row+1].Mid;
    pos.push({ X: x, Y: y });
    this.ProcessOffset(pos, rc);
  }
  else if(rc.hasOwnProperty('SrcOffset')) {
    name = rc.SrcOffset.split('>')[0];
    n = this.Network.NeuronsByName[name];
    x = n.X;
    y = n.Y+n.Radius;
    drop = this.Thruways[n.Row+1].Mid;
    pos.push({ X: x, Y: drop });
    this.ProcessOffset(pos, rc);
  }
  else if(rc.hasOwnProperty('Coord')) {
    var indices = rc.Coord.split(' ');
    ry = this.Thruways[indices[0]].Mid;
    rx = this.LaneRows[indices[1]][indices[2]].Mid;
    pos.push({ X: rx, Y: ry });
    this.ProcessOffset(pos, rc);
  }

  if(rc.hasOwnProperty('Sink')) {
    pos[0].Join = true;
    name = rc.Sink.split('>')[0];
    n = this.Network.NeuronsByName[name];
    x = n.X;
    y = n.Y;
    var r = n.Radius;
    var angle = N.Rad(rc.Angle);
    rx = r*Math.cos(angle);
    ry = r*Math.sin(angle);
    pos.push({ BaseX: x+rx, BaseY: y+ry, DX: rx, DY: ry  });
  }
  return pos;
}

/**
 * If the segment is offset (not centered in a thruway or lane then use this routine will offset the segment.
 * @method ProcessOffset
 * @param {Array} pos An array of segment positions.
 * @param {Object} rc An object containing row, column, and offset components that define the desired segment end.
 */
N.UI.Router.prototype.ProcessOffset = function(pos, rc) {
  if(pos.length && rc.hasOwnProperty('Offset')) {
    var offsetSize = 5.0;
    var offsets = rc.Offset.split(' ');
    var dX = 0, dY = 0;
    for(var i=0; i<offsets.length; i += 2) {
      switch(offsets[i]) {
        case 'DX': dX += offsets[i+1]*offsetSize; break;
        case 'DY': dY += offsets[i+1]*offsetSize; break;
        default: break;
      }
    }
    for(var j=0; j<pos.length; j++) {
      pos[j].X += dX;
      pos[j].Y += dY;
    }
  }
}

/**
 * Iterates through all the pi elements in a row and returns the greatest y value. In other words, returns the height of the circle most in the way.
 * @method MaximumNeuronRowY
 * @param {Integer} index The neuron row index
 * @return {Real} Returns the y value of the row maximum
 * @protected
 */
N.UI.Router.prototype.MaximumNeuronRowY = function(index) {
  var row = this.Network.Rows[index];
  for(var i=0; i<row.Cols.length; i++) {
    var name = row.Cols[i].Name;
    if(name && name.length) {
      var n = this.Network.NeuronsByName[name];
      return n.Y+n.Radius;
    }
  }
  return null;
}

/**
 * Iterates through all the pi elements in a row and returns the lowest y value. In other words, returns the height of the circle most in the way.
 * @method MinimumNeuronRowY
 * @param {Integer} index The neuron row index
 * @return {Real} Returns the y value of the row minimum
 * @protected
 */
N.UI.Router.prototype.MinimumNeuronRowY = function(index) {
  var row = this.Network.Rows[index];
  for(var i=0; i<row.Cols.length; i++) {
    var name = row.Cols[i].Name;
    if(name && name.length) {
      var n = this.Network.NeuronsByName[name];
      return n.Y-n.Radius;
    }
  }
  return null;
}