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
    network.AddTemplates({ 'N.NetworkTest.SpinyStellate': N.NetworkTest.SpinyStellate });
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

N.NetworkTest.SpinyStellate = {
  ClassName: 'N.Neuron',
  Name: 'SpinyStellate',
  ShortName: 'SS',
  Compartments: [{
    ClassName: 'N.Comp.Output',
    Name: 'Output',
    ShortName: 'OP'
  },{
    ClassName: 'N.Comp.LinearSummingInput',
    Name: 'Input',
    ShortName: 'IP'
  },{
    ClassName: 'N.Comp.AcetylcholineInput',
    Name: 'AcetylcholineInput',
    ShortName: 'AIP'
  }],
  Display: {
    Template: 'N.UI.StandardNeuronTemplates.Stellate',
    Radius: 0.3,
    CompartmentMap : { 'Dendrites': 'IP', 'Acetylcholine Receptors': 'AIP', 'Body': 'OP'  }
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
        ClassName: 'N.Comp.OutputFromSignal',
        Name: 'StateOutput',
        ShortName: 'SO',
        Signal: {
          ClassName: 'N.DiscreteSignal',
          DataArray: [{ t:0.0, v:0 }, { t:0.05, v:1 }, { t:0.10, v:0 }, { t:0.15, v:1 }, { t:0.20, v:0 }, { t:0.25, v:1 }]
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
        CompartmentMap : { 'Dendrites': 'IP', 'Body': 'OP'  }
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
        Radius: 0.3,
        CompartmentMap : { 'Input': 'IN'  }
      }
    }],
    Display: {
      Width: 3.2,
      Height: 1.2,
      Rows: [
        { RowId: 'main', NumPoints: 3, Spacing: 1.0, Y: 0.0,
          Cols: [
            { Name: 'IP' },
            { Name: 'RN' },
            { Name: 'OP' }
          ]
        }
      ]
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
      ClassName: 'N.Neuron', Template: 'N.NetworkTest.SpinyStellate', Name: 'SpinyStellate1', ShortName: 'SS1'},{
      ClassName: 'N.Neuron', Template: 'N.NetworkTest.SpinyStellate', Name: 'SpinyStellate2', ShortName: 'SS2'},{
      ClassName: 'N.Neuron', Template: 'N.NetworkTest.SpinyStellate', Name: 'SpinyStellate3', ShortName: 'SS3'},{
      ClassName: 'N.Neuron', Template: 'N.NetworkTest.SpinyStellate', Name: 'SpinyStellate4', ShortName: 'SS4'},{
      ClassName: 'N.Neuron', Template: 'N.NetworkTest.SpinyStellate', Name: 'SpinyStellate5', ShortName: 'SS5'},{
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
      Rows: [
        {
          RowId: 'top', NumCol: 5,  Spacing: 0.8, Y: -0.2,
          Cols: [
            { Name: 'SS1' },
            { Name: 'SS2' },
            { Name: 'SS3' },
            { Name: 'SS4' },
            { Name: 'SS5' }
          ]
        },
        {
          RowId: 'bottom', NumPoints: 4, Spacing: 0.6,  Y:  0.4,
          Cols: [
            { Name: 'IN1' },
            { Name: 'IN2' },
            { Name: 'IN3' },
            { Name: 'IN4' }
          ]
        }
      ]
    }
  }

}];
