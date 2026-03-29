/**
 * [랭킹 페이지 로직]
 * 데이터를 한 번만 불러와서 메모리에 저장하고 탭 전환 시 즉시 계산합니다.
 */
let allPosts = []; // 서버에서 가져온 전체 게시글 저장용
let token = localStorage.getItem("userToken");

$(document).ready(async function () {
    if (!token) {
        alert("로그인이 필요합니다.");
        location.href = "/login?loc=rank";
        return;
    }

    // 1. 초기 데이터 로드 (딱 한 번)
    await fetchAllPosts();

    // 2. 초기 화면은 '기분' 통계 표시
    if (allPosts.length > 0) {
        getFeelPercent();
    } else {
        $("#ranking_card").html("<div class='no_data'>아직 작성된 기록이 없습니다.</div>");
    }
});

/**
 * 서버에서 나의 모든 게시글 가져오기
 */
async function fetchAllPosts() {
    try {
        const response = await fetch('/api/posts/mine', { // 백엔드 API 경로 확인
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            allPosts = await response.json();
        } else {
            console.error("데이터 로드 실패");
        }
    } catch (err) {
        console.error("서버 통신 오류:", err);
    }
}

/**
 * 공통 통계 계산 및 렌더링 함수
 * @param {string} type - 'feel', 'place', 'person', 'eat'
 */
function calculateAndRender(type) {
    const counts = {};
    let totalItems = 0;

    allPosts.forEach(post => {
        let values = [];

        if (type === 'feel') values = [post.feel];
        else if (type === 'place') values = [post.area_adr];
        else if (type === 'eat') values = [post.eat];
        else if (type === 'person') {
            // 사람 데이터는 콤마 분리 처리
            if (post.people_meet && post.people_meet !== "None") {
                values = post.people_meet.split(",").map(s => s.trim());
            }
        }

        values.forEach(val => {
            if (val && val !== "null") {
                counts[val] = (counts[val] || 0) + 1;
                totalItems++;
            }
        });
    });

    // 객체를 배열로 변환 후 정렬
    const sortedArr = Object.entries(counts)
        .map(([name, count]) => ({
            name,
            per: ((count / totalItems) * 100).toFixed(2)
        }))
        .sort((a, b) => b.per - a.per);

    // 상위 3개 출력
    $("#ranking_card").empty();
    for (let i = 0; i < Math.min(3, sortedArr.length); i++) {
        addCard(i + 1, sortedArr[i].name, sortedArr[i].per);
    }
}

/**
 * 탭 클릭 시 호출되는 함수들 (기존 함수명 유지)
 */
function getFeelPercent() { 
    updateTabUI(0);
    calculateAndRender('feel'); 
}
function getPlacePercent() { 
    updateTabUI(1);
    calculateAndRender('place'); 
}
function getPersonPercent() { 
    updateTabUI(2);
    calculateAndRender('person'); 
}
function getEatPercent() { 
    updateTabUI(3);
    calculateAndRender('eat'); 
}

/**
 * UI 보조 함수
 */
function updateTabUI(index) {
    $(".ranking_category li").removeClass("active");
    $(".ranking_category li").eq(index).addClass("active");
}

function addCard(rank, str, per) {
    let card = Card(rank, str, per);
    $("#ranking_card").append(card);
}

function Card(rank, str, per) {
    // 기존 HTML 구조 유지
    return `<div>
                <div class="square">
                    <span></span><span></span><span></span>
                </div>
                <div class="ranking_text2">
                    <h2>${rank}위</h2>
                    <h4>${str}</h4>
                    <p>${per}%</p>
                </div>
            </div>`;
}