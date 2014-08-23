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
        $scope.scene.traceRenderer.setScale(min, max);
      });
    }
  };
}]);

  //********************
  //* N.UI.SignalTrace *
  //********************

N.UI.SignalTrace = function() {
  this.needsRecalc = true;
  this.timeAtOrigin = 0.0;
  this.yAtOrigin = 0.0;
  this.scale = 1.0; // Default
  this.showOrigin = true;
}

N.UI.SignalTrace.prototype.setSignal = function(signal) {
  if(!_.isUndefined(signal) && signal.source) {
    this.source = signal;
  }
  else {
    this.signal = signal;
  }
  return this;
}

N.UI.SignalTrace.prototype.addClasses = function(classes) {
  this.additionalClasses = this.additionalClasses || [];
  if(_.isArray(classes)) {
    this.additionalClasses = this.additionalClasses.concat(classes);
  }
  else {
    this.additionalClasses.push(classes);
  }
  return this;
}

N.UI.SignalTrace.prototype.setScale = function(min, max) {
  var num = this.signal.getNumSamples();
  if(num > 1) {
    var range = this.signal.getTimeByIndex(num-1)-this.signal.getTimeByIndex(0);
    this.scale = (this.pos.width/range)/(max-min);
    this.timeAtOrigin = range*min;
  }
  this.needsRecalc = true;
  this.render();
}

N.UI.SignalTrace.prototype.setAbsoluteScale = function(timeAtOrigin, scale) {
  this.timeAtOrigin = timeAtOrigin;
  this.scale = scale;
  this.needsRecalc = true;
}

N.UI.SignalTrace.prototype.render = function(svgParent, pos, padding) {
  this.svgParent = svgParent;
  this.pos = pos;
  this.group = this.svgParent.group().move(this.pos.x, this.pos.y).size(this.pos.width, this.pos.height).attr({ 'class': 'pi-signal-trace' });
  N.UI.svgAddClass(this.group, this.additionalClasses);
  this.background = this.group.rect(this.pos.width, this.pos.height).attr({ 'class': 'background' });

  if(this.source) {
    this.signal = this.source.source[this.source.propName];
  }

  if(!this.signal) {
    this.renderNoData();
    return this;
  }

  if(this.noDataText) { this.noDataText.hide(); }

  if(this.needsRecalc) {
    this.needsRecalc = false;

     var num = this.signal.getNumSamples();
    if(num > 1) {
      var range = this.signal.getTimeByIndex(num-1)-this.signal.getTimeByIndex(0);
      this.scale = this.pos.width/range;
    }

    this.calculateVerticalRange();
    this.calculateHorizontalRange();
  }


  if(this.signal.getNumSamples() > 1) {
    this.renderXAxis();

    if(this.signal.type === N.ANALOG) {
      this.renderAnalogTrace();
    }
    else {
      this.renderDiscreteTrace();
    }
  } else {
    this.renderNoData();
  }
  return this;
}

N.UI.SignalTrace.prototype.update = function() {
  if(this.source) {
    this.signal = this.source.source[this.source.propName];
  }

  if(!this.signal) {
    this.renderNoData();
    return this;
  }

  if(this.noDataText) { this.noDataText.hide(); }

  var num = this.signal.getNumSamples();
  if(num > 1) {
    var range = this.signal.getTimeByIndex(num-1)-this.signal.getTimeByIndex(0);
    this.scale = this.pos.width/range;
  }

  this.calculateVerticalRange();
  this.calculateHorizontalRange();


  if(this.signal.getNumSamples() > 1) {
    this.renderXAxis();

    if(this.signal.type === N.ANALOG) {
      this.renderAnalogTrace();
    }
    else {
      this.renderDiscreteTrace();
    }
  } else {
    this.renderNoData();
  }
  return this;
}

N.UI.SignalTrace.prototype.renderAnalogTrace = function() {
  var t = this.signal.getTimeByIndex(this.startIndex);
  var val = this.signal.getValueByIndex(this.startIndex);
  var tScaled = this.timeToPixel(t);
  var valScaled = this.yToPixel(val);
  var p = 'M'+tScaled+' '+valScaled;

  for(var i=this.startIndex+1; i <= this.endIndex; i++) {
    t = this.signal.getTimeByIndex(i);
    val = this.signal.getValueByIndex(i);
    tScaled = this.timeToPixel(t);
    valScaled = this.yToPixel(val);
    p += 'L'+tScaled+' '+valScaled;
  }

  // TODO: get the correct value for extra. Should be equal half the stroke width.
  var extra = 2;
  if(!this.path) {
    this.path = this.group.path(p).attr({ stroke:N.UI.categories[this.signal.category].traceColor, fill: 'none' });
//    this.clipRect = this.group.rect(this.pos.width, this.pos.height+2*extra).move(this.pos.x, this.pos.y-extra);
//    this.path.clipWith(this.clipRect);
  }
  else {
    this.path.plot(p);
//    this.clipRect.size(this.pos.width, this.pos.height+2*extra).move(this.pos.x, this.pos.y-extra);
  }
}

