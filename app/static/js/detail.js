let postid = ""
let visitor = false
let id = ""
let Author = ""
$(document).ready(function () {
    if (location.href.includes("?")) {
        postid = location.href.split("?")[1].split("postid=")[1]
        if (postid.includes(";")) {
            postid = postid.split(";")[0]
            if (location.href.includes("post_author")) {
                visitor = true
                Author = location.href.split("post_author=")[1].replace(" ", "")
                if (Author.includes(";")) {
                    Author = Author.split(";")[0]
                }
                let page = ""
                if (location.href.includes("?")) {
                    let ihref = location.href.split("?")[1]
                    if (ihref.includes("post_page")) {
                        let plnk = ""
                        if (ihref.includes(";")) {
                            plnk = ihref.split("post_page=")[1].split(";")[0]
                            if (plnk == "") {
                                page = 0
                            } else {
                                page = plnk
                            }
                        } else {
                            plnk = ihref.split("post_page=")[1]
                            if (plnk == "") {
                                page = 0
                            } else {
                                page = plnk
                            }
                        }
                    }
                }

                let userinfo = ""
                $.ajax({
                    url: "/User",
                    method: "POST",
                    data: {
                        id: Author
                    },
                    success: function (response) {
                        //목록 가져오기
                        $.ajax({
                            url: "/WriteA",
                            method: "POST",
                            data: {
                                "Author": Author
                            },
                            success: function (response) {
                                response.forEach(element => {
                                    let now = new Date()

                                    let year = now.getFullYear()
                                    let month = now.getMonth()
                                    let day = now.getDate()
                                    let hours = now.getHours() + 9
                                    let minutes = now.getMinutes()
                                    let seconds = now.getSeconds()

                                    let nowdate = new Date(year, month, day, hours, minutes, seconds)

                                    let chai = nowdate.getTime() - new Date(element.Created_At).getTime()
                                    let a = ""

                                    let wmon = element.Created_At.split("-")[1]
                                    let wday = element.Created_At.split("-")[2].split("T")[0]

                                    if (chai < 1000 * 60)
                                        a += '방금'
                                    else if (chai < 1000 * 60 * 60)
                                        a += Math.floor(chai / (1000 * 60)) + '분 전';
                                    else if (chai < 1000 * 60 * 60 * 24)
                                        a += Math.floor(chai / (1000 * 60 * 60)) + '시간 전';
                                    else if (chai < 1000 * 60 * 60 * 24 * 30)
                                        a += Math.floor(chai / (1000 * 60 * 60 * 24)) + '일 전';
                                    else if (chai < 1000 * 60 * 60 * 24 * 30 * 12)
                                        a += Math.floor(chai / (1000 * 60 * 60 * 24 * 30)) + '달 전';
                                    else
                                        a += Math.floor(chai / (1000 * 60 * 60 * 24 * 30 * 12)) + '년 전';


                                    if (postid == element.Created_At) {
                                        addCard(element)
                                    }
                                });
                            }
                        })
                    }
                })
            }
        }

    } else {
        location.href = `/`;
        alert("표시할 글의 아이디가 지정되어있지 않습니다.\n카드에서 다시 클릭해보세요.\n홈으로 이동합니다.")
    }
    if (document.cookie.includes("user_id=")) {
        login = true
        if (document.cookie.split("user_id=")[1].includes(";")) {
            id = document.cookie.split("user_id=")[1].split(";")[0].replace(" ", "")
        } else {
            id = document.cookie.split("user_id=")[1].replace(" ", "")
        }

        let page = ""
        if (location.href.includes("?")) {
            let ihref = location.href.split("?")[1]
            if (ihref.includes("post_page")) {
                let plnk = ""
                if (ihref.includes(";")) {
                    plnk = ihref.split("post_page=")[1].split(";")[0]
                    if (plnk == "") {
                        page = 0
                    } else {
                        page = plnk
                    }
                } else {
                    plnk = ihref.split("post_page=")[1]
                    if (plnk == "") {
                        page = 0
                    } else {
                        page = plnk
                    }
                }
            }
        }
        $.ajax({
            url: "/User",
            method: "POST",
            data: {
                id: id
            },
            success: function (response) {
                name = response.nickname
                //목록 가져오기
                $.ajax({
                    url: "/WriteA",
                    method: "POST",
                    data: {
                        "Author": id
                    },
                    success: function (response) {
                        response.forEach(element => {
                            let now = new Date()

                            let year = now.getFullYear()
                            let month = now.getMonth()
                            let day = now.getDate()
                            let hours = now.getHours() + 9
                            let minutes = now.getMinutes()
                            let seconds = now.getSeconds()

                            let nowdate = new Date(year, month, day, hours, minutes, seconds)

                            let chai = nowdate.getTime() - new Date(element.Created_At).getTime()
                            let a = ""

                            let wmon = element.Created_At.split("-")[1]
                            let wday = element.Created_At.split("-")[2].split("T")[0]

                            if (chai < 1000 * 60)
                                a += '방금'
                            else if (chai < 1000 * 60 * 60)
                                a += Math.floor(chai / (1000 * 60)) + '분 전';
                            else if (chai < 1000 * 60 * 60 * 24)
                                a += Math.floor(chai / (1000 * 60 * 60)) + '시간 전';
                            else if (chai < 1000 * 60 * 60 * 24 * 30)
                                a += Math.floor(chai / (1000 * 60 * 60 * 24)) + '일 전';
                            else if (chai < 1000 * 60 * 60 * 24 * 30 * 12)
                                a += Math.floor(chai / (1000 * 60 * 60 * 24 * 30)) + '달 전';
                            else
                                a += Math.floor(chai / (1000 * 60 * 60 * 24 * 30 * 12)) + '년 전';


                            if (postid == element.Created_At) {
                                addCard(element)
                            }
                        });
                    }
                })
            }
        })

    } else {
        if (!location.href.includes("post_author")) {
            if (location.href.includes("?")) {
                loc = location.href.split("?")[1].split("postid=")[1]
                location.href = `/Login?loc = write/detail?postid=${loc}`
            } else {
                location.href = `/Login?loc = `;
            }
            login = false
            alert("로그인이 필요합니다.")
        }
    }
})



