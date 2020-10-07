"use strict";
$(function () {
    alwaysInReady();
    function c() {
        var e = function () {
            var t = [];
            return $("#libsList .b-libs__item").each(function () {
                var e = {
                    name: $(this).find(".b-libs__name").text(),
                    src: $(this).find(".b-libs__src").first().val()
                };
                t.push(e)
            }), t
        }();
        replaceLibs(e, function () {
            blinkIndicator()
        })
    }

    function l(e, t) {
        return '<div class="level level_settings"><div class="level__left"><label>' + e + '</label></div><div class="level__right level__right_col">' + t + "</div></div>"
    }

    function d(e) {
        var t = 0 < arguments.length && void 0 !== e ? e : {},
            o = t.class,
            a = void 0 === o ? "" : o,
            i = t.name,
            n = void 0 === i ? "" : i,
            s = t.value,
            r = void 0 === s ? "" : s,
            c = t.type,
            l = void 0 === c ? "text" : c,
            d = t.custom;
        return '<input type="' + l + '" class="input ' + a + '" value="' + r + '" name="' + n + '" ' + (void 0 === d ? "" : d) + ">"
    }
    var u = {
        saveSuccessful: _gm("saveSuccessful"),
        onLoadJson: _gm("onLoadJson"),
        reset: _gm("reset"),
        noSites: _gm("noSites"),
        theme: _gm("editorTheme"),
        tabSize: _gm("editorTab"),
        fontSize: _gm("editorFont"),
        version: _gm("version"),
        editor: _gm("editor"),
        contact: _gm("contact"),
        autoComp: _gm("autoComp"),
        useWorker: _gm("useWorker"),
        useSoftTabs: _gm("useSoftTabs"),
        badgeCounter: _gm("badgeCounter"),
        hideSupport: _gm("hideSupport"),
        vimMode: _gm("vimMode"),
        wrap: _gm("wrap"),
        cloudUploadfailed: _gm("cloudUploadfailed"),
        cloudReplaceSure: _gm("cloudReplaceSure"),
        cloudStorageEmpty: _gm("cloudStorageEmpty")
    };
    getData(function (t) {
        jQuery.isEmptyObject(t.sites) ? $("#siteList").append('<div class="box__content"><div class="message">' + u.noSites + "</div></div>") : $("#siteList").append(getSites(t.sites)), updateLibsList($("#libsList"), function () {
            Sortable.create($(".b-libs")[0], {
                handle: ".b-libs__handle",
                onEnd: c
            })
        });
        var e = $("#libsList");
        e.change(c), $("#libsubmit").click(function () {
            $("#libname").val() && $("#libsrc").val() && ($(".b-libs").append(addLibRow($("#libname").val(), $("#libsrc").val())), c())
        }), e.on("click", ".b-libs__remove", function () {
            $(this).parents(".b-libs__item").remove(), c()
        }), $("#jsonDownload").click(function () {
            getData(function (e) {
                var t = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(e)),
                    o = document.createElement("a"),
                    a = (new Date).toLocaleDateString("ko-KR", {
                        year: "2-digit",
                        month: "2-digit",
                        day: "2-digit"
                    }).replace(/\D*/g, "");
                o.setAttribute("href", t), o.setAttribute("download", "user-js-css-v8-" + a + ".json"), o.style.position = "absolute", document.body.appendChild(o), o.click(), document.body.removeChild(o)
            })
        }), $("#loadJson").change(function (e) {
            if (confirm(u.onLoadJson) && FileReader && e.target.files[0]) {
                var t = new FileReader;
                t.onload = function (e) {
                    var t = JSON.parse(e.target.result);
                    t && chrome.storage.local.clear(function () {
                        chrome.storage.local.set(t, function () {
                            chrome.tabs.reload()
                        })
                    })
                }, t.readAsText(e.target.files[0])
            }
        }), $("#allToDefaults").click(function () {
            confirm(u.reset) && chrome.storage.local.clear(function () {
                chrome.tabs.reload()
            })
        });
        largeSync.getBytesInUse(null, function (e) {
            $("#cloudBytesInUse").text(Math.round(e / 1e3))
        });
        var o = LZString.compressToBase64(JSON.stringify(t)).length;
        $("#localBytesInUse").text(Math.round(o / 1e3 + 3)), 99e3 < o && $("#chromeSyncSet").addClass("button_disabled"), $("#chromeSyncSet").click(function () {
            var e = LZString.compressToBase64(JSON.stringify(t)).length;
            if (99e3 < e) return alert(u.cloudUploadfailed + " (~" + Math.round(e / 1e3 + 3) + "+ > 102)"), !1;
            largeSync.set(t, location.reload())
        }), $("#chromeSyncGet").click(function () {
            confirm(u.cloudReplaceSure) && largeSync.get(t, function (e) {
                if (0 === e.length) return alert(u.cloudStorageEmpty), !1;
                saveAndCallBack(e, location.reload())
            })
        });
        for (var a = t.settings, i = '<select data-setting="editorConfig.theme">', n = 0; n < t.settings.themesFolder.length; n++) {
            var s = t.settings.themesFolder[n];
            i += '<option value="ace/theme/' + s + '">' + s + "</option>"
        }
        i += "</select>", $("#settings").append(l(u.fontSize, d({
            type: "number",
            custom: 'data-setting="editorConfig.fontSize"'
        })) + l(u.tabSize, d({
            type: "number",
            custom: 'data-setting="editorConfig.tabSize"'
        })) + l(u.theme, i) + l("", makeCheckBox({
            text: u.autoComp,
            custom: 'data-setting="editorConfig.enableLiveAutocompletion"'
        }) + makeCheckBox({
            text: u.useWorker,
            custom: 'data-setting="editorConfig.useWorker"'
        }) + makeCheckBox({
            text: u.useSoftTabs,
            custom: 'data-setting="editorConfig.useSoftTabs"'
        }) + makeCheckBox({
            text: u.wrap,
            custom: 'data-setting="editorConfig.wrap"'
        }) + makeCheckBox({
            text: u.vimMode,
            custom: 'data-setting="editorConfig.keyboardHandler"'
        }))), $("#settingsExt").append(l("", makeCheckBox({
            text: u.badgeCounter,
            custom: 'data-setting="badgeCounter"'
        }) + makeCheckBox({
            text: u.hideSupport,
            custom: 'data-setting="supportBtn"'
        }))), $("[data-setting]").each(function () {
            var e = $(this).data("setting"),
                t = strToPath(a, e);
            "checkbox" != $(this).attr("type") ? $(this).val(t) : $(this).prop("checked", t)
        }), $(document).on("change", "[data-setting]", function () {
            var e, t = "settings." + $(this).data("setting"),
                o = $(this).attr("type");
            e = "number" == o ? +$(this).val() : "checkbox" == o ? $(this).prop("checked") : $(this).val(), saveOption(t, e, function () {
                blinkIndicator()
            })
        });
        var r = chrome.runtime.getManifest();
        $("#about").append(l(u.version, r.version) + l(u.contact, '<div class="typo"><a href="mailto:sqdevil@yandex.ru">sqdevil@yandex.ru</a></div>') + l(u.editor, '<div class="typo"><a href="https://ace.c9.io/" target="_blank">Ace editor</a></div>'))
    })
});