/**********************************************************************

File     : pi-connection.js
Project  : N Simulator Library
Purpose  : Source file for a graphic connection path.
Revisions: Original definition by Lawrence Gunn.
           2014/05/13

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

N.UI.PiConnectionClasses = {
  'Excitatory' : 'pi-excitatory-connection',
  'Spine'      : 'pi-spine-connection',
  'Inhibitory' : 'pi-inhibitory-connection',
  'FastInhibitory' : 'pi-fast-inhibitory-connection',
  'SlowInhibitory' : 'pi-slow-inhibitory-connection',
  'GapJunction': 'pi-gap-junction-connection',
  'Electrode'  : 'pi-electrode-connection'
};

N.UI.PiConnectionEndLengths = {
  'Excitatory' : 0.04,
  'Spine'      : 0.075,
  'Inhibitory' : 0.02,
  'FastInhibitory' : 0.02,
  'SlowInhibitory' : 0.02,
  'GapJunction': 0.02,
  'Electrode'  : 0.02
};

  //*********************
  //* N.UI.PiConnection *
  //*********************

N.UI.PiConnection = function(piNetwork, connection) {
  this.piNetwork = piNetwork;    // The parent PiNetwork.
  this.connection = connection;  // The N.Connection object.

  // It is the 'default' because it is used only when no connection is availaible (if that is ever likely to happen...).
  this.defaultCategory = connection ? connection.category : 'Excitatory';

  this.addedClasses = {};

  this.strokeWidth = 0.02;
  this.eventHandlersAdded = false;
};

N.UI.PiConnection.prototype.getPath = function() {
  return this.connection.getPath();
};

N.UI.PiConnection.prototype.setRoute = function(route) {
  this.route = route;
  if(this.group) {
    this.renderRoute();
  }
};

N.UI.PiConnection.prototype.setSceneSignals = function(sceneSignals) {
  this.sceneSignals = sceneSignals;
  this.addEventHandlers();
};

/***
 * Sets the connection object. Used by UI builders to create a PiConnection without a connection because the end is unknown for a time.
 * @method setConnection
 * @param connection
 */
N.UI.PiConnection.prototype.setConnection = function(connection) {
  this.connection = connection;
  if(this.path) {
    this.path.attr({ class: 'pi-connection ' + N.UI.PiConnectionClasses[this.getCategory()] });
  }
};

/***
 * Get the category of the connection (excitatory, inhibitory, gap junction,...)
 * @method getCategory
 * @return {string} - The category string, or if no connection object, the default.
 */
N.UI.PiConnection.prototype.getCategory = function() {
  return (this.connection ? this.connection.category : this.defaultCategory);
};

N.UI.PiConnection.prototype.createRoute = function(svgGroup, pathString) {
  this.path = svgGroup.path(pathString)
    .attr({
      'fill': 'none',
      'stroke-linejoin': 'round',
      'stroke-width': this.strokeWidth*this.piNetwork.scale,
      class: 'pi-connection '+N.UI.PiConnectionClasses[this.getCategory()] });
};

N.UI.PiConnection.prototype.render = function(svgGroup) {
  this.group = svgGroup;
  if (this.route) {
    this.renderRoute();
  }
};

N.UI.PiConnection.prototype.addClass = function(className) {
  this.addedClasses[className] = true;

  if(this.path) {
    this.path.addClass(className);
  }
  if(this.endPath) {
    this.endPath.addClass(className);
  }
};

N.UI.PiConnection.prototype.removeClass = function(className) {
  delete this.addedClasses[className];

  if(this.path) {
    this.path.removeClass(className);
  }
  if(this.endPath) {
    this.endPath.removeClass(className);
  }
};

N.UI.PiConnection.prototype.remove = function() {
  if(this.path) {
    this.path.remove();
    this.path = undefined;
  }
  if(this.endPath) {
    this.endPath.remove();
    this.endPath = undefined;
  }
};

