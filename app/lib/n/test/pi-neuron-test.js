'use strict';
/**********************************************************************

File     : pi-neuron-test.js
Project  : N Simulator Library
Purpose  : Source file for signal testing.
Revisions: Original definition by Lawrence Gunn.
           2014/02/19

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.Test = N.Test || {};

  //**************************
  //* PiNeuronTestController *
  //**************************

var nSimAppControllers = angular.module('nSimApp.controllers');

nSimAppControllers.controller('PiNeuronTestController', ['$scope',
  function PiNeuronTestController($scope) {
  }
]);

nSimAppControllers.controller('PiNeuronTestItemController', ['$scope',
  function PiNeuronTestItemController($scope) {
  }
]);

  //******************
  //* N.PiNeuronTest *
  //******************

N.PiNeuronTest = function() {
  this.Neurons = [];
}

N.PiNeuronTest.prototype.CreateNeurons = function() {
  for(var i=0; i<N.PiNeuronTest.TestConfigurations.length; i++) {
    var config = N.PiNeuronTest.TestConfigurations[i];
    var neuron = N.CreateInstance(
  }
}

N.PiNeuronTest.TestConfigurations = [{
    Name: 'State Output test',
    Neuron: {
      ClassName: 'N.NeuronFactory.StateOutput',
      SignalInput : {
        ClassName: N.AnalogSignal,
        Data: {}
      }
    }
  }
];

  //*******************************
  //* N.Test.PiNeuronTestRenderer *
  //*******************************

N.Test.PiNeuronTestRenderer = function() {
}

N.Test.PiNeuronTestRenderer.prototype.Configure = function(paper, neuronId) {
  this._paper = paper;
  this._w = this._paper.canvas.offsetWidth;
  this._h = this._paper.canvas.offsetHeight;
  this._renderer = new N.UI.PiNeuronRenderer();
  this._renderer.Configure(paper, signalId);
  this._padding = 15;
  this._box = { x: this._padding, y: this._padding, width: (this._w-2*this._padding), height: (this._h-2*this._padding) };
  this._renderer.SetCanvasBoundary(this._box);
}

N.Test.PiNeuronTestRenderer.prototype.Render = function() {
  this._backgroundRect = this._paper.rect(this._box.x, this._box.y, this._box.width, this._box.height).attr({ 'fill': '#FCF8F2', 'stroke-width': 0});
  this._traceRenderer.Render();
}

N.Test.PiNeuronTestRenderer.prototype.SetScale = function(min, max) {
  this._traceRenderer.SetScale(min, max);
}

