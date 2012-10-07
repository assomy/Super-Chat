/**
 * Module dependencies.
 */
var express = require('express'), 
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
  io = require('socket.io');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8888);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname,'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

var server = http.createServer(app);

var socket = io.listen( server );
var users = [];

/**
 *  cross-browser forEach Shim.
 *  
 *  @param {Array} array - An array object
 *  @param {Function} callback - A callback to work on the array
 */
function forEach (array, callback) {
  for (var i = 0; i < array.length; i++) {
    callback(array[i], i)
  }
}

// listen for any messages from the client on the home page and broadcast them to all users.
socket.sockets.on("connection", function( client ) {
    // Push everybody who connects to this server to this array.
    users.push(client);

    // on the client, am emitting the coordinate of where the user started drawing
    // therefore, take that coordinate and emit it to other clients.
    client.on('begin', function(obj) {
      forEach(users, function(user) {
        if (user != client) {
          user.emit('beginDrawingAt', { x: obj.x, y: obj.y });
        }
      });     
    });
    
    // on the client, am emitting the coordinate of where the user has moved to
    // therefore, take that coordinate and emit it to other clients.
    client.on('drawing', function(obj) {
      forEach(users, function(user) {
        if (user != client) {
          user.emit('drawTo', { x: obj.x, y: obj.y });
        }
      });
    });

  // When the user disconnects or closes the browser, then remove them from the list of
  // connected users.
   client.on('disconnect', function () {
      forEach(users, function(user) {
         if (user === client) {
            users.splice(users.indexOf(user), 1);
         }
      });
   });
})

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});