const al = {
    load: function(l = navigator.language, mode = this.mode.HTML, callback = function() {}) {
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
        if (al.lang.default !== undefined) {
            var defaultText = Object.keys(al.lang[al.lang.default])
            if (text !== defaultText) {
                for (let i = 0; i < defaultText.length; i++) {
                    if (text.indexOf(defaultText[i]) == -1) {
                        al.lang[l][defaultText[i]] = al.lang[al.lang.default][defaultText[i]]
                        text = Object.keys(al.lang[l])
                    }
                }
            }
        }
        for (var i = 0; i < text.length; i++) {
            var p = al.lang[l][text[i]]
            al.lang[l][text[i]] = p.replace(/(?<!\\)((?:\\\\)*)\$\{([^}]*)}/g, function(a, s, n) {
                return s + String(eval(n))
            }).replace(/(?<!\\)((?:\\\\)*)\{([^}]*)}/g, function(a, s, n) {
                return s + al.lang[l][n.trim()]
            }).replace(/\\((?:\\\\)*)(\{[^}]*})/g, function(a, s, n) {
                return s + n
            })
        }
        if (mode === al.mode.REPLACE) {
            for (var i = 0; i < text.length; i++) {
                document.querySelectorAll('[al]').forEach(function(e) {
                    let z = new RegExp(text[i], "gi")
                    let applyTo = e.getAttribute('al-aplto')
                    if (applyTo !== null && applyTo !== undefined) {
                        e.setAttribute(applyTo, e.getAttribute(applyTo).replace(z, al.lang[l][text[i]]))
                    } else if (e.tagName.toLowerCase() == "input") {
                        e.value = e.value.replace(z, al.lang[l][text[i]])
                    } else e.innerHTML = e.innerHTML.replace(z, al.lang[l][text[i]])
                })
            }
            callback()
            return
        }
        for (var i = 0; i < text.length; i++) {
            document.querySelectorAll('[al="' + text[i] + '"]').forEach(function(e) {
                let applyTo = e.getAttribute('al-aplto')
                if (applyTo !== null && applyTo !== undefined) {
                    e.setAttribute(applyTo, al.lang[l][text[i]])
                } else if (e.tagName.toLowerCase() == "input") {
                    e.value = al.lang[l][text[i]]
                } else {
                    switch (mode) {
                        case al.mode.TEXT:
                            e.innerText = al.lang[l][text[i]]
                            break
                        default:
                            e.innerHTML = al.lang[l][text[i]]
                    }
                }
            })
        }
        callback()
    },
    setLangProp: function(obj, cb = function() {}, attr = {}) {
        if (obj instanceof Array) {
            if (attr.url == true && "string" === (typeof obj[0])) {
                this._(obj, 0, function(r) {
                    al.setLangProp(r, cb, attr)
                }, attr.yaml)
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
            if ((attr.yaml) == true) {
                this.setLangProp(jsyaml.load(obj), cb, attr)
            } else if ((attr.yaml) == false) {
                this.setLangProp(JSON.parse(obj), cb, attr)
            } else try {
                this.setLangProp(jsyaml.load(obj), cb, attr)
            } catch {
                this.setLangProp(JSON.parse(obj), cb, attr)
            }
        }
    },
    setDefault: function(def) {
        this.lang["default"] = def
    },
    setDefaultCountry: function(def) {
        this.lang["default_country"] = def
    },
    release: function() {
        al.lang = {}
        al._p = []
    },
    httpGet: function(url, callback = function() {}) {
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
    _: function(arr, i, cb, isYaml) {
        if (i >= arr.length) {
            cb(this._p)
            this._p = []
            return
        }
        this.httpGet(arr[i], function(r) {
            if (isYaml == true) {
                al._p.push(jsyaml.load(r))
            } else if (isYaml == false) {
                al._p.push(JSON.parse(r))
            } else {
                try {
                    al._p.push(jsyaml.load(r))
                } catch {
                    al._p.push(JSON.parse(r))
                }
            }
            al._(arr, i + 1, cb, isYaml)
        })
    },
    ver: [12, "1.4.1"],
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