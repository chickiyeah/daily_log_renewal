/**
 * [Index 메인 로직]
 */
$(document).ready(async function () {
    // 1. 초기 UI 세팅 및 명언 가져오기
    loadGoodSay();

    // 2. 로그인 체크 (localStorage 사용)
    const token = localStorage.getItem("userToken");

    if (token) {
        // 로그인 상태 UI 처리
        $(".top_icon").append(`<a href="/Mypage"><img src="../static/assets/mypage.png" alt="마이페이지"></a>`);
        
        // 유저 정보 확인 및 데이터 로드
        await initializeUserData(token);
    } else {
        // 비로그인 상태 UI 처리
        $(".top_icon").append(`<a href="/login"><p>로그인</p></a>`);
    }
});

/**
 * [데이터 초기화] 한 번의 호출로 모든 통계를 처리합니다.
 */
async function initializeUserData(token) {
    try {
        // 1. 유저 유효성 체크
        const userRes = await fetch('/User', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await userRes.json();

        if (!user.email) throw new Error("Invalid User");

        // 2. 게시글 데이터 전체 가져오기 (딱 한 번만 호출!)
        const postsRes = await fetch('/WriteA', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${token}` 
            },
            body: new URLSearchParams({ 'Author': user.id })
        });
        const posts = await postsRes.json();

        if (posts && posts.length > 0) {
            // 통계 계산 및 UI 업데이트
            updateStatistics(posts);
            // 랜덤 마커 표시
            showRandomMarker(posts);
        }
    } catch (err) {
        console.error("Data Load Error:", err);
        localStorage.removeItem("userToken");
        // location.href = "/login"; // 필요시 주석 해제
    }
}

/**
 * [통계 엔진] 장소, 음식, 사람 데이터를 한 번에 분석합니다.
 */
function updateStatistics(posts) {
    const stats = { place: {}, eat: {}, person: {} };

    posts.forEach(post => {
        // 장소 통계
        const adr = post.AREA_ADR;
        if (adr) stats.place[adr] = (stats.place[adr] || 0) + 1;

        // 음식 통계
        const eat = post.Eat;
        if (eat) stats.eat[eat] = (stats.eat[eat] || 0) + 1;

        // 사람 통계 (콤마 분리 처리)
        const people = post.People_meet;
        if (people && people !== "None") {
            people.split(",").forEach(p => {
                const name = p.trim();
                stats.person[name] = (stats.person[name] || 0) + 1;
            });
        }
    });

    // 가장 적게/많이 나타난 데이터 계산 후 UI 반영
    displayEatRecommendation(getMinKey(stats.eat));
    if (Object.keys(stats.person).length > 0) {
        $("#peoname").text(getMaxKey(stats.person));
    }
}

/**
 * [음식 추천 UI]
 */
function displayEatRecommendation(minEat) {
    if (!minEat) return;
    $('#food_no_choose').text(`${minEat}을 안 먹은지 오래되셨더라고요 ( ˘･_･˘ )`);
    
    const menuImages = {
        "한식": ["bibimbap.png", "ramyeon.png", "salad.png", "tteokbokki.png"],
        "일식": ["eelrice.png", "sushi.png", "takoyaki.png"],
        "중식": ["dandan.png", "Dimsum.png", "mutton.png"],
        "양식": ["Hamburger.png", "steak.png"]
    };

    const category = minEat.includes("한식") ? "korean" : 
                     minEat.includes("일식") ? "japan" : 
                     minEat.includes("중식") ? "china" : "american";
    
    const images = menuImages[minEat] || menuImages["한식"];
    const randomImg = images[Math.floor(Math.random() * images.length)];
    
    $("#food_image").html(`<img src="../static/assets/menu/${category}/${randomImg}" alt="${minEat}">`);
}

/**
 * [공통 유틸리티]
 */
function getMaxKey(obj) {
    return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
}

function getMinKey(obj) {
    return Object.keys(obj).reduce((a, b) => obj[a] < obj[b] ? a : b);
}

async function loadGoodSay() {
    const res = await fetch("/Good_Say");
    const data = await res.json();
    $("#good_say").text(data.message);
    $("#good_say_author").text(`- ${data.author} -`);
}

function showRandomMarker(posts) {
    const element = posts[Math.floor(Math.random() * posts.length)];
    const adr = element.AREA_LOAD_ADR !== "null" ? element.AREA_LOAD_ADR : element.AREA_ADR;
    const name = element.AREA_CUSTOM_NAME !== "null" ? element.AREA_CUSTOM_NAME : 
                 (element.AREA_NAME !== "null" ? element.AREA_NAME : "");
    const date = element.Created_At.split("T")[0];

    // 기존 customMarker 함수 호출
    if (typeof customMarker === "function") {
        customMarker(element.Feel, element.AREA_LAT, element.AREA_LNG, adr, name, date, element.Created_At);
    }
}