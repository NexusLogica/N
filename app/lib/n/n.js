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

/**
 * Create a new 'N' object. The object must be in the 'N' namespace.
 *
 * @public
 * @method N.NewN
 * @param {string} className (Mandatory)  - A classname in the form 'N.First.Second.Class', hence N.Neuron, N.UI.PiNeuron...
 * @param {...*} args (Optional) - Arguments to be passed to contructor. Can be zero, one, or more.
 * @return {DeferredObject} A deferred object used for attaching done and fail callbacks
 */
N.NewN = function(className) {
  var parts = className.split('.');
  if(parts.length > 0 && parts[0] === 'N') {
    var obj = null;
    var objConstructor = N;
    for(var i=1; i<parts.length; i++) {
      objConstructor = objConstructor[parts[i]];
    }
    try {
      // Create but allow for passing of arguments
      // Found here http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
      var temp = function(){}; // temporary constructor

      // Give the Temp constructor the Constructor's prototype
      temp.prototype = objConstructor.prototype;

      // Create a new instance
      var inst = new temp;

      // Call the original Constructor with the temp
      // instance as its context (i.e. its 'this' value)
      var args = Array.prototype.slice.call(arguments, 1);
      var ret = objConstructor.apply(inst, args);

      // If an object has been returned then return it otherwise
      // return the original instance.
      // (consistent with behaviour of the new operator)
      return Object(ret) === ret ? ret : inst;
    }
    catch(err) {
      N.L('ERROR: Unable to create object of class '+className);
    }
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
  if(!longName) { return ''; }
  var reg = /[A-Z0-9]*/g;
  var matches = longName.match(reg);
  return matches.join('');
}

N.L = function(logText) {
  console.log(logText);
}

N.TimeStep = 0.001;

N.Rad = function(angleDegrees) {
  return Math.PI*angleDegrees/180;
}

N.GenerateUUID = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c==='x' ? r : (r&0x7|0x8)).toString(16);
  });
  return uuid;
}

  //*************
  //* N.Objects *
  //*************

N.Objects = (function() {
  var objects = {};

  function Add(obj) {
    objects[obj.Id] = obj;
  }

  function Get(uid) {
    return objects[uid] || null;
  }

  function Remove(uid) {
    return delete objects[uid];
  }

  return {
    Add: Add,
    Get: Get,
    Remove: Remove
  }
})();


  //*************
  //* N.Manager *
  //*************

N.Manager = function() {
}

N.M = N.M || new N.Manager();
