/**********************************************************************

File     : database.js
Project  : N Simulator Library
Purpose  : Source file for an N database object.
Revisions: Original definition by Lawrence Gunn.
           2014/08/24

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};
N.NWS = N.NWS || {};

/**
 * A database object.
 * @class N.WS.Database
 * @constructor
 */
N.NWS.Database = function() {
  this.url = '';
  this.name = '';
  this.description = '';
  this.databaseDoc = {};
  this.status = 'uninitialized';
  this.accessible = false;
}

/**
 * Creates and initializes a database.
 * @method create
 * @returns {{status: boolean, description: string}}
 */
N.NWS.Database.prototype.create = function(url, name, description, userInfo) {
  this.url = url;
  if(url.lastIndexOf('/') !== url.length-1) {
    this.url += '/';
  }

  this.name = name;
  this.description = description;

  var deferred = Q.defer();
  var _this = this;

  var http =  new N.Http();
  http.put(this.url+this.name).then(
    function(data) {
      if(data.ok === true) {
        var doc = {
          // _id: 'n_simulator',
          revision: 'v1.0.0',
          creator: userInfo.firstName+' '+userInfo.lastName,
          name: name,
          description: description
        };

        var httpDoc = new N.Http();
        httpDoc.put(_this.url+_this.name+'/n_simulator', doc).then(
          function() {
            _this.accessible = true;

            var initializer = new N.NWS.InitialData();
            initializer.writeToDb(_this).then(
              function() {
                deferred.resolve( { status: true, description: '' } );
              }, function(status) {
                deferred.reject(status);
              }
            ).catch(N.reportQError);
          },
          function(error) {
            deferred.reject( { status: false, description: 'Unable to write indentifier doc: '+error.responseJSON.reason } );
          }
        ).catch(N.reportQError);
      } else {
        deferred.reject( { status: false, description: '' } );
      }
    },
    function(error) {
      deferred.reject( { status: false, description: error.responseJSON.reason } );
    }
  ).catch(N.reportQError);
  return deferred.promise;
}

N.NWS.Database.prototype.load = function(url, name, description) {
  var deferred = Q.defer();
  var _this = this;

  this.url = url;
  if(url.lastIndexOf('/') !== url.length-1) {
    this.url += '/';
  }
  this.name = name;
  this.description = description;
  this.status = 'not-connected';

  N.NWS.WebServices.canConnectToDB(url).then(
    function() {
      _this.readDocumentById('n_simulator').then(
        function(data) {
          _this.accessible = true;
        }, function(status) {
          deferred.reject(status);
        }
      ).catch(N.reportQError);
    }, function(status) {
      deferred.reject(status);
    }
  ).catch(N.reportQError);
  return deferred.promise;
}

N.NWS.Database.prototype.writeDocument = function(docId, document) {
  var deferred = Q.defer();
  var http = new N.Http();
  http.put(this.url+this.name+'/'+docId, document).then(
    function(data) {
      deferred.resolve(data);
    }, function(status) {
      deferred.reject(status);
    }
  ).catch(N.reportQError);
  return deferred.promise;
}

N.NWS.Database.prototype.readDocumentById = function(docId) {
  var deferred = Q.defer();
  var http = new N.Http();
  http.get(this.url+this.name+'/'+docId).then(
    function(data) {
      deferred.resolve(data);
    }, function(status) {
      deferred.reject(status);
    }
  ).catch(N.reportQError);
  return deferred.promise;
}
