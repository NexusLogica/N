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
N.UI = N.UI || {};

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
  CustomSignal:   7,
  PiNetwork:      8,
  PiNeuron:       9,
  PiCompartment:  10,
  PiConnection:   11,
  Input:          12,
  Output:         13
};

N.Top    = 1;
N.Middle = 2;
N.Bottom = 3;

N.Left    = 1;
N.Center  = 2;
N.Right   = 3;

/**
 * Create an instance of a object from the json, where json.className is the name of the object and all properties
 * of the json object will be copied into the new object.
 *
 * @method N.createInstance
 * @param {JSON} json
 * @returns {object} - The instantiated object.
 */
N.createInstance = function(json) {
  var obj = N.newN(json.className);
  for(var key in json) {
    obj[key] = json[key];
  }
  return obj;
};

/***
 * Write a stack
 * @method N.reportQError
 * @param error
 */
N.reportQError = function(error) {
  console.log(error.stack);
};

/***
 * For use in compiling N JSON template functions.
 * @method N.Template
 * @param imports
 * @param func
 * @returns {function}
 */
N.Template = function(imports, func) {
  return { imports: imports, loadedImports: {}, func: func };
};

/***
 * For use in compiling N JSON template functions.
 * @method N.Template
 * @param imports
 * @param func
 * @returns {function}
 */
N.ConnectionTemplate = function(imports, func) {
  return { imports: imports, loadedImports: {}, func: func };
};

/***
 * @method N.compileTemplateFunction
 * @param {string} templateText
 * @param {string} identifier
 * @returns {Obj, Function} - Returns
 */
N.compileTemplateFunction = function(templateText, identifier) {
  try {
    N.log('Compiling '+identifier);
    var templateFunction = new Function('return '+templateText);
    return templateFunction();
  } catch(err) {
    console.log('ERROR: N.compileTemplateFunction: '+err.description);
    console.log('       Stack trace:\n'+err.stack);
    throw err;
  }
};

/**
 * Create a new 'N' object. The object must be in the 'N' namespace.
 *
 * @public
 * @method N.newN
 * @param {string} className (Mandatory)  - A classname in the form 'N.First.Second.Class', hence N.Neuron, N.UI.PiNeuron...
 * @param {...*} args (Optional) - Arguments to be passed to contructor. Can be zero, one, or more.
 * @return {Object} A deferred object used for attaching done and fail callbacks
 */
N.newN = function(className) {
  var ns = 'N';
  var cn = className;
  if(className.namespace) {
    ns = className.namespace;
    cn = className.className;
  }
  var parts = cn.split('.');
  if(parts.length > 0 && parts[0] === ns) {
    var objConstructor = N;
    for(var i=1; i<parts.length; i++) {
      objConstructor = objConstructor[parts[i]];
      if(!objConstructor) {
        N.log('ERROR: Unable to find constructor for '+cn+' in namespace '+ns);
        return null;
      }
    }
    try {
      // Create but allow for passing of arguments
      // Found here http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
      var Temp = function(){}; // temporary constructor

      // Give the Temp constructor the Constructor's prototype
      Temp.prototype = objConstructor.prototype;

      // Create a new instance
      var inst = new Temp();

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
      N.log('ERROR: Unable to create object of class '+cn+' in namespace '+ns);
    }
  }
  return null;
};

/**
 * Returns an existing object from a path.
 * @method N.getN
 * @param {string} className (Mandatory)  - A path string in the form 'N.First.Second.SomeJson'.
 * @param {...*} args (Optional) - Arguments to be passed to contructor. Can be zero, one, or more.
 * @return {object} - The ojbect at the path.
 */
N.getN = function(className) {
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
};

/**
 * Returns the object pointed to by the path relative to
 * @method N.fromPath
 * @param {N.Network} network
 * @param {String} path
 * @return {N.Network|N.Neuron|N.Compartment} Returns a network, neuron, or compartment. On error returns an object with an error element which contains a message, the path, and the path part that caused the problem.
 */
