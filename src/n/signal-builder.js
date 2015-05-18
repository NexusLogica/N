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
  this.amplitude  = 0.02;
  this.offset     = 0.0;
}

/**
 * Sets the type.
 * @method SetType
 * @param {String} type
 */
N.SignalBuilder.prototype.setType = function(type) {
  this.type = type;
  return this;
}

/**
 * Sets the type.
 * @method clone
 * @return {N.SignalBuilder} copy
 */
N.SignalBuilder.prototype.clone = function() {
  var copy = new N.SignalBuilder();
  _.assign(copy, _.pick(this, ['type', 'start', 'duration', 'shape', 'amplitude', 'offset']));
  return copy;
}

N.SignalBuilder.prototype.buildSignal = function(signal, totalTime) {
  var data = [];
  if(this.type === 'voltage') {
    if(this.shape === 'square') {
      data.push( { t: 0.0 , v: this.offset } );
      if(this.start > 0.0) {
        data.push( { t: this.start , v: this.offset } );
      }
      data.push( { t: this.start+N.timeStep ,   v: this.amplitude+this.offset } );
      data.push( { t: this.start+this.duration, v: this.amplitude+this.offset } );
      data.push( { t: this.start+this.duration+ N.timeStep, v: this.offset } );
      data.push( { t: totalTime, v: this.offset } );
    }
  }
  signal.clear();
  signal.appendDataArray(data);
}
