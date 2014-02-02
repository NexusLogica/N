/**********************************************************************

File     : signal.js
Project  : N Simulator Library
Purpose  : Source file for signal relate objects.
Revisions: Original definition by Lawrence Gunn.
           2014/01/09

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/

  //**********
  //* Signal *
  //**********

N.Signal = function() {
}

N.Signal.ANALOG = 1;
N.Signal.DISCRETE = 2;

N.Signal.prototype.GetRange = function() {
  return { "Min": this.Min, "Max": this.Max };
}

  //****************
  //* AnalogSignal *
  //****************

N.AnalogSignal = function() {
  this.ClassName  = "N.AnalogSignal";
  this.Type       = N.Signal.ANALOG;
  this.Id         = N.M.GenerateUUID();
  this.Times      = [];
  this.Values     = [];
  this._finder    = new N.TableSearch;
  this.Start      = 0.0;
  this.Name       = "";
  this.ShortName  = "";
  this.Category   = 'Default';
  this.Min        = 0.0;
  this.Max        = 0.0;
  this.MinLimit   = 0.0;
  this.MaxLimit   = 100.0;
  this.Unit       = "Hz";
}

N.AnalogSignal.prototype = new N.Signal;

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
  return value;
}

N.AnalogSignal.prototype.GetTimeByIndex = function(index) {
  return this.Times[index];
}

N.AnalogSignal.prototype.GetValueByIndex = function(index) {
  return this.Values[index];
}

N.AnalogSignal.prototype.AppendData = function(time, value) {
  this.Times.push(time);
  this.Values.push(value);
  if(this.Times > 1) {
    if(this.Times[this.Times.length-2] == time) {
      N.LogError("N.AnalogSignal.AppendData", "Times "+(this.Times.length-2)+" and "+(this.Times.length-1)+" are equal with value "+time+".");
      throw new Error("N.AnalogSignal.AppendData sequence issue");
    }
  }
  if(this.Values.length == 1) {
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

N.AnalogSignal.prototype.ToJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k == "_finder" ? undefined : v); });
  return str;
}

  //******************
  //* DiscreteSignal *
  //******************

N.DiscreteSignal = function() {
  this.ClassName  = "N.DiscreteSignal";
  this.Type       = N.Signal.DISCRETE;
  this.Id         = N.M.GenerateUUID();
  this.StateType  = N.DiscreteSignal.BISTATE;
  this.Times      = [];
  this.Values     = [];
  this._finder    = new N.TableSearch;
  this.Start      = 0.0;
  this.Name       = "";
  this.ShortName  = "";
  this.Category   = 'Default';
  this.Min        = 0;
  this.Max        = 0;
  this.MinLimit   = 0.0;
  this.MaxLimit   = 1.0;
  this.Unit       = "State";
}

N.DiscreteSignal.BISTATE = 1;
N.DiscreteSignal.TRISTATE = 2;

N.DiscreteSignal.prototype = new N.Signal;

N.DiscreteSignal.prototype.SetStateType = function(stateType) {
  this.StateType = stateType;
  this.MinLimit = (stateType == N.DiscreteSignal.BISTATE ? 0.0 : -1.0);
}

N.DiscreteSignal.prototype.GetValue = function(time) {
  var t = time-this.Start;
  if(this.Times.length < 2) {
    if(this.Times.length == 1) {
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

N.DiscreteSignal.prototype.AppendValue = function(time, newState) {
  this.Times.push(time);
  this.Values.push(newState);

  if(this.Values.length == 1) {
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

N.DiscreteSignal.prototype.GetNumSamples = function() {
  return this.Values.length;
}

N.DiscreteSignal.prototype.ToJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k == "_finder" ? undefined : v); });
  return str;
}

  //***************
  //* TableSearch *
  //***************

N.TableSearch = function() {
  this.ClassName  = "N.TableSearch";
  this.indexLow = 0;
  this.indexHigh;
  this.ascending;
  this.size;
}

N.TableSearch.prototype.GetIndexLow = function() {
  return this.indexLow;
}

N.TableSearch.prototype.SetIndexLow = function(i) {
  this.indexLow = i;
}

N.TableSearch.prototype.Find = function(xTarget, x) {
  this.size = x.length;
  this.ascending = (x[this.size-1] > x[0]);

  // Due to a poor initial guess try bisection.
  if(this.indexLow <= -1 || this.indexLow > this.size-1)  {
    this.indexLow  = -1;
    this.indexHigh = this.size;
  }
  else {
    if ((xTarget >= x[this.indexLow]) == this.ascending) {
      if(this.indexLow == this.size-1) {
        return this.indexLow;
      }
      this._HuntUp(xTarget,x);
    }
    else {
      if(this.indexLow == 0)  {
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

  while((xTarget >= x[this.indexHigh]) == this.ascending) {

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

  while(xTarget < x[this.indexLow] == this.ascending) {
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
  while(this.indexHigh-this.indexLow != 1) {
    var indexMiddle = (this.indexHigh+this.indexLow) >> 1;

    if((xTarget > x[indexMiddle]) == this.ascending) {
      this.indexLow = indexMiddle;
    }
    else {
      this.indexHigh = indexMiddle;
    }
  }
}
