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

    $scope.$on('pi-canvas:event', function(broadcastEvent, event, obj) {
      if(obj.GetType() === N.Type.PiCompartment) {
        switch(event.type) {
          case 'mouseenter' : OnCompartmentMouseEnter(event, obj); break;
          case 'mouseleave' : OnCompartmentMouseLeave(event, obj); break;
          case 'click'      : OnCompartmentClick(event, obj);      break;
        }
      }
    });

    /**
     * Sets HoverPath scope variable on mouse entering a compartment.
     * @method onCompartmentMouseEnter
     * @param event
     * @param compartment
     */
    var OnCompartmentMouseEnter = function(event, piCompartment) {
      var compObj = piCompartment.CompartmentObj;
      $scope.Current.HoverPath = GetCompartmentPath(compObj);
      piCompartment.Neuron.Highlight();
      $scope.$digest();
    }

    var OnCompartmentMouseLeave = function(event, piCompartment) {
      piCompartment.Neuron.RemoveHighlight();
      $scope.Current.HoverPath = '';
      $scope.$digest();
    }

    var OnCompartmentClick = function(event, piCompartment) {
      var classes, str;
      if($scope.Current.SelectedCompartment) {
        $scope.Current.SelectedCompartment.HideConnections();
        var path = $scope.Current.SelectedCompartment.path;
        classes = path.attr('class').split(' ');
        str = _.without(classes, 'selected').join(' ');
        path.attr( { 'class': str });
      }

      $scope.Current.Selected = GetCompartmentPath(piCompartment.CompartmentObj);
      $scope.Current.SelectedCompartment = piCompartment;
      classes = piCompartment.path.attr('class').split(' ');
      piCompartment.ShowConnections();
      str = _.union(classes, ['selected']).join(' ');
      piCompartment.path.attr( { 'class': str });
      $scope.$digest();
    }

    var GetCompartmentPath = function(compartment) {
      return compartment.Neuron.Network.GetFullPath()+':'+compartment.Neuron.Name+'>'+compartment.Name;
    }
  }
]);
