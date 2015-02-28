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
N.test = N.test || {};

  //**************************
  //* PiNeuronTestController *
  //**************************

angular.module('nSimulationApp').controller('PiNeuronTestController', ['$scope',
  function PiNeuronTestController($scope) {
    $scope.test = new N.PiNeuronTest();
    $scope.test.createScenes();
    $scope.scenes = $scope.test.scenes;
  }
]);

angular.module('nSimulationApp').controller('PiNeuronTestItemController', ['$scope',
  function PiNeuronTestItemController($scope) {
  }
]);

  //******************
  //* N.PiNeuronTest *
  //******************

N.PiNeuronTest = function() {
  this.scenes  = [];
};

N.PiNeuronTest.prototype.createScenes = function() {

  for(var i=0; i<N.PiNeuronTest.testConfigurations.length; i++) {
    var config = N.PiNeuronTest.testConfigurations[i];
    var neuron = (new N.Neuron()).loadFrom(config.neuron);

    var scene = new N.UI.NeuronScene();
    scene.setNeuron(neuron, config.neuron.display.template);
    this.scenes.push(scene);
  }
};

N.PiNeuronTest.testConfigurations = [{
    neuron: {
      className: 'N.Neuron',
      compartments: [{
        className: 'N.Comp.OutputFromSignal',
        name: 'SO',
        signal: {
          className: 'N.DiscreteSignal',
          dataArray: [{ t:0.0, v:0 }, { t:0.05, v:1 }, { t:0.10, v:0 }, { t:0.15, v:1 }, { t:0.20, v:0 }, { t:0.25, v:1 }]
        }
      }],
      display: {
        template: 'N.UI.StandardNeuronTemplates.Pyramidal',
        radius: 100
      }
    }
  },{
    neuron: {
      className: 'N.Neuron',
      compartments: [{
        className: 'N.Comp.Output',
        name: 'OP'
      },{
        className: 'N.Comp.LinearSummingInput',
        name: 'IP'
      }],
      display: {
        template: 'N.UI.StandardNeuronTemplates.Stellate',
        radius: 60
      }
    }
  },{
    neuron: {
      className: 'N.Neuron',
      compartments: [{
        className: 'N.Comp.InhibitoryOutput',
        name: 'IOP'
      },{
        className: 'N.Comp.LinearSummingInput',
        name: 'IP'
      }],
      display: {
        template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron',
        radius: 40
      }
    }
  }];
