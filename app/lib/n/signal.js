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
 * @param {String} shortName
 */

N.AnalogSignal = function(name) {
  this.ClassName  = 'N.AnalogSignal';
  this.Type       = N.ANALOG;
  this.Id         = N.GenerateUUID();
  this._finder    = new N.TableSearch();
  this.Name       = (typeof name === 'string' ? name : '');
  this.Category   = 'Default';
  this.Unit       = 'Hz';
  this.MinLimit   = 0.0;
  this.MaxLimit   = 100.0;

  this.clear();
}

/**
 * Returns the minimum and maximum values in the signal.
 * @method GetRange
 * @returns {{Min: Real, Max: Real}}
 */
N.AnalogSignal.prototype.GetRange = function() {
  return { 'Min': this.Min, 'Max': this.Max };
}

/**
 * Returns the value at a certain time. If the time is before the begining of the signal data then the value of the
 * first element is returned. If it is after the end then the last value is returned. Values between times are linearly interpolated between them.
 * @method GetValue
 * @param time
 * @returns {Real} The value.
 */
N.AnalogSignal.prototype.GetValue = function(time) {
  var t = time-this.Start;
  if(this.Times.length < 2) {
    if(this.Times.length < 1) {
      return 0.0;
    }
    return this.Values[0];
  }

  var i = this._finder.Find(t, this.Times);
  if(i < 0) {
    return this.Values[0];
  }
  else if(i >= this.Times.length-1) {
    return this.Values[this.Times.length-1];
  }

  var x0 = this.Times[i];
  var x1 = this.Times[i+1];
  var y0 = this.Values[i];
  var y1 = this.Values[i+1];
  var value = y0+(y1-y0)*(t-x0)/(x1-x0);
  if(_.isNaN(value)) {
    debugger;
  }
  return value;
}

/**
 * Returns the time at a given index.
 * @method GetTimeByIndex
 * @param index
 * @returns {Real} Returns the time or 'undefined' if the index is out of range.
 */
N.AnalogSignal.prototype.GetTimeByIndex = function(index) {
  return this.Times[index];
}

N.AnalogSignal.prototype.GetValueByIndex = function(index) {
  return this.Values[index];
}

N.AnalogSignal.prototype.AppendData = function(time, value) {
  if(_.isNaN(value)) {
    debugger;
  }
  this.Times.push(time);
  this.Values.push(value);
  if(this.Times.length === 0) {
    this.TimeMin = this.TimeMax = time;
  }
  if(this.Times.length > 1) {
    if(this.Times[this.Times.length-2] === time) {
      N.L('N.AnalogSignal.AppendData', 'Times '+(this.Times.length-2)+' and '+(this.Times.length-1)+' are equal with value '+time+'.');
      throw new Error('N.AnalogSignal.AppendData sequence issue');
    }
    this.TimeMax = time;
  }
  if(this.Values.length === 1) {
    this.Max = value;
    this.Min = value;
  }
  else if(value > this.Max) {
    this.Max = value;
  }
  else if(value < this.Min) {
    this.Min = value;
  }
}

N.AnalogSignal.prototype.appendDataArray = function(dataArray) {
  for(var i=0; i<dataArray.length; i++) {
    var dataSet = dataArray[i];
    this.AppendData(dataSet.t, dataSet.v);
  }
}

/***
 * Clears the array data and any derived numeric values (such as max and min).
 * @method clear
 * @return {N.AnalogSignal} this
 */
N.AnalogSignal.prototype.clear = function() {
  this.Times      = [];
  this.TimeMin    = 0.0;
  this.TimeMax    = 0.0;
  this.Values     = [];
  this.Start      = 0.0;
  this.Min        = 0.0;
  this.Max        = 0.0;
  return this;
}

N.AnalogSignal.prototype.GetIndexBeforeTime = function(t) {
  var i = this._finder.Find(t, this.Times);
  if(i < 0) {
    return 0;
  }
  else if(i >= this.Times.length-1) {
    return this.Times.length-1;
  }
  return i;
}

