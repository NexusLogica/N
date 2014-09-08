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
  this.arrowScaling = 0.4;
  this.showPoints = false;
  this.showArrows = true;
  this.charges = [];
};

N.Bach.FieldScene.prototype.setFieldAndGrid = function(field, grid) {
  this.field = field;
  this.grid = grid;
};

N.Bach.FieldScene.prototype.build = function(scene) {

  this.scene = scene;
  this.grid.build();
  this.grid.applyField(this.field);

  var points = this.createPoints();

  if(this.showPoints) {
    var buffer = this.buildCloud(points);
    this.scene.add(buffer);
  }

  for(var i in this.charges) {
    var charge = this.charges[i];
    if(!charge.graphic) {
      charge.graphic = new THREE.Mesh(
        new THREE.SphereGeometry(this.grid.size.x*0.1, 12, 10),
        new THREE.MeshPhongMaterial({
          specular: '#888888',
          color: '#AA0000',
          emissive: '#220000',
          shininess: 4  })
      );
      charge.graphic.overdraw = true;
      this.scene.add(charge.graphic);
    }
  }

  this.setLighting(scene);
};

N.Bach.FieldScene.prototype.addCharge = function(position, magnitude, color) {
  var charge = {position: position, magnitude: magnitude, color: _.isUndefined(color) ? (magnitude > 0 ? 0xff0000 : 0x0000ff) : color };
  this.charges.push(charge);
}

N.Bach.FieldScene.prototype.createPoints = function() {
  var geometry = new THREE.BufferGeometry();
  var numPoints = this.grid.points.length;

  var positions = new Float32Array(numPoints*3);
  var colors = new Float32Array(numPoints*3);

  var colorLow = new THREE.Color(0x00FF00);
  var colorHigh = new THREE.Color(0xFF0000);

  var range = this.grid.max-this.grid.min;

  var arrows = [];

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

    if(this.showArrows) {
      var arrow = this.createArrow(point, intensityColor);
      if(arrow) {
        this.scene.add(arrow);
        arrows.push(arrow);
      }
    }
  }

  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingBox();

  return geometry;
};

N.Bach.FieldScene.prototype.createArrow = function(point, color) {

  // Place the middle of the point.
  var arrowDirection = point.fieldVec.clone().normalize();
  var arrowLength = this.arrowScaling*point.fieldVec.length();

  var originOffset = arrowDirection.clone().multiplyScalar(-arrowLength*0.5);
  var origin = point.position.clone().add(originOffset);

  var sourcePos = new THREE.Vector3(point.position);
  var targetPos = new THREE.Vector3(0, 1, 0);
  var direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
  if(Math.abs(arrowLength) < 1.0e-3) {
    return undefined;
  }

  var arrow = new THREE.ArrowHelper(
      point.fieldVec.clone().normalize(),
      origin,
      this.arrowScaling*point.fieldVec.length(),
      color,
      0.2*arrowLength,
      0.2*arrowLength
  );
  arrow.userData = { uiType: 'Grid arrow', data: point };
  return arrow;
};

N.Bach.FieldScene.prototype.buildCloud = function(points) {
  var material = new THREE.PointCloudMaterial({ size: 0.025, vertexColors: THREE.VertexColors });
  return new THREE.PointCloud(points, material);
};

N.Bach.FieldScene.prototype.setLighting = function(scene) {
  // add subtle ambient lighting
  var ambientLight = new THREE.AmbientLight(0x202020);
  scene.add(ambientLight);

  // directional lighting
  var directionalLight = new THREE.DirectionalLight(0x808080);
  directionalLight.position.set(0.8, 0.6, 1.2).normalize();
  scene.add(directionalLight);
};
