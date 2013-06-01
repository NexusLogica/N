'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }]);

function HeaderController($scope) {
  $scope.blah = "Hi there";
}

function TimingEditorController($scope) {
}