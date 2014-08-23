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
N.UI.routeInfo = function(network) {
  this.network = network;
  this.thruways = [];
  this.laneRows = [];
  this.debug    = false;
}

/**
 * Build the thruway and lane information from the network and neuron layouts. This must be called prior to doing any actual routing of connectors.
 * @method buildPassageInformation
 * @return {N.UI.routeInfo} Returns a reference to self.
 */
N.UI.routeInfo.prototype.buildPassageInformation = function() {
  if(this.network.networks.length > 0) {
    this.copyChildNetworks();
  }
  else {
    var rows = this.network.rows;

    // Calculate the thruway information.
    // Note that there is one more thruway than neuron rows.
    // See note above on YNeg and YPos.
    for(var i=0; i<=rows.length; i++) {
      var yNeg = (i === 0 ? this.network.rect.top : this.maximumNeuronRowY(i-1));
      var yPos = (i === rows.length ? this.network.rect.bottom : this.minimumNeuronRowY(i));

      this.thruways.push({ yNeg: yNeg, yPos: yPos, mid: 0.5*(yNeg+yPos) });
    }

    var networkLeft = this.network.rect.left;
    var networkRight = this.network.rect.right;

    // Calculate the lane information
    for(i=0; i<rows.length; i++) {

      var lanes = [];
      var row = this.network.rows[i];
      var left = networkLeft;
      var thruNeg = this.thruways[i];
      var thruPos = this.thruways[i+1];
      lanes.thruNeg = thruNeg;
      lanes.thruPos = thruPos;

      for(var j=0; j<row.cols.length; j++) {
        var name = row.cols[j].name;
        if(name && name.length) {
          var n = this.network.neuronsByName[name];
          var right = n.x-n.radius;
          lanes.push({ left: left, right: right, mid: 0.5*(left+right), thruNeg: thruNeg, thruPos: thruPos, yMid: 0.5*(thruPos.yNeg+thruNeg.yPos) });
          left = n.x+n.radius;
        }
      }
      lanes.push({ left: left, right: networkRight, mid: 0.5*(left+networkRight), thruNeg: thruNeg, thruPos: thruPos, yMid: 0.5*(thruPos.yNeg+thruNeg.yPos) });

      this.laneRows.push(lanes);
    }
  }

  if(this.debug) {
    console.log('**** Route Info for '+(!_.isEmpty(this.network.network.name) ? this.network.network.name : 'Root Network'));
    console.log('**** Thruways:\n'+JSON.stringify(this.thruways, undefined, 2));
    console.log('**** LaneRows:\n'+JSON.stringify(this.laneRows, undefined, 2));
  }
  return this;
}

N.UI.routeInfo.prototype.copyChildNetworks = function() {
  var childNetwork, yOffset, routeInfo;
  for(var i in this.network.networks) {
    childNetwork = this.network.networks[i];
    yOffset = childNetwork.y;
    routeInfo = childNetwork.routeInfo;

    // Copy, offset and insert the thruways.
    for(var j in routeInfo.thruways) {
      var thruway = routeInfo.thruways[j];

      // If we are starting a new  there is a thruway above then combine them.
      if(j === '0' && this.thruways.length > 0) {
        var thruPrev = this.thruways[this.thruways.length-1];
        thruPrev.yPos = thruway.yPos+yOffset;
        thruPrev.mid = 0.5*(thruPrev.yPos+thruPrev.yNeg);
      } else {
        var thruOffset = { yNeg: thruway.yNeg+yOffset, mid: thruway.mid+yOffset, yPos: thruway.yPos+yOffset };
        this.thruways.push(thruOffset);
      }
    }
  }

  //console.log("**** "+JSON.stringify(this.thruways, undefined, 2));

  // Do the above, but now for lane-rows and use the thruway info for offsets.
  var m = 0
  for(i in this.network.networks) {
    childNetwork = this.network.networks[i];
    yOffset = childNetwork.y;
    routeInfo = childNetwork.routeInfo;

    for(var k in routeInfo.laneRows) {
      var thruNeg = this.thruways[m];
      var thruPos = this.thruways[m+1];

      var laneRow = routeInfo.laneRows[k];
      var laneRowCopy = _.cloneDeep(laneRow);
      laneRowCopy.thruNeg = _.cloneDeep(thruNeg);
      laneRowCopy.thruPos = _.cloneDeep(thruPos);
      for(var l in laneRowCopy) {
        var lane = laneRowCopy[l];
        lane.yMid += yOffset;
        lane.thruNeg = _.cloneDeep(thruNeg);
        lane.thruPos = _.cloneDeep(thruPos);
      }

      this.laneRows.push(laneRowCopy);
      m++;
    }
  }
  //console.log("**** "+JSON.stringify(this.laneRows, undefined, 2));
}

