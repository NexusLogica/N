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

nSimAppControllers.controller('NetworkColumnTestController', ['$scope',
  function NetworkColumnTestController($scope) {
    $scope.Test = new N.ColumnNetworkTest();
    $scope.Test.CreateScenes();
    $scope.Scenes = $scope.Test.Scenes;
    $scope.TestInfo = { Name: 'Column Network Test' };
  }
]);

nSimAppControllers.controller('NetworkTestItemController', ['$scope',
  function NetworkTestItemController($scope) {
  }
]);

var MyController = function($scope) {
  $scope.Text = '['+$scope.scene.ClassName+']';
}

  //***********************
  //* N.ColumnNetworkTest *
  //***********************

N.ColumnNetworkTest = function() {
  this.Scenes  = [];
}

N.ColumnNetworkTest.prototype.CreateScenes = function() {
//  var scale = 140;
  var scale = 70;
//  for(var i=0; i<N.ColumnNetworkTest.TestConfigurations.length; i++) {
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

  for(var i=1; i<N.ColumnNetworkTest.TestConfigurations.length; i++) {
    var config = N.ColumnNetworkTest.TestConfigurations[i];
    var network = (new N.Network()).AddTemplates({ 'N.ColumnNetworkTest.SpinyStellate': N.ColumnNetworkTest.SpinyStellate }).LoadFrom(config.Network);

    var scene = new N.UI.NetworkScene();
    var unscaledRectangle = scene.Layout(network, renderMappings);
    this.Scenes.push(scene);
  }
}

N.ColumnNetworkTest.SpinyStellate = {
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

N.ColumnNetworkTest.TestConfigurations = [{

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

  Network: {
    ClassName: 'N.Network',
    Name: 'L4',
    Neurons: [{
      Template: 'N.ColumnNetworkTest.SpinyStellate', Name: 'SS[0]'},{
      Template: 'N.ColumnNetworkTest.SpinyStellate', Name: 'SS[1]'},{
      Template: 'N.ColumnNetworkTest.SpinyStellate', Name: 'SS[2]'},{
      Template: 'N.ColumnNetworkTest.SpinyStellate', Name: 'SS[3]'},{
      Template: 'N.ColumnNetworkTest.SpinyStellate', Name: 'SS[4]'},{
      Name: 'IN[0]',
      Display: { Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', Radius: 0.2 }
    },{
      Name: 'IN[1]',
      Display: { Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', Radius: 0.2 }
    },{
      Name: 'IN[2]',
      Display: { Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', Radius: 0.2 }
    },{
      Name: 'IN[3]',
      Display: { Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', Radius: 0.2 }
    }],
    Display: {
      Width: 4.2,
      Height: 1.5,
      Rows: [
        {
          RowId: 'top', NumCol: 5,  Spacing: 0.8, Y: -0.2,
          Cols: [
            { Name: 'SS[0]' },
            { Name: 'SS[1]' },
            { Name: 'SS[2]' },
            { Name: 'SS[3]' },
            { Name: 'SS[4]' }
          ]
        },
        {
          RowId: 'bottom', NumPoints: 4, Spacing: 0.6,  Y:  0.4,
          Cols: [
            { Name: 'IN[0]' },
            { Name: 'IN[1]' },
            { Name: 'IN[2]' },
            { Name: 'IN[3]' }
          ]
        }
      ]
    }
  }

}];
