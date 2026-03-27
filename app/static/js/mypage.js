// app/static/js/mypage.js

$(document).ready(function () {
    const token = localStorage.getItem("userToken");

    if (!token) {
        alert("로그인이 필요합니다.");
        location.href = "/login"; // 경로 확인 필요
        return;
    }

    // 페이지 로드 시 유저 데이터 불러오기
    loadUserInfo(token);
});

/**
 * 유저 정보 불러오기
 */
async function loadUserInfo(token) {
    try {
        const response = await fetch('/api/user/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const user = await response.json();
            // HTML 필드에 값 채우기
            $("#email").val(user.email);
            $("#name").val(user.name);
            $("#nickname").val(user.nickname);
            $("#birthday").val(user.birthday);
            $("#phone").val(user.phone);
            
            // 수정을 위해 초기 닉네임 저장
            window.originalNickname = user.nickname;
        } else {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            logout();
        }
    } catch (err) {
        console.error("정보 로드 실패:", err);
    }
}

/**
 * 닉네임 수정하기
 */
async function update() {
    const newNickname = $("#nickname").val();
    const token = localStorage.getItem("userToken");

    if (newNickname === window.originalNickname) {
        alert("변경사항이 존재하지 않습니다.");
        return;
    }

    try {
        const response = await fetch('/api/user/update', {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded' 
            },
            body: new URLSearchParams({ 'nickname': newNickname })
        });

        if (response.ok) {
            alert("변경이 완료되었습니다.");
            location.reload();
        } else {
            const result = await response.json();
            alert(result.detail || "수정에 실패했습니다.");
        }
    } catch (err) {
        alert("서버 통신 오류");
    }
}

/**
 * 로그아웃
 */
function logout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userNickname");
    alert("로그아웃 되었습니다.");
    location.href = "/";
}