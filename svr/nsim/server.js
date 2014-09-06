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

// Require nodejs's http module.
var http = require('http');

http.createServer(function(req, res) {

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello world, from NodeJitsu</h1>');
  res.end();

}).listen(8080);