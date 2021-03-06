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

angular.module('nSimulationApp').controller('SignalTraceTestController', ['$scope',
  function SignalTraceTestController($scope) {

    $scope.TestInfo = { Name: 'Signal Trace Test' };

    var testSignals = new N.SignalTraceTest();
    testSignals.createSignals();
    $scope.scenes = testSignals.scenes;
    $scope.signalsMinRange = 0.0;
    $scope.signalsMaxRange = 0.10;
    $scope.signals = testSignals.signals;


    $scope.$on('graph-controls:range-modification', function(event, min, max) {
      $scope.$broadcast('graph:range-modification', min, max);
    });
  }
]);

angular.module('nSimulationApp').controller('SignalTraceTestItemController', ['$scope',
  function SignalTraceTestItemController($scope) {
  }
]);

  //*********************
  //* N.SignalTraceTest *
  //*********************

N.SignalTraceTest = function() {
  this.scenes = [];
}

N.SignalTraceTest.prototype.createSignals = function() {
  this.signals = [];
  var signal, scene;

  var testFuncs = ['CreateSinAnalog', 'CreateSawAnalog', 'CreatePulseDiscrete'];
  this._timeStart = 0.0;
  for(var test in testFuncs) {
    signal = this[testFuncs[test]]();
    scene = new N.UI.SignalTraceScene();
    scene.setSignal(signal);
    this.scenes.push(scene);
  }

  var offsets = [ 0.0, 0.004, 0.008, 0.012, 0.016, 0.020, 0.024 ];
  for(var i in offsets) {
    signal = this.createGeneratedPulse(offsets[i]);
    scene = new N.UI.SignalTraceScene();
    scene.setSignal(signal);
    this.scenes.push(scene);
  }
}

N.SignalTraceTest.prototype.createGeneratedPulse = function(offset) {
  var pulseWidth = 0.006; // seconds
  var time = 0.0;
  var nextState = 0;
  var signal = N.Signal.createPulseSignal({
    durationOff:  0.010,
    durationOn:   0.005,
    signalLength: 0.100,
    offset:       offset,
    amplitude:    0.50});
 // var signal = CreatePulseSignal(0.010, 0.005, 0.1, offset, 0.5);
  this.signals.push(signal);
  signal.name = 'Generated - '+ _.str.sprintf('%.3f', offset);
  signal.minLimit = 0.0;
  signal.maxLimit = 0.5;
  return signal;
}

N.SignalTraceTest.prototype.createSinAnalog = function() {
  var signal = new N.AnalogSignal();
  signal.name = 'Simple sine wave';
  signal.category = 'Excitatory';
  this.signals.push(signal);

  signal.minLimit = -1.5;
  signal.maxLimit = 2.5;
  var freq = 100.0;
  var time = 0.0;
  var timeInc = 0.001;
  var numSamples = 100;
  for(var i=0; i<numSamples; i++) {
    var value = 2.0*Math.sin(2.0*Math.PI*time*freq)+0.5;
    signal.appendData(time, value);
    time += timeInc;
  }
  return signal;
}

N.SignalTraceTest.prototype.createSawAnalog = function() {
  var signal = new N.AnalogSignal();
  signal.name = 'Simple saw wave';
  signal.category = 'Inhibitory';
  this.signals.push(signal);

  signal.minLimit = -1.0;
  signal.maxLimit = 1.0;
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
    var zeroValue = intervalDirectionUp ? signal.minLimit : signal.maxLimit;
    var direction = intervalDirectionUp ? 1.0 : -1.0;
    var value = 2.0*direction*(time-intervalStart)/interval+zeroValue;
    signal.appendData(time, value);
    time += timeInc;
  }
  return signal;
}

N.SignalTraceTest.prototype.createPulseDiscrete = function() {
  var signal = new N.DiscreteSignal();
  signal.name = 'Discrete pulse';
  this.signals.push(signal);

  var pulseWidth = 0.006; // seconds
  var time = 0.0;
  var nextState = 0;
  while(time < 0.100) {
    signal.appendData(time, nextState);
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

N.Test.SignalTraceTestRenderer.prototype.configure = function(svgParent, signalId) {
  this._svgParent = svgParent;
  this._w = this._svgParent.width();
  this._h = this._svgParent.height();
  this._traceRenderer = new N.UI.SignalTrace();
  this._traceRenderer.configure(svgParent, signalId);
  this._padding = 15;
  this._box = { x: this._padding, y: this._padding, width: (this._w-2*this._padding), height: (this._h-2*this._padding) };
  this._traceRenderer.setCanvasBoundary(this._box);
}

N.Test.SignalTraceTestRenderer.prototype.render = function() {
  this._backgroundRect = this._svgParent.rect(this._box.width, this._box.height).move(this._box.x, this._box.y).attr({ 'fill': '#FCF8F2', 'stroke-width': 0});
  this._traceRenderer.render();
}

N.Test.SignalTraceTestRenderer.prototype.setScale = function(min, max) {
  this._traceRenderer.setScale(min, max);
}

