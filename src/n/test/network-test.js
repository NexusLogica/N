/**********************************************************************

File     : network-test.js
Project  : N Simulator Library
Purpose  : Source file for network graphics testing.
Revisions: Original definition by Lawrence Gunn.
           2014/03/02

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.test = N.test || {};

  //*************************
  //* NetworkTestController *
  //*************************

angular.module('nSimulationApp').controller('NetworkTestController', ['$scope',
  function NetworkTestController($scope) {
    $scope.test = new N.NetworkTest();
    $scope.test.createScenes();
    $scope.scenes = $scope.test.scenes;
    $scope.testInfo = { name: 'Network Test' };
  }
]);

angular.module('nSimulationApp').controller('NetworkTestItemController', ['$scope',
  function NetworkTestItemController($scope) {
  }
]);

  //*****************
  //* N.NetworkTest *
  //*****************

N.NetworkTest = function() {
  this.scenes  = [];
}

N.NetworkTest.prototype.createScenes = function() {
  var renderMappings = {
    'columnSpacing': 0.3,
    'rowSpacing': 0.3,
    'SS' : { template: 'N.UI.StandardNeuronTemplates.Stellate',              radius: 0.3 },
    'IN' : { template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', radius: 0.3 },
    'IP' : { template: 'N.UI.StandardNeuronTemplates.InputSource',           radius: 0.2 },
    'OP' : { template: 'N.UI.StandardNeuronTemplates.OutputSink',            radius: 0.2 },
    'RN' : { template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron', radius: 0.3 },
    'Default' :  { template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron', radius: 0.2 }
  };

  for(var i=0; i<N.NetworkTest.testConfigurations.length; i++) {
    var config = N.NetworkTest.testConfigurations[i];
    var network = (new N.Network()).addTemplates(
        { 'N.NetworkTest.SpinyStellate': N.NetworkTest.SpinyStellate,
          'N.NetworkTest.FastSpiking': N.NetworkTest.FastSpiking
        }).loadFrom(config.network);

    var scene = new N.UI.NetworkScene();
    scene.layout(network, renderMappings);
    this.scenes.push(scene);
  }
}

N.NetworkTest.SpinyStellate = {
  className: 'N.Neuron',
  name: 'SS',
  compartments: [{
    className: 'N.Comp.Output',
    name: 'OP'
  },{
    className: 'N.Comp.LinearSummingInput',
    name: 'IP'
  },{
    className: 'N.Comp.AcetylcholineInput',
    name: 'AIP'
  }],
  display: {
    template: 'N.UI.StandardNeuronTemplates.Stellate',
    radius: 0.3,
    compartmentMap : { 'Dendrites': 'IP', 'Acetylcholine Receptors': 'AIP', 'Body': 'OP'  }
  }
}

N.NetworkTest.FastSpiking = {
  className: 'N.Neuron',
  name: 'FS',
  compartments: [{
    className: 'N.Comp.Output',
    name: 'OP'
  },{
    className: 'N.Comp.LinearSummingInput',
    name: 'IP'
  }],
  display: {
    template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron',
    radius: 0.2,
    dompartmentMap : { 'Dendrites': 'IP', 'Body': 'OP'  }
  }
}

N.NetworkTest.testConfigurations = [{

  //******************
  //* Simple Network *
  //******************

  network: {
    className: 'N.Network',
    name: 'SN',
    neurons: [{
      className: 'N.Neuron',
      name: 'IP',
      compartments: [{
        className: 'N.Comp.OutputFromSignal',
        name: 'SO',
        signal: {
          className: 'N.DiscreteSignal',
          dataArray: [{ t:0.0, v:0 }, { t:0.05, v:1 }, { t:0.10, v:0 }, { t:0.15, v:1 }, { t:0.20, v:0 }, { t:0.25, v:1 }]
        }
      }],
      display: {
        template: 'N.UI.StandardNeuronTemplates.InputSource',
        radius: 0.3,
        compartmentMap : { 'Body': 'SO' }
      }
    },{
      className: 'N.Neuron',
      name: 'RN',
      compartments: [{
        className: 'N.Comp.Output',
        name: 'OP'
      },{
        className: 'N.Comp.LinearSummingInput',
        name: 'IP'
      }],
      display: {
        template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron',
        radius: 0.4,
        compartmentMap : { 'Dendrites': 'IP', 'Body': 'OP'  }
      }
    },{
      className: 'N.Neuron',
      name: 'OP',
      compartments: [{
        className: 'N.Comp.LinearSummingInput',
        name: 'IN'
      }],
      display: {
        template: 'N.UI.StandardNeuronTemplates.OutputSink',
        radius: 0.3,
        compartmentMap : { 'Input': 'IN'  }
      }
    }],
    display: {
      rows: [
        { rowId: 'main', numPoints: 3, spacing: 1.0, Y: 0.0,
          cols: [
            { name: 'IP' },
            { name: 'RN' },
            { name: 'OP' }
          ]
        }
      ]
    }
  }
},{

  //*******************
  //* Layer 4 Network *
  //*******************

  network: {
    className: 'N.Network',
    name: 'L4',
    neurons: [
      {template: 'N.NetworkTest.SpinyStellate', name: 'SS[0]'},
      {template: 'N.NetworkTest.SpinyStellate', name: 'SS[1]'},
      {template: 'N.NetworkTest.SpinyStellate', name: 'SS[2]'},
      {template: 'N.NetworkTest.SpinyStellate', name: 'SS[3]'},
      {template: 'N.NetworkTest.SpinyStellate', name: 'SS[4]'},
      {template: 'N.NetworkTest.FastSpiking', name: 'IN[0]'},
      {template: 'N.NetworkTest.FastSpiking', name: 'IN[1]'},
      {template: 'N.NetworkTest.FastSpiking', name: 'IN[2]'},
      {template: 'N.NetworkTest.FastSpiking', name: 'IN[3]'}
    ],
    display: {
      rows: [
        {
          rowId: 'top', numCol: 5,  spacing: 0.8, y: -0.2,
          cols: [
            { name: 'SS1' },
            { name: 'SS2' },
            { name: 'SS3' },
            { name: 'SS4' },
            { name: 'SS5' }
          ]
        },
        {
          rowId: 'bottom', numPoints: 4, spacing: 0.6,  y:  0.4,
          cols: [
            { name: 'IN1' },
            { name: 'IN2' },
            { name: 'IN3' },
            { name: 'IN4' }
          ]
        }
      ]
    }
  }

}];
