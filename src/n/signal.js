/**********************************************************************

File     : signal.js
Project  : N Simulator Library
Purpose  : Source file for signal relate objects.
Revisions: Original definition by Lawrence Gunn.
           2014/01/09

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

  //****************
  //* AnalogSignal *
  //****************

/**
 * The analog signal class.
 * @class AnalogSignal
 * @constructor
 * @param {String} name
 */

N.AnalogSignal = function(name) {
  this.className  = 'N.AnalogSignal';
  this.type       = N.ANALOG;
  this.id         = N.generateUUID();
  this.finder     = new N.TableSearch();
  this.name       = (typeof name === 'string' ? name : '');
  this.category   = 'Default';
  this.unit       = 'Hz';
  this.minLimit   = 0.0;
  this.maxLimit   = 100.0;

  this.clear();
};

/**
 * Returns the minimum and maximum values in the signal.
 * @method GetRange
 * @returns {{min: float, max: float}}
 */
N.AnalogSignal.prototype.getRange = function() {
  return { 'min': this.min, 'max': this.max };
};

/**
 * Returns the value at a certain time. If the time is before the begining of the signal data then the value of the
 * first element is returned. If it is after the end then the last value is returned. Values between times are linearly interpolated between them.
 * @method GetValue
 * @param time
 * @returns {float} The value.
 */
N.AnalogSignal.prototype.getValue = function(time) {
  var t = time-this.start;
  if(this.times.length < 2) {
    if(this.times.length < 1) {
      return 0.0;
    }
    return this.values[0];
  }

  var i = this.finder.find(t, this.times);
  if(i < 0) {
    return this.values[0];
  }
  else if(i >= this.times.length-1) {
    return this.values[this.times.length-1];
  }

  var x0 = this.times[i];
  var x1 = this.times[i+1];
  var y0 = this.values[i];
  var y1 = this.values[i+1];
  var value = y0+(y1-y0)*(t-x0)/(x1-x0);
  if(_.isNaN(value)) {
    debugger;
  }
  return value;
};

/**
 * Returns the time at a given index.
 * @method getTimeByIndex
 * @param index
 * @returns {float} Returns the time or 'undefined' if the index is out of range.
 */
N.AnalogSignal.prototype.getTimeByIndex = function(index) {
  return this.times[index];
};

N.AnalogSignal.prototype.getValueByIndex = function(index) {
  return this.values[index];
};

N.AnalogSignal.prototype.appendData = function(time, value) {
  if(_.isNaN(value)) {
    debugger;
  }
  this.times.push(time);
  this.values.push(value);
  if(this.times.length === 0) {
    this.timeMin = this.timeMax = time;
  }
  if(this.times.length > 1) {
    if(this.times[this.times.length-2] === time) {
      N.log('N.AnalogSignal.appendData', 'Times '+(this.times.length-2)+' and '+(this.times.length-1)+' are equal with value '+time+'.');
      throw new Error('N.AnalogSignal.appendData sequence issue');
    }
    this.timeMax = time;
  }
  if(this.values.length === 1) {
    this.max = value;
    this.min = value;
  }
  else if(value > this.max) {
    this.max = value;
  }
  else if(value < this.min) {
    this.min = value;
  }
};

N.AnalogSignal.prototype.appendDataArray = function(dataArray) {
  for(var i=0; i<dataArray.length; i++) {
    var dataSet = dataArray[i];
    this.appendData(dataSet.t, dataSet.v);
  }
};

/***
 * Clears the array data and any derived numeric values (such as max and min).
 * @method clear
 * @return {N.AnalogSignal} this
 */
N.AnalogSignal.prototype.clear = function() {
  this.times      = [];
  this.timeMin    = 0.0;
  this.timeMax    = 0.0;
  this.values     = [];
  this.start      = 0.0;
  this.min        = 0.0;
  this.max        = 0.0;
  return this;
};

N.AnalogSignal.prototype.getIndexBeforeTime = function(t) {
  var i = this.finder.find(t, this.times);
  if(i < 0) {
    return 0;
  }
  else if(i >= this.times.length-1) {
    return this.times.length-1;
  }
  return i;
};

N.AnalogSignal.prototype.getNumSamples = function() {
  return this.values.length;
};

