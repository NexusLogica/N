/**********************************************************************

File     : pi-router.js
Project  : N Simulator Library
Purpose  : Source file for pi connection router.
Revisions: Original definition by Lawrence Gunn.
           2014/03/21

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
 * A class for routing connections between neuron compartments in a network.
 * @class UI.Router
 * @param {N.UI.PiNetwork} networkUI
 * @constructor
 */
N.UI.Router = function(networkUI) {
  this.NetworkUI = networkUI;
  this.Rows = [];
  this.Cols = [];
}

/**
 * Build the router grid. This must be called prior to doing any actual routing of connectors.
 * @method BuildRoutingGrid
 * @return {N.UI.Router} Returns a reference to self.
 */
N.UI.Router.prototype.BuildRoutingGrid = function() {
  var rows = this.NetworkUI.Rows;

  for(var i=0; i<=rows.length; i++) {
    var yTop = (i === 0 ? this.NetworkUI.Rect.Top : this._MaxRowY(i-1, 1.0));
    var yBottom = (i === rows.length ? this.NetworkUI.Rect.Bottom : this._MaxRowY(i, -1));

    this.Rows.push({ Top: yTop, Bottom: yBottom, Mid: 0.5*(yTop+yBottom) });
  }

  for(i=0; i<rows.length; i++) {
    var column = [];

    var startX = this.NetworkUI.Rect.Left;
    var row = this.NetworkUI.Rows[i];
    for(var j=0; j<row.Cols.length; j++) {
      var name = row.Cols[j].Name;
      if(name && name.length) {
        var graphic = this.NetworkUI.GraphicsByName[name];
        var right = graphic.X-graphic.Radius;
        column.push({ Left: startX, Right: right, Mid: 0.5*(startX+right) });
        startX = graphic.X+graphic.Radius;
      }
    }
    column.push({ Left: startX, Right: this.NetworkUI.Rect.Right, Mid: 0.5*(startX+this.NetworkUI.Rect.Right) });

    this.Cols.push(column);
  }

  return this;
}

N.UI.Router.prototype.GetPoint = function(rc) {
  var pos = [];
  var name, x, y, rx, ry, drop, graphic;
  if(rc.hasOwnProperty('Src')) {
    name = rc.Src.split('>')[0];
    graphic = this.NetworkUI.GraphicsByName[name];
    x = graphic.X;
    y = graphic.Y+graphic.Radius;
    drop = this.Rows[graphic.Row+1].Mid;
    pos.push({ X: x, Y: y });
    this.ProcessOffset(pos, rc);
  }
  else if(rc.hasOwnProperty('SrcOffset')) {
    name = rc.SrcOffset.split('>')[0];
    graphic = this.NetworkUI.GraphicsByName[name];
    x = graphic.X;
    y = graphic.Y+graphic.Radius;
    drop = this.Rows[graphic.Row+1].Mid;
    pos.push({ X: x, Y: drop });
    this.ProcessOffset(pos, rc);
  }
  else if(rc.hasOwnProperty('Coord')) {
    var indices = rc.Coord.split(' ');
    ry = this.Rows[indices[0]].Mid;
    rx = this.Cols[indices[1]][indices[2]].Mid;
    pos.push({ X: rx, Y: ry });
    this.ProcessOffset(pos, rc);
  }

  if(rc.hasOwnProperty('Sink')) {
    pos[0].Join = true;
    name = rc.Sink.split('>')[0];
    graphic = this.NetworkUI.GraphicsByName[name];
    x = graphic.X;
    y = graphic.Y;
    var r = graphic.Radius;
    var angle = N.Rad(rc.Angle);
    rx = r*Math.cos(angle);
    ry = r*Math.sin(angle);
    pos.push({ BaseX: x+rx, BaseY: y+ry, DX: rx, DY: ry  });
  }
  return pos;
}

N.UI.Router.prototype.ProcessOffset = function(pos, rc) {
  if(pos.length && rc.hasOwnProperty('Offset')) {
    var offsetSize = 5.0;
    var offsets = rc.Offset.split(' ');
    var dX = 0, dY = 0;
    for(var i=0; i<offsets.length; i += 2) {
      switch(offsets[i]) {
        case 'DX': dX += offsets[i+1]*offsetSize; break;
        case 'DY': dY += offsets[i+1]*offsetSize; break;
        default: break;
      }
    }
    for(var j=0; j<pos.length; j++) {
      pos[j].X += dX;
      pos[j].Y += dY;
    }
  }
}

/**
 * Iterates through all the pi elements in a row and returns the greatest y value. In other words, returns the height of the circle most in the way.
 * @method _MaxRowY
 * @param i
 * @protected
 */
N.UI.Router.prototype._MaxRowY = function(i, direction) {
  var row = this.NetworkUI.Rows[i];
  for(var i=0; i<row.Cols.length; i++) {
    var name = row.Cols[i].Name;
    if(name && name.length) {
      var graphic = this.NetworkUI.GraphicsByName[name];
      return graphic.Y+direction*graphic.Radius;
    }
  }
}