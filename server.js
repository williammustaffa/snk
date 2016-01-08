/******************************
********  SERVER CONFIG *******
******************************/
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use("/fonts", express.static(__dirname + '/fonts'));
app.use("/images", express.static(__dirname + '/images'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/app.html');
});

var gameport = process.env.PORT || 3000;

http.listen(gameport, function(){
  console.log('listening on: '+ gameport);
});
/******************************
*********** FUCNTIONS *********
******************************/
function set_grid(position, size) {
  return Math.round((position)/size)*size;
};
function degtorad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180.0;
}
/******************************
************* GAME ************
******************************/
// constants
var PLAYER = "player";
var FOOD = "food";
var GRID = 16;
var MEALS = 7;
var INITIAL_COUNTER = 10;
var game = {width: 640, height: 640 , grid: GRID, food: [], players: []}; //9EAD86
function add_food() {
  game.food.push({
    id: false,
    type: FOOD,
    color: "#FFFFFF",
    pieces: [{
      x: set_grid(Math.random()*(game.width-GRID), GRID),
      y: set_grid(Math.random()*(game.height-GRID), GRID)
    }]
  });
}

for(i=0; i<MEALS;i++) {
  add_food();
}
io.on('connection', function(socket){
  var user_id = false;
  /* add player */
  function add_player(data) {
    var xpos, ypos;
    xpos = set_grid(game.width/2, GRID);
    ypos = set_grid(game.height/2, GRID);
    while (!place_free(xpos, ypos)) {
      xpos = set_grid(Math.random()*(game.width-GRID), GRID);
      ypos = set_grid(Math.random()*(game.height-GRID), GRID);
    }
    var nPlayer = {
      id: (new Date()).getTime(),
      color: data.color,
      score: 0,
      type: PLAYER,
      speed: 1,
      timer: {total: INITIAL_COUNTER, count: INITIAL_COUNTER},
      name: data.name,
      direction: false,
      new_dir: false,
      dirX: 0,
      dirY: 0,
      pieces: [{
        x: xpos,
        y: ypos,
        nextX: xpos,
        nextY: ypos
      }]
    };
    user_id = nPlayer.id;
    game.players.push(nPlayer);
    console.log("[Player connected]", nPlayer.name)
    socket.emit("add_player", nPlayer);
    update_score();
  }
  /* send the game info */
  function game_request() {
    socket.emit("game_request", game);
  }
  function move_request(pack) {
    for(i=0;i<game.players.length;i++) {
      if (game.players[i].id === pack.index) {
        var limit = Math.abs(game.players[i].direction - pack.direction);
        if ((limit <= 90 || limit >= 270 || game.players[i].direction === false) || game.players[i].pieces.length == 1) {
          var o_player = game.players[i];
          o_player.new_dir = pack.direction;
        }
      }
    }
  }
  /* on user disconnect */
  function disconnect() {
    game_over(user_id);
    update_score();
  }
  /* socket manager */
  socket.on('add_player', add_player);
  socket.on('move_request', move_request);
  socket.on('game_request', game_request);
  socket.on('disconnect', disconnect);
  socket.on('update_score', update_score);
});
/* score request */
function update_score() {
  var scoreList = [];
  game.players.forEach(function(obj) {
    scoreList.push({
      name: obj.name,
      score: obj.score
    });
  });
  scoreList.sort(function(a, b) {
    return parseFloat(b.score) - parseFloat(a.score);
  });
  io.emit('update_score', scoreList);
}
/* place free general function */
function place_free(x, y) {
  var hasCol = true;
  var allObjects = game.players.concat(game.food);
  allObjects.forEach(function(instance) {
    instance.pieces.forEach(function(piece, ind) {
      var collision = !((x+GRID<=piece.x) || (x>=piece.x+GRID) || (y+GRID<=piece.y) || (y>=piece.y+GRID));
      if (collision) {
        hasCol = false;
      }
    });
  });
  return hasCol;
}
/* collision function */
function collision(obj, x, y, callback) {
  var isCollision = false;
  var allObjects = game.players.concat(game.food);
  var me = obj.pieces[0];
  allObjects.forEach(function(instance) {
    instance.pieces.forEach(function(piece, ind) {
      if (!(ind == 0 && instance.id === obj.id)) {
        var collision = !((me.x+GRID+x<=piece.x) || (me.x+x>=piece.x+GRID) || (me.y+y+GRID<=piece.y) || (me.y+y>=piece.y+GRID));
        if (collision) {
          callback(piece, instance);
        }
      }
    });
  });
  return isCollision;
}
function game_over(user_id) {
  if (user_id!==false) {
    for(i=0;i<game.players.length;i++) {
      if (game.players[i].id === user_id) {
        console.log("[Player disconnected]", game.players[i].name);
        io.emit("player_died", user_id);
        game.players.splice(i, 1);
      }
    }
  }
}
function move_players() {
  game.players.forEach(function(instance) {
    var obj = instance.pieces[0];
    if (instance.timer.count<=0) {
      instance.direction = instance.new_dir;
      instance.dirX =  Math.round(Math.cos(degtorad(instance.new_dir)))*GRID;
      instance.dirY = -Math.round(Math.sin(degtorad(instance.new_dir)))*GRID;
      /* only update direction on step */
      collision(instance, instance.dirX, instance.dirY, function(other, parent) {
        if (parent.type == FOOD) {
          var xpos, ypos;
          xpos = set_grid(Math.random()*(game.width-GRID), GRID);
          ypos = set_grid(Math.random()*(game.height-GRID), GRID);
          while (!place_free(xpos, ypos)) {
            xpos = set_grid(Math.random()*(game.width-GRID), GRID);
            ypos = set_grid(Math.random()*(game.height-GRID), GRID);
          }
          other.x = xpos;
          other.y = ypos;
          instance.pieces.push({x: obj.x, y: obj.y});
          instance.score += 4;
           if (instance.timer.total > 1) instance.timer.total -= 0.25; else instance.timer.total = 1;
          update_score();
        }
        if (parent.type == PLAYER) {
          console.log("Collided with player", parent.name, "on direction", instance.direction);
          game_over(instance.id);
        }
      });
      for (i=instance.pieces.length-1; i>0; i--) {
        instance.pieces[i].x = instance.pieces[i-1].x;
        instance.pieces[i].y = instance.pieces[i-1].y;
      }
      if ((instance.direction === 90 && obj.y <= 0) || (instance.direction === 270 && obj.y+GRID >= game.height) || (instance.direction === 180 && obj.x <= 0) || (instance.direction === 0 && obj.x+GRID >= game.width)) {
        game_over(instance.id);
      }
      if (instance.direction !== false) {
        obj.x += instance.speed * instance.dirX;
        obj.y += instance.speed * instance.dirY;
      }
      instance.timer.count = instance.timer.total;
    } else {
      instance.timer.count -= 1;
    }
    // obj.x += (obj.x - obj.nextX) /5;
    // obj.y += (obj.y - obj.nextY) /5;
  });
}
function update() {
  move_players();
  io.emit("update", game);
}
/* require loop */
//var loop = require("./loop");
setInterval(update, 1000/30);
