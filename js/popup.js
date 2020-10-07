"use strict";
$(function () {
    chrome.tabs.getSelected(null, function (t) {
        var o = t.url,
            s = getDomain(o),
            r = !1;
        urlMatch(o, "http*") ? (getData(function (t) {
            var e = {
                list: getSitesByUrl(t.sites, o),
                cont: $("#siteList")
            };
            if (e.list) {
                e.cont.append(getSites(t.sites, o)), $("a.b-sites__item").each(function () {
                    $(this).attr("target", "_blank")
                });
                for (var i = e.list, n = 0; n < i.length; n++) {
                    i[n].id == s && (r = !0)
                }
            }
            e.list && r || $("#newSiteCnt").show()
        }), $(document).on("click", "#addNewSite", function () {
            window.open(editLink(s))
        })) : ($("#ok").hide(), $("#error").show()), $("#settings").on("click", function () {
            window.open(chrome.runtime.getURL("options.html"))
        });
        var e = chrome.runtime.getManifest().version;
        $("#version").text(e)
    })
});