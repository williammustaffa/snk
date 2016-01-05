var myId = Math.random().toString(36).substr(2, 16);

var socket = io();
function snk() {
  /* set canvas */
  var overlap, hud, canvas, ctx, instances, o_player, o_food, xx, yy, direction, pieces, game, score, currentDir, gradient;
  game = {width: 480, height: 640, background: "#2c3e50", contrast: "#9b59b6"}; //9EAD86
  view = {width: 640, height: 640};

  hud = document.getElementById("hud");
  console.log(hud);
  hud.setAttribute("style", "background: "+ game.background+ "; width: "+ view.width +"px; height:"+ view.height+"px");

  canvas = document.getElementById('canvas');
  canvas.setAttribute("width", game.width);
  canvas.setAttribute("height", game.height);
  canvas.setAttribute("style", "border: 4px solid "+game.contrast+";");
  ctx = canvas.getContext('2d');

  /* instance */
  instances = [];
  function Instance(x, y, type) {
    this.id = 0;
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.type = type;
    this.alpha = 1;
    this.pieces = [];
    this.timer = {total: 60, count: 0};
    this.getInfo = function() {
      var newO = [];
      for(ii=0; ii<this.pieces.length; ii++) {
        newO.push({
          x: this.pieces[ii].x,
          y: this.pieces[ii].y
        });
      }
      return {
        id: this.id,
        x: this.x,
        y: this.y,
        pieces: newO
      };
    }
    this.draw_brick = function() {
      ctx.fillStyle=game.contrast;
      ctx.fillRect(this.x, this.y, 32, 32);
      ctx.fillStyle=game.background;
      ctx.fillRect(this.x+4, this.y+4, 24, 24);
      ctx.fillStyle=game.contrast;
      ctx.fillRect(this.x+8, this.y+8, 16, 16);
    }
    this.step = function() {};
    this.draw = function() {};
    this.collision = collision;
    this.destroy = function() {
      var index = instances.indexOf(this);
      instances.splice(index, 1);
    }
    instances.push(this);
    return this;
  }
  function collision(x, y) {
    var me = this;
    var isCollision = false;
    instances.forEach(function(o) {
      var Collision =!((me.x+me.width+x<=o.x) || (me.x+x>=o.x+o.width) || (me.y+y+me.height<=o.y) || (me.y+y>=o.y+o.height));
      if (Collision == true && me != o){
          isCollision = o;
          console.log(me);
          console.log(o);
      }
    });
    return isCollision;
  }

  /* getting players */
  socket.on('set_instances', function(data) {
    console.log(data);
    data.forEach(function(obj, index) {
      new_piece = new Instance(obj.x, obj.y, "other");
      new_piece.draw = function() {
        this.draw_brick();
      }
      new_piece.id = obj.id;
      console.log(instances);
    });
  });
  socket.on('add_new_player', function(data) {
    if (data.id !=o_player.id) {
      new_piece = new Instance(data.x, data.y, "other");
      new_piece.draw = function() {
        this.draw_brick();
      }
      new_piece.id = data.id;
    }
  });
  socket.on('remove_player', function(data) {
    instances.forEach(function(obj, index) {
      if (data == obj.id) {
        console.log(data);
        instances.splice(index, 1);
      }
    });
  });
  /* brick drawing */
  function start() {
    /* load otherplayers */
    /* ==============player=========== */
    xx = Math.round((game.width/2)/32)*32-32;
    yy = Math.round((game.height/2)/32)*32;
    o_player = new Instance(xx , yy, "player");
    o_player.pieces = [o_player];
    score = 0;
    /* send to server your info */
    var me = o_player.getInfo();
    console.log(me);
    socket.emit("add_player", me);
    socket.on("welcome_id", function(data) {
      o_player.id = data;
    });
    window.addEventListener("keydown", function(e) {
      var x = e.which || e.keyCode;
      if (o_player.pieces.length == 1) {
        switch(x) {
          case 37:
            direction = "left";
          break;
          case 38:
            direction = "up";
          break;
          case 39:
            direction = "right";
          break;
          case 40:
            direction = "down";
          break;
        }
      } else {
        switch(x) {
          case 37:
            if (currentDir != "right") direction = "left";
          break;
          case 38:
            if (currentDir != "down") direction = "up";
          break;
          case 39:
            if (currentDir != "left") direction = "right";
          break;
          case 40:
            if (currentDir != "up") direction = "down";
          break;
        }
      }
      e.preventDefault();
    })
    o_player.step = function () {
      this.timer.count --;
      if (this.timer.count<0) {2;
        /* mooving */
        for (i=this.pieces.length-1; i>0; i--) {
          this.pieces[i].x = this.pieces[i-1].x;
          this.pieces[i].y = this.pieces[i-1].y;
        }
        currentDir = direction;
        if ((this.x == 0 && direction == "left") ||
            (this.x+this.width == game.width && direction == "right") ||
            (this.y == 0 && direction == "up") ||
            (this.y+this.height == game.height && direction == "down") ) {
          //gameOver();
            direction = null;
        }
        if (direction == "up") this.y -= 32;
        if (direction == "down") this.y += 32;
        if (direction == "left") this.x -= 32;
        if (direction == "right") this.x += 32;
        /* reset */
        var myCollision = this.collision(0, 0);
        if (myCollision != false) {
          if (myCollision.type == "food") {
            var onx = Math.round(Math.random()*(game.width-32)/32)*32;
            var ony = Math.round(Math.random()*(game.height-32)/32)*32;
            while (myCollision.collision(onx, ony) != false) {
              onx = Math.round(Math.random()*(game.width-32)/32)*32;
              ony = Math.round(Math.random()*(game.height-32)/32)*32;
            };
            myCollision.x = onx;
            myCollision.y = ony;
            var lastPiece = this.pieces[this.pieces.length-1];
            new_piece = new Instance(lastPiece.x, lastPiece.y, "body");
            new_piece.draw = function() {
              this.draw_brick();
            }
            this.pieces.push(new_piece);
            if (this.timer.total > 5) this.timer.total --;
            score ++;
          }
          if (myCollision.type == "body") {
            gameOver();
          }
        }
        this.timer.count = this.timer.total;
      }
    }
    o_player.draw = function() {
      this.draw_brick()
    }

    // /* ============bullet spawner========== */
    // xx = Math.round(Math.random()*(game.width-32)/32)*32;
    // yy = Math.round(Math.random()*(game.height-32)/32)*32;
    // o_food = new Instance(xx, yy, "food");
    // o_food.draw = function() {
    //   this.alpha += 0.05;
    //   function f(val) {
    //     return (((Math.sin(val)+1.4)/2)-0.2);
    //   }
    //   ctx.globalAlpha = f(this.alpha);
    //   this.draw_brick();
    //   ctx.globalAlpha = 1;
    // }
    socket.on('receive_update', function(data) {
      console.log(data);
      instances.forEach(function(obj, ind) {
        if (obj.id == data.id && obj.id != o_player.id) {
          obj.x = data.x;
          obj.y = data.y;
        }
      });
    });
  }
  /* game step */
  function step() {
    instances.forEach(function(o) {
      o.step();
    });
    socket.emit("update_player", o_player.getInfo());
  }
  function draw() {
    instances.forEach(function(o) {
      o.draw();
    });
  }
  /* game over */
  function gameOver() {

  };
  /* game loop */
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    step();
    draw();
    ctx.fillStyle="#FFFFFF";
    ctx.globalAlpha = 1;
  }
  /* do the loop */
  start();
  socket.on("doLoop", loop);

};
snk();