N.AnalogSignal.prototype.GetNumSamples = function() {
  return this.Values.length;
}

N.AnalogSignal.prototype.Average = function() {
  if(this.Times.length < 2) {
    if(this.Times.length === 1) {
      return this.Values[0];
    }
    return 0.0;
  }

  var sum = 0.0;
  var t0 = this.Times[0];
  var tPrev = t0;
  var vPrev = this.Values[0];
  for(var i=1; i<this.Times.length; i++) {
    var t = this.Times[i];
    var v = this.Values[i];
    sum += 0.5*(v+vPrev)*(t-tPrev);
    tPrev = t;
    vPrev = v;
  }
  var avg = sum/(tPrev-t0);
  return avg;
}

/**
 * Writes the signal data to the log.
 * @method WriteToLog
 */
N.AnalogSignal.prototype.WriteToLog = function() {
  N.L('Signal: '+this.Times.length+' samples');
  for(var i=0; i<this.Times.length; i++) {
    N.L(_.str.sprintf('    t:%d  v:%5.3f', this.Times[i], this.Values[i]));
  }
}

N.AnalogSignal.prototype.AvgAbsDeviation = function(otherSignal) {
  var tMinSelf = this.Times[0];
  var tMinOth  = otherSignal.Times[0];
  var tMaxSelf = this.Times[this.Times.length-1];
  var tMaxOth  = otherSignal.Times[otherSignal.Times.length-1];

  var tMin = (tMinSelf < tMinOth ? tMinSelf : tMinOth);
  var tMax = (tMaxSelf < tMaxOth ? tMaxSelf : tMaxOth);
  if(tMax <= tMin) {
    return 0.0;
  }
  return this.AvgAbsDeviationWithInterval(otherSignal, tMin, tMax);
}

N.AnalogSignal.prototype.AvgAbsDeviationWithInterval = function(otherSignal, tMin, tMax) {
  var sum = 0.0;
  var t = tMin;
  var tMaxPlus = tMax+0.1* N.TimeStep;
  while(t < tMaxPlus) {
    var vDiff = (this.GetValue(t)-otherSignal.GetValue(t));
    sum += Math.abs(vDiff)*(N.TimeStep);
    t += N.TimeStep;
  }
  var dev = sum/(tMax-tMin+ N.TimeStep);
  return dev;
}

N.AnalogSignal.prototype.ToJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
  return str;
}

  //******************
  //* DiscreteSignal *
  //******************

/**
 * A discrete signal class.
 * @class DiscreteSignal
 * @param name
 * @param shortName
 * @constructor
 */
N.DiscreteSignal = function(name) {
  this.ClassName  = 'N.DiscreteSignal';
  this.Type       = N.DISCRETE;
  this.Id         = N.GenerateUUID();
  this.StateType  = N.DiscreteSignal.BISTATE;
  this.Times      = [];
  this.TimeMin    = 0.0;
  this.TimeMax    = 0.0;
  this.Values     = [];
  this._finder    = new N.TableSearch();
  this.Start      = 0.0;
  this.Name       = (typeof name === 'string' ? name : '');
  this.Category   = 'Default';
  this.Min        = 0;
  this.Max        = 0;
  this.MinLimit   = 0.0;
  this.MaxLimit   = 1.0;
  this.Unit       = 'State';
}

N.DiscreteSignal.BISTATE = 1;
N.DiscreteSignal.TRISTATE = 2;

N.DiscreteSignal.prototype.SetStateType = function(stateType) {
  this.StateType = stateType;
  this.MinLimit = (stateType === N.DiscreteSignal.BISTATE ? 0.0 : -1.0);
}

N.DiscreteSignal.prototype.GetRange = function() {
  return { 'Min': this.Min, 'Max': this.Max };
}

/**
 * Get the value of the signal at a given time.
 * @method GetValue
 * @param {Real} time
 * @returns {Real}
 */
