'use strict';

/* Directives */

var nSimAppDirectives = angular.module('nSimApp.directives', []);

nSimAppDirectives.directive('appVersion', ['version', function(version) {
    return function(scope, element, attrs) {
      element.text(version);
    };
  }]);

nSimAppDirectives.directive('xxxxnSignalId', [function() {
    function link($scope, $element, $attrs) {
      $scope.signalId = $attrs['nSignalId'];
      $scope.SetSignalTrace($scope.signalId);
    }
    return {
      link: link
    }
  }]);

nSimAppDirectives.directive('nCanvas', function() {
  function link($scope, $element, $attrs) {
    $scope.paper = Raphael($element[0], $element.width(), $element.height());
    if($attrs["nRenderer"]) {
      var renderer = $attrs["nRenderer"];
      $scope.renderer = eval("new "+renderer);
      $scope.renderer.Configure($scope.paper, $attrs["nSignalId"]);
      $scope.renderer.Render();
    }
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
    var nattr = attr['nSlidestop'];
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

/*
, function() {
  return {
    compile: function($element, attr) {
      var fn = $parse(attr['n-slide-stop']);
      return function(scope, element, attr) {
        element.on('slideStop', function(event) {
          scope.$apply(function() {
            fn(scope, {$event:event});
          });
        }}
        ;
      };
    }
  }
*/
