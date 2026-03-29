/**
 * [상세보기 메인 로직] - 기존 CardI / Card 구조 100% 유지
 */
let postid = "";
let visitor = false;
let currentUserId = ""; // 전역 변수로 관리

$(document).ready(async function () {
    // 1. URL 파라미터 추출
    const urlParams = new URLSearchParams(window.location.search);
    postid = urlParams.get('postid');
    const authorParam = urlParams.get('post_author');

    if (!postid) {
        alert("글 번호가 없습니다. 홈으로 이동합니다.");
        location.href = "/";
        return;
    }

    // 2. 로그인 정보 확인 및 유저 ID 가져오기
    const token = localStorage.getItem("userToken");
    
    if (token) {
        try {
            // 서버에서 내 정보 가져와서 currentUserId 설정
            const userRes = await fetch('/api/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userRes.ok) {
                const userData = await userRes.json();
                currentUserId = userData.id; // 여기서 ID 할당
            }
        } catch (e) {
            console.error("유저 정보 로드 실패", e);
        }
    }

    // 3. 방문자 여부 판단
    // URL에 post_author가 있거나, 로그인이 안 되어 있다면 방문자 모드
    if (authorParam || !token) {
        visitor = true;
    }

    // 4. 서버에서 게시글 데이터 가져오기
    loadDetailData(postid, token);
});

/**
 * 서버에서 데이터 로드
 */
async function loadDetailData(postId, token) {
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (!response.ok) throw new Error("데이터 로드 실패");

        const element = await response.json();
        
        // 데이터 전처리 (기존 로직 유지)
        let wyear = element.created_at.split("-")[0];
        let wmon = element.created_at.split("-")[1];
        let wday = element.created_at.split("-")[2].split("T")[0];
        let dateStr = wyear + "년 " + wmon + "월 " + wday + "일";
        
        let people_meet = (element.people_meet == "None" || !element.people_meet) ? "없음" : element.people_meet;
        
        // 기존 UI 함수 호출
        let card = "";
        // image_url 필드명은 백엔드 모델에 맞춰 확인 필요 (기존 AttachFiles 대응)
        const imgUrl = element.image_url || element.AttachFiles;

        if (!imgUrl || imgUrl == "null" || imgUrl == "") {
            card = Card(element.title, element.area_adr, people_meet, dateStr, element.feel, element.content, element.eat);
        } else {
            card = CardI(element.title, element.area_adr, people_meet, imgUrl, dateStr, element.feel, element.content, element.eat);
        }

        $('#main').html(card);

    } catch (err) {
        console.error(err);
        alert("글을 불러올 수 없거나 권한이 없습니다.");
        location.href = "/write/1";
    }
}

// --- 기존 CardI 구조 유지 (이미지 있는 경우) ---
function CardI(name, adr, people_meet, image, date, feel, desc, Eat) {
    let actionButtons = "";
    let shareButtons = "";

    if (visitor == false) {
        actionButtons = `
            <div class="detail_bT">
                <a href="/write/edit?postid=${postid}"><input type="submit" class="submit" value="수정"></a>
                <a href="#" onclick="Delete()"><input type="reset" class="submit" value="삭제"></a>
            </div>`;
        shareButtons = `
            <div class="detail_button">
                <a href="javascript:copyURL()"><img src="../static/assets/share_icon/copy.png" class="share_icon"></a>
                <a href="javascript:kakaoTalkShare()"><img src="../static/assets/share_icon/kakao.png" class="share_icon"></a>
                <a href="javascript:twiterShare()"><img src="../static/assets/share_icon/twiter.png" class="share_icon"></a>
                <a href="javascript:facebookShare()"><img src="../static/assets/share_icon/facebook.png" class="share_icon"></a>
            </div>`;
    }

    return `<section id="section">
                <div class="detail_wrap">
                    <div class="detail_section">
                        <div class="detail_title"><h1>${name}</h1></div>
                        <div class="picture">
                            <a href=${image} target="_blank"><img src=${image} alt="첨부이미지"></a>
                        </div>
                        <div class="detail_content">
                            <div class="comment1">
                                <p>${date}</p>
                                <p>장소 : ${adr}</p>
                                <p>기분 : ${feel}</p>
                                <p>누구랑 : ${people_meet}</p>
                                <p>음식 : ${Eat}</p>
                            </div>
                            <div class="comment2"><p>${desc}</p></div>
                            ${actionButtons}
                            ${shareButtons}
                        </div>
                    </div>
                </div>
            </section>`;
}

