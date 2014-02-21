/**********************************************************************

File     : n.js
Project  : N Simulator Library
Purpose  : Source file for signal relate objects.
Revisions: Original definition by Lawrence Gunn.
           2014/01/25

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};

N.CreateInstance = function(json) {
  var obj = N.NewN(json.ClassName);
  for(var key in json) {
    obj[key] = json[key];
  }
  return obj;
}

N.NewN = function(className) {
  var parts = className.split('.');
  if(parts.length > 0 && parts[0] === 'N') {
    var objConstructor = N;
    for(var i=1; i<parts.length; i++) {
      objConstructor = objConstructor[parts[i]];
    }
    var obj = new objConstructor();
    return obj;
  }
  return null;
}

N.ToFixed = function(value, precision) {
  var stringValue = '0.';
  var i=0;
  if(value === 0.0) {
    for(i=0; i<precision; i++) {
      stringValue += '0';
    }
    return stringValue;
  }
  var power = Math.pow(10, precision || 0);
  stringValue = String(Math.round(value * power) / power);
  var nZeros = precision+1-(stringValue.length-stringValue.indexOf('.'));
  for(i=0; i<nZeros; i++) {
    stringValue += '0';
  }
  return stringValue;
}

N.ShortName = function(longName) {
  var reg = /[A-Z0-9]*/g;
  var matches = longName.match(reg);
  return matches.join('');
}

N.L = function(logText) {
  console.log(logText);
}

  //*************
  //* N.Signals *
  //*************

N.Signals = function() {
  this._Signals = [];
}

N.Signals.prototype.AddSignal = function(signal) {
  this._Signals[signal.Id] = signal;
}

N.Signals.prototype.GetSignal = function(uid) {
  return this._Signals[uid] || null;
}

N.Signals.prototype.RemoveSignal = function(uid) {
  return delete this._Signals[uid];
}

  //*************
  //* N.Neurons *
  //*************

N.Neurons = function() {
  this._Neurons = [];
}

N.Neurons.prototype.AddNeuron = function(neuron) {
  this._Neurons[neuron.Id] = neuron;
}

N.Neurons.prototype.GetNeuron = function(uid) {
  return this._Neurons[uid] || null;
}

N.Neurons.prototype.RemoveNeuron = function(uid) {
  return delete this._Neurons[uid];
}

  //***********
  //* Manager *
  //***********

N.Manager = function() {
  this.Neurons = new N.Neurons;
  this.Signals = new N.Signals;
}

N.Manager.prototype.GenerateUUID = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c==='x' ? r : (r&0x7|0x8)).toString(16);
  });
  return uuid;
}

N.M = N.M || new N.Manager();
