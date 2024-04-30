const al={
    status:{
        httpRequesting:false
    },
    load:function(l=navigator.language,mode=this.mode.HTML,callback,wait=0){
        setTimeout(function(){
            if(Object.keys(al.lang).indexOf(l)===-1||l=="default"){
                l=al.lang.default
            }
            var text=Object.keys(al.lang[l])
            if(mode===al.mode.REPLACE){
                for(var i=0;i<text.length;i++){
                    document.querySelectorAll('[al]').forEach(function(e){
                        let z=new RegExp(text[i],"gi")
                        e.innerHTML=e.innerHTML.replace(z,al.lang[l][text[i]])
                    })
                }
                callback()
                return
            }
            for(var i=0;i<text.length;i++){
                document.querySelectorAll('[al="'+text[i]+'"]').forEach(function(e){
                    switch(mode){
                        case al.mode.HTML:
                            e.innerHTML=al.lang[l][text[i]]
                            break
                        case al.mode.TEXT:
                            e.innerText=al.lang[l][text[i]]
                            break
                        default:
                            e.innerHTML=al.lang[l][text[i]]
                    }
                })
            }
        },wait)
    },
    setLangProp:function(obj){
        if((typeof obj)=="object") this.lang=obj
        else this.lang=JSON.parse(obj)
    },
    ajax:function(url,callback,method) {
        var m=""+method
        if(m.toLowerCase()!="post") m="GET"
        var xhttp=new XMLHttpRequest()
        xhttp.onreadystatechange=function() {
            if (this.readyState==4) {
                callback(this.responseText,this.status)
            }
        };
        xhttp.open(m, url, true)
        xhttp.send()
    },
    ver:[2,"1.0.1"],
    mode:{
        HTML:0,
        TEXT:1,
        TEXT_ALL:2,
        REPLACE:3
    },
    lang:{}
}