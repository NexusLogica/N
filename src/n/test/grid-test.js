/**********************************************************************

File     : grid-test.js
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
    $scope.test = new N.GridTest();
    $scope.test.createScenes();
    $scope.scenes = $scope.test.scenes;
    $scope.testInfo = { name: 'Grid Test' };
    $timeout(function() {
      for(var i in $scope.scenes) {
        var scene = $scope.scenes[i];
        var config = $scope.test.grids[i];
        for(var j in config.lines) {
          var start = config.lines[j].start;
          for(var k in config.lines[j].ends) {
            var end = config.lines[j].ends[k];
            var path = scene.grid.createStringPath({ x: start[0], y: start[1] }, end);
            var pathObj = scene.grid.group.path(path).attr({ 'class': 'grid-path-line' });
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
  this.scenes  = [];
}

var s
N.GridTest.prototype.grids = [{
  name: 'First',
  rows: 30,
  cols: 35,
  blocks: [
//    { x: 3, y: 5, W: 4, H: 4 },
//    { x: 19, y: 1, W: 5, H: 5 },
//    { x: 13, y: 10, W: 4, H: 4 }
//    { x: 3, y: 5, W: 2, H: 2 }
  ],
  circles: {
    'SS[0]': { x: 8,  y: 5, r: 1.5 },
    'SS[1]': { x: 16, y: 5, r: 1.5 },
    'SS[2]': { x: 24, y: 5, r: 1.5 },
    'SS[3]': { x: 8,  y: 11, r: 1.5 },
    'SS[4]': { x: 16, y: 11, r: 1.5 },
    'SS[5]': { x: 24, y: 11, r: 1.5 }
},
  lines: [{
    //start: [ 0, 0],
    start: [ 16, 8],
    ends: [
      { target: 'SS[0]', startAngle: 10, endAngle: 70 },
      { target: 'SS[1]', startAngle: 10, endAngle: 70 },
      { target: 'SS[2]', startAngle: 10, endAngle: 70 },
      { target: 'SS[3]', startAngle: 10, endAngle: 70 },
      { target: 'SS[4]', startAngle: 10, endAngle: 70 },
      { target: 'SS[5]', startAngle: 10, endAngle: 70 }
//    Start: [ 0, 0],
//    Ends: [[12, 3], [23, 0], [20, 15], [2, 7]]
  ]}]
}];

N.GridTest.prototype.createScenes = function() {

  for(var i=0; i<this.grids.length; i++) {
    var config = this.grids[i];
    var grid = (new N.UI.PiGrid()).loadFrom(config);

    var scene = new N.UI.GridScene();
    scene.layout(grid);
    this.scenes.push(scene);
  }
}
