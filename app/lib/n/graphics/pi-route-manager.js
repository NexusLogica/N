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
  this.Network = network;
  this.Connections = [];
  this.CrowdedLanes = [];
  this.CrowdedThruways = [];
}

N.UI.PiRouteManager.prototype.AddConnections = function(connections) {
  if(_.isArray(connections)) {
    this.Connections = this.Connections.concat(connections);
  } else {
    this.Connections.push(connections);
  }
}

N.UI.PiRouteManager.prototype.Render = function(name) {
  if(_.isEmpty(name)) { name = 'route'; }

  var svgGroup = this.Network.Group.group();

  this.RouteFinders = [];
  var routeFinder, piConnection;
  for(var i in this.Connections) {
    piConnection = this.Connections[i]
    piConnection.RouteFinder = new N.UI.PiRouteFinder(piConnection);
    piConnection.RouteFinder.FindRoute(this);
  }

  this.UncrowdRoutes();
  this.UncrowdThruways();

  for(i in this.Connections) {
    piConnection = this.Connections[i]
    var pathString = piConnection.RouteFinder.GetPath();
    var endInfo = piConnection.RouteFinder.GetEndInfo();

    piConnection.CreatePath(svgGroup, pathString);
    piConnection.CreateEnd(svgGroup, endInfo);
  }

  this.Network.AddConnectionDisplay(name, svgGroup);
}

N.UI.PiRouteManager.prototype.AddLaneSegment = function(finder, neuronRowIndex, laneIndex, nextLaneIndex, verticalPassageIndex) {
  if(!this.CrowdedLanes[neuronRowIndex]) { this.CrowdedLanes[neuronRowIndex] = []; }
  if(!this.CrowdedLanes[neuronRowIndex][laneIndex]) { this.CrowdedLanes[neuronRowIndex][laneIndex] = []; }
  this.CrowdedLanes[neuronRowIndex][laneIndex].push({ Finder: finder, NextLaneIndex: nextLaneIndex, VerticalPassageIndex: verticalPassageIndex });
}

N.UI.PiRouteManager.prototype.AddThruwaySegment = function(finder, thruwayIndex, startSegIndex, endSegIndex, verticalDirection) {
  if(!this.CrowdedThruways[thruwayIndex]) { this.CrowdedThruways[thruwayIndex] = []; }
  this.CrowdedThruways[thruwayIndex].push({ Finder: finder, StartSegIndex: startSegIndex, EndSegIndex: endSegIndex, VerticalDirection: verticalDirection, ThruwayIndex: thruwayIndex });
}

N.UI.PiRouteManager.prototype.UncrowdRoutes = function() {
  var laneOrder = function(a, b) {
    return a.NextLaneIndex > b.NextLaneIndex;
  }

  for(var i in this.CrowdedLanes) {
    for(var j in this.CrowdedLanes[i]) {
      var laneRoutes = this.CrowdedLanes[i][j];
      if(laneRoutes.length > 1) {
        // console.log('*** LaneRoutes['+i+']['+j+'] = '+laneRoutes.length);
        laneRoutes.sort(laneOrder);

        var inc = 6;
        var offset = -0.5*inc*(laneRoutes.length-1);

        for(var k in laneRoutes) {
          var route = laneRoutes[k];
          route.Finder.SetVerticalPassageOffset(route.VerticalPassageIndex, offset);
          offset += inc;
        }
      }
    }
  }
}

N.UI.PiRouteManager.prototype.UncrowdThruways = function() {

  for(var i in this.CrowdedThruways) {
    var thruwayRoutes = this.CrowdedThruways[i];
    if(thruwayRoutes.length > 1) {

      // We need x values in the thruway info.
      for(var j in thruwayRoutes) {
        thruwayRoutes[j].Finder.UpdateThruwayInfo(thruwayRoutes[j]);
      }

      var crowds = this.BreakCrowdIntoGroups(thruwayRoutes);

      for(var k in crowds) {
        var crowd = crowds[k].Routes;
        var inc = 6;
        var offset = -0.5*inc*(crowd.length-1);
        for(var m in crowd) {
          var route = crowd[m];
          route.Finder.SetHorizontalPassageOffset(route, offset);
          offset += inc;
        }
      }

    }
  }
}

N.UI.PiRouteManager.prototype.BreakCrowdIntoGroups = function(thruwayCrowd) {
  // These are, in the end, the groups to uncrowd, where each route in the group is overlapping of the others in the group.
  var groups = [];
  for(var k in thruwayCrowd) {
    var route = thruwayCrowd[k];
    groups.push({ Routes: [route], XMin: route.XMin, XMax: route.XMax });
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
          if(this.Overlap(testGroup, group)) {
            if(i > j) {
              groups.splice(i, 1);
              groups.splice(j, 1);
            } else {
              groups.splice(j, 1);
              groups.splice(i, 1);
            }
            groups.push(this.CombineThruGroup(testGroup, group));
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

N.UI.PiRouteManager.prototype.Overlap = function(a, b) {
  if(a.XMax <= b.XMin || b.XMax <= a.XMin) {
    return false;
  }
  return true;
}

N.UI.PiRouteManager.prototype.CombineThruGroup = function(groupA, groupB) {
  var unionGroup = { Routes: [] };
  unionGroup.Routes = unionGroup.Routes.concat(groupA.Routes);
  if (groupB) {
    unionGroup.Routes = unionGroup.Routes.concat(groupB.Routes);
  }

  unionGroup.XMin = unionGroup.Routes[0].XMin;
  unionGroup.XMax = unionGroup.Routes[0].XMax;
  for(var i=1; i<unionGroup.Routes.length; i++) {
    if(unionGroup.Routes[i].XMin < unionGroup.XMin) {
      unionGroup.XMin = unionGroup.Routes[i].XMin;
    }
    if(unionGroup.Routes[i].XMax > unionGroup.XMax) {
      unionGroup.XMax = unionGroup.Routes[i].XMax;
    }
  }

  return unionGroup;
}
