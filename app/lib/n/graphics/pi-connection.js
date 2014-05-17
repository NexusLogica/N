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
  'Excitatory' : 'pi-excitatory-connection',
  'Spine'      : 'pi-spine-connection',
  'Inhibitory' : 'pi-inhibitory-connection',
  'GapJunction': 'pi-gap-junction-connection',
  'Electrode'  : 'pi-electrode-connection'
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
  var scale = 1.0;
  var center, w2, h2, centerDist, pathString, gap = 1.50;
  var c = endInfo.EndNeuronCenter;
  var o = endInfo.EndNeuronOuter;
  var angle = Math.atan2(o.Y-c.Y, o.X-c.X);

  if(this.Connection.Category === 'Spine') {
    w2 = 2.25*scale;
    h2 = 1.5*scale;
    centerDist = c.Distance(o)+h2+w2+gap;
    pathString = 'M'+c.X+' '+c.Y+
        'm'+centerDist+' 0'+
        'm'+h2+' '+w2+
        'a'+w2+' '+w2+' 0 1 0 0 -'+(2*w2)+
        'l-'+(2*h2)+' 0'+
        'a'+w2+' '+w2+' 0 1 0 0 '+(2*w2)+
        'l'+(2*h2)+' 0';
    svgGroup.path(pathString).rotate(N.Deg(angle), c.X, c.Y).attr( { class: 'pi-connection-end '+N.UI.PiConnectionClasses[this.Connection.Category] } );
  }
  else if(this.Connection.Category === 'Electrode') {
    w2 = 2.25*scale;
    h2 = 6*scale;
    centerDist = c.Distance(o)+gap;
    pathString = 'M'+c.X+' '+c.Y+
        'm'+centerDist+' 0'+
        'l'+h2+' '+w2+
        'l0 -'+(2*w2)+
        'l-'+h2+' '+w2;
    svgGroup.path(pathString).rotate(N.Deg(angle), c.X, c.Y).attr( { class: 'pi-connection-end '+N.UI.PiConnectionClasses[this.Connection.Category] } );
  }
  else {
    var r = 3.0*scale;
    center = o.Shorten(c, -r-gap).Offset(-r, -r);
    svgGroup.circle(2*r).move(center.X, center.Y).attr( { class: 'pi-connection-end '+N.UI.PiConnectionClasses[this.Connection.Category] } );
  }

}
