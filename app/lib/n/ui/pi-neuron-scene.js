/**********************************************************************

File     : pi-neuron-scene.js
Project  : N Simulator Library
Purpose  : Source file for pi neuron scene controller and renderer objects.
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

nSimAppControllers.controller('PiNeuronSceneController', ['$scope',
  function PiNeuronSceneController($scope) {
    $scope.onCompartmentMouseEnter = function(event, compartment) {
      console.log('mouseEnter on ['+compartment.Neuron.Neuron.ShortName+'.'+compartment.Neuron.ShortName+':'+compartment.ShortName+']');
    }
  }
]);