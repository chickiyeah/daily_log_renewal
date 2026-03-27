let load = ''

function sear() {
    keyword = document.getElementById("searp").value
    if (keyword != '') {
        ps.keywordSearch(keyword, placesSearchCB);
    } else {
        alert("검색어를 입력해주세요.")
    }
}
let mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
        level: 1 // 지도의 확대 레벨
    };

// 지도를 생성합니다    
let map = new kakao.maps.Map(mapContainer, mapOption);

var markers = [];
var overlays = [];

// 주소-좌표 변환 객체를 생성합니다
let geocoder = new kakao.maps.services.Geocoder();

let marker = new kakao.maps.Marker(), // 클릭한 위치를 표시할 마커입니다
    infowindow = new kakao.maps.InfoWindow({ zindex: 3 }); // 클릭한 위치에 대한 주소를 표시할 인포윈도우입니다

// 현재 지도 중심좌표로 주소를 검색해서 지도 좌측 상단에 표시합니다
searchAddrFromCoords(map.getCenter(), displayCenterInfo);

// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
// kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
// 지도를 클릭했을 때 클릭 위치 좌표에 대한 주소정보를 표시하도록 이벤트를 등록합니다
kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
    hideMarkers()
    hideOverlay()
    searchDetailAddrFromCoords(mouseEvent.latLng, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            let coords = mouseEvent.latLng.toString().replace("(", "").replace(")", "").split(",")
            let detailAddr = !!result[0].road_address ? '<div>도로명주소 : ' + result[0].road_address.address_name + '</div>' : '';
            detailAddr += '<div>지번 주소 : ' + result[0].address.address_name + '</div>';
            detailAddr += '<div>위도 (LAT) : ' + coords[0] + '</div>';
            detailAddr += '<div>경도 (LNG) : ' + coords[1] + '</div>';

            let content = '<div class="bAddr">' +
                '<span class="title">주소정보</span>' +
                detailAddr +
                '</div>';

            $("#selected").empty()
            $("#selected").append(
                `<span>
            <span class="title">선택된 주소</span>
            ${detailAddr}
        </span>`
            )
            
            document.cookie = "adr = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
            document.cookie = "road_adr = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
            document.cookie = "LAT = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
            document.cookie = "LNG = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
            document.cookie = "name = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
            document.cookie = "adr = "+result[0].address.address_name
            !!result[0].road_address ? document.cookie = "road_adr = "+result[0].road_address.address_name : '';
            document.cookie = "LAT = "+coords[0]
            document.cookie = "LNG = "+coords[1]

            load = !!result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name
            
            $("#selected").empty()
            $("#selected").append(
                `<span>
                    <span class="title">선택된 주소 : ${load}</span>
                </span>`
            )

            // 마커를 클릭한 위치에 표시합니다 
            marker.setPosition(mouseEvent.latLng);
            marker.setMap(map);
            var overlay = new kakao.maps.CustomOverlay({
                content: content,
                map: map,
                position: marker.getPosition()
            })

            overlays.push(overlay)

            // 인포윈도우에 클릭한 위치에 대한 법정동 상세 주소정보를 표시합니다
            //infowindow.setContent(content);
            //infowindow.open(map, marker);
        }
    });
});

// 중심 좌표나 확대 수준이 변경됐을 때 지도 중심 좌표에 대한 주소 정보를 표시하도록 이벤트를 등록합니다
kakao.maps.event.addListener(map, 'idle', function () {
    searchAddrFromCoords(map.getCenter(), displayCenterInfo);
});

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places();

function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        var bounds = new kakao.maps.LatLngBounds();
        hideMarkers()
        hideOverlay()
        for (var i = 0; i < data.length; i++) {
            displayMarker(data[i]);
            bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
    } else {
        alert("검색 결과가 없습니다.")
    }
}

