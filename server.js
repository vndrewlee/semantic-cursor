var express = require("express");
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const listener = http.listen(process.env.PORT);

app.use(express.static("public"));

var state = {
  target: false,
  cursor: false,
  history: []
};

var history = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + "/views/index.html");
});

app.get('/done', function(req, res){
  res.sendFile(__dirname + "/views/done.html");
});

io.on('connection', socket => {
  
  console.log('a user connected');
  
  socket.on('newCursor', data => {
    state.cursor = data;
    state.history.push(data);
    console.log(state);
    io.emit('state', state);
  });
  
  socket.on('newTarget', data => {
    state.target = data;
    console.log(state);
    io.emit('state', state);
  });
  
});

app.get("/state", function(request, response) {
  response.send(state);
});

app.get("/history", function(request, response) {
  response.send({history: history});
});