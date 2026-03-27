let uploadedImageUrl = ""; // 업로드된 이미지 경로 저장

$(document).ready(function () {
    const token = localStorage.getItem("userToken");
    if (!token) {
        alert("로그인이 필요합니다.");
        location.href = "/login?loc=write/2";
    }

    // 파일 선택 시 즉시 업로드 처리
    $("#input").on("change", async function() {
        const file = this.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
                // 파일 업로드는 Content-Type을 명시하지 않아야 브라우저가 알아서 boundary를 설정합니다.
            });
            const imgPath = await response.text(); // 혹은 response.json()
            uploadedImageUrl = imgPath;
            
            // 텍스트 영역에 이미지 미리보기 삽입 (선택사항)
            $("#textarea").append(`\n(이미지 첨부됨: ${imgPath})\n`);
            alert("이미지 업로드 완료");
        } catch (err) {
            alert("이미지 업로드 실패");
        }
    });
});

// 팝업창에서 주소를 선택하면 호출될 함수 (부모창 함수)
function setLocationData(addr, lat, lng, placeName) {
    $("#maps").val(addr);
    $("#mapname").val(placeName);
    // 선택된 좌표는 임시 저장 (데이터 전송용)
    window.selectedLat = lat;
    window.selectedLng = lng;
}

function openMap() {
    window.open("/write/popupmap", "mapPopup", "width=870, height=880");
}

async function upload() {
    const token = localStorage.getItem("userToken");
    
    const data = {
        title: $("#title").val(),
        address: $("#maps").val(),
        place_name: $("#mapname").val(),
        people_meet: $("#todayuser").val(),
        feel: $("#select #option").text(),
        eat: $("#select2 #option2").text(),
        content: $("#textarea").val(),
        lat: window.selectedLat || 0,
        lng: window.selectedLng || 0,
        image_url: uploadedImageUrl
    };

    // 유효성 검사
    if (!data.title) return alert("제목을 입력하세요.");
    if (!data.address) return alert("장소를 선택하세요.");
    if (data.feel === "오늘의 기분") return alert("기분을 선택하세요.");

    try {
        const formData = new URLSearchParams();
        for (const key in data) formData.append(key, data[key]);

        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded' 
            },
            body: formData
        });

        if (response.ok) {
            alert("일기가 등록되었습니다!");
            location.href = "/write/1";
        } else {
            alert("저장에 실패했습니다.");
        }
    } catch (err) {
        alert("서ver 에러 발생");
    }
}