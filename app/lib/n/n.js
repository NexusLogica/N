/**********************************************************************

File     : n.js
Project  : N Simulator Library
Purpose  : Source file for signal relate objects.
Revisions: Original definition by Lawrence Gunn.
           2014/01/25

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/

var N = N || {};

N.CreateInstance = function(json) {
  var obj = new this[json.ClassName.substr(2)];
  for(var key in json) {
    obj[key] = json[key];
  }
  return obj;
}

  //***********
  //* Signals *
  //***********

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

  //***********
  //* Manager *
  //***********

N.Manager = function() {
  this.Signals = new N.Signals;
}

N.Manager.prototype.GenerateUUID = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x7|0x8)).toString(16);
  });
  return uuid;
}

N.M = N.M || new N.Manager();
