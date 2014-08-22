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
    $scope.Test = new N.WorkbenchTestScenes();
    $scope.Test.CreateScenes();
    $scope.Workbenches = $scope.Test.Workbenches;
    $scope.TestInfo = { Name: 'Workbench Tests' };
    document.title = $scope.TestInfo.Name+': Nexus Logica';
  }
]);

  //*************************
  //* N.WorkbenchTestScenes *
  //*************************

N.WorkbenchTestScenes = function() {
  this.Workbenches  = [];
}

N.WorkbenchTestScenes.prototype.CreateScenes = function() {
  var renderMappings = {
    'ColumnSpacing': 0.3,
    'RowSpacing': 0.3,
    'SS'  : { Template: 'N.UI.StandardNeuronTemplates.Stellate',              Radius: 0.3 },
    'IN'  : { Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', Radius: 0.3 },
    'IP'  : { Template: 'N.UI.StandardNeuronTemplates.InputSource',           Radius: 0.2 },
    'OP'  : { Template: 'N.UI.StandardNeuronTemplates.OutputSink',            Radius: 0.2 },
    'RN'  : { Template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron', Radius: 0.3 },
    'SRC' : { Template: 'N.UI.StandardNeuronTemplates.InputSource',           Radius: 0.3 },
    'SNK' : { Template: 'N.UI.StandardNeuronTemplates.OutputSink',            Radius: 0.3 },
    'Default' :  { Template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron', Radius: 0.2 }
  };

  var _this = this;
  for(var i=0; i<N.WorkbenchTestScenes.TestConfigurations.length; i++) {
    var config = N.WorkbenchTestScenes.TestConfigurations[i];

    var workbench = (new N.Workbench()).addTemplates(
      { 'N.WorkbenchTestScenes.SpinyStellate': N.WorkbenchTestScenes.SpinyStellate,
        'N.WorkbenchTestScenes.FastSpiking': N.WorkbenchTestScenes.FastSpiking
      }
    );
    workbench.setTargets(config.targets).then(
      function() {
        var scene = new N.UI.WorkbenchScene();
        scene.Layout(workbench, renderMappings);
        _this.Workbenches.push(scene);
      }, function(status) {
        console.log('ERROR: N.WorkbenchTestScenes.CreateScenes: '+status.errMsg);
      }
    ).catch(N.reportQError);
  }
}

N.WorkbenchTestScenes.SpinyStellate = {
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
    compartmentMap : { 'dendrites': 'IP', 'body': 'OP'  }
  }
}

N.WorkbenchTestScenes.TestConfigurations = [{
  targets : [ { template: { local: 'N.WorkbenchTestScenes.FastSpiking' }, name: 'IN[0]'} ]
 }
];
