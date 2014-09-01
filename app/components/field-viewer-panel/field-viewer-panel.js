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
      ComponentExtensions.initialize(this, 'fieldViewerPanel', $scope, $attrs);

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

        var controls = new THREE.OrbitControls( camera );
        controls.damping = 0.2;

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( target.width(), target.height() );
        target.append(renderer.domElement);

        var geometry = new THREE.BoxGeometry(1,1,1);
        var material = new THREE.MeshPhongMaterial({ specular: '#a9fcff',
          // intermediate
          color: '#00abb1',
          // dark
          emissive: '#006063',
          shininess: 100  });

        var cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 3;

        // add subtle ambient lighting
        var ambientLight = new THREE.AmbientLight(0x222222);
        scene.add(ambientLight);

        // directional lighting
        var directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);

        var render = function () {
          requestAnimationFrame(render);
          renderer.render(scene, camera);
        };
        controls.addEventListener( 'change', render );

        render();

      };

      initializeRenderer();
    }
  };
}]);
