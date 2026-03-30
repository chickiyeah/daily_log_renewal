/**
 * [회원 탈퇴 페이지 로직]
 */
let token = localStorage.getItem("userToken");

$(document).ready(function () {
    if (!token) {
        alert("로그인이 필요합니다.");
        location.href = "/login";
        return;
    }
    
    // 이메일 칸에 현재 사용자 이메일 미리 채워주기 (선택사항)
    // fetch('/api/user/me', ...) 등을 통해 가져온 이메일을 넣을 수 있습니다.
});

/**
 * 일반 계정 탈퇴 (비밀번호 검증 포함)
 */
async function remove() {
    const password = $("#password").val();

    if (!password) {
        alert("현재 비밀번호를 입력해주세요.");
        return;
    }

    if (!confirm("정말 탈퇴하시겠어요?\n모든 데이터가 영구 삭제되며 복구할 수 없습니다!")) {
        return;
    }

    try {
        const formData = new URLSearchParams();
        formData.append("password", password);

        const response = await fetch('/api/user/withdraw', {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (response.ok) {
            handleWithdrawSuccess();
        } else {
            const err = await response.json();
            if (err.detail === "INVALID_PASSWORD") alert("비밀번호가 일치하지 않습니다.");
            else alert("탈퇴 처리 중 오류가 발생했습니다.");
        }
    } catch (e) {
        alert("서버 통신 오류");
    }
}

/**
 * SNS 계정 탈퇴 (비밀번호 검증 없이 즉시 요청)
 */
async function removesns() {
    if (!confirm("SNS 계정을 연동 해제하고 탈퇴하시겠습니까?")) return;

    try {
        const response = await fetch('/api/user/withdraw', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            handleWithdrawSuccess();
        }
    } catch (e) {
        alert("서버 통신 오류");
    }
}

/**
 * 탈퇴 성공 후 공통 처리
 */
function handleWithdrawSuccess() {
    alert("탈퇴가 완료되었습니다.\n그동안 이용해주셔서 감사합니다.");
    localStorage.clear(); // 토큰 및 모든 정보 삭제
    location.href = "/?delete"; // 홈으로 이동
}

/**
 * 비밀번호 표시 토글
 */
function is_checked() {
    const isChecked = $("#flexCheckDefault").is(":checked");
    $("#password").attr("type", isChecked ? "text" : "password");
}