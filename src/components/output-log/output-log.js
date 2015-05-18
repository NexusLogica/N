/**********************************************************************

File     : output-log.js
Project  : N Simulator Library
Purpose  : Source file for an N editor component.
Revisions: Original definition by Lawrence Gunn.
           2015/03/20

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('outputLog', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/output-log/output-log.html',
    scope: {
      signals: '=signals'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'outputLog', $scope, $element, $attrs);

    }],
    link: function($scope, $element, $attrs, ctrl) {
      $scope.signals['output-log'].add(function(type, text) {
        var container = $element.find('.log-area');
        var date = JSON.stringify(new Date()).replace(/"/g, '');
        var lines = text.split('\n');
        for(var i=0; i<lines.length; i++) {
          container.append('<div class="log-line">['+date+'] <span'+(type === 'error' ? ' class="error"': '')+'>'+lines[i]+'</div>');
        }

        container.scrollTop(container[0].scrollHeight);
      });

    }
  };
}]);