N.UI.SignalTrace.prototype.renderDiscreteTrace = function() {
  var t = this.signal.getTimeByIndex(this.startIndex);
  var prevState = this.signal.getValueByIndex(this.startIndex);
  var tScaled = this.timeToPixel(t);
  var statePrevScaled = this.yToPixel(prevState);
  var p = 'M'+tScaled+' '+statePrevScaled;

  for(var i=this.startIndex+1; i <= this.endIndex; i++) {
    t = this.signal.getTimeByIndex(i);
    var state = this.signal.getValueByIndex(i);
    if(state !== prevState) {
      tScaled = this.timeToPixel(t);
      p += 'L'+tScaled+' '+statePrevScaled;
      var stateScaled = this.yToPixel(state);
      p += 'L'+tScaled+' '+stateScaled;
      statePrevScaled = stateScaled;
    }
    else if(i === this.endIndex) {
      tScaled = this.timeToPixel(t);
      p += 'L'+tScaled+' '+statePrevScaled;
    }
    prevState = state;
  }

  if(!this.path) {
    this.path = this.group.path(p).attr({ stroke:N.UI.categories[this.signal.category].traceColor, fill: 'none' });
    var extra = 2;
//    this.clipRect = this.group.rect(this.pos.width, this.pos.height+2*extra).move(this.pos.x, this.pos.y-extra);
//    this.path.clipWith(this.clipRect);
  }
  else {
    this.path.plot(p);
  }
}

N.UI.SignalTrace.prototype.renderXAxis = function() {
  var y = this.yToPixel(0.0);
  var p = '';
  if(this.signal.getNumSamples() > 1) {
    var xStart = this.timeToPixel(this.signal.timeMin);
    var xEnd = this.timeToPixel(this.signal.timeMax);
    p = 'M'+xStart+' '+y+'L'+xEnd+' '+y;
  }
  else {
    p = 'M'+this.pos.x+' '+y+'L'+(this.pos.x+this.pos.width)+' '+y;
  }

  if(!this.xAxis) {
    this.xAxis = this.group.path(p).attr({ class: 'axis', 'stroke-dasharray': '6, 6', fill: 'none' });
    var extra = 2;
//    this.clipRect = this.group.rect(this.pos.width, this.pos.height+2*extra).move(this.pos.x, this.pos.y-extra);
//    this.xAxis.clipWith(this.clipRect);
  }
  else {
    this.xAxis.plot(p);
  }
}

// The formula of time to pixel is
//   pixel = scale*time-timeAtOrigin+pixelOrigin
//
// where scale is d(pixel)/d(time)
//
N.UI.SignalTrace.prototype.timeToPixel = function(time) {
  var pixel = this.scale*(time-this.timeAtOrigin);
  return pixel;
}

// The formula is
//   time = (pixel+timeAtOrigin-pixelOrigin)/scale
N.UI.SignalTrace.prototype.pixelToTime = function(pixel) {
  var time = (pixel+this.timeAtOrigin)/this.scale;
  return time;
}

N.UI.SignalTrace.prototype.yToPixel = function(y) {
  var pixel = this.pos.height-(this.yScale*y+this.yClearBelowMin);
  //var pixelUp = this.yScale*y+this.yOriginPixels;
  //var pixelDown = this.pos.height - pixelUp;
  return pixel;
}

// The formula is
//   time = (pixel+timeAtOrigin-pixelOrigin)/scale
N.UI.SignalTrace.prototype.pixelToY = function(pixel) {
  // TODO: Not implemented.
  return 0;
}

N.UI.SignalTrace.prototype.calculateVerticalRange = function() {
  // TODO: Need to have a flag for when to show MaxLimit or when to show the signal max.
  //var range = (this.signal.maxLimit-this.signal.minLimit);
  var min = this.signal.min;
  var max = this.signal.max;
  if(min === max) {
    max = min+1.0;
  }
  if((max*min) > 0.0 && this.showOrigin) {
    if(max > 0) {
      min = 0.0;
    } else {
      max = 0.0;
    }
  }

  var range = (max-min)*1.1;
  this.yScale = this.pos.height/range;
  this.yClearBelowMin = this.yScale*0.05*range;
//  this.yOriginPixels = -this.pos.height*min/range;
//  this.yOriginPixels = this.pos.height-this.yScale*0.05*range;
}

N.UI.SignalTrace.prototype.calculateHorizontalRange = function() {
  this.startIndex = this.signal.getIndexBeforeTime(this.timeAtOrigin);
  var timeAtEnd = this.timeAtOrigin+this.pos.width/this.scale;
  this.endIndex = this.signal.getIndexBeforeTime(timeAtEnd);
  if(this.endIndex < this.signal.getNumSamples()-1) {
    this.endIndex++;
  }
}

N.UI.SignalTrace.prototype.renderNoData = function() {
  if(!this.noDataText) {
    this.noDataText = this.group.text('no data').attr({ 'class': 'no-data' });
    this.noDataText.move(0.5*this.pos.width, 0.5*this.pos.height-this.noDataText.bbox().cy);
  } else {
    this.noDataText.show();
  }
}

