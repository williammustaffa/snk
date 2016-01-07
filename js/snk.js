function hide_loading() {
  $("#loading, #modal-overlay").fadeOut(500);
}
function show_loading() {
  $("#loading, #modal-overlay").fadeIn(500);
}
function Snk() {
  /* admin commands */
  this.running = false;

  var socket = io(), game_data, canvas, grid, viewport = {}, context, foodAlpha = 1, player = undefined, self = this;
  socket.emit("game_request").on("game_request", game_request);
  function set_canvas(data) {
    canvas = document.getElementById('snk-view');;
    canvas.setAttribute("height", data.height);
    canvas.setAttribute("width", data.width);
    context = canvas.getContext("2d");
  }
  /* draw brick */
  function draw_brick(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x, y, grid, grid);
    context.fillStyle = "#2c3e50";
    context.fillRect(x+grid/8, y+grid/8, grid-(grid/8*2), grid-(grid/8*2));
    context.fillStyle = color;
    context.fillRect(x+grid/4, y+grid/4, grid-(grid/4*2), grid-(grid/4*2));
  }
  this.init = function(setup) {
    function add_player(data) {
      player = data;
    }
    socket.emit("add_player", setup).on("add_player", add_player);
    hide_loading();
    socket.emit("update_score");
  }
  function game_request(data) {
    self.running = true;
    grid = data.grid;
    set_canvas(data);
    socket.emit("update_score");
  }
  /* check if your snake is dead, hehehe*/
  function check_death(id) {
    if (player != undefined && player.id === id) {
      $("#quick-play-modal, #modal-overlay").fadeIn();
    }
  }
  /* will let user update game screen */
  function update(data) {
    game_data = data;
  }
  function draw() {
    if (self.running == true && game_data != undefined) {
      var data = game_data;
      context.clearRect(0, 0, canvas.width, canvas.height);
      /* draw blocks */
      data.players.forEach(function(instance) {
        instance.pieces.forEach(function(obj, ind){
          draw_brick(obj.x, obj.y, instance.color);
        });
      });
      /* draw food */
      foodAlpha += 5;
      var alpha = Math.min(1,Math.abs(Math.sin(foodAlpha *Math.PI /180)));
      context.globalAlpha = alpha;
      data.food.forEach(function(instance) {
        instance.pieces.forEach(function(obj, ind){
          draw_brick(obj.x, obj.y, instance.color);
        });
      });
      context.globalAlpha = 1;
      /* draw name */
      context.globalAlpha = 0.5;
      data.players.forEach(function(instance) {
        instance.pieces.forEach(function(obj, ind){
          if (ind == 0) {
            context.fillStyle = "#000";
            context.font = '16px bebas_neueregular';
            context.textAlign = 'center';
            var width = context.measureText(instance.name).width+grid/2;
            context.fillRect(obj.x+grid/2-width/2, obj.y-16*2, width, 21);
            context.fillStyle = instance.color;
            context.fillText(instance.name, obj.x+grid/2, obj.y-16);
          }
        });
      });
      context.globalAlpha = 1;
    }
    window.requestAnimationFrame(draw);
  }
  function move_request(e) {
    if (self.running == true && player != undefined) {
      var key = e.which || e.keyCode || 0;
      var new_dir = false;
      switch(key) {
        case 37:
          new_dir = 180;
        break;
        case 38:
          new_dir = 90;
        break;
        case 39:
          new_dir = 0;
        break;
        case 40:
          new_dir = 270;
        break;
      }
      if (new_dir === false ) {
        return false;
      } else {
        var pack = {index: player.id, direction: new_dir}
        socket.emit("move_request", pack);
      }
    }
  }
  function update_score(data) {
    var container = $("#score ul");
    container.empty();
    data.forEach(function(obj, ind) {
      var newChild = $("<li />").addClass("list");
      var nameSpan = $("<span />").addClass("name").html((ind+1)+" - "+obj.name);
      var scoreSpan = $("<span />").addClass("score").html(obj.score);
      newChild.append(nameSpan).append(scoreSpan);
      container.append(newChild);
    });
  }
  window.addEventListener("keydown", move_request);
  window.requestAnimationFrame(draw);
  socket.on("player_died", check_death);
  socket.on("update_score", update_score);
  socket.on("update", update);
}
