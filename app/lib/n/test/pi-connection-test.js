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
  var gridPath1 = [
    { Src:'SS41>OP'  },
    { SrcOffset:'SS41>OP', Offset: 'DY 0' },
    { Coord:'4 3 1', Offset: 'DX -1 DY 0'},
    { Coord:'0 0 1', Offset: 'DX -1 DY -1' },
    { Coord:'0 0 3', Offset: 'DY -1', Sink:'SS13>IP', Angle: 240 }
  ];
  var gridPath2 = [
    { Src:'SS41>OP' },
    { SrcOffset:'SS41>OP', Offset: 'DY 0' },
    { Coord:'4 3 1', Offset: 'DY 0 DX 1'},
    { Coord:'0 0 1', Offset: 'DX 1 DY 1' },
    { Coord:'0 0 3', Offset: 'DY 1', Sink:'SS13>IP', Angle: 220 }
  ];
  var gridPath3 = [
    { Src:'SS41>OP' },
    { SrcOffset:'SS41>OP', Offset: 'DY 0' },
    { Coord:'4 3 0', Offset: 'DY 0' },
    { Coord:'2 1 0', Sink:'SS21>IP', Angle: 170 }
  ];
  var gridPath4 = [
    { Src:'SS41>OP' },
    { SrcOffset:'SS41>OP', Offset: 'DY 0' },
    { Coord:'4 3 1', Offset: 'DY 0'},
    { Coord:'4 3 3', Offset: 'DY 0' },
    { Coord:'3 2 3', Sink:'SS33>IP', Angle: 30 }
  ];

  this.RenderConnection(gridPath1);
  this.RenderConnection(gridPath2);
  this.RenderConnection(gridPath3);
  this.RenderConnection(gridPath4);
}

N.Test.PiConnectionCreator.prototype.RenderConnection = function(gridPath) {

  var router = this.NetworkUI.Router;
  var points = [];
  for(var i=0; i<gridPath.length; i++) {
    var gridPoints = router.GetPoint(gridPath[i]);
    for(var j=0; j<gridPoints.length; j++) { points.push(gridPoints[j]); }
  }

  // The first point is unchanged.
  var newPoints = [points[0]];

  // Add chamfers to all of the lines.
  var v1, v2;
  for(i=1; i<points.length-1; i++) {
    if(points[i].Join) {
      // From the points, construct
      v1 = this.Vector(points[i-1], points[i]);
      v2 = this.VectorFromSink(points[i+1]);
      var v3 = this.FindIntersection(v1.X, v1.Y, v1.DX+v1.X, v1.DY+v1.Y, v2.X, v2.Y, v2.DX+v2.X, v2.DY+v2.Y);
      newPoints.push(v3);
      newPoints.push(v2);
    }
    else {
      v1 = this.Vector(points[i-1], points[i]);
      v2 = this.Vector(points[i+1], points[i]);

      var chamferSize = 7;
  //    var minLen = (v1.Len < v2.Len ? v1.Len : v2.Len);
  //    if(minLen < corner) { corner = minLen; }
      var corner1 = this.ShortenVector(v1, chamferSize);
      var corner2 = this.ShortenVector(v2, chamferSize);
      newPoints.push(corner1);
      newPoints.push(corner2);
    }
  }

  var pathString = '';
  for(i=0; i<newPoints.length; i++) {
    var point = newPoints[i];
    if(i === 0) {
      pathString += this.MoveTo(point);
    }
    else {
      pathString += this.LineTo(point);
    }
  }

  var group = this.NetworkUI.GetGroup();
  this.Path = group.path(pathString).attr({ 'fill': 'none', 'stroke-linejoin': 'round', class: 'pi-connection simple-excitatory-connection' });
}

N.Test.PiConnectionCreator.prototype.Vector = function(base, end) {
  var v = { DX: (end.X-base.X), DY: (end.Y-base.Y), X: base.X, Y: base.Y };
  v.Len = Math.sqrt(v.DX*v.DX+v.DY*v.DY);
  return v;
}

N.Test.PiConnectionCreator.prototype.VectorFromSink = function(sink) {
  var v = { DX: sink.DX, DY: sink.DY, X: sink.BaseX, Y: sink.BaseY };
  v.Len = Math.sqrt(v.DX*v.DX+v.DY*v.DY);
  return v;
}

N.Test.PiConnectionCreator.prototype.FindIntersection = function(p0X, p0Y, p1X, p1Y, p2X, p2Y, p3X, p3Y) {
  var s1X = p1X - p0X;
  var s1Y = p1Y - p0Y;
  var s2X = p3X - p2X;
  var s2Y = p3Y - p2Y;

  var s = (-s1Y * (p0X - p2X) + s1X * (p0Y - p2Y)) / (-s2X * s1Y + s1X * s2Y);
  var t = ( s2X * (p0Y - p2Y) - s2Y * (p0X - p2X)) / (-s2X * s1Y + s1X * s2Y);

  return {  X: (p0X + (t * s1X)), Y: (p0Y + (t * s1Y)) };
}

N.Test.PiConnectionCreator.prototype.ShortenVector = function(vec, dl) {
  var ratio = (vec.Len-dl)/vec.Len;
  vec.DX *= ratio;
  vec.DY *= ratio;
  return { X: (vec.DX+vec.X), Y: (vec.DY+vec.Y) };
}

  N.Test.PiConnectionCreator.prototype.MoveTo = function(xy) {
  return 'M'+xy.X+' '+xy.Y;
}

  N.Test.PiConnectionCreator.prototype.LineTo = function(xy) {
  return 'L'+xy.X+' '+xy.Y;
}


