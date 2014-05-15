/**********************************************************************

File     : pi-connection.js
Project  : N Simulator Library
Purpose  : Source file for a graphic connection path.
Revisions: Original definition by Lawrence Gunn.
           2014/05/13

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

N.UI.PiConnectionClasses = {
  'Excitatory':  'pi-excitatory-connection',
  'Spine':       'pi-spine-connection',
  'Inhibitory':  'pi-inhibitory-connection',
  'GapJunction': 'pi-gap-junction-connection'
}

  //*********************
  //* N.UI.PiConnection *
  //*********************

N.UI.PiConnection = function(connection) {
  this.Connection = connection;
}

N.UI.PiConnection.prototype.SetPath = function(path) {
  this.Path = path;
}

N.UI.PiConnection.prototype.CreatePath = function(svgGroup, pathString) {
  this.Path = svgGroup.path(pathString)
    .attr({
      'fill': 'none',
      'stroke-linejoin': 'round',
      class: 'pi-connection '+N.UI.PiConnectionClasses[this.Connection.Category] });
}

N.UI.PiConnection.prototype.CreateEnd = function(svgGroup, endInfo) {
  var r = 4.0;
  var o = endInfo.EndNeuronOuter;
  var center = o.Shorten(endInfo.EndNeuronCenter, -r-1.50).Offset(-r, -r);
//  var dir = new N.UI.Vector(c, o).Shorten(-r);
//  var center = dir.Offset(dir.X-r, dir.Y-r);
//  var center = o.Clone().Offset(-r, -r);

//  if(this.Connection.Category === 'Excitatory' || this.Connection.Category === 'Inhibitory') {
    svgGroup.circle(2*r).move(center.X, center.Y).attr( { class: 'pi-connection-end '+N.UI.PiConnectionClasses[this.Connection.Category] } );
//  }
}