N.AnalogSignal.prototype.average = function() {
  if(this.times.length < 2) {
    if(this.times.length === 1) {
      return this.values[0];
    }
    return 0.0;
  }

  var sum = 0.0;
  var t0 = this.times[0];
  var tPrev = t0;
  var vPrev = this.values[0];
  for(var i=1; i<this.times.length; i++) {
    var t = this.times[i];
    var v = this.values[i];
    sum += 0.5*(v+vPrev)*(t-tPrev);
    tPrev = t;
    vPrev = v;
  }
  return sum/(tPrev-t0);
};

/**
 * Writes the signal data to the log.
 * @method writeToLog
 */
N.AnalogSignal.prototype.writeToLog = function() {
  N.log('Signal: '+this.times.length+' samples');
  for(var i=0; i<this.times.length; i++) {
    N.log(_.str.sprintf('    t:%d  v:%5.3f', this.times[i], this.values[i]));
  }
};

N.AnalogSignal.prototype.avgAbsDeviation = function(otherSignal) {
  var tMinSelf = this.times[0];
  var tMinOth  = otherSignal.times[0];
  var tMaxSelf = this.times[this.times.length-1];
  var tMaxOth  = otherSignal.times[otherSignal.times.length-1];

  var tMin = (tMinSelf < tMinOth ? tMinSelf : tMinOth);
  var tMax = (tMaxSelf < tMaxOth ? tMaxSelf : tMaxOth);
  if(tMax <= tMin) {
    return 0.0;
  }
  return this.avgAbsDeviationWithInterval(otherSignal, tMin, tMax);
};

N.AnalogSignal.prototype.avgAbsDeviationWithInterval = function(otherSignal, tMin, tMax) {
  var sum = 0.0;
  var t = tMin;
  var tMaxPlus = tMax+0.1* N.timeStep;
  while(t < tMaxPlus) {
    var vDiff = (this.getValue(t)-otherSignal.getValue(t));
    sum += Math.abs(vDiff)*(N.timeStep);
    t += N.timeStep;
  }
  return sum/(tMax-tMin+ N.timeStep);
};

N.AnalogSignal.prototype.toJSONx = function() {
  return JSON.stringify(this, function(k, v) {
    return (k === 'finder' ? undefined : v);
  });
};

  //******************
  //* DiscreteSignal *
  //******************

/**
 * A discrete signal class.
 * @class DiscreteSignal
 * @param name
 * @constructor
 */
N.DiscreteSignal = function(name) {
  this.className  = 'N.DiscreteSignal';
  this.type       = N.DISCRETE;
  this.id         = N.generateUUID();
  this.stateType  = N.DiscreteSignal.BISTATE;
  this.times      = [];
  this.timeMin    = 0.0;
  this.timeMax    = 0.0;
  this.values     = [];
  this.finder     = new N.TableSearch();
  this.start      = 0.0;
  this.name       = (typeof name === 'string' ? name : '');
  this.category   = 'Default';
  this.min        = 0;
  this.max        = 0;
  this.minLimit   = 0.0;
  this.maxLimit   = 1.0;
  this.unit       = 'State';
};

N.DiscreteSignal.BISTATE = 1;
N.DiscreteSignal.TRISTATE = 2;

N.DiscreteSignal.prototype.setStateType = function(stateType) {
  this.stateType = stateType;
  this.minLimit = (stateType === N.DiscreteSignal.BISTATE ? 0.0 : -1.0);
};

N.DiscreteSignal.prototype.getRange = function() {
  return { 'min': this.min, 'max': this.max };
};

/**
 * Get the value of the signal at a given time.
 * @method GetValue
 * @param {float} time
 * @returns {float}
 */
N.DiscreteSignal.prototype.getValue = function(time) {
  var t = time-this.start;
  if(this.times.length < 2) {
    if(this.times.length === 1) {
      return this.values[0];
    }
    return 0;
  }
  var i = this.finder.find(t, this.times);
  if(i < 0) { i = 0; }
  if(i >= this.times.length) { i = this.times.length-1; }
  return this.values[i];
};

N.DiscreteSignal.prototype.getTimeByIndex = function(index) {
  return this.times[index];
};

N.DiscreteSignal.prototype.getValueByIndex = function(index) {
  return this.values[index];
};

N.DiscreteSignal.prototype.getIndexBeforeTime = function(t) {
  var i = this.finder.find(t, this.times);
  if(i < 0) {
    return 0;
  }
  else if(i >= this.times.length-1) {
    return this.times.length-1;
  }
  return i;
};

