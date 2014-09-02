/**********************************************************************

File     : pi-canvas3d.js
Project  : N Simulator Library
Purpose  : Source file for a pi-canvas-3d component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/01

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimApp.directives').directive('piCanvas3d', [function() {
  return {
    restrict: 'E',
    templateUrl: 'components/pi-canvas3d/pi-canvas3d.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'piCanvas3d', $scope, $element, $attrs);


    }],
    link: function($scope, $element, $attrs, ctrl) {
      $scope.stop = function() {
        if($scope.stopRendering) {
          $scope.stopRendering = false;
        } else {
          $scope.stopRendering = true;
        }
      }

      var initializeRenderer = function() {
        if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

        var target = $element.find('.render-target');

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera( 75, target.width() / target.height(), 0.1, 1000 );

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( target.width(), target.height() );
        target.append(renderer.domElement);

        var geometry = new THREE.BoxGeometry(1,1,1);
//        var material = new THREE.MeshPhongMaterial({
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
//        var sphereMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000, shading: THREE.FlatShading } );

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

        var controls = new THREE.OrbitControls(camera, target[0]);
//        var controls = new THREE.TrackballControls(camera, target[0]);
        controls.damping = 0.2;

      // add subtle ambient lighting
      var ambientLight = new THREE.AmbientLight(0x202020);
      scene.add(ambientLight);

      // directional lighting
      var directionalLight = new THREE.DirectionalLight(0x808080);
      directionalLight.position.set(0.8, 0.6, 1.2).normalize();
      scene.add(directionalLight);

        var render = function () {
          requestAnimationFrame(render);
          renderer.render(scene, camera);
        };

        controls.addEventListener( 'change', function() {
          renderer.render( scene, camera );
        });

        render();

      };

      initializeRenderer();

    }
  };
}]);
