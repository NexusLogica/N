/**********************************************************************

File     : signal-builder.js
Project  : N Simulator Library
Purpose  : Source file for signal building objects.
Revisions: Original definition by Lawrence Gunn.
           2014/07/28

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};

N.ANALOG = 1;
N.DISCRETE = 2;

  //*******************
  //* N.SignalBuilder *
  //*******************

/**
 * The signal builder class.
 * @class N.SignalBuilder
 * @constructor
 */

N.SignalBuilder = function() {
  this.className  = 'N.SignalBuilder';
  this.type       = 'voltage';
  this.start      = 0.0;
  this.duration   = 0.010;
  this.shape      = 'square'
  this.amplitude  = '0.02';
}

/**
 * Sets the type.
 * @method SetType
 * @param {String} type
 */
N.SignalBuilder.prototype.SetType = function(type) {
  this.type = type;
  return this;
}
