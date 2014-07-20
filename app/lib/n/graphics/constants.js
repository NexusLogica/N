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
    TraceColor: '#294052'
  },
  Inhibitory : {
    TraceColor: '#E21A09'
  },
  Default : {
    TraceColor: '#000000'
  }
}

N.UI.SvgAddClass = function(svg, className) {
  if(className) {
    var classes = svg.attr('class').split(' ');
    var str = _.union(classes, (_.isArray(className) ? className : [className])).join(' ');
    svg.attr( { 'class': str });
  }
}

N.UI.SvgRemoveClass = function(svg, className) {
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
    this.P = [ 0, 0, 0, 0];
  } else if(arguments.length === 1) {
    this.P = [ p0, p0, p0, p0];
  } else if(arguments.length === 2) {
    this.P = [ p0, p1, p0, p1];
  } else if(arguments.length === 4) {
    var p2 = arguments[2];
    var p3 = arguments[3];
    this.P = [ p0, p1, p2, p3];
  }
}

N.UI.Padding.prototype.Top         = function() { return this.P[0]; }
N.UI.Padding.prototype.Right       = function() { return this.P[1]; }
N.UI.Padding.prototype.Bottom      = function() { return this.P[2]; }
N.UI.Padding.prototype.Left        = function() { return this.P[3]; }
N.UI.Padding.prototype.Vertical    = function() { return this.P[0]+this.P[2]; }
N.UI.Padding.prototype.Horizontal  = function() { return this.P[1]+this.P[3]; }
