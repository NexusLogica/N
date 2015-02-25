'use strict';

var N = N || {};

/* Directives */

var nSimAppDirectives = angular.module('nSimApp.directives', []);

nSimAppDirectives.directive('appVersion', ['version', function(version) {
    return function(scope, element, attrs) {
      element.text(version);
    };
  }]);

nSimAppDirectives.directive('xxxxnSignalId', [function() {
    function link($scope, $element, $attrs) {
      $scope.signalId = $attrs.nSignalId;
      $scope.SetSignalTrace($scope.signalId);
    }
    return {
      link: link
    }
  }]);

// The slide stop event.
nSimAppDirectives.directive(
  'nSlidestop',
  ['$parse', function($parse) { return { compile: function($element, attr) {
    var nattr = attr.nSlidestop;
    var fn = $parse(nattr);
    return function(scope, element, attr) {
      element.on(
        'slideStop',
        function(event) {
          scope.$apply(
            function() {
              fn(scope, {$event:{ min:event.value[0], max:event.value[1]}});
            }
          );
        }
      );
    }
  }
} }]
);

// The slide event.
nSimAppDirectives.directive('nSlide', ['$parse', function($parse) {
  return {
    compile: function($element, attr) {
      var nattr = attr.nSlide;
      var fn = $parse(nattr);
      return function(scope, element, attr) {
        element.on('slide', function(event) {
          scope.$apply(function() {
            fn(scope, {$event:{ min:event.value[0], max:event.value[1]}});
          });
        });
      }
    }
  }
}]);

// Range attribute watcher.
nSimAppDirectives.directive('nSignalGraphRange', [function() {
  return {
    replace: true,
    scope: { nSignalGraphRange: '@' },
    link: function(scope, element, attr) {
      scope.$watch('nSignalGraphRange', function(value) {
        var values = value.split(',');
        scope.$parent.setRangeLimits(values[0], values[1]);
      });
    }
  }
}]);
