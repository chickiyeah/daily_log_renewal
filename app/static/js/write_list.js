// app/static/js/write_list.js

$(document).ready(function () {
    const token = localStorage.getItem("userToken");
    
    if (!token) {
        alert("로그인이 필요합니다.");
        location.href = "/login?loc=write/1";
        return;
    }

    // 현재 페이지 번호 가져오기 (URL 파라미터)
    const urlParams = new URLSearchParams(window.location.search);
    let currentPage = parseInt(urlParams.get('post_page')) || 0;

    loadPosts(currentPage);
});

async function loadPosts(page) {
    const token = localStorage.getItem("userToken");
    
    try {
        const response = await fetch(`/api/posts/my-list?page=${page}&limit=10`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("데이터를 불러오는데 실패했습니다.");

        const data = await response.json();
        renderList(data.items);
        renderPagination(data.total, data.page, data.limit);

    } catch (err) {
        console.error(err);
        alert("일기 목록을 가져오는 중 오류가 발생했습니다.");
    }
}

function renderList(items) {
    const container = $("#write_main");
    container.empty();

    if (items.length === 0) {
        container.append('<p class="empty-msg">작성된 일기가 없습니다.</p>');
        return;
    }

    items.forEach(item => {
        const dateObj = new Date(item.created_at);
        const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        const timeAgo = getTimeAgo(dateObj);
        const title = item.title.length > 48 ? item.title.substring(0, 47) + "..." : item.title;

        const html = `
            <a href="/write/detail?postid=${item.id}">
                <div class="write_box">
                    <div>
                        <h2>${dateStr}</h2>
                        <p>${title}</p>
                    </div>
                    <div class="user_info">
                        <p>${item.feel || '보통'}</p>
                        <p>${timeAgo}</p>
                    </div>
                </div>
            </a>`;
        container.append(html);
    });
}

function renderPagination(total, currentPage, limit) {
    const totalPages = Math.ceil(total / limit);
    const $pager = $('#PageNum');
    $pager.empty();

    // 이전 페이지 버튼
    if (currentPage > 0) {
        $pager.append(`<a href="?post_page=${currentPage - 1}"><div class="befone">&lt;</div></a>`);
    }

    // 페이지 번호 (최대 5개씩 표시 예시)
    for (let i = 0; i < totalPages; i++) {
        const activeClass = i === currentPage ? "selpnum" : "pnum";
        $pager.append(`<a href="?post_page=${i}"><div class="${activeClass}">${i + 1}</div></a>`);
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages - 1) {
        $pager.append(`<a href="?post_page=${currentPage + 1}"><div class="nextone">&gt;</div></a>`);
    }
}

// 시간 계산 유틸리티
function getTimeAgo(date) {
    const diff = new Date() - date;
    const min = 60 * 1000;
    const hour = min * 60;
    const day = hour * 24;

    if (diff < min) return '방금 전';
    if (diff < hour) return Math.floor(diff / min) + '분 전';
    if (diff < day) return Math.floor(diff / hour) + '시간 전';
    return Math.floor(diff / day) + '일 전';
}