$(document).ready(function () {
    if(document.cookie.includes("user_id=")){
        login = true
        if(document.cookie.split("user_id=")[1].includes(";")){
            id = document.cookie.split("user_id=")[1].split(";")[0].replace(" ","")
        }else{
            id = document.cookie.split("user_id=")[1].replace(" ","")
        }
        getFeelPercent()
        $.ajax({
            url:"/User",
            method:"POST",
            data:{
                id:id
            },
            success: function(response){
                let name = response.nickname
                            //목록 가져오기
                $.ajax({
                    url:"/WriteA",
                    method:"POST",
                    data:{
                        "Author":id
                    },
                    success: function(response){
                        response.forEach(element => {
                            let now = new Date()

                            let year = now.getFullYear()
                            let month = now.getMonth()
                            let day = now.getDate()
                            let hours = now.getHours()+9
                            let minutes = now.getMinutes()
                            let seconds = now.getSeconds()

                            let nowdate = new Date(year, month, day, hours, minutes, seconds)

                            let chai = nowdate.getTime() - new Date(element.Created_At).getTime()
                            let a = ""

                            let wmon = new Date(element.Created_At).getUTCMonth()
                            let wday = new Date(element.Created_At).getDate()

                            if(chai < 1000 * 60)
                                a += '방금'
                            else if(chai < 1000 * 60 * 60)
                                a += Math.floor(chai / (1000 * 60)) + ' 분전';
                            else if(chai < 1000 * 60 * 60 * 24)
                                a += Math.floor(chai / (1000 * 60 * 60)) + ' 시간전';
                            else if(chai < 1000 * 60 * 60 * 24 * 30)
                                a += Math.floor(chai / (1000 * 60 * 60 * 24)) + ' 일전';
                            else if(chai < 1000 * 60 * 60 * 24 * 30 * 12)
                                a += Math.floor(chai / (1000 * 60 * 60 * 24 * 30)) + ' 달전';
                            
                            //addCard(wmon+"/"+wday, element.Description, name, a)
                        });
                    }
                })
            }
        })

    }else{ 
        login = false
        location.href = "/Login?loc = rank"
        alert("로그인이 필요합니다.")
    }
})

function compare(a, b) {
    return a-b
}


function addCard(rank, str, per) {
    let card = Card(rank, str, per)
    $("#ranking_card").append(card)
}

function Card(rank, str, per) {
return `<div>
            <div class="square">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="ranking_text2">
                <h2>${rank}위</h2>
                <h4>${str}</h4>
                <p>${per}%</p>
            </div>
        </div>`
}

function getFeelPercent(){
    $.ajax({
        url:"/WriteA",
        method:"POST",
        data:{
            "Author":id
        },
        success: function(response){
            let great = 0
            let good = 0
            let medium = 0
            let bad = 0
            let too_bad = 0
            let total = 0
            response.forEach(element => {
                feel = element.Feel
                if(feel == "맑음"){
                    great += 1
                }
                if(feel == "흐림"){
                    good += 1
                }
                if(feel == "비"){
                    medium += 1
                }                    
                if(feel == "눈"){
                    bad += 1
                }
                if(feel == "바람"){
                    too_bad += 1
                }
            });
            total = great+good+medium+bad+too_bad
            let greatper = (great / total * 100)
            let goodper = (good / total * 100)
            let mediumper = (medium / total * 100)
            let badper = (bad / total * 100)
            let too_badper = (too_bad / total * 100)

            const per = [greatper,goodper,mediumper,badper,too_badper];
            per.sort(function(a,b) {
                return b-a;
            })
            let top = []
            per.forEach(element => {
                if(greatper == element){
                    data = {
                        "name":"맑음",
                        "per":element.toFixed(2)
                    }
                    top.push(data)
                }

                if(goodper == element){
                    data = {
                        "name":"흐림",
                        "per":element.toFixed(2)
                    }
                    top.push(data)
                }

                if(mediumper == element){
                    data = {
                        "name":"비",
                        "per":element.toFixed(2)
                    }
                    top.push(data)
                }

                if(badper == element){
                    data = {
                        "name":"눈",
                        "per":element.toFixed(2)
                    }
                    top.push(data)
                }

                if(too_badper == element){
                    data = {
                        "name":"바람",
                        "per":element.toFixed(2)
                    }
                    top.push(data)
                }
            });

            console.log(top)
            $("#ranking_card").empty()
            for(var i = 0; i < 3; i++){
                 j = i + 1                   
                 console.log(j,top[i].name,top[i].per)
                 addCard(j,top[i].name,top[i].per)
            }          
        }
    });
}

