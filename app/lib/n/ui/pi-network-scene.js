/**********************************************************************

File     : pi-network-scene.js
Project  : N Simulator Library
Purpose  : Source file for pi network scene controller and renderer objects.
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

/**
 * The network scene controller. Create via<br/>&nbsp;&nbsp;&nbsp;&lt;div ng-controller="PiNetworkSceneController"&gt;...<br/>
 *
 *
 * @class PiNetworkSceneController
 */
nSimAppControllers.controller('PiNetworkSceneController', ['$scope',
  function PiNetworkSceneController($scope) {

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
      hoverPath += ' ('+compartment.Neuron.Name+' : '+compartment.Name+')';
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