// --- 기존 Card 구조 유지 (이미지 없는 경우) ---
function Card(name, adr, people_meet, date, feel, desc, Eat) {
    if (desc.length > 60) {
        desc = desc.substring(0, 61) + "\n" + desc.substring(61);
    }

    let actionButtons = "";
    let shareButtons = "";

    if (visitor == false) {
        actionButtons = `
            <div class="detail_bT">
                <a href="/write/edit?postid=${postid}"><input type="submit" class="submit" value="수정"></a>
                <a href="#" onclick="Delete()"><input type="reset" class="submit" value="삭제"></a>
            </div>`;
        shareButtons = `
            <div class="detail_button">
                <a href="javascript:copyURL()"><img src="../static/assets/share_icon/copy.png" class="share_icon"></a>
                <a href="javascript:kakaoTalkShare()"><img src="../static/assets/share_icon/kakao.png" class="share_icon"></a>
                <a href="javascript:twiterShare()"><img src="../static/assets/share_icon/twiter.png" class="share_icon"></a>
                <a href="javascript:facebookShare()"><img src="../static/assets/share_icon/facebook.png" class="share_icon"></a>
            </div>`;
    }

    return `<section id="section">
                <div class="detail_wrap">
                    <div class="detail_section">
                        <div class="detail_title"><h1>${name}</h1></div>
                        <div class="detail_content">
                            <div class="comment1">
                                <p>${date}</p>
                                <p>장소 : ${adr}</p>
                                <p>기분 : ${feel}</p>
                                <p>누구랑 : ${people_meet}</p>
                                <p>음식 : ${Eat}</p>
                            </div>
                            <div class="comment2"><p>${desc}</p></div>
                            ${actionButtons}
                            ${shareButtons}
                        </div>
                    </div>
                </div>
            </section>`;
}

/**
 * 글 삭제 기능
 */
async function Delete() {
    if (!confirm("정말 삭제하시겠습니까?\n이 작업은 취소할 수 없습니다!")) return;
    
    const token = localStorage.getItem("userToken");
    try {
        const response = await fetch(`/api/posts/${postid}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert("글이 삭제되었습니다.");
            location.href = "/write/1";
        } else {
            alert("삭제 권한이 없거나 오류가 발생했습니다.");
        }
    } catch (err) {
        alert("삭제 처리 중 오류 발생");
    }
}

/**
 * 공유 기능 관련 함수
 */
function copyURL() {
    const url = window.location.origin + window.location.pathname + "?postid=" + postid + "&post_author=" + currentUserId;
    navigator.clipboard.writeText(url).then(() => {
        alert("공유 링크가 클립보드에 복사되었습니다!");
    });
}

// 카카오 SDK 초기화
if (!Kakao.isInitialized()) {
    Kakao.init('4c43d4733daa8022e6465b441f59f10c');
}

function kakaoTalkShare() {
    const shareUrl = window.location.origin + window.location.pathname + "?postid=" + postid + "&post_author=" + currentUserId;
    Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
            title: '저의 일기를 공유합니다!',
            description: '저의 일기를 여러분에게 공유합니다!',
            imageUrl: 'https://dailylog.decodns.org/static/assets/house.svg',
            link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
            },
        },
        buttons: [
            {
                title: '일기 보러가기',
                link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
            },
            {
                title: '나도 쓰러가기',
                link: { mobileWebUrl: 'https://dailylog.decodns.org', webUrl: 'https://dailylog.decodns.org' },
            }
        ],
    });
}

function kakaoStoryShare() {
    const shareUrl = window.location.origin + window.location.pathname + "?postid=" + postid + "&post_author=" + currentUserId;
    Kakao.Story.share({
        url: shareUrl,
        text: '저의 일기를 공유합니다!'
    });
}

function twiterShare() {
    const shareUrl = window.location.origin + window.location.pathname + "?postid=" + postid + "&post_author=" + currentUserId;
    window.open(`https://twitter.com/intent/tweet?text=저의 일기를 공유합니다.\n&url=${encodeURIComponent(shareUrl)}`, '트위터 공유', "width=870, height=880");
}

function facebookShare() {
    const shareUrl = window.location.origin + window.location.pathname + "?postid=" + postid + "&post_author=" + currentUserId;
    window.open(`http://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '페이스북 공유', "width=870, height=880");
}