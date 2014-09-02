/**********************************************************************

File     : network-builder.js
Project  : N Simulator Library
Purpose  : Source file for a network builder component.
Revisions: Original definition by Lawrence Gunn.
           2014/08/28

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimApp.directives').directive('fieldViewerPanel', [function() {
  return {
    restrict: 'E',
    templateUrl: 'components/field-viewer-panel/field-viewer-panel.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'fieldViewerPanel', $scope, $element, $attrs);

      $scope.stopRendering = false;

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

        var controls = new THREE.OrbitControls(cube, target[0]);
        controls.damping = 0.2;

      // add subtle ambient lighting
      var ambientLight = new THREE.AmbientLight(0x202020);
      scene.add(ambientLight);

      // directional lighting
      var directionalLight = new THREE.DirectionalLight(0x808080);
      directionalLight.position.set(1, 1, 1).normalize();
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