N.fromPath = function(network, path) {
  // Break the path into
  var regex = /(^[\.]+)|(\.)|(\/[a-zA-Z0-9\-\_\.\[\]]+)|(\:[a-zA-Z0-9\-\_\.\[\]]+)|(\>[a-zA-Z0-9\-\_\.\[\]]+)|([a-zA-Z0-9\-\_\.\[\]]+)/g;
  var parts = path.match(regex);
  ////// N.log('Path='+parts.join('^'));
  if (parts.length === 0) {
    return N.fromPathError(network, path, path, 'Error in path');
  }

  var currentObj = network;
  if (parts[0].charAt(0) === '/') {
    currentObj = network.getRoot();

    // Deal with the root name. Hence /COL/L4a:N>C, we need to verify the name and remove it from the path array.
    var rootName = currentObj.name;
    var expectedRootName = parts[0].substr(1);
    if(rootName !== expectedRootName) {
      return N.fromPathError(network, path, parts[1], 'Root network name is incorrect: "'+rootName+'" expected "'+expectedRootName+'"');
    }

    parts.shift();
  }

  for(var i in parts) {
    var part = parts[i];
    var first = part[0];

    switch(first) {
      // Relative network path so '..' or '.'
      case '.': {
        switch(part) {

          case '..': {
            currentObj = currentObj.getParent();
            if (!currentObj) {
              return N.fromPathError(network, path, part, 'Network has no parent');
            }
          } break;

          case '.':
          // Do nothing
          break;

          default : {
            return N.fromPathError(network, path, part, 'Invalid path component');
          }
        }
      } break;

      // A neuron
      case ':': {
        var shortName = part.substring(1);
        currentObj = currentObj.getNeuronByName(shortName);
        if (!currentObj) {
          return N.fromPathError(network, path, part, 'The network has no neuron \''+shortName+'\'');
        }
      } break;

      // A compartment
      case '>': {
        var compShortName = part.substring(1);
        currentObj = currentObj.getCompartmentByName(compShortName);
        if (!currentObj) {
          return N.fromPathError(network, path, part, 'The neuron has no compartment \''+compShortName+'\'');
        }
      } break;

      // A network
      case '/': {
        var netShortName = part.substring(1);
        currentObj = currentObj.getNetworkByName(netShortName);
        if (!currentObj) {
          return N.fromPathError(network, path, part, 'The network has no child network \''+netShortName+'\'');
        }
      } break;

      default: {
        currentObj = currentObj.getNetworkByName(part);
        if (!currentObj) {
          return N.fromPathError(network, path, part, 'The network has no child network \''+part+'\'');
        }
      }
    }
  }
  return currentObj;
};

/**
 * Returns the compartment from a path.
 * @method N.compFromPath
 * @param {String} path
 * @return {String} Returns the id of the compartment or null if nothing found.
 */
N.compFromPath = function(path) {
  var parts =  path.split('>');
  if(parts.length === 2) {
    return parts[1];
  }
  return null;
};

/**
 * Returns the object pointed to by the path relative to
 * @method N.fromConnectionPaths
 * @param {N.Network} network
 * @param {String} paths
 * @return {Object} Returns a two components in the form { source: connectionSource, sink: connectionSink }.
 */
N.fromConnectionPaths = function(network, paths) {
  var parts = paths.split(/->/);
  ////// N.log('Connection parts: '+parts.join('  ->  '));
  if(parts.length !== 2) {
    return N.fromPathError(network, paths, '', 'Invalid connection path format \''+paths+'\'');
  }

  var obj = {};
  obj.source = N.fromPath(network, parts[0]);
  obj.sink = N.fromPath(network, parts[1]);
  if(obj.source.error || obj.sink.error) {
    return { error: obj };
  }
  return obj;
};

/**
 * Returns the connection source from a path.
 * @method N.sourceFromConnectionPath
 * @param {String} path
 * @return {String} Returns the id of the source connection.
 */
N.sourceFromConnectionPath = function(path) {
  var i = path.indexOf('->');
  return path.substring((path[0] === ':' ? 1 : 0), i);
};

/**
 * Returns the connection sink from a path.
 * @method N.sinkFromConnectionPath
 * @param {String} path
 * @return {String} Returns the id of the sink connection.
 */
