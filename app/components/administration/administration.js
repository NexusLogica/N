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
    templateUrl: 'components/administration/administration.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', 'localStorageService', function (ComponentExtensions, $scope, $element, $attrs, $timeout, localStorageService) {
      ComponentExtensions.initialize(this, 'administration', $scope, $attrs);

      $scope.userInfo = { firstName: 'Lawrence', lastName: 'Gunn' };
      $scope.database = { url: '' };
      $scope.databaseList = N.NWS.services.databases;
      $scope.formMessage = '';
      $scope.formMessageType = '';

      /***
       * Watch the database url field and auto-check the url for validity.
       */
      $scope.$watch('database.url', function(value) {
        if(!_.isEmpty(value)) {
          $timeout(function() {
            if(value === $scope.database.url) {
              N.NWS.WebServices.canConnectToDB(_.string.trim($scope.database.url)).then(
                function(status) { // success
                  $scope.$apply(function() {
                    $scope.formMessage = 'Database is accessible.';
                    $scope.formMessageType = 'success';
                    $scope.createDbForm.databaseurl.$setValidity('administrationDb', true);
                  });
                },
                function(status) { // failure
                  $scope.$apply(function() {
                    $scope.formMessage = 'Database can not be accessed: '+status.errMsg.textStatus;
                    $scope.formMessageType = 'error';
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
        $scope.createDatabaseDialog.open($scope.database, 'database');
      }

      $scope.createDatabase = function() {
        if(!$scope.createDbForm.$valid) {
          $scope.formMessage = 'Please fix the errors';
          return;
        }
        $scope.formMessage = '';
        N.NWS.services.createDatabase(_.string.trim($scope.database.url), _.string.trim($scope.database.name), $scope.database.description, $scope.userInfo).then(
          function(database) { // success
            $scope.$apply(function() {
              N.NWS.services.writeDatabasesToLocalStorage();
              $scope.database = { url: '', name: '', description: '' };
              $scope.createDatabaseDialog.close();
            });
          },
          function(status) { // failure
            $scope.$apply(function() {
              $scope.formMessage = 'Database could not be created: '+status.errMsg;
            });
          }
        );
      }

      $scope.closeCreateDatabaseDialog = function() {
        $scope.createDatabaseDialog.close();
      }

      $scope.showDeleteDatabase = function() {
        $scope.deleteDatabaseDialog.open();
      }

      $scope.selectedDeleteDatabase = function(database) {
        $scope.databaseToDelete = database;
      }

      $scope.deleteDatabase = function() {
        bootbox.dialog({
          message: 'Are you certain you want to delete this database?',
          title: 'Delete database',
          buttons: {
            yes: {
              label: 'Yes',
              className: 'btn-success',
              callback: function() {
                N.NWS.services.deleteDatabase($scope.databaseToDelete.url, $scope.databaseToDelete.name).then(
                  function() {
                    $scope.$apply(function() {
                      $scope.deleteDatabaseDialog.close();
                      N.NWS.services.writeDatabasesToLocalStorage();
                      $scope.databaseToDelete = null;
                    });
                  },
                  function(status) {
                    $scope.$apply(function() {
                      $scope.formMessage = 'Database could not be deleted: '+status.errMsg;
                    });
                  }
                );
              }
            },
            no: {
              label: 'No',
              className: 'btn-primary',
              callback: function() {

              }
            }
          }
        });
      }
    }
  };
}]);
