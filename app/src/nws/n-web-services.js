/**********************************************************************

File     : n-web-services.js
Project  : N Simulator Library
Purpose  : Source file for the database access and control object.
Revisions: Original definition by Lawrence Gunn.
           2014/08/12

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

  //******************
  //* N.NWS.Database *
  //******************

/**
 * The main database class.
 * @class N.NWS.Database
 * @constructor
 * @param {String} name
 * @param {String} shortName
 */

N.NWS.Database = function() {
  this.ClassName  = 'N.NWS.Database';
}

/**
 * Returns the minimum and maximum values in the signal.
 * @method createDatabase
 * @returns {{status: boolean, errMsg: string}}
 */
N.NWS.Database.prototype.createDatabase = function(url, name, description, userInfo) {
  var http =  new N.Http();
  var dbUrl = url;
  if(url.lastIndexOf('/') !== url.length-1) {
    dbUrl += '/';
  }
  dbUrl += name;

  var deferred = Q.defer();
  http.put(dbUrl).then(
    function(data) {
      if(data.ok === true) {
        var doc = {
//          _id: 'pi_neural_simulator',
          revision: 'v1.0.0',
          creator: userInfo.firstName+' '+userInfo.lastName,
          name: name,
          description: description
        };

        var httpDoc = new N.Http();
        httpDoc.put(dbUrl+'/pi_neural_simulator', doc).then(
          function() {
            deferred.resolve( { status: true, errMsg: '' } );
          },
          function(error) {
            deferred.reject( { status: false, errMsg: 'Unable to write indentifier doc: '+error.responseJSON.reason } );
          }
        );
      } else {
        deferred.reject( { status: false, errMsg: '' } );
      }
    },
    function(error) {
      deferred.reject( { status: false, errMsg: error.responseJSON.reason } );
    }
  );
  return deferred.promise;
}

/**
 * Returns the minimum and maximum values in the signal.
 * @method deleteDatabase
 * @returns {{status: boolean, errMsg: string}}
 */
N.NWS.Database.prototype.deleteDatabase = function(url, name) {
  var http =  new N.Http();
  var dbUrl = url;
  if(url.lastIndexOf('/') !== url.length-1) {
    dbUrl += '/';
  }
  dbUrl += name;

  var deferred = Q.defer();
  http.delete(dbUrl).then(
    function(data) {
      if(data.ok === true) {
        deferred.resolve( { status: true, errMsg: '' } );
      } else {
        deferred.reject( { status: false, errMsg: error.responseJSON.reason } );
      }
    },
    function(error) {
      deferred.reject( { status: false, errMsg: error.responseJSON.reason } );
    }
  );
  return deferred.promise;
}

/**
 * Returns the minimum and maximum values in the signal.
 * @method canConnectToDB
 * @returns {{canAccess: Boolean, errMsg: String}}
 */
N.NWS.Database.prototype.canConnectToDB = function(dbUrl) {
  var deferred = Q.defer();

  var http =  new N.Http();
  http.get(dbUrl).then(
    function(data) {
      if(data.hasOwnProperty('couchdb')) {
        deferred.resolve( { canAccess: true, errMsg: '' } );
      } else {
        deferred.reject( { canAccess: false, errMsg: 'Url is reachable but is not a CouchDB' } );
      }
    },
    function(error) {
      deferred.reject( { canAccess: false, errMsg: error } );
    }
  );
  return deferred.promise;
}
