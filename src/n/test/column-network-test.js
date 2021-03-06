/**********************************************************************

File     : column-network-test.js
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

  //*******************************
  //* NetworkColumnTestController *
  //*******************************

angular.module('nSimulationApp').controller('NetworkColumnTestController', ['$scope',
  function NetworkColumnTestController($scope) {
    $scope.test = new N.ColumnNetworkTest();
    $scope.test.createScenes();
    $scope.scenes = $scope.test.scenes;
    $scope.testInfo = { name: 'Column Network Test' };
  }
]);

angular.module('nSimulationApp').controller('NetworkTestItemController', ['$scope',
  function NetworkTestItemController($scope) {
  }
]);

  //***********************
  //* N.ColumnNetworkTest *
  //***********************

N.ColumnNetworkTest = function() {
  this.Scenes  = [];
}

N.ColumnNetworkTest.prototype.createScenes = function() {
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

  for(var i=1; i<N.ColumnNetworkTest.testConfigurations.length-1; i++) {
    var config = N.ColumnNetworkTest.testConfigurations[i];
    var network = (new N.Network()).addTemplates(
        { 'N.ColumnNetworkTest.SpinyStellate': N.ColumnNetworkTest.SpinyStellate,
          'N.ColumnNetworkTest.FastSpiking': N.ColumnNetworkTest.FastSpiking
        }).loadFrom(config.Network);

    var scene = new N.UI.NetworkScene();
    scene.layout(network, renderMappings);
    this.scenes.push(scene);
  }
}

N.ColumnNetworkTest.SpinyStellate = {
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

N.ColumnNetworkTest.FastSpiking = {
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
    compartmentMap : { 'Dendrites': 'IP', 'Body': 'OP'  }
  }
}

N.ColumnNetworkTest.testConfigurations = [{

  //******************
  //* Simple Network *
  //******************

  network: {
    className: 'N.Network',
    name: 'SN',
    neurons: [{
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
        compartmentMap: { 'Dendrites': 'IP', 'Body': 'OP'  }
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
        compartmentMap: { 'Input': 'IN'  }
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
    connections: [
      { path: 'L3:SS[2]>OP->L3:IN[3]>IP' },
      { path: 'L3:SS[2]>OP->L3:SS[0]>IP' },
      { path: 'L3:SS[2]>OP->L4:SS[1]>IP' },
      { path: 'L3:SS[2]>OP->L4:SS[2]>IP' },
      { path: 'L3:SS[2]>OP->L4:SS[3]>IP' },
      { path: 'L3:SS[2]>OP->L3:IN[2]>IP' },
      { path: 'L3:SS[2]>OP->L4:IN[1]>IP' },
      { path: 'L3:SS[2]>OP->L3:IN[1]>IP' },
      { path: 'L3:SS[2]>OP->L4:IN[0]>IP' }
    ],
    networks: [{
      name: 'L3',
      neurons: [
        { template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[0]'},
        { template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[1]'},
        { template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[2]'},
        { template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[3]'},
        { template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[4]'},
        { template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[0]'},
        { template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[1]'},
        { template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[2]'},
        { template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[3]'}
      ],
      connections: [
      //  { path: ':SS[0]>OP->:IN[0]>IP' }
      ]
    }, {
      name: 'L4',
      neurons: [
        { template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[0]'},
        { template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[1]'},
        { template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[2]'},
        { template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[3]'},
//        { template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[4]'},
        { template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[0]'},
        { template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[1]'},
        { template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[2]'},
        { template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[3]'},
        { template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[4]'}
      ],
      connections: [
        //{ path: ':SS[0]>OP->:IN[0]>IP' }
      ]
    }]
  }
},{

  //*******************
  //* Layer 4 Network *
  //*******************

  network: {
    name: 'L4',
    neurons: [
      {template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[0]'},
      {template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[1]'},
      {template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[2]'},
      {template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[3]'},
      {template: 'N.ColumnNetworkTest.SpinyStellate', name: 'SS[4]'},
      {template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[0]'},
      {template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[1]'},
      {template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[2]'},
      {template: 'N.ColumnNetworkTest.FastSpiking', name: 'IN[3]'}
    ],
    display: {
      rows: [{
        neurons: [ 'SS[0]', 'SS[1]', 'SS[2]', 'SS[3]', 'SS[4]' ]
      },{
        neurons: [ 'IN[0]', 'IN[1]', 'IN[2]', 'IN[3]' ]
      }]
    }
  }
}];
