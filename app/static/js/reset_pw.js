/**
 * [비밀번호 재설정 페이지 로직]
 */

$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // 토큰이 없으면 잘못된 접근 처리
    if (!token) {
        alert("유효하지 않은 접근입니다.");
        location.href = "/Login";
        return;
    }

    $("#reset_btn").on("click", function() {
        confirmReset(token);
    });

    // 엔터키 대응
    $("#confirm_password").on("keypress", function(e) {
        if(e.keyCode === 13) confirmReset(token);
    });
});

async function confirmReset(token) {
    const newPassword = $("#new_password").val();
    const confirmPassword = $("#confirm_password").val();

    // 1. 유효성 검사
    if (newPassword.length < 8) {
        alert("비밀번호는 8자 이상이어야 합니다.");
        return;
    }

    if (newPassword !== confirmPassword) {
        $("#pw_error").show();
        return;
    } else {
        $("#pw_error").hide();
    }

    try {
        const formData = new URLSearchParams();
        formData.append("token", token);
        formData.append("new_password", newPassword);

        const response = await fetch('/api/user/confirm-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert("비밀번호가 성공적으로 변경되었습니다!\n새로운 비밀번호로 로그인해주세요.");
            location.href = "/login";
        } else {
            alert(result.detail || "링크가 만료되었거나 오류가 발생했습니다.");
            if (result.detail === "INVALID_OR_EXPIRED_TOKEN") {
                location.href = "/idpw"; // 아이디/비번 찾기 페이지로 리다이렉트
            }
        }
    } catch (err) {
        alert("서버와 통신 중 오류가 발생했습니다.");
    }
}