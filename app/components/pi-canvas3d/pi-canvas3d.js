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
    scope: {
      scene: '=scene'
    },
    templateUrl: 'components/pi-canvas3d/pi-canvas3d.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', function (ComponentExtensions, $scope, $element, $attrs) {
      ComponentExtensions.initialize(this, 'piCanvas3d', $scope, $element, $attrs);


    }],
    link: function($scope, $element, $attrs) {
      var useTrackingControls = $attrs.hasOwnProperty('useTrackingControls');

      $scope.stop = function() {
        $scope.stopRendering = !$scope.stopRendering;
      };

      var scene, camera, renderer;

      var initializeRenderer = function() {
        if(!Detector.webgl) {
          Detector.addGetWebGLMessage();
        }

        var target = $element.find('.render-target');

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, target.width() / target.height(), 0.1, 1000 );
        camera.position.z = 3;

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( target.width(), target.height() );
        target.append(renderer.domElement);

        if(useTrackingControls) {
          var controls = new THREE.OrbitControls(camera, target[0]);
          controls.damping = 0.2;
          controls.addEventListener( 'change', function() {
            renderer.render( scene, camera );
          });
        }

        if($scope.scene) {
          $scope.scene.build(scene, camera, renderer);
        }
      };

      var render = function () {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
      };

      var startRenderLoop = function() {
        render();
      }

      initializeRenderer();
      startRenderLoop();

    }
  };
}]);
