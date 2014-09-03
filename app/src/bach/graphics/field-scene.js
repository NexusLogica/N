/**********************************************************************

File     : field-scene.js
Project  : N Simulator Library
Purpose  : Source file for a field scene graphics object.
Revisions: Original definition by Lawrence Gunn.
           2014/09/02

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/

N.Bach.FieldScene = function() {
  this.size = new THREE.Vector3(1.0, 1.0, 1.0);
  this.grid = new THREE.Vector3(5, 5, 5);
}

N.Bach.FieldScene.prototype.build = function(scene, camera, renderer) {

  this.points = [];

  var geometry = new THREE.BoxGeometry(1,1,1);
  var material = new THREE.MeshPhongMaterial({
  specular: '#FFFFFF',
  // intermediate
  color: '#FF0000',
  emissive: '#000000',
  // dark
  shininess: 100  });
  var root = new THREE.Object3D();
  scene.add(root);

  var cube = new THREE.Mesh(geometry, material);
  root.add(cube);
  cube.translateY(0.25);

  var geometry2 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  var cube2 = new THREE.Mesh(geometry2, material);
  cube.add(cube2);
  cube2.translateX(1.5);

  var sphereGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );

  var spheres = [];
  for ( var i = 0; i < 40; i++ ) {
    var sphere = new THREE.Mesh( sphereGeometry, material );
    scene.add( sphere );
    sphere.translateX(0.2*i);
    spheres.push( sphere );
   }

  var material3 = new THREE.MeshBasicMaterial({
    color: 0x0000ff
  });

  var radius = 0.5;
  var segments = 32;

  var geometry4 = new THREE.SphereGeometry( 0.5, 32, 32 );
  var sphere = new THREE.Mesh( geometry4, material );
  cube.add( sphere );
  sphere.translateY(1.5);

  camera.position.z = 3;

  // add subtle ambient lighting
  var ambientLight = new THREE.AmbientLight(0x202020);
  scene.add(ambientLight);

  // directional lighting
  var directionalLight = new THREE.DirectionalLight(0x808080);
  directionalLight.position.set(0.8, 0.6, 1.2).normalize();
  scene.add(directionalLight);
}