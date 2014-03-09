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
  var scale = 140;
  for(var i=0; i<N.NetworkTest.TestConfigurations.length; i++) {
    var config = N.NetworkTest.TestConfigurations[i];
    var network = N.NewN(config.Network.ClassName);
    network.LoadFrom(config.Network);

    var scene = new N.UI.Scene.Network();
    scene.SetNetwork(network, scale, { x:0, y:0});
    scene.Id = 'N.NetworkTest.'+(i+1);
    scene.Width = config.Network.Display.Width*scale+60;
    scene.Height = config.Network.Display.Height*scale+60;
    N.Objects.Add(scene);
    this.Scenes.push(scene);
  }
}

N.NetworkTest.TestConfigurations = [{

  //******************
  //* Simple Network *
  //******************

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
        Radius: 0.3,
        CompartmentMap : { 'Body': 'SO' }
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
        Radius: 0.4,
        CompartmentMap : { 'Dendrites': 'OP', 'Body': 'IP'  }
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
      Height: 1.2,
      Grid: [
        { RowId: 'main', NumPoints: 3, Spacing: 1.0, Y: 0.0 }
      ],
      Neurons: {
        'Input'       : { Row: 'main', Col: 0 },
        'RelayNeuron' : { Row: 'main', Col: 1 },
        'Output'      : { Row: 'main', Col: 2 }
      }
    }
  }
},{

  //*******************
  //* Layer 4 Network *
  //*******************

  Name: 'Layer 4 Network',
  Network: {
    ClassName: 'N.Network',
    Name: 'Layer4',
    ShortName: 'L4',
    Neurons: [{
      ClassName: 'N.Neuron', Name: 'SpinyStellate1', ShortName: 'SS1',
      Display: { Template: 'N.UI.StandardNeuronTemplates.Stellate', Radius: 0.3 }
    },{
      ClassName: 'N.Neuron', Name: 'SpinyStellate2', ShortName: 'SS2',
      Display: { Template: 'N.UI.StandardNeuronTemplates.Stellate', Radius: 0.3 }
    },{
      ClassName: 'N.Neuron', Name: 'SpinyStellate3', ShortName: 'SS3',
      Display: { Template: 'N.UI.StandardNeuronTemplates.Stellate', Radius: 0.3 }
    },{
      ClassName: 'N.Neuron', Name: 'SpinyStellate4', ShortName: 'SS4',
      Display: { Template: 'N.UI.StandardNeuronTemplates.Stellate', Radius: 0.3 }
    },{
      ClassName: 'N.Neuron', Name: 'SpinyStellate5', ShortName: 'SS5',
      Display: { Template: 'N.UI.StandardNeuronTemplates.Stellate', Radius: 0.3 }
    },{
      ClassName: 'N.Neuron', Name: 'Inhibitory1', ShortName: 'IN1',
      Display: { Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', Radius: 0.2 }
    },{
      ClassName: 'N.Neuron', Name: 'Inhibitory2', ShortName: 'IN2',
      Display: { Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', Radius: 0.2 }
    },{
      ClassName: 'N.Neuron', Name: 'Inhibitory3', ShortName: 'IN3',
      Display: { Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', Radius: 0.2 }
    },{
      ClassName: 'N.Neuron', Name: 'Inhibitory4', ShortName: 'IN4',
      Display: { Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', Radius: 0.2 }
    }],
    Display: {
      Width: 4.2,
      Height: 1.5,
      Grid: [
        { RowId: 'top',    NumPoints: 5,  Spacing: 0.8, Y: -0.2 },
        { RowId: 'bottom', NumPoints: 4, Spacing: 0.6, Y: 0.4 }
      ],
      Neurons: {
        'SpinyStellate1'  : { Row: 'top', Col: 0 },
        'SpinyStellate2'  : { Row: 'top', Col: 1 },
        'SpinyStellate3'  : { Row: 'top', Col: 2 },
        'SpinyStellate4'  : { Row: 'top', Col: 3 },
        'SpinyStellate5'  : { Row: 'top', Col: 4 },
        'Inhibitory1'     : { Row: 'bottom', Col: 0 },
        'Inhibitory2'     : { Row: 'bottom', Col: 1 },
        'Inhibitory3'     : { Row: 'bottom', Col: 2 },
        'Inhibitory4'     : { Row: 'bottom', Col: 3 }
      }
    }
  }

}];
