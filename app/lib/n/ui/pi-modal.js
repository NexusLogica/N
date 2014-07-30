/**********************************************************************

File     : pi-modal.js
Project  : N Simulator Library
Purpose  : Source file for pi network panel controller and renderer objects.
Revisions: Original definition by Lawrence Gunn.
           2014/07/29

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};
N.UI = N.UI || {};

angular.module('nSimApp.directives').directive('piModal', [ function() {
  return {
    restrict: 'A',
    controller: function($scope) {
    },
    link: function($scope, $element, $attr) {

      $element.on('shown.bs.modal', function (event) {
        $('[data-toggle=tooltip]').tooltip( { delay: { show: 500, hide: 100 }, animation: 'fade' });
        $element.find('.default-focus').focus();
      });
    }
  };
}]);
