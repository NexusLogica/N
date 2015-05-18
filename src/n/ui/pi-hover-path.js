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
angular.module('nSimulationApp').directive('piHoverPath', [ '$timeout', function($timeout) {
  return {
    restrict: 'E',
    template: '<div class="pi-hover-path"><span class="action">Neuron:</span> <span class="path" ng-class="{ blank: !hovering, showing: hovering }" ng-bind="current.hoverPath"></span></div>',
    controller: function($scope) {
      $scope.current = {};
      $scope.current.hoverPath = '';
      $scope.current.selected = '';
      $scope.current.compartment = null;
      $scope.current.selectedCompartment = null;
      $scope.current.newHoverPath = '';
      $scope.hovering = false;

      var hookUpSignals = function() {
        if($scope.signals) {
          $scope.signals['compartment-enter'].add(function (event, piCompartment) {
            $scope.$apply(function () {
              var compObj = piCompartment.compartmentObj;
              $scope.current.hoverPath = getCompartmentPath(compObj);
              piCompartment.neuron.highlight();
              $scope.hovering = true;
            });
          });

          $scope.signals['compartment-leave'].add(function (event, piCompartment) {
            $scope.$apply(function () {
              var compObj = piCompartment.compartmentObj;
              $scope.newHoverPath = '';
              $scope.hovering = false;
              $timeout(function() {
                if(!$scope.hovering) { $scope.current.hoverPath = $scope.newHoverPath; }
              }, 500);
            });
          });

          $scope.signals['compartment-click'].add(function (event, piCompartment) {
            $scope.$apply(function () {
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
            });
          });

        }
      };

      hookUpSignals();

      var getCompartmentPath = function(compartment) {
        return compartment.neuron.network.getFullPath()+':'+compartment.neuron.name+'>'+compartment.name;
      }
    }
  };
}]);
