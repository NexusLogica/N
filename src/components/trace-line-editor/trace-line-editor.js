/**********************************************************************

 File     : trace-line-editor.js
 Project  : N Simulator Library
 Purpose  : Source file for an N signal viewer component.
 Revisions: Original definition by Lawrence Gunn.
            2015/04/20

 Copyright (c) 2015 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

angular.module('nSimulationApp').directive('traceLineEditor', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/trace-line-editor/trace-line-editor.html',
    scope: {
      signals: '=signals',
      sceneSignals: '=sceneSignals',
      scene: '=scene'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'traceLineEditor', $scope, $element, $attrs);

      $scope.stateMachine = StateMachine.create({
        initial: { state: 'Starting' },
        events: [
          { name: 'init',             from: '*',                        to: 'Starting'       },
          { name: 'componentClick',   from: 'Starting',                 to: 'ComponentStart' },
          { name: 'backgroundClick',  from: 'ComponentStart',           to: 'TraceBegin'     },
          { name: 'backgroundClick',  from: ['TraceBegin, TracePoint'], to: 'TracePoint'     },
          { name: 'componentClick',   from: 'TracePoint',               to: 'ComponentEnd'   }
        ],
        timeouts: [],
        callbacks: {
          onenterComponentStart: function() {
            $scope.beginTrace();
            $scope.debugText = $scope.stateMachine.current;
          },
          onenterTraceBegin: function() {
            $scope.debugText = $scope.stateMachine.current;
          }
        }
      });

    }],
    link: function ($scope, $element, $attrs, ctrl) {

      var getConnections = function() {
        $scope.connections = [];
        var connections = $scope.scene.piNetwork.network.connections;

        for(var i=0; i<connections.length; i++) {
          $scope.connections.push(connections[i]);
        }
      };

      getConnections();

      $scope.edit = function() {
        var connection = $element.find('select option:selected').scope().connection;
        var piComponents = N.fromConnectionPaths($scope.scene.piNetwork, connection.path);
        $scope.inputComponent = piComponents.source;
        $scope.outputComponent = piComponents.sink;
        $scope.inputComponent.path.addClass('highlight-component');
        $scope.outputComponent.path.addClass('highlight-component');

        $scope.scene.piNetwork.group.addClass('soften-component');
        $scope.stateMachine.init();


        $scope.sceneSignals['component-click'].add(function(event) {
          $scope.$apply(function() {
            $scope.stateMachine.componentClick();
            var n = event.piCompartment.neuron;
            var s = n.scale;
            $scope.trace = {
              start: {
                component: event.compartment.name,
                center: { x: n.x/s, y: n.y/s },
                radius: n.radius/s
              },
              points: []
            };
            $scope.debugText = 'State: '+$scope.stateMachine.current+' - '+JSON.stringify($scope.trace);

          });
        });

        $scope.sceneSignals['background-click'].add(function(event) {
          $scope.$apply(function() {
            $scope.stateMachine.backgroundClick();
            var net = event.piNetwork;
            var point = { network:net, pos: event.snap };
            $scope.trace.points.push(point);
            $scope.debugText = 'State: '+$scope.stateMachine.current+' - '+JSON.stringify(point.pos);

          });
        });

        $scope.debugText = '';
      };

      $scope.beginTrace = function() {

      };

      $scope.done = function() {
        $scope.$emit('traceLineEditor:done');
        $scope.inputComponent.path.removeClass('highlight-component');
        $scope.outputComponent.path.removeClass('highlight-component');
        $scope.scene.piNetwork.group.removeClass('soften-component');
      };
    }
  }
}]);