N.DiscreteSignal.prototype.appendData = function(time, newState) {
  this.times.push(time);
  this.values.push(newState);

  if(this.times.length === 0) {
    this.timeMin = this.timeMax = time;
  }
  if(this.times.length > 1) {
    if(this.times[this.times.length-2] === time) {
      N.Log('ERROR: N.AnalogSignal.appendData: Times '+(this.times.length-2)+' and '+(this.times.length-1)+' are equal with value '+time+'.');
      throw new Error('N.AnalogSignal.appendData sequence issue');
    }
    this.timeMax = time;
  }

  if(this.values.length === 1) {
    this.max = newState;
    this.min = newState;
  }
  if(newState > this.max) {
    this.max = newState;
  }
  else if(newState < this.min) {
    this.min = newState;
  }
};

N.DiscreteSignal.prototype.appendDataArray = function(dataArray) {
  for(var i=0; i<dataArray.length; i++) {
    var dataSet = dataArray[i];
    this.appendData(dataSet.t, dataSet.v);
  }
};

N.DiscreteSignal.prototype.getNumSamples = function() {
  return this.values.length;
};

N.DiscreteSignal.prototype.average = function() {
  if(this.times.length < 2) {
    if(this.times.length === 1) {
      return this.values[0];
    }
    return 0.0;
  }

  var sum = 0.0;
  var t0 = this.times[0];
  var tPrev = t0;
  var vPrev = this.values[0];
  for(var i=1; i<this.times.length; i++) {
    var t = this.times[i];
    var v = this.values[i];
    sum += vPrev*(t-tPrev);
    tPrev = t;
    vPrev = v;
  }
  return sum/(tPrev-t0);
};

N.DiscreteSignal.prototype.avgAbsDeviation = function(otherSignal) {
  var tMinSelf = this.times[0];
  var tMinOth  = otherSignal.times[0];
  var tMaxSelf = this.times[this.times.length-1];
  var tMaxOth  = otherSignal.times[otherSignal.times.length-1];

  var tMin = (tMinSelf < tMinOth ? tMinSelf : tMinOth);
  var tMax = (tMaxSelf < tMaxOth ? tMaxSelf : tMaxOth);
  if(tMax <= tMin) {
    return 0.0;
  }
  return this.avgAbsDeviationWithInterval(otherSignal, tMin, tMax);
};

N.DiscreteSignal.prototype.avgAbsDeviationWithInterval = function(otherSignal, tMin, tMax) {
  var sum = 0.0;
  var t = tMin;
  var tMaxPlus = tMax+0.1* N.timeStep;
  while(t < tMaxPlus) {
    var vDiff = (this.getValue(t)-otherSignal.getValue(t));
    sum += Math.abs(vDiff)*(N.timeStep);
    t += N.timeStep;
  }
  return sum/(tMax-tMin+2*N.timeStep);
};

N.DiscreteSignal.prototype.toJSON = function() {
  return JSON.stringify(this, function(k, v) { return (k === 'finder' ? undefined : v); });
};

/**
 * Loads the properties of the JSON configuration to self. In doing so it creates any child neurons.
 * @method loadFrom
 * @param {JSON} json The JSON object containing the configuration.
 * @returns {Network} Returns a reference to self
 */
N.DiscreteSignal.prototype.loadFrom = function(json) {
  for(var i in json) {
    if(i === 'DataArray') {
      this.appendDataArray(json[i]);
    }
    else {
      this[i] = json[i];
    }
  }

  return this;
};

/**
 * This is the N signal global functions.
 * @class N.Signal
 */
N.Signal = N.Signal || {};

/**
 * Creates a discrete square wave signal consisting of down and up parts. The length of down, up, the amplitude and offsets are all configurable.
 * @method CreatePulseSignal
 * @param {Object} conf
 * @param {float} conf.durationOff
 * @param {float} conf.durationOn
 * @param {float} conf.signalLength
 * @param {float} conf.offset
 * @param {float} conf.amplitude
 * @param {float} conf.lowValue
 * @param {float} conf.startOn
 * @returns {N.DiscreteSignal}
 */
