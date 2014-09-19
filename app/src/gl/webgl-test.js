/**********************************************************************

File     : webgl-test.js
Project  : N Simulator Library
Purpose  : Source file for a field viewer settings component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/18

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var Ngl = Ngl || {};

Ngl.Object3D = function(position, size) {
  var _this = this;
  _this.position = position;
  _this.size = size;
  _this.initialized = false;

  var initialize = function(gl, scene) {
    _this.initialized = true;
    var array = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0]);
    _this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, _this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

    _this.program = scene.simpleShader.program;
    _this.position2dLocation = gl.getAttribLocation(_this.program, 'position2d');
    _this.sizeLocation = gl.getUniformLocation(_this.program, 'size');
  }

  var render = function(gl, scene) {
    if(!_this.initialized) {
      initialize(gl, scene);
    }
    gl.useProgram(_this.program);
    gl.uniform1f(_this.sizeLocation, _this.size);
    gl.bindBuffer(gl.ARRAY_BUFFER, _this.buffer);

    // Where the vertex data needs to go.
    gl.enableVertexAttribArray(_this.position2dLocation);
    gl.vertexAttribPointer(_this.position2dLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  return {
    render: render
  }
};

Ngl.Scene = function() {
  var _this = this;
  this.children = [];

  var initialize = function(canvas) {
    var canvasElement = $(canvas);
    _this.width  = canvasElement.width();
    _this.height = canvasElement.height();

    _this.gl = canvasElement.get(0).getContext('experimental-webgl', { preserveDrawingBuffer: true } );
    var gl = _this.gl;

    // Load shaders
    _this.simpleShader = {};
    _this.simpleShader.vertex = createShaderFromScriptElement(gl, 'flat-vertex-shader');
    _this.simpleShader.fragment = createShaderFromScriptElement(gl, 'flat-fragment-shader');
    _this.simpleShader.program = createProgram(gl, [_this.simpleShader.vertex, _this.simpleShader.fragment]);

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, _this.width, _this.height);

    _this.initialTime = (new Date()).getTime();
  };

  var add = function(obj) {
    _this.children.push(obj);
  };

  var render = function() {
    var time = (new Date()).getTime() - _this.initialTime;
    var gl = _this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);

    for(var i in _this.children) {
      _this.children[i].render(gl, _this);
    }
  };

  var createPerspectiveProjectionMatrix = function(left, right, bottom, top, nearVal, farVal) {
  // From http://www.felixgers.de/teaching/jogl/perspectiveProjection.html.
  Transform t;
  t(0,0) = 2.0f*nearVal/(right-left);
  t(0,1) = 0.0f;
  t(0,2) = (right+left)/(right-left);
  t(0,3) = 0.0f;
  t(1,0) = 0.0f;
  t(1,1) = 2.0f*nearVal/(top-bottom);
  t(1,2) = (top+bottom)/(top-bottom);
  t(1,3) = 0.0f;
  t(2,0) = 0.0f;
  t(2,1) = 0.0f;
  t(2,2) = -(farVal+nearVal)/(farVal-nearVal);
  t(2,3) = -2.0f*farVal*nearVal/(farVal-nearVal);
  t(3,0) = 0.0f;
  t(3,1) = 0.0f;
  t(3,2) = -1.0f;
  t(3,3) = 0.0f;
  return t;
}


  return {
    initialize: initialize,
    add: add,
    render: render
  }
};
