const al={
    status:{
        httpRequesting:false
    },
    load:function(la,callback,wait=10){
        var l=la
        if(l===undefined){
            l=navigator.language
        }
        setTimeout(function(){
            var it=setInterval(function(){
                if(this.status.httpRequesting!=true){
                    clearInterval(it)
                    if(Object.keys(al.lang).indexOf(l)==-1||l=="default"){
                        l=al.lang.default
                    }
                    var text=Object.keys(al.lang[l])
                    for(var i=0;i<text.length;i++){
                        document.querySelectorAll('[al="'+text[i]+'"]').forEach(function(e){
                            e.innerHTML=al.lang[l][text[i]]
                        })
                    }
                }
            },50)
            if(callback!=undefined||callback!=null){
                callback()
            }
        },wait)
    },
    setLangProp:function(obj){
        if((typeof obj)=="object"){
            this.status.httpRequesting=false
            this.lang=obj
        }
        else{
            this.status.httpRequesting=true
            this.ajax(obj,function(r,s){
                this.lang=JSON.parse(r)
                this.status.httpRequesting=false
            })
        }
    },
    ajax:function(url,callback,method) {
        var m=""+method
        if(m.toLowerCase()!="POST"){
            m="GET"
        }
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                callback(this.responseText,this.status)
            }
        };
        xhttp.open(m, url, true)
        xhttp.send()
    },
    lang:{}
}