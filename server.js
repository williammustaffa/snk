var express = require('express'), app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use("/fonts", express.static(__dirname + '/fonts'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/app.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

/* server */
var players = [];
io.on('connection', function(socket){
  socket.on('add_player', function(socket){
    io.emit("player_added", socket);
  });
  console.log(players);
  /* timer sync */
  setInterval( function() {
    io.emit("doLoop", players);
  }, 1000/30);
});
