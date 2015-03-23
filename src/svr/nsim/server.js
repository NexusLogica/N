/**********************************************************************

File     : server.js
Project  : N Simulator Library
Purpose  : Source file for a server file.
Revisions: Original definition by Lawrence Gunn.
           2014/09/05

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var express = require('express'),
  bodyParser = require('body-parser'),
  errorHandler = require('errorhandler'),
  methodOverride = require('method-override'),
  hostname = process.env.HOSTNAME || 'localhost',
  port = parseInt(process.env.PORT, 10) || 3021,
  fs = require('fs'),
  busboy = require('connect-busboy'),
  util = require('util'),
  //fs = require('fs-extra'),
  publicDir = process.argv[2] + '/public' || __dirname + '/public';

var app = express();
app.use(busboy());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/file/*', function (req, res) {
  var relativePath = req.originalUrl.substring(6);
  var fullPath = publicDir+'/'+relativePath;

  res.sendFile(fullPath, {}, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sending:' + fullPath);
    }
  });
});

var ignoreList = { '.DS_Store' : true };

var getDirectoryJson = function(directory) {

  var children = fs.readdirSync(directory);

  var filesJson = [];
  var dirsJson = [];
  for(var i=0; i<children.length; i++) {
    var name = children[i];
    if(!ignoreList[name]) {
      var childPath = directory+'/'+name;
      var stats = fs.statSync(childPath);
      if(stats.isFile()) {
        filesJson.push({ name: name, size: stats.size, modTime: stats.mtime });
      } else {
        var childTree = getDirectoryJson(childPath);
        childTree.name = name;
        dirsJson.push(childTree);
      }
    }
  }
  var tree = {
    directories: dirsJson,
    files: filesJson
  };
  return tree;
};

app.get('/files', function (req, res) {
  console.log('Files: request');
  var tree = getDirectoryJson(publicDir);
  res.status(200).json(tree);
});

app.get('/*', function (req, res) {
  console.log('Blocking: '+req.originalUrl);
  res.status(404).end();
});


app.post('/file/*', function(req, res) {
  var relativePath = req.originalUrl.substring(6);
  var fullPath = publicDir+'/'+relativePath;
  var directory = relativePath.substring(0, relativePath.lastIndexOf('/'));
  var dirs = directory.split('/');

  var dirToMake = publicDir;
  for(var i=0; i<dirs.length; i++) {
    dirToMake += '/'+dirs[i];
    try {
      fs.mkdirSync(dirToMake);
    } catch(e) {
      if ( e.code !== 'EEXIST' ) { throw e; }
    }
  }

  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
    console.log('Uploading: '+fullPath);

    // Path where image will be uploaded
    var fstream = fs.createWriteStream(fullPath);
    file.pipe(fstream);
    fstream.on('close', function () {
      res.status(200).json({ status: 'success' });
    });
  });
});


/***
 * @method PUT - Create a directory where the path is the URL path
 */
app.put('/file/*', function(req, res) {
  var relativePath = req.originalUrl.substring(6);
  var fullPath = publicDir+'/'+relativePath;
  var dirs = fullPath.split('/');

  console.log('Creating directory: '+fullPath);

  var dirToMake = publicDir;
  for(var i=0; i<dirs.length; i++) {
    dirToMake += '/'+dirs[i];
    try {
      fs.mkdirSync(dirToMake);
    } catch(e) {
      if ( e.code !== 'EEXIST' ) { throw e; }
    }
  }
  res.status(200).json({ status: 'success' });
});


//app.use(methodOverride());
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({
//  extended: true
//}));
//app.use('/file', express.static(publicDir));
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

console.log('N Simulator File System\n    Host: http://%s:%s\n    File Path: %s', hostname, port, publicDir);
app.listen(port, hostname);
