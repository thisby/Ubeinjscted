"use strict";

function _defineProperty(e, t, n) {
    return t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n, e
}

function _typeof(e) {
    return (_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
        return typeof e
    } : function (e) {
        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
    })(e)
}

function getDomain(e) {
    var t = e.match(/^.+\/\/[^\/]+\//i),
        n = !1;
    return null != t && (n = t[0]), n
}

function urlMatch(e, t) {
    var n = !1,
        i = !1;
    t = t.split(",");
    for (var r = 0; r < t.length; r++) {
        var a = t[r].trim();
        if (makeUrlPreg(a).test(e) && (n = !0, "!" === a[0])) {
            i = !0;
            break
        }
    }
    return !i && n
}

function makeUrlPreg(e) {
    "!" === e[0] && (e = e.substring(1));
    var t = e.replace(/\s+/g, "").replace(/\W/g, "\\$&");
    return t = t.replace(/\\\*/g, ".*"), t = new RegExp(".*" + t + ".*", "i")
}

function setUrlParam(e, t) {
    var n, i, r = window.location.href,
        a = new RegExp("([?&])" + e + "=.*?(&|#|$)(.*)", "gi");
    if (a.test(r)) i = null != t ? r.replace(a, "$1" + e + "=" + t + "$2$3") : (r = (n = r.split("#"))[0].replace(a, "$1$3").replace(/(&|\?)$/, ""), void 0 !== n[1] && null !== n[1] && (r += "#" + n[1]), r);
    else if (null != t) {
        var o = -1 !== r.indexOf("?") ? "&" : "?";
        r = (n = r.split("#"))[0] + o + e + "=" + t, void 0 !== n[1] && null !== n[1] && (r += "#" + n[1]), i = r
    } else i = r;
    t || (i = "/options.html"), history.replaceState(null, null, i)
}

function getUrlParam(e) {
    var t = window.location.href;
    e = e.replace(/[\[\]]/g, "\\$&");
    var n = new RegExp("[?&]" + e + "(=([^&#]*)|&|#|$)").exec(t);
    return n ? n[2] ? decodeURIComponent(n[2].replace(/\+/g, " ")) : "" : null
}

function getIndex(t, e, n) {
    return e.findIndex(function (e) {
        return e[t] == n
    })
}

function getSite(e, t) {
    var n = getIndex("id", t, e),
        i = !1;
    return ~n && (i = t[n]), i
}

function getData(t) {
    chrome.storage.local.get(null, function (e) {
        0 === Object.keys(e).length && e.constructor === Object && (e = new Protos("data")), t(e)
    })
}

function saveAndCallBack(e, t) {
    chrome.storage.local.set(e, function () {
        void 0 !== t && t()
    })
}

function saveProps(n, i, r) {
    getData(function (e) {
        var t = getIndex("id", e.sites, n);
        ~t ? e.sites[t] = i : e.sites.push(i), saveAndCallBack(e, r)
    })
}

function removeDomain(n, i) {
    getData(function (e) {
        var t = getIndex("id", e.sites, n);
        ~t && e.sites.splice(t, 1), saveAndCallBack(e, i)
    })
}

function toggleDomain(i, r) {
    getData(function (e) {
        var t, n = getIndex("id", e.sites, i);
        ~n && (t = !e.sites[n].options.on, e.sites[n].options.on = t), saveAndCallBack(e, r(t))
    })
}

function replaceLibs(t, n) {
    getData(function (e) {
        e.libs = t, saveAndCallBack(e, n)
    })
}

function saveOption(t, n, i) {
    getData(function (e) {
        void 0 !== strToPath(e, t) && (strToPath(e, t, n), saveAndCallBack(e, i))
    })
}

function Protos(e) {
    return this.site = {
        id: "",
        name: "",
        js: "",
        css: "",
        compiledCss: "",
        libs: [],
        options: {
            on: !0,
            altJS: !1,
            altCSS: !1,
            autoImportant: !1
        }
    }, this.settings = {
        version: 8,
        badgeCounter: !1,
        supportBtn: !1,
        editorConfig: {
            tabSize: 4,
            fontSize: 15,
            enableBasicAutocompletion: !1,
            enableLiveAutocompletion: !0,
            enableSnippets: !0,
            highlightActiveLine: !1,
            keyboardHandler: !1,
            theme: "ace/theme/tomorrow",
            showPrintMargin: !1,
            useSoftTabs: !1,
            useWorker: !0,
            wrap: !0
        },
        themesFolder: ["chrome", "clouds", "dawn", "dracula", "dreamweaver", "eclipse", "github", "monokai", "solarized_dark", "solarized_light", "textmate", "tomorrow", "tomorrow_night", "twilight"]
    }, this.data = {
        settings: this.settings,
        sites: [],
        libs: [{
            name: "jQuery 3",
            src: "@extension@jquery.min.js"
        }]
    }, this[e]
}

function _gm(e) {
    return chrome.i18n.getMessage(e)
}

function runOnInteractive(e) {
    "complete" != document.readyState && "interactive" != document.readyState ? document.onreadystatechange = function () {
        "interactive" == document.readyState && e()
    } : e()
}

function getAndSort(e) {
    for (var t = Object.assign({
            sites: [],
            items: {},
            alt: !1
        }, e), n = t.items, i = t.sites, r = {
            js: [],
            css: [],
            libs: []
        }, a = 0; a < i.length; a++) {
        var o = getSite(i[a].id, n.sites);
        if (o.options.on) {
            if (o.js && o.options.altJS === t.alt && r.js.push(o.js), o.css && o.options.altCSS === t.alt) {
                var s = o.css;
                o.options.autoImportant && (s = void 0 !== o.compiledCss ? o.compiledCss : cssApplyImportant(o.css)), r.css.push(s)
            }
            o.libs && Array.isArray(o.libs) && 0 < o.libs.length && o.options.altJS === t.alt && r.libs.push(o.libs)
        }
    }
    if (0 < r.libs.length) {
        for (var l = [], c = 0; c < r.libs.length; c++)
            for (var d = r.libs[c], u = 0; u < d.length; u++) {
                var p = d[u],
                    f = getIndex("name", n.libs, p),
                    g = n.libs[f].src;
                ~l.indexOf(g) || l.push(g)
            }
        for (var b = [], v = 0; v < n.libs.length; v++) {
            var m = n.libs[v];
            if (~l.indexOf(m.src)) {
                var h = m.src;
                ~h.indexOf("@extension@") && (h = h.replace("@extension@", ""), n.libs[v].src = chrome.runtime.getURL("js/libs/" + h)), b.push(m.src)
            }
        }
        r.libs = b
    }
    return r
}

function toBase64(t) {
    var n = "data:text/javascript";
    try {
        n += ";base64," + btoa(t)
    } catch (e) {
        n += ";charset=utf-8," + encodeURIComponent(t)
    }
    return n
}

function setScript(e, t, n) {
    var i = document.createElement("script");
    i.setAttribute("data-source", "User JavaScript and CSS extension"), e && (i.src = e), 2 < arguments.length && (i.innerHTML = n), i.async = !1,i.type='text/javascript', t.appendChild(i)
}

function editLink(e) {
    var t = encodeURIComponent(e);
    return chrome.runtime.getURL("edit.html?site=" + t)
}

function strToPath(e, t, n) {
    return "string" == typeof t ? strToPath(e, t.split("."), n) : 1 === t.length && void 0 !== n ? e[t[0]] = n : 0 === t.length ? e : strToPath(e[t[0]], t.slice(1), n)
}

function cssApplyImportant(e) {
    for (var t, n, i, r = (t = e, n = document.implementation.createHTMLDocument(""), (i = document.createElement("style")).textContent = t, n.body.appendChild(i), i.sheet.cssRules), a = "", o = 0; o < r.length; o++) {
        var s = r[o];
        if (1 === s.type) a += c(s);
        else if (3 === s.type) a += s.cssText;
        else if (4 === s.type) {
            a += "@media " + s.conditionText + " {";
            for (var l = 0; l < s.cssRules.length; l++) {
                a += c(s.cssRules[l])
            }
            a += " }"
        } else a += s.cssText
    }
    return a;

    function c(e) {
        var t = new RegExp(/\;(?=([^"']*("|')[^"']*("|'))*[^"']*$)/g),
            n = e.style.cssText;
        return ";" !== n.slice(-1) && (n += ";"), n = (n = n.replace(/\!important/gi, "")).replace(t, "!important;"), e.selectorText + " {" + n + "}"
    }
}

function getBytes(e) {
    return new Blob([JSON.stringify(e)]).size
}

function bytesToSize(e) {
    if (0 === e) return "n/a";
    var t = parseInt(Math.floor(Math.log(e) / Math.log(1024)));
    return Math.round(e / Math.pow(1024, t)) + " " + ["Bytes", "KB", "MB", "GB", "TB"][t]
}

function getDataSize(e) {
    return bytesToSize(getBytes(e))
}

function isObject(e) {
    return e && "object" === _typeof(e) && !Array.isArray(e)
}

function mergeDeep(e, t) {
    if (isObject(e) && isObject(t))
        for (var n in t) isObject(t[n]) ? (e[n] || Object.assign(e, _defineProperty({}, n, {})), mergeDeep(e[n], t[n])) : Object.assign(e, _defineProperty({}, n, t[n]));
    return e
}

function addEl(e, t, n) {
    var i = document.createElement(e);
    if (void 0 !== t)
        for (var r in t) i.setAttribute(r, t[r]);
    return void 0 !== n && (i.innerHTML = n), i
}

function makeCheckBox() {
    var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {},
        t = e.class,
        n = void 0 === t ? "" : t,
        i = e.name,
        r = void 0 === i ? "" : i,
        a = e.value,
        o = void 0 === a ? "" : a,
        s = e.text,
        l = void 0 === s ? "" : s,
        c = e.custom;
    return '<label class="checkbox">' + l + '<input type="checkbox" class="checkbox__input ' + n + '" value="' + o + '" name="' + r + '" ' + (void 0 === c ? "" : c) + '><div class="checkbox__indicator"></div></label>'
}

function getSitesByUrl(e, t) {
    for (var n = !1, i = [], r = 0; r < e.length; r++) {
        var a = e[r].id;
        urlMatch(t, a) && i.push(getSite(a, e))
    }
    return i.length && (n = i), n
}

function getSites(e, t) {
    if (void 0 !== t && (e = getSitesByUrl(e, t)), !Array.isArray(e)) return !1;
    e.sort(function (e, t) {
        return e.id.localeCompare(t.id)
    }), e.sort(function (e, t) {
        var n = "" + e.name || "",
            i = "" + t.name || "";
        return n.localeCompare(i)
    });
    for (var n = addEl("div", {
            class: "b-sites b-list"
        }), i = 0; i < e.length; i++) {
        var r = getSite(e[i].id, e),
            a = r.options.on ? "on" : "off",
            o = addEl("a", {
                class: "b-sites__item b-list__item",
                href: editLink(r.id)
            }),
            s = addEl("div", {
                class: "b-sites__toggler fa fa-toggle-" + a,
                "data-id": r.id
            }),
            l = r.name ? addEl("div", {
                class: "b-sites__name"
            }, r.name) : "",
            c = addEl("div", {
                class: "b-sites__url b-list__grow"
            }, r.id);
        s.addEventListener("click", function (e) {
            e.preventDefault();
            var i = this;
            toggleDomain(this.getAttribute("data-id"), function (e) {
                var t = e ? "on" : "off",
                    n = e ? "off" : "on";
                i.classList.remove("fa-toggle-" + n), i.classList.add("fa-toggle-" + t)
            })
        }), o.appendChild(s), l && o.appendChild(l), o.appendChild(c), n.appendChild(o)
    }
    return n
}

function addLibRow(e, t) {
    var n = addEl("div", {
        class: "b-libs__item b-list__item"
    });
    return n.appendChild(addEl("div", {
        class: "b-libs__handle"
    })), n.appendChild(addEl("div", {
        class: "b-libs__name b-list__grow"
    }, e)), n.appendChild(addEl("input", {
        class: "b-libs__src",
        type: "text",
        value: t
    })), n.appendChild(addEl("div", {
        class: "b-libs__remove delete"
    })), n
}

function updateLibsList(a, o) {
    getData(function (e) {
        for (var t = addEl("div", {
                class: "b-libs b-list"
            }), n = 0; n < e.libs.length; n++) {
            var i = e.libs[n],
                r = addLibRow(i.name, i.src);
            t.appendChild(r)
        }
        a.empty().append(t), o && o()
    })
}

function setEditor(e, t, n) {
    var i = ace.edit(e),
        r = n.editorConfig,
        a = document.getElementById(e).clientHeight - 1.14 * r.fontSize;
    return r.wrap = !!r.wrap && "free", r.keyboardHandler = r.keyboardHandler ? "ace/keyboard/vim" : void 0, i.getSession().setMode("ace/mode/" + t), i.setOptions(r), i.renderer.setScrollMargin(0, a), i.$blockScrolling = 1 / 0, i
}

function applyHtmlTemplates() {
    $("[data-rule]").each(function () {
        var t = $(this),
            i = t.data("rule");
        i && getData(function (e) {
            var n = getSite(i, e.sites);
            t.find("[data-param]").each(function () {
                var e = $(this).data("param"),
                    t = n[e];
                $(this).is("input") ? $(this).val(t) : $(this).text(t)
            })
        })
    })
}

function cloneHttpRequest(t,callback) {
    // 1. Create a new XMLHttpRequest object
    let xhr = new XMLHttpRequest();

    // 2. Configure it: GET-request for the URL /article/.../load
    xhr.open('GET', t);

    // 3. Send the request over the network
    xhr.send();

    // 4. This will be called after the response is received
    xhr.onload = function () {
        if (xhr.status != 200) { // analyze HTTP status of the response
            console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
        } else { // show the result
            callback(xhr.responseText); // response is the server
        }
    };

    xhr.onprogress = function (event) {
        if (event.lengthComputable) {
            console.log(`Received ${event.loaded} of ${event.total} bytes`);
        } else {
            console.log(`Received ${event.loaded} bytes`); // no Content-Length
        }

    };

    xhr.onerror = function () {
        console.log("Request failed");
    };
}

Array.prototype.findIndex || (Array.prototype.findIndex = function (e) {
    if (null == this) throw new TypeError("Array.prototype.findIndex called on null or undefined");
    if ("function" != typeof e) throw new TypeError("predicate must be a function");
    for (var t, n = Object(this), i = n.length >>> 0, r = arguments[1], a = 0; a < i; a++)
        if (t = n[a], e.call(r, t, a, n)) return a;
    return -1
}), Object.assign || Object.defineProperty(Object, "assign", {
    enumerable: !1,
    configurable: !0,
    writable: !0,
    value: function (e, t) {
        if (null == e) throw new TypeError("Cannot convert first argument to object");
        for (var n = Object(e), i = 1; i < arguments.length; i++) {
            var r = arguments[i];
            if (null != r)
                for (var a = Object.keys(Object(r)), o = 0, s = a.length; o < s; o++) {
                    var l = a[o],
                        c = Object.getOwnPropertyDescriptor(r, l);
                    void 0 !== c && c.enumerable && (n[l] = r[l])
                }
        }
        return n
    }
});