function addCard(element) {
    console.log(element)
    let wyear = element.Created_At.split("-")[0]
    let wmon = element.Created_At.split("-")[1]
    let wday = element.Created_At.split("-")[2].split("T")[0]

    let Date = wyear + "년 " + wmon + "월 " + wday + "일"
    let people_meet = ""
    let image = ""
    let card = ""
    if (element.People_meet == "None") {
        people_meet = "없음"
    } else {
        people_meet = element.People_meet
    }

    if (element.AttachFiles == "null" || element.AttachFiles == "") {
        card = Card(element.Name, element.AREA_ADR, people_meet, Date, element.Feel, element.Description, element.Eat)
    } else {
        image = element.AttachFiles
        card = CardI(element.Name, element.AREA_ADR, people_meet, image, Date, element.Feel, element.Description, element.Eat)
    }

    $('#main').prepend(card)
}

function copyURL() {
    navigator.clipboard.writeText(window.location.href + ";post_author=" + id);
    alert("클립보드에 링크를 복사했습니다!")
}

Kakao.init('4c43d4733daa8022e6465b441f59f10c')
function kakaoTalkShare() {
    Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
            title: '저의 일기를 공유합니다!',
            description: '저의 일기를 여러분에게 공유합니다!',
            imageUrl:
                'https://firebasestorage.googleapis.com/v0/b/chi-talk.appspot.com/o/daily-log%2Fstory_img1.png?alt=media&token=74437281-f431-4b02-9250-e8410eceffc2',
            link: {
                mobileWebUrl: 'https://daily-log.co.kr',
                webUrl: 'https://daily-log.co.kr',
            },
        },
        buttons: [
            {
                title: '일기 보러가기',
                link: {
                    mobileWebUrl: window.location.href + ";post_author=" + id,
                    webUrl: window.location.href + ";post_author=" + id,
                },
            },
            {
                title: '나도 쓰러가기',
                link: {
                    mobileWebUrl: 'https://daily-log.co.kr',
                    webUrl: 'https://daily-log.co.kr',
                },
            }
        ],
    });
}

function kakaoStoryShare() {
    Kakao.Story.share({
        url: window.location.href + ";post_author=" + id,
        text: '저의 일기를 공유합니다!'
    })
}

function twiterShare() {
    const pageUrl = window.location.href + ";post_author=" + id
    window.open(`https://twitter.com/intent/tweet?text=저의 일기를 공유합니다.\n&url=${pageUrl}`, '트위터 공유', "width=870, height=880, resizable = no, scrollbars = no")
}

function facebookShare() {
    const pageUrl = window.location.href + ";post_author=" + id
    window.open(`http://www.facebook.com/sharer/sharer.php?u=${pageUrl}`, '페이스북 공유', "width=870, height=880, resizable = no, scrollbars = no")
}

function Delete() {
    if (confirm("정말 삭제하시겠습니까?\n이 작업은 취소할수 없습니다!") == true) {
        let created_At = location.href.split("?")[1].split("postid=")[1]
        $.ajax({
            url: '/Write',
            method: "DELETE",
            data: {
                'id': id,
                'Created_At': created_At
            },
            success: function (response) {
                location.href = "/"
                alert("글을 삭제했습니다.")
            }
        })
    }
}

