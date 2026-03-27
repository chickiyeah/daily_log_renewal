$(document).ready(function () {
    $("#RSTPW").click(RstPW())
    $('#findid').click(function () {
        var name = $("#name1").val();
        var birthday = $("#birthday1").val();
        var phone = $("#phone1").val()

        $.ajax({
            type: "POST",
            url: "/User/FindID",
            dataType: "json",
            data: {
                'name': name,
                'birthday': birthday,
                'phone' : phone
            },
            success: function (response) {
                idlist = response
                var message = idlist.length+"개의 계정이 확인되었습니다.\n"

                idlist.forEach(element => {
                    message = message +""+element.email+"\n"
                });
                alert(message)
            },
            error: function () {
                if (name == "" || email == "" || phone == "") {
                    alert('이름, 전화번호, 이메일을 입력해주세요.');
                } else {
                    alert('입력하신 정보가 일치하지 않거나 존재하지 않습니다.');
                }
            },
        });
    })
});