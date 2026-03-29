/**
 * [수정 페이지 메인 로직]
 */
let currentPostId = "";
let currentImageUrl = ""; // 기존 이미지 경로 저장용

$(document).ready(async function () {
    const token = localStorage.getItem("userToken");
    const urlParams = new URLSearchParams(window.location.search);

    const fileInput = document.getElementById("input");
    if (fileInput) {
        fileInput.addEventListener("change", handleFiles);
    }
    currentPostId = urlParams.get('postid');

    if (!token || !currentPostId) {
        alert("잘못된 접근입니다.");
        location.href = "/";
        return;
    }

    // 1. 기존 데이터 불러오기
    loadPostDataForEdit(currentPostId, token);
    
});

/**
 * 서버에서 기존 일기 데이터를 가져와 input 칸에 채워넣음
 */
async function loadPostDataForEdit(postId, token) {
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("데이터 로드 실패");

        const post = await response.json();

        // HTML 요소에 값 채우기
        $("#title").val(post.title);
        $("#textarea").val(post.content);
        $("#todayuser").val(post.people_meet || "없음");
        $("#maps").val(post.area_adr);
        $("#mapname").val(post.area_name || post.area_custom_name);
        
        // 커스텀 드롭다운 텍스트 업데이트
        $("#select #option").text(post.feel || "오늘의 기분");
        $("#select2 #option2").text(post.eat || "오늘의 메뉴");
        
        // 이미지 정보 저장
        currentImageUrl = post.image_url;
        if (currentImageUrl && currentImageUrl !== "null") {
            $("#file").append(`
                <div class="old-img-box" style="margin-top:10px; font-size:13px; color:#666;">
                    * 기존 이미지가 있습니다: <a href="${currentImageUrl}" target="_blank" style="color:blue;">[보기]</a>
                    <br>(새 파일을 선택하면 기존 이미지는 교체됩니다.)
                </div>
            `);
        }
    } catch (err) {
        console.error(err);
        alert("데이터를 불러오지 못했습니다.");
    }
}

/**
 * [수정 완료 버튼 클릭 시] 서버로 PATCH 요청 전송
 */
async function upload() {
    const token = localStorage.getItem("userToken");
    
    // 전송할 데이터 수집
    const formData = new URLSearchParams();
    formData.append("title", $("#title").val());
    formData.append("content", $("#textarea").val());
    formData.append("feel", $("#select #option").text());
    formData.append("eat", $("#select2 #option2").text());
    formData.append("people_meet", $("#todayuser").val());
    formData.append("address", $("#maps").val());
    formData.append("place_name", $("#mapname").val());
    // 이미지는 새로 업로드하지 않았다면 기존 경로를 그대로 보냄
    formData.append("image_url", currentImageUrl); 

    try {
        const response = await fetch(`/api/posts/${currentPostId}`, {
            method: 'PATCH', // 수정은 PATCH 또는 PUT 사용
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (response.ok) {
            alert("기록이 성공적으로 수정되었습니다!");
            location.href = `/write/detail?postid=${currentPostId}`;
        } else {
            alert("수정 권한이 없거나 오류가 발생했습니다.");
        }
    } catch (err) {
        alert("서버 통신 중 에러 발생");
    }
}

/**
 * 파일 선택 시 서버로 즉시 업로드하고 경로를 받아옴
 */
async function handleFiles() {
    const fileList = this.files;
    if (fileList.length === 0) return;

    const file = fileList[0];
    const formData = new FormData();
    formData.append('file', file); // 백엔드 API의 매개변수명 'file'과 일치해야 함

    try {
        // 로딩 표시 (선택 사항)
        console.log("이미지 업로드 중...");

        const response = await fetch('/api/upload', { // 아까 만든 업로드 API 경로
            method: 'POST',
            body: formData
            // 주의: 파일 전송 시에는 headers에 'Content-Type'을 수동으로 설정하지 않습니다. 
            // 브라우저가 자동으로 boundary를 포함한 multipart/form-data로 설정합니다.
        });

        if (response.ok) {
            const imageUrl = await response.text(); // 서버에서 저장된 경로("/static/uploads/...") 반환
            
            // 1. 전역 변수에 저장 (나중에 '수정 완료' 누를 때 DB에 보낼 값)
            currentImageUrl = imageUrl; 

            // 2. 본문에 이미지 미리보기 추가 (기존 로직 유지)
            const imgTag = `\n<img src="${imageUrl}" style="max-width:100%;">\n`;
            const currentContent = $("#textarea").val();
            $("#textarea").val(currentContent + imgTag);
            
            alert("이미지가 성공적으로 업로드되었습니다.");
        } else {
            alert("이미지 업로드에 실패했습니다.");
        }
    } catch (err) {
        console.error("Upload Error:", err);
        alert("서버 통신 오류가 발생했습니다.");
    }
}

// 지도 팝업 (기존 유지)
function openMap() {
    window.open("/write/popupmap", "mapPopup", "width=870, height=880");
}