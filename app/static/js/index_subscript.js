/**
 * [Index 메인 로직]
 */
$(document).ready(async function () {
    // 1. 초기 UI 세팅 (명언 등)
    loadGoodSay();

    // 2. 로그인 체크 (localStorage 사용)
    const token = localStorage.getItem("userToken");

    if (token) {
        // 로그인 상태일 때: 마이페이지 아이콘 추가 및 데이터 로드
        $(".top_icon").append(`
            <a href="/Mypage">
                <img src="../static/assets/mypage.png" alt="마이페이지">
            </a>
            <a href="javascript:void(0)" onclick="logout()" style="margin-left:10px; font-size:14px;">로그아웃</a>
        `);
        
        // 데이터 로드 시작
        await initializeDashboard(token);
    } else {
        // 비로그인 상태일 때
        $(".top_icon").append(`<a href="/login"><p>로그인</p></a>`);
    }
});

/**
 * [대시보드 초기화] 유저 정보와 포스트 데이터를 한 번에 처리
 */
async function initializeDashboard(token) {
    try {
        // 1. 내 정보 가져오기
        const userResponse = await fetch('/api/user/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!userResponse.ok) throw new Error("인증 만료");
        const userData = await userResponse.json();

        // 2. 내 게시글 데이터 가져오기
        const postsResponse = await fetch('/api/posts/mine', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const posts = await postsResponse.json();

        if (posts && posts.length > 0) {
            // 통계 계산 (장소, 음식, 사람)
            processStatistics(posts);
            // 랜덤 기록 하나를 지도에 표시
            showRandomMarker(posts);
        } else {
            $('#food_no_choose').text("아직 기록이 없어요. 첫 일기를 써보세요!");
        }

    } catch (err) {
        console.error("데이터 로드 실패:", err);
        // 토큰이 유효하지 않으면 로그아웃 처리
        logout();
    }
}

/**
 * [통계 엔진] 데이터를 순회하며 분석
 */
function processStatistics(posts) {
    const stats = { 
        place: {}, 
        eat: {}, 
        person: {} 
    };

    posts.forEach(post => {
        if (post.AREA_ADR) stats.place[post.AREA_ADR] = (stats.place[post.AREA_ADR] || 0) + 1;
        if (post.Eat) stats.eat[post.Eat] = (stats.eat[post.Eat] || 0) + 1;
        
        if (post.People_meet && post.People_meet !== "None") {
            post.People_meet.split(",").forEach(p => {
                const name = p.trim();
                stats.person[name] = (stats.person[name] || 0) + 1;
            });
        }
    });

    // 결과 반영
    if (Object.keys(stats.eat).length > 0) {
        const leastEaten = getMinKey(stats.eat);
        displayFoodSuggestion(leastEaten);
    }
    
    if (Object.keys(stats.person).length > 0) {
        const mostMet = getMaxKey(stats.person);
        $("#peoname").text(mostMet);
    }
}

/**
 * [음식 추천 시스템]
 */
function displayFoodSuggestion(category) {
    const menuData = {
        "한식": ["bibimbap.png", "ramyeon.png", "salad.png", "tteokbokki.png"],
        "일식": ["eelrice.png", "sushi.png", "takoyaki.png"],
        "중식": ["dandan.png", "Dimsum.png", "mutton.png"],
        "양식": ["Hamburger.png", "steak.png"]
    };

    const folderMap = { "한식": "korean", "일식": "japan", "중식": "china", "양식": "american" };
    const folder = folderMap[category] || "korean";
    const images = menuData[category] || menuData["한식"];
    const randomImg = images[Math.floor(Math.random() * images.length)];

    $('#food_no_choose').text(`${category}을 안 먹은지 오래되셨더라고요 ( ˘･_･˘ )`);
    $("#food_image").html(`<img src="../static/assets/menu/${folder}/${randomImg}" alt="${category}" style="width:100px;">`);
}

/**
 * [기타 유틸리티]
 */
function getMaxKey(obj) { return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b); }
function getMinKey(obj) { return Object.keys(obj).reduce((a, b) => obj[a] < obj[b] ? a : b); }

function logout() {
    localStorage.clear();
    location.href = "/login";
}

async function loadGoodSay() {
    try {
        const res = await fetch("/api/quotes/random");
        const data = await res.json();
        $("#good_say").text(data.message);
        $("#good_say_author").text(`- ${data.author} -`);
    } catch(e) {
        $("#good_say").text("오늘도 멋진 하루 보내세요.");
    }
}

function showRandomMarker(posts) {
    const post = posts[Math.floor(Math.random() * posts.length)];
    if (typeof customMarker === "function") {
        const adr = post.AREA_LOAD_ADR !== "null" ? post.AREA_LOAD_ADR : post.AREA_ADR;
        const name = post.AREA_CUSTOM_NAME !== "null" ? post.AREA_CUSTOM_NAME : (post.AREA_NAME || "");
        customMarker(post.Feel, post.AREA_LAT, post.AREA_LNG, adr, name, post.Created_At.split("T")[0], post.Created_At);
    }
}