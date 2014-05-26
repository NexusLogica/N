/**********************************************************************

File     : pi-signal-trace-scene.js
Project  : N Simulator Library
Purpose  : Source file for pi signal-trace scene controller and renderer objects.
Revisions: Original definition by Lawrence Gunn.
           2014/03/08

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //**********************
  //* PiCanvasController *
  //**********************

var nSimAppControllers = angular.module('nSimApp.controllers');

nSimAppControllers.controller('PiSignalTraceSceneController', ['$scope',
  function PiSignalTraceSceneController($scope) {
    $scope.onCompartmentMouseEnter = function(event, compartment) {
      console.log('mouseEnter on ['+compartment.SignalTrace.SignalTrace.Name+'.'+compartment.SignalTrace.Name+':'+compartment.Name+']');
    }
  }
]);
