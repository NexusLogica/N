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
    this.x = x;
    this.y = y;
  } else if(_.isObject(x)) {
    if(_.isObject(y)) {
      this.x = y.x- x.x;
      this.y = y.y- x.y;
    } else {
      this.x = x.x;
      this.y = x.y;
    }
  } else {
    this.x = 0.0;
    this.y = 0.0;
  }
}

N.UI.Vector.prototype.shorten = function(basePoint, newLen) {
  var vec = new N.UI.Vector(this, basePoint);
  var len = vec.vectorLength();
  var ratio = (len-newLen)/len;
  vec.x *= ratio;
  vec.y *= ratio;
  return new N.UI.Vector(basePoint.x-vec.x, basePoint.y-vec.y);
}

N.UI.Vector.prototype.vectorLength = function() {
  return Math.sqrt(this.x*this.x+this.y*this.y);
}

N.UI.Vector.prototype.normalize = function() {
  var lenInv = 1.0/Math.sqrt(this.x*this.x+this.y*this.y);
  this.x *= lenInv;
  this.y *= lenInv;
  return this;
}

N.UI.Vector.prototype.dotProduct = function(vec) {
  return this.x*vec.x+this.y*vec.y;
}

N.UI.Vector.prototype.distance = function(vec) {
  var x = this.x-vec.x;
  var y = this.y-vec.y;
  return Math.sqrt(x*x+y*y);
}

N.UI.Vector.prototype.clone = function() {
  return new N.UI.Vector(this.x, this.y);
}

N.UI.Vector.prototype.offset = function(x, y) {
  this.x += x;
  this.y += y;
  return new N.UI.Vector(this.x, this.y);
}
