/**********************************************************************

File     : pi-hover-path.js
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

/**
 * The network scene controller. Create via<br/>&nbsp;&nbsp;&nbsp;&lt;div ng-controller="PiNetworkPanelController"&gt;...<br/>
 * @class PiNetworkPanelController
 */
angular.module('nSimApp.directives').directive('piHoverPath', [ function() {
  return {
    restrict: 'E',
    template: '<div class="pi-hover-path"><span class="action">Neuron:</span> <span class="path" ng-bind="current.hoverPath"></span></div>',
    controller: function($scope) {
      $scope.current = {};
      $scope.current.hoverPath = '';
      $scope.current.selected = '';
      $scope.current.compartment = null;
      $scope.current.selectedCompartment = null;

      $scope.$on('pi-canvas:event', function(broadcastEvent, event, obj) {
        if(obj.getType() === N.Type.PiCompartment) {
          switch(event.type) {
            case 'mouseenter' : onCompartmentMouseEnter(event, obj); break;
            case 'mouseleave' : onCompartmentMouseLeave(event, obj); break;
            case 'click'      : onCompartmentClick(event, obj);      break;
          }
        }
      });

      /**
       * Sets hoverPath scope variable on mouse entering a compartment.
       * @method onCompartmentMouseEnter
       * @param event
       * @param compartment
       */
      var onCompartmentMouseEnter = function(event, piCompartment) {
        var compObj = piCompartment.compartmentObj;
        $scope.current.hoverPath = getCompartmentPath(compObj);
        piCompartment.neuron.highlight();
        $scope.$digest();
      }

      var onCompartmentMouseLeave = function(event, piCompartment) {
        piCompartment.neuron.removeHighlight();
        $scope.current.hoverPath = '';
        $scope.$digest();
      }

      var onCompartmentClick = function(event, piCompartment) {
        var classes, str;
        if($scope.current.selectedCompartment) {
          $scope.current.selectedCompartment.hideConnections();
          var path = $scope.current.selectedCompartment.path;
          classes = path.attr('class').split(' ');
          str = _.without(classes, 'selected').join(' ');
          path.attr( { 'class': str });
        }

        $scope.current.selected = getCompartmentPath(piCompartment.compartmentObj);
        $scope.current.selectedCompartment = piCompartment;
        classes = piCompartment.path.attr('class').split(' ');
        piCompartment.showConnections();
        str = _.union(classes, ['selected']).join(' ');
        piCompartment.path.attr( { 'class': str });
        $scope.$digest();
      }

      var getCompartmentPath = function(compartment) {
        return compartment.neuron.network.getFullPath()+':'+compartment.neuron.name+'>'+compartment.name;
      }
    }
  };
}]);