N.sinkFromConnectionPath = function(path) {
  var i = path.indexOf('->');
  var sink = path.substring((path[i+2] === ':' ? i+3 : i+2));
  return sink;
};

N.fromPathError = function(network, path, part, message) {
  N.log('Path Error: '+message);
  return { error: { message: message, network: network, path: path, part: part } };
};

N.toFixed = function(value, precision) {
  var stringValue = '0.';
  var i=0;
  if(value === 1.0) {
    stringValue = '1.';
    for(i=0; i<precision; i++) {
      stringValue += '0';
    }
    return stringValue;
  }
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
};

/***
 * Returns the distance to the nearest point on the line
 * @method nearestPointOnLineSegment
 * @param x - point X
 * @param y - point Y
 * @param x1 - first line end X
 * @param y1 - first line end Y
 * @param x2 - second line end X
 * @param y2 - second line end Y
 * @returns {{ distSqr: Number, x: Number, y: Number}}
 */
N.nearestPointOnLineSegment = function(x, y, x1, y1, x2, y2) {

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var lenSq = C * C + D * D;
  var param = -1;
  if(lenSq !== 0) { //in case of 0 length line
    param = dot / lenSq;
  }

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return { distSqr: (dx * dx + dy * dy), x: xx, y: yy };
};

/**
 * Take capitals of camel case identifier and make an abbreviation, AsAnExample123 -> AAE123.
 * @method shortenName
 * @param longName
 * @returns {string}
 */
N.shortenName = function(longName) {
  if(!longName) { return ''; }
  var reg = /[A-Z0-9]*/g;
  var matches = longName.match(reg);
  return matches.join('');
};

/**
 * Take capitals of camel case identifier and inserts a dash and makes lower case, i.e. thisString becomes this-string.
 * @method camelCaseToDashed
 * @param camelCase
 * @returns {string}
 */
N.camelCaseToDashed = function(camelCase) {
  return camelCase.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};


/**
 * Remove [ and ] and replace with . separators.
 * @method cleanName
 * @param name
 * @returns {string}
 */
N.cleanName = function(name) {
  return name.replace(/\]\[/g, '-').replace(/\[/g, '-').replace(/\]/g, '');
};

/**
 * Returns the index of the array entry with the smallest value. If the array passed in is null, undefined, or zero length the return value is -1.
 * @method N.indexOfMin
 * @param {Array} array
 * @returns {num}
 */
N.indexOfMin = function(array) {
  if(!array || array.length === 0) { return -1; }

  var min = array[0];
  var minIndex = 0;

  for (var i = 1; i < array.length; i++) {
    if (array[i] < min) {
      minIndex = i;
      min = array[i];
    }
  }
  return minIndex;
};

/***
 * Get the host for the server for network, neuron, and system files and scripts. This will be of the form http://something.example.com/ or
 * possibly with a port, so http://something.example.com:3054/
 * @method N.getScriptHost
 * @return {string} - The host.
 */
N.getScriptHost = function() {
  var scriptHost = localStorage.getItem('lastScriptHost');
  if (!scriptHost) {
    scriptHost = N.Configuration.DEFAULT_NETWORK_REPOSITORY;
  }
  if(scriptHost.lastIndexOf('/') === scriptHost.length-1) {
    scriptHost = scriptHost.substr(0, scriptHost.length-1);
  }
  return scriptHost;
};

/**
 * Write to the system console (or some log, if overridden).
 * @method N.log
 * @param logText
 */
N.log = function(logText) {
  window.console.log(logText);
  return logText;
};

/**
 * The standard timestep for simulations - 1 millisecond
 * @type {number} Timestep
 */
N.timeStep = 1;

/**
 * Converts an angle in degrees to radians.
 *
 * @method N.rad
 * @param {float} angleDegrees Angle in degrees
 * @return {float} Angle in radians
 *
 */
N.rad = function(angleDegrees) {
  return Math.PI*angleDegrees/180;
};

/**
 * Converts an angle in radians to degrees.
 *
 * @method N.deg
 * @param {float} angleRadians Angle in radians
 * @return {float} Angle in degrees
 *
 */
N.deg = function(angleRadians) {
  return angleRadians*180/Math.PI;
};