N.Signal.CreatePulseSignal = function(conf) {
  var durationOff       = conf.durationOff,
      durationOn        = conf.durationOn,
      signalLength      = conf.signalLength,
      offset            = conf.hasOwnProperty('offset')    ? conf.offset : 0.0,
      amplitude         = conf.hasOwnProperty('amplitude') ? conf.amplitude : 1.0,
      lowValue          = conf.hasOwnProperty('lowValue')  ? conf.lowValue : 0.0,
      startOn           = conf.hasOwnProperty('startOn')   ? conf.startOn : false;
  var signal = new N.DiscreteSignal();
  var time = -offset;
  var on = startOn;

  // Find the start time.
  if(offset !== 0.0) {
    while(true) {
      if(time+(on ? durationOn : durationOff) > 0.0) {
        signal.appendData(0.0, (on ? amplitude : 0.0));
        time += (on ? durationOn : durationOff);
        on = !on;
        break;
      }
      time += (on ? durationOn : durationOff);
      on = !on;
    }
  }

  while(true) {
    signal.appendData(time, (on ? amplitude : 0.0));
    time += (on ? durationOn : durationOff);
    if(time === signalLength) {
      break;
    }
    else if(time > signalLength) {
      signal.appendData(signalLength, (on ? amplitude : 0.0));
      break;
    }
    on = !on;
  }
  return signal;
};



  //*******************
  //* N.SignalCompare *
  //*******************

N.SignalCompare = function() {
  this.tolerance = 0.01;
};

N.SignalCompare.prototype.compare = function(expected, actual) {

};


  //*****************
  //* N.TableSearch *
  //*****************

/**
 * A numerical algorithm class for finding the index of numbers bracketting a target number. The array must be either
 * monotonically increasing or decreasing array of numbers.
 *
 * @class TableSearch
 * @constructor
 */
N.TableSearch = function() {
  this.className  = 'N.TableSearch';
  this.indexLow = 0;
  this.indexHigh = 0;
  this.ascending = true;
  this.size = 0;
};

/**
 * Returns the last low index found.
 * @returns {float}
 * @constructor
 */
N.TableSearch.prototype.getIndexLow = function() {
  return this.indexLow;
};

/**
 * Find the index in the array 'x' that is where the index is below xTarget and index+1 is above xTarget. If the target
 * is before the beginning of the array then it returns -1. If it is beyond the end of the array it returns x.length-1.
 *
 * @method find
 * @param {float} xTarget
 * @param {Array} x
 * @returns {number}
 * @constructor
 */
N.TableSearch.prototype.find = function(xTarget, x) {
  this.size = x.length;
  this.ascending = (x[this.size-1] > x[0]);

  // Due to a poor initial guess try bisection.
  if(this.indexLow <= -1 || this.indexLow > this.size-1)  {
    this.indexLow  = -1;
    this.indexHigh = this.size;
  }
  else {
    if ((xTarget >= x[this.indexLow]) === this.ascending) {
      if(this.indexLow === this.size-1) {
        return this.indexLow;
      }
      this.huntUp(xTarget,x);
    }
    else {
      if(this.indexLow === 0)  {
        this.indexLow = -1;
        return this.indexLow;
      }
      this.huntDown(xTarget, x);
    }
  }

  this.bisection(xTarget,x);
  return this.indexLow;
};

N.TableSearch.prototype.huntUp = function(xTarget, x) {
  var increment = 1;
  this.indexHigh = this.indexLow+1;

  while((xTarget >= x[this.indexHigh]) === this.ascending) {

    // Double the hunting increment.
    this.indexLow = this.indexHigh;
    increment += increment;
    this.indexHigh = this.indexLow+increment;

    // If we are off the high end of the vector, leave.
    if(this.indexHigh > this.size-1) {
      this.indexHigh = this.size;
      break;
    }
  }
};

N.TableSearch.prototype.huntDown = function(xTarget, x) {
  var increment = 1;
  this.indexHigh = this.indexLow;
  this.indexLow -= 1;

  while(xTarget < x[this.indexLow] === this.ascending) {
    // Double the hunting increment.
    this.indexHigh = this.indexLow;
    increment += increment;
    this.indexLow = this.indexHigh-increment;

    // If we are off the low end of the vector, leave.
    if(this.indexLow < 0) {
      this.indexLow = -1;
      break;
    }
  }
};

N.TableSearch.prototype.bisection = function(xTarget, x) { // xTarget is float, x is array of floats
  while(this.indexHigh-this.indexLow !== 1) {
    var indexMiddle = (this.indexHigh+this.indexLow) >> 1;

    if((xTarget > x[indexMiddle]) === this.ascending) {
      this.indexLow = indexMiddle;
    }
    else {
      this.indexHigh = indexMiddle;
    }
  }
};

