'use strict';

/**********************************************************************
  Controllers
*/

var nSimAppControllers = angular.module('nSimApp.controllers');

nSimAppControllers.controller('SignalTraceController', ['$scope',
  function SignalTraceController($scope) {
    $scope.blah = "XXX";
    $scope.setSignalTrace = function(trace) {
      console.log(trace);
    }
  }
]);

nSimAppControllers.controller('SimulationCtrl', ['$scope',
  function SimulationCtrl($scope) {
    $scope.blah = "XXX";
  }]);

//***************************************************
// HeaderController
//
function HeaderController($scope, $compile, $rootScope, guidGenerator) {
  $scope.waveformsNew = function() {
    var guid = guidGenerator.CreateUUID();
    var html = $compile('<div class="container" main-window-id="'+guid+'" ng-include onload="renderWave()" src="\'partials/waveform-editor.html\'"  ng-controller="WaveformEditorController"></div>')($scope);
    $("#main-app-container").append(html);
    $rootScope.$broadcast("newMainWindow", "New Waveform", guid);
  }

  $scope.waveformsSearch = function() {
    var guid = guidGenerator.CreateUUID();
    var html = $compile('<div id="search-1" class="container" main-window-id="'+guid+'" ng-include onload="loadWaveforms()" src="\'partials/waveform-search.html\'"  ng-controller="WaveformSearchController"></div>')($scope);
    $("#main-app-container").append(html);
    $rootScope.$broadcast("newMainWindow", "Waveforms", guid);
  }
}

//***************************************************
// WaveformEditorController
//
function WaveformEditorController(guidGenerator, postNewWaveform,	$scope, $element) {

  $scope.mainWindowId = $($element).attr('main-window-id');
  $scope.mainWindowId2 = $(scope.$element).attr('main-window-id');
  $scope.$on("showMainWindow", function(event, showWindowId) {
    if(showWindowId == $scope.mainWindowId) {
      $($element).show();
    }
    else {
      $($element).hide();
    }
  });

  $scope.$on("closeMainWindow", function(event, showWindowId) {
      if(showWindowId == $scope.mainWindowId) {
      $($element).remove();
    }
  });

  $scope.renderWave = function() {
    $scope.waveText = "p.";
    $scope.makeWave($scope.waveText);

    $scope.waveViewContainer = $($element).find(".wave-container")[0];

    $scope.waveDromView = new WaveDrom();
    $scope.waveDromView.RenderWaveForm($scope.waveViewContainer, $scope.waveJson);
  }

  $scope.change = function() {
    this.makeWave(this.waveText);
    this.waveDromView.RenderWaveForm($scope.waveViewContainer, $scope.waveJson);
  }

  $scope.makeWave = function(wave) {
    if(!this.waveJson) {
      $scope.waveJson = { "signal" : [
          { "name": "clock", "wave": "p......" },
          { "name": "signal", "wave": "p." }
      ]};
    }
    $scope.waveJson.signal[1].wave = wave;
  }
  
  $scope.save = function() {
    var id = guidGenerator.CreateUUID();
    var name = $($element).find(".wave-name-input").val();
    var waveJson = angular.toJson($scope.waveJson, false); // No pretty printing...
    postNewWaveform.doPost(id, name, waveJson).then(function(d) {
      consol.log("Result returned");
    });
    return false;
  }
}

//***************************************************
// WaveformSearchController
//
function WaveformSearchController(getWaveforms,	 $scope , $element, $compile) {
  $scope.highlightedScope = null;

  $scope.mainWindowId = $($element).attr('main-window-id');
  $scope.$on("showMainWindow", function(event, showWindowId) {
    if(showWindowId == $scope.mainWindowId) {
      $($element).show();
    }
    else {
      $($element).hide();
    }
  });

  $scope.$on("closeMainWindow", function(event, showWindowId) {
    if(showWindowId == $scope.mainWindowId) {
      $($element).remove();
    }
  });

  $scope.loadWaveforms = function() {
    $(".item-with-tooltip").tooltip();
    $scope.refresh();
  }

  $scope.childClicked = function(childScope, id) {
    if($scope.highlightedScope) {
      $scope.highlightedScope.dehighlight();
    }
    $scope.highlightedScope = childScope;

    $scope.viewWaveform(id);
  }

  $scope.refresh = function() {
    getWaveforms.doGet().then(function(d) {
      if(d && d.status == "success") {
        var data = d.result;
        data.forEach(function(entry) {
          // Take the string date from the server, specify it as UTC, and create a Date
          // object that Angular can work with.
          var nd = new Date((entry.modification_date + " UTC").replace(/-/g, "/"));
          entry.date_object = nd;
        });
        $scope.waveformList = data;
      }
      else {
        $scope.errorMessage = ( (d && d.errorMsg && d.errorMsg.length > 0) ? d.errorMsg : "We were unable to connect to the server.");
        $($element).find(".n-alert").center();
        $($element).find(".n-alert").fadeIn(500);

      }
    });
  }

  $scope.viewWaveform = function(id) {
    if($($element).find(".waveform-viewer").length != 0) {
      $($element).find(".waveform-viewer").remove();
    }
    var container = $($element).find(".waveform-viewer-container");
    var html = $compile('<div class="container waveform-viewer" ng-include onload="downloadWaveform(\''+id+'\')" src="\'partials/waveform-viewer.html\'"  ng-controller="WaveformViewerController"></div>')($scope);
    container.html(html);
  }

  $scope.onWaveformDeleted = function() {
    $($element).find(".waveform-viewer").remove();
    $scope.refresh();
  }
}

