/**********************************************************************

File     : pi-network.js
Project  : N Simulator Library
Purpose  : Source file for manufacturing, rendering, and controlling Pi representations of neurons.
Revisions: Original definition by Lawrence Gunn.
           2014/02/23

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //***************
  //* N.UI.PiGrid *
  //***************

N.UI.PiGrid = function() {
  this.X = 0;
  this.Y = 0;
  this.DrawBorder = true;
}

N.UI.PiGrid.prototype.Layout = function(renderMappings) {

  this.UnscaledWidth = this.Cols+1;
  this.UnscaledHeight = this.Rows+1;
  return this;
}

N.UI.PiGrid.prototype.Render = function(svgParent, scale) {

  this.Group = svgParent.group();
  this.Group.translate(this.X, this.Y);

  var classNameFull = 'pi-grid';
  if(this.hasOwnProperty('ClassName')) { classNameFull += ' '+this.ClassName; }
  this.Group.attr({ class: classNameFull });

  this.Scale = scale;

  // If no
  if(!this.ParentNetwork) {
    this.ScaledWidth = this.Scale*(_.isUndefined(this.Width) ? this.UnscaledWidth : this.Width);
  }
  this.ScaledHeight = this.Scale*(_.isUndefined(this.Height) ? this.UnscaledHeight : this.Height);

  this.Rect = { Left: 0, Top: 0, Right: this.ScaledWidth, Bottom: this.ScaledHeight };

  if(this.DrawBorder) {
    this.OuterRect = this.Group.rect(this.ScaledWidth, this.ScaledHeight)
      .radius(2)
      .move(this.Rect.Left, this.Rect.Top)
      .attr({ class: 'single'});
  }

  var r = 1;
  var d = r*2;
  var spacing = this.Scale;
  var y = spacing;
  for(var i=0; i<this.Rows; i++) {
    var x = spacing;
    for(var j=0; j<this.Cols; j++) {
      this.Group.circle(d).move(x-r, y-r).attr( { 'class': 'grid-dot' });
      x += spacing;
    }
    y += spacing;
  }

}

N.UI.PiGrid.prototype.RenderBackground = function(className, padding) {
  this.OuterRect = this.Group.rect(this.Rect.Right-this.Rect.Left-padding[3]-padding[1], this.Rect.Bottom-this.Rect.Top-padding[2]-padding[0])
    .move(this.Rect.Left+padding[3], this.Rect.Top+padding[0])
    .back()
    .attr({ class: className});
}

N.UI.PiGrid.prototype.CreatePath = function(start, end) {
  var points = [ [ start.X*this.Scale, start.Y*this.Scale ]];
  var x = start.X;
  var y = start.Y;
  var eX = end.X;
  var eY = end.Y;
  var offsets = [ [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1] ];
  var vectors = [];
  for(var i in offsets) {
    vectors.push((new N.UI.Vector(offsets[i][0], offsets[i][1])).Normalize());
  }
debugger;
  var num = 0;
  do {
    num++;
    if(num > 10) { break; }
    var maxCos = -Number.MAX_VALUE;
    var index;
    var vec = (new N.UI.Vector(end.X-x, end.Y-y)).Normalize();
    for(var j=0; j<8; j++) {
      var cos = vectors[j].DotProduct(vec);
      if(cos > maxCos) {
        maxCos = cos;
        index = j;
      }
    }
    x += offsets[index][0];
    y += offsets[index][1];
    points.push([ x*this.Scale, y*this.Scale ]);
  } while(x !== end.X || y !== end.Y);

  return points;
}

N.UI.PiGrid.prototype.CreateStringPath = function(start, end) {
  var points = this.CreatePath(start, end);
  var path = 'M'+points[0][0]+' '+points[0][1];
  for(var i=1; i<points.length; i++) {
    path += 'L'+points[i][0]+' '+points[i][1]
  }
  return path;
}

N.UI.PiGrid.prototype.LoadFrom = function(json) {
  for(var i in json) {
    this[i] = json[i];
  }

  return this;
}
