/**
 * [내 이미지 모아보기 로직]
 */
let token = localStorage.getItem("userToken");

$(document).ready(function () {
    if (!token) {
        alert("로그인이 필요합니다.");
        location.href = "/login?loc=Mypage/Like";
        return;
    }

    loadMyImages();
});

/**
 * 서버에서 이미지 게시글 목록 가져오기
 */
async function loadMyImages() {
    try {
        const response = await fetch('/api/user/images', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("이미지 로드 실패");

        const posts = await response.json();
        const container = $("#image");
        container.empty();

        if (posts.length === 0) {
            container.append('<p class="no-data">업로드된 이미지가 없습니다.</p>');
            return;
        }

        // 모든 이미지를 화면에 출력 (기존 ima 함수 스타일 유지)
        posts.forEach(post => {
            const imgHtml = ima(post.image_url, post.id);
            container.append(imgHtml);
        });

    } catch (err) {
        console.error(err);
        alert("이미지를 불러오는 중 오류가 발생했습니다.");
    }
}

/**
 * 이미지 HTML 구조 (기존 구조 유지 및 클릭 시 상세페이지 이동 추가)
 */
function ima(link, postId) {
    // 이미지를 클릭하면 해당 일기 상세 페이지로 이동하도록 <a> 태그를 감싸줍니다.
    return `
        <div class="img_item">
            <a href="/write/detail?postid=${postId}">
                <img src=${link} alt="사용자 업로드 이미지" onerror="this.src='../static/assets/no_image.png'">
            </a>
        </div>`;
}

/**
 * 로그아웃
 */
function logout() {
    localStorage.removeItem("userToken");
    alert("로그아웃 되었습니다.");
    location.href = "/";
}