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

  //***************************
  //* WorkBenchTestController *
  //***************************

var nSimAppControllers = angular.module('nSimApp.controllers');

nSimAppControllers.controller('WorkbenchTestController', ['$scope',
  function WorkbenchTestController($scope) {
    // Ensure the services are loaded.
    N.NWS.WebServices.Load();

    $scope.test = new N.WorkbenchTestScenes();
    $scope.test.createScenes();
    $scope.workbenches = $scope.test.workbenches;
    $scope.testInfo = { name: 'Workbench Tests' };
    document.title = $scope.testInfo.name+': Nexus Logica';
  }
]);

  //*************************
  //* N.WorkbenchTestScenes *
  //*************************

N.WorkbenchTestScenes = function() {
  this.workbenches = [];
}

N.WorkbenchTestScenes.prototype.createScenes = function() {
  var renderMappings = {
    'columnSpacing': 0.3,
    'rowSpacing': 0.3,
    'SS'  : { template: 'N.UI.StandardNeuronTemplates.Stellate',              radius: 0.3 },
    'IN'  : { template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', radius: 0.3 },
    'IP'  : { template: 'N.UI.StandardNeuronTemplates.InputSource',           radius: 0.2 },
    'OP'  : { template: 'N.UI.StandardNeuronTemplates.OutputSink',            radius: 0.2 },
    'RN'  : { template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron', radius: 0.3 },
    'SRC' : { template: 'N.UI.StandardNeuronTemplates.InputSource',           radius: 0.3 },
    'SNK' : { template: 'N.UI.StandardNeuronTemplates.OutputSink',            radius: 0.3 },
    'Default' :  { template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron', radius: 0.2 }
  };

  var _this = this;
  for(var i=0; i<N.WorkbenchTestScenes.testConfigurations.length; i++) {
    var config = N.WorkbenchTestScenes.testConfigurations[i];

    var workbench = (new N.Workbench()).addTemplates(
      { 'N.WorkbenchTestScenes.SpinyStellate': N.WorkbenchTestScenes.SpinyStellate,
        'N.WorkbenchTestScenes.FastSpiking': N.WorkbenchTestScenes.FastSpiking
      }
    );
    workbench.setTargets(config.targets).then(
      function() {
        var scene = new N.UI.WorkbenchScene();
        scene.layout(workbench, renderMappings);
        _this.workbenches.push(scene);
      }, function(status) {
        console.log('ERROR: N.WorkbenchTestScenes.createScenes: '+status.errMsg);
      }
    ).catch(N.reportQError);
  }
}

N.WorkbenchTestScenes.SpinyStellate = {
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

N.WorkbenchTestScenes.FastSpiking = {
  className: 'N.Neuron',
  name: 'FS',
  compartments: [{
    className: 'N.Comp.Output',
    name: 'OP',
    initialOutput: 0.0,
    outputLogic: {
      outputFunc: N.Comp.OutputFunc.LinearSum,
      sources: {
        main: { componentName: 'IP',  gain: 0.5 }
      }
    }
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

N.WorkbenchTestScenes.testConfigurations = [{
//  targets : [ { template: { local: 'N.WorkbenchTestScenes.FastSpiking' }, name: 'IN[0]'} ]
  targets : [ { template: { remote: { url: 'http://127.0.0.1:5984/test1', id: 'fb958ba82f424b3888b04add2849468b'} }, name: 'IN[0]'} ]
 }
];
