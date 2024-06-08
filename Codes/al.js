const al = {
    load: function(l = navigator.language, mode = this.mode.HTML, callback = function() {}, wait = 0) {
        setTimeout(function() {
            if (Object.keys(al.lang).indexOf(l) === -1) {
                if (l == "default") {
                    l = al.lang.default
                } else {
                    if (l.indexOf("-") != -1) {
                        var c = l.split("-")[0]
                    } else var c = l
                    if (al.lang.default_country != undefined) {
                        if (Object.keys(al.lang.default_country).indexOf(c) != -1) {
                            l = al.lang.default_country[c]
                        } else l = al.lang.default
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
            callback()
        }, wait)
    },
    setLangProp: function(obj, cb = function(r) {}, url) {
        if (obj instanceof Array) {
            if (url === true) {
                this._(obj, 0, function(r) {
                    al.setLangProp(r, cb, false)
                    this._p = []
                })
            } else {
                obj.forEach(function(e) {
                    al.lang[e.language] = e.data
                })
                cb(this.lang)
            }
        } else if ((typeof obj) == "object") {
            if (obj.default === undefined) {
                obj.default = this.lang.default
            }
            this.lang = obj
            cb(this.lang)
        } else {
            this.setLangProp(JSON.parse(obj), cb, url)
        }
    },
    setDefault: function(def) {
        this.lang["default"] = def
    },
    setDefaultCountry: function(def) {
        this.lang["default_country"] = def
    },
    httpGet: function(url, callback = function(r) {}) {
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                callback(this.responseText, this.status)
            }
        }
        xhttp.open("GET", url, true)
        xhttp.send()
    },
    _p: [],
    _: function(arr, i, cb) {
        if (i >= arr.length) {
            cb(this._p)
            return
        }
        this.httpGet(arr[i], function(r) {
            al._p.push(JSON.parse(r))
            al._(arr, i + 1, cb)
        })
    },
    ver: [5, "1.2.1"],
    mode: {
        HTML: 0,
        TEXT: 1,
        TEXT_ALL: 2,
        REPLACE: 3
    },
    lang: {
        default: "zh-CN"
    }
}