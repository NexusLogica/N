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

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};

/**
 * Globally accessible functions.
 *
 * @class N
 *
 */

N.Type = {
  Network:        1,
  Neuron:         2,
  Compartment:    3,
  Connection:     4,
  AnalogSignal:   5,
  DiscreteSignal: 6,
  CustomSignal:   7
};

/**
 * Create an instance of a object from the json, where json.ClassName is the name of the object and all properties
 * of the json object will be copied into the new object.
 *
 * @method N.CreateInstance
 * @param {JSON} json
 * @returns {DeferredObject}
 */
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
    var objConstructor = N;
    for(var i=1; i<parts.length; i++) {
      objConstructor = objConstructor[parts[i]];
      if(!objConstructor) {
        N.L('ERROR: Unable to find constructor for '+className);
        return null;
      }
    }
    try {
      // Create but allow for passing of arguments
      // Found here http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
      var temp = function(){}; // temporary constructor

      // Give the Temp constructor the Constructor's prototype
      temp.prototype = objConstructor.prototype;

      // Create a new instance
      var inst = new temp();

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
  }
  return null;
}

/**
 * Returns an existing object from a path.
 * @method N.GetN
 * @param {string} className (Mandatory)  - A path string in the form 'N.First.Second.SomeJson'.
 * @param {...*} args (Optional) - Arguments to be passed to contructor. Can be zero, one, or more.
 * @return {DeferredObject} A deferred object used for attaching done and fail callbacks
 */
N.GetN = function(className) {
  var parts = className.split('.');
  if(parts.length > 0 && parts[0] === 'N') {
    var obj = null;
    var objObject = N;
    for(var i=1; i<parts.length; i++) {
      objObject = objObject[parts[i]];
      if(!objObject) {
        return null;
      }
    }
    return objObject;
  }
  return null;
}

/**
 * Returns the object pointed to by the path relative to
 * @method N.FromPath
 * @param {N.Network} network
 * @param {String} path
 * @return {N.Network|N.Neuron|N.Compartment} Returns a network, neuron, or compartment. On error returns an object with an error element which contains a message, the path, and the path part that caused the problem.
 */
N.FromPath = function(network, path) {
  // Break the path into
  var regex = /(^[\.]+)|(\.)|(\/[a-zA-Z0-9\-\_\.]+)|(\:[a-zA-Z0-9\-\_\.]+)|(\>[a-zA-Z0-9\-\_\.]+)|([a-zA-Z0-9\-\_\.]+)/g;
  var parts = path.match(regex);
  N.L('Path='+parts.join('^'));
  if (parts.length === 0) {
    return N.FromPathError(network, path, path, 'Error in path');
  }

  var currentObj = network;
  if (parts[0].charAt(0) === '/') {
    var next;
    do {
      next = currentObj.GetParent();
    } while(next !== null);
  }

  for(var i in parts) {
    var part = parts[i];
    var first = part[0];

    switch(first) {
      // Relative network path so '..' or '.'
      case '.': {
        switch(part) {

          case '..': {
            currentObj = currentObj.GetParent();
            if (!currentObj) {
              return N.FromPathError(network, path, part, 'Network has no parent');
            }
          } break;

          case '.':
          // Do nothing
          break;

          default : {
            return N.FromPathError(network, path, part, 'Invalid path component');
          }
        }
      } break;

      // A neuron
      case ':': {
        var shortName = part.substring(1);
        currentObj = currentObj.GetNeuronByName(shortName);
        if (!currentObj) {
          return N.FromPathError(network, path, part, 'The network has no neuron \''+shortName+'\'');
        }
      } break;

      // A compartment
      case '>': {
        var compShortName = part.substring(1);
        currentObj = currentObj.GetCompartmentByName(compShortName);
        if (!currentObj) {
          return N.FromPathError(network, path, part, 'The neuron has no compartment \''+compShortName+'\'');
        }
      } break;

      // A network
      case '/': {
        var netShortName = part.substring(1);
        currentObj = currentObj.GetNetworkByName(netShortName);
        if (!currentObj) {
          return N.FromPathError(network, path, part, 'The network has no child network \''+netShortName+'\'');
        }
      } break;

      default: {
        currentObj = currentObj.GetNetworkByName(part);
        if (!currentObj) {
          return N.FromPathError(network, path, part, 'The network has no child network \''+part+'\'');
        }
      }
    }
  }
  return currentObj;
}

/**
 * Returns the object pointed to by the path relative to
 * @method N.FromConnectionPaths
 * @param {N.Network} network
 * @param {String} path
 * @return {Object} Returns a two components in the form { Source: .
 */
N.FromConnectionPaths = function(network, paths) {
  var parts = paths.split(/->/);
  N.L('Connection parts: '+parts.join('  ->  '));
  if(parts.length !== 2) {
    return N.FromPathError(network, paths, '', 'Invalid connection path format \''+paths+'\'');
  }

  var obj = {};
  obj.Source = N.FromPath(network, parts[0]);
  obj.Sink = N.FromPath(network, parts[1]);
  if(obj.Source.error || obj.Sink.error) {
    return { error: obj };
  }
  return obj;
}

N.FromPathError = function(network, path, part, message) {
  N.L('Path Error: '+message);
  return { error: { message: message, network: network, path: path, part: part } };
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

/**
 * Write to the system console (or some log, if overridden).
 * @method N.L
 * @param logText
 */
N.L = function(logText) {
  window.console.log(logText);
  return logText;
}

/**
 * The standard timestep for simulations - 1 millisecond
 * @type {number} Timestep
 */
N.TimeStep = 0.001;

/**
 * Converts an angle in degrees to radians.
 *
 * @method N.Rad
 * @param {Real} angle Angle in degrees
 * @return {Real} Angle in radians
 *
 */
N.Rad = function(angleDegrees) {
  return Math.PI*angleDegrees/180;
}

/**
 * Create a globally unique ID and return it as a string.
 * @method N.GenerateUUID
 * @return {String} Unique Identifier string
 */
N.GenerateUUID = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c==='x' ? r : (r&0x7|0x8)).toString(16);
  });
  return uuid;
}

/**
 * Dictionary for holding globally accessible objects.
 *
 * @class Objects
 */
N.Objects = (function() {
  var objects = {};

  /**
   * Add an object to the Objects dictionary
   *
   * @method {Object} Add
   * @param obj
   */
  function Add(obj) {
    objects[obj.Id] = obj;
  }

  /**
   * Get an object to the Objects dictionary
   *
   * @method {Object} Get
   * @param {String} uid A unique identifier string for an object
   * @return {Object} An object or null.
   */
  function Get(uid) {
    return objects[uid] || null;
  }

  /**
   * Remove the reference to the object to the Objects dictionary
   *
   * @method {Object} Remove
   * @param {String} uid A unique identifier string for an object
   * @return {Object} Returns true if the object exists, false otherwise.
   */
  function Remove(uid) {
    if(objects[uid]) {
      return delete objects[uid];
    }
    return false;
  }

  return {
    Add: Add,
    Get: Get,
    Remove: Remove
  }
})();