N.DiscreteSignal.prototype.GetValue = function(time) {
  var t = time-this.Start;
  if(this.Times.length < 2) {
    if(this.Times.length === 1) {
      return this.Values[0];
    }
    return 0;
  }
  var i = this._finder.Find(t, this.Times);
  if(i < 0) { i = 0; }
  if(i >= this.Times.length) { i = this.Times.length-1; }
  return this.Values[i];
}

N.DiscreteSignal.prototype.GetTimeByIndex = function(index) {
  return this.Times[index];
}

N.DiscreteSignal.prototype.GetValueByIndex = function(index) {
  return this.Values[index];
}

N.DiscreteSignal.prototype.GetIndexBeforeTime = function(t) {
  var i = this._finder.Find(t, this.Times);
  if(i < 0) {
    return 0;
  }
  else if(i >= this.Times.length-1) {
    return this.Times.length-1;
  }
  return i;
}

N.DiscreteSignal.prototype.AppendData = function(time, newState) {
  this.Times.push(time);
  this.Values.push(newState);

  if(this.Times.length === 0) {
    this.TimeMin = this.TimeMax = time;
  }
  if(this.Times.length > 1) {
    if(this.Times[this.Times.length-2] === time) {
      N.L('ERROR: N.AnalogSignal.AppendData: Times '+(this.Times.length-2)+' and '+(this.Times.length-1)+' are equal with value '+time+'.');
      throw new Error('N.AnalogSignal.AppendData sequence issue');
    }
    this.TimeMax = time;
  }

  if(this.Values.length === 1) {
    this.Max = newState;
    this.Min = newState;
  }
  if(newState > this.Max) {
    this.Max = newState;
  }
  else if(newState < this.Min) {
    this.Min = newState;
  }
}

N.DiscreteSignal.prototype.appendDataArray = function(dataArray) {
  for(var i=0; i<dataArray.length; i++) {
    var dataSet = dataArray[i];
    this.AppendData(dataSet.t, dataSet.v);
  }
}

N.DiscreteSignal.prototype.GetNumSamples = function() {
  return this.Values.length;
}

N.DiscreteSignal.prototype.Average = function() {
  if(this.Times.length < 2) {
    if(this.Times.length === 1) {
      return this.Values[0];
    }
    return 0.0;
  }

  var sum = 0.0;
  var t0 = this.Times[0];
  var tPrev = t0;
  var vPrev = this.Values[0];
  for(var i=1; i<this.Times.length; i++) {
    var t = this.Times[i];
    var v = this.Values[i];
    sum += vPrev*(t-tPrev);
    tPrev = t;
    vPrev = v;
  }
  var avg = sum/(tPrev-t0);
  return avg;
}

N.DiscreteSignal.prototype.AvgAbsDeviation = function(otherSignal) {
  var tMinSelf = this.Times[0];
  var tMinOth  = otherSignal.Times[0];
  var tMaxSelf = this.Times[this.Times.length-1];
  var tMaxOth  = otherSignal.Times[otherSignal.Times.length-1];

  var tMin = (tMinSelf < tMinOth ? tMinSelf : tMinOth);
  var tMax = (tMaxSelf < tMaxOth ? tMaxSelf : tMaxOth);
  if(tMax <= tMin) {
    return 0.0;
  }
  return this.AvgAbsDeviationWithInterval(otherSignal, tMin, tMax);
}

N.DiscreteSignal.prototype.AvgAbsDeviationWithInterval = function(otherSignal, tMin, tMax) {
  var sum = 0.0;
  var t = tMin;
  var tMaxPlus = tMax+0.1* N.TimeStep;
  while(t < tMaxPlus) {
    var vDiff = (this.GetValue(t)-otherSignal.GetValue(t));
    sum += Math.abs(vDiff)*(N.TimeStep);
    t += N.TimeStep;
  }
  var dev = sum/(tMax-tMin+2*N.TimeStep);
  return dev;
}

N.DiscreteSignal.prototype.ToJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
  return str;
}

/**
 * Loads the properties of the JSON configuration to self. In doing so it creates any child neurons.
 * @method LoadFrom
 * @param {JSON} json The JSON object containing the configuration.
 * @returns {Network} Returns a reference to self
 */
