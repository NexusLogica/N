/**********************************************************************

File     : signal-trace-test.js
Project  : N Simulator Library
Purpose  : Source file for signal testing.
Revisions: Original definition by Lawrence Gunn.
           2014/01/25

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.Test = N.Test || {};

  //************************
  //* SignalTestController *
  //************************

var nSimAppControllers = angular.module('nSimApp.controllers');

nSimAppControllers.controller('SignalTraceTestController', ['$scope',
  function SignalTraceTestController($scope) {
    var testSignals = new N.SignalTraceTest();
    testSignals.CreateSignals();
    $scope.signalsMinRange = 0.0;
    $scope.signalsMaxRange = 0.090;
    $scope.signals = testSignals.Signals;
    $scope.$on('graph-controls:range-modification', function(event, min, max) {
      $scope.$broadcast('graph:range-modification', min, max);
    });
  }
]);

nSimAppControllers.controller('SignalTraceTestItemController', ['$scope',
  function SignalTraceTestItemController($scope) {
  }
]);

  //*********************
  //* N.SignalTraceTest *
  //*********************

N.SignalTraceTest = function() {
}

N.SignalTraceTest.prototype.CreateSignals = function() {
  this.Signals = [];
  this._timeStart = 0.0;
  N.M.Signals.AddSignal(this.CreateSinAnalog());
  N.M.Signals.AddSignal(this.CreateSawAnalog());
  N.M.Signals.AddSignal(this.CreatePulseDiscrete());
}

N.SignalTraceTest.prototype.CreateSinAnalog = function() {
  var signal = new N.AnalogSignal();
  signal.Name = 'Simple sine wave';
  signal.Category = 'Excitatory';
  this.Signals.push(signal);

  signal.MinLimit = -1.5;
  signal.MaxLimit = 2.5;
  var freq = 100.0;
  var time = 0.0;
  var timeInc = 0.001;
  var numSamples = 100;
  for(var i=0; i<numSamples; i++) {
    var value = 2.0*Math.sin(2.0*Math.PI*time*freq)+0.5;
    signal.AppendData(time, value);
    time += timeInc;
  }
  return signal;
}

N.SignalTraceTest.prototype.CreateSawAnalog = function() {
  var signal = new N.AnalogSignal();
  signal.Name = 'Simple saw wave';
  signal.Category = 'Inhibitory';
  this.Signals.push(signal);

  signal.MinLimit = -1.0;
  signal.MaxLimit = 1.0;
  var interval = 0.020;
  var intervalStart = 0.0;
  var intervalDirectionUp = true;

  var time = 0.0;
  var timeInc = 0.001;
  var numSamples = 100;
  for(var i=0; i<numSamples; i++) {
    if(time > interval+intervalStart) {
      intervalDirectionUp = !intervalDirectionUp;
      intervalStart += interval;
    }
    var zeroValue = intervalDirectionUp ? signal.MinLimit : signal.MaxLimit;
    var direction = intervalDirectionUp ? 1.0 : -1.0;
    var value = 2.0*direction*(time-intervalStart)/interval+zeroValue;
    signal.AppendData(time, value);
    time += timeInc;
  }
  return signal;
}

N.SignalTraceTest.prototype.CreatePulseDiscrete = function() {
  var signal = new N.DiscreteSignal();
  signal.Name = 'Discrete pulse';
  this.Signals.push(signal);

  var pulseWidth = 0.006; // seconds
  var time = 0.0;
  var nextState = 0;
  while(time < 0.100) {
    signal.AppendData(time, nextState);
    if(nextState === 1) {
      time += pulseWidth;
      nextState = 0;
    }
    else {
      time += 2.0*pulseWidth;
      nextState = 1;
    }
  }
  return signal;
}

  //**********************************
  //* N.Test.SignalTraceTestRenderer *
  //**********************************

N.Test.SignalTraceTestRenderer = function() {
}

N.Test.SignalTraceTestRenderer.prototype.Configure = function(svgParent, signalId) {
  this._svgParent = svgParent;
  this._w = this._svgParent.width();
  this._h = this._svgParent.height();
  this._traceRenderer = new N.UI.SignalTraceRenderer();
  this._traceRenderer.Configure(svgParent, signalId);
  this._padding = 15;
  this._box = { x: this._padding, y: this._padding, width: (this._w-2*this._padding), height: (this._h-2*this._padding) };
  this._traceRenderer.SetCanvasBoundary(this._box);
}

N.Test.SignalTraceTestRenderer.prototype.Render = function() {
  this._backgroundRect = this._svgParent.rect(this._box.width, this._box.height).move(this._box.x, this._box.y).attr({ 'fill': '#FCF8F2', 'stroke-width': 0});
  this._traceRenderer.Render();
}

N.Test.SignalTraceTestRenderer.prototype.SetScale = function(min, max) {
  this._traceRenderer.SetScale(min, max);
}

