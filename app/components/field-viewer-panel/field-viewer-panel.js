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


    }],
    link: function($scope, $element, $attrs) {

      var initializeRenderer = function() {
        var target = $element.find('.render-target');

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera( 75, target.width() / target.height(), 0.1, 1000 );

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( target.width(), target.height() );
        target.append(renderer.domElement);

        var geometry = new THREE.BoxGeometry(1,1,1);
        var material = new THREE.MeshBasicMaterial({ color: 0x008800 });
        var cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 3;

        var render = function () {
          requestAnimationFrame(render);

          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;

          renderer.render(scene, camera);
        };

        render();

      };

      initializeRenderer();
    }
  };
}]);
