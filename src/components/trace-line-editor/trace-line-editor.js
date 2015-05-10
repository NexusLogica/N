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
      scene: '=scene',
      scriptHost: '=scriptHost'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'traceLineEditor', $scope, $element, $attrs);

      $scope.isDirty = false;

      $scope.stateMachine = StateMachine.create({
        initial: { state: 'Init' },
        events: [
          { name: 'init',             from: '*',                          to: 'Starting'       },
          { name: 'componentClick',   from: 'Starting',                   to: 'ComponentStart' },
          { name: 'backgroundClick',  from: 'ComponentStart',             to: 'TraceBegin'     },
          { name: 'componentClick',   from: 'ComponentStart',             to: 'ComponentEnd'   },
          { name: 'backgroundClick',  from: ['TraceBegin', 'TracePoint'], to: 'TracePoint'     },
          { name: 'componentClick',   from: ['TraceBegin', 'TracePoint'], to: 'ComponentEnd'   }
        ],
        timeouts: [],
        callbacks: {
          onenterStarting: function() {
            $scope.beginTrace();
            $scope.start();
            $scope.debugText = $scope.stateMachine.current;
          },
          onenterComponentStart: function() {
            $scope.debugText = $scope.stateMachine.current;
          },
          onenterTraceBegin: function() {
            $scope.debugText = $scope.stateMachine.current;
          },
          onenterComponentEnd: function() {
            $scope.piConnection = undefined;
            $scope.stateMachine.idle();
            $scope.debugText = $scope.stateMachine.current;
          }
        }
      });

    }],
    link: function ($scope, $element, $attrs, ctrl) {

      $scope.$on('traceLineEditor:begin', function() {
        $scope.scene.piNetwork.group.addClass('soften-component');
        getConnections();
        $scope.scene.piNetwork.showGrid();
      });

      var getConnections = function() {
        $scope.connections = [];
        var connections = $scope.scene.piNetwork.network.connections;
        getConnectionsForNetwork($scope.scene.piNetwork);

        $scope.stateMachine.init();
      };

      var getConnectionsForNetwork = function(piNetwork) {
        var connections = piNetwork.network.connections;
        for(var i=0; i<connections.length; i++) {
          var connection = connections[i];
          var split = N.fromConnectionPaths(piNetwork, connection.getPath());
          var connectionData = {
            piNetwork: piNetwork,
            path: connection,
            piSource: split.source,
            piSink: split.sink,
            obj: connection
          };
          $scope.connections.push(connectionData);
        }

        _.forEach(piNetwork.piNetworks, function(n) {
          getConnectionsForNetwork(n);
        });
      };

      var highlightStartableCompartments = function() {
        $scope.highlighted = [];
        _.forEach($scope.connections, function(connection) {
          connection.piSource.path.addClass('highlight-component');
          connection.piSink.path.addClass('highlight-component');
          $scope.highlighted.push(connection.piSource);
          $scope.highlighted.push(connection.piSink);
        });
      };

      $scope.start = function() {
        $scope.inputComponent = undefined;
        $scope.outputComponent = undefined;
        $scope.stateMachine.init();

        $scope.sceneSignals['component-click'].add(function(event) {
          $scope.$apply(function() {
            if($scope.stateMachine.can('componentClick')) {
              $scope.lastX = undefined;
              $scope.lastY = undefined;
              $scope.lastSnapX = undefined;
              $scope.lastSnapY = undefined;
              var n = event.piCompartment.neuron;
              var s = n.scale;

              if($scope.stateMachine.is('Starting')) {
                $scope.createPiConnection();
                $scope.trace = {
                  start: {
                    component: event.compartment.name,
                    center: {x: n.x / s, y: n.y / s},
                    radius: n.radius / s
                  },
                  points: []
                };
                $scope.debugText = 'State: ' + $scope.stateMachine.current + ' - ' + JSON.stringify($scope.trace);
              } else {
                $scope.trace.end = {
                  component: event.compartment.name,
                  center: {x: n.x / s, y: n.y / s},
                  radius: n.radius / s
                };
                $scope.piConnection.setRoute($scope.trace);
                $scope.trace = undefined;
                $scope.isDirty = true;
              }

              $scope.stateMachine.componentClick();
            }
          });
        });

        $scope.sceneSignals['background-click'].add(function(event) {
          $scope.$apply(function() {
            if(event.snap.x !== $scope.lastX || event.snap.y !== $scope.lastY) {
              $scope.lastX = event.snap.x;
              $scope.lastY = event.snap.y;
              $scope.stateMachine.backgroundClick();
              var net = event.piNetwork;
              var point = { pos: event.snap};
              $scope.trace.points.push(point);
              $scope.debugText = 'State: ' + $scope.stateMachine.current + ' - ' + JSON.stringify(point.pos);
              $scope.piConnection.setRoute($scope.trace);
            }
          });
        });

        $scope.sceneSignals['component-move'].add(function(event) {
          if($scope.trace) {
            var n = event.piCompartment.neuron;
            var s = n.scale;
            var traceCopy = _.cloneDeep($scope.trace);
            traceCopy.end = {
              component: event.compartment.name,
              center: {x: n.x / s, y: n.y / s},
              radius: n.radius / s
            };
            $scope.piConnection.setRoute(traceCopy);
          }
        });

        $scope.sceneSignals['background-move'].add(function(event) {
          if($scope.trace && (event.snap.x !== $scope.lastSnapX || event.snap.y !== $scope.lastSnapY)) {
            $scope.lastSnapX = event.snap.x;
            $scope.lastSnapY = event.snap.y;
            var net = event.piNetwork;
            var point = { pos: event.snap };
            var traceCopy = _.cloneDeep($scope.trace);
            traceCopy.points.push(point);
            $scope.piConnection.setRoute(traceCopy);
          }
        });

        $scope.debugText = '';
      };

      $scope.beginTrace = function() {
        highlightStartableCompartments();
      };

      $scope.createPiConnection = function() {
        // Create in the top level network and move it downward later if need be.
        $scope.piConnection = new N.UI.PiConnection($scope.scene.piNetwork);
        $scope.piConnection.setRoute($scope.trace);
        $scope.scene.piNetwork.addConnection($scope.piConnection);
      };

      $scope.save = function() {
        var display = $scope.scene.piNetwork.network.display;
        var path = display.$$path;
        var displayCopy = _.cloneDeep(display);
        delete displayCopy.$$path;

        var connections = $scope.scene.piNetwork.piConnections;
        var connectionJson = {};
        _.forEach(connections, function(piConnection) {
          connectionJson[piConnection.getPath()] = piConnection.toJson();
        });
        displayCopy.connections = connectionJson;


        var formData = new FormData();
        formData.append('file', new Blob([JSON.stringify(displayCopy, undefined, 2)], {
          type: 'text/plain'
        }));
        var deferred = N.Http.post($scope.scriptHost + '/file' + path, formData);
      };

      $scope.done = function() {
        $scope.$emit('traceLineEditor:done');
        $scope.scene.piNetwork.hideGrid();
        $scope.inputComponent.path.removeClass('highlight-component');
        $scope.outputComponent.path.removeClass('highlight-component');
        $scope.scene.piNetwork.group.removeClass('soften-component');
      };
    }
  }
}]);

