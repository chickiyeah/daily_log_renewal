$(document).ready(function() {     

    let top = document.querySelector("#map_warp").offsetTop
    let left = document.querySelector("#map_warp").offsetLeft

    $(".hAddr").css({
        "top":top/10,
        "left":left
    })   
    // Geolocation API에 액세스할 수 있는지를 확인
    if (navigator.geolocation) {
        //위치 정보를 얻기
        navigator.geolocation.getCurrentPosition (function(pos) {
            console.log(pos.coords.latitude);     // 위도
            console.log(pos.coords.longitude); // 경도
            let curpos = new kakao.maps.LatLng(pos.coords.latitude,pos.coords.longitude)
            map.panTo(curpos)

            var marker = new kakao.maps.Marker({
                position: curpos
            })
            
            markers.push(marker)
            hideMarkers()
            hideOverlay()
            marker.setMap(map)

            let content = '<div class="bAddr">' +
                '<span class="title">네트워크상 현재 주소</span>' +
                '</div>';

            var overlay = new kakao.maps.CustomOverlay({
                content: content,
                map: map,
                position: marker.getPosition()
            })

            overlays.push(overlay)

            
        },
        function(err){
            console.log(err)
        });
    } else {
        alert("이 브라우저에서는 Geolocation이 지원되지 않습니다.")
    }
});