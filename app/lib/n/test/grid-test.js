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

  //**********************
  //* GridTestController *
  //**********************

var nSimAppControllers = angular.module('nSimApp.controllers');

nSimAppControllers.controller('GridTestController', ['$scope', '$timeout',
  function GridTestController($scope, $timeout) {
    $scope.Test = new N.GridTest();
    $scope.Test.CreateScenes();
    $scope.Scenes = $scope.Test.Scenes;
    $scope.TestInfo = { Name: 'Grid Test' };
    $timeout(function() {
      for(var i in $scope.Scenes) {
        var scene = $scope.Scenes[i];
        var config = $scope.Test.Grids[i];
        for(var j in config.Lines) {
          var start = config.Lines[j].Start;
          for(var k in config.Lines[j].Ends) {
            var end = config.Lines[j].Ends[k];
            var path = scene.Grid.CreateStringPath({ X: start[0], Y: start[1] }, end);
            var pathObj = scene.Grid.Group.path(path).attr({ 'class': 'grid-path-line' });
          }
        }
      }
    }, 1);
  }
]);

  //**************
  //* N.GridTest *
  //**************

N.GridTest = function() {
  this.Scenes  = [];
}

var s
N.GridTest.prototype.Grids = [{
  Name: 'First',
  Rows: 30,
  Cols: 35,
  Blocks: [
//    { X: 3, Y: 5, W: 4, H: 4 },
//    { X: 19, Y: 1, W: 5, H: 5 },
//    { X: 13, Y: 10, W: 4, H: 4 }
//    { X: 3, Y: 5, W: 2, H: 2 }
  ],
  Circles: {
    'SS[0]': { X: 6,  Y: 5, R: 1.5 },
    'SS[1]': { X: 16, Y: 5, R: 1.5 },
    'SS[2]': { X: 26, Y: 5, R: 1.5 },
    'SS[3]': { X: 6,  Y: 15, R: 1.5 },
    'SS[4]': { X: 16, Y: 15, R: 1.5 },
    'SS[5]': { X: 26, Y: 15, R: 1.5 }
},
  Lines: [{
    Start: [ 0, 0],
    Ends: [
      { Target: 'SS[0]', StartAngle: 10, EndAngle: 70 },
      { Target: 'SS[1]', StartAngle: 10, EndAngle: 70 },
      { Target: 'SS[2]', StartAngle: 10, EndAngle: 70 },
      { Target: 'SS[3]', StartAngle: 10, EndAngle: 70 },
      { Target: 'SS[4]', StartAngle: 10, EndAngle: 70 },
      { Target: 'SS[5]', StartAngle: 10, EndAngle: 70 }
//    Start: [ 9, 8],
//    Start: [ 0, 0],
//    Ends: [[12, 3], [23, 0], [20, 15], [2, 7]]
  ]}]
}];

N.GridTest.prototype.CreateScenes = function() {

  for(var i=0; i<this.Grids.length; i++) {
    var config = this.Grids[i];
    var grid = (new N.UI.PiGrid()).LoadFrom(config);

    var scene = new N.UI.GridScene();
    scene.Layout(grid);
    this.Scenes.push(scene);
  }
}
