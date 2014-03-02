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
    $scope.Test = new N.PiNeuronTest();
    $scope.Test.CreateScenes();
    $scope.Scenes = $scope.Test.Scenes;
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
  this.Scenes  = [];
}

N.PiNeuronTest.prototype.CreateScenes = function() {
  for(var i=0; i<N.PiNeuronTest.TestConfigurations.length; i++) {
    var config = N.PiNeuronTest.TestConfigurations[i];
    var neuron = N.NewN(config.Neuron.ClassName);
    neuron.LoadFrom(config.Neuron);

    var scene = new N.UI.Scene.Neuron();
    scene.SetNeuron(neuron, config.Neuron.Display.Radius, { x:0, y:0});
    scene.Id = 'N.PiNeuronTest.'+(i+1);
    N.Objects.Add(scene);
    this.Scenes.push(scene.Id);
  }
}

N.PiNeuronTest.TestConfigurations = [{
    Name: 'Simple State Output',
    Neuron: {
      ClassName: 'N.Neuron',
      Compartments: [{
        ClassName: 'N.Comp.StateOutput',
        Name: 'StateOutput',
        ShortName: 'SO',
        Input: {
          ClassName: 'N.Comp.SignalInput',
          Signal: {
            ClassName: N.DiscreteSignal,
            DataArray: [{ t:0.0, v:0 }, { t:0.05, v:1 }, { t:0.10, v:0 }, { t:0.15, v:1 }, { t:0.20, v:0 }, { t:0.25, v:1 }]
          }
        }
      }],
      Display: {
        Template: 'N.UI.StandardNeuronTemplates.Pyramidal',
        Radius: 100
      }
    }
  },{
    Name: 'Spiny Stellate',
    Neuron: {
      ClassName: 'N.Neuron',
      Compartments: [{
        ClassName: 'N.Comp.Output',
        Name: 'Output',
        ShortName: 'OP'
      },{
        ClassName: 'N.Comp.Input',
        Name: 'Input',
        ShortName: 'IP'
      }],
      Display: {
        Template: 'N.UI.StandardNeuronTemplates.Stellate',
        Radius: 60
      }
    }
  },{
    Name: 'Inhibitory Interneuron',
    Neuron: {
      ClassName: 'N.Neuron',
      Compartments: [{
        ClassName: 'N.Comp.InhibitoryOutput',
        Name: 'InhibitoryOutput',
        ShortName: 'IOP'
      },{
        ClassName: 'N.Comp.Input',
        Name: 'Input',
        ShortName: 'IP'
      }],
      Display: {
        Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron',
        Radius: 40
      }
    }
  }];

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
  this._renderer.Configure(paper, neuronId);
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