N.UI.PiConnection.prototype.renderRoute = function() {
  var st = this.route.start;
  var pt = this.route.points;
  var end = this.route.end;
  var endLength = N.UI.PiConnectionEndLengths[this.getCategory()];
  var endPt;

  if(this.endPath) {
    this.endPath.remove();
  }

  // Correct the end points if a connection exists.
  if(this.connection) {
    var ends = N.fromConnectionPaths(this.piNetwork, this.connection.getPath());
    var offsetSrc = ends.source.neuron.parentPiNetwork.getOffsetTo(this.piNetwork);
    var offsetSnk = ends.sink.neuron.parentPiNetwork.getOffsetTo(this.piNetwork);
    var offset = ends.sink.neuron.parentPiNetwork.getOffset();
    offset.x = 0;
    offset.y = 0;

    var x = ends.source.neuron.x;
    var y = ends.source.neuron.y;
    this.route.start.center.x = x+offsetSrc.x;
    this.route.start.center.y = y+offsetSrc.y;

    x = ends.sink.neuron.x;
    y = ends.sink.neuron.y;
    this.route.end.center.x = x+offsetSnk.x;
    this.route.end.center.y = y+offsetSnk.y;
  }

  if(st && ((pt && pt.length) || end)) {
    var s = this.piNetwork.scale;
    var dx, dy, xy, cosX, sinY, routeString, edx, edy, exy, ecosX, esinY, ed;

    // If there are points then go through this path.
    if(pt.length) {
      dx = pt[0].pos.x - st.center.x;
      dy = pt[0].pos.y - st.center.y;
      xy = Math.sqrt(dx * dx + dy * dy);
      cosX = dx / xy;
      sinY = dy / xy;

      routeString = 'M' + st.center.x * s + ' ' + st.center.y * s + 'm' + cosX * st.radius * s + ' ' + sinY * st.radius * s + 'L' + pt[0].pos.x * s + ' ' + pt[0].pos.y * s;

      for (var i = 1; i < pt.length; i++) {
        routeString += 'L' + pt[i].pos.x * s + ' ' + pt[i].pos.y * s;
      }

      if (end) {
        var iEnd = pt.length - 1;
        edx = pt[iEnd].pos.x - end.center.x;
        edy = pt[iEnd].pos.y - end.center.y;
        exy = Math.sqrt(edx * edx + edy * edy);
        ecosX = edx / exy;
        esinY = edy / exy;
        ed = (end.radius+2/s) - exy;

        var edLong = (end.radius+endLength+2/s) - exy;
        var endPtLong = { x: (edLong*ecosX)*s, y: (edLong*esinY)*s };
        routeString += 'l' + endPtLong.x + ' ' + endPtLong.y;

        endPt = { x: (ed*ecosX)*s, y: (ed*esinY)*s };
        endPt.x = (end.center.x+end.radius*ecosX)*s;
        endPt.y = (end.center.y+end.radius*esinY)*s;
      }
    }

    // If there is just a beginning and end then use this path.
    else {
      dx = end.center.x - st.center.x;
      dy = end.center.y - st.center.y;
      xy = Math.sqrt(dx * dx + dy * dy);
      cosX = dx / xy;
      sinY = dy / xy;

      routeString = 'M' + st.center.x * s + ' ' + st.center.y * s + 'm' + cosX * st.radius * s + ' ' + sinY * st.radius * s;

      if (end) {
        edx = st.center.x - end.center.x;
        edy = st.center.y - end.center.y;
        exy = Math.sqrt(edx * edx + edy * edy);
        ecosX = edx / exy;
        esinY = edy / exy;
        ed = end.radius - exy;

        routeString += 'L' + ed * ecosX * s + ' ' + ed * esinY * s;
      }
    }

    if(end) {
      this.createEnd({
        endNeuronCenter: new N.UI.Vector(end.center.x*s, end.center.y*s),
        endNeuronOuter: new N.UI.Vector(endPt.x, endPt.y)
      });
    }

    if (!this.path) {
      this.path = this.group.path(routeString)
        .attr({
          'fill': 'none',
          'stroke-linejoin': 'round',
          'stroke-width': this.strokeWidth*this.piNetwork.scale,
          class: 'pi-connection ' + N.UI.PiConnectionClasses[this.getCategory()]
        });
      if(!this.connection) {
        this.path.addClass('pointer-transparent');
      }
    } else {
      this.path.plot(routeString);
    }
  }
};

