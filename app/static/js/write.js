$(document).ready(function () {
  $("#select #option").on("click", function () {
    $("#select ul").toggle();
  });

  $("#select ul li").on("click", function () {
    let val = $(this).data("option");
    $("#select #option").text(val);
    $("#select ul").toggle();
  });
});

$(document).ready(function () {
  $("#select2 #option2").on("click", function () {
    $("#select2 ul").toggle();
  });

  $("#select2 ul li").on("click", function () {
    let val = $(this).data("option");
    $("#select2 #option2").text(val);
    $("#select2 ul").toggle();
  });
});
