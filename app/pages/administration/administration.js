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
    controller: ['$scope', '$timeout', 'localStorageService', function ($scope, $timeout, localStorageService) {
      $scope.userInfo = { firstName: 'Lawrence', lastName: 'Gunn' };
      $scope.database = { url: '' };
      $scope.databaseList = [];

      var readDatabaseList = function() {
        var list = localStorageService.get('accessedDatabases');
        if(list) {
          $scope.databaseList = list;
        } else {
          $scope.databaseList = [];
        }
      }
      readDatabaseList();

      var writeDatabaseList = function() {
        var currentListData = [];
        var list = localStorageService.get('accessedDatabases');
        if(list) {
          currentListData = list;
        }
        $scope.databaseList = _.uniq(_.union($scope.databaseList, currentListData), function(db) {
          debugger;
          return db.url+db.name;
        });
        localStorageService.set('accessedDatabases', $scope.databaseList);
      }
      readDatabaseList();

      $scope.addDatabase = function(url, name, description) {
        $scope.databaseList.push({ url: url, name: name, description: description, accessible: true });
        writeDatabaseList();
      }

      /***
       * Watch the database url field and auto-check the url for validity.
       */
      $scope.$watch('database.url', function(value) {
        if(!_.isEmpty(value)) {
          $timeout(function() {
            if(value === $scope.database.url) {
              var db = new N.NWS.Database();
              db.canConnectToDB($scope.database.url).then(
                function(status) { // success
                  $scope.$apply(function() {
                    $scope.formMessage = 'Database is accessible.';
                    $scope.createDbForm.databaseurl.$setValidity('administrationDb', true);
                  });
                },
                function(status) { // failure
                  $scope.$apply(function() {
                    $scope.formMessage = 'Database can not be accessed: '+status.errMsg;
                    $scope.createDbForm.databaseurl.$setValidity('administrationDb', false);
                  });
                }
              );
              // Note: a local couchDB is by default http://127.0.0.1:5984
            }
          }, 1000);
        }
      });

    }],
    link: function($scope, $element, $attrs, $ctrl) {

      /***
       * Open the create database dialog.
       * @method showCreateDatabase
       */
      $scope.showCreateDatabase = function() {
        $element.find('.create-database').modal('show');
      }


      $scope.createDatabase = function() {
        if(!$scope.createDbForm.$valid) {
          $scope.formMessage = 'Please fix the errors';
          return;
        }
        $scope.formMessage = '';
        var db = new N.NWS.Database();
        db.createDatabase($scope.database.url, $scope.database.name, $scope.database.description, $scope.userInfo).then(
          function(status) { // success
            $scope.$apply(function() {
              $scope.addDatabase($scope.database.url, $scope.database.name, $scope.database.description);
              $element.find('.create-database').modal('hide');
              $scope.database = { url: '', name: '', description: '' };
            });
          },
          function(status) { // failure
            $scope.$apply(function() {
              $scope.formMessage = 'Database could not be created: '+status.errMsg;
            });
          }
        );
      }
    }
  };
}]);
