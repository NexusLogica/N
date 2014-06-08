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
    $scope.TestInfo = { Name: 'Network Test' };
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
  var renderMappings = {
    'ColumnSpacing': 0.3,
    'RowSpacing': 0.3,
    'SS' : { Template: 'N.UI.StandardNeuronTemplates.Stellate',              Radius: 0.3 },
    'IN' : { Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', Radius: 0.3 },
    'IP' : { Template: 'N.UI.StandardNeuronTemplates.InputSource',           Radius: 0.2 },
    'OP' : { Template: 'N.UI.StandardNeuronTemplates.OutputSink',            Radius: 0.2 },
    'RN' : { Template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron', Radius: 0.3 },
    'Default' :  { Template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron', Radius: 0.2 }
  };

  for(var i=0; i<N.NetworkTest.TestConfigurations.length; i++) {
    var config = N.NetworkTest.TestConfigurations[i];
    var network = (new N.Network()).AddTemplates(
        { 'N.NetworkTest.SpinyStellate': N.NetworkTest.SpinyStellate,
          'N.NetworkTest.FastSpiking': N.NetworkTest.FastSpiking
        }).LoadFrom(config.Network);

    var scene = new N.UI.NetworkScene();
    scene.Layout(network, renderMappings);
    this.Scenes.push(scene);
  }
}

N.NetworkTest.SpinyStellate = {
  ClassName: 'N.Neuron',
  Name: 'SS',
  Compartments: [{
    ClassName: 'N.Comp.Output',
    Name: 'OP'
  },{
    ClassName: 'N.Comp.LinearSummingInput',
    Name: 'IP'
  },{
    ClassName: 'N.Comp.AcetylcholineInput',
    Name: 'AIP'
  }],
  Display: {
    Template: 'N.UI.StandardNeuronTemplates.Stellate',
    Radius: 0.3,
    CompartmentMap : { 'Dendrites': 'IP', 'Acetylcholine Receptors': 'AIP', 'Body': 'OP'  }
  }
}

N.NetworkTest.FastSpiking = {
  ClassName: 'N.Neuron',
  Name: 'FS',
  Compartments: [{
    ClassName: 'N.Comp.Output',
    Name: 'OP'
  },{
    ClassName: 'N.Comp.LinearSummingInput',
    Name: 'IP'
  }],
  Display: {
    Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron',
    Radius: 0.2,
    CompartmentMap : { 'Dendrites': 'IP', 'Body': 'OP'  }
  }
}

N.NetworkTest.TestConfigurations = [{

  //******************
  //* Simple Network *
  //******************

  Network: {
    ClassName: 'N.Network',
    Name: 'SN',
    Neurons: [{
      ClassName: 'N.Neuron',
      Name: 'IP',
      Compartments: [{
        ClassName: 'N.Comp.OutputFromSignal',
        Name: 'SO',
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
      Name: 'RN',
      Compartments: [{
        ClassName: 'N.Comp.Output',
        Name: 'OP'
      },{
        ClassName: 'N.Comp.LinearSummingInput',
        Name: 'IP'
      }],
      Display: {
        Template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron',
        Radius: 0.4,
        CompartmentMap : { 'Dendrites': 'IP', 'Body': 'OP'  }
      }
    },{
      ClassName: 'N.Neuron',
      Name: 'OP',
      Compartments: [{
        ClassName: 'N.Comp.LinearSummingInput',
        Name: 'IN'
      }],
      Display: {
        Template: 'N.UI.StandardNeuronTemplates.OutputSink',
        Radius: 0.3,
        CompartmentMap : { 'Input': 'IN'  }
      }
    }],
    Display: {
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

  Network: {
    ClassName: 'N.Network',
    Name: 'L4',
    Neurons: [
      {Template: 'N.NetworkTest.SpinyStellate', Name: 'SS[0]'},
      {Template: 'N.NetworkTest.SpinyStellate', Name: 'SS[1]'},
      {Template: 'N.NetworkTest.SpinyStellate', Name: 'SS[2]'},
      {Template: 'N.NetworkTest.SpinyStellate', Name: 'SS[3]'},
      {Template: 'N.NetworkTest.SpinyStellate', Name: 'SS[4]'},
      {Template: 'N.NetworkTest.FastSpiking', Name: 'IN[0]'},
      {Template: 'N.NetworkTest.FastSpiking', Name: 'IN[1]'},
      {Template: 'N.NetworkTest.FastSpiking', Name: 'IN[2]'},
      {Template: 'N.NetworkTest.FastSpiking', Name: 'IN[3]'}
    ],
    Display: {
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