N.UI.PiConnection.prototype.createEnd = function(endInfo) {
  var scale = this.piNetwork.scale;
  var center, w2, h2, centerDist, routeString, gap = 1.50;
  var c = endInfo.endNeuronCenter;
  var o = endInfo.endNeuronOuter;
  var angle = Math.atan2(o.y-c.y, o.x-c.x);
  var category = this.getCategory();

  if(category === 'Spine') {
    w2 = 0.01*2.25*scale;
    h2 = 0.01*1.5*scale;
    centerDist = c.distance(o)+h2+w2+gap;
    routeString = 'M'+c.x+' '+c.y+
        'm'+centerDist+' 0'+
        'm'+h2+' '+w2+
        'a'+w2+' '+w2+' 0 1 0 0 -'+(2*w2)+
        'l-'+(2*h2)+' 0'+
        'a'+w2+' '+w2+' 0 1 0 0 '+(2*w2)+
        'l'+(2*h2)+' 0';
    this.endPath = this.group.path(routeString).rotate(N.deg(angle), c.x, c.y);
  }
  else if(category === 'GapJunction') {
    var w = 9.0*scale;
    var h = 2.0*scale;
    var cornerDist = c.distance(o)+gap+0.5;
    routeString = 'M'+c.x+' '+c.y+
        'm'+cornerDist+' '+(0.5*w)+
        'l'+h+' 0'+
        'l0 -'+w+
        'l-'+h+' 0'+
        'l0 '+w;
    this.endPath = this.group.path(routeString).rotate(N.deg(angle), c.x, c.y);
  }
  else if(category === 'Electrode') {
    w2 = 2.25*scale;
    h2 = 6*scale;
    centerDist = c.distance(o)+gap;
    routeString = 'M'+c.x+' '+c.y+
        'm'+centerDist+' 0'+
        'l'+h2+' '+w2+
        'l0 -'+(2*w2)+
        'l-'+h2+' '+w2;
    this.endPath = this.group.path(routeString).rotate(N.deg(angle), c.x, c.y);
  }
  else {
    var r = 0.02*scale;
    center = o.shorten(c, -r-gap).offset(-r, -r);
    this.endPath = this.group.circle(2*r).move(center.x, center.y);
  }

  var classes = 'pi-connection-end '+N.UI.PiConnectionClasses[category];
  for(var cl in this.addedClasses) {
    classes += ' '+cl;
  }

  this.endPath.attr( { class: classes } );
};

N.UI.PiConnection.prototype.addEventHandlers = function() {
  if(this.path) {
    this.eventHandlersAdded = true;

    var onMouseEnter = N.UI.PiConnection.prototype.onMouseEnter.bind(this);
    var onMouseMove = N.UI.PiConnection.prototype.onMouseMove.bind(this);
    var onMouseLeave = N.UI.PiConnection.prototype.onMouseLeave.bind(this);
    var onClick      = N.UI.PiConnection.prototype.onClick.bind(this);

    $(this.path.node).on('mouseenter', onMouseEnter);
    $(this.path.node).on('mousemove', onMouseMove);
    $(this.path.node).on('mouseleave', onMouseLeave);
    $(this.path.node).on('click', onClick);
  }
};

N.UI.PiConnection.prototype.onMouseEnter = function(event) {
  this.dispatchMouseEvent('connection-enter', event);
};

N.UI.PiConnection.prototype.onMouseMove = function(event) {
  this.dispatchMouseEvent('connection-move', event);
};

N.UI.PiConnection.prototype.onMouseLeave = function(event) {
  this.dispatchMouseEvent('connection-leave', event);
};

N.UI.PiConnection.prototype.onClick = function(event) {
  this.dispatchMouseEvent('connection-click', event);
};

N.UI.PiConnection.prototype.dispatchMouseEvent = function(name, event) {
  this.positionFromEvent(event);
  event.piConnection = this;
  event.piNetwork = this.piNetwork;
  this.sceneSignals[name].dispatch(event);
};

/***
 * From the event information, determine the position and snap position on the network.
 * @param event
 * @returns {{pos: {x: number, y: number}, snap: *}}
 */
N.UI.PiConnection.prototype.positionFromEvent = function(event) {
//  var clientRect = this.path.node.getBoundingClientRect();
  var clientRect = this.piNetwork.getOuterRect().node.getBoundingClientRect();
//  var offset = this.piNetwork.getOffset();
  var x = event.clientX-clientRect.left;//+offset.x;
  var y = event.clientY-clientRect.top;//+offset.y;
  var snap = this.getNearestGridPoint(x, y);

  var s = this.piNetwork.scale;
  snap.x /= s;
  snap.y /= s;
  event.pos = { x: x/s, y: y/s };
  event.snap = snap;
};

N.UI.PiConnection.prototype.getNearestGridPoint = function(x, y) {
  var gridSpacing = this.piNetwork.gridSpacing;
  var s = this.piNetwork.scale;
  var nx = Math.floor(x/s/gridSpacing+0.5)*s*gridSpacing;
  var ny = Math.floor(y/s/gridSpacing+0.5)*s*gridSpacing;
  return { x: nx, y: ny};
};

N.UI.PiConnection.prototype.toJson = function() {
  return {
    route: this.route,
    defaultCategory: this.defaultCategory
  };
};

N.UI.PiConnection.prototype.fromJson = function(json) {
  if(!this.connection) {
    this.defaultCategory = json.defaultCategory;
  }
  this.route = json.route;
};
