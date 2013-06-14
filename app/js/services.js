'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1');


var app = angular.module('myApp', []);

//***************************************************
// guidGenerator
//   Creates a guid in string form.
//
app.service("guidGenerator", function() {
  this.CreateUUID = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
});

//***************************************************
// POST waveform
// args:
//   * id: GUID as string, with -'s but no {}
//   * name: must be non-zero length
//   * waveform: valid JSON waveform as string
//
app.service('postNewWaveform', function($http) {

  var postNewWaveform = {
    doPost: function(id, name, waveform) {
      // $http returns a promise, which has a then function, which also returns a promise.
      var url = "http://nexuslogica.com/N/svr/waveform?callback=JSON_CALLBACK";
      var data = "id="+ encodeURIComponent(id) + "&name=" + encodeURIComponent(name) + "&waveform=" + encodeURIComponent(waveform);
      var callData = {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded"},
        cache: false
      };

      var promise = $http.post(url, data, callData).then(function (response) {
        // The then function here is an opportunity to modify the response
        console.log(response);
        // The return value gets picked up by the then in the controller.
        return response.data;
      });

      // Return the promise to the controller
      return promise;

    }

  };
  return postNewWaveform;
});

//***************************************************
// GET waveforms
//
app.service('getWaveforms', function($http) {

  var getWaveforms = {
    doGet: function() {
      // $http returns a promise, which has a then function, which also returns a promise.
      var url = "http://nexuslogica.com/N/svr/waveforms?callback=JSON_CALLBACK";
      var callData = {
        cache: false
      };

      var promise = $http.jsonp(url, callData).then(function (response) {
        // The then function here is an opportunity to modify the response
        console.log(response);
        // The return value gets picked up by the then in the controller.
        return response.data;
      });

      // Return the promise to the controller
      return promise;

    }

  };
  return getWaveforms;
});

//***************************************************
// GET waveform
//
app.service('getWaveform', function($http) {

  var getWaveform = {
    doGet: function(id) {
      // $http returns a promise, which has a then function, which also returns a promise.
      var url = "http://nexuslogica.com/N/svr/waveform?id="+encodeURIComponent(id)+"&callback=JSON_CALLBACK";
      var callData = {
        cache: false
      };

      var promise = $http.jsonp(url, callData).then(function (response) {
        // The then function here is an opportunity to modify the response
        console.log(response);
        // The return value gets picked up by the then in the controller.
        return response.data;
      });

      // Return the promise to the controller
      return promise;

    }

  };
  return getWaveform;
});

//***************************************************
// DELETE waveform
//
app.service('deleteWaveform', function($http) {

  var deleteWaveform = {
    doDelete: function(id) {
        // $http returns a promise, which has a then function, which also returns a promise.
        var urlToCall = "http://nexuslogica.com/N/svr/waveform?id="+encodeURIComponent(id)+"&callback=JSON_CALLBACK";
        var callData = {
          url: urlToCall,
          method: "DELETE",
          headers: { "Content-Type": "application/javascript"},
          cache: false
        };

        var promise = $http(callData).then(function (response) {
          // The then function here is an opportunity to modify the response
          console.log(response);
          // The return value gets picked up by the then in the controller.
          return response.data;
        });

        // Return the promise to the controller
        return promise;

      }

  };
  return deleteWaveform;
});


//***************************************************
// jQuery extensions
//
jQuery.fn.center = function () {
  this.css("position","absolute");
  this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
      $(window).scrollTop()) + "px");
  this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
      $(window).scrollLeft()) + "px");
  return this;
}
