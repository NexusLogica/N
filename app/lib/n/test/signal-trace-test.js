'use strict';
/**********************************************************************

File     : signal-trace-test.js
Project  : N Simulator Library
Purpose  : Source file for signal testing.
Revisions: Original definition by Lawrence Gunn.
           2014/01/25

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/


  //************************
  //* SignalTestController *
  //************************

var nSimAppControllers = angular.module('nSimApp.controllers');

nSimAppControllers.controller('SignalTestController', ['$scope',
  function SignalTestController($scope) {
    var testSignals = new N.SignalTraceTest();
    testSignals.CreateSignals();
    $scope.signals = testSignals.Signals;
  }
]);

  //*********************
  //* N.SignalTraceTest *
  //*********************

N.SignalTraceTest = function() {
}

N.SignalTraceTest.prototype.CreateSignals = function() {
  this.Signals = [];
  N.M.Signals.AddSignal(this.CreateSinAnalog());
  N.M.Signals.AddSignal(this.CreateSawAnalog());
  N.M.Signals.AddSignal(this.CreatePulseDiscrete());
}

N.SignalTraceTest.prototype.CreateSinAnalog = function() {
  var signal = new N.AnalogSignal();
  signal.Name = "Simple sine wave";
  this.Signals.push(signal);
  return signal;
}

N.SignalTraceTest.prototype.CreateSawAnalog = function() {
  var signal = new N.AnalogSignal();
  signal.Name = "Simple saw wave";
  this.Signals.push(signal);
  return signal;
}

N.SignalTraceTest.prototype.CreatePulseDiscrete = function() {
  var signal = new N.AnalogSignal();
  signal.Name = "Discrete pulse";
  this.Signals.push(signal);
  return signal;
}

