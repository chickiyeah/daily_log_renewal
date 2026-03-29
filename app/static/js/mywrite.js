/**
 * [마이페이지 - 내가 쓴 글 로직]
 */
let token = localStorage.getItem("userToken");
let currentNickname = ""; // 작성자 이름 표시용

$(document).ready(async function () {
    if (!token) {
        alert("로그인이 필요합니다.");
        location.href = "/login";
        return;
    }

    // 1. 유저 정보 먼저 가져오기 (작성자 이름 표시용)
    try {
        const userRes = await fetch('/api/user/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        currentNickname = userData.nickname;
    } catch (e) { console.error("유저 정보 로드 실패"); }

    // 2. 게시글 목록 불러오기
    loadMyPosts();
});

/**
 * 게시글 목록 로드
 */
async function loadMyPosts() {
    try {
        const response = await fetch('/api/posts/mine', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("로드 실패");

        const posts = await response.json();
        const container = $("#write_main");
        container.empty();

        posts.forEach(post => {
            const dateObj = new Date(post.created_at);
            const dateStr = (dateObj.getMonth() + 1) + "/" + dateObj.getDate();
            const timeAgo = getTimeAgo(dateObj);
            
            // 요청하신 구조 그대로 생성
            const cardHtml = Card(dateStr, post.title, currentNickname, timeAgo, post.id);
            container.append(cardHtml);
        });

        // 체크박스 클릭 시 상세페이지로 이동하는 것 방지
        $(".optionCheck").on("click", function(e) {
            e.stopPropagation(); 
        });

    } catch (err) {
        alert("목록을 가져오지 못했습니다.");
    }
}

/**
 * [기존 Card 구조 유지 함수]
 */
function Card(Date, Name, UserName, Ex, id) {
    if (Name.length > 48) {
        Name = Name.substring(0, 47) + "...";
    }
    // 사용자가 제공한 HTML 구조 100% 동일
    return `
        <a href="/write/detail?postid=${id}">
            <div id="${id}" class="write_box">
                <input id="${id}_chk" class="optionCheck" type="checkbox" value="${id}">
                <label for="chkBox">
                    <div>
                        <h2>${Date}</h2>
                        <h3>${Name}</h3>
                    </div>
                </label>
                <div class="user_info">
                    <p>${UserName}</p>
                    <p>${Ex}</p>
                </div>              
            </div>
        </a>`;
}

/**
 * [삭제 기능]
 */
async function Delete() {
    const selected = $(".optionCheck:checked");
    if (selected.length === 0) {
        alert("삭제할 글을 선택해주세요.");
        return;
    }

    if (!confirm("정말 삭제하시겠습니까?\n이 작업은 취소할 수 없습니다.")) return;

    try {
        for (let i = 0; i < selected.length; i++) {
            const postId = $(selected[i]).val();
            await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        alert("삭제되었습니다.");
        location.reload();
    } catch (err) {
        alert("삭제 중 오류가 발생했습니다.");
    }
}

/**
 * [수정 기능]
 */
function goToEdit() {
    const selected = $(".optionCheck:checked");
    if (selected.length !== 1) {
        alert("수정할 글을 하나만 선택해주세요.");
        return;
    }
    const id = selected.val();
    location.href = `/write/edit?postid=${id}`;
}

// 시간 계산 유틸리티
function getTimeAgo(date) {
    const diff = new Date() - date;
    const min = 60 * 1000, hour = min * 60, day = hour * 24;
    if (diff < min) return '방금 전';
    if (diff < hour) return Math.floor(diff / min) + '분 전';
    if (diff < day) return Math.floor(diff / hour) + '시간 전';
    return Math.floor(diff / day) + '일 전';
}