N.UI.routeInfo.prototype.getNeuron = function(network, neuronName) {
  var parts = neuronName.split('>');
  var  n = N.fromPath(network, parts[0]);
  return n;
}

N.UI.routeInfo.prototype.getNeuronOutputPosition = function(network, neuronName) {
  var n = this.getNeuron(network, neuronName);
  var x = n.x+ n.network.x;
  var y = n.y+ n.network.y+n.radius;
  var lane = this.laneRows[n.row];

  return [ new N.UI.Vector(x, y), new N.UI.Vector(x, lane.thruPos.mid+n.network.y) ];
}

N.UI.routeInfo.prototype.getLaneCenter = function(rowIndex, laneIndex) {
  var lanes = this.laneRows[rowIndex];
  var lane = lanes[laneIndex];

  return new N.UI.Vector(lane.mid, lane.yMid);
}

N.UI.routeInfo.prototype.getPoint = function(rc) {
  var pos = [];
  var name, x, y, rx, ry, drop, n;
  if(rc.hasOwnProperty('src')) {
    name = rc.src.split('>')[0];
    n = this.network.neuronsByName[name];
    x = n.x;
    y = n.y+n.radius;
    drop = this.thruways[n.row+1].mid;
    pos.push({ x: x, y: y });
    this.processOffset(pos, rc);
  }
  else if(rc.hasOwnProperty('srcOffset')) {
    name = rc.srcOffset.split('>')[0];
    n = this.network.neuronsByName[name];
    x = n.x;
    y = n.y+n.radius;
    drop = this.thruways[n.row+1].mid;
    pos.push({ x: x, y: drop });
    this.processOffset(pos, rc);
  }
  else if(rc.hasOwnProperty('coord')) {
    var indices = rc.coord.split(' ');
    ry = this.thruways[indices[0]].mid;
    rx = this.laneRows[indices[1]][indices[2]].mid;
    pos.push({ x: rx, y: ry });
    this.processOffset(pos, rc);
  }

  if(rc.hasOwnProperty('sink')) {
    pos[0].join = true;
    name = rc.sink.split('>')[0];
    n = this.network.neuronsByName[name];
    x = n.x;
    y = n.y;
    var r = n.radius;
    var angle = N.rad(rc.angle);
    rx = r*Math.cos(angle);
    ry = r*Math.sin(angle);
    pos.push({ baseX: x+rx, baseY: y+ry, dX: rx, dY: ry  });
  }
  return pos;
}

/**
 * If the segment is offset (not centered in a thruway or lane then use this routine will offset the segment.
 * @method processOffset
 * @param {Array} pos An array of segment positions.
 * @param {Object} rc An object containing row, column, and offset components that define the desired segment end.
 */
N.UI.routeInfo.prototype.processOffset = function(pos, rc) {
  if(pos.length && rc.hasOwnProperty('offset')) {
    var offsetSize = 5.0;
    var offsets = rc.offset.split(' ');
    var dX = 0, dY = 0;
    for(var i=0; i<offsets.length; i += 2) {
      switch(offsets[i]) {
        case 'dX': dX += offsets[i+1]*offsetSize; break;
        case 'dY': dY += offsets[i+1]*offsetSize; break;
        default: break;
      }
    }
    for(var j=0; j<pos.length; j++) {
      pos[j].x += dX;
      pos[j].y += dY;
    }
  }
}

/**
 * Iterates through all the pi elements in a row and returns the greatest y value. In other words, returns the height of the circle most in the way.
 * @method maximumNeuronRowY
 * @param {Integer} index The neuron row index
 * @return {Real} Returns the y value of the row maximum
 * @protected
 */
N.UI.routeInfo.prototype.maximumNeuronRowY = function(index) {
  var row = this.network.rows[index];
  for(var i=0; i<row.cols.length; i++) {
    var name = row.cols[i].name;
    if(name && name.length) {
      var n = this.network.neuronsByName[name];
      return n.y+n.radius;
    }
  }
  return null;
}

/**
 * Iterates through all the pi elements in a row and returns the lowest y value. In other words, returns the height of the circle most in the way.
 * @method minimumNeuronRowY
 * @param {Integer} index The neuron row index
 * @return {Real} Returns the y value of the row minimum
 * @protected
 */
N.UI.routeInfo.prototype.minimumNeuronRowY = function(index) {
  var row = this.network.rows[index];
  for(var i=0; i<row.cols.length; i++) {
    var name = row.cols[i].name;
    if(name && name.length) {
      var n = this.network.neuronsByName[name];
      return n.y-n.radius;
    }
  }
  return null;
}