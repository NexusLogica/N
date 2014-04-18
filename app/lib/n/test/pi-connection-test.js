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

    $scope.$on('PiConnectionTest:OnInitialRenfer', function() {
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
      $scope.$emit('PiConnectionTest:OnInitialRenfer');
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
  this.ConnectionSets = [
    { Source: 'SS41>OP', Sinks: [ 'SS15>IP' ] },
    { Source: 'SS41>OP', Sinks: [ 'SS21>IP' ] },
    { Source: 'SS41>OP', Sinks: [ 'SS43>IP' ] },
    { Source: 'SS41>OP', Sinks: [ 'SS21>IP', 'SS15>IP', 'SS43>IP' ] },
    { Source: 'SS11>OP', Sinks: [ 'SS24>IP', 'SS15>IP', 'SS55>IP' ] }
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
  var scale = 30.0,
      numRows = 5,
      numCols = 5,
      spacing = 2.2,
      vertSpacing = 2.2,
      horizPadding = 0.8,
      vertPadding = 0.8,
      w = 4.2,
      h = 4.2;

  var rowHeight = (numRows-1)*vertSpacing;
  var rowY = -0.5*rowHeight;

  var networkWidth = spacing*numCols+2*horizPadding;
  var networkHeight = vertSpacing*numRows+2*vertPadding;

  var numColumns = [ 5, 4, 5, 3, 5 ];
  var spacings   = [ 2.2, 3.0, 2.2, 3.5, 2.2 ];
  //var numColumns = [ 4, 4, 4, 4 ];
  //var spacings   = [ 2.2, 2.2, 2.2, 2.2 ];
  var config = { Name: 'Matrix', ShortName: 'M', Neurons: [], Display: { Width: networkWidth, Height: networkHeight, Rows: [] } };
  for(var i=0; i<numColumns.length; i++) {
    var rowDisplay = { RowId: 'Row'+i, NumCol: numCols,  Spacing: spacings[i], Y: rowY, Cols: [] };
    for(var j=0; j<numColumns[i]; j++) {
      var name = 'SS'+(i+1)+(j+1);
      config.Neurons.push({ ClassName: 'N.Neuron', Template: 'N.Test.PiConnectionTest.SpinyStellate', Name: 'SpinyStellate1', ShortName: name });
      rowDisplay.Cols.push({ Name: name });
    }
    config.Display.Rows.push(rowDisplay);
    rowY += vertSpacing;
  }

  var network = (new N.Network()).LoadFrom(config);

  var scene = new N.UI.Scene.Network();
  scene.SetNetwork(network, scale, { x:0, y:0});
  scene.Id = 'N.Test.PiConnectionTest.Matrix';
  scene.Width = 500;
  scene.Height = 500;
  return scene;
}

N.Test.PiConnectionTest.prototype.ShowNextRoute = function() {
  var network = this.Scene.Network;
  var connectionGroup = network.Group.group();

  var source = this.ConnectionSets[this.NextConnectionSetIndex].Source;
  var sinks = this.ConnectionSets[this.NextConnectionSetIndex].Sinks;

  for(var i in sinks) {
    var routeFinder = new N.UI.PiRouteFinder(network);
    routeFinder.FindRoute(source, sinks[i], sinks[i].Angle, network.RouteInfo);
    var pathString = routeFinder.GetPath(network.RouteInfo);
    connectionGroup.path(pathString).attr({ 'fill': 'none', 'stroke-linejoin': 'round', class: 'pi-connection simple-excitatory-connection' });
  }

  network.AddConnectionDisplay('route', connectionGroup);

  this.NextConnectionSetIndex++;
  if(this.NextConnectionSetIndex === this.ConnectionSets.length) {
    this.NextConnectionSetIndex = 0;
  }
}

N.Test.PiConnectionTest.SpinyStellate = {
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
    Radius: 0.8,
    CompartmentMap : { 'Dendrites': 'IP', 'Acetylcholine Receptors': 'AIP', 'Body': 'OP'  }
  }
}
