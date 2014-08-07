/**********************************************************************

File     : pi-signal-trace.js
Project  : N Simulator Library
Purpose  : Source file for signal trace user interface objects.
Revisions: Original definition by Lawrence Gunn.
           2014/01/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //********************
  //* N.UI.SignalGraph *
  //********************

N.UI.SignalGraph = function() {
  this.NeedsRecalc = true;
  this.TimeAtOrigin = 0.0;
  this.YAtOrigin = 0.0;
  this.X = 0;
  this.Y = 0;
  this.Width = 100;
  this.Height = 100;

  this.Traces = [];
  this.TracesById = {};
}

N.UI.SignalGraph.prototype.AddTraceFromSource = function(id, source, propName, additionalClasses) {
  this.TracesById[id] = { id: id, Source: source, PropName: propName, AdditionalClasses: additionalClasses };
  this.Traces.push(this.TracesById[id]);
}

N.UI.SignalGraph.prototype.AddTrace = function(signal) {
  this.Traces.push({ Signal: signal});
}

N.UI.SignalGraph.prototype.Render = function(svgParent, size, padding) {
  this.SvgParent = svgParent;
  this.Padding = padding;
  this.Width = size.Width;
  this.Height = size.Height;

  this.Group = this.SvgParent.group().size(this.Width, this.Height).attr({ 'class': 'pi-signal-graph' });

  this.Group.rect(this.Width-this.Padding.Horizontal(), this.Height-this.Padding.Vertical()).move(this.Padding.Left(), this.Padding.Top()).attr({ 'class': 'graph-background'});

  if(this.Traces.length === 0) {
    this.RenderEmptyGraph();
    return;
  }

  var h = Math.floor((this.Height-this.Padding.Vertical())/this.Traces.length);
  var w = this.Width-this.Padding.Horizontal();

  // Add traces
  var yOffset = 0;
  for(var i in this.Traces) {
    var trace = this.Traces[i];
    trace.SignalGraphic = (new N.UI.SignalTrace()).
        AddClasses([ (i % 2 ? 'even' : 'odd') ]).
        SetSignal({ Source: trace.Source, PropName: trace.PropName }).
        Render(this.Group, { X: 0, Y: yOffset, Width: w, Height: h }, new N.UI.Padding(0, 0));
    if(trace.AdditionalClasses) {
      trace.SignalGraphic.AddClasses(trace.AdditionalClasses);
    }
    yOffset += h;
  }
}