N.DiscreteSignal.prototype.LoadFrom = function(json) {
  for(var i in json) {
    if(i === 'DataArray') {
      this.appendDataArray(json[i]);
    }
    else {
      this[i] = json[i];
    }
  }

  return this;
}

/**
 * This is the N signal global functions.
 * @class N.Signal
 */
N.Signal = N.Signal || {};

/**
 * Creates a discrete square wave signal consisting of down and up parts. The length of down, up, the amplitude and offsets are all configurable.
 * @method CreatePulseSignal
 * @param {Real} durationOff
 * @param {Real} durationOn
 * @param {Real} signalLength
 * @param {Real} offset
 * @param {Real} amplitude
 * @param {Real} lowValue
 * @param {Real} startOn
 * * @returns {N.DiscreteSignal}
 */
N.Signal.CreatePulseSignal = function(conf) {
  var durationOff       = conf.durationOff,
      durationOn        = conf.durationOn,
      signalLength      = conf.signalLength,
      offset            = conf.hasOwnProperty('offset')    ? conf.offset : 0.0,
      amplitude         = conf.hasOwnProperty('amplitude') ? conf.amplitude : 1.0,
      lowValue          = conf.hasOwnProperty('lowValue')  ? conf.lowValue : 0.0,
      startOn           = conf.hasOwnProperty('startOn')   ? conf.startOn : false
  var signal = new N.DiscreteSignal();
  var timeOffset = offset;
  var time = -timeOffset;
  var on = startOn;

  // Find the start time.
  if(offset !== 0.0) {
    while(true) {
      if(time+(on ? durationOn : durationOff) > 0.0) {
        signal.AppendData(0.0, (on ? amplitude : 0.0));
        time += (on ? durationOn : durationOff);
        on = !on;
        break;
      }
      time += (on ? durationOn : durationOff);
      on = !on;
    }
  }

  while(true) {
    signal.AppendData(time, (on ? amplitude : 0.0));
    time += (on ? durationOn : durationOff);
    if(time === signalLength) {
      break;
    }
    else if(time > signalLength) {
      signal.AppendData(signalLength, (on ? amplitude : 0.0));
      break;
    }
    on = !on;
  }
  return signal;
}



  //*******************
  //* N.SignalCompare *
  //*******************

N.SignalCompare = function() {
  this.Tolerance = 0.01;
}

N.SignalCompare.prototype.Compare = function(expected, actual) {

}


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
  this.ClassName  = 'N.TableSearch';
  this.indexLow = 0;
  this.indexHigh = 0;
  this.ascending = true;
  this.size = 0;
}

/**
 * Returns the last low index found.
 * @returns {Real}
 * @constructor
 */
N.TableSearch.prototype.GetIndexLow = function() {
  return this.indexLow;
}

/**
 * Find the index in the array 'x' that is where the index is below xTarget and index+1 is above xTarget. If the target
 * is before the beginning of the array then it returns -1. If it is beyond the end of the array it returns x.length-1.
 *
 * @method Find
 * @param {Real} xTarget
 * @param {Array} x
 * @returns {Integer}
 * @constructor
 */
N.TableSearch.prototype.Find = function(xTarget, x) {
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
      this._HuntUp(xTarget,x);
    }
    else {
      if(this.indexLow === 0)  {
        this.indexLow = -1;
        return this.indexLow;
      }
      this._HuntDown(xTarget, x);
    }
  }

  this._Bisection(xTarget,x);
  return this.indexLow;
}

N.TableSearch.prototype._HuntUp = function(xTarget, x) {
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
}

N.TableSearch.prototype._HuntDown = function(xTarget, x) {
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
}

N.TableSearch.prototype._Bisection = function(xTarget, x) { // xTarget is float, x is array of floats
  while(this.indexHigh-this.indexLow !== 1) {
    var indexMiddle = (this.indexHigh+this.indexLow) >> 1;

    if((xTarget > x[indexMiddle]) === this.ascending) {
      this.indexLow = indexMiddle;
    }
    else {
      this.indexHigh = indexMiddle;
    }
  }
}

