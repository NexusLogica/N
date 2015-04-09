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
  this.needsRecalc = true;
  this.timeAtOrigin = 0.0;
  this.yAtOrigin = 0.0;
  this.x = 0;
  this.y = 0;
  this.width = 100;
  this.height = 100;

  this.traces = [];
  this.tracesById = {};
};

N.UI.SignalGraph.prototype.addTraceFromSource = function(id, source, propName, additionalClasses) {
  this.tracesById[id] = { id: id, source: source, propName: propName, additionalClasses: additionalClasses };
  this.traces.push(this.tracesById[id]);
};

N.UI.SignalGraph.prototype.addTrace = function(signal) {
  this.traces.push({ signal: signal});
};

N.UI.SignalGraph.prototype.render = function(svgParent, size, padding) {
  this.svgParent = svgParent;
  this.padding = padding;
  this.width = size.width;
  this.height = size.height;

  this.group = this.svgParent.group().size(this.width, this.height).attr({ 'class': 'pi-signal-graph' });

  this.group.rect(this.width-this.padding.horizontal(), this.height-this.padding.vertical()).move(this.padding.left(), this.padding.top()).attr({ 'class': 'graph-background'});

  if(this.traces.length === 0) {
    this.renderEmptyGraph();
    return;
  }

  var h = Math.floor((this.height-this.padding.vertical())/this.traces.length);
  var w = this.width-this.padding.horizontal();

  // Add traces
  var yOffset = 0;
  for(var i in this.traces) {
    var trace = this.traces[i];

    trace.signalGraphic = new N.UI.SignalTrace();
    trace.signalGraphic.addClasses([ (i % 2 ? 'even' : 'odd') ]);

    // Pass in the signal, or the structure to find the signal.
    trace.signalGraphic.setSignal(trace.source ? { source: trace.source, propName: trace.propName } : trace.signal);
    trace.signalGraphic.render(this.group, { x: 0, y: yOffset, width: w, height: h }, new N.UI.Padding(0, 0));

    if(trace.additionalClasses) {
      trace.signalGraphic.addClasses(trace.additionalClasses);
    }
    yOffset += h;
  }
};

N.UI.SignalGraph.prototype.updateAll = function() {
  for(var i in this.traces) {
    var trace = this.traces[i];
    trace.signalGraphic.update();
  }
};
