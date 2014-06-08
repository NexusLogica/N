/**********************************************************************

File     : pi-signal-trace.js
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

  //*************************
  //* SignalTraceController *
  //*************************

nSimAppDirectives.directive('piTraceView', [function() {
  return {
    restrict: 'A',
    link : function($scope, $element, $attrs) {
      $scope.$on('graph:range-modification', function(event, min, max) {
        $scope.scene.TraceRenderer.SetScale(min, max);
      });
    }
  };
}]);

  //****************************
  //* N.UI.SignalTraceRenderer *
  //****************************

N.UI.SignalTraceRenderer = function() {
}

N.UI.SignalTraceRenderer.prototype.Configure = function(svgParent, signal) {
  this.SvgParent = svgParent;
  this.Signal = signal;
  this.NeedsRecalc = true;
  this.Boundary = { x:0, y:0, width: svgParent.width(), height: svgParent.height() };
  this.TimeAtOrigin = 0.0;
  this.YAtOrigin = 0.0;
  this.Scale = 1.0; // Default
  var num = this.Signal.GetNumSamples();
  if(num > 1) {
    var range = this.Signal.GetTimeByIndex(num-1)-this.Signal.GetTimeByIndex(0);
    this.Scale = this.Boundary.Width/range;
  }
}

N.UI.SignalTraceRenderer.prototype.SetCanvasBoundary = function(box) {
  this.Boundary = box;

  var num = this.Signal.GetNumSamples();
  if(num > 1) {
    var range = this.Signal.GetTimeByIndex(num-1)-this.Signal.GetTimeByIndex(0);
    this.Scale = this.Boundary.Width/range;
  }

  this.NeedsRecalc = true;
}

N.UI.SignalTraceRenderer.prototype.SetScale = function(min, max) {
  var num = this.Signal.GetNumSamples();
  if(num > 1) {
    var range = this.Signal.GetTimeByIndex(num-1)-this.Signal.GetTimeByIndex(0);
    this.Scale = (this.Boundary.Width/range)/(max-min);
    this.TimeAtOrigin = range*min;
  }
  this.NeedsRecalc = true;
  this.Render();
}

N.UI.SignalTraceRenderer.prototype.SetAbsoluteScale = function(timeAtOrigin, scale) {
  this.TimeAtOrigin = timeAtOrigin;
  this.Scale = scale;
  this.NeedsRecalc = true;
}

N.UI.SignalTraceRenderer.prototype.Render = function() {
  if(this.NeedsRecalc) {
    this.NeedsRecalc = false;
    this.CalculateVerticalRange();
    this.CalculateHorizontalRange();
  }

  this.RenderXAxis();

  if(this.Signal.GetNumSamples() > 1) {
    if(this.Signal.Type === N.ANALOG) {
      this.RenderAnalogTrace();
    }
    else {
      this.RenderDiscreteTrace();
    }
  }
}

N.UI.SignalTraceRenderer.prototype.RenderAnalogTrace = function() {
  var t = this.Signal.GetTimeByIndex(this.StartIndex);
  var val = this.Signal.GetValueByIndex(this.StartIndex);
  var tScaled = this.TimeToPixel(t);
  var valScaled = this.YToPixel(val);
  var p = 'M'+tScaled+' '+valScaled;

  for(var i=this.StartIndex+1; i <= this.EndIndex; i++) {
    t = this.Signal.GetTimeByIndex(i);
    val = this.Signal.GetValueByIndex(i);
    tScaled = this.TimeToPixel(t);
    valScaled = this.YToPixel(val);
    p += 'L'+tScaled+' '+valScaled;
  }

  if(!this.Path) {
    this.Path = this.SvgParent.path(p).attr({ stroke:N.UI.Categories[this.Signal.Category].TraceColor, fill: 'none' });
    var extra = 200;
    this.ClipRect = this.SvgParent.rect(this.Boundary.Width, this.Boundary.Height+2*extra).move(this.Boundary.X, this.Boundary.Y-extra);
    this.Path.clipWith(this.ClipRect);
  }
  else {
    this.Path.plot(p);
  }
}

N.UI.SignalTraceRenderer.prototype.RenderDiscreteTrace = function() {
  var t = this.Signal.GetTimeByIndex(this.StartIndex);
  var prevState = this.Signal.GetValueByIndex(this.StartIndex);
  var tScaled = this.TimeToPixel(t);
  var statePrevScaled = this.YToPixel(prevState);
  var p = 'M'+tScaled+' '+statePrevScaled;

  for(var i=this.StartIndex+1; i <= this.EndIndex; i++) {
    t = this.Signal.GetTimeByIndex(i);
    var state = this.Signal.GetValueByIndex(i);
    if(state !== prevState) {
      tScaled = this.TimeToPixel(t);
      p += 'L'+tScaled+' '+statePrevScaled;
      var stateScaled = this.YToPixel(state);
      p += 'L'+tScaled+' '+stateScaled;
      statePrevScaled = stateScaled;
    }
    else if(i === this.EndIndex) {
      tScaled = this.TimeToPixel(t);
      p += 'L'+tScaled+' '+statePrevScaled;
    }
    prevState = state;
  }

  if(!this.Path) {
    this.Path = this.SvgParent.path(p).attr({ stroke:N.UI.Categories[this.Signal.Category].TraceColor, fill: 'none' });
    var extra = 200;
    this.ClipRect = this.SvgParent.rect(this.Boundary.Width, this.Boundary.Height+2*extra).move(this.Boundary.X, this.Boundary.Y-extra);
    this.Path.clipWith(this.ClipRect);
  }
  else {
    this.Path.plot(p);
  }
}

N.UI.SignalTraceRenderer.prototype.RenderXAxis = function() {
  var y = this.YToPixel(0.0);
  var p = '';
  if(this.Signal.GetNumSamples() > 1) {
    var xStart = this.TimeToPixel(this.Signal.TimeMin);
    var xEnd = this.TimeToPixel(this.Signal.TimeMax);
    p = 'M'+xStart+' '+y+'L'+xEnd+' '+y;
  }
  else {
    p = 'M'+this.Boundary.X+' '+y+'L'+(this.Boundary.X+this.Boundary.Width)+' '+y;
  }

  if(!this.XAxis) {
    this.XAxis = this.SvgParent.path(p).attr({ class: 'axis', 'stroke-dasharray': '6, 6', fill: 'none' });
    var extra = 200;
    this.ClipRect = this.SvgParent.rect(this.Boundary.Width, this.Boundary.Height+2*extra).move(this.Boundary.X, this.Boundary.Y-extra);
    this.XAxis.clipWith(this.ClipRect);
  }
  else {
    this.XAxis.plot(p);
  }
}

// The formula of time to pixel is
//   pixel = scale*time-timeAtOrigin+pixelOrigin
//
// where scale is d(pixel)/d(time)
//
N.UI.SignalTraceRenderer.prototype.TimeToPixel = function(time) {
  var pixel = this.Scale*(time-this.TimeAtOrigin)+this.Boundary.X;
  return pixel;
}

// The formula is
//   time = (pixel+timeAtOrigin-pixelOrigin)/scale
N.UI.SignalTraceRenderer.prototype.PixelToTime = function(pixel) {
  var time = (pixel+this.TimeAtOrigin-this.Boundary.X)/this.Scale;
  return time;
}

N.UI.SignalTraceRenderer.prototype.YToPixel = function(y) {
  var pixelUp = this.YScale*y+this.YOriginPixels;
  var pixelDown = this.Boundary.Y+this.Boundary.Height - pixelUp;
  return pixelDown;
}

// The formula is
//   time = (pixel+timeAtOrigin-pixelOrigin)/scale
N.UI.SignalTraceRenderer.prototype.PixelToY = function(pixel) {
  return 0;
}

N.UI.SignalTraceRenderer.prototype.CalculateVerticalRange = function() {
  var range = (this.Signal.MaxLimit-this.Signal.MinLimit);
  this.YScale = this.Boundary.Height/range;
  this.YAtBottom = this.Signal.MinLimit;
  this.YOriginPixels = -this.Boundary.Height*this.Signal.MinLimit/range;
}

N.UI.SignalTraceRenderer.prototype.CalculateHorizontalRange = function() {
  this.StartIndex = this.Signal.GetIndexBeforeTime(this.TimeAtOrigin);
  var timeAtEnd = this.TimeAtOrigin+this.Boundary.Width/this.Scale;
  this.EndIndex = this.Signal.GetIndexBeforeTime(timeAtEnd);
  if(this.EndIndex < this.Signal.GetNumSamples()-1) {
    this.EndIndex++;
  }
}
