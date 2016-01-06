/******************************
********  SERVER CONFIG *******
******************************/
var express = require('express'), app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use("/fonts", express.static(__dirname + '/fonts'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/app.html');
});

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('listening on *: '+ port);
});
/******************************
*********** FUCNTIONS *********
******************************/

function set_grid(position, size) {
  return Math.round((position)/size)*size;
};
/******************************
************* GAME ************
******************************/
// constants
var PLAYER = "player";
var FOOD = "food";
var game = {width: 480, height: 640 , players: []}; //9EAD86
io.on('connection', function(socket){
  var user_id = false;
  /* add player */
  function add_player(data) {
    var nPlayer = {
      id: game.players.length,
      color: data.color,
      name: data.name,
      direction: false,
      pieces: [{
        x: set_grid(game.width/2, 32),
        y: set_grid(game.height/2, 32)
      }]
    };
    user_id = nPlayer.id;
    game.players.push(nPlayer);
    console.log("[Player connected]", nPlayer.name)
    socket.emit("add_player", nPlayer);
  }
  function check_collision(player, type) {

  }
  /* send the game info */
  function game_request() {
    socket.emit("game_request", game);
  }
  function move_request(pack) {
    for(i=0;i<game.players.length;i++) {
      if (game.players[i].id == pack.index) {
        game.players[i].direction = pack.direction;
      }
    }
  }
  /* on user disconnect */
  function disconnect() {
    if (user_id!==false) {
      for(i=0;i<game.players.length;i++) {
        if (game.players[i].id == user_id) {
          console.log("[Player disconnected]", game.players[i].name);
          game.players.splice(i, 1);
        }
      }
    }
  }
  /* socket manager */
  socket.on('add_player', add_player);
  socket.on('move_request', move_request);
  socket.on('game_request', game_request);
  socket.on('disconnect', disconnect);
});
function move_players() {
  game.players.forEach(function(instance) {
    var obj = instance.pieces[0];
    for (i=instance.pieces.length-1; i>0; i--) {
      instance.pieces[i].x = instance.pieces[i-1].x;
      instance.pieces[i].y = instance.pieces[i-1].y;
    }
    if (instance.direction == "up" && obj.y > 0 ) obj.y -= 32;
    if (instance.direction == "down" && obj.y+32 < game.height) obj.y += 32;
    if (instance.direction == "left" && obj.x > 0) obj.x -= 32;
    if (instance.direction == "right" && obj.x+32 < game.width) obj.x += 32;
  });
}
function update() {
  move_players();
  io.emit("update", game);
}
setInterval(update, 1000);
