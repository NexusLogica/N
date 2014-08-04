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

  //********************
  //* N.UI.SignalTrace *
  //********************

N.UI.SignalTrace = function() {
  this.NeedsRecalc = true;
  this.TimeAtOrigin = 0.0;
  this.YAtOrigin = 0.0;
  this.Scale = 1.0; // Default
}

N.UI.SignalTrace.prototype.SetSignal = function(signal) {
  if(!_.isUndefined(signal) && signal.Source) {
    this.Source = signal;
  }
  else {
    this.Signal = signal;
  }
  return this;
}

N.UI.SignalTrace.prototype.AddClasses = function(classes) {
  this.AdditionalClasses = this.AdditionalClasses || [];
  if(_.isArray(classes)) {
    this.AdditionalClasses = this.AdditionalClasses.concat(classes);
  }
  else {
    this.AdditionalClasses.push(classes);
  }
  return this;
}

N.UI.SignalTrace.prototype.SetScale = function(min, max) {
  var num = this.Signal.GetNumSamples();
  if(num > 1) {
    var range = this.Signal.GetTimeByIndex(num-1)-this.Signal.GetTimeByIndex(0);
    this.Scale = (this.Pos.Width/range)/(max-min);
    this.TimeAtOrigin = range*min;
  }
  this.NeedsRecalc = true;
  this.Render();
}

N.UI.SignalTrace.prototype.SetAbsoluteScale = function(timeAtOrigin, scale) {
  this.TimeAtOrigin = timeAtOrigin;
  this.Scale = scale;
  this.NeedsRecalc = true;
}

N.UI.SignalTrace.prototype.Render = function(svgParent, pos, padding) {
  this.SvgParent = svgParent;
  this.Pos = pos;
  this.Group = this.SvgParent.group().move(this.Pos.X, this.Pos.Y).size(this.Pos.Width, this.Pos.Height).attr({ 'class': 'pi-signal-trace' });
  N.UI.SvgAddClass(this.Group, this.AdditionalClasses);
  this.Background = this.Group.rect(this.Pos.Width, this.Pos.Height).attr({ 'class': 'background' });

  if(this.Source) {
    this.Signal = this.Source.Source[this.Source.PropName];
  }

  if(!this.Signal) {
    this.RenderNoData();
    return;
  }

  if(this.NoDataText) { this.NoDataText.hide(); }

  if(this.NeedsRecalc) {
    this.NeedsRecalc = false;

     var num = this.Signal.GetNumSamples();
    if(num > 1) {
      var range = this.Signal.GetTimeByIndex(num-1)-this.Signal.GetTimeByIndex(0);
      this.Scale = this.Pos.Width/range;
    }

    this.CalculateVerticalRange();
    this.CalculateHorizontalRange();
  }


  if(this.Signal.GetNumSamples() > 1) {
    this.RenderXAxis();

    if(this.Signal.Type === N.ANALOG) {
      this.RenderAnalogTrace();
    }
    else {
      this.RenderDiscreteTrace();
    }
  } else {
    this.RenderNoData();
  }
}

N.UI.SignalTrace.prototype.Update = function() {
  if(this.Source) {
    this.Signal = this.Source.Source[this.Source.PropName];
  }

  if(!this.Signal) {
    this.RenderNoData();
    return;
  }

  if(this.NoDataText) { this.NoDataText.hide(); }

  var num = this.Signal.GetNumSamples();
  if(num > 1) {
    var range = this.Signal.GetTimeByIndex(num-1)-this.Signal.GetTimeByIndex(0);
    this.Scale = this.Pos.Width/range;
  }

  this.CalculateVerticalRange();
  this.CalculateHorizontalRange();


  if(this.Signal.GetNumSamples() > 1) {
    this.RenderXAxis();

    if(this.Signal.Type === N.ANALOG) {
      this.RenderAnalogTrace();
    }
    else {
      this.RenderDiscreteTrace();
    }
  } else {
    this.RenderNoData();
  }
}

