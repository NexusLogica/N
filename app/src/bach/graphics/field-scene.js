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
  this.arrows = [];

  this.gridCenterOriginal = new THREE.Vector3(0.0, 0.0, 0.0);
  this.gridCenterCurrent = this.gridCenterOriginal.clone();
};

N.Bach.FieldScene.prototype.setFieldAndGrid = function(field, grid) {
  this.field = field;
  this.grid = grid;
};

N.Bach.FieldScene.prototype.addCharge = function(position, magnitude, color) {
  var charge = {position: position, magnitude: magnitude, color: _.isUndefined(color) ? (magnitude > 0 ? 0xff0000 : 0x0000ff) : color };
  this.charges.push(charge);
}

N.Bach.FieldScene.prototype.build = function(scene) {

  this.scene = scene;

  this.grid.build();
  this.grid.applyField(this.field, this.gridCenterOriginal);

  // Set the max and min and keep those values. Note that if both values are positive then it is assumed the minimum
  // is zero, and the reverse if both are negative.
  this.gridMax = this.grid.max;
  this.gridMin = this.grid.min;
  if(this.gridMin > 0) {
    this.gridMin = 0.0;
  }
  else if(this.gridMax < 0) {
    this.gridMax = 0.0;
  }

  if(this.showPoints) {
    this.geometry = this.createPoints()
    var buffer = this.buildCloud();
  }

  if(this.showArrows) {
    this.createArrows();
  }

  this.createCharges();

  this.setLighting(scene);

  this.update(this.gridCenterOriginal);
};

N.Bach.FieldScene.prototype.slideGrid = function(value, direction) {
  var scale = 1.0;
  if(direction === 'x') {
    var offset = this.gridCenterOriginal.clone().setX(this.gridCenterOriginal.x+value);
    this.update(offset);
  }
  else if(direction === 'z') {
    var offset = this.gridCenterOriginal.clone().setZ(this.gridCenterOriginal.z+value);
    this.update(offset);
  }
};

N.Bach.FieldScene.prototype.createPoints = function() {
  var numPoints = this.grid.points.length;

  this.positionsArray = new Float32Array(numPoints*3);
  this.colorsArray = new Float32Array(numPoints*3);

  var geometry = new THREE.BufferGeometry();
  geometry.addAttribute('position', new THREE.BufferAttribute(this.positionsArray, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(this.colorsArray, 3));
};

N.Bach.FieldScene.prototype.createArrows = function() {
  var numPoints = this.grid.points.length;
  for(var i=0; i<numPoints; i++) {
    var arrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      1.0,
      0xffffff,
      1.2*this.gridMax,
      2.0*this.gridMax
    );
    var arrowFrame = new THREE.Object3D();
    arrowFrame.add(arrow);
    this.arrows.push(arrowFrame);
    this.scene.add(arrowFrame);
  }
};

N.Bach.FieldScene.prototype.buildCloud = function() {
  var material = new THREE.PointCloudMaterial({ size: 0.025, vertexColors: THREE.VertexColors });
  this.pointCloud = new THREE.PointCloud(this.geometry, material);
  this.scene.add(this.pointCloud);
};

N.Bach.FieldScene.prototype.createCharges = function() {
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
};

N.Bach.FieldScene.prototype.update = function(offset) {
  this.grid.applyField(this.field, offset);

  var colorLow = new THREE.Color(0x00FF00);
  var colorHigh = new THREE.Color(0xFF0000);

  var range = this.gridMax-this.gridMin;

  for(var i in this.grid.points) {
    var point = this.grid.points[i];

    var intensity = (point.intensity-this.gridMin)/range;
    var intensityColor = colorLow.clone();
    intensityColor.lerp(colorHigh, intensity);

    if(this.showPoints) {
      this.positionsArray[i*3]   = point.position.x;
      this.positionsArray[i*3+1] = point.position.y;
      this.positionsArray[i*3+2] = point.position.z;

      this.colorsArray[i*3]   = intensityColor.r;
      this.colorsArray[i*3+1] = intensityColor.g;
      this.colorsArray[i*3+2] = intensityColor.b;
    }
    if(this.showArrows) {
      this.updateArrow(this.arrows[i], point, intensityColor);
    }
  }

  if(this.showPoints) {
    this.geometry.computeBoundingBox();
  }
};

N.Bach.FieldScene.prototype.updateArrow = function(arrowFrame, point, color) {

  // Place the middle of the point.
  var arrowDirection = point.fieldVec.clone().normalize();
  var arrowLength = this.arrowScaling*point.fieldVec.length();

  var originOffset = arrowDirection.clone().multiplyScalar(-arrowLength*0.5);
  var origin = point.currentPosition.clone().add(originOffset);

  var sourcePos = new THREE.Vector3(point.position);
  var targetPos = new THREE.Vector3(0, 1, 0);
  var direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
  if(Math.abs(arrowLength) < 1.0e-3) {
    arrowFrame.visible = false;
    return;
  }

  arrowFrame.visible = true;
  arrowFrame.position.copy(origin);

  var arrow = arrowFrame.children[0];
  arrow.setDirection(point.fieldVec.clone().normalize());
  var len = point.fieldVec.length();
  arrow.setLength(this.arrowScaling*len, 0.3*this.arrowScaling*len, 0.4*this.arrowScaling*len);
  arrow.setColor(color);
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
