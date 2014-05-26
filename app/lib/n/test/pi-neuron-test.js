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
    this.Scenes.push(scene);
  }
}

N.PiNeuronTest.TestConfigurations = [{
    Neuron: {
      ClassName: 'N.Neuron',
      Compartments: [{
        ClassName: 'N.Comp.OutputFromSignal',
        Name: 'SO',
        Signal: {
          ClassName: 'N.DiscreteSignal',
          DataArray: [{ t:0.0, v:0 }, { t:0.05, v:1 }, { t:0.10, v:0 }, { t:0.15, v:1 }, { t:0.20, v:0 }, { t:0.25, v:1 }]
        }
      }],
      Display: {
        Template: 'N.UI.StandardNeuronTemplates.Pyramidal',
        Radius: 100
      }
    }
  },{
    Neuron: {
      ClassName: 'N.Neuron',
      Compartments: [{
        ClassName: 'N.Comp.Output',
        Name: 'OP'
      },{
        ClassName: 'N.Comp.LinearSummingInput',
        Name: 'IP'
      }],
      Display: {
        Template: 'N.UI.StandardNeuronTemplates.Stellate',
        Radius: 60
      }
    }
  },{
    Neuron: {
      ClassName: 'N.Neuron',
      Compartments: [{
        ClassName: 'N.Comp.InhibitoryOutput',
        Name: 'IOP'
      },{
        ClassName: 'N.Comp.LinearSummingInput',
        Name: 'IP'
      }],
      Display: {
        Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron',
        Radius: 40
      }
    }
  }];
