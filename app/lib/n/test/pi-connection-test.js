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

  this.NextRoute = 0;
  this.Routes = [
      [ { R: 3, C: 0 }, { R: 0, C: 3 } ]
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
  var newGroup = network.Group.group();
  var route = this.Routes[this.NextRoute];
  var routeFinder = new N.Test.PiRouteFinder(network);
  routeFinder.FindRoute(route[0], route[1], 270.0, network.Router);
  var pathString = routeFinder.GetPath(network.Router);
  newGroup.path(pathString).attr({ 'fill': 'none', 'stroke-linejoin': 'round', class: 'pi-connection simple-excitatory-connection' });
  network.AddConnectionDisplay('route', newGroup);
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

N.Test.PiConnectionCreator = function(network) {
  this.Network = network;
}

N.Test.PiConnectionCreator.prototype.Render = function() {
  var group = this.Network.GetGroup();
  var rect = this.Network.Rect;
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

  this.connectionGroup = this.Network.GetGroup().group();

  this.RenderConnection(gridPath1);
  this.RenderConnection(gridPath2);
  this.RenderConnection(gridPath3);
  this.RenderConnection(gridPath4);
  return this.connectionGroup;
}

N.Test.PiConnectionCreator.prototype.RenderConnection = function(gridPath) {

  var router = this.Network.Router;
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

  this.connectionGroup.path(pathString).attr({ 'fill': 'none', 'stroke-linejoin': 'round', class: 'pi-connection simple-excitatory-connection' });
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

  //************************
  //* N.Test.PiRouteFinder *
  //************************

N.Test.PiRouteFinder = function(network) {
  this.Network = network;
}

N.Test.PiRouteFinder.prototype.FindRoute = function(startNeuron, endNeuron, endAngle, router) {
  // Draw a line from start to end
  var startPoints = router.GetNeuronOutputPosition(startNeuron);
  this.Start = { Base: startPoints[0], End: startPoints[1] };

  // Determine the end point.
  // First, are traveling down on the screen or up?
  var startAboveEnd = (startNeuron.R < endNeuron.R ? true : false);
  var fromX = router.GetNeuronOutputPosition(startNeuron)[0].X;
  var toX   = router.GetNeuronOutputPosition(endNeuron)[0].X;
  var laneRows = router.LaneRows[endNeuron.R];
  var lane = laneRows[(fromX < toX ? endNeuron.C : endNeuron.C+1)];
  this.End = { X:lane.Mid, Y:(startAboveEnd ? lane.ThruNeg.Mid : lane.ThruPos.Mid) };

  var start = this.Start.End;
  var end = this.End;
  var vec = (new N.UI.Vector((end.X-start.X), (end.Y-start.Y))).Normalize();
  var incVert = (vec.Y > 0.0 ? 1 : -1);

  // For each thruway...
  this.VerticalPassasges = [];
  var thruIndexStart = startNeuron.R;
  var thruIndexEnd = endNeuron.R;
  for(var i = thruIndexStart; i !== thruIndexEnd; i += incVert) {

    var laneIndex;
    switch(i) {
      case 3: laneIndex = 1; break;
      case 2: laneIndex = 2; break;
      case 1: laneIndex = 2; break;
      default: laneIndex = 0;
    }

    this.VerticalPassasges.push( { LaneRowIndex: i, LaneIndex: laneIndex } );
  }
}

N.Test.PiRouteFinder.prototype.DotProduct = function(v1, v2) {
  return v1.X*v2.X+v1.Y*v2.Y;
}

N.Test.PiRouteFinder.prototype.Length = function(v) {
  return Math.sqrt(v.X*v.X+v.Y*v.Y);
}

N.Test.PiRouteFinder.prototype.Normalize = function(v) {
  var lInv = 1.0/this.Length(v);
  return { X: lInv*v.X, Y: lInv*v.Y };
}

N.Test.PiRouteFinder.prototype.GetPath = function(router) {
  this.BuildPath(router);

  var path = 'M'+this.Vertices[0].X+' '+this.Vertices[0].Y;
  for(var i=1; i<this.Vertices.length; i++) {
    var s = this.Vertices[i];
    path += 'L'+s.X+' '+s.Y;
  }
  return path;
}

N.Test.PiRouteFinder.prototype.BuildPath = function(router) {

  var simpleVertices = this.CreateSimpleVertices(router);
  this.CalculateLengths(simpleVertices);
  // Add chamfers.
  this.Vertices = [];
  this.Vertices.push(simpleVertices[0]);

  var v1, v2;
  for(var i=1; i<simpleVertices.length-1; i++) {
    if(simpleVertices[i].Join) {
      // From the points, construct
      v1 = this.Vector(points[i-1], points[i]);
      v2 = this.VectorFromSink(points[i+1]);
      var v3 = this.FindIntersection(v1.X, v1.Y, v1.DX+v1.X, v1.DY+v1.Y, v2.X, v2.Y, v2.DX+v2.X, v2.DY+v2.Y);
      newPoints.push(v3);
      newPoints.push(v2);
    }
    else {
      var chamferSize = 5;
      var corner1 = simpleVertices[i].Shorten(simpleVertices[i-1], chamferSize);
      var corner2 = simpleVertices[i].Shorten(simpleVertices[i+1], chamferSize);
      this.Vertices.push(corner1);
      this.Vertices.push(corner2);
      //this.Vertices.push(simpleVertices[i]);
    }
  }

  this.Vertices.push(simpleVertices[simpleVertices.length-1]);
}

N.Test.PiRouteFinder.prototype.CreateSimpleVertices = function(router) {
  var vertices = [];
  vertices.push(this.Start.Base);
  vertices.push(this.Start.End);

  for(var i=0; i<this.VerticalPassasges.length; i++) {
    var vp = this.VerticalPassasges[i];
    var lane = router.LaneRows[vp.LaneRowIndex][vp.LaneIndex];
    var x = lane.Mid;
    var yPos = lane.ThruPos.Mid;
    var yNeg = lane.ThruNeg.Mid;
    vertices.push( new N.UI.Vector(x, yPos) );
    vertices.push( new N.UI.Vector(x, yNeg) );
  }

  vertices.push(this.End);
  return vertices;
}

N.Test.PiRouteFinder.prototype.CalculateLengths = function(simpleVertices) {
  for(var i=0; i<simpleVertices.length-1; i++) {
    var v1 = simpleVertices[i];
    var v2 = simpleVertices[i+1];

  }
}
