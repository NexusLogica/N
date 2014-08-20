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

    var workbench = (new N.Workbench()).AddTemplates(
      { 'N.WorkbenchTestScenes.SpinyStellate': N.WorkbenchTestScenes.SpinyStellate,
        'N.WorkbenchTestScenes.FastSpiking': N.WorkbenchTestScenes.FastSpiking
      }
    );
    workbench.SetTargets(config.targets).then(
      function() {
        var scene = new N.UI.WorkbenchScene();
        scene.Layout(workbench, renderMappings);
        _this.Workbenches.push(scene);
      }, function(status) {
      }
    );
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
  ClassName: 'N.Neuron',
  Name: 'FS',
  Compartments: [{
    ClassName: 'N.Comp.Output',
    Name: 'OP',
    InitialOutput: 0.0,
    OutputLogic: {
      OutputFunc: N.Comp.OutputFunc.LinearSum,
      Sources: {
        Main: { ComponentName: 'IP',  Gain: 0.5 }
      }
    }
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

N.WorkbenchTestScenes.TestConfigurations = [{
  targets : [ { template: { local: 'N.WorkbenchTestScenes.FastSpiking' }, name: 'IN[0]'} ]
 }
];
