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
  var clientId = 0;
  socket.emit('set_instances', players);
  socket.on('add_player', function(data){
    /* add player to array and sent its id */
    var index = players.push(data)-1;
    data.id = index;
    socket.emit("welcome_id", index);
    io.emit('add_new_player', data);
    clientId = index;
  });
  socket.on('update_player', function(data) {
    players[data.id] = data;
    io.emit('receive_update', data);
  });
  socket.on('disconnect', function() {
    console.log('Got disconnect!');
    io.emit('remove_player', clientId);
    players.splice(clientId, 1);
  });
});
