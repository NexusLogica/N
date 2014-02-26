/**********************************************************************

File     : scenes.js
Project  : N Simulator Library
Purpose  : Source file for scenes.
Revisions: Original definition by Lawrence Gunn.
           2014/02/24

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};
N.UI.Scene = N.UI.Scene || {};

  //*********************
  //* N.UI.Scene.Neuron *
  //*********************

N.UI.Scene.Neuron = function() {
  this.ClassName = 'N.UI.Scene';
  this.Neurons = {};
  this.Origin = 'center';
}

N.UI.Scene.Neuron.prototype.SetNeuron = function(neuron, size, position) {
  var piGraphic = N.UI.PiNeuronFactory.CreatePiNeuron(neuron.Display.Template);
  this.Neuron = neuron;
  this.NeuronGraphic = piGraphic;
  this.Size = size;
  this.Position = position;
}

  //***************
  //* N.UI.Scenes *
  //***************

N.UI.Scenes = (function() {
  var ClassName = 'N.UI.Scenes';
  var Scenes = {};

  function AddScene(sceneId, scene) {
    Scenes[sceneId] = scene;
  }

  function GetScene(sceneId) {
    return Scenes[sceneId];
  }
  return {
    AddScene: AddScene,
    GetScene: GetScene
  }
})();
