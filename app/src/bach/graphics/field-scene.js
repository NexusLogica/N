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
  this.size = new THREE.Vector3(1.0, 1.0, 1.0);
  this.size.multiplyScalar(2.0);
  this.grid = new THREE.Vector3(5, 5, 5);
}

N.Bach.FieldScene.prototype.build = function(scene, camera, renderer) {
  var points = this.createPoints();
  var buffer = this.buildCloud(points);
  scene.add(buffer);

  this.setLighting(scene);
}

N.Bach.FieldScene.prototype.createPoints = function() {
  var geometry = new THREE.BufferGeometry();
  var numPoints = this.grid.x*this.grid.y*this.grid.z;

  var positions = new Float32Array(numPoints*3);
  var colors = new Float32Array(numPoints*3);
  var color = new THREE.Color(0xFF0000);
  var intensity = 1.0;

  var xInc = this.size.x/(this.grid.x-1);
  var yInc = this.size.y/(this.grid.y-1);
  var zInc = this.size.z/(this.grid.z-1);

  var m = 0;
  var x = -0.5*this.size.x;
  for(var i = 0; i < this.grid.x; i++) {
    var y = -0.5*this.size.y;
    for(var j = 0; j < this.grid.y; j++) {
      var z = -0.5*this.size.z;
      for(var k = 0; k < this.grid.z; k++) {
        positions[ 3 * m ] =     x;
        positions[ 3 * m + 1 ] = y;
        positions[ 3 * m + 2 ] = z;

        colors[ 3 * m ]     = color.r * intensity;
        colors[ 3 * m + 1 ] = color.g * intensity;
        colors[ 3 * m + 2 ] = color.b * intensity;

        z += zInc;
        m++;
      }
      y += yInc;
    }
    x += xInc;
  }

  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingBox();

  return geometry;
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
