/**********************************************************************

File     : web-services.js
Project  : N Simulator Library
Purpose  : Source file for the web service access and control object.
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

  //*********************
  //* N.NWS.WebServices *
  //*********************

/**
 * The main database class.
 * @class N.NWS.WebServices
 * @constructor
 * @param {String} name
 * @param {String} shortName
 */
N.NWS.WebServices = function() {
  this.className  = 'N.NWS.WebServices';
  this.databases = [];
  this.databasesByUrl = {};
}

/**
 * Returns the associated database.
 * @method getDatabase
 * @returns {{status: boolean, description: string}}
 */
N.NWS.WebServices.prototype.getDatabase = function(url) {
  if(this.databasesByUrl[url]) {
    return this.databasesByUrl[url];
  }
  var database = new N.NWS.Database();
  var urlAndName = this.urlAndNameFromFullUrl(url);
  return this.addDatabaseToList(urlAndName.url, urlAndName.name);
}

N.NWS.WebServices.prototype.urlAndNameFromFullUrl = function(fullUrl) {
  var i = fullUrl.lastIndexOf('/');
  var url = fullUrl.substring(0, i+1);
  var name = fullUrl.substring(i+1);
  return { url: url, name: name };
}

/**
 * Creates a new database and adds it to the databases list.
 * @method createDatabase
 * @returns {Q.promise}
 */
N.NWS.WebServices.prototype.createDatabase = function(url, name, description, userInfo) {
  var deferred = Q.defer();
  var database =  new N.NWS.Database();
  var _this = this;
  database.create(url, name, description, userInfo).then(
    function() {
      _this.databases.push(database);
      _this.databasesByUrl[database.url+database.name] = database;
      deferred.resolve(database);
    }, function(status) {
      deferred.reject(status);
    }
  ).catch(N.reportQError);
  return deferred.promise;
}

/**
 * Returns the minimum and maximum values in the signal.
 * @method deleteDatabase
 * @returns {{status: boolean, description: string}}
 */
N.NWS.WebServices.prototype.deleteDatabase = function(url, name) {
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
        deferred.resolve( { status: true, description: '' } );
      } else {
        deferred.reject( { status: false, description: error.responseJSON.reason } );
      }
    },
    function(error) {
      deferred.reject( { status: false, description: error.responseJSON.reason } );
    }
  ).catch(N.reportQError);
  return deferred.promise;
}

/**
 * Returns the minimum and maximum values in the signal.
 * @method canConnectToDB
 * @returns {{canAccess: Boolean, description: String}}
 */
N.NWS.WebServices.canConnectToDB = function(dbUrl) {
  var deferred = Q.defer();

  var http =  new N.Http();
  http.get(dbUrl).then(
    function(data) {
      if(data.hasOwnProperty('couchdb')) {
        deferred.resolve( { canAccess: true, description: '' } );
      } else {
        deferred.reject( { canAccess: false, description: 'Url is reachable but is not a CouchDB' } );
      }
    },
    function(error) {
      deferred.reject( { canAccess: false, description: error } );
    }
  ).catch(N.reportQError);
  return deferred.promise;
}

N.NWS.WebServices.prototype.loadDatabasesFromLocalStorage = function() {
  this.databases = [];
  this.databasesByUrl = {};

  var databasesJson = localStorage['n.databases'];
  var databases = _.isEmpty(databasesJson) ? []:  JSON.parse(databasesJson);
  for(var i in databases) {
    var data = databases[i];
    this.addDatabaseToList(data.url, data.name, data.description);
  }
}

N.NWS.WebServices.prototype.reloadDatabasesFromLocalStorage = function() {
  var storedDatabasesJson = localStorage['n.databases'];
  var storedDatabases = _.isEmpty(storedDatabasesJson) ? []:  JSON.parse(storedDatabasesJson);

  for(var i in storedDatabases) {
    var stored = storedDatabases[i];
    if(!this.databasesByUrl[stored.url+stored.name]) {
      this.addDatabaseToList(stored.url, stored.name, stored.description);
    }
  }
}

N.NWS.WebServices.prototype.writeDatabasesToLocalStorage = function() {
  this.reloadDatabasesFromLocalStorage();
  var inMemoryDatabases = _.map(this.databases, function(db) { return _.pick(db, ['url', 'name', 'description']); });
  localStorage['n.databases'] = JSON.stringify(inMemoryDatabases);
}

N.NWS.WebServices.prototype.addDatabaseToList = function(url, name, description) {
  var database = new N.NWS.Database();
  database.load(url, name, description);
  this.databases.push(database);
  this.databasesByUrl[database.url+database.name] = database;
  return database;
}

N.NWS.WebServices.Load = function() {
  if(!N.NWS.services) {
    N.NWS.services = new N.NWS.WebServices();
    N.NWS.services.loadDatabasesFromLocalStorage();
  }
}
