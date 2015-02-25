/**********************************************************************

File     : pi-neuron-panel.js
Project  : N Simulator Library
Purpose  : Source file for pi neuron panel controller and renderer objects.
Revisions: Original definition by Lawrence Gunn.
           2014/03/08

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};
N.UI = N.UI || {};

/**
 *
 * @type {module|module|*|module|module|module}
 */
var nSimAppControllers = angular.module('nSimApp.controllers');

nSimAppControllers.controller('PiNeuronPanelController', ['$scope',
  function PiNeuronPanelController($scope) {
    $scope.onCompartmentMouseEnter = function(event, compartment) {
      console.log('mouseEnter on ['+compartment.neuron.network.name+'.'+compartment.neuron.name+':'+compartment.name+']');
    }
  }
]);
