/**
 * [아이디/비밀번호 찾기 로직]
 */

$(document).ready(function() {
    // 아이디 찾기 버튼 클릭
    $("#findid").on("click", findID);

    // 비밀번호 찾기 (엔터키 대응)
    $("#email1").on("keypress", function(e) {
        if(e.keyCode === 13) RstPW();
    });
});

/**
 * 아이디 찾기 실행
 */
async function findID() {
    const name = $("#name1").val();
    const phone = $("#phone1").val();
    const birthday = $("#birthday1").val();

    if (!name || !phone || !birthday) {
        alert("모든 정보를 입력해주세요.");
        return;
    }

    try {
        const formData = new URLSearchParams();
        formData.append("name", name);
        formData.append("phone", phone);
        formData.append("birthday", birthday);

        const response = await fetch('/api/user/find-id', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert(`찾으시는 아이디(이메일)는 [ ${result.email} ] 입니다.`);
        } else {
            alert(result.detail || "일치하는 정보를 찾을 수 없습니다.");
        }
    } catch (err) {
        alert("서버 통신 오류");
    }
}

/**
 * 비밀번호 재설정 요청
 */
async function RstPW() {
    const email = $("#email1").val();

    if (!email) {
        alert("이메일을 입력해주세요.");
        return;
    }

    try {
        const formData = new URLSearchParams();
        formData.append("email", email);

        const response = await fetch('/api/user/reset-pw', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert("이메일을 전송했습니다.\n이메일이 오지 않은 경우 스팸함을 확인해 주세요.");
        } else {
            alert(result.detail || "이메일 확인 중 오류가 발생했습니다.");
        }
    } catch (err) {
        alert("서버 통신 오류");
    }
}