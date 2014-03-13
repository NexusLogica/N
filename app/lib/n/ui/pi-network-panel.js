/**********************************************************************

File     : pi-network-panel.js
Project  : N Simulator Library
Purpose  : Source file for pi network panel controller and renderer objects.
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

var nSimAppControllers = angular.module('nSimApp.controllers');

/**
 * The network scene controller. Create via<br/>&nbsp;&nbsp;&nbsp;&lt;div ng-controller="PiNetworkPanelController"&gt;...<br/>
 * @class PiNetworkPanelController
 */
nSimAppControllers.controller('PiNetworkPanelController', ['$scope',
  function PiNetworkPanelController($scope) {

    $scope.Current = {};
    $scope.Current.HoverPath = '';
    $scope.Current.Selected = '';
    $scope.Current.Compartment = null;
    $scope.Current.SelectedCompartment = null;

    /**
     * Sets HoverPath scope variable on mouse entering a compartment.
     * @method onCompartmentMouseEnter
     * @param event
     * @param compartment
     */
    $scope.onCompartmentMouseEnter = function(event, piCompartment) {
      var compObj = piCompartment.CompartmentObj;
      $scope.Current.HoverPath = $scope.GetCompartmentPath(compObj)+' ('+compObj.Neuron.Name+' : '+compObj.Name+')';
      $scope.$digest();
    }

    $scope.onCompartmentMouseLeave = function(event, piCompartment) {
      $scope.Current.HoverPath = '';
      $scope.$digest();
    }

    $scope.onCompartmentClick = function(event, piCompartment) {
      if($scope.Current.SelectedCompartment) {
        var path = $scope.Current.SelectedCompartment.path;
        var classes = path.attr('class').split(' ');
        var str = _.without(classes, 'selected').join(' ');
        path.attr( { 'class': str });
      }
      $scope.Current.Selected = $scope.GetCompartmentPath(piCompartment.CompartmentObj);
      $scope.Current.SelectedCompartment = piCompartment;
      var classes = piCompartment.path.attr('class').split(' ');
      var str = _.union(classes, ['selected']).join(' ');
      piCompartment.path.attr( { 'class': str });
      $scope.$digest();
    }

    $scope.GetCompartmentPath = function(compartment) {
      return compartment.Neuron.Network.GetFullPath()+':'+compartment.Neuron.ShortName+'.'+compartment.ShortName;
    }
  }
]);