// 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
function setMarkers(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// "마커 보이기" 버튼을 클릭하면 호출되어 배열에 추가된 마커를 지도에 표시하는 함수입니다
function showMarkers() {
    setMarkers(map)
}

// "마커 감추기" 버튼을 클릭하면 호출되어 배열에 추가된 마커를 지도에서 삭제하는 함수입니다
function hideMarkers() {
    setMarkers(null);
}

function setOverlay(map) {
    for (var i = 0; i < overlays.length; i++) {
        overlays[i].setMap(map);
    }
}

function hideOverlay() {
    setOverlay(null)
}

function customMarker(Feel, LAT, LNG, ADR, Name, Created_At, Created_At1) {
    let link = ""
    if (Feel == "맑음") {
        link = "../static/assets/map/sun.png"
    }

    if (Feel == "흐림") {
        link = "../static/assets/map/cloud.png"
    }

    if (Feel == "비") {
        link = "../static/assets/map/rain.png"
    }

    if (Feel == "눈") {
        link = "../static/assets/map/snow.png"
    }

    if (Feel == "바람") {
        link = "../static/assets/map/wind.png"
    }

    var imageSrc = link, // 마커이미지의 주소입니다    
        imageSize = new kakao.maps.Size(44, 46), // 마커이미지의 크기입니다
        imageOption = { offset: new kakao.maps.Point(27, 69) }; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.

    // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
    var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption),
        markerPosition = new kakao.maps.LatLng(37.54699, 127.09598); // 마커가 표시될 위치입니다

    var bounds = new kakao.maps.LatLngBounds();
    // 마커를 생성합니다
    bounds.extend(new kakao.maps.LatLng(LAT, LNG));
    map.setBounds(bounds)
    var marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(LAT, LNG),
        image: markerImage, // 마커이미지 설정 
        map: map
    });



    markers.push(marker)

    kakao.maps.event.addListener(marker, 'click', function (mouseEvent) {
        hideOverlay()
        let detailAddr = `<div><a style="color: blue;" href="/write/detail?postid=${Created_At1}">상세 글 보러가기</a></div>`;
        detailAddr += '<div>이름 : ' + Name + '</div>';
        detailAddr += '<div>기분 : ' + Feel + '</div>';
        detailAddr += '<div>주소 : ' + ADR + '</div>';

        let content = '<div class="bAddr">' +
            '<span class="title">주소정보</span>' +
            detailAddr +
            '</div>';

        bounds.extend(marker.getPosition());
        map.setBounds(bounds)

        document.cookie = "adr = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "road_adr = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "LAT = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "LNG = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "name = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "adr = "+result[0].address.address_name
        !!result[0].road_address ? document.cookie = "road_adr = "+result[0].road_address.address_name : '';
        document.cookie = "LAT = "+place.y
        document.cookie = "LNG = "+place.x
        document.cookie = "name = "+place.place_name

        load = !!result[0].road_address ? result[0].road_address.address_name+" ("+place.place_name+")" : result[0].address.address_name+" ("+place.place_name+")"
        $("#selected").empty()
        $("#selected").append(
            `<span>
                <span class="title">선택된 주소 : ${load}</span>
            </span>`
        )

        var overlay = new kakao.maps.CustomOverlay({
            content: content,
            map: map,
            position: marker.getPosition()
        })
        overlays.push(overlay)
        // 인포윈도우에 클릭한 위치에 대한 법정동 상세 주소정보를 표시합니다`  
        //infowindow.setContent(content);
        //infowindow.open(map, marker);
    });
}

// 지도에 마커를 표시하는 함수입니다
function displayMarker(place) {


    // 마커를 생성하고 지도에 표시합니다
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });

    markers.push(marker)

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, 'click', function (mouseEvent) {
        console.log(markers)

        searchDetailAddrFromCoords(new kakao.maps.LatLng(place.y, place.x), function (result, status) {
            if (status === kakao.maps.services.Status.OK) {
                let detailAddr = !!result[0].road_address ? '<div>도로명주소 : ' + result[0].road_address.address_name + '</div>' : '';
                detailAddr += '<div>장소 이름 : ' + place.place_name + '</div>'
                detailAddr += '<div>지번 주소 : ' + result[0].address.address_name + '</div>';
                detailAddr += '<div>위도 (LAT) : ' + place.y + '</div>';
                detailAddr += '<div>경도 (LNG) : ' + place.x + '</div>';

                let content = '<div class="bAddr">' +
                    '<span class="title">주소정보</span>' +
                    detailAddr +
                    '</div>';

                $("#selected").empty()
                $("#selected").append(
                    `<span>
            <span class="title">선택된 주소</span>
            ${detailAddr}
        </span>`
                )
                hideOverlay()

                document.cookie = "adr = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                document.cookie = "road_adr = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                document.cookie = "LAT = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                document.cookie = "LNG = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                document.cookie = "name = ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                document.cookie = "adr = "+result[0].address.address_name
                !!result[0].road_address ? document.cookie = "road_adr = "+result[0].road_address.address_name : '';
                document.cookie = "LAT = "+place.y
                document.cookie = "LNG = "+place.x
    
                load = !!result[0].road_address ? result[0].road_address.address_name +" ("+place.place_name+")" : result[0].address.address_name +" ("+place.place_name+")"
                
                $("#selected").empty()
                $("#selected").append(
                    `<span>
                        <span class="title">선택된 주소 : ${load}</span>
                    </span>`
                )

                var overlay = new kakao.maps.CustomOverlay({
                    content: content,
                    map: map,
                    position: marker.getPosition()
                })
                overlays.push(overlay)

                // 인포윈도우에 클릭한 위치에 대한 법정동 상세 주소정보를 표시합니다
                //infowindow.setContent(content);
                //infowindow.open(map, marker);
            }
        });
    });
}

function searchAddrFromCoords(coords, callback) {
    geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
}

function searchDetailAddrFromCoords(coords, callback) {
    geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
}

// 지도 좌측상단에 지도 중심좌표에 대한 주소정보를 표출하는 함수입니다
function displayCenterInfo(result, status) {
    if (status === kakao.maps.services.Status.OK) {
        let infoDiv = document.getElementById('centerAddr');

        for (let i = 0; i < result.length; i++) {
            // 행정동의 region_type 값은 'H' 이므로
            if (result[i].region_type === 'H') {
                infoDiv.innerHTML = result[i].address_name;
                break;
            }
        }
    }
}