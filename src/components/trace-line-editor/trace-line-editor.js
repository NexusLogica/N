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
          { name: 'componentClick',   from: ['TraceBegin', 'TracePoint'], to: 'ComponentEnd'   },
          { name: 'idle',             from: '*',                          to: 'Idle'   }
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

            $timeout(function() {
              $scope.stateMachine.init();
            }, 500);
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
          var piSplit = N.fromConnectionPaths(piNetwork, connection.getPath());
          var split = N.fromConnectionPaths(piNetwork.network, connection.getPath());
          var connectionData = {
            piNetwork: piNetwork,
            connection: connection,
            source: split.source,
            sink: split.sink,
            piSource: piSplit.source,
            piSink: piSplit.sink,
            obj: connection
          };
          $scope.connections.push(connectionData);
        }

        _.forEach(piNetwork.piNetworks, function(n) {
          getConnectionsForNetwork(n);
        });
      };

      var highlightStartableCompartments = function(connectionList) {
        var connections = connectionList || $scope.connections;
        $scope.highlighted = [];
        _.forEach(connections, function(connection) {
          connection.piSource.path.addClass('highlight-component');
          connection.piSink.path.addClass('highlight-component');
          $scope.highlighted.push(connection.piSource);
          $scope.highlighted.push(connection.piSink);
        });
      };

      var removeAllHighlights = function() {
        if($scope.highlighted) {
          _.forEach($scope.highlighted, function (comp) {
            comp.path.removeClass('highlight-component');
          });
          $scope.highlighted = undefined;
        }
      };

      $scope.start = function() {
        $scope.inputComponent = undefined;
        $scope.outputComponent = undefined;
        $scope.stateMachine.init();

        $scope.sceneSignals['component-click'].add(function(event) {
          var isReversed, found;
          $scope.$apply(function() {
            if($scope.stateMachine.can('componentClick')) {
              $scope.lastX = undefined;
              $scope.lastY = undefined;
              $scope.lastSnapX = undefined;
              $scope.lastSnapY = undefined;
              var n = event.piCompartment.neuron;
              var x = n.x;
              var y = n.y;
              if(n.network.parentPiNetwork) {
                x += n.network.x;
                y += n.network.y;
              }
              var s = n.scale;
              x /= s;
              y /= s;

              if($scope.stateMachine.is('Starting')) {
                var connectionHalfPath = event.compartment.getPath();

                var matches = [];
                _.forEach($scope.connections, function(connection) {
                  var srcPath = connection.source.getPath();
                  var snkPath = connection.sink.getPath();
                  if(connectionHalfPath === srcPath || connectionHalfPath === snkPath) {
                    matches.push(connection);
                  }
                });

                if(!matches.length) {
                  $scope.setMessage('That compartment does not connect to any other compartments.', 'error');
                  return;
                }

                removeAllHighlights();
                highlightStartableCompartments(matches);

                $scope.createPiConnection();
                $scope.trace = {
                  start: {
                    component: event.compartment.getPath(),
                    center: {x: x, y: y },
                    radius: n.radius / s
                  },
                  points: []
                };

                // Find the other connection.
                if(event.compartment.category === 'Output') {
                  var px = x;
                  var py = y+n.radius/s+0.1;
                  //$scope.lastX = px;
                  $scope.lastSnapX = px;
                  $scope.lastSnapY = py;
                  //$scope.lastY = py;
                  $scope.trace.points.push({ pos: { x: px, y: py } });
                }

                $scope.piConnection.setRoute($scope.trace);
                $scope.stateMachine.componentClick();
              } else {
                var endPath = event.compartment.getPath();
                if(endPath === $scope.trace.start.component) {
                  $scope.setMessage('You can not reconnect to the same compartment.', 'error');
                  return;
                } else {

                  // Find the other connection.
                  var isReversed = false;
                  var found = _.find($scope.connections, function(connection) {
                    var srcPath = connection.source.getPath();
                    var snkPath = connection.sink.getPath();
                    if($scope.trace.start.component === srcPath && endPath === snkPath) {
                      return true;
                    } else if($scope.trace.start.component === snkPath && endPath === srcPath) {
                      isReversed = true;
                      return true;
                    }
                    return false;
                  });

                  if(!found) {
                    $scope.setMessage('That compartment does not connect to the initial one selected.', 'error');
                    return;
                  }

                  $scope.piConnection.setConnection(found.connection);
                  $scope.trace.end = {
                    component: event.compartment.getPath(),
                    center: {x: x, y: y},
                    radius: n.radius / s
                  };

                  // If the user started the connection on the sink compartment we will need to reverse it.
                  if(isReversed) {
                    var end = $scope.trace.start;
                    $scope.trace.start = $scope.trace.end;
                    $scope.trace.end = end;

                    $scope.trace.points.reverse();
                  }

                  $scope.piConnection.setRoute($scope.trace);
                  $scope.trace = undefined;
                  $scope.isDirty = true;
                  $scope.stateMachine.componentClick();
                }
              }
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
          $scope.$apply(function() {
            if ($scope.trace) {// && $scope.stateMachine.current !== 'ComponentStart') {

              var n = event.piCompartment.neuron;
              var s = n.scale;
              var x = n.x;
              var y = n.y;
              if(n.network.parentPiNetwork) {
                x += n.network.x;
                y += n.network.y;
              }

              var traceCopy = _.cloneDeep($scope.trace);
              traceCopy.end = {
                component: event.compartment.name,
                center: {x: x / s, y: y / s},
                radius: n.radius / s
              };
              $scope.piConnection.setRoute(traceCopy);
            }
          });
        });

        $scope.sceneSignals['background-move'].add(function(event) {
          $scope.$apply(function() {
            if ($scope.trace && (event.snap.x !== $scope.lastSnapX || event.snap.y !== $scope.lastSnapY)) {
              $scope.lastSnapX = event.snap.x;
              $scope.lastSnapY = event.snap.y;
              var net = event.piNetwork;
              var point = {pos: event.snap};
              var traceCopy = _.cloneDeep($scope.trace);
              traceCopy.points.push(point);
              $scope.piConnection.setRoute(traceCopy);
            }
          });
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

      $scope.close = function() {
        $scope.scene.piNetwork.hideGrid();
        $scope.$emit('traceLineEditor:closing');
        removeAllHighlights();
        $scope.scene.piNetwork.group.removeClass('soften-component');
        $scope.stateMachine.idle();
      };

      $scope.setMessage = function(msg, msgType) {
        $scope.statusMessage = msg;
        $scope.statusMessageType = msgType || 'message';
      };

      $scope.setMessage('Select compartment to begin the trace');
    }
  }
}]);

