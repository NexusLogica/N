/**********************************************************************

File     : field-scene.js
Project  : N Simulator Library
Purpose  : Source file for a field scene graphics object.
Revisions: Original definition by Lawrence Gunn.
           2014/09/02

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/

'use strict';

N.Bach.FieldScene = function() {
}


N.Bach.FieldScene.prototype.setFieldAndGrid = function(field, grid) {
  this.field = field;
  this.grid = grid;
}

N.Bach.FieldScene.prototype.build = function(scene, camera, renderer) {

  this.grid.build();
  this.grid.applyField(this.field);

  var points = this.createPoints();
  var buffer = this.buildCloud(points);

  scene.add(buffer);

  this.setLighting(scene);
}

N.Bach.FieldScene.prototype.createPoints = function() {
  var geometry = new THREE.BufferGeometry();
  var numPoints = this.grid.points.length;

  var positions = new Float32Array(numPoints*3);
  var colors = new Float32Array(numPoints*3);

  var colorLow = new THREE.Color(0x0000FF);
  var colorHigh = new THREE.Color(0xFF0000);
  debugger;
  var range = this.grid.max-this.grid.min;

  for(var i in this.grid.points) {
    var point = this.grid.points[i];

    var intensity = (point.intensity-this.grid.min)/range;
    var intensityColor = colorLow.clone();
    intensityColor.lerp(colorHigh, intensity);

    positions[i*3]   = point.position.x;
    positions[i*3+1] = point.position.y;
    positions[i*3+2] = point.position.z;

    colors[i*3]   = intensityColor.r;
    colors[i*3+1] = intensityColor.g;
    colors[i*3+2] = intensityColor.b;
  }

  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingBox();

  return geometry;
}

N.Bach.FieldScene.prototype.insertArrow = function(scene) {
  var sourcePos = new THREE.Vector3(0, 0, 0);
  var targetPos = new THREE.Vector3(0, 1, 0);
  var direction = new THREE.Vector3().sub(targetPos, sourcePos);
  var arrow = new THREE.ArrowHelper(direction.clone().normalize(), sourcePos, direction.length(), 0x00ff00);
  scene.add(arrow);
}

N.Bach.FieldScene.prototype.buildCloud = function(points) {
  var material = new THREE.PointCloudMaterial({ size: 0.05, vertexColors: THREE.VertexColors });
  var pointcloud = new THREE.PointCloud(points, material);
  return pointcloud;
}

N.Bach.FieldScene.prototype.setLighting = function(scene) {
  // add subtle ambient lighting
  var ambientLight = new THREE.AmbientLight(0x202020);
  scene.add(ambientLight);

  // directional lighting
  var directionalLight = new THREE.DirectionalLight(0x808080);
  directionalLight.position.set(0.8, 0.6, 1.2).normalize();
  scene.add(directionalLight);
}
