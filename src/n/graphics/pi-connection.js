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
};

  //*********************
  //* N.UI.PiConnection *
  //*********************

N.UI.PiConnection = function(piNetwork, connection) {
  this.piNetwork = piNetwork;    // The parent PiNetwork.
  this.connection = connection;  // The N.Connection object.
};

N.UI.PiConnection.prototype.setPath = function(path) {
  this.pathMetadata = path;
};

N.UI.PiConnection.prototype.createPath = function(svgGroup, pathString) {
  this.path = svgGroup.path(pathString)
    .attr({
      'fill': 'none',
      'stroke-linejoin': 'round',
      class: 'pi-connection '+N.UI.PiConnectionClasses[this.connection.category] });
};

N.UI.PiConnection.prototype.render = function(svgGroup) {
  var s = this.piNetwork.scale;
  var pt = this.pathMetadata.points;
  var st = this.pathMetadata.start;
  var end = this.pathMetadata.end;
  //: {
  //  component: event.compartment.name,
  //    center: {x: n.x / s, y: n.y / s},
  //  radius: n.radius / s
  //},
  var dx = pt[0].pos.x-st.center.x;
  var dy = pt[0].pos.y-st.center.y;
  var xy = Math.sqrt(dx*dx+dy*dy);
  var cosX = dx/xy;
  var sinY = dy/xy;
  console.log(this.pathMetadata);
  var pathString = 'M'+st.center.x*s+' '+st.center.y*s+'m'+cosX*st.radius*s+' '+sinY*st.radius*s+'L'+pt[0].pos.x*s+' '+pt[0].pos.y*s;

  for(var i=1; i<pt.length; i++) {
    pathString += 'L'+pt[i].pos.x*s+' '+pt[i].pos.y*s;
  }

  var iEnd = pt.length-1;
  var edx = pt[iEnd].pos.x-end.center.x;
  var edy = pt[iEnd].pos.y-end.center.y;
  var exy = Math.sqrt(edx*edx+edy*edy);
  var ecosX = edx/exy;
  var esinY = edy/exy;
  var ed = end.radius-exy;

  debugger;
  pathString += 'l'+ed*ecosX*s+' '+ed*esinY*s;

  this.path = svgGroup.path(pathString)
    .attr({
      'fill': 'none',
      'stroke-linejoin': 'round',
      class: 'pi-connection '+N.UI.PiConnectionClasses[this.connection.category] });
};

N.UI.PiConnection.prototype.createEnd = function(svgGroup, endInfo) {
  var scale = 1.0;
  var center, w2, h2, centerDist, pathString, gap = 1.50;
  var c = endInfo.endNeuronCenter;
  var o = endInfo.endNeuronOuter;
  var angle = Math.atan2(o.y-c.y, o.x-c.x);

  if(this.connection.category === 'Spine') {
    w2 = 2.25*scale;
    h2 = 1.5*scale;
    centerDist = c.distance(o)+h2+w2+gap;
    pathString = 'M'+c.x+' '+c.y+
        'm'+centerDist+' 0'+
        'm'+h2+' '+w2+
        'a'+w2+' '+w2+' 0 1 0 0 -'+(2*w2)+
        'l-'+(2*h2)+' 0'+
        'a'+w2+' '+w2+' 0 1 0 0 '+(2*w2)+
        'l'+(2*h2)+' 0';
    svgGroup.path(pathString).rotate(N.deg(angle), c.x, c.y).attr( { class: 'pi-connection-end '+N.UI.PiConnectionClasses[this.connection.category] } );
  }
  else if(this.connection.category === 'GapJunction') {
    var w = 9.0*scale;
    var h = 2.0*scale;
    var cornerDist = c.distance(o)+gap+0.5;
    pathString = 'M'+c.x+' '+c.y+
        'm'+cornerDist+' '+(0.5*w)+
        'l'+h+' 0'+
        'l0 -'+w+
        'l-'+h+' 0'+
        'l0 '+w;
    svgGroup.path(pathString).rotate(N.deg(angle), c.x, c.y).attr( { class: 'pi-connection-end '+N.UI.PiConnectionClasses[this.connection.category] } );
  }
  else if(this.connection.category === 'Electrode') {
    w2 = 2.25*scale;
    h2 = 6*scale;
    centerDist = c.distance(o)+gap;
    pathString = 'M'+c.x+' '+c.y+
        'm'+centerDist+' 0'+
        'l'+h2+' '+w2+
        'l0 -'+(2*w2)+
        'l-'+h2+' '+w2;
    svgGroup.path(pathString).rotate(N.deg(angle), c.x, c.y).attr( { class: 'pi-connection-end '+N.UI.PiConnectionClasses[this.connection.category] } );
  }
  else {
    var r = 3.0*scale;
    center = o.shorten(c, -r-gap).offset(-r, -r);
    svgGroup.circle(2*r).move(center.x, center.y).attr( { class: 'pi-connection-end '+N.UI.PiConnectionClasses[this.connection.category] } );
  }
};
