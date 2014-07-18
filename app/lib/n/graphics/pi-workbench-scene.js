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
  this.GraphPadding = new N.UI.Padding(0, 0, Math.floor(0.5*this.CentralPadding), 0);
}

/**
 *
 * @method Layout
 * @param network {Object} The N.Network object to be displayed in the scene.
 * @param scalePixelsPerUnit {
 * @param position
 */
N.UI.WorkbenchScene.prototype.Layout = function(workbench, renderMappings) {
  this.NetworkScene = (new N.UI.NetworkScene()).Layout(workbench.Network, renderMappings);
  this.SignalGraphScene = (new N.UI.SignalGraphScene());

  var traceStyle = { Inputs: 'workbench-inputs', Targets: 'workbench-targets', Outputs: 'workbench-outputs' };

  for(var i in workbench.Network.Networks) {
    var network = workbench.Network.Networks[i];
    console.log('*** Network name '+network.Name);
    for(var j in network.Neurons) {
      var neuron = network.Neurons[j];
      console.log('  *** Neuron '+neuron.Name);
      for(var k in neuron.Compartments) {
        var compartment = neuron.Compartments[k];
        console.log('    *** Compartment '+compartment.Name);
        for(var m in compartment.IoMetaData.Signals) {
          var signalData = compartment.IoMetaData.Signals[m];
          this.SignalGraphScene.AddTraceFromSource(compartment, signalData.PropName);
        }
      }
    }
  }
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
  this.NetworkScene.ScaleToFitWidth(w/2, this.NetworkPadding);
  this.IdealContainerWidth = w;
  this.IdealContainerHeight = this.NetworkScene.IdealContainerHeight+padding.Vertical();
  this.NetworkScene.Network.X = padding.Left();
  this.NetworkScene.Network.Y = padding.Top();

}

N.UI.WorkbenchScene.prototype.Render = function(svgParent, size, padding) {
  debugger;
  this.Width = size.Width;
  this.Height = size.Height;
  this.Padding = padding;

  var networkWidth = this.NetworkScene.Network.Width-this.NetworkPadding.Horizontal();
  var graphWidth = this.Width-networkWidth;

  this.Group = svgParent.group().move(this.X, this.Y).attr({ 'class': 'pi-workbench-scene' });
  this.NetworkScene.Render(this.Group);
  this.SignalGraphScene.Render(this.Group, { Width: this.Width, Height: this.Height }, this.GraphPadding);
}

N.UI.WorkbenchScene.prototype.Fit = function(svgParent) {
  debugger;
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
