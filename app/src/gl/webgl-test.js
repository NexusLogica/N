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
  _this.children = [];
  _this.transformUpdated = true;
  _this.transform = mat4.create();
  _this.worldTransform = mat4.create();
  _this.projectionModelView = mat4.create();

  var initialize = function(gl, scene, parent) {
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
    _this.positionLocation = gl.getAttribLocation(_this.program, 'position');
    _this.sizeLocation = gl.getUniformLocation(_this.program, 'size');
    _this.projectionMatrixLocation = gl.getUniformLocation(_this.program, 'projectionMatrix');
  }

  var render = function(gl, scene, parent) {
    if(!_this.initialized) {
      initialize(gl, scene, parent);
    }

    if(parent.transformUpdated || _this.transformUpdated) {
      mat4.multiply(_this.worldTransform, parent.worldTransform,  _this.transform);
      mat4.multiply(_this.projectionModelView, scene.projectionMatrix, _this.worldTransform);
    }
    gl.useProgram(_this.program);
    gl.uniform1f(_this.sizeLocation, _this.size);
    gl.uniformMatrix4fv(_this.projectionMatrixLocation, gl.FALSE, _this.projectionModelView);

    gl.bindBuffer(gl.ARRAY_BUFFER, _this.buffer);

    // Where the vertex data needs to go.
    gl.enableVertexAttribArray(_this.positionLocation);
    gl.vertexAttribPointer(_this.positionLocation, 2, gl.FLOAT, gl.FALSE, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  return {
    render: render
  }
};

Ngl.Scene = function() {
  var _this = this;
  this.children = [];
  this.transformUpdated = true;
  this.cameraTransformUpdated = true;

  this.transform = mat4.create();
  this.worldTransform = mat4.create();
  this.cameraTransform = mat4.create();
  this.inverseCameraTransform = mat4.create();
  mat4.translate(this.cameraTransform, this.cameraTransform, vec3.fromValues(0.0, 0.0, 3.0));


  var initialize = function(canvas) {
    var canvasElement = $(canvas);
    _this.width  = canvasElement.width();
    _this.height = canvasElement.height();

    _this.nearFrustrum = 0.1;
    _this.farFrustrum = 10000.0;
    _this.verticalViewAngle = 30.0; // degrees

    _this.gl = canvasElement.get(0).getContext('experimental-webgl', { preserveDrawingBuffer: true } );
    var gl = _this.gl;

    // Load shaders
    _this.simpleShader = {};
    _this.simpleShader.vertex = createShaderFromScriptElement(gl, 'flat-vertex-shader');
    _this.simpleShader.fragment = createShaderFromScriptElement(gl, 'flat-fragment-shader');
    _this.simpleShader.program = createProgram(gl, [_this.simpleShader.vertex, _this.simpleShader.fragment]);

//    gl.cullFace(gl.BACK);
//    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, _this.width, _this.height);

    _this.initialTime = (new Date()).getTime();

    // Set up the camera.
    _this.projectionMatrix = mat4.create();
    mat4.perspective(_this.projectionMatrix, _this.verticalViewAngle*Math.PI/180.0, _this.width/_this.height, _this.nearFrustrum, _this.farFrustrum);

  };

  var add = function(obj) {
    _this.children.push(obj);
  };

  var render = function() {
    var time = (new Date()).getTime() - _this.initialTime;
    var gl = _this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);

    if(_this.cameraTransformUpdated) {
      _this.cameraTransformUpdated = false;
      _this.transformUpdated = true;
      mat4.invert(_this.inverseCameraTransform, _this.cameraTransform);
    }

    if(_this.transformUpdated) {
      mat4.multiply(_this.worldTransform, _this.inverseCameraTransform, _this.transform);
    }

    for(var i in _this.children) {
      _this.children[i].render(gl, _this, _this);
    }

    _this.transformUpdated = false;
  };

  return {
    initialize: initialize,
    add: add,
    render: render
  }
};
