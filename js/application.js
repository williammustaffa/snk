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
    console.log(name);
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
  $(document).on("click", "#modal.no-clickable", function() {
    return false;
  });
  $(document).on("click", "#play", function() {
    if (canPlay == true ) {
      $("#modal").addClass("no-clickable").fadeOut(1000);
      $("#loading").fadeIn();
      var c_value = $("input[name=color]:checked").val();
      console.log("Color set as: ", c_value);
      console.log("Name set as: ", name);
      /* sending data */
      var setup = {
        color: c_value,
        name: name
      };
      snk.init(setup);
    } else {
      $("input#name").trigger("focus").addClass("disabled");
    }
  });
});
