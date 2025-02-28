const al = {
    load(mode = this.mode.HTML, callback = () => {}, l) {
        const getApplies = (e, applyTo) => {
            applyTo = applyTo.trim().split(';').map(e => e.trim()).filter(e => e);
            return applyTo.reduce((rez, e) => {
                const [key, value] = e.split(':').map(e => e.trim());
                rez[key] = value !== void 0 ? value : false;
                return rez;
            }, {});
        }
        l = this.getUserLang(l);
        const temp = { ...al.lang[l] };
        if (al.lang.default !== void 0) {
            const defaultText = Object.keys(al.lang[al.lang.default]);
            defaultText.forEach(key => {
                if (!temp.hasOwnProperty(key)) {
                    temp[key] = al.lang[al.lang.default][key];
                }
            });
        }
        Object.keys(temp).forEach(key => {
            const p = temp[key];
            temp[key] = p.replace(/(?<!\\)((?:\\\\)*)\$\{([^}]*)}/g, (m, s, expr) => s + (new Function('"use strict";return (' + expr + ')')()))
                .replace(/(?<!\\)((?:\\\\)*)\{([^}]*)}/g, (m, s, key) => s + temp[key.trim()])
                .replace(/\$(?:\\\$*)(\{[^}]*})/g, (m, s, n) => s + n);
        });
        if (mode == al.mode.REPLACE) {
            const replaceElements = (selector, attrKey, replacementValue) => {
                document.querySelectorAll(selector).forEach(e => {
                    const regex = new RegExp(attrKey, "gi");
                    al._setAttr(e, attrKey, al._getAttr(e, attrKey).replace(regex, replacementValue));
                });
            }
            document.querySelectorAll('[al-aplto]').forEach(e => {
                const applyTo = e.getAttribute('al-aplto');
                const applies = getApplies(e, applyTo);
                Object.keys(applies).forEach(i => {
                    replaceElements(`[${i}]`, applies[i], temp[applies[i]]);
                });
            });
            Object.keys(temp).forEach(key => {
                replaceElements('[al]', key, temp[key]);
            });
            callback();
            return;
        }
        const processElements = (e, applyTo, applies) => {
            if (applies[Object.keys(applies)[0]] != false) {
                Object.keys(applies).forEach(i => {
                    al._setAttr(e, i, temp[applies[i]]);
                });
                callback();
                return;
            }
        }
        document.querySelectorAll('[al-aplto]').forEach(e => {
            const applyTo = e.getAttribute('al-aplto');
            const applies = getApplies(e, applyTo);
            processElements(e, applyTo, applies);
        });
        Object.keys(temp).forEach(key => {
            document.querySelectorAll(`[al="${key}"]`).forEach(e => {
                const applyTo = e.getAttribute('al-aplto');
                if (applyTo) {
                    const applies = getApplies(e, applyTo);
                    if (applies[Object.keys(applies)[0]] == false) {
                        al._setAttr(e, Object.keys(applies)[0], temp[key]);
                    }
                } else if (e.tagName.toLowerCase() == "input") {
                    e.value = temp[key];
                } else {
                    switch (mode) {
                        case al.mode.TEXT:
                            e.innerText = temp[key];
                            break;
                        default:
                            e.innerHTML = temp[key];
                    }
                }
            });
        });
        callback();
    },
    setLangPropPath(path) {
        this.langPropPath = path;
    },
    current(obj, attr = {}) {
        const userLang = this.getUserLang();
        const defaultLang = this.lang.default;
        if (obj.indexOf(userLang) == -1) {
            this.setLangProp([defaultLang], void 0, attr);
        } else {
            this.setLangProp(defaultLang == userLang ? [userLang] : [defaultLang, userLang], void 0, attr);
        }
    },
    setLangProp(obj, cb = () => {}, attr = {}) {
        if (Array.isArray(obj)) {
            if (attr.url == true && typeof obj[0] == "string") {
                this._(obj, 0, (r) => {
                    this.setLangProp(r, cb, attr);
                }, attr.yaml);
            } else {
                obj.forEach(e => {
                    this.lang[e.language] = e.data;
                });
                cb(this.lang);
            }
        } else if (typeof obj == "object") {
            if (obj.default === void 0) {
                obj.default = this.lang.default;
            }
            this.lang = obj;
            cb(this.lang);
        } else {
            try {
                this.setLangProp(jsyaml.load(obj), cb, attr);
            } catch {
                this.setLangProp(JSON.parse(obj), cb, attr);
            }
        }
    },
    setDefault(def) {
        this.lang["default"] = def;
    },
    setDefaultCountry(def) {
        this.lang["default_country"] = def;
    },
    getUserLang(l) {
        if (!l) l = navigator.language;
        if (!this.lang.hasOwnProperty(l)) {
            if (l == "default") {
                l = this.lang.default;
            } else {
                const c = l.indexOf("-") != -1 ? l.split("-")[0] : l;
                if (this.lang.default_country !== void 0) {
                    if (this.lang.default_country.hasOwnProperty(c)) {
                        l = this.lang.default_country[c];
                    } else {
                        l = this.lang.default;
                    }
                } else {
                    l = this.lang.default;
                }
            }
        }
        return l;
    },
    release() {
        this.lang = {};
        this._p = [];
    },
    httpGet(url, callback = () => {}) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4) {
                callback(xhttp.responseText, xhttp.status);
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    },
    _p: [],
    _(arr, i = 0, cb, isYaml) {
        if (i >= arr.length) {
            cb(this._p);
            this._p = [];
            return;
        }
        this.httpGet(this.langPropPath.replace(/%%/g, arr[i]), (r) => {
            this._p.push(isYaml == true ? jsyaml.load(r) : JSON.parse(r));
            this._(arr, i + 1, cb, isYaml);
        });
    },
    _setAttr(e, key, value) {
        e[key] = value;
        e.setAttribute(key, value);
    },
    _getAttr(e, key) {
        return e[key] !== void 0 ? e[key] : e.getAttribute(key);
    },
    langPropPath: "",
    ver: [17, "1.5.0"],
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