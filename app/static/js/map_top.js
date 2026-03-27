let id = ""
$(document).ready(function () {
    let top = document.querySelector("#map_warp").offsetTop
    let left = document.querySelector("#map_warp").offsetLeft

    $(".hAddr").css({
        "top":top+10,
        "left":left+70
    })   

    $("#select #option").on("click", function () {
        $("#select ul").toggle();
    });

    $("#select ul li").on("click", function () {
        let val = $(this).data("option");
        $("#select #option").text(val);
        $("#select ul").toggle();
        hideMarkers()
        hideOverlay()
        showall(val)
    });

    if (document.cookie.split("user_id=")[1].includes(";")) {
        id = document.cookie.split("user_id=")[1].split(";")[0].replace(" ", "")
    } else {
        id = document.cookie.split("user_id=")[1].replace(" ", "")
    }
    document.getElementById("showall").addEventListener('click', function () {
        if (document.getElementById("showall").checked) {
            showall()
        } else {
            hideMarkers()
        }
    })
    document.getElementById("showdate").addEventListener('change', function () {
        hideMarkers()
        hideOverlay()
        showall(document.getElementById("showdate").value)
    })
});

function showall(filter) {
    $.ajax({
        url: "/WriteA",
        method: "POST",
        data: {
            "Author": id
        },
        success: function (response) {
            const result = {};
            response.forEach(element => {

                let Feel = element.Feel
                let LAT = element.AREA_LAT
                let LNG = element.AREA_LNG
                let ADR = ""
                if (element.AREA_LOAD_ADR != "null") {
                    ADR = element.AREA_LOAD_ADR
                } else {
                    ADR = element.AREA_ADR
                }
                let Name = ""
                if (element.AREA_CUSTOM_NAME != "null") {
                    Name = element.AREA_CUSTOM_NAME
                } else {
                    if (element.AREA_NAME != "null") {
                        Name = element.AREA_NAME
                    } else {
                        Name = ""
                    }
                }
                console.log(filter)
                let Created_At = element.Created_At.split("T")[0].split("-")[0] + "-" + element.Created_At.split("T")[0].split("-")[1] + "-" + element.Created_At.split("T")[0].split("-")[2] + " " + element.Created_At.split("T")[1].split(".")[0]
                if (filter == undefined) {
                    customMarker(Feel, LAT, LNG, ADR, Name, Created_At, element.Created_At)
                } else {
                    if (filter == "맑음" || filter == "흐림" || filter == "비" || filter == "눈" || filter == "바람") {
                        if (filter == Feel) {
                            customMarker(Feel, LAT, LNG, ADR, Name, Created_At, element.Created_At)
                        }

                    } else {
                        Created_At = element.Created_At.split("T")[0].split("-")[0] + "-" + element.Created_At.split("T")[0].split("-")[1] + "-" + element.Created_At.split("T")[0].split("-")[2]
                        if (filter == Created_At) {
                            customMarker(Feel, LAT, LNG, ADR, Name, Created_At, element.Created_At)
                        }
                    }
                }
            })
        }
    })
}