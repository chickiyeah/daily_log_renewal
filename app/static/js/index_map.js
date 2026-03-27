// 변수 선언만 먼저 함 (값 할당 X)
let map;
let geocoder;
let ps;
let marker; 
let markers = [];
let overlays = [];
// index_map.js 또는 스크립트 하단에 추가

$(document).ready(function() {
    const $mapArea = $('#map_module');

    // 1. 마우스가 지도 위로 올라왔을 때 (데스크탑)
    $mapArea.on('mouseenter', function () {
        $.fn.fullpage.setAllowScrolling(false);      // 스크롤 금지
        $.fn.fullpage.setKeyboardScrolling(false);   // 키보드 방향키 금지
    });

    // 2. 마우스가 지도를 벗어났을 때 (데스크탑)
    $mapArea.on('mouseleave', function () {
        $.fn.fullpage.setAllowScrolling(true);       // 스크롤 허용
        $.fn.fullpage.setKeyboardScrolling(true);    // 키보드 방향키 허용
    });

    /// --- 모바일 (터치) 대응 핵심 ---
    $mapArea.addEventListener('touchstart', function (e) {
        // 1. 풀페이지 스크롤 일시 정지
        $.fn.fullpage.setAllowScrolling(false);
        
        // 2. 만약 유료 플러그인 dragAndMove가 활성화되어 있다면 이것도 꺼야 함
        if ($.fn.fullpage.setDragAndMove) {
            $.fn.fullpage.setDragAndMove(false);
        }
        
        // 이벤트가 상위(Fullpage)로 전파되는 것을 막음
        e.stopPropagation();
    }, { passive: false });

    $mapArea.addEventListener('touchend', function () {
        // 손을 떼면 다시 풀페이지 스크롤 활성화
        $.fn.fullpage.setAllowScrolling(true);
        
        if ($.fn.fullpage.setDragAndMove) {
            $.fn.fullpage.setDragAndMove(true);
        }
    }, { passive: false });
});
// 지도 초기화 함수
function initMap() {
    const mapContainer = document.getElementById('map_module'); 
    
    // 1. LatLng 등 모든 객체 생성은 반드시 이 함수(initMap) 안에서 진행
    const mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), 
        level: 3 
    };

    map = new kakao.maps.Map(mapContainer, mapOption); // 지도 생성
    geocoder = new kakao.maps.services.Geocoder();    // 주소-좌표 변환 객체
    ps = new kakao.maps.services.Places();           // 장소 검색 객체
    marker = new kakao.maps.Marker();                 // 클릭 위치 표시용 마커

    // 지도 컨트롤 추가
    map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);
    map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

    // 지도 클릭 이벤트 등록
    kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
        handleMapClick(mouseEvent.latLng);
    });

    console.log("카카오맵이 성공적으로 로드되었습니다.");
}

// 지도 클릭 시 주소 정보 가져오기
function handleMapClick(latLng) {
    hideOverlay();
    geocoder.coord2Address(latLng.getLng(), latLng.getLat(), function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const roadAddr = result[0].road_address ? result[0].road_address.address_name : '도로명 주소 없음';
            const detailAddr = result[0].address.address_name;
            
            const content = `<div class="bAddr" style="padding:5px;font-size:12px;">
                                <span class="title">선택된 주소</span>
                                <div>${roadAddr}</div>
                            </div>`;

            $("#selected").html(`<span><span class="title">선택된 주소</span> : ${roadAddr}</span>`);

            marker.setPosition(latLng);
            marker.setMap(map);
            
            const overlay = new kakao.maps.CustomOverlay({
                content: content,
                position: latLng,
                map: map
            });
            overlays.push(overlay);
        }
    });
}

// 오버레이 및 마커 초기화 함수들
function hideOverlay() {
    overlays.forEach(o => o.setMap(null));
    overlays = [];
}

function clearMap() {
    markers.forEach(m => m.setMap(null));
    markers = [];
    hideOverlay();
    if(marker) marker.setMap(null);
}

// 핵심 실행 로직
if (typeof kakao !== 'undefined') {
    // v2/maps/sdk.js?autoload=false 일 때 반드시 필요한 과정
    kakao.maps.load(function() {
        initMap();
        
        // 로그인 체크 및 데이터 로드 (필요시)
        const token = localStorage.getItem("userToken");
        if (token) {
            // initializeDashboard(token); // 이전에 정의한 함수가 있다면 호출
        }
    });
} else {
    console.error("카카오맵 SDK 로드 실패. API Key와 도메인 설정을 확인하세요.");
}