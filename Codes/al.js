const al = {
    load: function(l = navigator.language, mode = this.mode.HTML, callback = function() {}) {
        function getApplies(e, applyTo) {
            applyTo = applyTo.trim()
            let origin = applyTo.split(';')
            origin.forEach(function(e, i) {
                origin[i] = e.trim()
            })
            if (origin[origin.length - 1] === '') origin.splice(origin.length - 1, 1)
            if (origin.length == 1 && origin[0].indexOf(':') == -1) {
                let rez = {}
                rez[origin[0]] = false
                return rez
            } else {
                let rez = {}
                origin.forEach(function(e) {
                    let detach = e.split(':')
                    detach.forEach(function(e, i) {
                        detach[i] = e.trim()
                    })
                    rez[detach[0]] = detach[1]
                })
                return (rez)
            }
        }
        if (!al.lang.hasOwnProperty(l)) {
            if (l == "default") {
                l = al.lang.default
            } else {
                if (l.indexOf("-") != -1) {
                    var c = l.split("-")[0]
                } else var c = l
                if (al.lang.default_country !== void 0) {
                    if (al.lang.default_country.hasOwnProperty(c)) {
                        l = al.lang.default_country[c]
                    } else l = al.lang.default
                } else l = al.lang.default
            }
        }
        var text = Object.keys(al.lang[l])
        if (al.lang.default !== void 0) {
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
            al.lang[l][text[i]] = p.replace(/(?<!\\)((?:\\\\)*)\$\{([^}]*)}/g, function(m, s, expr) {
                return s + Function('"use strict";return (' + expr + ')').call()
            }).replace(/(?<!\\)((?:\\\\)*)\{([^}]*)}/g, function(m, s, key) {
                return s + al.lang[l][key.trim()]
            }).replace(/\\((?:\\\\)*)(\{[^}]*})/g, function(m, s, n) {
                return s + n
            })
        }
        if (mode === al.mode.REPLACE) {
            document.querySelectorAll('[al-aplto]').forEach(function(e) {
                let applyTo = e.getAttribute('al-aplto')
                let applies = getApplies(e, applyTo)
                if (applies[Object.keys(applies)[0]] !== false && applies[Object.keys(applies)[0]] !== void 0) {
                    Object.keys(applies).forEach(function(i) {
                        let z = new RegExp(applies[i], "gi")
                        al._setAttr(e,i, al._getAttr(e,i).replace(z, al.lang[l][applies[i]]))
                    })
                }
            })
            for (var i = 0; i < text.length; i++) {

                document.querySelectorAll('[al]').forEach(function(e) {
                    let z = new RegExp(text[i], "gi")
                    let applyTo = e.getAttribute('al-aplto')
                    if (applyTo !== null && applyTo !== void 0) {
                        let applies = getApplies(e, applyTo)
                        let appliesI = Object.keys(applies)[0]
                        if (applies[appliesI] === false) {
                            al._setAttr(e,appliesI, al._getAttr(e,appliesI).replace(z, al.lang[l][text[i]]))
                        }
                        al._setAttr(e,applyTo, al._getAttr(e,applyTo).replace(z, al.lang[l][text[i]]))
                    } else if (e.tagName.toLowerCase() == "input") {
                        e.value = e.value.replace(z, al.lang[l][text[i]])
                    } else e.innerHTML = e.innerHTML.replace(z, al.lang[l][text[i]])
                })
            }
            callback()
            return
        }
        document.querySelectorAll('[al-aplto]').forEach(function(e) {
            let applyTo = e.getAttribute('al-aplto')
            let applies = getApplies(e, applyTo)
            if (applies[Object.keys(applies)[0]] !== false && applies[Object.keys(applies)[0]] !== void 0) {
                Object.keys(applies).forEach(function(i) {
                    al._setAttr(e, i, al.lang[l][applies[i]])
                })
                callback()
                return
            }
        })
        for (var i = 0; i < text.length; i++) {
            document.querySelectorAll('[al="' + text[i] + '"]').forEach(function(e) {
                let applyTo = e.getAttribute('al-aplto')
                if (applyTo !== null && applyTo !== void 0) {
                    let applies = getApplies(e, applyTo)
                    if (applies[Object.keys(applies)[0]] === false) al._setAttr(e,Object.keys(applies)[0], al.lang[l][text[i]])
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
            if (attr.url == true && (typeof obj[0]) == "string") {
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
            if (obj.default === void 0) {
                obj.default = this.lang.default
            }
            this.lang = obj
            cb(this.lang)
        } else {
            if (attr.yaml == true) {
                this.setLangProp(jsyaml.load(obj), cb, attr)
            } else if (attr.yaml == false) {
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
    _setAttr:function(e,key,value){
        e[key]=value
        e.setAttribute(key,value)
    },
    _getAttr:function(e,key){
        if(e[key]!==void 0) return e[key]
        return e.getAttribute(key)
    },
    ver: [15, "1.4.4"],
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