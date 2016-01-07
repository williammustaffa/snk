/******************************
*******  LOADING CONFIG  ******
******************************/
$("#loading").each(function() {
  var self = $(this), pos_top, pos_left;
  var adjustpos = function() {
    pos_top = $(window).height()/2-32;
    pos_left = $(window).width()/2-32;
    self.css({
      top: pos_top,
      left: pos_left
    });
  }
  adjustpos();
  $(window).on('resize', adjustpos);
});

$(function(){
  var snk = new Snk();
  /******************************
  ****   MODAL COLORS CONFIG ****
  ******************************/
  $("input[name='color']").each(function(indice) {
    var me = $(this);
    var label = $("<label />").attr("for", indice).css({
      background: me.val()
    }).addClass("transition");
    me.attr("id", indice);
    me.after(label);
    me.hide();
  });
  /******************************
  ****   MODAL COLORS END ******
  ****   SUBMIT FORM START *****
  ******************************/
  var canPlay = false;
  var name = "";
  $(document).on("keyup", "input#name", function() {
    var me = $(this);
    var button = $("a#play");
    name = me.val();
    if (name.match(/^[\w]+$/g)) {
      me.removeClass('disabled');
      canPlay = true;
    } else {
      if (!me.hasClass('disabled')) {
        me.addClass('disabled');
      }
      canPlay = false;
    }
  });
  $(document).on("click", ".no-clickable", function() {
    return false;
  });
  $(document).on("click", "#play, #restart", function() {
    if (canPlay == true ) {
      $("#join-modal, #quick-play-modal").addClass("no-clickable").fadeOut(1000);
      $("#loading").fadeIn();
      var c_value = $("input[name=color]:checked").val();
      /* sending data */
      var setup = {
        color: c_value,
        name: name
      };
      setTimeout(function() {
        snk.init(setup);
      }, 1000);
    } else {
      $("input#name").trigger("focus").addClass("disabled");
    }
  });
});
