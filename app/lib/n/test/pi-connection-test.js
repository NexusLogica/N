/**********************************************************************

File     : pi-connection-test.js
Project  : N Simulator Library
Purpose  : Source file for connection graphics testing.
Revisions: Original definition by Lawrence Gunn.
           2014/03/21

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.Test = N.Test || {};

  //******************************
  //* PiConnectionTestController *
  //******************************

var nSimAppControllers = angular.module('nSimApp.controllers');

nSimAppControllers.controller('PiConnectionTestController', ['$scope', '$timeout',
  function PiConnectionTestController($scope, $timeout) {
    $scope.Test = new N.Test.PiConnectionTest();
    $scope.Test.CreateScene();
    $scope.Scenes = [ $scope.Test.Scene ];

    $scope.$on('PiConnectionTest:OnInitialRender', function() {
      $scope.next();
    });

    $scope.next = function() {
      $scope.Test.Next();
    }

  }
]);

var nSimAppDirectives = angular.module('nSimApp.directives');

nSimAppDirectives.directive('piConnectionTest', [function() {
  function link($scope, $element, $attrs) {
    $($element).find('.pi-canvas').on('onInitialRender', function(event, renderer, scene) {
      $scope.$emit('PiConnectionTest:OnInitialRender');
    });
  }

  return {
    restrict: 'A',
    transclude: false,
    scope: { title:'@' },
    link: link
  };
}]);

  //***************************
  //* N.Test.PiConnectionTest *
  //***************************

N.Test.PiConnectionTest = function() {
  this.nextRouteIndex = 0;
  var _this = this;
  this.StateMachine = StateMachine.create({
    initial: 'None',
    events: [
      { name: 'next',  from: '*', to: 'NextRouteTest' },
      { name: 'wait',  from: 'NextRouteTest', to: 'Waiting' }
    ],
    callbacks: {
      onenterNextRouteTest: function() {
        _this.ShowNextRoute();
      },
      onafternext: function() {
        _this.StateMachine.wait();
      }
    }
  });

  this.NextConnectionSetIndex = 0;
  this.ConnectionSetArrays = [
    ['SS[4][1]>OP->SS[1][5]>IP' ],
    ['SS[1][1]>OP->SS[2][4]>IP', 'SS[1][1]>OP->SS[1][5]>IP', 'SS[1][1]>OP->SS[5][5]>IP' ],
    ['SS[5][2]>OP->SS[3][2]>OP', 'SS[5][2]>OP->SS[3][3]>OP', 'SS[5][2]>OP->SS[2][2]>OP', 'SS[5][2]>OP->SS[1][3]>OP' ],
    ['SS[4][1]>OP->SS[4][3]>OP' ],
    ['SS[4][1]>OP->SS[2][1]>IP' ],
    ['SS[4][1]>OP->SS[2][1]>AIP' ],
    ['SS[4][1]>OP->SS[1][5]>AIP' ],
    ['SS[4][1]>OP->SS[2][1]>IP', 'SS[4][1]>OP->SS[1][5]>IP', 'SS[4][1]>OP->SS[4][3]>IP' ]
  ];
}

N.Test.PiConnectionTest.prototype.CreateScene = function() {
  this.Scene = this.Matrix();
  N.Objects.Add(this.Scene);
}

N.Test.PiConnectionTest.prototype.Next = function() {
  this.StateMachine.next();
}

N.Test.PiConnectionTest.prototype.Matrix = function() {
  var renderMappings = {
    'ColumnSpacing': 0.3,
    'RowSpacing': 0.3,
    'SS[2]' : { Template: 'N.UI.StandardNeuronTemplates.Stellate',              Radius: 0.3 },
    'SS[4]' : { Template: 'N.UI.StandardNeuronTemplates.Stellate',              Radius: 0.5 },
    'SS' : { Template: 'N.UI.StandardNeuronTemplates.Stellate',              Radius: 0.4 },
    'IN' : { Template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', Radius: 0.3 },
    'IP' : { Template: 'N.UI.StandardNeuronTemplates.InputSource',           Radius: 0.2 },
    'OP' : { Template: 'N.UI.StandardNeuronTemplates.OutputSink',            Radius: 0.2 },
    'RN' : { Template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron', Radius: 0.2 },
    'Default' :  { Template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron', Radius: 0.2 }
  };

  var numRows = 5,
      numCols = 5,
      spacing = 2.2,
      vertSpacing = 2.2,
      horizPadding = 0.8,
      vertPadding = 0.8;

  var rowHeight = (numRows-1)*vertSpacing;
  var rowY = -0.5*rowHeight;

  var networkWidth = spacing*numCols+2*horizPadding;
  var networkHeight = vertSpacing*numRows+2*vertPadding;

  var numColumns = [ 5, 4, 5, 3, 5 ];
  var spacings   = [ 2.2, 3.0, 2.2, 3.5, 2.2 ];
  //var numColumns = [ 4, 4, 4, 4 ];
  //var spacings   = [ 2.2, 2.2, 2.2, 2.2 ];
  var config = { Name: 'M', Neurons: [], Display: { Rows: [] } };
  for(var i=0; i<numColumns.length; i++) {
    var rowDisplay = { RowId: 'Row'+i, NumCol: numCols,  Spacing: spacings[i], Y: rowY, Cols: [] };
    for(var j=0; j<numColumns[i]; j++) {
      var name = 'SS['+(i+1)+']['+(j+1)+']';
      config.Neurons.push({ Template: 'N.Test.PiConnectionTest.SpinyStellate', Name: name });
      rowDisplay.Cols.push({ Name: name });
    }
    config.Display.Rows.push(rowDisplay);
    rowY += vertSpacing;
  }

  console.log(JSON.stringify(config, undefined, 2));

  var network = new N.Network();
  network.AddTemplates({ 'N.Test.PiConnectionTest.SpinyStellate' : N.Test.PiConnectionTest.SpinyStellate });
  network.LoadFrom(config);

  var scene = new N.UI.NetworkScene();
  scene.Layout(network, renderMappings);
  return scene;
}

N.Test.PiConnectionTest.prototype.ShowNextRoute = function() {

  this.RouteManager = new N.UI.PiRouteManager(this.Scene.Network);
  this.RouteManager.AddConnections(this.ToConnectionStubs(this.ConnectionSetArrays[this.NextConnectionSetIndex]));
  this.RouteManager.Render();

  this.NextConnectionSetIndex++;
  if(this.NextConnectionSetIndex === this.ConnectionSetArrays.length) {
    this.NextConnectionSetIndex = 0;
  }
}

N.Test.PiConnectionTest.Next = -1;
N.Test.PiConnectionTest.Categories = [ 'Excitatory', 'Inhibitory', 'Spine', 'GapJunction', 'Electrode' ];

N.Test.PiConnectionTest.prototype.ToConnectionStubs = function(pathArray) {
  var stubs = _.map(pathArray, function(path) {
    N.Test.PiConnectionTest.Next = (N.Test.PiConnectionTest.Next === 4 ? 0 : N.Test.PiConnectionTest.Next + 1);
    return { GetPath: function() { return path; }, Category: N.Test.PiConnectionTest.Categories[N.Test.PiConnectionTest.Next] };
  });
  return stubs;
}

N.Test.PiConnectionTest.SpinyStellate = {
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
    Radius: 0.8,
    CompartmentMap : { 'Dendrites': 'IP', 'Acetylcholine Receptors': 'AIP', 'Body': 'OP'  }
  }
}
