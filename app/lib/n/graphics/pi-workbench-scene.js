/**********************************************************************

File     : pi-workbench-scene.js
Project  : N Simulator Library
Purpose  : Source file for scenes.
Revisions: Original definition by Lawrence Gunn.
           2014/02/24

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //***********************
  //* N.UI.WorkbenchScene *
  //***********************

/**
 * This is the scene handler for network scenes.
 * @class UI.WorkbenchScene
 * @constructor
 */

N.UI.WorkbenchScene = function() {
  this.className = 'N.UI.WorkbenchScene';
  this.network = null;
  this.neurons = {};
  this.origin = 'center';
  this.scale = 100;
  this.centralPadding = 20;
  this.x = 0;
  this.y = 0;
  this.networkPadding = new N.UI.padding(0, Math.ceil(0.5*this.centralPadding), 0, 0);
  this.graphPadding = new N.UI.padding(0, 0, 0, Math.floor(0.5*this.centralPadding));
}

/**
 *
 * @method Layout
 * @param network {Object} The N.Network object to be displayed in the scene.
 * @param scalePixelsPerUnit {
 * @param position
 */
N.UI.WorkbenchScene.prototype.Layout = function(workbench, renderMappings) {
  this.workbench = workbench;
  this.networkScene = (new N.UI.NetworkScene()).layout(workbench.network, renderMappings);
  this.signalGraphScene = (new N.UI.SignalGraphScene());

  var traceStyle = { inputs: 'workbench-inputs', targets: 'workbench-targets', outputs: 'workbench-outputs' };

  for(var i in workbench.network.networks) {
    var network = workbench.network.networks[i];
    for(var j in network.neurons) {
      var neuron = network.neurons[j];
      for(var k in neuron.compartments) {
        var compartment = neuron.compartments[k];
        for(var m in compartment.ioMetaData.signals) {

          var signalData = compartment.ioMetaData.signals[m];
          var sourcePropName =( compartment.hasOwnProperty('signal') ? 'signal' : 'outputStore');
          var id = compartment.neuron.name+'//'+compartment.name+'//'+signalData.name;

          this.signalGraphScene.addTraceFromSource(id, compartment, sourcePropName);
          console.log('*** Trace = '+id);
        }
      }
    }
  }
}

N.UI.WorkbenchScene.prototype.showTest = function(test) {
  this.activeTest = test;
  this.testUpdated();
}

N.UI.WorkbenchScene.prototype.testUpdated = function() {
console.log('GRAPHS UPDATING');
  this.signalGraphScene.signalGraph.updateAll();
/*
  var unusedTraceIds = _.pluck(this.signalGraphScene.signalGraph.traces, 'id');
  var removeId = '';
  var remove = function(id) { return id === removeId; }

  for(var i in this.activeTest.inputSignals) {
    var inputSignal = this.activeTest.inputSignals[i];
    //this.network;
    console.log(inputSignal.connection);
    removeId = inputSignal.traceId;
    var other = _.remove(unusedTraceIds, remove);
    var signal = this.signalGraphScene.getTraceFromId(inputSignal.traceId);
    inputSignal.builder.buildSignal(signal.signalGraphic.signal, this.activeTest.duration);
    signal.signalGraphic.update();
  }

  var zeroData = [ {t: 0, v: 0}, {t: this.activeTest.duration, v: 0} ];
  for(var j in unusedTraceIds) {
    var unusedId = unusedTraceIds[j];
    if(unusedId.indexOf('SRC') === 0) {
      var unusedSignal = this.signalGraphScene.getTraceFromId(unusedId);
      unusedSignal.signalGraphic.signal.appendDataArray(zeroData);
      unusedSignal.signalGraphic.update();
    }
  }
*/
}

N.UI.WorkbenchScene.prototype.runActiveTest = function() {
  this.workbench.runTest(this.activeTest);
}

N.UI.WorkbenchScene.prototype.runTest = function(test) {
  this.workbench.runTest(test);
}

/**
 * Calculates the scale that will fit the network to a given width.
 * @method ScaleToFitWidth
 * @param width
 * @param paddingHoriz
 * @param paddingVert
 */
N.UI.WorkbenchScene.prototype.scaleToFitWidth = function(width, padding) {
  var w = width-padding.horizontal();
  this.networkScene.scaleToFitWidth(0.5*(w-this.centralPadding), this.networkPadding);
  this.idealContainerWidth = w;
  this.idealContainerHeight = Math.ceil(this.networkScene.idealContainerHeight+padding.vertical());
  this.networkScene.network.x = padding.left();
  this.networkScene.network.y = padding.top();

}

N.UI.WorkbenchScene.prototype.render = function(svgParent, size, padding) {
  this.width = size.width;
  this.height = size.height;
  this.padding = padding;

  this.group = svgParent.group().move(this.x, this.y).attr({ 'class': 'pi-workbench-scene' });
  this.networkScene.render(this.group);

  var networkWidth = this.networkScene.network.width+this.networkPadding.horizontal();
  var graphWidth = this.width-this.padding.horizontal()-networkWidth-this.graphPadding.horizontal();
  this.signalGraphScene.x = networkWidth+this.graphPadding.left()+this.padding.left();
  this.signalGraphScene.y = this.padding.top();
  this.signalGraphScene.render(this.group, { width: graphWidth, height: this.height-this.padding.vertical() }, this.graphPadding);
}

N.UI.WorkbenchScene.prototype.fit = function(svgParent) {
  var svgWidth = $(svgParent.node).parent().width();
  var svgHeight = $(svgParent.node).parent().height();
  var aspectRatioSvg = svgWidth/svgHeight;
  var aspectRatioNetwork = this.network.width/this.network.height;
  if(aspectRatioNetwork > aspectRatioSvg) {
    return 0.9*svgWidth/this.network.width;
  }
  else {
    return 0.9*svgHeight/this.network.height;
  }
}
