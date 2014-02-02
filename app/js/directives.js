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


