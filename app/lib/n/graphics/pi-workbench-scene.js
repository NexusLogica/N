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
  this.ClassName = 'N.UI.WorkbenchScene';
  this.Network = null;
  this.Neurons = {};
  this.Origin = 'center';
  this.Scale = 100;
  this.CentralPadding = 20;
  this.X = 0;
  this.Y = 0;
  this.NetworkPadding = new N.UI.Padding(0, Math.ceil(0.5*this.CentralPadding), 0, 0);
  this.GraphPadding = new N.UI.Padding(0, 0, 0, Math.floor(0.5*this.CentralPadding));
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
  this.NetworkScene = (new N.UI.NetworkScene()).Layout(workbench.Network, renderMappings);
  this.signalGraphScene = (new N.UI.SignalGraphScene());

  var traceStyle = { Inputs: 'workbench-inputs', Targets: 'workbench-targets', Outputs: 'workbench-outputs' };

  for(var i in workbench.Network.Networks) {
    var network = workbench.Network.Networks[i];
    for(var j in network.Neurons) {
      var neuron = network.Neurons[j];
      for(var k in neuron.Compartments) {
        var compartment = neuron.Compartments[k];
        for(var m in compartment.IoMetaData.Signals) {

          var signalData = compartment.IoMetaData.Signals[m];
          var sourcePropName =( compartment.hasOwnProperty('Signal') ? 'Signal' : 'OutputStore');
          var id = compartment.Neuron.Name+'//'+compartment.Name+'//'+signalData.Name;

          this.signalGraphScene.AddTraceFromSource(id, compartment, sourcePropName);
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
  this.signalGraphScene.signalGraph.updateAll();
/*
  var unusedTraceIds = _.pluck(this.signalGraphScene.signalGraph.Traces, 'id');
  var removeId = '';
  var remove = function(id) { return id === removeId; }

  for(var i in this.activeTest.inputSignals) {
    var inputSignal = this.activeTest.inputSignals[i];
    //this.Network;
    console.log(inputSignal.connection);
    removeId = inputSignal.traceId;
    var other = _.remove(unusedTraceIds, remove);
    var signal = this.signalGraphScene.GetTraceFromId(inputSignal.traceId);
    inputSignal.builder.buildSignal(signal.signalGraphic.Signal, this.activeTest.duration);
    signal.signalGraphic.Update();
  }

  var zeroData = [ {t: 0, v: 0}, {t: this.activeTest.duration, v: 0} ];
  for(var j in unusedTraceIds) {
    var unusedId = unusedTraceIds[j];
    if(unusedId.indexOf('SRC') === 0) {
      var unusedSignal = this.signalGraphScene.GetTraceFromId(unusedId);
      unusedSignal.SignalGraphic.Signal.appendDataArray(zeroData);
      unusedSignal.SignalGraphic.Update();
    }
  }
*/
}

N.UI.WorkbenchScene.prototype.runActiveTest = function() {
  this.workbench.runTest(this.activeTest);
}

/**
 * Calculates the scale that will fit the network to a given width.
 * @method ScaleToFitWidth
 * @param width
 * @param paddingHoriz
 * @param paddingVert
 */
N.UI.WorkbenchScene.prototype.ScaleToFitWidth = function(width, padding) {
  var w = width-padding.Horizontal();
  this.NetworkScene.ScaleToFitWidth(0.5*(w-this.CentralPadding), this.NetworkPadding);
  this.IdealContainerWidth = w;
  this.IdealContainerHeight = Math.ceil(this.NetworkScene.IdealContainerHeight+padding.Vertical());
  this.NetworkScene.Network.X = padding.Left();
  this.NetworkScene.Network.Y = padding.Top();

}

N.UI.WorkbenchScene.prototype.Render = function(svgParent, size, padding) {
  this.Width = size.Width;
  this.Height = size.Height;
  this.Padding = padding;

  this.Group = svgParent.group().move(this.X, this.Y).attr({ 'class': 'pi-workbench-scene' });
  this.NetworkScene.Render(this.Group);

  var networkWidth = this.NetworkScene.Network.Width+this.NetworkPadding.Horizontal();
  var graphWidth = this.Width-this.Padding.Horizontal()-networkWidth-this.GraphPadding.Horizontal();
  this.signalGraphScene.X = networkWidth+this.GraphPadding.Left()+this.Padding.Left();
  this.signalGraphScene.Y = this.Padding.Top();
  this.signalGraphScene.Render(this.Group, { Width: graphWidth, Height: this.Height-this.Padding.Vertical() }, this.GraphPadding);
}

N.UI.WorkbenchScene.prototype.Fit = function(svgParent) {
  var svgWidth = $(svgParent.node).parent().width();
  var svgHeight = $(svgParent.node).parent().height();
  var aspectRatioSvg = svgWidth/svgHeight;
  var aspectRatioNetwork = this.Network.Width/this.Network.Height;
  if(aspectRatioNetwork > aspectRatioSvg) {
    return 0.9*svgWidth/this.Network.Width;
  }
  else {
    return 0.9*svgHeight/this.Network.Height;
  }
}
