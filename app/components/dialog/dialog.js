/**********************************************************************

File     : dialog.js
Project  : N Simulator Library
Purpose  : Source file for a dialog component.
Revisions: Original definition by Lawrence Gunn.
           2014/08/28

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimApp.directives').directive('dialog', [function() {
  return {
    restrict: 'E',
    scope: {
      modalCloseFunction: '@?'
    },
    transclude: true,
    templateUrl: 'components/dialog/dialog.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$window', function (ComponentExtensions, $scope, $element, $attrs, $window) {
      ComponentExtensions.initialize(this, 'dialog', $scope, $attrs);

      $scope.closable = !_.isUndefined($attrs.closable) ? angular.wilson.utils.parseBoolean($attrs.closable) : true;

      var trackLabel = $attrs.modalTrackingId || _.string.dasherize($attrs.expose) || false;
      if ($attrs.noTrack) { trackLabel = false; }
      var trackIsOpen = false;

      $scope.stateMachine = StateMachine.create({
        initial: 'Closed',
        events: [
          { name: 'open',     from: 'Closed',       to: 'Opened'      },
          { name: 'close',    from: 'Opened',       to: 'Closed'     }
        ],
        timeouts: [],
        callbacks: {
          onenterOpened: function() {
            $window.scrollTo(0, 0);
            trackIsOpen = true;
          },
          onenterClosed: function() {
            if (trackLabel && trackIsOpen) {
              trackIsOpen = false;
              $scope.$emit('tracking-service:modal-close', trackLabel);
            }
          }
        }
      });

      $scope.close = function() {
        if ($scope.closable) {
          if ($scope.modalCloseFunction && $scope.parentComponent[$scope.modalCloseFunction]) {
            $scope.parentComponent[$scope.modalCloseFunction].close();
          } else {
            $scope.stateMachine.close();
          }
        }
      };

      $scope.open = function() {
        // Find all open modals and update zIndex as incremented
        var modalIndex = _.max(_.map($('.ht-modal-mask'), function(modal) {
          return parseInt($(modal).css('zIndex'), 10);
        }));

        if (_.isNumber(modalIndex)) {
          $element.css('zIndex', modalIndex + 1);
        }


        // Similarly, for forms.
        if (!_.isEmpty($attrs.exposeForm)) {
          var form = $('form[name="'+$attrs.exposeForm+'"]');
          if(form.length) {
            var formController = $('form[name="'+$attrs.exposeForm+'"]').scope()[$attrs.exposeForm];
            $scope.piParentComponent[$attrs.exposeForm] = formController;
          } else {
            N.log('ERROR: dialog: Form '+$attrs.exposeForm+' not found');
          }
        }

        $scope.stateMachine.open();
      };

      /*
       * no need to stop dropping files on modal mask anymore because it affects dnd from file chooser to send form
      controller.autoOn('dragover dragenter drag drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
      });
      */

      // Remove the modal on $destroy
      var destroyDeregistration = $scope.$on('$destroy', function() {
        destroyDeregistration();
        if (trackLabel && trackIsOpen) {
          trackIsOpen = false;
          $scope.$emit('tracking-service:modal-close', trackLabel);
        }
        $element.remove();
      });
    }],
    link: function($scope, $element, $attrs, controller) {

      angular.element('body').append($element);
    }
  }
}]);
