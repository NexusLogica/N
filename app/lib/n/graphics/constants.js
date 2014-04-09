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
  var classes = svg.attr('class').split(' ');
  var str = _.union(classes, [className]).join(' ');
  svg.attr( { 'class': str });
}

N.UI.SvgRemoveClass = function(svg, className) {
  var classes = svg.attr('class').split(' ');
  _.pull(classes, className);
  var str = classes.join(' ');
  svg.attr( { 'class': str });
}