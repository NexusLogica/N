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

nSimAppDirectives.directive('nCanvas', function() {
  function link($scope, $element, $attrs) {
    $scope.paper = Raphael($element[0], $element.width(), $element.height());
    if($attrs.nRenderer) {
      var renderer = $attrs.nRenderer;
      $scope.$parent.renderer = N.NewN(renderer);
      $scope.$parent.renderer.Configure($scope.paper, $attrs.nSignalId);
      $scope.$parent.renderer.Render();
    }
  }

  return {
    restrict: 'AE',
    transclude: true,
    scope: { title:'@' },
    link: link
  };
});

nSimAppDirectives.directive('piCanvas', function() {
  function link($scope, $element, $attrs) {
    var width = $attrs.piWidth;
    var height = $attrs.piHeight;
    var sceneId = $attrs.piSceneId;
    $($element[0]).addClass('pi-canvas').width(width).height(height);
    $scope.paper = Raphael($element[0], width, height);
    $scope.$parent.renderer = new N.UI.PiCanvasRenderer();
    $scope.$parent.renderer.Configure($scope.paper, sceneId);
    $scope.$parent.renderer.Render();
  }

  return {
    restrict: 'AE',
    transclude: true,
    scope: { title:'@' },
    link: link
  };
});


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
