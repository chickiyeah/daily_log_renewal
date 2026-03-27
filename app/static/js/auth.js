
// 1. 초기 설정 및 SDK 로드
const KAKAO_KEY = '4c43d4733daa8022e6465b441f59f10c';
const NAVER_CLIENT_ID = 'rmzcetOz2YMjocxnYhPh';

$(document).ready(() => {
    if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) Kakao.init(KAKAO_KEY);
    checkSocialCallback(); // 페이지 로드 시 소셜 콜백(네이버 등) 확인
});

/**
 * [공통] 서버 통신 함수 (Fetch API 사용)
 */
async function requestApi(url, method, formData) {
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData)
        });
        const result = await response.json();
        return { ok: response.ok, status: response.status, data: result };
    } catch (err) {
        console.error("네트워크 오류:", err);
        return { ok: false, detail: "서버 연결 실패" };
    }
}

/**
 * [핵심] 소셜 로그인 통합 처리 (로그인 시도 -> 없으면 가입 -> 로그인)
 */
async function handleSocialProcess(email, password, nickname, provider) {
    // 1. 로그인 시도
    let res = await requestApi('/api/login', 'POST', { email, password });

    // 2. 계정이 없는 경우 (404 EMAIL_NOT_FOUND) 자동 가입 진행
    if (!res.ok && res.data.detail === "EMAIL_NOT_FOUND") {
        const regRes = await requestApi('/api/register', {
            email, password, nickname, name: nickname, phone: provider, birthday: "2026-01-01"
        });
        
        if (regRes.ok) {
            alert(`${provider} 계정으로 첫 방문을 환영합니다! 자동 가입되었습니다.`);
            res = await requestApi('/api/login', 'POST', { email, password }); // 재로그인
        }
    }

    // 3. 최종 로그인 성공 시 토큰 저장 및 이동
    if (res.ok && res.data.access_token) {
        localStorage.setItem("userToken", res.data.access_token);
        localStorage.setItem("userNickname", res.data.nickname);
        location.href = "/";
    } else {
        alert("로그인 처리 중 오류: " + (res.data.detail || "알 수 없는 오류"));
    }
}

// ---------------------------------------------------------
// [기능 1] 일반 이메일 로그인
// ---------------------------------------------------------
async function emailLogin() {
    const email = $('#emaill').val();
    const password = $('#passwordd').val();
    
    const res = await requestApi('/api/login', 'POST', { email, password });
    if (res.ok) {
        localStorage.setItem("userToken", res.data.access_token);
        location.href = "/";
    } else {
        alert(res.data.detail || "아이디 또는 비번을 확인하세요.");
    }
}

// ---------------------------------------------------------
// [기능 2] 카카오 로그인
// ---------------------------------------------------------
function loginWithKakao() {
    Kakao.Auth.login({
        success: (auth) => {
            Kakao.API.request({
                url: '/v2/user/me',
                success: (res) => {
                    const email = `kakao_${res.kakao_account.email}`;
                    const password = `${res.connected_at}-${res.id}`; // 기존 비번 규칙 유지
                    handleSocialProcess(email, password, res.properties.nickname, "kakao");
                }
            });
        }
    });
}

// ---------------------------------------------------------
// [기능 3] 네이버 로그인 (Redirect 방식)
// ---------------------------------------------------------
function loginWithNaver() {
    const naverUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/login')}&state=Naver`;
    location.href = naverUrl;
}

// 페이지 로드 시 URL 파라미터를 확인하여 네이버 로그인 마무리
async function checkSocialCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state === "Naver") {
        // 백엔드의 /Login/Navertoken 엔드포인트 호출하여 프로필 획득
        const res = await requestApi('/Login/Navertoken', 'POST', { code });
        if (res.ok) {
            const profile = res.data.response;
            const email = `naver_${profile.email}`;
            const password = profile.id;
            handleSocialProcess(email, password, profile.nickname, "naver");
        }
    }
}

// ---------------------------------------------------------
// [기능 4] 구글 로그인 (최신 GSI 방식)
// ---------------------------------------------------------
function handleGoogleLogin(response) {
    const payload = parseJwt(response.credential);
    const email = `google_${payload.email}`;
    const password = `google_${payload.sub}`; // 구글 고유 ID 사용
    handleSocialProcess(email, password, payload.name, "google");
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}
/**
 * [공통] 서버 응답 처리 및 예외 알림 함수
 */
function handleAuthError(detail) {
    const errorMessages = {
        "MISSING_EMAIL": "이메일을 입력해주세요.",
        "EMAIL_EXISTS": "이미 사용중인 이메일입니다.",
        "INVALID_EMAIL": "올바른 이메일 형식이 아닙니다.",
        "MISSING_PASSWORD": "비밀번호를 입력해주세요.",
        "PASSWORD_TOO_SHORT": "비밀번호는 최소 6자리 이상이어야 합니다.",
        "TOO_MANY_DUPICATE": "비밀번호에 동일한 문자를 연속으로 사용할 수 없습니다.",
        "MISSING_NICKNAME": "닉네임을 입력해주세요.",
        "MISSING_NAME": "실명을 입력해주세요.",
        "MISSING_PHONE": "전화번호를 입력해주세요.",
        "EMAIL_NOT_FOUND": "등록되지 않은 이메일입니다.",
        "INVALID_PASSWORD": "비밀번호가 일치하지 않습니다."
    };
    alert(errorMessages[detail] || detail || "알 수 없는 오류가 발생했습니다.");
}

/**
 * [기능 1] 일반 회원가입
 */
async function Register() {
    // HTML의 ID 값들을 가져옵니다.
    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const nickname = document.getElementById("nickname").value;
    const password = document.getElementById("password").value;
    const birthday = document.getElementById("birthday").value;
    const phone = document.getElementById("phone").value;

    // 간단한 필수 입력 체크
    if (!email || !password || !nickname || !name) {
        alert("필수 입력 항목을 모두 채워주세요.");
        return;
    }

    const formData = { email, name, nickname, password, birthday, phone };

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('회원가입 성공! 로그인 페이지로 이동합니다.');
            location.href = "/login";
        } else {
            // 백엔드에서 보낸 detail 에러 메시지 처리
            alert(result.detail || "회원가입에 실패했습니다.");
        }
    } catch (err) {
        console.error(err);
        alert("서버와 통신 중 오류가 발생했습니다.");
    }
}

/**
 * [기능 2] 일반 로그인
 */
async function emailLogin() {
    const formData = {
        email: $('#emaill').val(), // HTML의 id에 맞춰 수정 (emaill -> email 등 확인 필요)
        password: $('#password').val()
    };

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData)
        });

        const result = await response.json();

        if (response.ok) {
            // JWT 토큰 저장
            localStorage.setItem("userToken", result.access_token);
            localStorage.setItem("userNickname", result.nickname);
            location.href = "/";
        } else {
            handleAuthError(result.detail);
        }
    } catch (err) {
        alert("서버 연결 실패");
    }
}

/**
 * [기능 3] 비밀번호 보이기 토글
 * @param {string} inputId - 비밀번호 입력창의 ID
 * @param {string} checkboxId - 체크박스의 ID
 */
function is_checked() {
    const passwordInput = document.getElementById("password");
    const checkbox = document.getElementById("flexCheckDefault");
    
    if (checkbox.checked) {
        passwordInput.type = "text";
        passwordInput.autocomplete = "off";
    } else {
        passwordInput.type = "password";
        passwordInput.autocomplete = "current-password";
    }
}

// (소셜 로그인 로직인 handleSocialProcess, loginWithKakao 등은 이전과 동일하게 유지...)