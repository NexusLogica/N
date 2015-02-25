/**********************************************************************

File     : pi-neuron-info-scene.js
Project  : N Simulator Library
Purpose  : Source file for pi neuron information panel controller.
Revisions: Original definition by Lawrence Gunn.
           2014/03/09

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //*******************************
  //* PiNeuronInfoPanelController *
  //*******************************

var nSimAppControllers = angular.module('nSimApp.controllers');

/**
 * The neuron information panel controller. Create via<br/>&nbsp;&nbsp;&nbsp;&lt;div ng-controller="PiNeuronInfoPanelController"&gt;...<br/>
 *
 *
 * @class PiNeuronInfoPanelController
 */
nSimAppControllers.controller('PiNeuronInfoPanelController', ['$scope',
  function PiNeuronInfoPanelController($scope) {
    $scope.$on('pi-canvas:event', function(broadcastEvent, event, obj) {
      if(obj.getType() === N.Type.PiCompartment) {
        switch(event.type) {
        }
      }
    });
  }
]);
