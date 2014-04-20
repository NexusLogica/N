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
    routeFinder.FindRoute(this.Connections[i], this.Network.RouteInfo);
    this.RouteFinders.push(routeFinder);
  }

  for(var j in this.RouteFinders) {
    var pathString = this.RouteFinders[j].GetPath(this.Network.RouteInfo);
    svgGroup.path(pathString).attr({ 'fill': 'none', 'stroke-linejoin': 'round', class: 'pi-connection simple-excitatory-connection' });
  }

  this.Network.AddConnectionDisplay(name, svgGroup);
}