N.UI.SignalTrace.prototype.RenderAnalogTrace = function() {
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

  // TODO: get the correct value for extra. Should be equal half the stroke width.
  var extra = 200;
  if(!this.Path) {
    this.Path = this.Group.path(p).attr({ stroke:N.UI.Categories[this.Signal.Category].TraceColor, fill: 'none' });
    this.ClipRect = this.Group.rect(this.Pos.Width, this.Pos.Height+2*extra).move(this.Pos.X, this.Pos.Y-extra);
    this.Path.clipWith(this.ClipRect);
  }
  else {
    this.Path.plot(p);
    this.ClipRect.size(this.Pos.Width, this.Pos.Height+2*extra).move(this.Pos.X, this.Pos.Y-extra);
  }
}

N.UI.SignalTrace.prototype.RenderDiscreteTrace = function() {
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
    this.Path = this.Group.path(p).attr({ stroke:N.UI.Categories[this.Signal.Category].TraceColor, fill: 'none' });
    var extra = 200;
    this.ClipRect = this.Group.rect(this.Pos.Width, this.Pos.Height+2*extra).move(this.Pos.X, this.Pos.Y-extra);
    this.Path.clipWith(this.ClipRect);
  }
  else {
    this.Path.plot(p);
  }
}

N.UI.SignalTrace.prototype.RenderXAxis = function() {
  var y = this.YToPixel(0.0);
  var p = '';
  if(this.Signal.GetNumSamples() > 1) {
    var xStart = this.TimeToPixel(this.Signal.TimeMin);
    var xEnd = this.TimeToPixel(this.Signal.TimeMax);
    p = 'M'+xStart+' '+y+'L'+xEnd+' '+y;
  }
  else {
    p = 'M'+this.Pos.X+' '+y+'L'+(this.Pos.X+this.Pos.Width)+' '+y;
  }

  if(!this.XAxis) {
    this.XAxis = this.Group.path(p).attr({ class: 'axis', 'stroke-dasharray': '6, 6', fill: 'none' });
    var extra = 200;
    this.ClipRect = this.Group.rect(this.Pos.Width, this.Pos.Height+2*extra).move(this.Pos.X, this.Pos.Y-extra);
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
N.UI.SignalTrace.prototype.TimeToPixel = function(time) {
  var pixel = this.Scale*(time-this.TimeAtOrigin)+this.Pos.X;
  return pixel;
}

// The formula is
//   time = (pixel+timeAtOrigin-pixelOrigin)/scale
N.UI.SignalTrace.prototype.PixelToTime = function(pixel) {
  var time = (pixel+this.TimeAtOrigin-this.Pos.X)/this.Scale;
  return time;
}

N.UI.SignalTrace.prototype.YToPixel = function(y) {
  var pixelUp = this.YScale*y+this.YOriginPixels;
  var pixelDown = this.Pos.Y+this.Pos.Height - pixelUp;
  return pixelDown;
}

// The formula is
//   time = (pixel+timeAtOrigin-pixelOrigin)/scale
N.UI.SignalTrace.prototype.PixelToY = function(pixel) {
  return 0;
}

N.UI.SignalTrace.prototype.CalculateVerticalRange = function() {
  // TODO: Need to have a flag for when to show MaxLimit or when to show the signal max.
  //var range = (this.Signal.MaxLimit-this.Signal.MinLimit);
  var range = (this.Signal.Max-this.Signal.Min)*1.1;
  this.YScale = this.Pos.Height/range;
  this.YAtBottom = this.Signal.Min+0.05*range;
  this.YOriginPixels = -this.Pos.Height*this.Signal.Min/range;
}

N.UI.SignalTrace.prototype.CalculateHorizontalRange = function() {
  this.StartIndex = this.Signal.GetIndexBeforeTime(this.TimeAtOrigin);
  var timeAtEnd = this.TimeAtOrigin+this.Pos.Width/this.Scale;
  this.EndIndex = this.Signal.GetIndexBeforeTime(timeAtEnd);
  if(this.EndIndex < this.Signal.GetNumSamples()-1) {
    this.EndIndex++;
  }
}

N.UI.SignalTrace.prototype.RenderNoData = function() {
  if(!this.NoDataText) {
    this.NoDataText = this.Group.text('no data').attr({ 'class': 'no-data' });
    this.NoDataText.move(0.5*this.Pos.Width, 0.5*this.Pos.Height-this.NoDataText.bbox().cy);
  } else {
    this.NoDataText.show();
  }
}

