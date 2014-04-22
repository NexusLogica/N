/**********************************************************************

File     : pi-route-manager.js
Project  : N Simulator Library
Purpose  : Source file for managing the layout of sets of connection routes.
Revisions: Original definition by Lawrence Gunn.
           2014/04/19

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //***********************
  //* N.UI.PiRouteManager *
  //***********************

N.UI.PiRouteManager = function(network) {
  this.Network = network;
  this.Connections = [];
  this.CrowdedLanes = [];
}

N.UI.PiRouteManager.prototype.AddConnections = function(connections) {
  if(_.isArray(connections)) {
    this.Connections = this.Connections.concat(connections);
  } else {
    this.Connections.push(connections);
  }
}

N.UI.PiRouteManager.prototype.Render = function(name) {
  if(_.isEmpty(name)) { name = 'route'; }

  var svgGroup = this.Network.Group.group();

  this.RouteFinders = [];
  for(var i in this.Connections) {
    var routeFinder = new N.UI.PiRouteFinder(this.Network);
    routeFinder.FindRoute(this.Connections[i], this.Network.RouteInfo, this);
    this.RouteFinders.push(routeFinder);
  }

  this.UncrowdRoutes();

  for(var j in this.RouteFinders) {
    var pathString = this.RouteFinders[j].GetPath(this.Network.RouteInfo);
    svgGroup.path(pathString).attr({ 'fill': 'none', 'stroke-linejoin': 'round', class: 'pi-connection simple-excitatory-connection' });
  }

  this.Network.AddConnectionDisplay(name, svgGroup);
}

N.UI.PiRouteManager.prototype.AddLaneSegment = function(finder, neuronRowIndex, laneIndex) {
  if(!this.CrowdedLanes[neuronRowIndex]) { this.CrowdedLanes[neuronRowIndex] = []; }
  if(!this.CrowdedLanes[neuronRowIndex][laneIndex]) { this.CrowdedLanes[neuronRowIndex][laneIndex] = []; }
  this.CrowdedLanes[neuronRowIndex][laneIndex].push(finder);
}

N.UI.PiRouteManager.prototype.UncrowdRoutes = function() {
  for(var i in this.CrowdedLanes) {
    for(var j in this.CrowdedLanes[i]) {
      var lane = this.CrowdedLanes[i][j];
      if(lane.length > 0) {
        console.log('*** Lane['+i+']['+j+'] = '+lane.length);
      }
    }
  }
}
