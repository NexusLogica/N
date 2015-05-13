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
  'GapJunction': 'pi-gap-junction-connection',
  'Electrode'  : 'pi-electrode-connection'
};

  //*********************
  //* N.UI.PiConnection *
  //*********************

N.UI.PiConnection = function(piNetwork, connection) {
  this.piNetwork = piNetwork;    // The parent PiNetwork.
  this.connection = connection;  // The N.Connection object.

  // It is the 'default' because it is used only when no connection is availaible (if that is ever likely to happen...).
  this.defaultCategory = connection ? connection.category : 'Excitatory';
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
      class: 'pi-connection '+N.UI.PiConnectionClasses[this.getCategory()] });
};

N.UI.PiConnection.prototype.render = function(svgGroup) {
  this.group = svgGroup;
  if (this.route) {
    this.renderRoute();
  }
};

N.UI.PiConnection.prototype.renderRoute = function() {
  var st = this.route.start;
  var pt = this.route.points;
  var end = this.route.end;
  var endPt;

  if(this.endPath) {
    this.endPath.remove();
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
        endPt = { x: (ed*ecosX)*s, y: (ed*esinY)*s };

        routeString += 'l' + endPt.x + ' ' + endPt.y;

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
      this.createEnd(this.group, {
        endNeuronCenter: new N.UI.Vector(end.center.x*s, end.center.y*s),
        endNeuronOuter: new N.UI.Vector(endPt.x, endPt.y)
      });
    }

    if (!this.path) {
      this.path = this.group.path(routeString)
        .attr({
          'fill': 'none',
          'stroke-linejoin': 'round',
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

N.UI.PiConnection.prototype.createEnd = function(svgGroup, endInfo) {
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
    this.endPath = svgGroup.path(routeString).rotate(N.deg(angle), c.x, c.y).attr( { class: 'pi-connection-end '+N.UI.PiConnectionClasses[category] } );
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
    this.endPath = svgGroup.path(routeString).rotate(N.deg(angle), c.x, c.y).attr( { class: 'pi-connection-end '+N.UI.PiConnectionClasses[category] } );
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
    this.endPath = svgGroup.path(routeString).rotate(N.deg(angle), c.x, c.y).attr( { class: 'pi-connection-end '+N.UI.PiConnectionClasses[category] } );
  }
  else {
    var r = 0.02*scale;
    center = o.shorten(c, -r-gap).offset(-r, -r);
    this.endPath = svgGroup.circle(2*r).move(center.x, center.y).attr( { class: 'pi-connection-end '+N.UI.PiConnectionClasses[category] } );
  }
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
