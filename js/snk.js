function hide_loading() {
  $("#loading, #modal-overlay").fadeOut(500);
}
function show_loading() {
  $("#loading, #modal-overlay").fadeIn(500);
}
function Snk() {
  this.running = false;

  var socket = io(), canvas, context, self = this;

  function set_canvas(data) {
    canvas = document.getElementById('snk-view');
    canvas.setAttribute("height", data.height);
    canvas.setAttribute("width", data.width);
    context = canvas.getContext("2d");
  }
  /* draw brick */
  function draw_brick(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x, y, 32, 32);
    context.fillStyle = "#2c3e50";
    context.fillRect(x+4, y+4, 24, 24);
    context.fillStyle = color;
    context.fillRect(x+8, y+8, 16, 16);
  }
  this.player = undefined;
  this.init = function(setup) {
    function add_player(data) {
      self.player = data;
      console.log(data);
    }
    function game_request(data) {
      console.log("Game request complete:", data);
      self.running = true;
      set_canvas(data);
      hide_loading();
      socket.emit("add_player", setup).on("add_player", add_player);
      console.log(self.player);
    }
    socket.emit("game_request").on("game_request", game_request);
  }
  /* will let user update game screen */
  function update(data) {
    if (self.running == true) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      data.players.forEach(function(instance) {
        instance.pieces.forEach(function(obj, ind){
          draw_brick(obj.x, obj.y, instance.color);
        });
      });
    }
  }
  function move_request(e) {
    if (self.running == true && self.player != undefined) {
      var key = e.which || e.keyCode || 0;
      var new_dir = false;
      switch(key) {
        case 37:
          new_dir = "left";
        break;
        case 38:
          new_dir = "up";
        break;
        case 39:
          new_dir = "right";
        break;
        case 40:
          new_dir = "down";
        break;
      }
      if (new_dir == false ) {
        return false;
      } else {
        var pack = {index: self.player.id, direction: new_dir}
        console.log(pack.index);
        socket.emit("move_request", pack);
      }
    }
  }
  window.addEventListener("keydown", move_request);
  socket.on("update", update);
}
