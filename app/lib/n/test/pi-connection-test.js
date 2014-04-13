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
    { Source: 'SS41>OP', Sinks: [ 'SS21>IP' ] },
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
    var routeFinder = new N.Test.PiRouteFinder(network);
    routeFinder.FindRoute(source, sinks[i], sinks[i].Angle, network.Router);
    var pathString = routeFinder.GetPath(network.Router);
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
  this.ChamferSize = 5.0;
  this.MinSegmentLength = 10.0;
}

N.Test.PiRouteFinder.prototype.FindRoute = function(startNeuron, endNeuron, endAngle, router) {
  // Draw a line from start to end
  var startPoints = router.GetNeuronOutputPosition(startNeuron);
  this.Start = { Base: startPoints[0], End: startPoints[1] };

  var nStart = router.GetNeuron(startNeuron);
  var nEnd   = router.GetNeuron(endNeuron);

  // Determine the end point.
  // First, are traveling down on the screen or up?
  var startAboveEnd = (nStart.Row < nEnd.Row ? true : false);
  var fromX = router.GetNeuronOutputPosition(startNeuron)[0].X;
  var toX   = router.GetNeuronOutputPosition(endNeuron)[0].X;
  var laneRows = router.LaneRows[nEnd.Row];
  var lane = laneRows[(fromX < toX ? nEnd.Col : nEnd.Col+1)];
  this.End = new N.UI.Vector(lane.Mid, (startAboveEnd ? lane.ThruNeg.Mid : lane.ThruPos.Mid));

  // Which direction do we go?
  this.IncVert = (nStart.Row < nEnd.Row ? 1 : -1);

  // The last vertex on the past found.
  var currentVertex = this.Start.End;

  this.NeuronEnd = this.FindEndAngle(router, endNeuron, new N.UI.Vector(-(this.Start.End.X-nEnd.X), -(this.Start.End.Y-nEnd.Y)), this.End);

  // For each thruway...
  this.VerticalPassages = [];
  var startNeuronRow = (this.IncVert > 0 ? nStart.Row+1 : nStart.Row);
  for(var i = startNeuronRow; i !== nEnd.Row; i += this.IncVert) {
    // Start by drawing a line from the last vertex exit to the end point.
    var targetVec = (new N.UI.Vector(this.End, currentVertex)).Normalize();
    var slope = targetVec.Y/targetVec.X;

    var lanes = router.LaneRows[i];
    var diffs = [];
    for(var j=0; j<lanes.length; j++) {
      lane = lanes[j];
      var dTarget = (lane.Mid-currentVertex.X)*slope+currentVertex.Y;
      var dLane = lane.YMid;
      var diff = dTarget-dLane;
      diffs.push(Math.abs(diff));
    }

    var laneIndex = N.IndexOfMin(diffs);

    this.VerticalPassages.push( { LaneRowIndex: i, LaneIndex: laneIndex } );
  }
}

