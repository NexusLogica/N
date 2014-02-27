/**********************************************************************

File     : signal-trace.js
Project  : N Simulator Library
Purpose  : Source file for signal trace user interface objects.
Revisions: Original definition by Lawrence Gunn.
           2014/01/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //****************************
  //* N.UI.SignalTraceRenderer *
  //****************************

N.UI.SignalTraceRenderer = function() {
}

N.UI.SignalTraceRenderer.prototype.Configure = function(svgParent, signal) {
  this._svgParent = svgParent;
  this.Signal = N.M.Signals.GetSignal(signal);
  this._needsRecalc = true;
  this._boundary = { x:0, y:0, width: svgParent.width(), height: svgParent.height() };
  this._timeAtOrigin = 0.0;
  this._yAtOrigin = 0.0;
  this._scale = 1.0; // Default
  var num = this.Signal.GetNumSamples();
  if(num > 1) {
    var range = this.Signal.GetTimeByIndex(num-1)-this.Signal.GetTimeByIndex(0);
    this._scale = this._boundary.width/range;
  }
}

N.UI.SignalTraceRenderer.prototype.SetCanvasBoundary = function(box) {
  this._boundary = box;

  var num = this.Signal.GetNumSamples();
  if(num > 1) {
    var range = this.Signal.GetTimeByIndex(num-1)-this.Signal.GetTimeByIndex(0);
    this._scale = this._boundary.width/range;
  }

  this._needsRecalc = true;
}

N.UI.SignalTraceRenderer.prototype.SetScale = function(min, max) {
  var num = this.Signal.GetNumSamples();
  if(num > 1) {
    var range = this.Signal.GetTimeByIndex(num-1)-this.Signal.GetTimeByIndex(0);
    this._scale = (this._boundary.width/range)/(max-min);
    this._timeAtOrigin = range*min;
  }
  this._needsRecalc = true;
  this.Render();
}

N.UI.SignalTraceRenderer.prototype.SetAbsoluteScale = function(timeAtOrigin, scale) {
  this._timeAtOrigin = timeAtOrigin;
  this._scale = scale;
  this._needsRecalc = true;
}

N.UI.SignalTraceRenderer.prototype.Render = function() {
  if(this._needsRecalc) {
    this._needsRecalc = false;
    this.CalculateVerticalRange();
    this.CalculateHorizontalRange();
  }

  this._RenderXAxis();

  if(this.Signal.GetNumSamples() > 1) {
    if(this.Signal.Type === N.Signal.ANALOG) {
      this._RenderAnalogTrace();
    }
    else {
      this._RenderDiscreteTrace();
    }
  }
}

N.UI.SignalTraceRenderer.prototype._RenderAnalogTrace = function() {
  var t = this.Signal.GetTimeByIndex(this._startIndex);
  var val = this.Signal.GetValueByIndex(this._startIndex);
  var tScaled = this.TimeToPixel(t);
  var valScaled = this.YToPixel(val);
  var p = 'M'+tScaled+' '+valScaled;

  for(var i=this._startIndex+1; i <= this._endIndex; i++) {
    t = this.Signal.GetTimeByIndex(i);
    val = this.Signal.GetValueByIndex(i);
    tScaled = this.TimeToPixel(t);
    valScaled = this.YToPixel(val);
    p += 'L'+tScaled+' '+valScaled;
  }

  if(!this._path) {
    this._path = this._svgParent.path(p).attr({ stroke:N.UI.Categories[this.Signal.Category].TraceColor, fill: 'none' });
    var extra = 200;
    this._clipRect = this._svgParent.rect(this._boundary.width, this._boundary.height+2*extra).move(this._boundary.x, this._boundary.y-extra);
    this._path.clipWith(this._clipRect);
  }
  else {
    this._path.plot(p);
  }
}

N.UI.SignalTraceRenderer.prototype._RenderDiscreteTrace = function() {
  var t = this.Signal.GetTimeByIndex(this._startIndex);
  var prevState = this.Signal.GetValueByIndex(this._startIndex);
  var tScaled = this.TimeToPixel(t);
  var statePrevScaled = this.YToPixel(prevState);
  var p = 'M'+tScaled+' '+statePrevScaled;

  for(var i=this._startIndex+1; i <= this._endIndex; i++) {
    t = this.Signal.GetTimeByIndex(i);
    var state = this.Signal.GetValueByIndex(i);
    if(state !== prevState) {
      tScaled = this.TimeToPixel(t);
      p += 'L'+tScaled+' '+statePrevScaled;
      var stateScaled = this.YToPixel(state);
      p += 'L'+tScaled+' '+stateScaled;
      statePrevScaled = stateScaled;
    }
    else if(i === this._endIndex) {
      tScaled = this.TimeToPixel(t);
      p += 'L'+tScaled+' '+statePrevScaled;
    }
    prevState = state;
  }

  if(!this._path) {
    this._path = this._svgParent.path(p).attr({ stroke:N.UI.Categories[this.Signal.Category].TraceColor, fill: 'none' });
    var extra = 200;
    this._clipRect = this._svgParent.rect(this._boundary.width, this._boundary.height+2*extra).move(this._boundary.x, this._boundary.y-extra);
    this._path.clipWith(this._clipRect);
  }
  else {
    this._path.plot(p);
  }
}

N.UI.SignalTraceRenderer.prototype._RenderXAxis = function() {
  var y = this.YToPixel(0.0);
  var p = '';
  if(this.Signal.GetNumSamples() > 1) {
    var xStart = this.TimeToPixel(this.Signal.TimeMin);
    var xEnd = this.TimeToPixel(this.Signal.TimeMax);
    p = 'M'+xStart+' '+y+'L'+xEnd+' '+y;
  }
  else {
    p = 'M'+this._boundary.x+' '+y+'L'+(this._boundary.x+this._boundary.width)+' '+y;
  }

  if(!this._xAxis) {
    this._xAxis = this._svgParent.path(p).attr({ class: 'axis', 'stroke-dasharray': '6, 6', fill: 'none' });
    var extra = 200;
    this._clipRect = this._svgParent.rect(this._boundary.width, this._boundary.height+2*extra).move(this._boundary.x, this._boundary.y-extra);
    this._xAxis.clipWith(this._clipRect);
  }
  else {
    this._xAxis.plot(p);
  }
}

// The formula of time to pixel is
//   pixel = scale*time-timeAtOrigin+pixelOrigin
//
// where scale is d(pixel)/d(time)
//
N.UI.SignalTraceRenderer.prototype.TimeToPixel = function(time) {
  var pixel = this._scale*(time-this._timeAtOrigin)+this._boundary.x;
  return pixel;
}

// The formula is
//   time = (pixel+timeAtOrigin-pixelOrigin)/scale
N.UI.SignalTraceRenderer.prototype.PixelToTime = function(pixel) {
  var time = (pixel+this._timeAtOrigin-this._boundary.x)/this._scale;
  return time;
}

N.UI.SignalTraceRenderer.prototype.YToPixel = function(y) {
  var pixelUp = this._yScale*y+this._yOriginPixels;
  var pixelDown = this._boundary.y+this._boundary.height - pixelUp;
  return pixelDown;
}

// The formula is
//   time = (pixel+timeAtOrigin-pixelOrigin)/scale
N.UI.SignalTraceRenderer.prototype.PixelToY = function(pixel) {
  return 0;
}

N.UI.SignalTraceRenderer.prototype.CalculateVerticalRange = function() {
  var range = (this.Signal.MaxLimit-this.Signal.MinLimit);
  this._yScale = this._boundary.height/range;
  this._yAtBottom = this.Signal.MinLimit;
  this._yOriginPixels = -this._boundary.height*this.Signal.MinLimit/range;
}

N.UI.SignalTraceRenderer.prototype.CalculateHorizontalRange = function() {
  this._startIndex = this.Signal.GetIndexBeforeTime(this._timeAtOrigin);
  var timeAtEnd = this._timeAtOrigin+this._boundary.width/this._scale;
  this._endIndex = this.Signal.GetIndexBeforeTime(timeAtEnd);
  if(this._endIndex <= this.Signal.GetNumSamples()-1) {
    this._endIndex++;
  }
}
