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
      $scope.connectionsToSave = [];

      $scope.stateMachine = StateMachine.create({
        initial: { state: 'Init' },
        events: [
          { name: 'init',                from: '*',                          to: 'Starting'       },
          { name: 'componentClick',      from: 'Starting',                   to: 'ComponentStart' },
          { name: 'backgroundClick',     from: 'ComponentStart',             to: 'TraceBegin'     },
          { name: 'componentClick',      from: 'ComponentStart',             to: 'ComponentEnd'   },
          { name: 'backgroundClick',     from: ['TraceBegin', 'TracePoint'], to: 'TracePoint'     },
          { name: 'componentClick',      from: ['TraceBegin', 'TracePoint'], to: 'ComponentEnd'   },
          { name: 'idle',                from: '*',                          to: 'Idle'           },

          { name: 'connectionClick',     from: 'Starting',                   to: 'Editing'        },
          { name: 'connectionClick',     from: 'Editing',                    to: 'EditMoving'     },
          { name: 'backgroundClick',     from: 'Editing',                    to: 'EditMoving'     },
          { name: 'connectionClick',     from: 'EditMoving',                 to: 'Editing'        },
          { name: 'backgroundClick',     from: 'EditMoving',                 to: 'Editing'        },

          { name: 'backgroundMouseMove', from: 'EditMoving',                 to: 'EditMoving'     },
          { name: 'keyEnter',            from: 'Editing',                    to: 'Starting'       },
          { name: 'keyEscape',           from: 'EditSelect',                 to: 'EditEnd'        },
          { name: 'keyDelete',           from: 'EditMoving',                 to: 'Editing'        }
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
          },
          onenterEditEnd: function() {
            $scope.piConnection = undefined;
            $scope.stateMachine.idle();
            $scope.debugText = $scope.stateMachine.current;

            $timeout(function() {
              $scope.stateMachine.init();
            }, 500);
          },
          onenterstate: function(event, from, to) {
            //N.log('**** TraceLine: '+event+': '+from+'->'+to);
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
        getConnectionsForNetwork($scope.scene.piNetwork);

        $scope.stateMachine.init();
      };

      var beginConnectionHighlight = function(piConnection) {
        $scope.scene.piNetwork.group.addClass('soften-connection');
        $scope.highlightedPiConnection = piConnection;
        piConnection.addClass('highlight');
      };

      var endConnectionHighlight = function() {
        $scope.scene.piNetwork.group.removeClass('soften-connection');
        if ($scope.highlightedPiConnection) {
          $scope.highlightedPiConnection.removeClass('highlight');
          $scope.highlightedPiConnection = undefined;
        }
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

      var getOtherNetworkConnections = function() {
        var other = [];

      };

      /***
       * Given an x,y position and a connection, return the node on the connection nearest the position.
       * @method findNearestNode
       * @param pos
       * @param piConnection
       */
      var findNearestNode = function(posLocal, piConnection) {
        var pts = piConnection.route.points;
        var minDistSqr = 0.2*0.2;
        var nearest;
        var offset = piConnection.piNetwork.getOffset();
        var pos = { x: posLocal.x-offset.x, y: posLocal.y-offset.y };
        for(var i=0; i<pts.length; i++) {
          var pt = pts[i].pos;
          if(!pos || !pt) {
            debugger;
          }
          var distSqr = (pos.x-pt.x)*(pos.x-pt.x)+(pos.y-pt.y)*(pos.y-pt.y);
          if((!nearest && distSqr < minDistSqr) || (nearest && distSqr < nearest.distSqr)) {
            nearest = { distSqr: distSqr, x: pt.x, y: pt.y, index: i };
          }
        }

        if(nearest) {
          nearest.dist = Math.sqrt(nearest.distSqr);
          N.log('********** findNearestNode');
          N.log('*** in pos =' + pos.x + ',' + pos.y);
          N.log('*** out pt = ' + nearest.x + ',' + nearest.y);
        }
        return nearest;
      };

      /***
       * Given an x,y position and a connection, return the nearest line segment and point on that line segment.
       * @method findNearestSegment
       * @param pos
       * @param piConnection
       */
      var findNearestSegment = function(posLocal, piConnection) {
        var pts = piConnection.route.points;
        var nearest;
        var minDistSqr = 0.2*0.2;
        var offset = piConnection.piNetwork.getOffset();
        var pos = { x: posLocal.x-offset.x, y: posLocal.y-offset.y };
        for(var i=1; i<pts.length; i++) {
          var p0 = pts[i-1].pos;
          var p1 = pts[i].pos;
          var distInfo = N.nearestPointOnLineSegment(pos.x, pos.y, p0.x, p0.y, p1.x, p1.y);
          if((!nearest && distInfo.distSqr < minDistSqr) || (nearest && distInfo.distSqr < nearest.distSqr)) {
            nearest = distInfo;
            nearest.index = i;
          }
        }

        if(nearest) {
          nearest.dist = Math.sqrt(nearest.distSqr);
          N.log('********** findNearestSegment');
          N.log('*** in pos ='+pos.x+','+pos.y);
          N.log('*** out pt = '+nearest.x+','+nearest.y);
        }
        return nearest;
      };

      /***
       * A click on a connection starts the connection editing. This function sets the targetConnection
       * @method beginConnectionEdit
       * @param event
       */
      var beginConnectionEdit = function(event) {
        $scope.$apply(function() {
          $scope.targetConnection = event.piConnection;
          $scope.targetNodeInitalPosition = undefined;
        });
      };

      /***
       * When in 'connection edit' mode, a click on or near a connection starts the node repositioning.
       * This function sets the targetConnection and initial position.
       * @method beginConnectionNodeMove
       * @param event
       */
      var beginConnectionNodeMove = function(event) {
        $scope.targetConnectionNode = findNearestNode(event.snap, $scope.targetConnection);
        if($scope.targetConnectionNode) {
          $scope.$apply(function() {
            updateRouteNode($scope.targetConnection, $scope.targetConnectionNode.index, event.snap);
          });
        }
        return $scope.targetConnectionNode;
      };

      /***
       * When in 'connection edit' mode, a click on or near a connection starts the node repositioning.
       * This function sets the targetConnection and initial position.
       * @method beginConnectionNewNodeMove
       * @param event
       */
      var beginConnectionNewNodeMove = function(event) {
        var t = findNearestSegment(event.snap, $scope.targetConnection);
        if(t) {
          $scope.$apply(function() {
            $scope.targetConnectionNode = t;
            $scope.targetConnection.route.points.splice($scope.targetConnectionNode.index, 0, { pos: { x: t.x, y: t.y } });
            updateRouteNode($scope.targetConnection, $scope.targetConnectionNode.index, event.snap);
          });
        }
        return t;
      };

      /***
       * When in connection edit mode a click on or near aa connection starts the node repositioning.
       * This function sets the targetConnectionNode to undefined.
       * @method endConnectionNodeMove
       * @param event
       */
      var endConnectionNodeMove = function(event) {
        $scope.targetConnectionNode = findNearestNode(event.snap, $scope.targetConnection);
        if($scope.targetConnectionNode) {
          $scope.$apply(function () {
            updateRouteNode($scope.targetConnection, $scope.targetConnectionNode.index, event.snap);
            $scope.targetConnectionNode = undefined;
          });
        }
      };

      var deleteCurrentNode = function(event) {
        if($scope.targetConnectionNode) {
          var routePoint = $scope.targetConnection.route.points.splice($scope.targetConnectionNode.index, 1);
          $scope.targetConnection.$$isDirty = true;
          $scope.targetConnection.setRoute($scope.targetConnection.route);
          $scope.targetConnectionNode = undefined;
        }
      };

      /***
       * Given a new snap for the node, set the point in the route and update the
       * connection if there is a change.
       * @method updateRouteNode
       * @param piConection
       * @param index - Index of the node to move
       * @param point
       */
      var updateRouteNode = function(piConnection, index, point) {
        var routePoint = piConnection.route.points[index];
        var offset = piConnection.piNetwork.getOffset();
        var pos = { x: point.x-offset.x, y: point.y-offset.y };
        if(routePoint.x !== pos.x || routePoint.y !== pos.y) {
          routePoint.pos.x = pos.x;
          routePoint.pos.y = pos.y;
          piConnection.$$isDirty = true;
          piConnection.setRoute(piConnection.route);
        }
      };


      /***
       * When completing a trace it then becomes clear
       * @method offsetTrace
       * @param x - the x amount to offset the trace
       * @param y - the y amount
       */
      var offsetTrace = function(x, y) {
        var pts = $scope.trace.points;
        for(var i=0; i<pts.length; i++) {
          var pos = pts[i].pos;
          pos.x -= x;
          pos.y -= y;
        }

        var c = $scope.trace.start.center;
        c.x -= x;
        c.y -= y;
        c = $scope.trace.end.center;
        c.x -= x;
        c.y -= y;
      };

      $scope.start = function() {
        $scope.inputComponent = undefined;
        $scope.outputComponent = undefined;
        $scope.stateMachine.init();

        $scope.sceneSignals['component-click'].add($scope.onComponentClick);
        $scope.sceneSignals['background-click'].add($scope.onBackgroundClick);
        $scope.sceneSignals['component-move'].add($scope.onComponentMove);
        $scope.sceneSignals['background-move'].add($scope.onBackgroundMove);
        $scope.sceneSignals['connection-enter'].add($scope.onConnectionEnter);
        $scope.sceneSignals['connection-move'].add($scope.onConnectionMove);
        $scope.sceneSignals['connection-leave'].add($scope.onConnectionLeave);
        $scope.sceneSignals['connection-click'].add($scope.onConnectionClick);
        $(document).on('keyup', $scope.onDocumentKeyUp);

        $scope.debugText = '';
      };

      $scope.onComponentClick =  function(event) {
        var isReversed, found;
        $scope.$apply(function() {
          if($scope.stateMachine.can('componentClick')) {
            $scope.lastX = undefined;
            $scope.lastY = undefined;
            $scope.lastSnapX = undefined;
            $scope.lastSnapY = undefined;
            var n = event.piCompartment.neuron;

            // These are in map (unscaled) units, not scaled ones.
            var offset = n.parentPiNetwork.getOffset();
            var x = n.x+offset.x;
            var y = n.y+offset.y;

            // TODO: Loop through parents adding x,y each time.
            var s = n.scale;
            // Was...
            // x /= s;
            // y /= s;

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
                  radius: n.radius
                },
                points: []
              };

              // Find the other connection.
              if(event.compartment.category === 'Output') {
                var px = x;
                var py = y+n.radius+0.1;
                //$scope.lastX = px;
                $scope.lastSnapX = px;
                $scope.lastSnapY = py;
                //$scope.lastY = py;
                $scope.trace.points.push({ pos: { x: px, y: py } });
              }

              $scope.piConnection.setRoute($scope.trace);
              $scope.stateMachine.componentClick();

            } else {
              // This is the save path.
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

                $scope.trace.end = {
                  component: event.compartment.getPath(),
                  center: {x: x, y: y},
                  radius: n.radius
                };

                // If the user started the connection on the sink compartment we will need to reverse it.
                if(isReversed) {
                  var end = $scope.trace.start;
                  $scope.trace.start = $scope.trace.end;
                  $scope.trace.end = end;

                  $scope.trace.points.reverse();
                }

                var offsetX = 0;
                var offsetY = 0;
                // TODO: Fix this for networks deeper than the top piNetwork.
                var connectionsPiNetwork;
                if(found.connection.network !== $scope.scene.piNetwork.network) {
                  var connectionsNetworkPath = found.connection.network.getPath();
                  connectionsPiNetwork = N.fromPath($scope.scene.piNetwork, connectionsNetworkPath);

                  // Get the offset of x,y.
                  offsetX = connectionsPiNetwork.x;
                  offsetY = connectionsPiNetwork.y;
                }

                $scope.piConnection.setConnection(found.connection);
                $scope.scene.piNetwork.removeConnection($scope.piConnection);

                if(connectionsPiNetwork) {

                  offsetTrace(offsetX, offsetY);

                  $scope.piConnection.setRoute($scope.trace);
                  $scope.piConnection.remove();
                  connectionsPiNetwork.addConnection($scope.piConnection);
                  connectionsPiNetwork.$$isDirty = true;
                } else {
                  // It was removed as anonymous and now is a proper connection.
                  $scope.scene.piNetwork.addConnection($scope.piConnection);
                  $scope.piConnection.setRoute($scope.trace);
                  $scope.scene.piNetwork.$$isDirty = true;
                }

                $scope.trace = undefined;
                $scope.isDirty = true;
                $scope.stateMachine.componentClick();
              }
            }
          }
        });
      };

      $scope.onBackgroundClick = function(event) {
        if($scope.stateMachine.current === 'ComponentStart' ||
          $scope.stateMachine.current === 'TraceBegin'      ||
          $scope.stateMachine.current === 'TracePoint') {
          $scope.$apply(function() {
            if (event.snap.x !== $scope.lastX || event.snap.y !== $scope.lastY) {
              $scope.lastX = event.snap.x;
              $scope.lastY = event.snap.y;
              $scope.stateMachine.backgroundClick();
              var net = event.piNetwork;
              var point = {pos: event.snap};
              $scope.trace.points.push(point);
              $scope.debugText = 'State: ' + $scope.stateMachine.current + ' - ' + JSON.stringify(point.pos);
              $scope.piConnection.setRoute($scope.trace);
            }
          });
        } else if($scope.stateMachine.current === 'Editing') {
          if(event.shiftKey) {
            if(beginConnectionNewNodeMove(event)) {
              $scope.stateMachine.backgroundClick();
            }
          } else {
            if(beginConnectionNodeMove(event)) {
              $scope.stateMachine.backgroundClick();
            }
          }
        } else if($scope.stateMachine.current === 'EditMoving') {
          $scope.stateMachine.backgroundClick();
          endConnectionNodeMove(event);
        }
      };

      $scope.onDocumentKeyUp = function(event) {
        var k = event.keyCode;
        if((event.keyCode === 13 && $scope.stateMachine.can('keyEnter')) || (event.keyCode === 27 && $scope.stateMachine.can('keyEscape'))) {
          $scope.$apply(function() {
            // TODO: save the connection
            // $scope.targetConnection = event.piConnection;
            $scope.targetConnection = event.piConnection;
            endConnectionHighlight();
            if(event.keyCode === 13) { $scope.stateMachine.keyEnter() } else { $scope.stateMachine.keyEscape() }
          });
        }
        else if(event.keyCode === 8 && $scope.stateMachine.can('keyDelete')) {
          $scope.$apply(function() {
            deleteCurrentNode();
            $scope.stateMachine.keyDelete();
          });
        }
      };

      $scope.onComponentMove = function(event) {
        $scope.$apply(function() {
          if ($scope.trace) {// && $scope.stateMachine.current !== 'ComponentStart') {

            var n = event.piCompartment.neuron;
            var s = n.scale;
            var offsets = n.parentPiNetwork.getOffset();
            var x = n.x+offsets.x;
            var y = n.y+offsets.y;

            var traceCopy = _.cloneDeep($scope.trace);
            traceCopy.end = {
              component: event.compartment.name,
              center: {x: x, y: y},
              radius: n.radius
            };
            $scope.piConnection.setRoute(traceCopy);
          }
        });
      };

      $scope.onBackgroundMove = function(event) {
        $scope.$apply(function() {
          if($scope.stateMachine.current === 'EditMoving') {
            N.log('***** onBackgroundMove = '+event.snap.x+','+event.snap.y);
            updateRouteNode($scope.targetConnection, $scope.targetConnectionNode.index, event.snap);
            if(event.stopPropagation) { event.stopPropagation(); }
            if(event.preventDefault) { event.preventDefault(); }
            event.cancelBubble = true;
            event.returnValue = false;
          }
          else if ($scope.trace && (event.snap.x !== $scope.lastSnapX || event.snap.y !== $scope.lastSnapY)) {
            $scope.lastSnapX = event.snap.x;
            $scope.lastSnapY = event.snap.y;
            var net = event.piNetwork;
            var point = {pos: event.snap};
            var traceCopy = _.cloneDeep($scope.trace);
            traceCopy.points.push(point);
            $scope.piConnection.setRoute(traceCopy);
          }
        });
      };

      $scope.onConnectionClick = function(event) {
        if ($scope.stateMachine.can('connectionClick')) {
          if ($scope.stateMachine.current === 'Editing') {
            if (event.shiftKey) {
              if(beginConnectionNewNodeMove(event)) {
                $scope.stateMachine.connectionClick();
              }
            } else {
              if(beginConnectionNodeMove(event)) {
                $scope.stateMachine.connectionClick();
              }
            }
          } else if ($scope.stateMachine.current === 'EditMoving') {
            endConnectionNodeMove(event);
            $scope.stateMachine.connectionClick();
          } else {
            beginConnectionHighlight(event.piConnection);
            $scope.targetConnection = event.piConnection;
            $scope.stateMachine.connectionClick();
          }
        }
      };

      $scope.onConnectionEnter = function(event) {
        $scope.$apply(function() {
          if($scope.stateMachine.current.indexOf('Edit') !== 0) {
            beginConnectionHighlight(event.piConnection);
          }
        });
      };

      $scope.onConnectionMove = function(event) {
        $scope.$apply(function() {
          if($scope.stateMachine.current === 'EditMoving') {
            N.log('***** onConnectionMove = '+event.snap.x+','+event.snap.y);
            updateRouteNode($scope.targetConnection, $scope.targetConnectionNode.index, event.snap);
            if(event.stopPropagation) { event.stopPropagation(); }
            if(event.preventDefault) { event.preventDefault(); }
            event.cancelBubble = true;
            event.returnValue = false;
          }
        });
      };

      $scope.onConnectionLeave = function(event) {
        $scope.$apply(function() {
          if($scope.stateMachine.current.indexOf('Edit') !== 0) {
            endConnectionHighlight();
          }
        });
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
        $scope.saveNetwork($scope.scene.piNetwork);
      };

      $scope.saveNetwork = function(piNetwork) {
        var path = piNetwork.network.displaySource;

        var display = piNetwork.display;
        var displayCopy = _.cloneDeep(display);

        var connections = piNetwork.piConnections;
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

        for(var i=0; i<piNetwork.piNetworks.length; i++) {
          $scope.saveNetwork(piNetwork.piNetworks[i]);
        }
      };

      $scope.close = function() {
        $scope.scene.piNetwork.hideGrid();
        $scope.$emit('traceLineEditor:closing');
        removeAllHighlights();
        $scope.scene.piNetwork.group.removeClass('soften-component');
        $scope.scene.piNetwork.group.removeClass('soften-connection');
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

