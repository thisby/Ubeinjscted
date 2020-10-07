"use strict";
var largeSync = function () {
        function i(r, e) {
            void 0 === e && (e = g);
            for (var n = h(r), t = {}, o = 0; o < n.length; o++) {
                var i = n[o];
                if (r.hasOwnProperty(i)) {
                    for (var s = LZString.compressToBase64(JSON.stringify(r[i])), c = (l = i, e - (m.length + l.length + 10)), a = 0, u = 0, f = s.length; u < f; u += c, a++) t[p(i, a)] = s.substring(u, u + c);
                    t[p(i, "meta")] = {
                        key: i,
                        min: 0,
                        max: a,
                        hash: d(s),
                        largeSyncversion: v
                    }
                }
            }
            var l;
            return t
        }

        function t(r, e) {
            void 0 === e && (e = a(r));
            for (var n = {}, t = 0; t < e.length; t++) {
                var o = e[t],
                    i = "",
                    s = r[p(o, "meta")];
                if ("undefined" !== s) {
                    for (var c = 0; c < s.max; c++) {
                        if (void 0 === r[p(o, c)]) throw Error("[largeSync] - partial string missing, object cannot be reconstructed.");
                        i += r[p(o, c)]
                    }
                    n[o] = JSON.parse(LZString.decompressFromBase64(i))
                }
            }
            return n
        }

        function p(r, e) {
            return m + "__" + r + "." + e
        }

        function s(r) {
            for (var e = [], n = 0; n < h(r).length; n++) {
                for (var t = r[n], o = 0; o < u / g; o++) e.push(p(t, o));
                e.push(p(t, "meta"))
            }
            return e
        }

        function h(r) {
            if (null != r) {
                if ("Object" === r.constructor.name) return Object.keys(r);
                if ("Array" === r.constructor.name || "string" == typeof r) return Array.from(r)
            }
            throw TypeError("[largeSync] - " + r + ' must be of type "Object", "Array" or "string"')
        }

        function a(r) {
            return Object.keys(r).map(function (r) {
                var e = r.match(m + "__(.*?).meta");
                if (null !== e) return e[1]
            }).filter(Boolean)
        }

        function d(r) {
            var e = 0;
            if (0 === r.length) return e;
            for (var n = 0; n < r.length; n++) e = (e << 5) - e + r.charCodeAt(n), e &= e;
            return e
        }
        if (void 0 === chrome.storage || void 0 === chrome.storage.sync) throw Error('[largeSync] - chrome.storage.sync is undefined, check that the "storage" permission included in your manifest.json');
        var c = chrome.storage.sync,
            m = "LS",
            u = c.QUOTA_BYTES,
            g = c.QUOTA_BYTES_PER_ITEM,
            v = "0.0.4",
            r = {
                QUOTA_BYTES: u,
                QUOTA_BYTES_PER_ITEM: u,
                QUOTA_BYTES_PER_KEY: g,
                MAX_ITEMS: c.MAX_ITEMS,
                MAX_WRITE_OPERATIONS_PER_HOUR: c.MAX_WRITE_OPERATIONS_PER_HOUR,
                MAX_WRITE_OPERATIONS_PER_MINUTE: c.MAX_WRITE_OPERATIONS_PER_MINUTE,
                VERSION: v,
                get: function (r, n) {
                    var e = null;
                    null !== r && (e = s(h(r))), c.get(e, function (r) {
                        var e = t(r);
                        n(e)
                    })
                },
                set: function (r, e) {
                    if (null === r || "string" == typeof r || "Array" === r.constructor.name) c.set(r, e);
                    else {
                        var n = i(r, g),
                            t = h(n),
                            o = s(h(r)).filter(function (r) {
                                return t.indexOf(r) < 0
                            });
                        c.remove(o), c.set(n, e)
                    }
                },
                remove: function (r, e) {
                    if (null === r) c.remove(null, e);
                    else {
                        var n = s(h(r));
                        c.remove(n, e)
                    }
                },
                getBytesInUse: function (r, e) {
                    if (null === r) c.getBytesInUse(null, e);
                    else {
                        var n = s(h(r));
                        c.getBytesInUse(n, e)
                    }
                },
                clear: function (r) {
                    c.clear(r)
                },
                _core: {
                    split: i,
                    reconstruct: t,
                    utils: {
                        basicHash: d,
                        getKeys: h,
                        extractKeys: a,
                        getStorageKey: p,
                        getRequestKeys: s
                    }
                },
                _config: {
                    getkeyPrefix: function () {
                        return m
                    },
                    setkeyPrefix: function (r) {
                        m = r
                    }
                }
            };
        return window.chrome.storage.onChanged.addListenerlargeSync = function (r) {}, window.chrome.storage.largeSync = r
    }(),
    LZString = function () {
        function n(r, e) {
            if (!i[r]) {
                i[r] = {};
                for (var n = 0; n < r.length; n++) i[r][r.charAt(n)] = n
            }
            return i[r][e]
        }
        var v = String.fromCharCode,
            t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",
            i = {},
            s = {
                compressToBase64: function (r) {
                    if (null == r) return "";
                    var e = s._compress(r, 6, function (r) {
                        return t.charAt(r)
                    });
                    switch (e.length % 4) {
                        default:
                        case 0:
                            return e;
                        case 1:
                            return e + "===";
                        case 2:
                            return e + "==";
                        case 3:
                            return e + "="
                    }
                },
                decompressFromBase64: function (e) {
                    return null == e ? "" : "" == e ? null : s._decompress(e.length, 32, function (r) {
                        return n(t, e.charAt(r))
                    })
                },
                compressToUTF16: function (r) {
                    return null == r ? "" : s._compress(r, 15, function (r) {
                        return v(r + 32)
                    }) + " "
                },
                decompressFromUTF16: function (e) {
                    return null == e ? "" : "" == e ? null : s._decompress(e.length, 16384, function (r) {
                        return e.charCodeAt(r) - 32
                    })
                },
                compressToUint8Array: function (r) {
                    for (var e = s.compress(r), n = new Uint8Array(2 * e.length), t = 0, o = e.length; t < o; t++) {
                        var i = e.charCodeAt(t);
                        n[2 * t] = i >>> 8, n[2 * t + 1] = i % 256
                    }
                    return n
                },
                decompressFromUint8Array: function (r) {
                    if (null == r) return s.decompress(r);
                    for (var e = new Array(r.length / 2), n = 0, t = e.length; n < t; n++) e[n] = 256 * r[2 * n] + r[2 * n + 1];
                    var o = [];
                    return e.forEach(function (r) {
                        o.push(v(r))
                    }), s.decompress(o.join(""))
                },
                compressToEncodedURIComponent: function (r) {
                    return null == r ? "" : s._compress(r, 6, function (r) {
                        return o.charAt(r)
                    })
                },
                decompressFromEncodedURIComponent: function (e) {
                    return null == e ? "" : "" == e ? null : (e = e.replace(/ /g, "+"), s._decompress(e.length, 32, function (r) {
                        return n(o, e.charAt(r))
                    }))
                },
                compress: function (r) {
                    return s._compress(r, 16, function (r) {
                        return v(r)
                    })
                },
                _compress: function (r, e, n) {
                    if (null == r) return "";
                    var t, o, i, s = {},
                        c = {},
                        a = "",
                        u = "",
                        f = "",
                        l = 2,
                        p = 3,
                        h = 2,
                        d = [],
                        m = 0,
                        g = 0;
                    for (i = 0; i < r.length; i += 1)
                        if (a = r.charAt(i), Object.prototype.hasOwnProperty.call(s, a) || (s[a] = p++, c[a] = !0), u = f + a, Object.prototype.hasOwnProperty.call(s, u)) f = u;
                        else {
                            if (Object.prototype.hasOwnProperty.call(c, f)) {
                                if (f.charCodeAt(0) < 256) {
                                    for (t = 0; t < h; t++) m <<= 1, g == e - 1 ? (g = 0, d.push(n(m)), m = 0) : g++;
                                    for (o = f.charCodeAt(0), t = 0; t < 8; t++) m = m << 1 | 1 & o, g == e - 1 ? (g = 0, d.push(n(m)), m = 0) : g++, o >>= 1
                                } else {
                                    for (o = 1, t = 0; t < h; t++) m = m << 1 | o, g == e - 1 ? (g = 0, d.push(n(m)), m = 0) : g++, o = 0;
                                    for (o = f.charCodeAt(0), t = 0; t < 16; t++) m = m << 1 | 1 & o, g == e - 1 ? (g = 0, d.push(n(m)), m = 0) : g++, o >>= 1
                                }
                                0 == --l && (l = Math.pow(2, h), h++), delete c[f]
                            } else
                                for (o = s[f], t = 0; t < h; t++) m = m << 1 | 1 & o, g == e - 1 ? (g = 0, d.push(n(m)), m = 0) : g++, o >>= 1;
                            0 == --l && (l = Math.pow(2, h), h++), s[u] = p++, f = String(a)
                        } if ("" !== f) {
                        if (Object.prototype.hasOwnProperty.call(c, f)) {
                            if (f.charCodeAt(0) < 256) {
                                for (t = 0; t < h; t++) m <<= 1, g == e - 1 ? (g = 0, d.push(n(m)), m = 0) : g++;
                                for (o = f.charCodeAt(0), t = 0; t < 8; t++) m = m << 1 | 1 & o, g == e - 1 ? (g = 0, d.push(n(m)), m = 0) : g++, o >>= 1
                            } else {
                                for (o = 1, t = 0; t < h; t++) m = m << 1 | o, g == e - 1 ? (g = 0, d.push(n(m)), m = 0) : g++, o = 0;
                                for (o = f.charCodeAt(0), t = 0; t < 16; t++) m = m << 1 | 1 & o, g == e - 1 ? (g = 0, d.push(n(m)), m = 0) : g++, o >>= 1
                            }
                            0 == --l && (l = Math.pow(2, h), h++), delete c[f]
                        } else
                            for (o = s[f], t = 0; t < h; t++) m = m << 1 | 1 & o, g == e - 1 ? (g = 0, d.push(n(m)), m = 0) : g++, o >>= 1;
                        0 == --l && (l = Math.pow(2, h), h++)
                    }
                    for (o = 2, t = 0; t < h; t++) m = m << 1 | 1 & o, g == e - 1 ? (g = 0, d.push(n(m)), m = 0) : g++, o >>= 1;
                    for (;;) {
                        if (m <<= 1, g == e - 1) {
                            d.push(n(m));
                            break
                        }
                        g++
                    }
                    return d.join("")
                },
                decompress: function (e) {
                    return null == e ? "" : "" == e ? null : s._decompress(e.length, 32768, function (r) {
                        return e.charCodeAt(r)
                    })
                },
                _decompress: function (r, e, n) {
                    var t, o, i, s, c, a, u, f = [],
                        l = 4,
                        p = 4,
                        h = 3,
                        d = "",
                        m = [],
                        g = {
                            val: n(0),
                            position: e,
                            index: 1
                        };
                    for (t = 0; t < 3; t += 1) f[t] = t;
                    for (i = 0, c = Math.pow(2, 2), a = 1; a != c;) s = g.val & g.position, g.position >>= 1, 0 == g.position && (g.position = e, g.val = n(g.index++)), i |= (0 < s ? 1 : 0) * a, a <<= 1;
                    switch (i) {
                        case 0:
                            for (i = 0, c = Math.pow(2, 8), a = 1; a != c;) s = g.val & g.position, g.position >>= 1, 0 == g.position && (g.position = e, g.val = n(g.index++)), i |= (0 < s ? 1 : 0) * a, a <<= 1;
                            u = v(i);
                            break;
                        case 1:
                            for (i = 0, c = Math.pow(2, 16), a = 1; a != c;) s = g.val & g.position, g.position >>= 1, 0 == g.position && (g.position = e, g.val = n(g.index++)), i |= (0 < s ? 1 : 0) * a, a <<= 1;
                            u = v(i);
                            break;
                        case 2:
                            return ""
                    }
                    for (o = f[3] = u, m.push(u);;) {
                        if (g.index > r) return "";
                        for (i = 0, c = Math.pow(2, h), a = 1; a != c;) s = g.val & g.position, g.position >>= 1, 0 == g.position && (g.position = e, g.val = n(g.index++)), i |= (0 < s ? 1 : 0) * a, a <<= 1;
                        switch (u = i) {
                            case 0:
                                for (i = 0, c = Math.pow(2, 8), a = 1; a != c;) s = g.val & g.position, g.position >>= 1, 0 == g.position && (g.position = e, g.val = n(g.index++)), i |= (0 < s ? 1 : 0) * a, a <<= 1;
                                f[p++] = v(i), u = p - 1, l--;
                                break;
                            case 1:
                                for (i = 0, c = Math.pow(2, 16), a = 1; a != c;) s = g.val & g.position, g.position >>= 1, 0 == g.position && (g.position = e, g.val = n(g.index++)), i |= (0 < s ? 1 : 0) * a, a <<= 1;
                                f[p++] = v(i), u = p - 1, l--;
                                break;
                            case 2:
                                return m.join("")
                        }
                        if (0 == l && (l = Math.pow(2, h), h++), f[u]) d = f[u];
                        else {
                            if (u !== p) return null;
                            d = o + o.charAt(0)
                        }
                        m.push(d), f[p++] = o + d.charAt(0), o = d, 0 == --l && (l = Math.pow(2, h), h++)
                    }
                }
            };
        return s
    }();
"function" == typeof define && define.amd ? define(function () {
    return LZString
}) : "undefined" != typeof module && null != module && (module.exports = LZString);