function getPlacePercent(){
    $.ajax({
        url:"/WriteA",
        method:"POST",
        data:{
            "Author":id
        },
        success: function(response){
            const result = {};
            response.forEach(element => {
                adr = element.AREA_ADR
                result[adr] = (result[adr] || 0)+1; 
            })

            
            let per = []
            let resmap = new Map(Object.entries(result))
            const mapSort1 = new Map([...resmap.entries()].sort((a, b) => b[1] - a[1]));
            let max = 0

            mapSort1.forEach(element => {
                max += element
            })

            mapSort1.forEach(element => {
                percent = element/max * 100
                per.push(percent.toFixed(2))
            })

            let keyarr = Array.from(mapSort1.keys())
            let permap = []
            for(var i = 0; i < keyarr.length; i++){
                permap.push({'name':keyarr[i], 'per':per[i]})
            }

            $("#ranking_card").empty()
            for(var i = 0; i < 3; i++){
                 j = i + 1                   
                 console.log(j,permap[i].name,permap[i].per)
                 addCard(j,permap[i].name,permap[i].per)
            }          
        }
    })        
}

function getPersonPercent() {
    $.ajax({
        url:"/WriteA",
        method:"POST",
        data:{
            "Author":id
        },
        success: function(response){
            const result = {};
            response.forEach(element => {
                peo = element.People_meet

                if(peo.includes(",")){
                    peo.split(",").forEach(ele => {
                        result[ele] = (result[ele] || 0)+1; 
                    })
                }else{
                    if(peo != "None"){
                        result[peo] = (result[peo] || 0)+1; 
                    }
                }
                
            })

            
            let per = []
            let resmap = new Map(Object.entries(result))
            const mapSort1 = new Map([...resmap.entries()].sort((a, b) => b[1] - a[1]));
            let max = 0

            mapSort1.forEach(element => {
                max += element
            })

            mapSort1.forEach(element => {
                percent = element/max * 100
                per.push(percent.toFixed(2))
            })

            let keyarr = Array.from(mapSort1.keys())
            let permap = []
            for(var i = 0; i < keyarr.length; i++){
                permap.push({'name':keyarr[i], 'per':per[i]})
            }
            
            
            $("#ranking_card").empty()
            for(var i = 0; i < 3; i++){
                 j = i + 1                   
                 console.log(j,permap[i].name,permap[i].per)
                 addCard(j,permap[i].name,permap[i].per)
            }          
                
            

        }
    })           
}

function getEatPercent(){
    $.ajax({
        url:"/WriteA",
        method:"POST",
        data:{
            "Author":id
        },
        success: function(response){
            const result = {};
                response.forEach(element => {
                    adr = element.Eat
                    result[adr] = (result[adr] || 0)+1; 
                })
    
                
                let per = []
                let resmap = new Map(Object.entries(result))
                const mapSort1 = new Map([...resmap.entries()].sort((a, b) => b[1] - a[1]));
                let max = 0
    
                mapSort1.forEach(element => {
                    max += element
                })
    
                mapSort1.forEach(element => {
                    percent = element/max * 100
                    per.push(percent.toFixed(2))
                })
    
                let keyarr = Array.from(mapSort1.keys())
                let permap = []
                for(var i = 0; i < keyarr.length; i++){
                    permap.push({'name':keyarr[i], 'per':per[i]})
                }

                
                $("#ranking_card").empty()
                for(var i = 0; i < 3; i++){
                     j = i + 1                   
                     console.log(j,permap[i].name,permap[i].per)
                     addCard(j,permap[i].name,permap[i].per)
                }                      
    
        }
    });
}