function CardI(name, adr, people_meet, image, date, feel, desc, Eat) {
    if (desc.length > 60) {
        descleng = desc.length

    }

    if (visitor == false) {
        return `<section id="section">
                    <div class="detail_wrap">
                        <div class="detail_section">
                            <div class="detail_title">
                                <h1>${name}</h1>
                            </div>
                            <div class="picture">
                                <a href="${image}" target="_blank"><img src="${image}" alt="메뉴의 마이페이지 아이콘"></a>
                            </div>
                            <div class="detail_content">
                                <div class="comment1">
                                    <p>${date}</p>
                                    <p>장소 : ${adr}</p>
                                    <p>기분 : ${feel}</p>
                                    <p>누구랑 : ${people_meet}</p>
                                    <p>음식 : ${Eat}</p>
                                </div>
                                <div>
                                    <div class="comment2">
                                        <p>
                                        ${desc}
                                        </p>
                                    </div>
                                </div>
                                <div class="detail_bT">
                                    <a href="/write/edit?postid=${postid}" ><input type="submit" class="submit" value="수정">
                                    <a href="#" onclick="Delete()"><input type="reset" class="submit" value="삭제"></a>
                                </div>
                                <div class="detail_button">
                                    <a href="javascript:copyURL()"><img src="../static/assets/share_icon/copy.png" class="share_icon" alt="메뉴의 공유 아이콘"></a>
                                    <a href="javascript:kakaoTalkShare()"><img src="../static/assets/share_icon/kakao.png" class="share_icon" alt="메뉴의 공유 아이콘"></a>
                                    <a href="javascript:kakaoStoryShare()"><img src="../static/assets/share_icon/kakaostory.png" class="share_icon" alt="메뉴의 공유 아이콘"></a>
                                    <a href="javascript:twiterShare()"><img src="../static/assets/share_icon/twiter.png" class="share_icon" alt="메뉴의 공유 아이콘"></a>
                                    <a href="javascript:facebookShare()"><img src="../static/assets/share_icon/facebook.png" class="share_icon" alt="메뉴의 공유 아이콘"></a>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </section>`
    } else {
        return `<section id="section">
                    <div class="detail_wrap">
                        <div class="detail_section">
                            <div class="detail_title">
                                <h1>${name}</h1>
                            </div>
                            <div class="picture">
                                <a href="${image}" target="_blank"><img src="${image}" alt="메뉴의 마이페이지 아이콘"></a>
                            </div>
                            <div class="detail_content">
                                <div class="comment1">
                                    <p>${date}</p>
                                    <p>장소 : ${adr}</p>
                                    <p>기분 : ${feel}</p>
                                    <p>누구랑 : ${people_meet}</p>
                                    <p>음식 : ${Eat}</p>
                                </div>
                                <div>
                                    <div class="comment2">
                                        <p>
                                        ${desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>`
    }
}
function Card(name, adr, people_meet, date, feel, desc, Eat) {
    if (desc.length > 60) {
        desc = desc.substring(0, 61) + "\n" + desc.substring(62)
    }

    if (visitor == false) {
        return `<section id="section">
                    <div class="detail_wrap">
                        <div class="detail_section">
                            <div class="detail_title">
                                <h1>${name}</h1>
                            </div>
                            <div class="picture">
                            </div>
                            <div class="detail_content">
                                <div class="comment1">
                                    <p>${date}</p>
                                    <p>장소 : ${adr}</p>
                                    <p>기분 : ${feel}</p>
                                    <p>누구랑 : ${people_meet}</p>
                                    <p>음식 : ${Eat}</p>
                                </div>
                                <div>
                                    <div class="comment2">
                                        <p>
                                        ${desc}
                                        </p>
                                    </div>
                                </div>
                                <div class="detail_bT">
                                    <a href="/write/edit?postid=${postid}"><input type="submit" class="submit" value="수정">
                                    <a href="#" onclick="Delete()"><input type="reset" class="submit" value="삭제"></a>
                                </div>
                                <div class="detail_button">
                                    <a href="javascript:copyURL()"><img src="../static/assets/share_icon/copy.png" class="share_icon" alt="메뉴의 공유 아이콘"></a>
                                    <a href="javascript:kakaoTalkShare()"><img src="../static/assets/share_icon/kakao.png" class="share_icon" alt="메뉴의 공유 아이콘"></a>
                                    <a href="javascript:kakaoStoryShare()"><img src="../static/assets/share_icon/kakaostory.png" class="share_icon" alt="메뉴의 공유 아이콘"></a>
                                    <a href="javascript:twiterShare()"><img src="../static/assets/share_icon/twiter.png" class="share_icon" alt="메뉴의 공유 아이콘"></a>
                                    <a href="javascript:facebookShare()"><img src="../static/assets/share_icon/facebook.png" class="share_icon" alt="메뉴의 공유 아이콘"></a>
                                </div>                            
                            </div>
                        </div>
                    </div>
                </section>`
    } else {
        return `<section id="section">
            <div class="detail_wrap">
                <div class="detail_section">
                    <div class="detail_title">
                        <h1>${name}</h1>
                    </div>
                    <div class="picture">
                    </div>
                    <div class="detail_content">
                        <div class="comment1">
                            <p>${date}</p>
                            <p>장소 : ${adr}</p>
                            <p>기분 : ${feel}</p>
                            <p>누구랑 : ${people_meet}</p>
                            <p>음식 : ${Eat}</p>
                        </div>
                        <div>
                            <div class="comment2">
                                <p>
                                ${desc}
                                </p>
                            </div>
                        </div>                          
                    </div>
                </div>
            </div>
        </section>`
    }
}