/**********************************************************************

File     : config.js
Project  : N Simulator Library
Purpose  : Source file for signal trace user interface objects.
Revisions: Original definition by Lawrence Gunn.
           2014/02/01

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/

'use strict';

var N = N || {};
N.UI = N.UI || {};

  //********
  //* N.UI *
  //********

N.UI.Categories = {
  Excitatory : {
    traceColor: '#294052'
  },
  Inhibitory : {
    traceColor: '#E21A09'
  },
  Default : {
    traceColor: '#000000'
  }
}

N.UI.svgAddClass = function(svg, className) {
  if(className) {
    var classes = svg.attr('class').split(' ');
    var str = _.union(classes, (_.isArray(className) ? className : [className])).join(' ');
    svg.attr( { 'class': str });
  }
}

N.UI.svgRemoveClass = function(svg, className) {
  if(className) {
    var classes = svg.attr('class').split(' ');
    _.pull(classes, className);
    var str = classes.join(' ');
    svg.attr( { 'class': str });
  }
}

N.UI.Padding = function() {
  var p0 = arguments[0];
  var p1 = arguments[1];
  if(arguments.length === 0) {
    this.p = [ 0, 0, 0, 0];
  } else if(arguments.length === 1) {
    this.p = [ p0, p0, p0, p0];
  } else if(arguments.length === 2) {
    this.p = [ p0, p1, p0, p1];
  } else if(arguments.length === 4) {
    var p2 = arguments[2];
    var p3 = arguments[3];
    this.p = [ p0, p1, p2, p3];
  }
}

N.UI.Padding.prototype.top         = function() { return this.p[0]; }
N.UI.Padding.prototype.right       = function() { return this.p[1]; }
N.UI.Padding.prototype.bottom      = function() { return this.p[2]; }
N.UI.Padding.prototype.left        = function() { return this.p[3]; }
N.UI.Padding.prototype.vertical    = function() { return this.p[0]+this.p[2]; }
N.UI.Padding.prototype.horizontal  = function() { return this.p[1]+this.p[3]; }