N.Test.PiRouteFinder.prototype.FindEndAngle = function(router, endNeuron, directionVector, endPoint) {
  var n = router.GetNeuron(endNeuron);
  var comp = n.CompartmentsById[N.CompFromPath(endNeuron)];
  var angles = comp.DockAngles;
  var quadrants = [ [], [], [], [] ]; // 0->90, 90->180, 180->270, 270->360
  for (var i in angles) {
    // Go through each quadrant.
    var angle = angles[i];
    var from = angle.From;
    var to = angle.To;
    if (from > to) { from -= 360.0; }
    if (to > 360 || from > 360) { to -= 360.0; from -= 360.0; }

    for (var j=0; j<4; j++) {
      var low = 90*j;
      var high = low+90;
      if (from <= high || to >= low) {
        quadrants[j].push(i);
      }
    }
  }

  // Which quadrant is ideal?
  var directionQuadrant = (directionVector.X < 0 ? (directionVector.Y > 0.0 ? 3 : 0) : (directionVector.Y > 0.0 ? 2 : 1));

  var qi = directionQuadrant;
  if(quadrants[directionQuadrant].length === 0) {
    qi = (directionQuadrant+1 < 3 ? directionQuadrant+1 : 0);
    if(quadrants[qi].length === 0) {
      qi = (directionQuadrant-1 < 3 ? directionQuadrant-1 : 0);
      if(quadrants[qi].length === 0) {
        qi = (directionQuadrant-2 < 3 ? directionQuadrant-2 : 0);
      }
    }
  }

  var exitAngle = qi*90+45;
  return { Angle: exitAngle, NeuronCenter: new N.UI.Vector(n.X, n.Y), Radius: n.Radius };
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

N.Test.PiRouteFinder.prototype.CreateSimpleVertices = function(router) {
  var vertices = [];
  vertices.push(this.Start.Base);
  vertices.push(this.Start.End);

  for(var i=0; i<this.VerticalPassages.length; i++) {
    var vp = this.VerticalPassages[i];
    var lane = router.LaneRows[vp.LaneRowIndex][vp.LaneIndex];
    var x = lane.Mid;
    var yPos = lane.ThruPos.Mid;
    var yNeg = lane.ThruNeg.Mid;
    if(this.IncVert > 0) { var temp = yPos; yPos = yNeg; yNeg = temp; }
    vertices.push( new N.UI.Vector(x, yPos) );
    vertices.push( new N.UI.Vector(x, yNeg) );
  }

  var dx = Math.cos(N.Rad(this.NeuronEnd.Angle));
  var dy = Math.sin(N.Rad(this.NeuronEnd.Angle));
  var rOuter = this.NeuronEnd.Radius+10;

  var v0 = vertices[vertices.length-1];
  var v1 = this.End;
  var v2 = this.NeuronEnd.NeuronCenter.Clone().Offset(rOuter*dx, rOuter*dy);
  var v3 = this.FindIntersection(v0.X, v0.Y, v1.X, v1.Y, v2.X, v2.Y, this.NeuronEnd.NeuronCenter.X, this.NeuronEnd.NeuronCenter.Y);
  vertices.push(v3);
  vertices.push(v2);
  vertices.push(this.NeuronEnd.NeuronCenter.Clone().Offset(this.NeuronEnd.Radius*dx, this.NeuronEnd.Radius*dy));
  return vertices;
}

N.Test.PiRouteFinder.prototype.BuildPath = function(router) {

  var simpleVertices = this.CreateSimpleVertices(router);
  this.CalculateLengths(simpleVertices);

  // Add chamfers.
  this.Vertices = [];
  this.Vertices.push(simpleVertices[0]);

  for(var i=1; i<simpleVertices.length-1; i++) {
    // Remove a segment.
    if(simpleVertices[i].Join) {
      // From the points, construct
      var v0 = simpleVertices[i-1];
      var v1 = simpleVertices[i];
      var v2 = simpleVertices[i+1];
      var v3 = simpleVertices[i+2];
      var v4 = this.FindIntersection(v0.X, v0.Y, v1.X, v1.Y, v2.X, v2.Y, v3.X, v3.Y);
      this.Vertices.push(v4);
      i++; // Skip the next segment.
    }
    // Add a segment...
    else {
      var corner1 = simpleVertices[i].Shorten(simpleVertices[i-1], this.ChamferSize);
      var corner2 = simpleVertices[i].Shorten(simpleVertices[i+1], this.ChamferSize);
      this.Vertices.push(corner1);
      this.Vertices.push(corner2);
      //this.Vertices.push(simpleVertices[i]);
    }
  }

  this.Vertices.push(simpleVertices[simpleVertices.length-1]);
}

N.Test.PiRouteFinder.prototype.CalculateLengths = function(simpleVertices) {
  for(var i=0; i<simpleVertices.length-1; i++) {
    var len =  simpleVertices[i].Distance(simpleVertices[i+1]);
    if(len < this.MinSegmentLength) {
      simpleVertices[i].Join = true;
    }
  }
}

N.Test.PiRouteFinder.prototype.FindIntersection = function(p0X, p0Y, p1X, p1Y, p2X, p2Y, p3X, p3Y) {
  var s1X = p1X - p0X;
  var s1Y = p1Y - p0Y;
  var s2X = p3X - p2X;
  var s2Y = p3Y - p2Y;

  var s = (-s1Y * (p0X - p2X) + s1X * (p0Y - p2Y)) / (-s2X * s1Y + s1X * s2Y);
  var t = ( s2X * (p0Y - p2Y) - s2Y * (p0X - p2X)) / (-s2X * s1Y + s1X * s2Y);

  return new N.UI.Vector(p0X + (t * s1X), p0Y + (t * s1Y));
}