/**
 * Create a globally unique ID and return it as a string.
 * @method N.generateUUID
 * @return {String} Unique Identifier string
 */
N.generateUUID = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c==='x' ? r : (r&0x7|0x8)).toString(16);
  });
  uuid = uuid.replace(/-/g, '');
  return uuid;
};

/***
 * Draw text
 * @method drawSvgText
 * @param text
 * @param group
 * @param size
 * @param x
 * @param y
 * @param horizontalAlign
 * @param verticalAlign
 * @returns {object} - returns an SVG.JS text object.
 */
N.drawSvgText = function(text, group, size, x, y, horizontalAlign, verticalAlign) {
  //N.Top    = 1;
  //N.Middle = 2;
  //N.Bottom = 3;
  //
  //N.Left    = 1;
  //N.Center  = 2;
  //N.Right   = 3;
  var textNode = group.plain(text).attr('font-size', size);
  var box = textNode.bbox();

  var moveX = x;
  if(horizontalAlign === N.Center) {
    moveX -= 0.5*box.width;
  } else if(horizontalAlign === N.Right) {
    moveX -= box.width;
  }

  var moveY = y;
  if(verticalAlign === N.Middle) {
    moveY -= 0.5*box.height;
  } else if(verticalAlign === N.Bottom) {
    moveY -= box.height;
  }

  textNode.move(moveX, moveY);
  return textNode;
};

/**
 * The ConfigurationReport holds lists of errors and warnings related to the system configuration. Errors are issues
 * that will cause the system to fail. Warnings will still allow the system to run but are clearly misconfigurations. An example
 * would be having input connections to objects that are output only.
 * @class ConfigurationReport
 */
N.ConfigurationReport = function() {
  this.errors = [];
  this.warnings = [];
};

/**
 * Add an error message and the path for the source of the object.
 * @method error
 * @param path
 * @param message
 * @return {N.ConfigurationReport} Returns a pointer to the report object.
 */
N.ConfigurationReport.prototype.error = function(path, message) {
  this.errors.push({ path: path, message: message });
  return this;
};

/**
 * Add a warning message and the path for the source of the object.
 * @method warning
 * @param path
 * @param message
 * @return {N.ConfigurationReport} Returns a pointer to the report object.
 */
N.ConfigurationReport.prototype.warning = function(path, message) {
  this.warnings.push({ path: path, message: message });
};

/**
 * Write the report to the system log via N.log(), which is usually the console.log().
 * @method writeToLog
 */
N.ConfigurationReport.prototype.writeToLog = function(title) {
  if(this.warnings.length === 0 && this.errors.length === 0) {
    N.log(title+': No errors or warnings');
  } else {
    var numErr = this.errors.length;
    var numWarn = this.warnings.length;
    N.log(title+': '+numErr+' error'+(numErr === 1 ? '' : 's') +' and '+this.warnings.length+' warning'+(numWarn === 1 ? '' : 's'));
    for(var i=0; i<numErr; i++) { N.log('    Error['+this.errors[i].path+']: '+this.errors[i].message); }
    for(i=0; i<numWarn; i++)   { N.log('    Warning['+this.warnings[i].path+']: '+this.warnings[i].message); }
  }
};

/**
 * Dictionary for holding globally accessible objects.
 *
 * @class objects
 */
N.objects = (function() {
  var objects = {};

  /**
   * Add an object to the Objects dictionary
   *
   * @method {Object} add
   * @param obj
   */
  function add(obj) {
    objects[obj.id] = obj;
  }

  /**
   * Get an object to the Objects dictionary
   *
   * @method {Object} get
   * @param {String} uid A unique identifier string for an object
   * @return {Object} An object or null.
   */
  function get(uid) {
    return objects[uid] || null;
  }

  /**
   * Remove the reference to the object to the Objects dictionary
   *
   * @method {Object} remove
   * @param {String} uid A unique identifier string for an object
   * @return {Object} Returns true if the object exists, false otherwise.
   */
  function remove(uid) {
    if(objects[uid]) {
      return delete objects[uid];
    }
    return false;
  }

  return {
    add: add,
    get: get,
    remove: remove
  }
})();
