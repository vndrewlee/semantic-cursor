// // server.js
// // where your node app starts

// // init project
// const express = require("express");
// const app = express();

// var server = require('http').Server(app);
// var io = require('socket.io')(server);

// var currentTarget = false;

// app.use(express.static("public"));

// // http://expressjs.com/en/starter/basic-routing.html
// app.get("/", function(request, response) {
//   response.sendFile(__dirname + "/views/index.html");
// });

// // listen for requests :)
// const listener = app.listen(process.env.PORT, function() {
//   console.log("Your app is listening on port " + listener.address().port);
// });

// io.on('connection', function(socket){
//   console.log('new client');
//   socket.emit('currentTarget', currentTarget);
// });

var express = require("express");
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static("public"));

var currentTarget = false;

app.get('/', function(req, res){
  res.sendFile(__dirname + "/views/index.html");
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('currentTarget', currentTarget);
});

const listener = http.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});