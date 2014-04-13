/**********************************************************************

File     : vector.js
Project  : N Simulator Library
Purpose  : Source file for 2D vector objects.
Revisions: Original definition by Lawrence Gunn.
           2014/04/06

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //***************
  //* N.UI.Vector *
  //***************

N.UI.Vector = function(x, y) {
  if(_.isNumber(x)) {
    this.X = x;
    this.Y = y;
  } else if(_.isObject(x)) {
    if(_.isObject(y)) {
      this.X = y.X- x.X;
      this.Y = y.Y- x.Y;
    } else {
      this.X = x.X;
      this.Y = x.Y;
    }
  } else {
    this.X = 0.0;
    this.Y = 0.0;
  }
}

N.UI.Vector.prototype.Shorten = function(basePoint, newLen) {
  var vec = new N.UI.Vector(this, basePoint);
  var len = vec.Length();
  var ratio = (len-newLen)/len;
  vec.X *= ratio;
  vec.Y *= ratio;
  return new N.UI.Vector(basePoint.X-vec.X, basePoint.Y-vec.Y);
}

N.UI.Vector.prototype.Length = function() {
  return Math.sqrt(this.X*this.X+this.Y*this.Y);
}

N.UI.Vector.prototype.Normalize = function() {
  var lenInv = 1.0/Math.sqrt(this.X*this.X+this.Y*this.Y);
  this.X *= lenInv;
  this.Y *= lenInv;
  return this;
}

N.UI.Vector.prototype.Distance = function(vec) {
  var x = this.X-vec.X;
  var y = this.Y-vec.Y;
  return Math.sqrt(x*x+y*y);
}

N.UI.Vector.prototype.Clone = function() {
  return new N.UI.Vector(this.X, this.Y);
}

N.UI.Vector.prototype.Offset = function(x, y) {
  this.X += x;
  this.Y += y;
  return new N.UI.Vector(this.X, this.Y);
}
