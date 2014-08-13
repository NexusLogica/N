/**********************************************************************

File     : administration.js
Project  : N Simulator Library
Purpose  : Source file for a standard administration.
Revisions: Original definition by Lawrence Gunn.
           2014/08/12

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimApp.directives').directive('administration', [function() {
  return {
    restrict: 'E',
    //scope: {
    //},
    controller: ['$scope', '$timeout', function ($scope, $timeout) {
      $scope.userInfo = { firstName: 'Lawrence', lastName: 'Gunn' };
      $scope.database = { url: '' };
      $scope.$watch('database.url', function(value) {
        if(!_.isEmpty(value)) {
          $timeout(function() {
            if(value === $scope.database.url) {
              var db = new N.NWS.Database();
              db.canConnectToDB($scope.database.url).then(function(status) {
                $scope.$apply(function() { $scope.formMessage = 'Database is accessible.';
                $scope.createDbForm.databaseurl.$setValidity('administrationDb', true);
              });
              },
              function(status) {
                $scope.$apply(function() {
                  $scope.formMessage = 'Database can not be accessed: '+status.errMsg;
                  $scope.createDbForm.databaseurl.$setValidity('administrationDb', false);
                });
              });
              // Note: a local couchDB is by default http://127.0.0.1:5984
            }
          }, 1000);
        }
      });

    }],
    link: function($scope, $element, $attrs, $ctrl) {
      $scope.createDatabase = function() {
        $element.find('.create-database').modal('show');
      }

    }
  };
}]);
