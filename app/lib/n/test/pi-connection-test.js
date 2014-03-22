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

nSimAppControllers.controller('PiConnectionTestController', ['$scope',
  function PiConnectionTestController($scope) {
    $scope.Test = new N.Test.PiConnectionTest();
    $scope.Test.CreateScenes();
    $scope.Scenes = $scope.Test.Scenes;
  }
]);

var nSimAppDirectives = angular.module('nSimApp.directives');

nSimAppDirectives.directive('piConnectionTest', [function() {
  function link($scope, $element, $attrs) {
    $($element).find('.pi-canvas').on('onInitialRender', function(event, renderer, scene) {
      $scope.connection = new N.Test.PiConnectionCreator(scene.NetworkGraphic);
      $scope.connection.Render();
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
  this.Scenes  = [];
}

N.Test.PiConnectionTest.prototype.CreateScenes = function() {
  var creators = [ 'Matrix' ];
  for(var i in creators) {
    var scene = this[creators[i]]();
    N.Objects.Add(scene);
    this.Scenes.push(scene);
  }
}


N.Test.PiConnectionTest.prototype.Matrix = function() {
  var scale = 40.0,
      numRows = 4,
      numCols = 3,
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

  var config = { Name: 'Matrix', ShortName: 'M', Neurons: [], Display: { Width: networkWidth, Height: networkHeight, Rows: [] } };
  for(var i=0; i<numRows; i++) {
    var rowDisplay = { RowId: 'Row'+i, NumCol: numCols,  Spacing: spacing, Y: rowY, Cols: [] };
    for(var j=0; j<numCols; j++) {
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

  //******************************
  //* N.Test.PiConnectionCreator *
  //******************************

N.Test.PiConnectionCreator = function(networkUI) {
  this.NetworkUI = networkUI;
}

N.Test.PiConnectionCreator.prototype.Render = function() {
  var group = this.NetworkUI.GetGroup();
  var rect = this.NetworkUI.Rect;
  var gridPath = [ { Src:'SS41>OP' }, { Src:'SS13>OP' } ];
  var router = this.NetworkUI.Router;
  var start = router.GetPoint(gridPath[0]);
  var end = router.GetPoint(gridPath[1]);

  var pathString = this.MoveTo(start.Start)+this.LineTo(start.Mid)+this.LineTo(end.Mid)+this.LineTo(end.Start);
  this.Path = group.path(pathString).attr({ 'fill': 'none', 'stroke': 'red', 'stroke-width': 3 });
}

N.Test.PiConnectionCreator.prototype.MoveTo = function(xy) {
  return 'M'+xy.X+' '+xy.Y;
}
N.Test.PiConnectionCreator.prototype.LineTo = function(xy) {
  return 'L'+xy.X+' '+xy.Y;
}


