/**********************************************************************

File     : pi-route-manager.js
Project  : N Simulator Library
Purpose  : Source file for managing the layout of sets of connection routes.
Revisions: Original definition by Lawrence Gunn.
           2014/04/19

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //***********************
  //* N.UI.PiRouteManager *
  //***********************

N.UI.PiRouteManager = function(network) {
  this.network = network;
  this.connections = [];
  this.crowdedLanes = [];
  this.crowdedThruways = [];
}

N.UI.PiRouteManager.prototype.addConnections = function(connections) {
  if(_.isArray(connections)) {
    this.connections = this.connections.concat(connections);
  } else {
    this.connections.push(connections);
  }
}

N.UI.PiRouteManager.prototype.render = function(name) {
  if(_.isEmpty(name)) { name = 'route'; }

  var svgGroup = this.network.group.group();

  this.routeFinders = [];
  var routeFinder, piConnection;
  for(var i in this.connections) {
    piConnection = this.connections[i]
    piConnection.routeFinder = new N.UI.PiRouteFinder(piConnection);
    piConnection.routeFinder.findRoute(this);
  }

  //this.uncrowdRoutes();
  //this.uncrowdThruways();

  for(i in this.connections) {
    piConnection = this.connections[i]
    var pathString = piConnection.routeFinder.getPath();
    var endInfo = piConnection.routeFinder.getEndInfo();

    piConnection.createPath(piConnection.network.group.group(), pathString);
    piConnection.createEnd(piConnection.network.group.group(), endInfo);
  }

  this.network.addConnectionDisplay(name, svgGroup);
}

N.UI.PiRouteManager.prototype.addLaneSegment = function(finder, neuronRowIndex, laneIndex, nextLaneIndex, verticalPassageIndex) {
  if(!this.crowdedLanes[neuronRowIndex]) { this.crowdedLanes[neuronRowIndex] = []; }
  if(!this.crowdedLanes[neuronRowIndex][laneIndex]) { this.crowdedLanes[neuronRowIndex][laneIndex] = []; }
  this.crowdedLanes[neuronRowIndex][laneIndex].push({ finder: finder, nextLaneIndex: nextLaneIndex, verticalPassageIndex: verticalPassageIndex });
}

N.UI.PiRouteManager.prototype.addThruwaySegment = function(finder, thruwayIndex, startSegIndex, endSegIndex, verticalDirection) {
  if(!this.crowdedThruways[thruwayIndex]) { this.crowdedThruways[thruwayIndex] = []; }
  this.crowdedThruways[thruwayIndex].push({ finder: finder, startSegIndex: startSegIndex, endSegIndex: endSegIndex, verticalDirection: verticalDirection, thruwayIndex: thruwayIndex });
}

N.UI.PiRouteManager.prototype.uncrowdRoutes = function() {
  var laneOrder = function(a, b) {
    return a.nextLaneIndex > b.nextLaneIndex;
  }

  for(var i in this.crowdedLanes) {
    for(var j in this.crowdedLanes[i]) {
      var laneRoutes = this.crowdedLanes[i][j];
      if(laneRoutes.length > 1) {
        // console.log('*** LaneRoutes['+i+']['+j+'] = '+laneRoutes.length);
        laneRoutes.sort(laneOrder);

        var inc = 6;
        var offset = -0.5*inc*(laneRoutes.length-1);

        for(var k in laneRoutes) {
          var route = laneRoutes[k];
          route.finder.setVerticalPassageOffset(route.verticalPassageIndex, offset);
          offset += inc;
        }
      }
    }
  }
}

N.UI.PiRouteManager.prototype.uncrowdThruways = function() {

  for(var i in this.crowdedThruways) {
    var thruwayRoutes = this.crowdedThruways[i];
    if(thruwayRoutes.length > 1) {

      // We need x values in the thruway info.
      for(var j in thruwayRoutes) {
        thruwayRoutes[j].finder.updateThruwayInfo(thruwayRoutes[j]);
      }

      var crowds = this.breakCrowdIntoGroups(thruwayRoutes);

      for(var k in crowds) {
        var crowd = crowds[k].routes;
        var inc = 6;
        var offset = -0.5*inc*(crowd.length-1);
        for(var m in crowd) {
          var route = crowd[m];
          route.finder.setHorizontalPassageOffset(route, offset);
          offset += inc;
        }
      }

    }
  }
}

N.UI.PiRouteManager.prototype.breakCrowdIntoGroups = function(thruwayCrowd) {
  // These are, in the end, the groups to uncrowd, where each route in the group is overlapping of the others in the group.
  var groups = [];
  for(var k in thruwayCrowd) {
    var route = thruwayCrowd[k];
    groups.push({ routes: [route], xMin: route.xMin, xMax: route.xMax });
  }

  // Do this for each route. In the loop each route will end up in a group, by itself, or with others.
  var numCombined;
  do {
    numCombined = 0;
    for(var i in groups) {
      var group = groups[i];

      // These are the groups that have an overlap - there may be many.
      var groupsContaining = [];
      for(var j in groups) {
        if(j !== i) {
          var testGroup = groups[j];
          if(this.overlap(testGroup, group)) {
            if(i > j) {
              groups.splice(i, 1);
              groups.splice(j, 1);
            } else {
              groups.splice(j, 1);
              groups.splice(i, 1);
            }
            groups.push(this.combineThruGroup(testGroup, group));
            numCombined++
            break;
          }
        }
      }
      if(numCombined > 0) {
        break;
      }
    }
  } while(numCombined > 0);
  return groups;
}

N.UI.PiRouteManager.prototype.overlap = function(a, b) {
  if(a.xMax <= b.xMin || b.xMax <= a.xMin) {
    return false;
  }
  return true;
}

N.UI.PiRouteManager.prototype.combineThruGroup = function(groupA, groupB) {
  var unionGroup = { Routes: [] };
  unionGroup.routes = unionGroup.routes.concat(groupA.routes);
  if (groupB) {
    unionGroup.routes = unionGroup.routes.concat(groupB.routes);
  }

  unionGroup.xMin = unionGroup.routes[0].xMin;
  unionGroup.xMax = unionGroup.routes[0].xMax;
  for(var i=1; i<unionGroup.routes.length; i++) {
    if(unionGroup.routes[i].xMin < unionGroup.xMin) {
      unionGroup.xMin = unionGroup.routes[i].xMin;
    }
    if(unionGroup.routes[i].xMax > unionGroup.xMax) {
      unionGroup.xMax = unionGroup.routes[i].xMax;
    }
  }

  return unionGroup;
}
