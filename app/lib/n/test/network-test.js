/**********************************************************************

File     : pi-network-test.js
Project  : N Simulator Library
Purpose  : Source file for network graphics testing.
Revisions: Original definition by Lawrence Gunn.
           2014/03/02

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.Test = N.Test || {};

  //*************************
  //* NetworkTestController *
  //*************************

var nSimAppControllers = angular.module('nSimApp.controllers');

nSimAppControllers.controller('NetworkTestController', ['$scope',
  function NetworkTestController($scope) {
    $scope.Test = new N.NetworkTest();
    $scope.Test.CreateScenes();
    $scope.Scenes = $scope.Test.Scenes;
  }
]);

nSimAppControllers.controller('NetworkTestItemController', ['$scope',
  function NetworkTestItemController($scope) {
  }
]);

  //*****************
  //* N.NetworkTest *
  //*****************

N.NetworkTest = function() {
  this.Scenes  = [];
}

N.NetworkTest.prototype.CreateScenes = function() {
  for(var i=0; i<N.NetworkTest.TestConfigurations.length; i++) {
    var config = N.NetworkTest.TestConfigurations[i];
    var network = N.NewN(config.Network.ClassName);
    network.LoadFrom(config.Network);

    var scene = new N.UI.Scene.Network();
    scene.SetNetwork(network, 140, { x:0, y:0});
    scene.Id = 'N.NetworkTest.'+(i+1);
    N.Objects.Add(scene);
    this.Scenes.push(scene.Id);
  }
}

N.NetworkTest.TestConfigurations = [{
  Name: 'Simple Network',
  Network: {
    ClassName: 'N.Network',
    Name: 'SimpleNetwork',
    ShortName: 'SN',
    Neurons: [{
      ClassName: 'N.Neuron',
      Name: 'Input',
      ShortName: 'IP',
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
        Template: 'N.UI.StandardNeuronTemplates.InputSource',
        Radius: 0.3
      }
    },{
      ClassName: 'N.Neuron',
      Name: 'RelayNeuron',
      ShortName: 'RN',
      Compartments: [{
        ClassName: 'N.Comp.Output',
        Name: 'Output',
        ShortName: 'OP'
      },{
        ClassName: 'N.Comp.LinearSummingInput',
        Name: 'Input',
        ShortName: 'IP'
      }],
      Display: {
        Template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron',
        Radius: 0.4
      }
    },{
      ClassName: 'N.Neuron',
      Name: 'Output',
      ShortName: 'OP',
      Compartments: [{
        ClassName: 'N.Comp.LinearSummingInput',
        Name: 'Input',
        ShortName: 'IN'
      }],
      Display: {
        Template: 'N.UI.StandardNeuronTemplates.OutputSink',
        Radius: 0.3
      }
    }],
    Display: {
      Width: 3.2,
      Height: 1.5,
      Neurons: {
        'Input'       : { X: -1.0, Y: 0.0 },
        'RelayNeuron' : { X:  0.0, Y: 0.0 },
        'Output'      : { X:  1.0, Y: 0.0 }
      }
    }
  }
}];
