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

    $scope.Current = {};
    $scope.Current.HoverPath = '';
    $scope.Current.Compartment = null;

    /**
     * Sets HoverPath scope variable on mouse entering a compartment.
     * @method onCompartmentMouseEnter
     * @param event
     * @param compartment
     */
    $scope.onCompartmentMouseEnter = function(event, compartment) {
      var hoverPath = compartment.Neuron.Network.GetFullPath()+'.'+compartment.Neuron.ShortName+':'+compartment.ShortName;
      $scope.Current.HoverPath = hoverPath;
      $scope.$digest();
    }

    $scope.onCompartmentMouseLeave = function(event, compartment) {
      $scope.Current.HoverPath = '';
      $scope.$digest();
    }

    $scope.onCompartmentClick = function(event, compartment) {
      $scope.Current.Compartment = compartment;
      $scope.$digest();
    }
  }
]);