//***************************************************
// WaveformSearchItemController
//
function WaveformSearchItemController($scope , $element) {
  $scope.itemClick = function(obj) {
    $scope.$parent.childClicked($scope, $($element).find(".wave-list-id").attr("waveform-id"));
    $scope.highlighted = !$scope.highlighted;
  }
  $scope.dehighlight = function() {
    $scope.highlighted = !$scope.highlighted;
  }
}

//***************************************************
// WaveformViewerController
//
function WaveformViewerController(getWaveform, deleteWaveform, $scope , $element) {
  $scope.downloadWaveform = function(id) {
    $scope.id = id;
    getWaveform.doGet(id).then(function(d) {
      if(d && d.status == "success") {
        var data = d.result;
        $scope.waveformName = data.name;
        $scope.waveformDate = data.modification_date;
        $scope.waveformID = data.id;
      }
      else {
        $scope.errorMessge = (d ? d.errorMsg : "I was unable to connect to the server");
        $($element).find(".n-alert").center();
        $($element).find(".n-alert").fadeIn(500);

      }
    });
  }

  $scope.editWaveform = function() {
    var guid = guidGenerator.CreateUUID();
    var html = $compile('<div class="container" main-window-id="'+guid+'" ng-include onload="renderWave()" src="\'partials/waveform-editor.html\'"  ng-controller="WaveformEditorController"></div>')($scope);
    $("#main-app-container").html(html);
    $rootScope.$broadcast("newMainWindow", "New Waveform", guid);
  }


  $scope.deleteWaveform = function() {
    deleteWaveform.doDelete($scope.id).then(
      function(d) {
        if(d && d.status == "success") {
          $scope.$parent.onWaveformDeleted();
        }
        else {
          $scope.errorMessge = (d ? d.errorMsg : "I was unable to connect to the server");
          $($element).find(".n-alert").center();
          $($element).find(".n-alert").fadeIn(500);
        }
      },
      function(d) {
        alert("ERROR");
      }
    );
  }
}

//***************************************************
// TabBarController
//
function TabBarController($scope , $element, $rootScope) {

  $($element).hide();
  $scope.mainWindowOrder = [];

  $scope.navTabItems = [];
  $scope.$on("newMainWindow", function(event, tabName, tabId) {
    $($element).show();
    $scope.navTabItems.push({ name: tabName, id: tabId});
  });

  $scope.removeChildTab = function(el, id) {
    for(var i=0; i<$scope.navTabItems.length; i++) {
      if($scope.navTabItems[i].id == id) {
        $scope.navTabItems.splice(i, 1);
        el.remove();
        if($element.find('a').length == 0) {
          $($element).hide();
        }
        break;
      }
    }
  }

  $scope.$on("showMainWindow", function(event, showWindowId) {
    var index = $scope.mainWindowOrder.indexOf(showWindowId);
    if(index != -1) {
      $scope.mainWindowOrder.splice(index, 1);
    }
    $scope.mainWindowOrder.push(showWindowId);
  });

  $scope.$on("closeMainWindow", function(event, windowId) {
    var index = $scope.mainWindowOrder.indexOf(windowId);
    if(index != -1) {
      $scope.mainWindowOrder.splice(index, 1);
    }
    $rootScope.$broadcast("activateTabForWindow", $scope.mainWindowOrder[$scope.mainWindowOrder.length-1]);
  });
}

//***************************************************
// TabBarItemController
//
function TabBarItemController($scope , $element, $rootScope) {
  $scope.tabId = $scope.$parent.navTabItem.id;

  // When the tab is created, make sure it is displayed.
  $($element).find('a').tab('show');
  $rootScope.$broadcast("showMainWindow", $scope.tabId);

  $scope.$on("activateTabForWindow", function(event, showWindowId) {
    if($scope.tabId == showWindowId) {
      $($element).find('a').click();
    }
  });

  $($element).click(function(e) {
    $rootScope.$broadcast("showMainWindow", $scope.tabId);
  });

  $($element).find('div').click(function(e) {
    $rootScope.$broadcast("closeMainWindow", $scope.tabId);
    $scope.$parent.removeChildTab($($element), $scope.tabId);
  });
}
