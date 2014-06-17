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
          var path = scene.Grid.CreateStringPath(config.Lines[j].Start, config.Lines[j].End);
          var pathObj = scene.Grid.Group.path(path).attr({ 'class': 'grid-path-line' });
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

N.GridTest.prototype.Grids = [{
  Name: 'First',
  Rows: 20,
  Cols: 25,
  Blocks: [
    { X: 3, Y: 5, W: 4, H: 4 },
    { X: 19, Y: 1, W: 5, H: 5 },
    { X: 13, Y: 10, W: 4, H: 4 }
//    { X: 3, Y: 5, W: 2, H: 2 }
  ],
  Lines: [{
    Start: { X: 10, Y: 8 },
    End: { X: 12, Y: 3 }
  }, {
    Start: { X: 10, Y: 8 },
    End: { X: 23, Y: 0 }
  }, {
    Start: { X: 10, Y: 8 },
    End: { X: 20, Y: 15 }
  }, {
    Start: { X: 10, Y: 8 },
    End: { X: 2, Y: 7 }
  }]
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
