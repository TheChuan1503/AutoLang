const al = {
    load: function(l = navigator.language, mode = this.mode.HTML, callback, wait = 0) {
        setTimeout(function() {

            if (Object.keys(al.lang).indexOf(l) === -1) {
                if (l == "default") {
                    l = al.lang.default
                } else {
                    if (l.indexOf("-") != -1) {
                        var c = l.split("-")[0]
                    } else var c = l
                    if (Object.keys(al.lang.default_country).indexOf(c) != -1) {
                        l = al.lang.default_country[c]
                    } else l = al.lang.default
                }
            }
            var text = Object.keys(al.lang[l])
            if (mode === al.mode.REPLACE) {
                for (var i = 0; i < text.length; i++) {
                    document.querySelectorAll('[al]').forEach(function(e) {
                        let z = new RegExp(text[i], "gi")
                        e.innerHTML = e.innerHTML.replace(z, al.lang[l][text[i]])
                    })
                }
                callback()
                return
            }
            for (var i = 0; i < text.length; i++) {
                document.querySelectorAll('[al="' + text[i] + '"]').forEach(function(e) {
                    switch (mode) {
                        case al.mode.HTML:
                            e.innerHTML = al.lang[l][text[i]]
                            break
                        case al.mode.TEXT:
                            e.innerText = al.lang[l][text[i]]
                            break
                        default:
                            e.innerHTML = al.lang[l][text[i]]
                    }
                })
            }
        }, wait)
    },
    setLangProp: function(obj) {
        if ((typeof obj) == "object") this.lang = obj
        else this.lang = JSON.parse(obj)
    },
    httpGet: function(url, callback) {
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                callback(this.responseText, this.status)
            }
        }
        xhttp.open("GET", url, true)
        xhttp.send()
    },
    ver: [3, "1.1.0"],
    mode: {
        HTML: 0,
        TEXT: 1,
        TEXT_ALL: 2,
        REPLACE: 3
    },
    lang: {}
}