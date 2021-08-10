function showActiveOverloadDescription() {
    $(".hint-overloads-item").removeClass("active"),
    $(this).addClass("active"),
    _completion_overloadsActive = !0
}
function Collaboration() {
    if (this.messages = {
        nugetPackagesChanged: "NugetPackagesChanged",
        codeExecuting: "CodeExecuting",
        codeExecuted: "CodeExecuted",
        optionsChanged: "OptionsChanged",
        shared: "Shared",
        hello: "Hello"
    },
    this.selfId = null,
    this.clientIds = [],
    this.refetchClients = function() {
        var n, t;
        try {
            n = [],
            n[0] = this.selfId,
            t = TogetherJS.require("peers").getAllPeers(!0),
            $.each(t, function(t, i) {
                n[n.length] = i.id
            }),
            this.clientIds = n.sort()
        } catch (i) {
            return !1
        }
        return !0
    }
    ,
    this.isEnabled = function() {
        return typeof TogetherJS != "undefined" && TogetherJS.running
    }
    ,
    this.isPrimary = function() {
        return !this.refetchClients() || this.clientIds.length > 0 && this.clientIds[0] == this.selfId
    }
    ,
    this.sendToCollaborators = function(n, t) {
        this.isEnabled() && TogetherJS.send({
            type: n,
            data: t
        })
    }
    ,
    this.onOptionsChanged = function(n) {
        this.fromTogetherJS = !0,
        n.isAutorun != null && fiddle.setAutoRun(n.isAutorun, !0),
        n.language != null && fiddle.setLanguage(n.language, !0),
        n.projectType != null && fiddle.setProjectType(n.projectType, !0),
        n.layoutType != null && fiddle.setLayout(n.layoutType, !0),
        n.codeBlocks != null && fiddle.setCodeBlocks(n.codeBlocks),
        n.compiler != null && fiddle.setCompiler(n.compiler),
        toggleProjectType(),
        toggleNugetWrap(),
        fiddle.render(),
        loadEditors("", !0),
        this.fromTogetherJS = !1
    }
    ,
    this.reinitialize = function() {
        collaboration.isEnabled() && TogetherJS.reinitialize()
    }
    ,
    this.onNugetPackagesChanged = function(n) {
        var t = n.operation;
        if (t == "remove")
            nugetPackageManager.removePackage(n.data);
        else if (t == "add")
            nugetPackageManager.savePackage(n.data);
        else
            throw 'Operation "' + t + '" is not supported';
    }
    ,
    this.onCodeExecuting = function() {
        CodeRunner.fetchCode(),
        CodeRunner.toggleStatsLoader(!0)
    }
    ,
    this.onCodeExecuted = function(n) {
        CodeRunner.fetchCode(),
        CodeRunner.showResults(n),
        CodeRunner.toggleStatsLoader(!1)
    }
    ,
    this.onShared = function(n) {
        $("#OriginalFiddleId").val(n.id),
        $("#OriginalNuGetPackageVersionIds").val(n.versionIds),
        $("#NuGetPackageVersionIds").val(n.versionIds),
        fiddle.setFiddleId(n.id),
        fiddle.setCodeBlocks(n.codeBlocks, !0)
    }
    ,
    this.onHello = function(n) {
        this.helloReceived || n.forId == this.selfId && (collaboration.fromTogetherJS = !0,
        this.helloReceived = !0,
        fiddle.setProjectType(n.data.projectType, !0),
        fiddle.setLanguage(n.data.language, !0),
        fiddle.setCompiler(n.data.compiler, !0),
        fiddle.setLayout(n.data.layout, !0),
        fiddle.setAutoRun(n.data.isAutorun, !0),
        fiddle.setCodeBlocks(n.data.codeBlocks),
        $("#OriginalFiddleId").val(n.id),
        $("#OriginalNuGetPackageVersionIds").val(n.versionIds),
        $("#NuGetPackageVersionIds").val(n.versionIds),
        fiddle.setFiddleId(n.data.fiddleId),
        fiddle.render(),
        collaboration.fromTogetherJS = !1)
    }
    ,
    this.optionsChanged = function(n) {
        this.isEnabled() && (this.sendToCollaborators(this.messages.optionsChanged, n),
        loadEditors("", !1))
    }
    ,
    this.nugetPackagesChanged = function(n, t) {
        this.sendToCollaborators(this.messages.nugetPackagesChanged, {
            data: n,
            operation: t
        })
    }
    ,
    this.codeExecuting = function() {
        this.sendToCollaborators(this.messages.codeExecuting, {})
    }
    ,
    this.codeExecuted = function(n) {
        this.sendToCollaborators(this.messages.codeExecuted, n)
    }
    ,
    this.shared = function(n, t) {
        CodeRunner.fetchCode();
        var i = {
            id: n,
            versionIds: t,
            codeBlocks: fiddle.getCodeBlocks()
        };
        this.sendToCollaborators(this.messages.shared, i)
    }
    ,
    this.hello = function(n) {
        fiddle.fetchCode();
        var t = {
            projectType: fiddle.getProjectType(),
            language: fiddle.getLanguage(),
            compiler: fiddle.getCompiler(),
            layout: fiddle.getLayout(),
            codeBlocks: fiddle.getCodeBlocks(),
            isAutorun: fiddle.getAutorun(),
            fiddleId: fiddle.getFiddleId(),
            versionIds: $("#OriginalNuGetPackageVersionIds").val()
        };
        this.sendToCollaborators(this.messages.hello, {
            forId: n,
            data: t
        })
    }
    ,
    this.isTogetherJsInitiator = !1,
    this.fromTogetherJS = !1,
    this.fromTogetherJSTimeout = null,
    this.helloReceived = !1,
    this.init = function() {
        this.isEnabled() || (this.isTogetherJsInitiator = !0)
    }
    ,
    typeof TogetherJS != "undefined") {
        TogetherJS.on("ready", function() {
            var n = TogetherJS.require("session");
            collaboration.selfId = n.clientId
        });
        TogetherJS.hub.on("togetherjs.hello", function(n) {
            collaboration.refetchClients(),
            collaboration.clientIds.length == 1 && (collaboration.isTogetherJsInitiator = !0),
            collaboration.isTogetherJsInitiator && collaboration.hello(n.clientId)
        });
        TogetherJS.hub.on(this.messages.shared, function(n) {
            collaboration.onShared(n.data)
        });
        TogetherJS.hub.on(this.messages.optionsChanged, function(n) {
            collaboration.onOptionsChanged(n.data)
        });
        TogetherJS.hub.on(this.messages.codeExecuting, function() {
            collaboration.onCodeExecuting()
        });
        TogetherJS.hub.on(this.messages.codeExecuted, function(n) {
            collaboration.onCodeExecuted(n.data)
        });
        TogetherJS.hub.on(this.messages.nugetPackagesChanged, function(n) {
            collaboration.onNugetPackagesChanged(n.data)
        });
        TogetherJS.hub.on(this.messages.hello, function(n) {
            collaboration.onHello(n.data)
        })
    }
}
function RunQueue(n) {
    this.queue = [],
    this.mutationHandler = n || function() {}
    ,
    this.callHandler = function(n) {
        typeof this.mutationHandler == "function" && this.mutationHandler(n)
    }
    ,
    this.push = function(n) {
        this.queue.push(n),
        this.callHandler(n)
    }
    ,
    this.pull = function(n) {
        return this.queue.shift(n)
    }
    ,
    this.clear = function() {
        this.queue = []
    }
}
function loadEditors(n, t, i) {
    var r = null;
    return i || (i = $(".code-block")),
    i.each(function() {
        var f = $(this), e = $(f).attr("id"), u = "", s = !1, o, i;
        window.academyCode ? (o = academyCode.getFiddle(e),
        u = o.getMode(),
        s = o.isReadOnly()) : (u = $(f).attr("mode"),
        u = u || CodeRunner.getMode()),
        i = CodeMirror(function(n) {
            $(f).closest("div").append(n)
        }, {
            value: $(f).val(),
            mode: u,
            lineNumbers: !0,
            indentUnit: 4,
            indentWithTabs: !0,
            lint: {
                getAnnotations: Linter.getSyntaxErrors,
                async: !0,
                startup: t != null && t
            },
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "'.'": "dotautocomplete",
                "' '": "spaceautocomplete",
                "','": "commaOverloads",
                "Ctrl-Q": "commentSelection",
                "Ctrl-U": "uncommentSelection"
            },
            theme: n != null ? n : "default",
            gutters: ["CodeMirror-lint-markers"],
            readOnly: s,
            codeBlockId: e
        });
        i.on("keyup", function(n, t) {
            var i = String.fromCharCode(t.keyCode);
            i != "," && $(".hint-overloads").length > 0 && $("ul.CodeMirror-hints").length == 0 && (tokenTypeTimer != null && clearTimeout(tokenTypeTimer),
            tokenTypeTimer = setTimeout(function() {
                CodeMirror.hint.getTokenType(n, CodeMirror.hint.highlightArgument)
            }, 200))
        });
        i.on("endCompletion", function() {
            i.focus()
        });
        i.setSize("100%");
        i.on("keydown", function() {
            $(".hint-overloads .back-to-list.active").remove()
        });
        r = r || {},
        r[e] = i
    }),
    r
}
var _completion_overloadsActive, _completion_overloadsMouseOver, collaboration, CodeRunner, Terminal, Linter, tokenTypeTimer;
(function(n, t) {
    typeof exports == "object" && typeof module != "undefined" ? module.exports = t() : typeof define == "function" && define.amd ? define(t) : n.CodeMirror = t()
}
)(this, function() {
    "use strict";
    function of(n) {
        return new RegExp("(^|\\s)" + n + "(?:$|\\s)\\s*")
    }
    function yi(n) {
        for (var t = n.childNodes.length; t > 0; --t)
            n.removeChild(n.firstChild);
        return n
    }
    function ct(n, t) {
        return yi(n).appendChild(t)
    }
    function i(n, t, i, r) {
        var u = document.createElement(n), f;
        if (i && (u.className = i),
        r && (u.style.cssText = r),
        typeof t == "string")
            u.appendChild(document.createTextNode(t));
        else if (t)
            for (f = 0; f < t.length; ++f)
                u.appendChild(t[f]);
        return u
    }
    function tu(n, t, r, u) {
        var f = i(n, t, r, u);
        return f.setAttribute("role", "presentation"),
        f
    }
    function pi(n, t) {
        if (t.nodeType == 3 && (t = t.parentNode),
        n.contains)
            return n.contains(t);
        do
            if (t.nodeType == 11 && (t = t.host),
            t == n)
                return !0;
        while (t = t.parentNode)
    }
    function ei() {
        var n;
        try {
            n = document.activeElement
        } catch (t) {
            n = document.body || null
        }
        while (n && n.shadowRoot && n.shadowRoot.activeElement)
            n = n.shadowRoot.activeElement;
        return n
    }
    function rr(n, t) {
        var i = n.className;
        of(t).test(i) || (n.className += (i ? " " : "") + t)
    }
    function ps(n, t) {
        for (var r = n.split(" "), i = 0; i < r.length; i++)
            r[i] && !of(r[i]).test(t) && (t += " " + r[i]);
        return t
    }
    function ws(n) {
        var t = Array.prototype.slice.call(arguments, 1);
        return function() {
            return n.apply(null, t)
        }
    }
    function ur(n, t, i) {
        t || (t = {});
        for (var r in n)
            n.hasOwnProperty(r) && (i !== !1 || !t.hasOwnProperty(r)) && (t[r] = n[r]);
        return t
    }
    function at(n, t, i, r, u) {
        var f, e, o;
        for (t == null && (t = n.search(/[^\s\u00a0]/),
        t == -1 && (t = n.length)),
        f = r || 0,
        e = u || 0; ; ) {
            if (o = n.indexOf("\t", f),
            o < 0 || o >= t)
                return e + (t - f);
            e += o - f,
            e += i - e % i,
            f = o + 1
        }
    }
    function d(n, t) {
        for (var i = 0; i < n.length; ++i)
            if (n[i] == t)
                return i;
        return -1
    }
    function ks(n, t, i) {
        for (var f, e, r = 0, u = 0; ; ) {
            if (f = n.indexOf("\t", r),
            f == -1 && (f = n.length),
            e = f - r,
            f == n.length || u + e >= t)
                return r + Math.min(e, t - u);
            if (u += f - r,
            u += i - u % i,
            r = f + 1,
            u >= t)
                return r
        }
    }
    function ds(n) {
        while (hf.length <= n)
            hf.push(s(hf) + " ");
        return hf[n]
    }
    function s(n) {
        return n[n.length - 1]
    }
    function ro(n, t) {
        for (var r = [], i = 0; i < n.length; i++)
            r[i] = t(n[i], i);
        return r
    }
    function ok(n, t, i) {
        for (var r = 0, u = i(t); r < n.length && i(n[r]) <= u; )
            r++;
        n.splice(r, 0, t)
    }
    function ea() {}
    function oa(n, t) {
        var i;
        return Object.create ? i = Object.create(n) : (ea.prototype = n,
        i = new ea),
        t && ur(t, i),
        i
    }
    function gs(n) {
        return /\w/.test(n) || n > "" && (n.toUpperCase() != n.toLowerCase() || sa.test(n))
    }
    function uo(n, t) {
        return t ? t.source.indexOf("\\w") > -1 && gs(n) ? !0 : t.test(n) : gs(n)
    }
    function ha(n) {
        for (var t in n)
            if (n.hasOwnProperty(t) && n[t])
                return !1;
        return !0
    }
    function nh(n) {
        return n.charCodeAt(0) >= 768 && ca.test(n)
    }
    function la(n, t, i) {
        while ((i < 0 ? t > 0 : t < n.length) && nh(n.charAt(t)))
            t += i;
        return t
    }
    function cf(n, t, i) {
        for (var f = t > i ? -1 : 1, u, r; ; ) {
            if (t == i)
                return t;
            if (u = (t + i) / 2,
            r = f < 0 ? Math.ceil(u) : Math.floor(u),
            r == t)
                return n(r) ? t : i;
            n(r) ? i = r : t = r + f
        }
    }
    function sk(n, t, r) {
        var u = this, f;
        this.input = r,
        u.scrollbarFiller = i("div", null, "CodeMirror-scrollbar-filler"),
        u.scrollbarFiller.setAttribute("cm-not-content", "true"),
        u.gutterFiller = i("div", null, "CodeMirror-gutter-filler"),
        u.gutterFiller.setAttribute("cm-not-content", "true"),
        u.lineDiv = tu("div", null, "CodeMirror-code"),
        u.selectionDiv = i("div", null, null, "position: relative; z-index: 1"),
        u.cursorDiv = i("div", null, "CodeMirror-cursors"),
        u.measure = i("div", null, "CodeMirror-measure"),
        u.lineMeasure = i("div", null, "CodeMirror-measure"),
        u.lineSpace = tu("div", [u.measure, u.lineMeasure, u.selectionDiv, u.cursorDiv, u.lineDiv], null, "position: relative; outline: none"),
        f = tu("div", [u.lineSpace], "CodeMirror-lines"),
        u.mover = i("div", [f], null, "position: relative"),
        u.sizer = i("div", [u.mover], "CodeMirror-sizer"),
        u.sizerWidth = null,
        u.heightForcer = i("div", null, null, "position: absolute; height: " + fa + "px; width: 1px;"),
        u.gutters = i("div", null, "CodeMirror-gutters"),
        u.lineGutter = null,
        u.scroller = i("div", [u.sizer, u.heightForcer, u.gutters], "CodeMirror-scroll"),
        u.scroller.setAttribute("tabIndex", "-1"),
        u.wrapper = i("div", [u.scrollbarFiller, u.gutterFiller, u.scroller], "CodeMirror"),
        e && l < 8 && (u.gutters.style.zIndex = -1,
        u.scroller.style.paddingRight = 0),
        nt || ai && ef || (u.scroller.draggable = !0),
        n && (n.appendChild ? n.appendChild(u.wrapper) : n(u.wrapper)),
        u.viewFrom = u.viewTo = t.first,
        u.reportedViewFrom = u.reportedViewTo = t.first,
        u.view = [],
        u.renderedView = null,
        u.externalMeasured = null,
        u.viewOffset = 0,
        u.lastWrapHeight = u.lastWrapWidth = 0,
        u.updateLineNumbers = null,
        u.nativeBarWidth = u.barHeight = u.barWidth = 0,
        u.scrollbarsClipped = !1,
        u.lineNumWidth = u.lineNumInnerWidth = u.lineNumChars = null,
        u.alignWidgets = !1,
        u.cachedCharWidth = u.cachedTextHeight = u.cachedPaddingH = null,
        u.maxLine = null,
        u.maxLineLength = 0,
        u.maxLineChanged = !1,
        u.wheelDX = u.wheelDY = u.wheelStartX = u.wheelStartY = null,
        u.shift = !1,
        u.selForContextMenu = null,
        u.activeTouch = null,
        r.init(u)
    }
    function t(n, t) {
        var i, r, u, f;
        if (t -= n.first,
        t < 0 || t >= n.size)
            throw new Error("There is no line " + (t + n.first) + " in the document.");
        for (i = n; !i.lines; )
            for (r = 0; ; ++r) {
                if (u = i.children[r],
                f = u.chunkSize(),
                t < f) {
                    i = u;
                    break
                }
                t -= f
            }
        return i.lines[t]
    }
    function fr(n, t, i) {
        var u = []
          , r = t.line;
        return n.iter(t.line, i.line + 1, function(n) {
            var f = n.text;
            r == i.line && (f = f.slice(0, i.ch)),
            r == t.line && (f = f.slice(t.ch)),
            u.push(f),
            ++r
        }),
        u
    }
    function th(n, t, i) {
        var r = [];
        return n.iter(t, i, function(n) {
            r.push(n.text)
        }),
        r
    }
    function ni(n, t) {
        var r = t - n.height, i;
        if (r)
            for (i = n; i; i = i.parent)
                i.height += r
    }
    function h(n) {
        var i, u, t, r;
        if (n.parent == null)
            return null;
        for (i = n.parent,
        u = d(i.lines, n),
        t = i.parent; t; i = t,
        t = t.parent)
            for (r = 0; ; ++r) {
                if (t.children[r] == i)
                    break;
                u += t.children[r].chunkSize()
            }
        return u + i.first
    }
    function er(n, t) {
        var f = n.first, r, u, e, i, s, o;
        n: do {
            for (r = 0; r < n.children.length; ++r) {
                if (u = n.children[r],
                e = u.height,
                t < e) {
                    n = u;
                    continue n
                }
                t -= e,
                f += u.chunkSize()
            }
            return f
        } while (!n.lines);
        for (i = 0; i < n.lines.length; ++i) {
            if (s = n.lines[i],
            o = s.height,
            t < o)
                break;
            t -= o
        }
        return f + i
    }
    function lf(n, t) {
        return t >= n.first && t < n.first + n.size
    }
    function ih(n, t) {
        return String(n.lineNumberFormatter(t + n.firstLineNumber))
    }
    function n(t, i, r) {
        if (r === void 0 && (r = null),
        !(this instanceof n))
            return new n(t,i,r);
        this.line = t,
        this.ch = i,
        this.sticky = r
    }
    function u(n, t) {
        return n.line - t.line || n.ch - t.ch
    }
    function rh(n, t) {
        return n.sticky == t.sticky && u(n, t) == 0
    }
    function uh(t) {
        return n(t.line, t.ch)
    }
    function fo(n, t) {
        return u(n, t) < 0 ? t : n
    }
    function eo(n, t) {
        return u(n, t) < 0 ? n : t
    }
    function aa(n, t) {
        return Math.max(n.first, Math.min(t, n.first + n.size - 1))
    }
    function f(i, r) {
        if (r.line < i.first)
            return n(i.first, 0);
        var u = i.first + i.size - 1;
        return r.line > u ? n(u, t(i, u).text.length) : hk(r, t(i, r.line).text.length)
    }
    function hk(t, i) {
        var r = t.ch;
        return r == null || r > i ? n(t.line, i) : r < 0 ? n(t.line, 0) : t
    }
    function va(n, t) {
        for (var r = [], i = 0; i < t.length; i++)
            r[i] = f(n, t[i]);
        return r
    }
    function ck() {
        fh = !0
    }
    function lk() {
        ti = !0
    }
    function oo(n, t, i) {
        this.marker = n,
        this.from = t,
        this.to = i
    }
    function af(n, t) {
        var i, r;
        if (n)
            for (i = 0; i < n.length; ++i)
                if (r = n[i],
                r.marker == t)
                    return r
    }
    function ak(n, t) {
        for (var r, i = 0; i < n.length; ++i)
            n[i] != t && (r || (r = [])).push(n[i]);
        return r
    }
    function vk(n, t) {
        n.markedSpans = n.markedSpans ? n.markedSpans.concat([t]) : [t],
        t.marker.attachLine(n)
    }
    function yk(n, t, i) {
        var e, u, o;
        if (n)
            for (u = 0; u < n.length; ++u) {
                var r = n[u]
                  , f = r.marker
                  , s = r.from == null || (f.inclusiveLeft ? r.from <= t : r.from < t);
                !s && (r.from != t || f.type != "bookmark" || i && r.marker.insertLeft) || (o = r.to == null || (f.inclusiveRight ? r.to >= t : r.to > t),
                (e || (e = [])).push(new oo(f,r.from,o ? null : r.to)))
            }
        return e
    }
    function pk(n, t, i) {
        var e, u, o;
        if (n)
            for (u = 0; u < n.length; ++u) {
                var r = n[u]
                  , f = r.marker
                  , s = r.to == null || (f.inclusiveRight ? r.to >= t : r.to > t);
                (s || r.from == t && f.type == "bookmark" && (!i || r.marker.insertLeft)) && (o = r.from == null || (f.inclusiveLeft ? r.from <= t : r.from < t),
                (e || (e = [])).push(new oo(f,o ? null : r.from - t,r.to == null ? null : r.to - t)))
            }
        return e
    }
    function eh(n, i) {
        var w, b, a, h, v, y, e, it, p, d, g, c, nt;
        if (i.full || (w = lf(n, i.from.line) && t(n, i.from.line).markedSpans,
        b = lf(n, i.to.line) && t(n, i.to.line).markedSpans,
        !w && !b))
            return null;
        var k = i.from.ch
          , rt = i.to.ch
          , tt = u(i.from, i.to) == 0
          , r = yk(w, k, tt)
          , f = pk(b, rt, tt)
          , o = i.text.length == 1
          , l = s(i.text).length + (o ? k : 0);
        if (r)
            for (a = 0; a < r.length; ++a)
                h = r[a],
                h.to == null && (v = af(f, h.marker),
                v ? o && (h.to = v.to == null ? null : v.to + l) : h.to = k);
        if (f)
            for (y = 0; y < f.length; ++y)
                e = f[y],
                e.to != null && (e.to += l),
                e.from == null ? (it = af(r, e.marker),
                it || (e.from = l,
                o && (r || (r = [])).push(e))) : (e.from += l,
                o && (r || (r = [])).push(e));
        if (r && (r = ya(r)),
        f && f != r && (f = ya(f)),
        p = [r],
        !o) {
            if (d = i.text.length - 2,
            d > 0 && r)
                for (c = 0; c < r.length; ++c)
                    r[c].to == null && (g || (g = [])).push(new oo(r[c].marker,null,null));
            for (nt = 0; nt < d; ++nt)
                p.push(g);
            p.push(f)
        }
        return p
    }
    function ya(n) {
        for (var i, t = 0; t < n.length; ++t)
            i = n[t],
            i.from != null && i.from == i.to && i.marker.clearWhenEmpty !== !1 && n.splice(t--, 1);
        return n.length ? n : null
    }
    function wk(n, t, i) {
        var r = null, o, h, c, f, s, e;
        if (n.iter(t.line, i.line + 1, function(n) {
            var t, i;
            if (n.markedSpans)
                for (t = 0; t < n.markedSpans.length; ++t)
                    i = n.markedSpans[t].marker,
                    i.readOnly && (!r || d(r, i) == -1) && (r || (r = [])).push(i)
        }),
        !r)
            return null;
        for (o = [{
            from: t,
            to: i
        }],
        h = 0; h < r.length; ++h)
            for (c = r[h],
            f = c.find(0),
            s = 0; s < o.length; ++s)
                if (e = o[s],
                !(u(e.to, f.from) < 0) && !(u(e.from, f.to) > 0)) {
                    var l = [s, 1]
                      , a = u(e.from, f.from)
                      , v = u(e.to, f.to);
                    (a < 0 || !c.inclusiveLeft && !a) && l.push({
                        from: e.from,
                        to: f.from
                    }),
                    (v > 0 || !c.inclusiveRight && !v) && l.push({
                        from: f.to,
                        to: e.to
                    }),
                    o.splice.apply(o, l),
                    s += l.length - 3
                }
        return o
    }
    function pa(n) {
        var i = n.markedSpans, t;
        if (i) {
            for (t = 0; t < i.length; ++t)
                i[t].marker.detachLine(n);
            n.markedSpans = null
        }
    }
    function wa(n, t) {
        if (t) {
            for (var i = 0; i < t.length; ++i)
                t[i].marker.attachLine(n);
            n.markedSpans = t
        }
    }
    function so(n) {
        return n.inclusiveLeft ? -1 : 0
    }
    function ho(n) {
        return n.inclusiveRight ? 1 : 0
    }
    function oh(n, t) {
        var r = n.lines.length - t.lines.length, i;
        if (r != 0)
            return r;
        var f = n.find()
          , e = t.find()
          , o = u(f.from, e.from) || so(n) - so(t);
        return o ? -o : (i = u(f.to, e.to) || ho(n) - ho(t),
        i) ? i : t.id - n.id
    }
    function ba(n, t) {
        var f = ti && n.markedSpans, r, i, u;
        if (f)
            for (i = void 0,
            u = 0; u < f.length; ++u)
                i = f[u],
                i.marker.collapsed && (t ? i.from : i.to) == null && (!r || oh(r, i.marker) < 0) && (r = i.marker);
        return r
    }
    function ka(n) {
        return ba(n, !0)
    }
    function co(n) {
        return ba(n, !1)
    }
    function bk(n, t) {
        var f = ti && n.markedSpans, r, u, i;
        if (f)
            for (u = 0; u < f.length; ++u)
                i = f[u],
                i.marker.collapsed && (i.from == null || i.from < t) && (i.to == null || i.to > t) && (!r || oh(r, i.marker) < 0) && (r = i.marker);
        return r
    }
    function da(n, i, r, f, e) {
        var v = t(n, i), l = ti && v.markedSpans, h, o;
        if (l)
            for (h = 0; h < l.length; ++h)
                if (o = l[h],
                o.marker.collapsed) {
                    var s = o.marker.find(0)
                      , c = u(s.from, r) || so(o.marker) - so(e)
                      , a = u(s.to, f) || ho(o.marker) - ho(e);
                    if ((!(c >= 0) || !(a <= 0)) && (!(c <= 0) || !(a >= 0)) && (c <= 0 && (o.marker.inclusiveRight && e.inclusiveLeft ? u(s.to, r) >= 0 : u(s.to, r) > 0) || c >= 0 && (o.marker.inclusiveRight && e.inclusiveLeft ? u(s.from, f) <= 0 : u(s.from, f) < 0)))
                        return !0
                }
    }
    function ii(n) {
        for (var t; t = ka(n); )
            n = t.find(-1, !0).line;
        return n
    }
    function kk(n) {
        for (var t; t = co(n); )
            n = t.find(1, !0).line;
        return n
    }
    function dk(n) {
        for (var i, t; i = co(n); )
            n = i.find(1, !0).line,
            (t || (t = [])).push(n);
        return t
    }
    function sh(n, i) {
        var r = t(n, i)
          , u = ii(r);
        return r == u ? i : h(u)
    }
    function ga(n, i) {
        if (i > n.lastLine())
            return i;
        var r = t(n, i), u;
        if (!or(n, r))
            return i;
        while (u = co(r))
            r = u.find(1, !0).line;
        return h(r) + 1
    }
    function or(n, t) {
        var u = ti && t.markedSpans, i, r;
        if (u)
            for (i = void 0,
            r = 0; r < u.length; ++r)
                if (i = u[r],
                i.marker.collapsed) {
                    if (i.from == null)
                        return !0;
                    if (!i.marker.widgetNode && i.from == 0 && i.marker.inclusiveLeft && hh(n, t, i))
                        return !0
                }
    }
    function hh(n, t, i) {
        var f, r, u;
        if (i.to == null)
            return f = i.marker.find(1, !0),
            hh(n, f.line, af(f.line.markedSpans, i.marker));
        if (i.marker.inclusiveRight && i.to == t.text.length)
            return !0;
        for (r = void 0,
        u = 0; u < t.markedSpans.length; ++u)
            if (r = t.markedSpans[u],
            r.marker.collapsed && !r.marker.widgetNode && r.from == i.to && (r.to == null || r.to != i.from) && (r.marker.inclusiveLeft || i.marker.inclusiveRight) && hh(n, t, r))
                return !0
    }
    function oi(n) {
        var r, t, u, e, i, f, o;
        for (n = ii(n),
        r = 0,
        t = n.parent,
        u = 0; u < t.lines.length; ++u)
            if (e = t.lines[u],
            e == n)
                break;
            else
                r += e.height;
        for (i = t.parent; i; t = i,
        i = t.parent)
            for (f = 0; f < i.children.length; ++f)
                if (o = i.children[f],
                o == t)
                    break;
                else
                    r += o.height;
        return r
    }
    function lo(n) {
        var i, r, t, u, f;
        if (n.height == 0)
            return 0;
        for (i = n.text.length,
        t = n; r = ka(t); )
            u = r.find(0, !0),
            t = u.from.line,
            i += u.from.ch - u.to.ch;
        for (t = n; r = co(t); )
            f = r.find(0, !0),
            i -= t.text.length - f.from.ch,
            t = f.to.line,
            i += t.text.length - f.to.ch;
        return i
    }
    function ch(n) {
        var i = n.display
          , r = n.doc;
        i.maxLine = t(r, r.first),
        i.maxLineLength = lo(i.maxLine),
        i.maxLineChanged = !0,
        r.iter(function(n) {
            var t = lo(n);
            t > i.maxLineLength && (i.maxLineLength = t,
            i.maxLine = n)
        })
    }
    function gk(n, t, i, r) {
        var e, f, u;
        if (!n)
            return r(t, i, "ltr", 0);
        for (e = !1,
        f = 0; f < n.length; ++f)
            u = n[f],
            (u.from < i && u.to > t || t == i && u.to == t) && (r(Math.max(u.from, t), Math.min(u.to, i), u.level == 1 ? "rtl" : "ltr", f),
            e = !0);
        e || r(t, i, "ltr")
    }
    function vf(n, t, i) {
        var f, r, u;
        for (ru = null,
        r = 0; r < n.length; ++r) {
            if (u = n[r],
            u.from < t && u.to > t)
                return r;
            u.to == t && (u.from != u.to && i == "before" ? f = r : ru = r),
            u.from == t && (u.from != u.to && i != "before" ? f = r : ru = r)
        }
        return f != null ? f : ru
    }
    function si(n, t) {
        var i = n.order;
        return i == null && (i = n.order = nv(n.text, t)),
        i
    }
    function ah(n, t) {
        return n._handlers && n._handlers[t] || lh
    }
    function lt(n, t, i) {
        var u, r, f;
        n.removeEventListener ? n.removeEventListener(t, i, !1) : n.detachEvent ? n.detachEvent("on" + t, i) : (u = n._handlers,
        r = u && u[t],
        r && (f = d(r, i),
        f > -1 && (u[t] = r.slice(0, f).concat(r.slice(f + 1)))))
    }
    function p(n, t) {
        var r = ah(n, t), u, i;
        if (r.length)
            for (u = Array.prototype.slice.call(arguments, 2),
            i = 0; i < r.length; ++i)
                r[i].apply(null, u)
    }
    function w(n, t, i) {
        return typeof t == "string" && (t = {
            type: t,
            preventDefault: function() {
                this.defaultPrevented = !0
            }
        }),
        p(n, i || t.type, n, t),
        vh(t) || t.codemirrorIgnore
    }
    function tv(n) {
        var i = n._handlers && n._handlers.cursorActivity, r, t;
        if (i)
            for (r = n.curOp.cursorActivityHandlers || (n.curOp.cursorActivityHandlers = []),
            t = 0; t < i.length; ++t)
                d(r, i[t]) == -1 && r.push(i[t])
    }
    function vt(n, t) {
        return ah(n, t).length > 0
    }
    function uu(n) {
        n.prototype.on = function(n, t) {
            r(this, n, t)
        }
        ,
        n.prototype.off = function(n, t) {
            lt(this, n, t)
        }
    }
    function ft(n) {
        n.preventDefault ? n.preventDefault() : n.returnValue = !1
    }
    function iv(n) {
        n.stopPropagation ? n.stopPropagation() : n.cancelBubble = !0
    }
    function vh(n) {
        return n.defaultPrevented != null ? n.defaultPrevented : n.returnValue == !1
    }
    function yf(n) {
        ft(n),
        iv(n)
    }
    function yh(n) {
        return n.target || n.srcElement
    }
    function rv(n) {
        var t = n.which;
        return t == null && (n.button & 1 ? t = 1 : n.button & 2 ? t = 3 : n.button & 4 && (t = 2)),
        wt && n.ctrlKey && t == 1 && (t = 3),
        t
    }
    function nd(n) {
        var t, r;
        return ph == null && (t = i("span", "​"),
        ct(n, i("span", [t, document.createTextNode("x")])),
        n.firstChild.offsetHeight != 0 && (ph = t.offsetWidth <= 1 && t.offsetHeight > 2 && !(e && l < 8))),
        r = ph ? i("span", "​") : i("span", " ", null, "display: inline-block; width: 1px; margin-right: -1px"),
        r.setAttribute("cm-text", ""),
        r
    }
    function td(n) {
        if (wh != null)
            return wh;
        var i = ct(n, document.createTextNode("AخA"))
          , t = ir(i, 0, 1).getBoundingClientRect()
          , r = ir(i, 1, 2).getBoundingClientRect();
        return (yi(n),
        !t || t.left == t.right) ? !1 : wh = r.right - t.right < 3
    }
    function ud(n) {
        if (kh != null)
            return kh;
        var t = ct(n, i("span", "x"))
          , r = t.getBoundingClientRect()
          , u = ir(t, 0, 1).getBoundingClientRect();
        return kh = Math.abs(r.left - u.left) > 1
    }
    function fd(n, t) {
        arguments.length > 2 && (t.dependencies = Array.prototype.slice.call(arguments, 2)),
        ao[n] = t
    }
    function ed(n, t) {
        sr[n] = t
    }
    function vo(n) {
        if (typeof n == "string" && sr.hasOwnProperty(n))
            n = sr[n];
        else if (n && typeof n.name == "string" && sr.hasOwnProperty(n.name)) {
            var t = sr[n.name];
            typeof t == "string" && (t = {
                name: t
            }),
            n = oa(t, n),
            n.name = t.name
        } else {
            if (typeof n == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(n))
                return vo("application/xml");
            if (typeof n == "string" && /^[\w\-]+\/[\w\-]+\+json$/.test(n))
                return vo("application/json")
        }
        return typeof n == "string" ? {
            name: n
        } : n || {
            name: "null"
        }
    }
    function dh(n, t) {
        var f, i, u, r, e;
        if (t = vo(t),
        f = ao[t.name],
        !f)
            return dh(n, "text/plain");
        if (i = f(n, t),
        hr.hasOwnProperty(t.name)) {
            u = hr[t.name];
            for (r in u)
                u.hasOwnProperty(r) && (i.hasOwnProperty(r) && (i["_" + r] = i[r]),
                i[r] = u[r])
        }
        if (i.name = t.name,
        t.helperType && (i.helperType = t.helperType),
        t.modeProps)
            for (e in t.modeProps)
                i[e] = t.modeProps[e];
        return i
    }
    function od(n, t) {
        var i = hr.hasOwnProperty(n) ? hr[n] : hr[n] = {};
        ur(t, i)
    }
    function cr(n, t) {
        var r, u, i;
        if (t === !0)
            return t;
        if (n.copyState)
            return n.copyState(t);
        r = {};
        for (u in t)
            i = t[u],
            i instanceof Array && (i = i.concat([])),
            r[u] = i;
        return r
    }
    function gh(n, t) {
        for (var i; n.innerMode; ) {
            if (i = n.innerMode(t),
            !i || i.mode == n)
                break;
            t = i.state,
            n = i.mode
        }
        return i || {
            mode: n,
            state: t
        }
    }
    function fv(n, t, i) {
        return n.startState ? n.startState(t, i) : !0
    }
    function ev(n, t, i, r) {
        var u = [n.state.modeGen], f = {}, o, s, e;
        for (lv(n, t.text, n.doc.mode, i, function(n, t) {
            return u.push(n, t)
        }, f, r),
        o = i.state,
        s = function(r) {
            i.baseTokens = u;
            var s = n.state.overlays[r]
              , e = 1
              , h = 0;
            i.state = !0,
            lv(n, t.text, s.mode, i, function(n, t) {
                for (var i = e, r, f; h < n; )
                    r = u[e],
                    r > n && u.splice(e, 1, n, u[e + 1], r),
                    e += 2,
                    h = Math.min(n, r);
                if (t)
                    if (s.opaque)
                        u.splice(i, e - i, n, "overlay " + t),
                        e = i + 2;
                    else
                        for (; i < e; i += 2)
                            f = u[i + 1],
                            u[i + 1] = (f ? f + " " : "") + "overlay " + t
            }, f),
            i.state = o,
            i.baseTokens = null,
            i.baseTokenPos = 1
        }
        ,
        e = 0; e < n.state.overlays.length; ++e)
            s(e);
        return {
            styles: u,
            classes: f.bgClass || f.textClass ? f : null
        }
    }
    function ov(n, t, i) {
        if (!t.styles || t.styles[0] != n.state.modeGen) {
            var r = wf(n, h(t))
              , u = t.text.length > n.options.maxHighlightLength && cr(n.doc.mode, r.state)
              , f = ev(n, t, r);
            u && (r.state = u),
            t.stateAfter = r.save(!u),
            t.styles = f.styles,
            f.classes ? t.styleClasses = f.classes : t.styleClasses && (t.styleClasses = null),
            i === n.doc.highlightFrontier && (n.doc.modeFrontier = Math.max(n.doc.modeFrontier, ++n.doc.highlightFrontier))
        }
        return t.styles
    }
    function wf(n, i, r) {
        var u = n.doc
          , o = n.display;
        if (!u.mode.startState)
            return new bt(u,!0,i);
        var e = sd(n, i, r)
          , s = e > u.first && t(u, e - 1).stateAfter
          , f = s ? bt.fromSaved(u, s, e) : new bt(u,fv(u.mode),e);
        return u.iter(e, i, function(t) {
            nc(n, t.text, f);
            var r = f.line;
            t.stateAfter = r == i - 1 || r % 5 == 0 || r >= o.viewFrom && r < o.viewTo ? f.save() : null,
            f.nextLine()
        }),
        r && (u.modeFrontier = f.line),
        f
    }
    function nc(n, t, i, r) {
        var f = n.doc.mode
          , u = new v(t,n.options.tabSize,i);
        for (u.start = u.pos = r || 0,
        t == "" && sv(f, i.state); !u.eol(); )
            tc(f, u, i.state),
            u.start = u.pos
    }
    function sv(n, t) {
        if (n.blankLine)
            return n.blankLine(t);
        if (n.innerMode) {
            var i = gh(n, t);
            if (i.mode.blankLine)
                return i.mode.blankLine(i.state)
        }
    }
    function tc(n, t, i, r) {
        for (var f, u = 0; u < 10; u++)
            if (r && (r[0] = gh(n, i).mode),
            f = n.token(t, i),
            t.pos > t.start)
                return f;
        throw new Error("Mode " + n.name + " failed to advance stream.");
    }
    function hv(n, i, r, u) {
        var o = n.doc, l = o.mode, h;
        i = f(o, i);
        var a = t(o, i.line), s = wf(n, i.line, r), e = new v(a.text,n.options.tabSize,s), c;
        for (u && (c = []); (u || e.pos < i.ch) && !e.eol(); )
            e.start = e.pos,
            h = tc(l, e, s.state),
            u && c.push(new ic(e,h,cr(o.mode, s.state)));
        return u ? c : new ic(e,h,s.state)
    }
    function cv(n, t) {
        var i, r;
        if (n)
            for (; ; ) {
                if (i = n.match(/(?:^|\s+)line-(background-)?(\S+)/),
                !i)
                    break;
                n = n.slice(0, i.index) + n.slice(i.index + i[0].length),
                r = i[1] ? "bgClass" : "textClass",
                t[r] == null ? t[r] = i[2] : new RegExp("(?:^|s)" + i[2] + "(?:$|s)").test(t[r]) || (t[r] += " " + i[2])
            }
        return n
    }
    function lv(n, t, i, r, u, f, e) {
        var c = i.flattenSpans, a, p;
        c == null && (c = n.options.flattenSpans);
        var s = 0, l = null, o = new v(t,n.options.tabSize,r), h, y = n.options.addModeClass && [null];
        for (t == "" && cv(sv(i, r.state), f); !o.eol(); ) {
            if (o.pos > n.options.maxHighlightLength ? (c = !1,
            e && nc(n, t, r, o.pos),
            o.pos = t.length,
            h = null) : h = cv(tc(i, o, r.state, y), f),
            y && (a = y[0].name,
            a && (h = "m-" + (h ? a + " " + h : a))),
            !c || l != h) {
                while (s < o.start)
                    s = Math.min(o.start, s + 5e3),
                    u(s, l);
                l = h
            }
            o.start = o.pos
        }
        while (s < o.pos)
            p = Math.min(o.pos, s + 5e3),
            u(p, l),
            s = p
    }
    function sd(n, i, r) {
        for (var c, o, f = n.doc, l = r ? -1 : i - (n.doc.mode.innerMode ? 1e3 : 100), s, e, h, u = i; u > l; --u) {
            if (u <= f.first)
                return f.first;
            if (s = t(f, u - 1),
            e = s.stateAfter,
            e && (!r || u + (e instanceof pf ? e.lookAhead : 0) <= f.modeFrontier))
                return u;
            h = at(s.text, null, n.options.tabSize),
            (o == null || c > h) && (o = u - 1,
            c = h)
        }
        return o
    }
    function hd(n, i) {
        var u, r, f;
        if (n.modeFrontier = Math.min(n.modeFrontier, i),
        !(n.highlightFrontier < i - 10)) {
            for (u = n.first,
            r = i - 1; r > u; r--)
                if (f = t(n, r).stateAfter,
                f && (!(f instanceof pf) || r + f.lookAhead < i)) {
                    u = r + 1;
                    break
                }
            n.highlightFrontier = Math.min(n.highlightFrontier, u)
        }
    }
    function cd(n, t, i, r) {
        n.text = t,
        n.stateAfter && (n.stateAfter = null),
        n.styles && (n.styles = null),
        n.order != null && (n.order = null),
        pa(n),
        wa(n, i);
        var u = r ? r(n) : 1;
        u != n.height && ni(n, u)
    }
    function ld(n) {
        n.parent = null,
        pa(n)
    }
    function yv(n, t) {
        if (!n || /^\s*$/.test(n))
            return null;
        var i = t.addModeClass ? vv : av;
        return i[n] || (i[n] = n.replace(/\S+/g, "cm-$&"))
    }
    function pv(n, t) {
        var s = tu("span", null, null, nt ? "padding-right: .1px" : null), i = {
            pre: tu("pre", [s], "CodeMirror-line"),
            content: s,
            col: 0,
            pos: 0,
            cm: n,
            trailingSpace: !1,
            splitSpaces: (e || nt) && n.getOption("lineWrapping")
        }, u, r, o, c, f;
        for (t.measure = {},
        u = 0; u <= (t.rest ? t.rest.length : 0); u++)
            r = u ? t.rest[u - 1] : t.line,
            o = void 0,
            i.pos = 0,
            i.addToken = vd,
            td(n.display.measure) && (o = si(r, n.doc.direction)) && (i.addToken = pd(i.addToken, o)),
            i.map = [],
            c = t != n.display.externalMeasured && h(r),
            wd(r, i, ov(n, r, c)),
            r.styleClasses && (r.styleClasses.bgClass && (i.bgClass = ps(r.styleClasses.bgClass, i.bgClass || "")),
            r.styleClasses.textClass && (i.textClass = ps(r.styleClasses.textClass, i.textClass || ""))),
            i.map.length == 0 && i.map.push(0, 0, i.content.appendChild(nd(n.display.measure))),
            u == 0 ? (t.measure.map = i.map,
            t.measure.cache = {}) : ((t.measure.maps || (t.measure.maps = [])).push(i.map),
            (t.measure.caches || (t.measure.caches = [])).push({}));
        return nt && (f = i.content.lastChild,
        (/\bcm-tab\b/.test(f.className) || f.querySelector && f.querySelector(".cm-tab")) && (i.content.className = "cm-tab-wrap-hack")),
        p(n, "renderLine", n, t.line, i.pre),
        i.pre.className && (i.textClass = ps(i.pre.className, i.textClass || "")),
        i
    }
    function ad(n) {
        var t = i("span", "•", "cm-invalidchar");
        return t.title = "\\u" + n.charCodeAt(0).toString(16),
        t.setAttribute("aria-label", t.title),
        t
    }
    function vd(n, t, r, u, f, o, s) {
        var v, c, y, p, a, d, g, w, nt;
        if (t) {
            var b = n.splitSpaces ? yd(t, n.trailingSpace) : t, k = n.cm.state.specialChars, tt = !1, h;
            if (k.test(t))
                for (h = document.createDocumentFragment(),
                v = 0; ; ) {
                    if (k.lastIndex = v,
                    c = k.exec(t),
                    y = c ? c.index - v : t.length - v,
                    y && (p = document.createTextNode(b.slice(v, v + y)),
                    e && l < 9 ? h.appendChild(i("span", [p])) : h.appendChild(p),
                    n.map.push(n.pos, n.pos + y, p),
                    n.col += y,
                    n.pos += y),
                    !c)
                        break;
                    v += y + 1,
                    a = void 0,
                    c[0] == "\t" ? (d = n.cm.options.tabSize,
                    g = d - n.col % d,
                    a = h.appendChild(i("span", ds(g), "cm-tab")),
                    a.setAttribute("role", "presentation"),
                    a.setAttribute("cm-text", "\t"),
                    n.col += g) : c[0] == "\r" || c[0] == "\n" ? (a = h.appendChild(i("span", c[0] == "\r" ? "␍" : "␤", "cm-invalidchar")),
                    a.setAttribute("cm-text", c[0]),
                    n.col += 1) : (a = n.cm.options.specialCharPlaceholder(c[0]),
                    a.setAttribute("cm-text", c[0]),
                    e && l < 9 ? h.appendChild(i("span", [a])) : h.appendChild(a),
                    n.col += 1),
                    n.map.push(n.pos, n.pos + 1, a),
                    n.pos++
                }
            else
                n.col += t.length,
                h = document.createTextNode(b),
                n.map.push(n.pos, n.pos + t.length, h),
                e && l < 9 && (tt = !0),
                n.pos += t.length;
            if (n.trailingSpace = b.charCodeAt(t.length - 1) == 32,
            r || u || f || tt || s)
                return w = r || "",
                u && (w += u),
                f && (w += f),
                nt = i("span", [h], w, s),
                o && (nt.title = o),
                n.content.appendChild(nt);
            n.content.appendChild(h)
        }
    }
    function yd(n, t) {
        var u, f, i, r;
        if (n.length > 1 && !/  /.test(n))
            return n;
        for (u = t,
        f = "",
        i = 0; i < n.length; i++)
            r = n.charAt(i),
            r == " " && u && (i == n.length - 1 || n.charCodeAt(i + 1) == 32) && (r = " "),
            f += r,
            u = r == " ";
        return f
    }
    function pd(n, t) {
        return function(i, r, u, f, e, o, s) {
            var c, a, h, l;
            for (u = u ? u + " cm-force-border" : "cm-force-border",
            c = i.pos,
            a = c + r.length; ; ) {
                for (h = void 0,
                l = 0; l < t.length; l++)
                    if (h = t[l],
                    h.to > c && h.from <= c)
                        break;
                if (h.to >= a)
                    return n(i, r, u, f, e, o, s);
                n(i, r.slice(0, h.to - c), u, f, null, o, s),
                f = null,
                r = r.slice(h.to - c),
                c = h.to
            }
        }
    }
    function wv(n, t, i, r) {
        var u = !r && i.widgetNode;
        u && n.map.push(n.pos, n.pos + t, u),
        !r && n.cm.display.input.needsContentAttribute && (u || (u = n.content.appendChild(document.createElement("span"))),
        u.setAttribute("cm-marker", i.id)),
        u && (n.cm.display.input.setUneditable(u),
        n.content.appendChild(u)),
        n.pos += t,
        n.trailingSpace = !1
    }
    function wd(n, t, i) {
        var it = n.markedSpans, rt = n.text, y = 0, l, d, h, g, u, f, v, nt, c, tt, et;
        if (!it) {
            for (l = 1; l < i.length; l += 2)
                t.addToken(t, rt.slice(y, y = i[l]), yv(i[l + 1], t.cm.options));
            return
        }
        for (var ut = rt.length, r = 0, ot = 1, s = "", ft, a, o = 0, p, w, b, k, e; ; ) {
            if (o == r) {
                for (p = w = b = k = a = "",
                e = null,
                o = Infinity,
                d = [],
                h = void 0,
                g = 0; g < it.length; ++g)
                    u = it[g],
                    f = u.marker,
                    f.type == "bookmark" && u.from == r && f.widgetNode ? d.push(f) : u.from <= r && (u.to == null || u.to > r || f.collapsed && u.to == r && u.from == r) ? (u.to != null && u.to != r && o > u.to && (o = u.to,
                    w = ""),
                    f.className && (p += " " + f.className),
                    f.css && (a = (a ? a + ";" : "") + f.css),
                    f.startStyle && u.from == r && (b += " " + f.startStyle),
                    f.endStyle && u.to == o && (h || (h = [])).push(f.endStyle, u.to),
                    f.title && !k && (k = f.title),
                    f.collapsed && (!e || oh(e.marker, f) < 0) && (e = u)) : u.from > r && o > u.from && (o = u.from);
                if (h)
                    for (v = 0; v < h.length; v += 2)
                        h[v + 1] == o && (w += " " + h[v]);
                if (!e || e.from == r)
                    for (nt = 0; nt < d.length; ++nt)
                        wv(t, 0, d[nt]);
                if (e && (e.from || 0) == r) {
                    if (wv(t, (e.to == null ? ut + 1 : e.to) - r, e.marker, e.from == null),
                    e.to == null)
                        return;
                    e.to == r && (e = !1)
                }
            }
            if (r >= ut)
                break;
            for (c = Math.min(ut, o); ; ) {
                if (s) {
                    if (tt = r + s.length,
                    e || (et = tt > c ? s.slice(0, c - r) : s,
                    t.addToken(t, et, ft ? ft + p : p, b, r + et.length == o ? w : "", k, a)),
                    tt >= c) {
                        s = s.slice(c - r),
                        r = c;
                        break
                    }
                    r = tt,
                    b = ""
                }
                s = rt.slice(y, y = i[ot++]),
                ft = yv(i[ot++], t.cm.options)
            }
        }
    }
    function bv(n, t, i) {
        this.line = t,
        this.rest = dk(t),
        this.size = this.rest ? h(s(this.rest)) - i + 1 : 1,
        this.node = this.text = null,
        this.hidden = or(n, t)
    }
    function yo(n, i, r) {
        for (var e = [], o, f, u = i; u < r; u = o)
            f = new bv(n.doc,t(n.doc, u),u),
            o = u + f.size,
            e.push(f);
        return e
    }
    function bd(n) {
        ar ? ar.ops.push(n) : n.ownsGroup = ar = {
            ops: [n],
            delayedCallbacks: []
        }
    }
    function kd(n) {
        var u = n.delayedCallbacks, i = 0, r, t;
        do {
            for (; i < u.length; i++)
                u[i].call(null);
            for (r = 0; r < n.ops.length; r++)
                if (t = n.ops[r],
                t.cursorActivityHandlers)
                    while (t.cursorActivityCalled < t.cursorActivityHandlers.length)
                        t.cursorActivityHandlers[t.cursorActivityCalled++].call(null, t.cm)
        } while (i < u.length)
    }
    function dd(n, t) {
        var i = n.ownsGroup;
        if (i)
            try {
                kd(i)
            } finally {
                ar = null,
                t(i)
            }
    }
    function g(n, t) {
        var u = ah(n, t), f, i, e, r;
        if (u.length)
            for (f = Array.prototype.slice.call(arguments, 2),
            ar ? i = ar.delayedCallbacks : fu ? i = fu : (i = fu = [],
            setTimeout(gd, 0)),
            e = function(n) {
                i.push(function() {
                    return u[n].apply(null, f)
                })
            }
            ,
            r = 0; r < u.length; ++r)
                e(r)
    }
    function gd() {
        var t = fu, n;
        for (fu = null,
        n = 0; n < t.length; ++n)
            t[n]()
    }
    function kv(n, t, i, r) {
        for (var u, f = 0; f < t.changes.length; f++)
            u = t.changes[f],
            u == "text" ? tg(n, t) : u == "gutter" ? gv(n, t, i, r) : u == "class" ? rc(n, t) : u == "widget" && ig(n, t, r);
        t.changes = null
    }
    function bf(n) {
        return n.node == n.text && (n.node = i("div", null, null, "position: relative"),
        n.text.parentNode && n.text.parentNode.replaceChild(n.node, n.text),
        n.node.appendChild(n.text),
        e && l < 8 && (n.node.style.zIndex = 2)),
        n.node
    }
    function ng(n, t) {
        var r = t.bgClass ? t.bgClass + " " + (t.line.bgClass || "") : t.line.bgClass, u;
        r && (r += " CodeMirror-linebackground"),
        t.background ? r ? t.background.className = r : (t.background.parentNode.removeChild(t.background),
        t.background = null) : r && (u = bf(t),
        t.background = u.insertBefore(i("div", null, r), u.firstChild),
        n.display.input.setUneditable(t.background))
    }
    function dv(n, t) {
        var i = n.display.externalMeasured;
        return i && i.line == t.line ? (n.display.externalMeasured = null,
        t.measure = i.measure,
        i.built) : pv(n, t)
    }
    function tg(n, t) {
        var r = t.text.className
          , i = dv(n, t);
        t.text == t.node && (t.node = i.pre),
        t.text.parentNode.replaceChild(i.pre, t.text),
        t.text = i.pre,
        i.bgClass != t.bgClass || i.textClass != t.textClass ? (t.bgClass = i.bgClass,
        t.textClass = i.textClass,
        rc(n, t)) : r && (t.text.className = r)
    }
    function rc(n, t) {
        ng(n, t),
        t.line.wrapClass ? bf(t).className = t.line.wrapClass : t.node != t.text && (t.node.className = "");
        var i = t.textClass ? t.textClass + " " + (t.line.textClass || "") : t.line.textClass;
        t.text.className = i || ""
    }
    function gv(n, t, r, u) {
        var c, f, l, e, s, o, h;
        if (t.gutter && (t.node.removeChild(t.gutter),
        t.gutter = null),
        t.gutterBackground && (t.node.removeChild(t.gutterBackground),
        t.gutterBackground = null),
        t.line.gutterClass && (c = bf(t),
        t.gutterBackground = i("div", null, "CodeMirror-gutter-background " + t.line.gutterClass, "left: " + (n.options.fixedGutter ? u.fixedPos : -u.gutterTotalWidth) + "px; width: " + u.gutterTotalWidth + "px"),
        n.display.input.setUneditable(t.gutterBackground),
        c.insertBefore(t.gutterBackground, t.text)),
        f = t.line.gutterMarkers,
        (n.options.lineNumbers || f) && (l = bf(t),
        e = t.gutter = i("div", null, "CodeMirror-gutter-wrapper", "left: " + (n.options.fixedGutter ? u.fixedPos : -u.gutterTotalWidth) + "px"),
        n.display.input.setUneditable(e),
        l.insertBefore(e, t.text),
        t.line.gutterClass && (e.className += " " + t.line.gutterClass),
        !n.options.lineNumbers || f && f["CodeMirror-linenumbers"] || (t.lineNumber = e.appendChild(i("div", ih(n.options, r), "CodeMirror-linenumber CodeMirror-gutter-elt", "left: " + u.gutterLeft["CodeMirror-linenumbers"] + "px; width: " + n.display.lineNumInnerWidth + "px"))),
        f))
            for (s = 0; s < n.options.gutters.length; ++s)
                o = n.options.gutters[s],
                h = f.hasOwnProperty(o) && f[o],
                h && e.appendChild(i("div", [h], "CodeMirror-gutter-elt", "left: " + u.gutterLeft[o] + "px; width: " + u.gutterWidth[o] + "px"))
    }
    function ig(n, t, i) {
        t.alignable && (t.alignable = null);
        for (var r = t.node.firstChild, u = void 0; r; r = u)
            u = r.nextSibling,
            r.className == "CodeMirror-linewidget" && t.node.removeChild(r);
        ny(n, t, i)
    }
    function rg(n, t, i, r) {
        var u = dv(n, t);
        return t.text = t.node = u.pre,
        u.bgClass && (t.bgClass = u.bgClass),
        u.textClass && (t.textClass = u.textClass),
        rc(n, t),
        gv(n, t, i, r),
        ny(n, t, r),
        t.node
    }
    function ny(n, t, i) {
        if (ty(n, t.line, t, i, !0),
        t.rest)
            for (var r = 0; r < t.rest.length; r++)
                ty(n, t.rest[r], t, i, !1)
    }
    function ty(n, t, r, u, f) {
        var h, s, c, e, o;
        if (t.widgets)
            for (h = bf(r),
            s = 0,
            c = t.widgets; s < c.length; ++s)
                e = c[s],
                o = i("div", [e.node], "CodeMirror-linewidget"),
                e.handleMouseEvents || o.setAttribute("cm-ignore-events", "true"),
                ug(e, o, r, u),
                n.display.input.setUneditable(o),
                f && e.above ? h.insertBefore(o, r.gutter || r.text) : h.appendChild(o),
                g(e, "redraw")
    }
    function ug(n, t, i, r) {
        if (n.noHScroll) {
            (i.alignable || (i.alignable = [])).push(t);
            var u = r.wrapperWidth;
            t.style.left = r.fixedPos + "px",
            n.coverGutter || (u -= r.gutterTotalWidth,
            t.style.paddingLeft = r.gutterTotalWidth + "px"),
            t.style.width = u + "px"
        }
        n.coverGutter && (t.style.zIndex = 5,
        t.style.position = "relative",
        n.noHScroll || (t.style.marginLeft = -r.gutterTotalWidth + "px"))
    }
    function kf(n) {
        var t, r;
        return n.height != null ? n.height : (t = n.doc.cm,
        !t) ? 0 : (pi(document.body, n.node) || (r = "position: relative;",
        n.coverGutter && (r += "margin-left: -" + t.display.gutters.offsetWidth + "px;"),
        n.noHScroll && (r += "width: " + t.display.wrapper.clientWidth + "px;"),
        ct(t.display.measure, i("div", [n.node], null, r))),
        n.height = n.node.parentNode.offsetHeight)
    }
    function hi(n, t) {
        for (var i = yh(t); i != n.wrapper; i = i.parentNode)
            if (!i || i.nodeType == 1 && i.getAttribute("cm-ignore-events") == "true" || i.parentNode == n.sizer && i != n.mover)
                return !0
    }
    function po(n) {
        return n.lineSpace.offsetTop
    }
    function uc(n) {
        return n.mover.offsetHeight - n.lineSpace.offsetHeight
    }
    function iy(n) {
        if (n.cachedPaddingH)
            return n.cachedPaddingH;
        var r = ct(n.measure, i("pre", "x"))
          , u = window.getComputedStyle ? window.getComputedStyle(r) : r.currentStyle
          , t = {
            left: parseInt(u.paddingLeft),
            right: parseInt(u.paddingRight)
        };
        return isNaN(t.left) || isNaN(t.right) || (n.cachedPaddingH = t),
        t
    }
    function ri(n) {
        return fa - n.display.nativeBarWidth
    }
    function vr(n) {
        return n.display.scroller.clientWidth - ri(n) - n.display.barWidth
    }
    function fc(n) {
        return n.display.scroller.clientHeight - ri(n) - n.display.barHeight
    }
    function fg(n, t, i) {
        var f = n.options.lineWrapping, h = f && vr(n), e, u, r, o, s;
        if (!t.measure.heights || f && t.measure.width != h) {
            if (e = t.measure.heights = [],
            f)
                for (t.measure.width = h,
                u = t.text.firstChild.getClientRects(),
                r = 0; r < u.length - 1; r++)
                    o = u[r],
                    s = u[r + 1],
                    Math.abs(o.bottom - s.bottom) > 2 && e.push((o.bottom + s.top) / 2 - i.top);
            e.push(i.bottom - i.top)
        }
    }
    function ry(n, t, i) {
        var r, u;
        if (n.line == t)
            return {
                map: n.measure.map,
                cache: n.measure.cache
            };
        for (r = 0; r < n.rest.length; r++)
            if (n.rest[r] == t)
                return {
                    map: n.measure.maps[r],
                    cache: n.measure.caches[r]
                };
        for (u = 0; u < n.rest.length; u++)
            if (h(n.rest[u]) > i)
                return {
                    map: n.measure.maps[u],
                    cache: n.measure.caches[u],
                    before: !0
                }
    }
    function eg(n, t) {
        var r, i, u;
        return t = ii(t),
        r = h(t),
        i = n.display.externalMeasured = new bv(n.doc,t,r),
        i.lineN = r,
        u = i.built = pv(n, i),
        i.text = u.pre,
        ct(n.display.lineMeasure, u.pre),
        i
    }
    function uy(n, t, i, r) {
        return ui(n, eu(n, t), i, r)
    }
    function ec(n, t) {
        if (t >= n.display.viewFrom && t < n.display.viewTo)
            return n.display.view[br(n, t)];
        var i = n.display.externalMeasured;
        if (i && t >= i.lineN && t < i.lineN + i.size)
            return i
    }
    function eu(n, t) {
        var u = h(t), i = ec(n, u), r;
        return i && !i.text ? i = null : i && i.changes && (kv(n, i, u, vc(n)),
        n.curOp.forceUpdate = !0),
        i || (i = eg(n, t)),
        r = ry(i, t, u),
        {
            line: t,
            view: i,
            rect: null,
            map: r.map,
            cache: r.cache,
            before: r.before,
            hasHeights: !1
        }
    }
    function ui(n, t, i, r, u) {
        t.before && (i = -1);
        var e = i + (r || ""), f;
        return t.cache.hasOwnProperty(e) ? f = t.cache[e] : (t.rect || (t.rect = t.view.text.getBoundingClientRect()),
        t.hasHeights || (fg(n, t.view, t.rect),
        t.hasHeights = !0),
        f = sg(n, t, i, r),
        f.bogus || (t.cache[e] = f)),
        {
            left: f.left,
            right: f.right,
            top: u ? f.rtop : f.top,
            bottom: u ? f.rbottom : f.bottom
        }
    }
    function fy(n, t, i) {
        for (var s, u, h, o, e, f, r = 0; r < n.length; r += 3)
            if (e = n[r],
            f = n[r + 1],
            t < e ? (u = 0,
            h = 1,
            o = "left") : t < f ? (u = t - e,
            h = u + 1) : (r == n.length - 3 || t == f && n[r + 3] > t) && (h = f - e,
            u = h - 1,
            t >= f && (o = "right")),
            u != null) {
                if (s = n[r + 2],
                e == f && i == (s.insertLeft ? "left" : "right") && (o = i),
                i == "left" && u == 0)
                    while (r && n[r - 2] == n[r - 3] && n[r - 1].insertLeft)
                        s = n[(r -= 3) + 2],
                        o = "left";
                if (i == "right" && u == f - e)
                    while (r < n.length - 3 && n[r + 3] == n[r + 4] && !n[r + 5].insertLeft)
                        s = n[(r += 3) + 2],
                        o = "right";
                break
            }
        return {
            node: s,
            start: u,
            end: h,
            collapse: o,
            coverStart: e,
            coverEnd: f
        }
    }
    function og(n, t) {
        var i = oc, r, u;
        if (t == "left") {
            for (r = 0; r < n.length; r++)
                if ((i = n[r]).left != i.right)
                    break
        } else
            for (u = n.length - 1; u >= 0; u--)
                if ((i = n[u]).left != i.right)
                    break;
        return i
    }
    function sg(n, t, i, r) {
        var o = fy(t.map, i, r), s = o.node, f = o.start, h = o.end, v = o.collapse, u, w, b, c;
        if (s.nodeType == 3) {
            for (w = 0; w < 4; w++) {
                while (f && nh(t.line.text.charAt(o.coverStart + f)))
                    --f;
                while (o.coverStart + h < o.coverEnd && nh(t.line.text.charAt(o.coverStart + h)))
                    ++h;
                if (u = e && l < 9 && f == 0 && h == o.coverEnd - o.coverStart ? s.parentNode.getBoundingClientRect() : og(ir(s, f, h).getClientRects(), r),
                u.left || u.right || f == 0)
                    break;
                h = f,
                f = f - 1,
                v = "right"
            }
            e && l < 11 && (u = hg(n.display.measure, u))
        } else
            f > 0 && (v = r = "right"),
            u = n.options.lineWrapping && (b = s.getClientRects()).length > 1 ? b[r == "right" ? b.length - 1 : 0] : s.getBoundingClientRect();
        e && l < 9 && !f && (!u || !u.left && !u.right) && (c = s.parentNode.getClientRects()[0],
        u = c ? {
            left: c.left,
            right: c.left + gf(n.display),
            top: c.top,
            bottom: c.bottom
        } : oc);
        for (var k = u.top - t.rect.top, d = u.bottom - t.rect.top, g = (k + d) / 2, y = t.view.measure.heights, a = 0; a < y.length - 1; a++)
            if (g < y[a])
                break;
        var nt = a ? y[a - 1] : 0
          , tt = y[a]
          , p = {
            left: (v == "right" ? u.right : u.left) - t.rect.left,
            right: (v == "left" ? u.left : u.right) - t.rect.left,
            top: nt,
            bottom: tt
        };
        return u.left || u.right || (p.bogus = !0),
        n.options.singleCursorHeightPerLine || (p.rtop = k,
        p.rbottom = d),
        p
    }
    function hg(n, t) {
        if (!window.screen || screen.logicalXDPI == null || screen.logicalXDPI == screen.deviceXDPI || !ud(n))
            return t;
        var i = screen.logicalXDPI / screen.deviceXDPI
          , r = screen.logicalYDPI / screen.deviceYDPI;
        return {
            left: t.left * i,
            right: t.right * i,
            top: t.top * r,
            bottom: t.bottom * r
        }
    }
    function ey(n) {
        if (n.measure && (n.measure.cache = {},
        n.measure.heights = null,
        n.rest))
            for (var t = 0; t < n.rest.length; t++)
                n.measure.caches[t] = {}
    }
    function oy(n) {
        n.display.externalMeasure = null,
        yi(n.display.lineMeasure);
        for (var t = 0; t < n.display.view.length; t++)
            ey(n.display.view[t])
    }
    function df(n) {
        oy(n),
        n.display.cachedCharWidth = n.display.cachedTextHeight = n.display.cachedPaddingH = null,
        n.options.lineWrapping || (n.display.maxLineChanged = !0),
        n.display.lineNumChars = null
    }
    function sy() {
        return ge && no ? -(document.body.getBoundingClientRect().left - parseInt(getComputedStyle(document.body).marginLeft)) : window.pageXOffset || (document.documentElement || document.body).scrollLeft
    }
    function hy() {
        return ge && no ? -(document.body.getBoundingClientRect().top - parseInt(getComputedStyle(document.body).marginTop)) : window.pageYOffset || (document.documentElement || document.body).scrollTop
    }
    function sc(n) {
        var i = 0, t;
        if (n.widgets)
            for (t = 0; t < n.widgets.length; ++t)
                n.widgets[t].above && (i += kf(n.widgets[t]));
        return i
    }
    function wo(n, t, i, r, u) {
        var e, f, o, s;
        return (u || (e = sc(t),
        i.top += e,
        i.bottom += e),
        r == "line") ? i : (r || (r = "local"),
        f = oi(t),
        r == "local" ? f += po(n.display) : f -= n.display.viewOffset,
        (r == "page" || r == "window") && (o = n.display.lineSpace.getBoundingClientRect(),
        f += o.top + (r == "window" ? 0 : hy()),
        s = o.left + (r == "window" ? 0 : sy()),
        i.left += s,
        i.right += s),
        i.top += f,
        i.bottom += f,
        i)
    }
    function cy(n, t, i) {
        var r, u, f, e;
        return i == "div" ? t : (r = t.left,
        u = t.top,
        i == "page" ? (r -= sy(),
        u -= hy()) : i != "local" && i || (f = n.display.sizer.getBoundingClientRect(),
        r += f.left,
        u += f.top),
        e = n.display.lineSpace.getBoundingClientRect(),
        {
            left: r - e.left,
            top: u - e.top
        })
    }
    function hc(n, i, r, u, f) {
        return u || (u = t(n.doc, i.line)),
        wo(n, u, uy(n, u, i.ch, f), r)
    }
    function kt(n, i, r, u, f, e) {
        function c(t, i) {
            var o = ui(n, f, t, i ? "right" : "left", e);
            return i ? o.left = o.right : o.right = o.left,
            wo(n, u, o, r)
        }
        function l(n, t, i) {
            var r = h[t]
              , u = r.level == 1;
            return c(i ? n - 1 : n, u != i)
        }
        u = u || t(n.doc, i.line),
        f || (f = eu(n, u));
        var h = si(u, n.doc.direction)
          , o = i.ch
          , s = i.sticky;
        if (o >= u.text.length ? (o = u.text.length,
        s = "before") : o <= 0 && (o = 0,
        s = "after"),
        !h)
            return c(s == "before" ? o - 1 : o, s == "before");
        var y = vf(h, o, s)
          , a = ru
          , v = l(o, y, s == "before");
        return a != null && (v.other = l(o, a, s != "before")),
        v
    }
    function ly(n, i) {
        var r = 0, u, e;
        return i = f(n.doc, i),
        n.options.lineWrapping || (r = gf(n.display) * i.ch),
        u = t(n.doc, i.line),
        e = oi(u) + po(n.display),
        {
            left: r,
            right: r,
            top: e,
            bottom: e + u.height
        }
    }
    function cc(t, i, r, u, f) {
        var e = n(t, i, r);
        return e.xRel = f,
        u && (e.outside = !0),
        e
    }
    function lc(n, i, r) {
        var u = n.doc, f, h, e, o, c, s;
        if (r += n.display.viewOffset,
        r < 0)
            return cc(u.first, 0, null, !0, -1);
        if (f = er(u, r),
        h = u.first + u.size - 1,
        f > h)
            return cc(u.first + u.size - 1, t(u, h).text.length, null, !0, 1);
        for (i < 0 && (i = 0),
        e = t(u, f); ; ) {
            if (o = cg(n, e, f, i, r),
            c = bk(e, o.ch + (o.xRel > 0 ? 1 : 0)),
            !c)
                return o;
            if (s = c.find(1),
            s.line == f)
                return s;
            e = t(u, f = s.line)
        }
    }
    function ay(n, t, i, r) {
        r -= sc(t);
        var u = t.text.length
          , f = cf(function(t) {
            return ui(n, i, t - 1).bottom <= r
        }, u, 0);
        return u = cf(function(t) {
            return ui(n, i, t).top > r
        }, f, u),
        {
            begin: f,
            end: u
        }
    }
    function vy(n, t, i, r) {
        i || (i = eu(n, t));
        var u = wo(n, t, ui(n, i, r), "line").top;
        return ay(n, t, i, u)
    }
    function ac(n, t, i, r) {
        return n.bottom <= i ? !1 : n.top > i ? !0 : (r ? n.left : n.right) > t
    }
    function cg(t, i, r, u, f) {
        var s, b, k, a;
        f -= oi(i);
        var c = eu(t, i)
          , v = sc(i)
          , y = 0
          , p = i.text.length
          , o = !0
          , d = si(i, t.doc.direction);
        d && (s = (t.options.lineWrapping ? ag : lg)(t, i, r, c, d, u, f),
        o = s.level != 1,
        y = o ? s.from : s.to - 1,
        p = o ? s.to : s.from - 1);
        var g = null, h = null, e = cf(function(n) {
            var i = ui(t, c, n);
            return (i.top += v,
            i.bottom += v,
            !ac(i, u, f, !1)) ? !1 : (i.top <= f && i.left <= u && (g = n,
            h = i),
            !0)
        }, y, p), w, l, nt = !1;
        return h ? (b = u - h.left < h.right - u,
        k = b == o,
        e = g + (k ? 0 : 1),
        l = k ? "after" : "before",
        w = b ? h.left : h.right) : (o || e != p && e != y || e++,
        l = e == 0 ? "after" : e == i.text.length ? "before" : ui(t, c, e - (o ? 1 : 0)).bottom + v <= f == o ? "after" : "before",
        a = kt(t, n(r, e, l), "line", i, c),
        w = a.left,
        nt = f < a.top || f >= a.bottom),
        e = la(i.text, e, 1),
        cc(r, e, l, nt, u - w)
    }
    function lg(t, i, r, u, f, e, o) {
        var h = cf(function(s) {
            var h = f[s]
              , c = h.level != 1;
            return ac(kt(t, n(r, c ? h.to : h.from, c ? "before" : "after"), "line", i, u), e, o, !0)
        }, 0, f.length - 1), s = f[h], c, l;
        return h > 0 && (c = s.level != 1,
        l = kt(t, n(r, c ? s.from : s.to, c ? "after" : "before"), "line", i, u),
        ac(l, e, o, !0) && l.top > o && (s = f[h - 1])),
        s
    }
    function ag(n, t, i, r, u, f, e) {
        var y = ay(n, t, r, e), c = y.begin, h = y.end, o, a, l, s;
        for (/\s/.test(t.text.charAt(h - 1)) && h--,
        o = null,
        a = null,
        l = 0; l < u.length; l++)
            if (s = u[l],
            !(s.from >= h) && !(s.to <= c)) {
                var w = s.level != 1
                  , v = ui(n, r, w ? Math.min(h, s.to) - 1 : Math.max(c, s.from)).right
                  , p = v < f ? f - v + 1e9 : v - f;
                (!o || a > p) && (o = s,
                a = p)
            }
        return o || (o = u[u.length - 1]),
        o.from < c && (o = {
            from: c,
            to: o.to,
            level: o.level
        }),
        o.to > h && (o = {
            from: o.from,
            to: h,
            level: o.level
        }),
        o
    }
    function pr(n) {
        var r, t;
        if (n.cachedTextHeight != null)
            return n.cachedTextHeight;
        if (yr == null) {
            for (yr = i("pre"),
            r = 0; r < 49; ++r)
                yr.appendChild(document.createTextNode("x")),
                yr.appendChild(i("br"));
            yr.appendChild(document.createTextNode("x"))
        }
        return ct(n.measure, yr),
        t = yr.offsetHeight / 50,
        t > 3 && (n.cachedTextHeight = t),
        yi(n.measure),
        t || 1
    }
    function gf(n) {
        var r, f, u, t;
        return n.cachedCharWidth != null ? n.cachedCharWidth : (r = i("span", "xxxxxxxxxx"),
        f = i("pre", [r]),
        ct(n.measure, f),
        u = r.getBoundingClientRect(),
        t = (u.right - u.left) / 10,
        t > 2 && (n.cachedCharWidth = t),
        t || 10)
    }
    function vc(n) {
        for (var i = n.display, u = {}, f = {}, e = i.gutters.clientLeft, t = i.gutters.firstChild, r = 0; t; t = t.nextSibling,
        ++r)
            u[n.options.gutters[r]] = t.offsetLeft + t.clientLeft + e,
            f[n.options.gutters[r]] = t.clientWidth;
        return {
            fixedPos: yc(i),
            gutterTotalWidth: i.gutters.offsetWidth,
            gutterLeft: u,
            gutterWidth: f,
            wrapperWidth: i.wrapper.clientWidth
        }
    }
    function yc(n) {
        return n.scroller.getBoundingClientRect().left - n.sizer.getBoundingClientRect().left
    }
    function yy(n) {
        var t = pr(n.display)
          , i = n.options.lineWrapping
          , r = i && Math.max(5, n.display.scroller.clientWidth / gf(n.display) - 3);
        return function(u) {
            var e, f;
            if (or(n.doc, u))
                return 0;
            if (e = 0,
            u.widgets)
                for (f = 0; f < u.widgets.length; f++)
                    u.widgets[f].height && (e += u.widgets[f].height);
            return i ? e + (Math.ceil(u.text.length / r) || 1) * t : e + t
        }
    }
    function pc(n) {
        var t = n.doc
          , i = yy(n);
        t.iter(function(n) {
            var t = i(n);
            t != n.height && ni(n, t)
        })
    }
    function wr(i, r, u, f) {
        var a = i.display, s, c, h, e, o, l;
        if (!u && yh(r).getAttribute("cm-not-content") == "true")
            return null;
        h = a.lineSpace.getBoundingClientRect();
        try {
            s = r.clientX - h.left,
            c = r.clientY - h.top
        } catch (r) {
            return null
        }
        return e = lc(i, s, c),
        f && e.xRel == 1 && (o = t(i.doc, e.line).text).length == e.ch && (l = at(o, o.length, i.options.tabSize) - o.length,
        e = n(e.line, Math.max(0, Math.round((s - iy(i.display).left) / gf(i.display)) - l))),
        e
    }
    function br(n, t) {
        var r, i;
        if (t >= n.display.viewTo || (t -= n.display.viewFrom,
        t < 0))
            return null;
        for (r = n.display.view,
        i = 0; i < r.length; i++)
            if (t -= r[i].size,
            t < 0)
                return i
    }
    function ne(n) {
        n.display.input.showSelection(n.display.input.prepareSelection())
    }
    function py(n, t) {
        var r, i, e;
        t === void 0 && (t = !0);
        var u = n.doc
          , f = {}
          , o = f.cursors = document.createDocumentFragment()
          , s = f.selection = document.createDocumentFragment();
        for (r = 0; r < u.sel.ranges.length; r++)
            (t || r != u.sel.primIndex) && ((i = u.sel.ranges[r],
            i.from().line >= n.display.viewTo || i.to().line < n.display.viewFrom) || (e = i.empty(),
            (e || n.options.showCursorWhenSelecting) && wy(n, i.head, o),
            e || vg(n, i, s)));
        return f
    }
    function wy(n, t, r) {
        var u = kt(n, t, "div", null, null, !n.options.singleCursorHeightPerLine), e = r.appendChild(i("div", " ", "CodeMirror-cursor")), f;
        e.style.left = u.left + "px",
        e.style.top = u.top + "px",
        e.style.height = Math.max(0, u.bottom - u.top) * n.options.cursorHeight + "px",
        u.other && (f = r.appendChild(i("div", " ", "CodeMirror-cursor CodeMirror-secondarycursor")),
        f.style.display = "",
        f.style.left = u.other.left + "px",
        f.style.top = u.other.top + "px",
        f.style.height = (u.other.bottom - u.other.top) * .85 + "px")
    }
    function bo(n, t) {
        return n.top - t.top || n.left - t.left
    }
    function vg(r, u, f) {
        function h(n, t, r, u) {
            t < 0 && (t = 0),
            t = Math.round(t),
            u = Math.round(u),
            k.appendChild(i("div", null, "CodeMirror-selected", "position: absolute; left: " + n + "px;\n                             top: " + t + "px; width: " + (r == null ? l - n : r) + "px;\n                             height: " + (u - t) + "px"))
        }
        function p(i, u, f) {
            function p(t, u) {
                return hc(r, n(i, t), "div", a, u)
            }
            function y(n, t, i) {
                var u = vy(r, a, null, n)
                  , f = t == "ltr" == (i == "after") ? "left" : "right"
                  , e = i == "after" ? u.begin : u.end - (/\s/.test(a.text.charAt(u.end - 1)) ? 2 : 1);
                return p(e, f)[f]
            }
            var a = t(v, i), b = a.text.length, o, c, w = si(a, v.direction);
            return gk(w, u || 0, f == null ? b : f, function(n, t, i, r) {
                var k = i == "ltr", a = p(n, k ? "left" : "right"), v = p(t - 1, k ? "right" : "left"), d = u == null && n == 0, g = f == null && t == b, it = r == 0, rt = !w || r == w.length - 1, nt, ut, tt, ft;
                if (v.top - a.top <= 3) {
                    var ot = (e ? d : g) && it
                      , st = (e ? g : d) && rt
                      , et = ot ? s : (k ? a : v).left
                      , ht = st ? l : (k ? v : a).right;
                    h(et, a.top, ht - et, a.bottom)
                } else
                    k ? (nt = e && d && it ? s : a.left,
                    ut = e ? l : y(n, i, "before"),
                    tt = e ? s : y(t, i, "after"),
                    ft = e && g && rt ? l : v.right) : (nt = e ? y(n, i, "before") : s,
                    ut = !e && d && it ? l : a.right,
                    tt = !e && g && rt ? s : v.left,
                    ft = e ? y(t, i, "after") : l),
                    h(nt, a.top, ut - nt, a.bottom),
                    a.bottom < v.top && h(s, a.bottom, null, v.top),
                    h(tt, v.top, ft - tt, v.bottom);
                (!o || bo(a, o) < 0) && (o = a),
                bo(v, o) < 0 && (o = v),
                (!c || bo(a, c) < 0) && (c = a),
                bo(v, c) < 0 && (c = v)
            }),
            {
                start: o,
                end: c
            }
        }
        var b = r.display
          , v = r.doc
          , k = document.createDocumentFragment()
          , d = iy(r.display)
          , s = d.left
          , l = Math.max(b.sizerWidth, vr(r) - b.sizer.offsetLeft) - d.right
          , e = v.direction == "ltr"
          , a = u.from()
          , y = u.to();
        if (a.line == y.line)
            p(a.line, a.ch, y.ch);
        else {
            var g = t(v, a.line)
              , nt = t(v, y.line)
              , w = ii(g) == ii(nt)
              , o = p(a.line, a.ch, w ? g.text.length + 1 : null).end
              , c = p(y.line, w ? 0 : null, y.ch).start;
            w && (o.top < c.top - 2 ? (h(o.right, o.top, null, o.bottom),
            h(s, c.top, c.left, c.bottom)) : h(o.right, o.top, c.left - o.right, o.bottom)),
            o.bottom < c.top && h(s, o.bottom, null, c.top)
        }
        f.appendChild(k)
    }
    function wc(n) {
        var t, i;
        n.state.focused && (t = n.display,
        clearInterval(t.blinker),
        i = !0,
        t.cursorDiv.style.visibility = "",
        n.options.cursorBlinkRate > 0 ? t.blinker = setInterval(function() {
            return t.cursorDiv.style.visibility = (i = !i) ? "" : "hidden"
        }, n.options.cursorBlinkRate) : n.options.cursorBlinkRate < 0 && (t.cursorDiv.style.visibility = "hidden"))
    }
    function by(n) {
        n.state.focused || (n.display.input.focus(),
        bc(n))
    }
    function ky(n) {
        n.state.delayingBlurEvent = !0,
        setTimeout(function() {
            n.state.delayingBlurEvent && (n.state.delayingBlurEvent = !1,
            te(n))
        }, 100)
    }
    function bc(n, t) {
        (n.state.delayingBlurEvent && (n.state.delayingBlurEvent = !1),
        n.options.readOnly != "nocursor") && (n.state.focused || (p(n, "focus", n, t),
        n.state.focused = !0,
        rr(n.display.wrapper, "CodeMirror-focused"),
        n.curOp || n.display.selForContextMenu == n.doc.sel || (n.display.input.reset(),
        nt && setTimeout(function() {
            return n.display.input.reset(!0)
        }, 20)),
        n.display.input.receivedFocus()),
        wc(n))
    }
    function te(n, t) {
        n.state.delayingBlurEvent || (n.state.focused && (p(n, "blur", n, t),
        n.state.focused = !1,
        vi(n.display.wrapper, "CodeMirror-focused")),
        clearInterval(n.display.blinker),
        setTimeout(function() {
            n.state.focused || (n.display.shift = !1)
        }, 150))
    }
    function ko(n) {
        for (var r = n.display, c = r.lineDiv.offsetTop, t, i, o, s, h, f, u = 0; u < r.view.length; u++)
            if ((t = r.view[u],
            i = void 0,
            !t.hidden) && (e && l < 8 ? (o = t.node.offsetTop + t.node.offsetHeight,
            i = o - c,
            c = o) : (s = t.node.getBoundingClientRect(),
            i = s.bottom - s.top),
            h = t.line.height - i,
            i < 2 && (i = pr(r)),
            (h > .005 || h < -.005) && (ni(t.line, i),
            dy(t.line),
            t.rest)))
                for (f = 0; f < t.rest.length; f++)
                    dy(t.rest[f])
    }
    function dy(n) {
        var t, i, r;
        if (n.widgets)
            for (t = 0; t < n.widgets.length; ++t)
                i = n.widgets[t],
                r = i.node.parentNode,
                r && (i.height = r.offsetHeight)
    }
    function kc(n, i, r) {
        var f = r && r.top != null ? Math.max(0, r.top) : n.scroller.scrollTop, o, s;
        f = Math.floor(f - po(n));
        var h = r && r.bottom != null ? r.bottom : f + n.wrapper.clientHeight
          , u = er(i, f)
          , e = er(i, h);
        return r && r.ensure && (o = r.ensure.from.line,
        s = r.ensure.to.line,
        o < u ? (u = o,
        e = er(i, oi(t(i, o)) + n.wrapper.clientHeight)) : Math.min(s, i.lastLine()) >= e && (u = er(i, oi(t(i, s)) - n.wrapper.clientHeight),
        e = s)),
        {
            from: u,
            to: Math.max(e, u + 1)
        }
    }
    function gy(n) {
        var i = n.display, r = i.view, t, u, f;
        if (i.alignWidgets || i.gutters.firstChild && n.options.fixedGutter) {
            var o = yc(i) - i.scroller.scrollLeft + n.doc.scrollLeft
              , s = i.gutters.offsetWidth
              , e = o + "px";
            for (t = 0; t < r.length; t++)
                if (!r[t].hidden && (n.options.fixedGutter && (r[t].gutter && (r[t].gutter.style.left = e),
                r[t].gutterBackground && (r[t].gutterBackground.style.left = e)),
                u = r[t].alignable,
                u))
                    for (f = 0; f < u.length; f++)
                        u[f].style.left = e;
            n.options.fixedGutter && (i.gutters.style.left = o + s + "px")
        }
    }
    function np(n) {
        if (!n.options.lineNumbers)
            return !1;
        var u = n.doc
          , r = ih(n.options, u.first + u.size - 1)
          , t = n.display;
        if (r.length != t.lineNumChars) {
            var f = t.measure.appendChild(i("div", [i("div", r)], "CodeMirror-linenumber CodeMirror-gutter-elt"))
              , e = f.firstChild.offsetWidth
              , o = f.offsetWidth - e;
            return t.lineGutter.style.width = "",
            t.lineNumInnerWidth = Math.max(e, t.lineGutter.offsetWidth - o) + 1,
            t.lineNumWidth = t.lineNumInnerWidth + o,
            t.lineNumChars = t.lineNumInnerWidth ? r.length : -1,
            t.lineGutter.style.width = t.lineNumWidth + "px",
            rl(n),
            !0
        }
        return !1
    }
    function yg(n, t) {
        var u;
        if (!w(n, "scrollCursorIntoView")) {
            var f = n.display
              , e = f.sizer.getBoundingClientRect()
              , r = null;
            t.top + e.top < 0 ? r = !0 : t.bottom + e.top > (window.innerHeight || document.documentElement.clientHeight) && (r = !1),
            r == null || uk || (u = i("div", "​", null, "position: absolute;\n                         top: " + (t.top - f.viewOffset - po(n.display)) + "px;\n                         height: " + (t.bottom - t.top + ri(n) + f.barHeight) + "px;\n                         left: " + t.left + "px; width: " + Math.max(2, t.right - t.left) + "px;"),
            n.display.lineSpace.appendChild(u),
            u.scrollIntoView(r),
            n.display.lineSpace.removeChild(u))
        }
    }
    function pg(t, i, r, u) {
        var s, h;
        for (u == null && (u = 0),
        t.options.lineWrapping || i != r || (i = i.ch ? n(i.line, i.sticky == "before" ? i.ch - 1 : i.ch, "after") : i,
        r = i.sticky == "before" ? n(i.line, i.ch + 1, "before") : i),
        h = 0; h < 5; h++) {
            var c = !1
              , f = kt(t, i)
              , e = !r || r == i ? f : kt(t, r);
            s = {
                left: Math.min(f.left, e.left),
                top: Math.min(f.top, e.top) - u,
                right: Math.max(f.left, e.left),
                bottom: Math.max(f.bottom, e.bottom) + u
            };
            var o = dc(t, s)
              , l = t.doc.scrollTop
              , a = t.doc.scrollLeft;
            if (o.scrollTop != null && (re(t, o.scrollTop),
            Math.abs(t.doc.scrollTop - l) > 1 && (c = !0)),
            o.scrollLeft != null && (kr(t, o.scrollLeft),
            Math.abs(t.doc.scrollLeft - a) > 1 && (c = !0)),
            !c)
                break
        }
        return s
    }
    function wg(n, t) {
        var i = dc(n, t);
        i.scrollTop != null && re(n, i.scrollTop),
        i.scrollLeft != null && kr(n, i.scrollLeft)
    }
    function dc(n, t) {
        var r = n.display, h = pr(n.display), o;
        t.top < 0 && (t.top = 0);
        var e = n.curOp && n.curOp.scrollTop != null ? n.curOp.scrollTop : r.scroller.scrollTop
          , u = fc(n)
          , i = {};
        t.bottom - t.top > u && (t.bottom = t.top + u);
        var c = n.doc.height + uc(r)
          , a = t.top < h
          , v = t.bottom > c - h;
        t.top < e ? i.scrollTop = a ? 0 : t.top : t.bottom > e + u && (o = Math.min(t.top, (v ? c : t.bottom) - u),
        o != e && (i.scrollTop = o));
        var l = n.curOp && n.curOp.scrollLeft != null ? n.curOp.scrollLeft : r.scroller.scrollLeft
          , f = vr(n) - (n.options.fixedGutter ? r.gutters.offsetWidth : 0)
          , s = t.right - t.left > f;
        return s && (t.right = t.left + f),
        t.left < 10 ? i.scrollLeft = 0 : t.left < l ? i.scrollLeft = Math.max(0, t.left - (s ? 0 : 10)) : t.right > f + l - 3 && (i.scrollLeft = t.right + (s ? 0 : 10) - f),
        i
    }
    function gc(n, t) {
        t != null && (go(n),
        n.curOp.scrollTop = (n.curOp.scrollTop == null ? n.doc.scrollTop : n.curOp.scrollTop) + t)
    }
    function ou(n) {
        go(n);
        var t = n.getCursor();
        n.curOp.scrollToPos = {
            from: t,
            to: t,
            margin: n.options.cursorScrollMargin
        }
    }
    function ie(n, t, i) {
        (t != null || i != null) && go(n),
        t != null && (n.curOp.scrollLeft = t),
        i != null && (n.curOp.scrollTop = i)
    }
    function bg(n, t) {
        go(n),
        n.curOp.scrollToPos = t
    }
    function go(n) {
        var t = n.curOp.scrollToPos, i, r;
        t && (n.curOp.scrollToPos = null,
        i = ly(n, t.from),
        r = ly(n, t.to),
        tp(n, i, r, t.margin))
    }
    function tp(n, t, i, r) {
        var u = dc(n, {
            left: Math.min(t.left, i.left),
            top: Math.min(t.top, i.top) - r,
            right: Math.max(t.right, i.right),
            bottom: Math.max(t.bottom, i.bottom) + r
        });
        ie(n, u.scrollLeft, u.scrollTop)
    }
    function re(n, t) {
        Math.abs(n.doc.scrollTop - t) < 2 || (ai || il(n, {
            top: t
        }),
        ip(n, t, !0),
        ai && il(n),
        fe(n, 100))
    }
    function ip(n, t, i) {
        (t = Math.min(n.display.scroller.scrollHeight - n.display.scroller.clientHeight, t),
        n.display.scroller.scrollTop != t || i) && (n.doc.scrollTop = t,
        n.display.scrollbars.setScrollTop(t),
        n.display.scroller.scrollTop != t && (n.display.scroller.scrollTop = t))
    }
    function kr(n, t, i, r) {
        (t = Math.min(t, n.display.scroller.scrollWidth - n.display.scroller.clientWidth),
        (i ? t == n.doc.scrollLeft : Math.abs(n.doc.scrollLeft - t) < 2) && !r) || (n.doc.scrollLeft = t,
        gy(n),
        n.display.scroller.scrollLeft != t && (n.display.scroller.scrollLeft = t),
        n.display.scrollbars.setScrollLeft(t))
    }
    function ue(n) {
        var t = n.display
          , i = t.gutters.offsetWidth
          , r = Math.round(n.doc.height + uc(n.display));
        return {
            clientHeight: t.scroller.clientHeight,
            viewHeight: t.wrapper.clientHeight,
            scrollWidth: t.scroller.scrollWidth,
            clientWidth: t.scroller.clientWidth,
            viewWidth: t.wrapper.clientWidth,
            barLeft: n.options.fixedGutter ? i : 0,
            docHeight: r,
            scrollHeight: r + ri(n) + t.barHeight,
            nativeBarWidth: t.nativeBarWidth,
            gutterWidth: i
        }
    }
    function hu(n, t) {
        var i, r, u;
        for (t || (t = ue(n)),
        i = n.display.barWidth,
        r = n.display.barHeight,
        rp(n, t),
        u = 0; u < 4 && i != n.display.barWidth || r != n.display.barHeight; u++)
            i != n.display.barWidth && n.options.lineWrapping && ko(n),
            rp(n, ue(n)),
            i = n.display.barWidth,
            r = n.display.barHeight
    }
    function rp(n, t) {
        var i = n.display
          , r = i.scrollbars.update(t);
        i.sizer.style.paddingRight = (i.barWidth = r.right) + "px",
        i.sizer.style.paddingBottom = (i.barHeight = r.bottom) + "px",
        i.heightForcer.style.borderBottom = r.bottom + "px solid transparent",
        r.right && r.bottom ? (i.scrollbarFiller.style.display = "block",
        i.scrollbarFiller.style.height = r.bottom + "px",
        i.scrollbarFiller.style.width = r.right + "px") : i.scrollbarFiller.style.display = "",
        r.bottom && n.options.coverGutterNextToScrollbar && n.options.fixedGutter ? (i.gutterFiller.style.display = "block",
        i.gutterFiller.style.height = r.bottom + "px",
        i.gutterFiller.style.width = t.gutterWidth + "px") : i.gutterFiller.style.display = ""
    }
    function up(n) {
        n.display.scrollbars && (n.display.scrollbars.clear(),
        n.display.scrollbars.addClass && vi(n.display.wrapper, n.display.scrollbars.addClass)),
        n.display.scrollbars = new nl[n.options.scrollbarStyle](function(t) {
            n.display.wrapper.insertBefore(t, n.display.scrollbarFiller),
            r(t, "mousedown", function() {
                n.state.focused && setTimeout(function() {
                    return n.display.input.focus()
                }, 0)
            }),
            t.setAttribute("cm-not-content", "true")
        }
        ,function(t, i) {
            i == "horizontal" ? kr(n, t) : re(n, t)
        }
        ,n),
        n.display.scrollbars.addClass && rr(n.display.wrapper, n.display.scrollbars.addClass)
    }
    function dr(n) {
        n.curOp = {
            cm: n,
            viewChanged: !1,
            startHeight: n.doc.height,
            forceUpdate: !1,
            updateInput: null,
            typing: !1,
            changeObjs: null,
            cursorActivityHandlers: null,
            cursorActivityCalled: 0,
            selectionChanged: !1,
            updateMaxLine: !1,
            scrollLeft: null,
            scrollTop: null,
            scrollToPos: null,
            focus: !1,
            id: ++fp
        },
        bd(n.curOp)
    }
    function gr(n) {
        var t = n.curOp;
        dd(t, function(n) {
            for (var t = 0; t < n.ops.length; t++)
                n.ops[t].cm.curOp = null;
            kg(n)
        })
    }
    function kg(n) {
        for (var t = n.ops, r, u, f, e, i = 0; i < t.length; i++)
            dg(t[i]);
        for (r = 0; r < t.length; r++)
            gg(t[r]);
        for (u = 0; u < t.length; u++)
            nn(t[u]);
        for (f = 0; f < t.length; f++)
            tn(t[f]);
        for (e = 0; e < t.length; e++)
            rn(t[e])
    }
    function dg(n) {
        var t = n.cm
          , i = t.display;
        en(t),
        n.updateMaxLine && ch(t),
        n.mustUpdate = n.viewChanged || n.forceUpdate || n.scrollTop != null || n.scrollToPos && (n.scrollToPos.from.line < i.viewFrom || n.scrollToPos.to.line >= i.viewTo) || i.maxLineChanged && t.options.lineWrapping,
        n.update = n.mustUpdate && new ee(t,n.mustUpdate && {
            top: n.scrollTop,
            ensure: n.scrollToPos
        },n.forceUpdate)
    }
    function gg(n) {
        n.updatedDisplay = n.mustUpdate && tl(n.cm, n.update)
    }
    function nn(n) {
        var t = n.cm
          , i = t.display;
        n.updatedDisplay && ko(t),
        n.barMeasure = ue(t),
        i.maxLineChanged && !t.options.lineWrapping && (n.adjustWidthTo = uy(t, i.maxLine, i.maxLine.text.length).left + 3,
        t.display.sizerWidth = n.adjustWidthTo,
        n.barMeasure.scrollWidth = Math.max(i.scroller.clientWidth, i.sizer.offsetLeft + n.adjustWidthTo + ri(t) + t.display.barWidth),
        n.maxScrollLeft = Math.max(0, i.sizer.offsetLeft + n.adjustWidthTo - vr(t))),
        (n.updatedDisplay || n.selectionChanged) && (n.preparedSelection = i.input.prepareSelection())
    }
    function tn(n) {
        var t = n.cm, i;
        n.adjustWidthTo != null && (t.display.sizer.style.minWidth = n.adjustWidthTo + "px",
        n.maxScrollLeft < t.doc.scrollLeft && kr(t, Math.min(t.display.scroller.scrollLeft, n.maxScrollLeft), !0),
        t.display.maxLineChanged = !1),
        i = n.focus && n.focus == ei(),
        n.preparedSelection && t.display.input.showSelection(n.preparedSelection, i),
        (n.updatedDisplay || n.startHeight != t.doc.height) && hu(t, n.barMeasure),
        n.updatedDisplay && ul(t, n.barMeasure),
        n.selectionChanged && wc(t),
        t.state.focused && n.updateInput && t.display.input.reset(n.typing),
        i && by(n.cm)
    }
    function rn(n) {
        var t = n.cm, o = t.display, s = t.doc, h, i, r, u, e;
        if (n.updatedDisplay && op(t, n.update),
        o.wheelStartX != null && (n.scrollTop != null || n.scrollLeft != null || n.scrollToPos) && (o.wheelStartX = o.wheelStartY = null),
        n.scrollTop != null && ip(t, n.scrollTop, n.forceScroll),
        n.scrollLeft != null && kr(t, n.scrollLeft, !0, !0),
        n.scrollToPos && (h = pg(t, f(s, n.scrollToPos.from), f(s, n.scrollToPos.to), n.scrollToPos.margin),
        yg(t, h)),
        i = n.maybeHiddenMarkers,
        r = n.maybeUnhiddenMarkers,
        i)
            for (u = 0; u < i.length; ++u)
                i[u].lines.length || p(i[u], "hide");
        if (r)
            for (e = 0; e < r.length; ++e)
                r[e].lines.length && p(r[e], "unhide");
        o.wrapper.offsetHeight && (s.scrollTop = t.display.scroller.scrollTop),
        n.changeObjs && p(t, "changes", t, n.changeObjs),
        n.update && n.update.finish()
    }
    function ot(n, t) {
        if (n.curOp)
            return t();
        dr(n);
        try {
            return t()
        } finally {
            gr(n)
        }
    }
    function b(n, t) {
        return function() {
            if (n.curOp)
                return t.apply(n, arguments);
            dr(n);
            try {
                return t.apply(n, arguments)
            } finally {
                gr(n)
            }
        }
    }
    function rt(n) {
        return function() {
            if (this.curOp)
                return n.apply(this, arguments);
            dr(this);
            try {
                return n.apply(this, arguments)
            } finally {
                gr(this)
            }
        }
    }
    function k(n) {
        return function() {
            var t = this.cm;
            if (!t || t.curOp)
                return n.apply(this, arguments);
            dr(t);
            try {
                return n.apply(this, arguments)
            } finally {
                gr(t)
            }
        }
    }
    function et(n, t, i, r) {
        var u, e, o, s, h, f;
        t == null && (t = n.doc.first),
        i == null && (i = n.doc.first + n.doc.size),
        r || (r = 0),
        u = n.display,
        r && i < u.viewTo && (u.updateLineNumbers == null || u.updateLineNumbers > t) && (u.updateLineNumbers = t),
        n.curOp.viewChanged = !0,
        t >= u.viewTo ? ti && sh(n.doc, t) < u.viewTo && di(n) : i <= u.viewFrom ? ti && ga(n.doc, i + r) > u.viewFrom ? di(n) : (u.viewFrom += r,
        u.viewTo += r) : t <= u.viewFrom && i >= u.viewTo ? di(n) : t <= u.viewFrom ? (e = ns(n, i, i + r, 1),
        e ? (u.view = u.view.slice(e.index),
        u.viewFrom = e.lineN,
        u.viewTo += r) : di(n)) : i >= u.viewTo ? (o = ns(n, t, t, -1),
        o ? (u.view = u.view.slice(0, o.index),
        u.viewTo = o.lineN) : di(n)) : (s = ns(n, t, t, -1),
        h = ns(n, i, i + r, 1),
        s && h ? (u.view = u.view.slice(0, s.index).concat(yo(n, s.lineN, h.lineN)).concat(u.view.slice(h.index)),
        u.viewTo += r) : di(n)),
        f = u.externalMeasured,
        f && (i < f.lineN ? f.lineN += r : t < f.lineN + f.size && (u.externalMeasured = null))
    }
    function ki(n, t, i) {
        var r, u, f, e;
        (n.curOp.viewChanged = !0,
        r = n.display,
        u = n.display.externalMeasured,
        u && t >= u.lineN && t < u.lineN + u.size && (r.externalMeasured = null),
        t < r.viewFrom || t >= r.viewTo) || (f = r.view[br(n, t)],
        f.node != null) && (e = f.changes || (f.changes = []),
        d(e, i) == -1 && e.push(i))
    }
    function di(n) {
        n.display.viewFrom = n.display.viewTo = n.doc.first,
        n.display.view = [],
        n.display.viewOffset = 0
    }
    function ns(n, t, i, r) {
        var u = br(n, t), o, f = n.display.view, e, s;
        if (!ti || i == n.doc.first + n.doc.size)
            return {
                index: u,
                lineN: i
            };
        for (e = n.display.viewFrom,
        s = 0; s < u; s++)
            e += f[s].size;
        if (e != t) {
            if (r > 0) {
                if (u == f.length - 1)
                    return null;
                o = e + f[u].size - t,
                u++
            } else
                o = e - t;
            t += o,
            i += o
        }
        while (sh(n.doc, i) != i) {
            if (u == (r < 0 ? 0 : f.length - 1))
                return null;
            i += r * f[u - (r < 0 ? 1 : 0)].size,
            u += r
        }
        return {
            index: u,
            lineN: i
        }
    }
    function un(n, t, i) {
        var r = n.display
          , u = r.view;
        u.length == 0 || t >= r.viewTo || i <= r.viewFrom ? (r.view = yo(n, t, i),
        r.viewFrom = t) : (r.viewFrom > t ? r.view = yo(n, t, r.viewFrom).concat(r.view) : r.viewFrom < t && (r.view = r.view.slice(br(n, t))),
        r.viewFrom = t,
        r.viewTo < i ? r.view = r.view.concat(yo(n, r.viewTo, i)) : r.viewTo > i && (r.view = r.view.slice(0, br(n, i)))),
        r.viewTo = i
    }
    function ep(n) {
        for (var r = n.display.view, u = 0, i, t = 0; t < r.length; t++)
            i = r[t],
            i.hidden || i.node && !i.changes || ++u;
        return u
    }
    function fe(n, t) {
        n.doc.highlightFrontier < n.display.viewTo && n.state.highlight.set(t, ws(fn, n))
    }
    function fn(n) {
        var i = n.doc;
        if (!(i.highlightFrontier >= n.display.viewTo)) {
            var u = +new Date + n.options.workTime
              , t = wf(n, i.highlightFrontier)
              , r = [];
            i.iter(t.line, Math.min(i.first + i.size, n.display.viewTo + 500), function(f) {
                var o, e, c, s;
                if (t.line >= n.display.viewFrom) {
                    var h = f.styles
                      , l = f.text.length > n.options.maxHighlightLength ? cr(i.mode, t.state) : null
                      , a = ev(n, f, t, !0);
                    for (l && (t.state = l),
                    f.styles = a.styles,
                    o = f.styleClasses,
                    e = a.classes,
                    e ? f.styleClasses = e : o && (f.styleClasses = null),
                    c = !h || h.length != f.styles.length || o != e && (!o || !e || o.bgClass != e.bgClass || o.textClass != e.textClass),
                    s = 0; !c && s < h.length; ++s)
                        c = h[s] != f.styles[s];
                    c && r.push(t.line),
                    f.stateAfter = t.save(),
                    t.nextLine()
                } else
                    f.text.length <= n.options.maxHighlightLength && nc(n, f.text, t),
                    f.stateAfter = t.line % 5 == 0 ? t.save() : null,
                    t.nextLine();
                if (+new Date > u)
                    return fe(n, n.options.workDelay),
                    !0
            }),
            i.highlightFrontier = t.line,
            i.modeFrontier = Math.max(i.modeFrontier, t.line),
            r.length && ot(n, function() {
                for (var t = 0; t < r.length; t++)
                    ki(n, r[t], "text")
            })
        }
    }
    function en(n) {
        var t = n.display;
        !t.scrollbarsClipped && t.scroller.offsetWidth && (t.nativeBarWidth = t.scroller.offsetWidth - t.scroller.clientWidth,
        t.heightForcer.style.height = ri(n) + "px",
        t.sizer.style.marginBottom = -t.nativeBarWidth + "px",
        t.sizer.style.borderRightWidth = ri(n) + "px",
        t.scrollbarsClipped = !0)
    }
    function on(n) {
        var r, i, t;
        return n.hasFocus() ? null : (r = ei(),
        !r || !pi(n.display.lineDiv, r)) ? null : (i = {
            activeElt: r
        },
        window.getSelection && (t = window.getSelection(),
        t.anchorNode && t.extend && pi(n.display.lineDiv, t.anchorNode) && (i.anchorNode = t.anchorNode,
        i.anchorOffset = t.anchorOffset,
        i.focusNode = t.focusNode,
        i.focusOffset = t.focusOffset)),
        i)
    }
    function sn(n) {
        if (n && n.activeElt && n.activeElt != ei() && (n.activeElt.focus(),
        n.anchorNode && pi(document.body, n.anchorNode) && pi(document.body, n.focusNode))) {
            var t = window.getSelection()
              , i = document.createRange();
            i.setEnd(n.anchorNode, n.anchorOffset),
            i.collapse(!1),
            t.removeAllRanges(),
            t.addRange(i),
            t.extend(n.focusNode, n.focusOffset)
        }
    }
    function tl(n, i) {
        var r = n.display, e = n.doc, s, o, c;
        if (i.editorIsHidden)
            return di(n),
            !1;
        if (!i.force && i.visible.from >= r.viewFrom && i.visible.to <= r.viewTo && (r.updateLineNumbers == null || r.updateLineNumbers >= r.viewTo) && r.renderedView == r.view && ep(n) == 0)
            return !1;
        np(n) && (di(n),
        i.dims = vc(n));
        var h = e.first + e.size
          , u = Math.max(i.visible.from - n.options.viewportMargin, e.first)
          , f = Math.min(h, i.visible.to + n.options.viewportMargin);
        return (r.viewFrom < u && u - r.viewFrom < 20 && (u = Math.max(e.first, r.viewFrom)),
        r.viewTo > f && r.viewTo - f < 20 && (f = Math.min(h, r.viewTo)),
        ti && (u = sh(n.doc, u),
        f = ga(n.doc, f)),
        s = u != r.viewFrom || f != r.viewTo || r.lastWrapHeight != i.wrapperHeight || r.lastWrapWidth != i.wrapperWidth,
        un(n, u, f),
        r.viewOffset = oi(t(n.doc, r.viewFrom)),
        n.display.mover.style.top = r.viewOffset + "px",
        o = ep(n),
        !s && o == 0 && !i.force && r.renderedView == r.view && (r.updateLineNumbers == null || r.updateLineNumbers >= r.viewTo)) ? !1 : (c = on(n),
        o > 4 && (r.lineDiv.style.display = "none"),
        hn(n, r.updateLineNumbers, i.dims),
        o > 4 && (r.lineDiv.style.display = ""),
        r.renderedView = r.view,
        sn(c),
        yi(r.cursorDiv),
        yi(r.selectionDiv),
        r.gutters.style.height = r.sizer.style.minHeight = 0,
        s && (r.lastWrapHeight = i.wrapperHeight,
        r.lastWrapWidth = i.wrapperWidth,
        fe(n, 400)),
        r.updateLineNumbers = null,
        !0)
    }
    function op(n, t) {
        for (var i = t.viewport, u, r = !0; ; r = !1) {
            if ((!r || !n.options.lineWrapping || t.oldDisplayWidth == vr(n)) && (i && i.top != null && (i = {
                top: Math.min(n.doc.height + uc(n.display) - fc(n), i.top)
            }),
            t.visible = kc(n.display, n.doc, i),
            t.visible.from >= n.display.viewFrom && t.visible.to <= n.display.viewTo))
                break;
            if (!tl(n, t))
                break;
            ko(n),
            u = ue(n),
            ne(n),
            hu(n, u),
            ul(n, u),
            t.force = !1
        }
        t.signal(n, "update", n),
        (n.display.viewFrom != n.display.reportedViewFrom || n.display.viewTo != n.display.reportedViewTo) && (t.signal(n, "viewportChange", n, n.display.viewFrom, n.display.viewTo),
        n.display.reportedViewFrom = n.display.viewFrom,
        n.display.reportedViewTo = n.display.viewTo)
    }
    function il(n, t) {
        var i = new ee(n,t), r;
        tl(n, i) && (ko(n),
        op(n, i),
        r = ue(n),
        ne(n),
        hu(n, r),
        ul(n, r),
        i.finish())
    }
    function hn(n, t, i) {
        function c(t) {
            var i = t.nextSibling;
            return nt && wt && n.display.currentWheelTarget == t ? t.style.display = "none" : t.parentNode.removeChild(t),
            i
        }
        for (var o = n.display, v = n.options.lineNumbers, s = o.lineDiv, u = s.firstChild, l = o.view, f = o.viewFrom, r, a, h, e = 0; e < l.length; e++) {
            if (r = l[e],
            !r.hidden)
                if (r.node && r.node.parentNode == s) {
                    while (u != r.node)
                        u = c(u);
                    h = v && t != null && t <= f && r.lineNumber,
                    r.changes && (d(r.changes, "gutter") > -1 && (h = !1),
                    kv(n, r, f, i)),
                    h && (yi(r.lineNumber),
                    r.lineNumber.appendChild(document.createTextNode(ih(n.options, f)))),
                    u = r.node.nextSibling
                } else
                    a = rg(n, r, f, i),
                    s.insertBefore(a, u);
            f += r.size
        }
        while (u)
            u = c(u)
    }
    function rl(n) {
        var t = n.display.gutters.offsetWidth;
        n.display.sizer.style.marginLeft = t + "px"
    }
    function ul(n, t) {
        n.display.sizer.style.minHeight = t.docHeight + "px",
        n.display.heightForcer.style.top = t.docHeight + "px",
        n.display.gutters.style.height = t.docHeight + n.display.barHeight + ri(n) + "px"
    }
    function sp(n) {
        var r = n.display.gutters, e = n.options.gutters, t, u, f;
        for (yi(r),
        t = 0; t < e.length; ++t)
            u = e[t],
            f = r.appendChild(i("div", null, "CodeMirror-gutter " + u)),
            u == "CodeMirror-linenumbers" && (n.display.lineGutter = f,
            f.style.width = (n.display.lineNumWidth || 1) + "px");
        r.style.display = t ? "" : "none",
        rl(n)
    }
    function fl(n) {
        var t = d(n.gutters, "CodeMirror-linenumbers");
        t == -1 && n.lineNumbers ? n.gutters = n.gutters.concat(["CodeMirror-linenumbers"]) : t > -1 && !n.lineNumbers && (n.gutters = n.gutters.slice(0),
        n.gutters.splice(t, 1))
    }
    function hp(n) {
        var i = n.wheelDeltaX
          , t = n.wheelDeltaY;
        return i == null && n.detail && n.axis == n.HORIZONTAL_AXIS && (i = n.detail),
        t == null && n.detail && n.axis == n.VERTICAL_AXIS ? t = n.detail : t == null && (t = n.wheelDelta),
        {
            x: i,
            y: t
        }
    }
    function cn(n) {
        var t = hp(n);
        return t.x *= st,
        t.y *= st,
        t
    }
    function cp(n, t) {
        var v = hp(t), e = v.x, u = v.y, i = n.display, r = i.scroller, y = r.scrollWidth > r.clientWidth, h = r.scrollHeight > r.clientHeight, f, c, o;
        if (e && y || u && h) {
            if (u && wt && nt)
                n: for (f = t.target,
                c = i.view; f != r; f = f.parentNode)
                    for (o = 0; o < c.length; o++)
                        if (c[o].node == f) {
                            n.display.currentWheelTarget = f;
                            break n
                        }
            if (e && !ai && !pt && st != null) {
                u && h && re(n, Math.max(0, r.scrollTop + u * st)),
                kr(n, Math.max(0, r.scrollLeft + e * st)),
                (!u || u && h) && ft(t),
                i.wheelStartX = null;
                return
            }
            if (u && st != null) {
                var l = u * st
                  , s = n.doc.scrollTop
                  , a = s + i.wrapper.clientHeight;
                l < 0 ? s = Math.max(0, s + l - 50) : a = Math.min(n.doc.height, a + l + 50),
                il(n, {
                    top: s,
                    bottom: a
                })
            }
            oe < 20 && (i.wheelStartX == null ? (i.wheelStartX = r.scrollLeft,
            i.wheelStartY = r.scrollTop,
            i.wheelDX = e,
            i.wheelDY = u,
            setTimeout(function() {
                if (i.wheelStartX != null) {
                    var n = r.scrollLeft - i.wheelStartX
                      , t = r.scrollTop - i.wheelStartY
                      , u = t && i.wheelDY && t / i.wheelDY || n && i.wheelDX && n / i.wheelDX;
                    (i.wheelStartX = i.wheelStartY = null,
                    u) && (st = (st * oe + u) / (oe + 1),
                    ++oe)
                }
            }, 200)) : (i.wheelDX += e,
            i.wheelDY += u))
        }
    }
    function dt(n, t) {
        var c = n[t], i, f, r;
        for (n.sort(function(n, t) {
            return u(n.from(), t.from())
        }),
        t = d(n, c),
        i = 1; i < n.length; i++)
            if (f = n[i],
            r = n[i - 1],
            u(r.to(), f.from()) >= 0) {
                var e = eo(r.from(), f.from())
                  , s = fo(r.to(), f.to())
                  , h = r.empty() ? f.from() == f.head : r.from() == r.head;
                i <= t && --t,
                n.splice(--i, 2, new o(h ? s : e,h ? e : s))
            }
        return new ht(n,t)
    }
    function gi(n, t) {
        return new ht([new o(n,t || n)],0)
    }
    function nr(t) {
        return t.text ? n(t.from.line + t.text.length - 1, s(t.text).length + (t.text.length == 1 ? t.from.ch : 0)) : t.to
    }
    function lp(t, i) {
        if (u(t, i.from) < 0)
            return t;
        if (u(t, i.to) <= 0)
            return nr(i);
        var f = t.line + i.text.length - (i.to.line - i.from.line) - 1
          , r = t.ch;
        return t.line == i.to.line && (r += nr(i).ch - i.to.ch),
        n(f, r)
    }
    function el(n, t) {
        for (var u = [], r, i = 0; i < n.sel.ranges.length; i++)
            r = n.sel.ranges[i],
            u.push(new o(lp(r.anchor, t),lp(r.head, t)));
        return dt(u, n.sel.primIndex)
    }
    function ap(t, i, r) {
        return t.line == i.line ? n(r.line, t.ch - i.ch + r.ch) : n(r.line + (t.line - i.line), t.ch)
    }
    function ln(t, i, r) {
        for (var h = [], e = n(t.first, 0), c = e, v, y, f = 0; f < i.length; f++) {
            var l = i[f]
              , s = ap(l.from, e, c)
              , a = ap(nr(l), e, c);
            e = l.to,
            c = a,
            r == "around" ? (v = t.sel.ranges[f],
            y = u(v.head, v.anchor) < 0,
            h[f] = new o(y ? a : s,y ? s : a)) : h[f] = new o(s,s)
        }
        return new ht(h,t.sel.primIndex)
    }
    function ol(n) {
        n.doc.mode = dh(n.options, n.doc.modeOption),
        se(n)
    }
    function se(n) {
        n.doc.iter(function(n) {
            n.stateAfter && (n.stateAfter = null),
            n.styles && (n.styles = null)
        }),
        n.doc.modeFrontier = n.doc.highlightFrontier = n.doc.first,
        fe(n, 100),
        n.state.modeGen++,
        n.curOp && et(n)
    }
    function vp(n, t) {
        return t.from.ch == 0 && t.to.ch == 0 && s(t.text) == "" && (!n.cm || n.cm.options.wholeLineUpdateBefore)
    }
    function sl(n, i, r, u) {
        function a(n) {
            return r ? r[n] : null
        }
        function h(n, t, r) {
            cd(n, t, r, u),
            g(n, "change", n, i)
        }
        function y(n, t) {
            for (var r = [], i = n; i < t; ++i)
                r.push(new lr(f[i],a(i),u));
            return r
        }
        var e = i.from, c = i.to, f = i.text, o = t(n, e.line), l = t(n, c.line), w = s(f), p = a(f.length - 1), v = c.line - e.line, b, k, d;
        i.full ? (n.insert(0, y(0, f.length)),
        n.remove(f.length, n.size - f.length)) : vp(n, i) ? (b = y(0, f.length - 1),
        h(l, l.text, p),
        v && n.remove(e.line, v),
        b.length && n.insert(e.line, b)) : o == l ? f.length == 1 ? h(o, o.text.slice(0, e.ch) + w + o.text.slice(c.ch), p) : (k = y(1, f.length - 1),
        k.push(new lr(w + o.text.slice(c.ch),p,u)),
        h(o, o.text.slice(0, e.ch) + f[0], a(0)),
        n.insert(e.line + 1, k)) : f.length == 1 ? (h(o, o.text.slice(0, e.ch) + f[0] + l.text.slice(c.ch), a(0)),
        n.remove(e.line + 1, v)) : (h(o, o.text.slice(0, e.ch) + f[0], a(0)),
        h(l, w + l.text.slice(c.ch), p),
        d = y(1, f.length - 1),
        v > 1 && n.remove(e.line + 1, v - 1),
        n.insert(e.line + 1, d)),
        g(n, "change", n, i)
    }
    function nu(n, t, i) {
        function r(n, u, f) {
            var o, e, s;
            if (n.linked)
                for (o = 0; o < n.linked.length; ++o)
                    (e = n.linked[o],
                    e.doc != u) && (s = f && e.sharedHist,
                    !i || s) && (t(e.doc, s),
                    r(e.doc, n, s))
        }
        r(n, null, !0)
    }
    function yp(n, t) {
        if (t.cm)
            throw new Error("This document is already in use.");
        n.doc = t,
        t.cm = n,
        pc(n),
        ol(n),
        pp(n),
        n.options.lineWrapping || ch(n),
        n.options.mode = t.modeOption,
        et(n)
    }
    function pp(n) {
        (n.doc.direction == "rtl" ? rr : vi)(n.display.lineDiv, "CodeMirror-rtl")
    }
    function an(n) {
        ot(n, function() {
            pp(n),
            et(n)
        })
    }
    function ts(n) {
        this.done = [],
        this.undone = [],
        this.undoDepth = Infinity,
        this.lastModTime = this.lastSelTime = 0,
        this.lastOp = this.lastSelOp = null,
        this.lastOrigin = this.lastSelOrigin = null,
        this.generation = this.maxGeneration = n || 1
    }
    function hl(n, t) {
        var i = {
            from: uh(t.from),
            to: nr(t),
            text: fr(n, t.from, t.to)
        };
        return kp(n, i, t.from.line, t.to.line + 1),
        nu(n, function(n) {
            return kp(n, i, t.from.line, t.to.line + 1)
        }, !0),
        i
    }
    function wp(n) {
        while (n.length) {
            var t = s(n);
            if (t.ranges)
                n.pop();
            else
                break
        }
    }
    function vn(n, t) {
        return t ? (wp(n.done),
        s(n.done)) : n.done.length && !s(n.done).ranges ? s(n.done) : n.done.length > 1 && !n.done[n.done.length - 2].ranges ? (n.done.pop(),
        s(n.done)) : void 0
    }
    function bp(n, t, i, r) {
        var f = n.history, h, e, o, c;
        if (f.undone.length = 0,
        h = +new Date,
        (f.lastOp == r || f.lastOrigin == t.origin && t.origin && (t.origin.charAt(0) == "+" && f.lastModTime > h - (n.cm ? n.cm.options.historyEventDelay : 500) || t.origin.charAt(0) == "*")) && (e = vn(f, f.lastOp == r)))
            o = s(e.changes),
            u(t.from, t.to) == 0 && u(t.from, o.to) == 0 ? o.to = nr(t) : e.changes.push(hl(n, t));
        else
            for (c = s(f.done),
            c && c.ranges || is(n.sel, f.done),
            e = {
                changes: [hl(n, t)],
                generation: f.generation
            },
            f.done.push(e); f.done.length > f.undoDepth; )
                f.done.shift(),
                f.done[0].ranges || f.done.shift();
        f.done.push(i),
        f.generation = ++f.maxGeneration,
        f.lastModTime = f.lastSelTime = h,
        f.lastOp = f.lastSelOp = r,
        f.lastOrigin = f.lastSelOrigin = t.origin,
        o || p(n, "historyAdded")
    }
    function yn(n, t, i, r) {
        var u = t.charAt(0);
        return u == "*" || u == "+" && i.ranges.length == r.ranges.length && i.somethingSelected() == r.somethingSelected() && new Date - n.history.lastSelTime <= (n.cm ? n.cm.options.historyEventDelay : 500)
    }
    function pn(n, t, i, r) {
        var u = n.history
          , f = r && r.origin;
        i == u.lastSelOp || f && u.lastSelOrigin == f && (u.lastModTime == u.lastSelTime && u.lastOrigin == f || yn(n, f, s(u.done), t)) ? u.done[u.done.length - 1] = t : is(t, u.done),
        u.lastSelTime = +new Date,
        u.lastSelOrigin = f,
        u.lastSelOp = i,
        r && r.clearRedo !== !1 && wp(u.undone)
    }
    function is(n, t) {
        var i = s(t);
        i && i.ranges && i.equals(n) || t.push(n)
    }
    function kp(n, t, i, r) {
        var u = t["spans_" + n.id]
          , f = 0;
        n.iter(Math.max(n.first, i), Math.min(n.first + n.size, r), function(i) {
            i.markedSpans && ((u || (u = t["spans_" + n.id] = {}))[f] = i.markedSpans),
            ++f
        })
    }
    function wn(n) {
        var t, i;
        if (!n)
            return null;
        for (i = 0; i < n.length; ++i)
            n[i].marker.explicitlyCleared ? t || (t = n.slice(0, i)) : t && t.push(n[i]);
        return t ? t.length ? t : null : n
    }
    function bn(n, t) {
        var u = t["spans_" + n.id], r, i;
        if (!u)
            return null;
        for (r = [],
        i = 0; i < t.text.length; ++i)
            r.push(wn(u[i]));
        return r
    }
    function dp(n, t) {
        var i = bn(n, t), s = eh(n, t), r, f, u, e, h, o;
        if (!i)
            return s;
        if (!s)
            return i;
        for (r = 0; r < i.length; ++r)
            if (f = i[r],
            u = s[r],
            f && u)
                n: for (e = 0; e < u.length; ++e) {
                    for (h = u[e],
                    o = 0; o < f.length; ++o)
                        if (f[o].marker == h.marker)
                            continue n;
                    f.push(h)
                }
            else
                u && (i[r] = u);
        return i
    }
    function cu(n, t, i) {
        for (var c = [], u, l, o, h, r, a, f, e = 0; e < n.length; ++e) {
            if (u = n[e],
            u.ranges) {
                c.push(i ? ht.prototype.deepCopy.call(u) : u);
                continue
            }
            for (l = u.changes,
            o = [],
            c.push({
                changes: o
            }),
            h = 0; h < l.length; ++h)
                if (r = l[h],
                a = void 0,
                o.push({
                    from: r.from,
                    to: r.to,
                    text: r.text
                }),
                t)
                    for (f in r)
                        (a = f.match(/^spans_(\d+)$/)) && d(t, Number(a[1])) > -1 && (s(o)[f] = r[f],
                        delete r[f])
        }
        return c
    }
    function cl(n, t, i, r) {
        var f, e;
        return r ? (f = n.anchor,
        i && (e = u(t, f) < 0,
        e != u(i, f) < 0 ? (f = t,
        t = i) : e != u(t, i) < 0 && (t = i)),
        new o(f,t)) : new o(i || t,t)
    }
    function rs(n, t, i, r, u) {
        u == null && (u = n.cm && (n.cm.display.shift || n.extend)),
        tt(n, new ht([cl(n.sel.primary(), t, i, u)],0), r)
    }
    function gp(n, t, i) {
        for (var u = [], e = n.cm && (n.cm.display.shift || n.extend), f, r = 0; r < n.sel.ranges.length; r++)
            u[r] = cl(n.sel.ranges[r], t[r], null, e);
        f = dt(u, n.sel.primIndex),
        tt(n, f, i)
    }
    function ll(n, t, i, r) {
        var u = n.sel.ranges.slice(0);
        u[t] = i,
        tt(n, dt(u, n.sel.primIndex), r)
    }
    function nw(n, t, i, r) {
        tt(n, gi(t, i), r)
    }
    function kn(n, t, i) {
        var r = {
            ranges: t.ranges,
            update: function(t) {
                var r = this, i;
                for (this.ranges = [],
                i = 0; i < t.length; i++)
                    r.ranges[i] = new o(f(n, t[i].anchor),f(n, t[i].head))
            },
            origin: i && i.origin
        };
        return p(n, "beforeSelectionChange", n, r),
        n.cm && p(n.cm, "beforeSelectionChange", n.cm, r),
        r.ranges != t.ranges ? dt(r.ranges, r.ranges.length - 1) : t
    }
    function tw(n, t, i) {
        var r = n.history.done
          , u = s(r);
        u && u.ranges ? (r[r.length - 1] = t,
        us(n, t, i)) : tt(n, t, i)
    }
    function tt(n, t, i) {
        us(n, t, i),
        pn(n, n.sel, n.cm ? n.cm.curOp.id : NaN, i)
    }
    function us(n, t, i) {
        (vt(n, "beforeSelectionChange") || n.cm && vt(n.cm, "beforeSelectionChange")) && (t = kn(n, t, i));
        var r = i && i.bias || (u(t.primary().head, n.sel.primary().head) < 0 ? -1 : 1);
        iw(n, uw(n, t, r, !0)),
        i && i.scroll === !1 || !n.cm || ou(n.cm)
    }
    function iw(n, t) {
        t.equals(n.sel) || (n.sel = t,
        n.cm && (n.cm.curOp.updateInput = n.cm.curOp.selectionChanged = !0,
        tv(n.cm)),
        g(n, "cursorActivity", n))
    }
    function rw(n) {
        iw(n, uw(n, n.sel, null, !1))
    }
    function uw(n, t, i, r) {
        for (var f, u = 0; u < t.ranges.length; u++) {
            var e = t.ranges[u]
              , s = t.ranges.length == n.sel.ranges.length && n.sel.ranges[u]
              , h = al(n, e.anchor, s && s.anchor, i, r)
              , c = al(n, e.head, s && s.head, i, r);
            (f || h != e.anchor || c != e.head) && (f || (f = t.ranges.slice(0, u)),
            f[u] = new o(h,c))
        }
        return f ? dt(f, t.primIndex) : t
    }
    function lu(n, i, r, f, e) {
        var c = t(n, i.line), a, h, o, s, v, l;
        if (c.markedSpans)
            for (a = 0; a < c.markedSpans.length; ++a)
                if (h = c.markedSpans[a],
                o = h.marker,
                (h.from == null || (o.inclusiveLeft ? h.from <= i.ch : h.from < i.ch)) && (h.to == null || (o.inclusiveRight ? h.to >= i.ch : h.to > i.ch))) {
                    if (e && (p(o, "beforeCursorEnter"),
                    o.explicitlyCleared))
                        if (c.markedSpans) {
                            --a;
                            continue
                        } else
                            break;
                    if (!o.atomic)
                        continue;
                    return r && (s = o.find(f < 0 ? 1 : -1),
                    v = void 0,
                    (f < 0 ? o.inclusiveRight : o.inclusiveLeft) && (s = fw(n, s, -f, s && s.line == i.line ? c : null)),
                    s && s.line == i.line && (v = u(s, r)) && (f < 0 ? v < 0 : v > 0)) ? lu(n, s, i, f, e) : (l = o.find(f < 0 ? -1 : 1),
                    (f < 0 ? o.inclusiveLeft : o.inclusiveRight) && (l = fw(n, l, f, l.line == i.line ? c : null)),
                    l ? lu(n, l, i, f, e) : null)
                }
        return i
    }
    function al(t, i, r, u, f) {
        var e = u || 1
          , o = lu(t, i, r, e, f) || !f && lu(t, i, r, e, !0) || lu(t, i, r, -e, f) || !f && lu(t, i, r, -e, !0);
        return o ? o : (t.cantEdit = !0,
        n(t.first, 0))
    }
    function fw(i, r, u, e) {
        return u < 0 && r.ch == 0 ? r.line > i.first ? f(i, n(r.line - 1)) : null : u > 0 && r.ch == (e || t(i, r.line)).text.length ? r.line < i.first + i.size - 1 ? n(r.line + 1, 0) : null : new n(r.line,r.ch + u)
    }
    function ew(t) {
        t.setSelection(n(t.firstLine(), 0), n(t.lastLine()), gt)
    }
    function ow(n, t, i) {
        var r = {
            canceled: !1,
            from: t.from,
            to: t.to,
            text: t.text,
            origin: t.origin,
            cancel: function() {
                return r.canceled = !0
            }
        };
        return (i && (r.update = function(t, i, u, e) {
            t && (r.from = f(n, t)),
            i && (r.to = f(n, i)),
            u && (r.text = u),
            e !== undefined && (r.origin = e)
        }
        ),
        p(n, "beforeChange", n, r),
        n.cm && p(n.cm, "beforeChange", n.cm, r),
        r.canceled) ? null : {
            from: r.from,
            to: r.to,
            text: r.text,
            origin: r.origin
        }
    }
    function au(n, t, i) {
        var u, r;
        if (n.cm) {
            if (!n.cm.curOp)
                return b(n.cm, au)(n, t, i);
            if (n.cm.state.suppressEdits)
                return
        }
        if (!vt(n, "beforeChange") && (!n.cm || !vt(n.cm, "beforeChange")) || (t = ow(n, t, !0),
        t))
            if (u = fh && !i && wk(n, t.from, t.to),
            u)
                for (r = u.length - 1; r >= 0; --r)
                    sw(n, {
                        from: u[r].from,
                        to: u[r].to,
                        text: r ? [""] : t.text,
                        origin: t.origin
                    });
            else
                sw(n, t)
    }
    function sw(n, t) {
        var i, r;
        (t.text.length != 1 || t.text[0] != "" || u(t.from, t.to) != 0) && (i = el(n, t),
        bp(n, t, i, n.cm ? n.cm.curOp.id : NaN),
        he(n, t, i, eh(n, t)),
        r = [],
        nu(n, function(n, i) {
            i || d(r, n.history) != -1 || (aw(n.history, t),
            r.push(n.history)),
            he(n, t, null, eh(n, t))
        }))
    }
    function fs(n, t, i) {
        var a = n.cm && n.cm.state.suppressEdits, c, y, p, o, l;
        if (!a || i) {
            for (var u = n.history, r, v = n.sel, f = t == "undo" ? u.done : u.undone, h = t == "undo" ? u.undone : u.done, e = 0; e < f.length; e++)
                if (r = f[e],
                i ? r.ranges && !r.equals(n.sel) : !r.ranges)
                    break;
            if (e != f.length) {
                for (u.lastOrigin = u.lastSelOrigin = null; ; )
                    if (r = f.pop(),
                    r.ranges) {
                        if (is(r, h),
                        i && !r.equals(n.sel)) {
                            tt(n, r, {
                                clearRedo: !1
                            });
                            return
                        }
                        v = r
                    } else {
                        if (a) {
                            f.push(r);
                            return
                        }
                        break
                    }
                for (c = [],
                is(v, h),
                h.push({
                    changes: c,
                    generation: u.generation
                }),
                u.generation = r.generation || ++u.maxGeneration,
                y = vt(n, "beforeChange") || n.cm && vt(n.cm, "beforeChange"),
                p = function(i) {
                    var u = r.changes[i], o, e;
                    if (u.origin = t,
                    y && !ow(n, u, !1))
                        return f.length = 0,
                        {};
                    c.push(hl(n, u)),
                    o = i ? el(n, u) : s(f),
                    he(n, u, o, dp(n, u)),
                    !i && n.cm && n.cm.scrollIntoView({
                        from: u.from,
                        to: nr(u)
                    }),
                    e = [],
                    nu(n, function(n, t) {
                        t || d(e, n.history) != -1 || (aw(n.history, u),
                        e.push(n.history)),
                        he(n, u, null, dp(n, u))
                    })
                }
                ,
                o = r.changes.length - 1; o >= 0; --o)
                    if (l = p(o),
                    l)
                        return l.v
            }
        }
    }
    function hw(t, i) {
        if (i != 0 && (t.first += i,
        t.sel = new ht(ro(t.sel.ranges, function(t) {
            return new o(n(t.anchor.line + i, t.anchor.ch),n(t.head.line + i, t.head.ch))
        }),t.sel.primIndex),
        t.cm)) {
            et(t.cm, t.first, t.first - i, i);
            for (var u = t.cm.display, r = u.viewFrom; r < u.viewTo; r++)
                ki(t.cm, r, "gutter")
        }
    }
    function he(i, r, u, f) {
        var o, e;
        if (i.cm && !i.cm.curOp)
            return b(i.cm, he)(i, r, u, f);
        if (r.to.line < i.first) {
            hw(i, r.text.length - 1 - (r.to.line - r.from.line));
            return
        }
        r.from.line > i.lastLine() || (r.from.line < i.first && (o = r.text.length - 1 - (i.first - r.from.line),
        hw(i, o),
        r = {
            from: n(i.first, 0),
            to: n(r.to.line + o, r.to.ch),
            text: [s(r.text)],
            origin: r.origin
        }),
        e = i.lastLine(),
        r.to.line > e && (r = {
            from: r.from,
            to: n(e, t(i, e).text.length),
            text: [r.text[0]],
            origin: r.origin
        }),
        r.removed = fr(i, r.from, r.to),
        u || (u = el(i, r)),
        i.cm ? dn(i.cm, r, f) : sl(i, r, f),
        us(i, u, gt))
    }
    function dn(n, i, r) {
        var f = n.doc, e = n.display, u = i.from, o = i.to, s = !1, c = u.line, y, l, a, v;
        n.options.lineWrapping || (c = h(ii(t(f, u.line))),
        f.iter(c, o.line + 1, function(n) {
            if (n == e.maxLine)
                return s = !0,
                !0
        })),
        f.sel.contains(i.from, i.to) > -1 && tv(n),
        sl(f, i, r, yy(n)),
        n.options.lineWrapping || (f.iter(c, u.line + i.text.length, function(n) {
            var t = lo(n);
            t > e.maxLineLength && (e.maxLine = n,
            e.maxLineLength = t,
            e.maxLineChanged = !0,
            s = !1)
        }),
        s && (n.curOp.updateMaxLine = !0)),
        hd(f, u.line),
        fe(n, 400),
        y = i.text.length - (o.line - u.line) - 1,
        i.full ? et(n) : u.line != o.line || i.text.length != 1 || vp(n.doc, i) ? et(n, u.line, o.line + 1, y) : ki(n, u.line, "text"),
        l = vt(n, "changes"),
        a = vt(n, "change"),
        (a || l) && (v = {
            from: u,
            to: o,
            text: i.text,
            removed: i.removed,
            origin: i.origin
        },
        a && g(n, "change", n, v),
        l && (n.curOp.changeObjs || (n.curOp.changeObjs = [])).push(v)),
        n.display.selForContextMenu = null
    }
    function vu(n, t, i, r, f) {
        if (r || (r = i),
        u(r, i) < 0) {
            var e;
            e = [r, i],
            i = e[0],
            r = e[1],
            e
        }
        typeof t == "string" && (t = n.splitLines(t)),
        au(n, {
            from: i,
            to: r,
            text: t,
            origin: f
        })
    }
    function cw(n, t, i, r) {
        i < n.line ? n.line += r : t < n.line && (n.line = t,
        n.ch = 0)
    }
    function lw(t, i, r, u) {
        for (var f, c, s, h, e, o = 0; o < t.length; ++o) {
            if (f = t[o],
            c = !0,
            f.ranges) {
                for (f.copied || (f = t[o] = f.deepCopy(),
                f.copied = !0),
                s = 0; s < f.ranges.length; s++)
                    cw(f.ranges[s].anchor, i, r, u),
                    cw(f.ranges[s].head, i, r, u);
                continue
            }
            for (h = 0; h < f.changes.length; ++h)
                if (e = f.changes[h],
                r < e.from.line)
                    e.from = n(e.from.line + u, e.from.ch),
                    e.to = n(e.to.line + u, e.to.ch);
                else if (i <= e.to.line) {
                    c = !1;
                    break
                }
            c || (t.splice(0, o + 1),
            o = 0)
        }
    }
    function aw(n, t) {
        var i = t.from.line
          , r = t.to.line
          , u = t.text.length - (r - i) - 1;
        lw(n.done, i, r, u),
        lw(n.undone, i, r, u)
    }
    function ce(n, i, r, u) {
        var f = i
          , e = i;
        return (typeof i == "number" ? e = t(n, aa(n, i)) : f = h(i),
        f == null) ? null : (u(e, f) && n.cm && ki(n.cm, f, r),
        e)
    }
    function le(n) {
        var r = this, i, t;
        for (this.lines = n,
        this.parent = null,
        i = 0,
        t = 0; t < n.length; ++t)
            n[t].parent = r,
            i += n[t].height;
        this.height = i
    }
    function ae(n) {
        var f = this, r, u, t, i;
        for (this.children = n,
        r = 0,
        u = 0,
        t = 0; t < n.length; ++t)
            i = n[t],
            r += i.chunkSize(),
            u += i.height,
            i.parent = f;
        this.size = r,
        this.height = u,
        this.parent = null
    }
    function vw(n, t, i) {
        oi(t) < (n.curOp && n.curOp.scrollTop || n.doc.scrollTop) && gc(n, i)
    }
    function gn(n, t, i, r) {
        var u = new yu(n,i,r)
          , f = n.cm;
        return f && u.noHScroll && (f.display.alignWidgets = !0),
        ce(n, t, "widget", function(t) {
            var i = t.widgets || (t.widgets = []), r;
            return u.insertAt == null ? i.push(u) : i.splice(Math.min(i.length - 1, Math.max(0, u.insertAt)), 0, u),
            u.line = t,
            f && !or(n, t) && (r = oi(t) < n.scrollTop,
            ni(t, t.height + kf(u)),
            r && gc(f, u.height),
            f.curOp.forceUpdate = !0),
            !0
        }),
        f && g(f, "lineWidgetAdded", f, u, typeof t == "number" ? t : h(t)),
        u
    }
    function pu(n, t, i, f, e) {
        var o, l, h, s, a, c;
        if (f && f.shared)
            return ntt(n, t, i, f, e);
        if (n.cm && !n.cm.curOp)
            return b(n.cm, pu)(n, t, i, f, e);
        if (o = new ci(n,e),
        l = u(t, i),
        f && ur(f, o, !1),
        l > 0 || l == 0 && o.clearWhenEmpty !== !1)
            return o;
        if (o.replacedWith && (o.collapsed = !0,
        o.widgetNode = tu("span", [o.replacedWith], "CodeMirror-widget"),
        f.handleMouseEvents || o.widgetNode.setAttribute("cm-ignore-events", "true"),
        f.insertLeft && (o.widgetNode.insertLeft = !0)),
        o.collapsed) {
            if (da(n, t.line, t, i, o) || t.line != i.line && da(n, i.line, t, i, o))
                throw new Error("Inserting collapsed marker partially overlapping an existing one");
            lk()
        }
        if (o.addToHistory && bp(n, {
            from: t,
            to: i,
            origin: "markText"
        }, n.sel, NaN),
        h = t.line,
        s = n.cm,
        n.iter(h, i.line + 1, function(n) {
            s && o.collapsed && !s.options.lineWrapping && ii(n) == s.display.maxLine && (a = !0),
            o.collapsed && h != t.line && ni(n, 0),
            vk(n, new oo(o,h == t.line ? t.ch : null,h == i.line ? i.ch : null)),
            ++h
        }),
        o.collapsed && n.iter(t.line, i.line + 1, function(t) {
            or(n, t) && ni(t, 0)
        }),
        o.clearOnEnter && r(o, "beforeCursorEnter", function() {
            return o.clear()
        }),
        o.readOnly && (ck(),
        (n.history.done.length || n.history.undone.length) && n.clearHistory()),
        o.collapsed && (o.id = ++vl,
        o.atomic = !0),
        s) {
            if (a && (s.curOp.updateMaxLine = !0),
            o.collapsed)
                et(s, t.line, i.line + 1);
            else if (o.className || o.title || o.startStyle || o.endStyle || o.css)
                for (c = t.line; c <= i.line; c++)
                    ki(s, c, "text");
            o.atomic && rw(s.doc),
            g(s, "markerAdded", s, o)
        }
        return o
    }
    function ntt(n, t, i, r, u) {
        r = ur(r),
        r.shared = !1;
        var e = [pu(n, t, i, r, u)]
          , o = e[0]
          , h = r.widgetNode;
        return nu(n, function(n) {
            h && (r.widgetNode = h.cloneNode(!0)),
            e.push(pu(n, f(n, t), f(n, i), r, u));
            for (var c = 0; c < n.linked.length; ++c)
                if (n.linked[c].isParent)
                    return;
            o = s(e)
        }),
        new wu(e,o)
    }
    function yw(t) {
        return t.findMarks(n(t.first, 0), t.clipPos(n(t.lastLine())), function(n) {
            return n.parent
        })
    }
    function ttt(n, t) {
        for (var f, r = 0; r < t.length; r++) {
            var i = t[r]
              , e = i.find()
              , o = n.clipPos(e.from)
              , s = n.clipPos(e.to);
            u(o, s) && (f = pu(n, o, s, i.primary, i.primary.type),
            i.markers.push(f),
            f.parent = i)
        }
    }
    function itt(n) {
        for (var i = function(t) {
            var i = n[t], f = [i.primary.doc], r, u;
            for (nu(i.primary.doc, function(n) {
                return f.push(n)
            }),
            r = 0; r < i.markers.length; r++)
                u = i.markers[r],
                d(f, u.doc) == -1 && (u.parent = null,
                i.markers.splice(r--, 1))
        }, t = 0; t < n.length; t++)
            i(t)
    }
    function rtt(n) {
        var t = this, i, r, u, c, o, s;
        if ((ww(t),
        !w(t, n) && !hi(t.display, n)) && (ft(n),
        e && (yl = +new Date),
        i = wr(t, n, !0),
        r = n.dataTransfer.files,
        i && !t.isReadOnly()))
            if (r && r.length && window.FileReader && window.File) {
                var h = r.length
                  , l = Array(h)
                  , a = 0
                  , v = function(n, r) {
                    if (!t.options.allowDropFileTypes || d(t.options.allowDropFileTypes, n.type) != -1) {
                        var u = new FileReader;
                        u.onload = b(t, function() {
                            var n = u.result, e;
                            /[\x00-\x08\x0e-\x1f]{2}/.test(n) && (n = ""),
                            l[r] = n,
                            ++a == h && (i = f(t.doc, i),
                            e = {
                                from: i,
                                to: i,
                                text: t.doc.splitLines(l.join(t.doc.lineSeparator())),
                                origin: "paste"
                            },
                            au(t.doc, e),
                            tw(t.doc, gi(i, nr(e))))
                        }),
                        u.readAsText(n)
                    }
                };
                for (u = 0; u < h; ++u)
                    v(r[u], u)
            } else {
                if (t.state.draggingText && t.doc.sel.contains(i) > -1) {
                    t.state.draggingText(n),
                    setTimeout(function() {
                        return t.display.input.focus()
                    }, 20);
                    return
                }
                try {
                    if (c = n.dataTransfer.getData("Text"),
                    c) {
                        if (t.state.draggingText && !t.state.draggingText.copy && (o = t.listSelections()),
                        us(t.doc, gi(i, i)),
                        o)
                            for (s = 0; s < o.length; ++s)
                                vu(t.doc, "", o[s].anchor, o[s].head, "drag");
                        t.replaceSelection(c, "around", "paste"),
                        t.display.input.focus()
                    }
                } catch (n) {}
            }
    }
    function utt(n, t) {
        if (e && (!n.state.draggingText || +new Date - yl < 100)) {
            yf(t);
            return
        }
        if (!w(n, t) && !hi(n.display, t) && (t.dataTransfer.setData("Text", n.getSelection()),
        t.dataTransfer.effectAllowed = "copyMove",
        t.dataTransfer.setDragImage && !ua)) {
            var r = i("img", null, null, "position: fixed; left: 0; top: 0;");
            r.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
            pt && (r.width = r.height = 1,
            n.display.wrapper.appendChild(r),
            r._top = r.offsetTop),
            t.dataTransfer.setDragImage(r, 0, 0),
            pt && r.parentNode.removeChild(r)
        }
    }
    function ftt(n, t) {
        var u = wr(n, t), r;
        u && (r = document.createDocumentFragment(),
        wy(n, u, r),
        n.display.dragCursor || (n.display.dragCursor = i("div", null, "CodeMirror-cursors CodeMirror-dragcursors"),
        n.display.lineSpace.insertBefore(n.display.dragCursor, n.display.cursorDiv)),
        ct(n.display.dragCursor, r))
    }
    function ww(n) {
        n.display.dragCursor && (n.display.lineSpace.removeChild(n.display.dragCursor),
        n.display.dragCursor = null)
    }
    function bw(n) {
        var i, t, r;
        if (document.getElementsByClassName)
            for (i = document.getElementsByClassName("CodeMirror"),
            t = 0; t < i.length; t++)
                r = i[t].CodeMirror,
                r && n(r)
    }
    function ett() {
        pl || (ott(),
        pl = !0)
    }
    function ott() {
        var n;
        r(window, "resize", function() {
            n == null && (n = setTimeout(function() {
                n = null,
                bw(stt)
            }, 100))
        }),
        r(window, "blur", function() {
            return bw(te)
        })
    }
    function stt(n) {
        var t = n.display;
        t.cachedCharWidth = t.cachedTextHeight = t.cachedPaddingH = null,
        t.scrollbarsClipped = !1,
        n.setSize()
    }
    function htt(n) {
        var i = n.split(/-(?!$)/), u, f, e, o, r, t;
        for (n = i[i.length - 1],
        r = 0; r < i.length - 1; r++)
            if (t = i[r],
            /^(cmd|meta|m)$/i.test(t))
                o = !0;
            else if (/^a(lt)?$/i.test(t))
                u = !0;
            else if (/^(c|ctrl|control)$/i.test(t))
                f = !0;
            else if (/^s(hift)?$/i.test(t))
                e = !0;
            else
                throw new Error("Unrecognized modifier name: " + t);
        return u && (n = "Alt-" + n),
        f && (n = "Ctrl-" + n),
        o && (n = "Cmd-" + n),
        e && (n = "Shift-" + n),
        n
    }
    function ctt(n) {
        var e = {}, t, o, r, u, f, i, s, h;
        for (t in n)
            if (n.hasOwnProperty(t)) {
                if (o = n[t],
                /^(name|fallthrough|(de|at)tach)$/.test(t))
                    continue;
                if (o == "...") {
                    delete n[t];
                    continue
                }
                for (r = ro(t.split(" "), htt),
                u = 0; u < r.length; u++)
                    if (f = void 0,
                    i = void 0,
                    u == r.length - 1 ? (i = r.join(" "),
                    f = o) : (i = r.slice(0, u + 1).join(" "),
                    f = "..."),
                    s = e[i],
                    s) {
                        if (s != f)
                            throw new Error("Inconsistent bindings for " + i);
                    } else
                        e[i] = f;
                delete n[t]
            }
        for (h in e)
            n[h] = e[h];
        return n
    }
    function du(n, t, i, r) {
        var u, f, e;
        if (t = es(t),
        u = t.call ? t.call(n, r) : t[n],
        u === !1)
            return "nothing";
        if (u === "...")
            return "multi";
        if (u != null && i(u))
            return "handled";
        if (t.fallthrough) {
            if (Object.prototype.toString.call(t.fallthrough) != "[object Array]")
                return du(n, t.fallthrough, i, r);
            for (f = 0; f < t.fallthrough.length; f++)
                if (e = du(n, t.fallthrough[f], i, r),
                e)
                    return e
        }
    }
    function kw(n) {
        var t = typeof n == "string" ? n : li[n.keyCode];
        return t == "Ctrl" || t == "Alt" || t == "Shift" || t == "Mod"
    }
    function dw(n, t, i) {
        var r = n;
        return t.altKey && r != "Alt" && (n = "Alt-" + n),
        (ys ? t.metaKey : t.ctrlKey) && r != "Ctrl" && (n = "Ctrl-" + n),
        (ys ? t.ctrlKey : t.metaKey) && r != "Cmd" && (n = "Cmd-" + n),
        !i && t.shiftKey && r != "Shift" && (n = "Shift-" + n),
        n
    }
    function gw(n, t) {
        if (pt && n.keyCode == 34 && n.char)
            return !1;
        var i = li[n.keyCode];
        return i == null || n.altGraphKey ? !1 : (n.keyCode == 3 && n.code && (i = n.code),
        dw(i, n, t))
    }
    function es(n) {
        return typeof n == "string" ? fi[n] : n
    }
    function gu(n, t) {
        for (var o = n.doc.sel.ranges, i = [], r, e, f = 0; f < o.length; f++) {
            for (r = t(o[f]); i.length && u(r.from, s(i).to) <= 0; )
                if (e = i.pop(),
                u(e.from, r.from) < 0) {
                    r.from = e.from;
                    break
                }
            i.push(r)
        }
        ot(n, function() {
            for (var t = i.length - 1; t >= 0; t--)
                vu(n.doc, "", i[t].from, i[t].to, "+delete");
            ou(n)
        })
    }
    function wl(n, t, i) {
        var r = la(n.text, t + i, i);
        return r < 0 || r > n.text.length ? null : r
    }
    function bl(t, i, r) {
        var u = wl(t, i.ch, r);
        return u == null ? null : new n(i.line,u,r < 0 ? "after" : "before")
    }
    function kl(t, i, r, u, f) {
        var h, c, a;
        if (t && (h = si(r, i.doc.direction),
        h)) {
            var o = f < 0 ? s(h) : h[0], v = f < 0 == (o.level == 1), l = v ? "after" : "before", e;
            return o.level > 0 || i.doc.direction == "rtl" ? (c = eu(i, r),
            e = f < 0 ? r.text.length - 1 : 0,
            a = ui(i, c, e).top,
            e = cf(function(n) {
                return ui(i, c, n).top == a
            }, f < 0 == (o.level == 1) ? o.from : o.to - 1, e),
            l == "before" && (e = wl(r, e, 1))) : e = f < 0 ? o.to : o.from,
            new n(u,e,l)
        }
        return new n(u,f < 0 ? r.text.length : 0,f < 0 ? "before" : "after")
    }
    function ltt(t, i, r, u) {
        var o = si(i, t.doc.direction), v, f, l, e, b, p, h, a;
        if (!o || (r.ch >= i.text.length ? (r.ch = i.text.length,
        r.sticky = "before") : r.ch <= 0 && (r.ch = 0,
        r.sticky = "after"),
        v = vf(o, r.ch, r.sticky),
        f = o[v],
        t.doc.direction == "ltr" && f.level % 2 == 0 && (u > 0 ? f.to > r.ch : f.from < r.ch)))
            return bl(i, r, u);
        var s = function(t, r) {
            return wl(i, t instanceof n ? t.ch : t, r)
        }, y, w = function(n) {
            return t.options.lineWrapping ? (y = y || eu(t, i),
            vy(t, i, y, n)) : {
                begin: 0,
                end: i.text.length
            }
        }, c = w(r.sticky == "before" ? s(r, -1) : r.ch);
        return (t.doc.direction == "rtl" || f.level == 1) && (l = f.level == 1 == u < 0,
        e = s(r, l ? 1 : -1),
        e != null && (l ? e <= f.to && e <= c.end : e >= f.from && e >= c.begin)) ? (b = l ? "before" : "after",
        new n(r.line,e,b)) : (p = function(t, i, u) {
            for (var c = function(t, i) {
                return i ? new n(r.line,s(t, 1),"before") : new n(r.line,t,"after")
            }; t >= 0 && t < o.length; t += i) {
                var e = o[t]
                  , h = i > 0 == (e.level != 1)
                  , f = h ? u.begin : s(u.end, -1);
                if (e.from <= f && f < e.to || (f = h ? e.from : s(e.to, -1),
                u.begin <= f && f < u.end))
                    return c(f, h)
            }
        }
        ,
        h = p(v + u, u, c),
        h) ? h : (a = u > 0 ? c.end : s(c.begin, -1),
        a != null && !(u > 0 && a == i.text.length) && (h = p(u > 0 ? 0 : o.length - 1, u, w(a)),
        h)) ? h : null
    }
    function nb(n, i) {
        var u = t(n.doc, i)
          , r = ii(u);
        return r != u && (i = h(r)),
        kl(!0, n, r, i, 1)
    }
    function att(n, i) {
        var r = t(n.doc, i)
          , u = kk(r);
        return u != r && (i = h(u)),
        kl(!0, n, r, i, -1)
    }
    function tb(i, r) {
        var u = nb(i, r.line), e = t(i.doc, u.line), o = si(e, i.doc.direction), f, s;
        return !o || o[0].level == 0 ? (f = Math.max(0, e.text.search(/\S/)),
        s = r.line == u.line && r.ch <= f && r.ch,
        n(u.line, s ? 0 : f, u.sticky)) : u
    }
    function os(n, t, i) {
        if (typeof t == "string" && (t = nf[t],
        !t))
            return !1;
        n.display.input.ensurePolled();
        var u = n.display.shift
          , r = !1;
        try {
            n.isReadOnly() && (n.state.suppressEdits = !0),
            i && (n.display.shift = !1),
            r = t(n) != io
        } finally {
            n.display.shift = u,
            n.state.suppressEdits = !1
        }
        return r
    }
    function vtt(n, t, i) {
        for (var u, r = 0; r < n.state.keyMaps.length; r++)
            if (u = du(t, n.state.keyMaps[r], i, n),
            u)
                return u;
        return n.options.extraKeys && du(t, n.options.extraKeys, i, n) || du(t, n.options.keyMap, i, n)
    }
    function ye(n, t, i, r) {
        var u = n.state.keySeq;
        if (u) {
            if (kw(t))
                return "handled";
            if (/\'$/.test(t) ? n.state.keySeq = null : ib.set(50, function() {
                n.state.keySeq == u && (n.state.keySeq = null,
                n.display.input.reset())
            }),
            rb(n, u + " " + t, i, r))
                return !0
        }
        return rb(n, t, i, r)
    }
    function rb(n, t, i, r) {
        var u = vtt(n, t, r);
        return u == "multi" && (n.state.keySeq = t),
        u == "handled" && g(n, "keyHandled", n, t, i),
        (u == "handled" || u == "multi") && (ft(i),
        wc(n)),
        !!u
    }
    function ub(n, t) {
        var i = gw(t, !0);
        return i ? t.shiftKey && !n.state.keySeq ? ye(n, "Shift-" + i, t, function(t) {
            return os(n, t, !0)
        }) || ye(n, i, t, function(t) {
            if (typeof t == "string" ? /^go[A-Z]/.test(t) : t.motion)
                return os(n, t)
        }) : ye(n, i, t, function(t) {
            return os(n, t)
        }) : !1
    }
    function ytt(n, t, i) {
        return ye(n, "'" + i + "'", t, function(t) {
            return os(n, t, !0)
        })
    }
    function fb(n) {
        var t = this, i, r;
        (t.curOp.focus = ei(),
        w(t, n)) || (e && l < 11 && n.keyCode == 27 && (n.returnValue = !1),
        i = n.keyCode,
        t.display.shift = i == 16 || n.shiftKey,
        r = ub(t, n),
        pt && (ss = r ? i : null,
        !r && i == 88 && !rd && (wt ? n.metaKey : n.ctrlKey) && t.replaceSelection("", null, "cut")),
        i != 18 || /\bCodeMirror-crosshair\b/.test(t.display.lineDiv.className) || ptt(t))
    }
    function ptt(n) {
        function t(n) {
            n.keyCode != 18 && n.altKey || (vi(i, "CodeMirror-crosshair"),
            lt(document, "keyup", t),
            lt(document, "mouseover", t))
        }
        var i = n.display.lineDiv;
        rr(i, "CodeMirror-crosshair"),
        r(document, "keyup", t),
        r(document, "mouseover", t)
    }
    function eb(n) {
        n.keyCode == 16 && (this.doc.sel.shift = !1),
        w(this, n)
    }
    function ob(n) {
        var t = this, i, r, u;
        if (!hi(t.display, n) && !w(t, n) && (!n.ctrlKey || n.altKey) && (!wt || !n.metaKey)) {
            if (i = n.keyCode,
            r = n.charCode,
            pt && i == ss) {
                ss = null,
                ft(n);
                return
            }
            if ((!pt || n.which && !(n.which < 10) || !ub(t, n)) && (u = String.fromCharCode(r == null ? i : r),
            u != "\b") && !ytt(t, n, u))
                t.display.input.onKeyPress(n)
        }
    }
    function wtt(n, t) {
        var i = +new Date;
        return we && we.compare(i, n, t) ? (pe = we = null,
        "triple") : pe && pe.compare(i, n, t) ? (we = new hs(i,n,t),
        pe = null,
        "double") : (pe = new hs(i,n,t),
        we = null,
        "single")
    }
    function hb(n) {
        var t = this
          , i = t.display;
        if (!w(t, n) && (!i.activeTouch || !i.input.supportsTouch())) {
            if (i.input.ensurePolled(),
            i.shift = n.shiftKey,
            hi(i, n)) {
                nt || (i.scroller.draggable = !1,
                setTimeout(function() {
                    return i.scroller.draggable = !0
                }, 100));
                return
            }
            if (!dl(t, n)) {
                var r = wr(t, n)
                  , u = rv(n)
                  , f = r ? wtt(r, u) : "single";
                (window.focus(),
                u == 1 && t.state.selectingText && t.state.selectingText(n),
                r && btt(t, u, r, f, n)) || (u == 1 ? r ? dtt(t, r, f, n) : yh(n) == i.scroller && ft(n) : u == 2 ? (r && rs(t.doc, r),
                setTimeout(function() {
                    return i.input.focus()
                }, 20)) : u == 3 && (to ? ab(t, n) : ky(t)))
            }
        }
    }
    function btt(n, t, i, r, u) {
        var f = "Click";
        return r == "double" ? f = "Double" + f : r == "triple" && (f = "Triple" + f),
        f = (t == 1 ? "Left" : t == 2 ? "Middle" : "Right") + f,
        ye(n, dw(f, u), u, function(t) {
            if (typeof t == "string" && (t = nf[t]),
            !t)
                return !1;
            var r = !1;
            try {
                n.isReadOnly() && (n.state.suppressEdits = !0),
                r = t(n, i) != io
            } finally {
                n.state.suppressEdits = !1
            }
            return r
        })
    }
    function ktt(n, t, i) {
        var u = n.getOption("configureMouse"), r = u ? u(n, t, i) : {}, f;
        return r.unit == null && (f = fk ? i.shiftKey && i.metaKey : i.altKey,
        r.unit = f ? "rectangle" : t == "single" ? "char" : t == "double" ? "word" : "line"),
        (r.extend == null || n.doc.extend) && (r.extend = n.doc.extend || i.shiftKey),
        r.addNew == null && (r.addNew = wt ? i.metaKey : i.ctrlKey),
        r.moveOnDrag == null && (r.moveOnDrag = !(wt ? i.altKey : i.ctrlKey)),
        r
    }
    function dtt(n, t, i, r) {
        e ? setTimeout(ws(by, n), 0) : n.curOp.focus = ei();
        var o = ktt(n, i, r), s = n.doc.sel, f;
        n.options.dragDrop && uv && !n.isReadOnly() && i == "single" && (f = s.contains(t)) > -1 && (u((f = s.ranges[f]).from(), t) < 0 || t.xRel > 0) && (u(f.to(), t) > 0 || t.xRel < 0) ? gtt(n, r, t, o) : nit(n, r, t, o)
    }
    function gtt(n, t, i, u) {
        var f = n.display
          , s = !1
          , o = b(n, function(t) {
            nt && (f.scroller.draggable = !1),
            n.state.draggingText = !1,
            lt(f.wrapper.ownerDocument, "mouseup", o),
            lt(f.wrapper.ownerDocument, "mousemove", h),
            lt(f.scroller, "dragstart", c),
            lt(f.scroller, "drop", o),
            s || (ft(t),
            u.addNew || rs(n.doc, i, null, null, u.extend),
            nt || e && l == 9 ? setTimeout(function() {
                f.wrapper.ownerDocument.body.focus(),
                f.input.focus()
            }, 20) : f.input.focus())
        })
          , h = function(n) {
            s = s || Math.abs(t.clientX - n.clientX) + Math.abs(t.clientY - n.clientY) >= 10
        }
          , c = function() {
            return s = !0
        };
        nt && (f.scroller.draggable = !0),
        n.state.draggingText = o,
        o.copy = !u.moveOnDrag,
        f.scroller.dragDrop && f.scroller.dragDrop(),
        r(f.wrapper.ownerDocument, "mouseup", o),
        r(f.wrapper.ownerDocument, "mousemove", h),
        r(f.scroller, "dragstart", c),
        r(f.scroller, "drop", o),
        ky(n),
        setTimeout(function() {
            return f.input.focus()
        }, 20)
    }
    function cb(t, i, r) {
        if (r == "char")
            return new o(i,i);
        if (r == "word")
            return t.findWordAt(i);
        if (r == "line")
            return new o(n(i.line, 0),f(t.doc, n(i.line + 1, 0)));
        var u = r(t, i);
        return new o(u.from,u.to)
    }
    function nit(i, e, s, h) {
        function et(r) {
            var e, st, k, y, rt;
            if (u(d, r) != 0)
                if (d = r,
                h.unit == "rectangle") {
                    var v = []
                      , b = i.options.tabSize
                      , ut = at(t(c, s.line).text, s.ch, b)
                      , ft = at(t(c, r.line).text, r.ch, b)
                      , et = Math.min(ut, ft)
                      , ot = Math.max(ut, ft);
                    for (e = Math.min(s.line, r.line),
                    st = Math.min(i.lastLine(), Math.max(s.line, r.line)); e <= st; e++)
                        k = t(c, e).text,
                        y = ks(k, et, b),
                        et == ot ? v.push(new o(n(e, y),n(e, y))) : k.length > y && v.push(new o(n(e, y),n(e, ks(k, ot, b))));
                    v.length || v.push(new o(s,s)),
                    tt(c, dt(p.ranges.slice(0, l).concat(v), l), {
                        origin: "*mouse",
                        scroll: !1
                    }),
                    i.scrollIntoView(r)
                } else {
                    var nt = a, w = cb(i, r, h.unit), g = nt.anchor, it;
                    u(w.anchor, g) > 0 ? (it = w.head,
                    g = eo(nt.from(), w.anchor)) : (it = w.anchor,
                    g = fo(nt.to(), w.head)),
                    rt = p.ranges.slice(0),
                    rt[l] = tit(i, new o(f(c, g),it)),
                    tt(c, dt(rt, l), bs)
                }
        }
        function it(n) {
            var e = ++w, t = wr(i, n, !0, h.unit == "rectangle"), r, f;
            t && (u(t, d) != 0 ? (i.curOp.focus = ei(),
            et(t),
            r = kc(v, c),
            (t.line >= r.to || t.line < r.from) && setTimeout(b(i, function() {
                w == e && it(n)
            }), 150)) : (f = n.clientY < nt.top ? -20 : n.clientY > nt.bottom ? 20 : 0,
            f && setTimeout(b(i, function() {
                w == e && (v.scroller.scrollTop += f,
                it(n))
            }), 50)))
        }
        function ut(n) {
            i.state.selectingText = !1,
            w = Infinity,
            ft(n),
            v.input.focus(),
            lt(v.wrapper.ownerDocument, "mousemove", rt),
            lt(v.wrapper.ownerDocument, "mouseup", g),
            c.history.lastSelOrigin = null
        }
        var v = i.display, c = i.doc, a, l, p, y, k, d, nt, w, rt, g;
        ft(e),
        p = c.sel,
        y = p.ranges,
        h.addNew && !h.extend ? (l = c.sel.contains(s),
        a = l > -1 ? y[l] : new o(s,s)) : (a = c.sel.primary(),
        l = c.sel.primIndex),
        h.unit == "rectangle" ? (h.addNew || (a = new o(s,s)),
        s = wr(i, e, !0, !0),
        l = -1) : (k = cb(i, s, h.unit),
        a = h.extend ? cl(a, k.anchor, k.head, h.extend) : k),
        h.addNew ? l == -1 ? (l = y.length,
        tt(c, dt(y.concat([a]), l), {
            scroll: !1,
            origin: "*mouse"
        })) : y.length > 1 && y[l].empty() && h.unit == "char" && !h.extend ? (tt(c, dt(y.slice(0, l).concat(y.slice(l + 1)), 0), {
            scroll: !1,
            origin: "*mouse"
        }),
        p = c.sel) : ll(c, l, a, bs) : (l = 0,
        tt(c, new ht([a],0), bs),
        p = c.sel),
        d = s,
        nt = v.wrapper.getBoundingClientRect(),
        w = 0,
        rt = b(i, function(n) {
            n.buttons !== 0 && rv(n) ? it(n) : ut(n)
        }),
        g = b(i, ut),
        i.state.selectingText = g,
        r(v.wrapper.ownerDocument, "mousemove", rt),
        r(v.wrapper.ownerDocument, "mouseup", g)
    }
    function tit(i, r) {
        var f = r.anchor, e = r.head, d = t(i.doc, f.line), s, a, h, c, l, v, y;
        if (u(f, e) == 0 && f.sticky == e.sticky || (s = si(d),
        !s) || (a = vf(s, f.ch, f.sticky),
        h = s[a],
        h.from != f.ch && h.to != f.ch) || (c = a + (h.from == f.ch == (h.level != 1) ? 0 : 1),
        c == 0 || c == s.length))
            return r;
        e.line != f.line ? l = (e.line - f.line) * (i.doc.direction == "ltr" ? 1 : -1) > 0 : (v = vf(s, e.ch, e.sticky),
        y = v - a || (e.ch - f.ch) * (h.level == 1 ? -1 : 1),
        l = v == c - 1 || v == c ? y < 0 : y > 0);
        var p = s[c + (l ? -1 : 0)]
          , w = l == (p.level == 1)
          , b = w ? p.from : p.to
          , k = w ? "after" : "before";
        return f.ch == b && f.sticky == k ? r : new o(new n(f.line,b,k),e)
    }
    function lb(n, t, i, r) {
        var e, u, o, s, f, h, c, l;
        if (t.touches)
            e = t.touches[0].clientX,
            u = t.touches[0].clientY;
        else
            try {
                e = t.clientX,
                u = t.clientY
            } catch (t) {
                return !1
            }
        if (e >= Math.floor(n.display.gutters.getBoundingClientRect().right))
            return !1;
        if (r && ft(t),
        o = n.display,
        s = o.lineDiv.getBoundingClientRect(),
        u > s.bottom || !vt(n, i))
            return vh(t);
        for (u -= s.top - o.viewOffset,
        f = 0; f < n.options.gutters.length; ++f)
            if (h = o.gutters.childNodes[f],
            h && h.getBoundingClientRect().right >= e)
                return c = er(n.doc, u),
                l = n.options.gutters[f],
                p(n, i, n, c, l, t),
                vh(t)
    }
    function dl(n, t) {
        return lb(n, t, "gutterClick", !0)
    }
    function ab(n, t) {
        if (!hi(n.display, t) && !iit(n, t) && !w(n, t, "contextmenu"))
            n.display.input.onContextMenu(t)
    }
    function iit(n, t) {
        return vt(n, "gutterContextMenu") ? lb(n, t, "gutterContextMenu", !1) : !1
    }
    function vb(n) {
        n.display.wrapper.className = n.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") + n.options.theme.replace(/(^|\s)\s*/g, " cm-s-"),
        df(n)
    }
    function rit(t) {
        function i(n, i, u, f) {
            t.defaults[n] = i,
            u && (r[n] = f ? function(n, t, i) {
                i != tf && u(n, t, i)
            }
            : u)
        }
        var r = t.optionHandlers;
        t.defineOption = i,
        t.Init = tf,
        i("value", "", function(n, t) {
            return n.setValue(t)
        }, !0),
        i("mode", null, function(n, t) {
            n.doc.modeOption = t,
            ol(n)
        }, !0),
        i("indentUnit", 2, ol, !0),
        i("indentWithTabs", !1),
        i("smartIndent", !0),
        i("tabSize", 4, function(n) {
            se(n),
            df(n),
            et(n)
        }, !0),
        i("lineSeparator", null, function(t, i) {
            var r, f, u;
            if (t.doc.lineSep = i,
            i)
                for (r = [],
                f = t.doc.first,
                t.doc.iter(function(t) {
                    for (var u, e = 0; ; ) {
                        if (u = t.text.indexOf(i, e),
                        u == -1)
                            break;
                        e = u + i.length,
                        r.push(n(f, u))
                    }
                    f++
                }),
                u = r.length - 1; u >= 0; u--)
                    vu(t.doc, i, r[u], n(r[u].line, r[u].ch + i.length))
        }),
        i("specialChars", /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff]/g, function(n, t, i) {
            n.state.specialChars = new RegExp(t.source + (t.test("\t") ? "" : "|\t"),"g"),
            i != tf && n.refresh()
        }),
        i("specialCharPlaceholder", ad, function(n) {
            return n.refresh()
        }, !0),
        i("electricChars", !0),
        i("inputStyle", ef ? "contenteditable" : "textarea", function() {
            throw new Error("inputStyle can not (yet) be changed in a running editor");
        }, !0),
        i("spellcheck", !1, function(n, t) {
            return n.getInputField().spellcheck = t
        }, !0),
        i("rtlMoveVisually", !ek),
        i("wholeLineUpdateBefore", !0),
        i("theme", "default", function(n) {
            vb(n),
            be(n)
        }, !0),
        i("keyMap", "default", function(n, t, i) {
            var u = es(t)
              , r = i != tf && es(i);
            r && r.detach && r.detach(n, u),
            u.attach && u.attach(n, r || null)
        }),
        i("extraKeys", null),
        i("configureMouse", null),
        i("lineWrapping", !1, fit, !0),
        i("gutters", [], function(n) {
            fl(n.options),
            be(n)
        }, !0),
        i("fixedGutter", !0, function(n, t) {
            n.display.gutters.style.left = t ? yc(n.display) + "px" : "0",
            n.refresh()
        }, !0),
        i("coverGutterNextToScrollbar", !1, function(n) {
            return hu(n)
        }, !0),
        i("scrollbarStyle", "native", function(n) {
            up(n),
            hu(n),
            n.display.scrollbars.setScrollTop(n.doc.scrollTop),
            n.display.scrollbars.setScrollLeft(n.doc.scrollLeft)
        }, !0),
        i("lineNumbers", !1, function(n) {
            fl(n.options),
            be(n)
        }, !0),
        i("firstLineNumber", 1, be, !0),
        i("lineNumberFormatter", function(n) {
            return n
        }, be, !0),
        i("showCursorWhenSelecting", !1, ne, !0),
        i("resetSelectionOnContextMenu", !0),
        i("lineWiseCopyCut", !0),
        i("pasteLinesPerSelection", !0),
        i("readOnly", !1, function(n, t) {
            t == "nocursor" && (te(n),
            n.display.input.blur()),
            n.display.input.readOnlyChanged(t)
        }),
        i("disableInput", !1, function(n, t) {
            t || n.display.input.reset()
        }, !0),
        i("dragDrop", !0, uit),
        i("allowDropFileTypes", null),
        i("cursorBlinkRate", 530),
        i("cursorScrollMargin", 0),
        i("cursorHeight", 1, ne, !0),
        i("singleCursorHeightPerLine", !0, ne, !0),
        i("workTime", 100),
        i("workDelay", 100),
        i("flattenSpans", !0, se, !0),
        i("addModeClass", !1, se, !0),
        i("pollInterval", 100),
        i("undoDepth", 200, function(n, t) {
            return n.doc.history.undoDepth = t
        }),
        i("historyEventDelay", 1250),
        i("viewportMargin", 10, function(n) {
            return n.refresh()
        }, !0),
        i("maxHighlightLength", 1e4, se, !0),
        i("moveInputWithCursor", !0, function(n, t) {
            t || n.display.input.resetPosition()
        }),
        i("tabindex", null, function(n, t) {
            return n.display.input.getField().tabIndex = t || ""
        }),
        i("autofocus", null),
        i("direction", "ltr", function(n, t) {
            return n.doc.setDirection(t)
        }, !0)
    }
    function be(n) {
        sp(n),
        et(n),
        gy(n)
    }
    function uit(n, t, i) {
        var e = i && i != tf, u, f;
        !t != !e && (u = n.display.dragFunctions,
        f = t ? r : lt,
        f(n.display.scroller, "dragstart", u.start),
        f(n.display.scroller, "dragenter", u.enter),
        f(n.display.scroller, "dragover", u.over),
        f(n.display.scroller, "dragleave", u.leave),
        f(n.display.scroller, "drop", u.drop))
    }
    function fit(n) {
        n.options.lineWrapping ? (rr(n.display.wrapper, "CodeMirror-wrap"),
        n.display.sizer.style.minWidth = "",
        n.display.sizerWidth = null) : (vi(n.display.wrapper, "CodeMirror-wrap"),
        ch(n)),
        pc(n),
        et(n),
        df(n),
        setTimeout(function() {
            return hu(n)
        }, 100)
    }
    function a(n, t) {
        var o = this, i, s, r, u, f;
        if (!(this instanceof a))
            return new a(n,t);
        this.options = t = t ? ur(t) : {},
        ur(yb, t, !1),
        fl(t),
        i = t.value,
        typeof i == "string" && (i = new ut(i,t.mode,null,t.lineSeparator,t.direction)),
        this.doc = i,
        s = new a.inputStyles[t.inputStyle](this),
        r = this.display = new sk(n,i,s),
        r.wrapper.CodeMirror = this,
        sp(this),
        vb(this),
        t.lineWrapping && (this.display.wrapper.className += " CodeMirror-wrap"),
        up(this),
        this.state = {
            keyMaps: [],
            overlays: [],
            modeGen: 0,
            overwrite: !1,
            delayingBlurEvent: !1,
            focused: !1,
            suppressEdits: !1,
            pasteIncoming: !1,
            cutIncoming: !1,
            selectingText: !1,
            draggingText: !1,
            highlight: new wi,
            keySeq: null,
            specialChars: null
        },
        t.autofocus && !ef && r.input.focus(),
        e && l < 11 && setTimeout(function() {
            return o.display.input.reset(!0)
        }, 20),
        eit(this),
        ett(),
        dr(this),
        this.curOp.forceUpdate = !0,
        yp(this, i),
        t.autofocus && !ef || this.hasFocus() ? setTimeout(ws(bc, this), 20) : te(this);
        for (u in cs)
            cs.hasOwnProperty(u) && cs[u](o, t[u], tf);
        for (np(this),
        t.finishInit && t.finishInit(this),
        f = 0; f < ls.length; ++f)
            ls[f](o);
        gr(this),
        nt && t.lineWrapping && getComputedStyle(r.lineDiv).textRendering == "optimizelegibility" && (r.lineDiv.style.textRendering = "auto")
    }
    function eit(t) {
        function c() {
            i.activeTouch && (h = setTimeout(function() {
                return i.activeTouch = null
            }, 1e3),
            s = i.activeTouch,
            s.end = +new Date)
        }
        function v(n) {
            if (n.touches.length != 1)
                return !1;
            var t = n.touches[0];
            return t.radiusX <= 1 && t.radiusY <= 1
        }
        function a(n, t) {
            if (t.left == null)
                return !0;
            var i = t.left - n.left
              , r = t.top - n.top;
            return i * i + r * r > 400
        }
        var i = t.display, h, s, u;
        r(i.scroller, "mousedown", b(t, hb)),
        e && l < 11 ? r(i.scroller, "dblclick", b(t, function(n) {
            var i, r;
            w(t, n) || (i = wr(t, n),
            !i || dl(t, n) || hi(t.display, n)) || (ft(n),
            r = t.findWordAt(i),
            rs(t.doc, r.anchor, r.head))
        })) : r(i.scroller, "dblclick", function(n) {
            return w(t, n) || ft(n)
        }),
        to || r(i.scroller, "contextmenu", function(n) {
            return ab(t, n)
        }),
        s = {
            end: 0
        },
        r(i.scroller, "touchstart", function(n) {
            if (!w(t, n) && !v(n) && !dl(t, n)) {
                i.input.ensurePolled(),
                clearTimeout(h);
                var r = +new Date;
                i.activeTouch = {
                    start: r,
                    moved: !1,
                    prev: r - s.end <= 300 ? s : null
                },
                n.touches.length == 1 && (i.activeTouch.left = n.touches[0].pageX,
                i.activeTouch.top = n.touches[0].pageY)
            }
        }),
        r(i.scroller, "touchmove", function() {
            i.activeTouch && (i.activeTouch.moved = !0)
        }),
        r(i.scroller, "touchend", function(r) {
            var u = i.activeTouch, e, s;
            u && !hi(i, r) && u.left != null && !u.moved && new Date - u.start < 300 && (e = t.coordsChar(i.activeTouch, "page"),
            s = !u.prev || a(u, u.prev) ? new o(e,e) : !u.prev.prev || a(u, u.prev.prev) ? t.findWordAt(e) : new o(n(e.line, 0),f(t.doc, n(e.line + 1, 0))),
            t.setSelection(s.anchor, s.head),
            t.focus(),
            ft(r)),
            c()
        }),
        r(i.scroller, "touchcancel", c),
        r(i.scroller, "scroll", function() {
            i.scroller.clientHeight && (re(t, i.scroller.scrollTop),
            kr(t, i.scroller.scrollLeft, !0),
            p(t, "scroll", t))
        }),
        r(i.scroller, "mousewheel", function(n) {
            return cp(t, n)
        }),
        r(i.scroller, "DOMMouseScroll", function(n) {
            return cp(t, n)
        }),
        r(i.wrapper, "scroll", function() {
            return i.wrapper.scrollTop = i.wrapper.scrollLeft = 0
        }),
        i.dragFunctions = {
            enter: function(n) {
                w(t, n) || yf(n)
            },
            over: function(n) {
                w(t, n) || (ftt(t, n),
                yf(n))
            },
            start: function(n) {
                return utt(t, n)
            },
            drop: b(t, rtt),
            leave: function(n) {
                w(t, n) || ww(t)
            }
        },
        u = i.input.getField(),
        r(u, "keyup", function(n) {
            return eb.call(t, n)
        }),
        r(u, "keydown", b(t, fb)),
        r(u, "keypress", b(t, ob)),
        r(u, "focus", function(n) {
            return bc(t, n)
        }),
        r(u, "blur", function(n) {
            return te(t, n)
        })
    }
    function ke(i, r, u, f) {
        var s = i.doc, d, c, e, l, y, w, a, b, k;
        u == null && (u = "add"),
        u == "smart" && (s.mode.indent ? d = wf(i, r).state : u = "prev");
        var v = i.options.tabSize
          , h = t(s, r)
          , p = at(h.text, null, v);
        if (h.stateAfter && (h.stateAfter = null),
        c = h.text.match(/^\s*/)[0],
        f || /\S/.test(h.text)) {
            if (u == "smart" && (e = s.mode.indent(d, h.text.slice(c.length), h.text),
            e == io || e > 150)) {
                if (!f)
                    return;
                u = "prev"
            }
        } else
            e = 0,
            u = "not";
        if (u == "prev" ? e = r > s.first ? at(t(s, r - 1).text, null, v) : 0 : u == "add" ? e = p + i.options.indentUnit : u == "subtract" ? e = p - i.options.indentUnit : typeof u == "number" && (e = p + u),
        e = Math.max(0, e),
        l = "",
        y = 0,
        i.options.indentWithTabs)
            for (w = Math.floor(e / v); w; --w)
                y += v,
                l += "\t";
        if (y < e && (l += ds(e - y)),
        l != c)
            return vu(s, l, n(r, 0), n(r, c.length), "+input"),
            h.stateAfter = null,
            !0;
        for (a = 0; a < s.sel.ranges.length; a++)
            if (b = s.sel.ranges[a],
            b.head.line == r && b.head.ch < c.length) {
                k = n(r, c.length),
                ll(s, a, new o(k,k));
                break
            }
    }
    function as(n) {
        yt = n
    }
    function gl(i, r, u, f, e) {
        var p = i.doc, y, k, l, b;
        i.display.shift = !1,
        f || (f = p.sel);
        var a = i.state.pasteIncoming || e == "paste"
          , v = bh(r)
          , o = null;
        if (a && f.ranges.length > 1)
            if (yt && yt.text.join("\n") == r) {
                if (f.ranges.length % yt.text.length == 0)
                    for (o = [],
                    y = 0; y < yt.text.length; y++)
                        o.push(p.splitLines(yt.text[y]))
            } else
                v.length == f.ranges.length && i.options.pasteLinesPerSelection && (o = ro(v, function(n) {
                    return [n]
                }));
        for (l = f.ranges.length - 1; l >= 0; l--) {
            var w = f.ranges[l]
              , h = w.from()
              , c = w.to();
            w.empty() && (u && u > 0 ? h = n(h.line, h.ch - u) : i.state.overwrite && !a ? c = n(c.line, Math.min(t(p, c.line).text.length, c.ch + s(v).length)) : yt && yt.lineWise && yt.text.join("\n") == r && (h = c = n(h.line, 0))),
            k = i.curOp.updateInput,
            b = {
                from: h,
                to: c,
                text: o ? o[l % o.length] : v,
                origin: e || (a ? "paste" : i.state.cutIncoming ? "cut" : "+input")
            },
            au(i.doc, b),
            g(i, "inputRead", i, b)
        }
        r && !a && wb(i, r),
        ou(i),
        i.curOp.updateInput = k,
        i.curOp.typing = !0,
        i.state.pasteIncoming = i.state.cutIncoming = !1
    }
    function pb(n, t) {
        var i = n.clipboardData && n.clipboardData.getData("Text");
        if (i)
            return n.preventDefault(),
            t.isReadOnly() || t.options.disableInput || ot(t, function() {
                return gl(t, i, 0, null, "paste")
            }),
            !0
    }
    function wb(n, i) {
        var e, u, r, f, o, s;
        if (n.options.electricChars && n.options.smartIndent)
            for (e = n.doc.sel,
            u = e.ranges.length - 1; u >= 0; u--)
                if (r = e.ranges[u],
                !(r.head.ch > 100) && (!u || e.ranges[u - 1].head.line != r.head.line)) {
                    if (f = n.getModeAt(r.head),
                    o = !1,
                    f.electricChars) {
                        for (s = 0; s < f.electricChars.length; s++)
                            if (i.indexOf(f.electricChars.charAt(s)) > -1) {
                                o = ke(n, r.head.line, "smart");
                                break
                            }
                    } else
                        f.electricInput && f.electricInput.test(t(n.doc, r.head.line).text.slice(0, r.head.ch)) && (o = ke(n, r.head.line, "smart"));
                    o && g(n, "electricInput", n, r.head.line)
                }
    }
    function bb(t) {
        for (var f = [], e = [], u, r, i = 0; i < t.doc.sel.ranges.length; i++)
            u = t.doc.sel.ranges[i].head.line,
            r = {
                anchor: n(u, 0),
                head: n(u + 1, 0)
            },
            e.push(r),
            f.push(t.getRange(r.anchor, r.head));
        return {
            text: f,
            ranges: e
        }
    }
    function kb(n, t) {
        n.setAttribute("autocorrect", "off"),
        n.setAttribute("autocapitalize", "off"),
        n.setAttribute("spellcheck", !!t)
    }
    function db() {
        var n = i("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none")
          , t = i("div", [n], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
        return nt ? n.style.width = "1000px" : n.setAttribute("wrap", "off"),
        ff && (n.style.border = "1px solid black"),
        kb(n),
        t
    }
    function oit(i) {
        var u = i.optionHandlers
          , r = i.helpers = {};
        i.prototype = {
            constructor: i,
            focus: function() {
                window.focus(),
                this.display.input.focus()
            },
            setOption: function(n, t) {
                var i = this.options
                  , r = i[n];
                (i[n] != t || n == "mode") && (i[n] = t,
                u.hasOwnProperty(n) && b(this, u[n])(this, t, r),
                p(this, "optionChange", this, n))
            },
            getOption: function(n) {
                return this.options[n]
            },
            getDoc: function() {
                return this.doc
            },
            addKeyMap: function(n, t) {
                this.state.keyMaps[t ? "push" : "unshift"](es(n))
            },
            removeKeyMap: function(n) {
                for (var i = this.state.keyMaps, t = 0; t < i.length; ++t)
                    if (i[t] == n || i[t].name == n)
                        return i.splice(t, 1),
                        !0
            },
            addOverlay: rt(function(n, t) {
                var r = n.token ? n : i.getMode(this.options, n);
                if (r.startState)
                    throw new Error("Overlays may not be stateful.");
                ok(this.state.overlays, {
                    mode: r,
                    modeSpec: n,
                    opaque: t && t.opaque,
                    priority: t && t.priority || 0
                }, function(n) {
                    return n.priority
                }),
                this.state.modeGen++,
                et(this)
            }),
            removeOverlay: rt(function(n) {
                for (var u = this, i = this.state.overlays, r, t = 0; t < i.length; ++t)
                    if (r = i[t].modeSpec,
                    r == n || typeof n == "string" && r.name == n) {
                        i.splice(t, 1),
                        u.state.modeGen++,
                        et(u);
                        return
                    }
            }),
            indentLine: rt(function(n, t, i) {
                typeof t != "string" && typeof t != "number" && (t = t == null ? this.options.smartIndent ? "smart" : "prev" : t ? "add" : "subtract"),
                lf(this.doc, n) && ke(this, n, t, i)
            }),
            indentSelection: rt(function(n) {
                for (var i = this, s = this.doc.sel.ranges, u = -1, r, f, e, t = 0; t < s.length; t++)
                    if (r = s[t],
                    r.empty())
                        r.head.line > u && (ke(i, r.head.line, n, !0),
                        u = r.head.line,
                        t == i.doc.sel.primIndex && ou(i));
                    else {
                        var h = r.from()
                          , c = r.to()
                          , l = Math.max(u, h.line);
                        for (u = Math.min(i.lastLine(), c.line - (c.ch ? 0 : 1)) + 1,
                        f = l; f < u; ++f)
                            ke(i, f, n);
                        e = i.doc.sel.ranges,
                        h.ch == 0 && s.length == e.length && e[t].from().ch > 0 && ll(i.doc, t, new o(h,e[t].to()), gt)
                    }
            }),
            getTokenAt: function(n, t) {
                return hv(this, n, t)
            },
            getLineTokens: function(t, i) {
                return hv(this, n(t), i, !0)
            },
            getTokenTypeAt: function(n) {
                var i, e;
                n = f(this.doc, n);
                var u = ov(this, t(this.doc, n.line)), s = 0, h = (u.length - 1) / 2, o = n.ch, r;
                if (o == 0)
                    r = u[2];
                else
                    for (; ; )
                        if (i = s + h >> 1,
                        (i ? u[i * 2 - 1] : 0) >= o)
                            h = i;
                        else if (u[i * 2 + 1] < o)
                            s = i + 1;
                        else {
                            r = u[i * 2 + 2];
                            break
                        }
                return e = r ? r.indexOf("overlay ") : -1,
                e < 0 ? r : e == 0 ? null : r.slice(0, e - 1)
            },
            getModeAt: function(n) {
                var t = this.doc.mode;
                return t.innerMode ? i.innerMode(t, this.getTokenAt(n).state).mode : t
            },
            getHelper: function(n, t) {
                return this.getHelpers(n, t)[0]
            },
            getHelpers: function(n, t) {
                var c = this, f = [], u, i, e, h, o, s;
                if (!r.hasOwnProperty(t))
                    return f;
                if (u = r[t],
                i = this.getModeAt(n),
                typeof i[t] == "string")
                    u[i[t]] && f.push(u[i[t]]);
                else if (i[t])
                    for (e = 0; e < i[t].length; e++)
                        h = u[i[t][e]],
                        h && f.push(h);
                else
                    i.helperType && u[i.helperType] ? f.push(u[i.helperType]) : u[i.name] && f.push(u[i.name]);
                for (o = 0; o < u._global.length; o++)
                    s = u._global[o],
                    s.pred(i, c) && d(f, s.val) == -1 && f.push(s.val);
                return f
            },
            getStateAfter: function(n, t) {
                var i = this.doc;
                return n = aa(i, n == null ? i.first + i.size - 1 : n),
                wf(this, n + 1, t).state
            },
            cursorCoords: function(n, t) {
                var i, r = this.doc.sel.primary();
                return i = n == null ? r.head : typeof n == "object" ? f(this.doc, n) : n ? r.from() : r.to(),
                kt(this, i, t || "page")
            },
            charCoords: function(n, t) {
                return hc(this, f(this.doc, n), t || "page")
            },
            coordsChar: function(n, t) {
                return n = cy(this, n, t || "page"),
                lc(this, n.left, n.top)
            },
            lineAtHeight: function(n, t) {
                return n = cy(this, {
                    top: n,
                    left: 0
                }, t || "page").top,
                er(this.doc, n + this.display.viewOffset)
            },
            heightAtLine: function(n, i, r) {
                var f = !1, u, e;
                return typeof n == "number" ? (e = this.doc.first + this.doc.size - 1,
                n < this.doc.first ? n = this.doc.first : n > e && (n = e,
                f = !0),
                u = t(this.doc, n)) : u = n,
                wo(this, u, {
                    top: 0,
                    left: 0
                }, i || "page", r || f).top + (f ? this.doc.height - oi(u) : 0)
            },
            defaultTextHeight: function() {
                return pr(this.display)
            },
            defaultCharWidth: function() {
                return gf(this.display)
            },
            getViewport: function() {
                return {
                    from: this.display.viewFrom,
                    to: this.display.viewTo
                }
            },
            addWidget: function(n, t, i, r, u) {
                var s = this.display, o, e, h, c;
                n = kt(this, f(this.doc, n)),
                o = n.bottom,
                e = n.left,
                t.style.position = "absolute",
                t.setAttribute("cm-ignore-events", "true"),
                this.display.input.setUneditable(t),
                s.sizer.appendChild(t),
                r == "over" ? o = n.top : (r == "above" || r == "near") && (h = Math.max(s.wrapper.clientHeight, this.doc.height),
                c = Math.max(s.sizer.clientWidth, s.lineSpace.clientWidth),
                (r == "above" || n.bottom + t.offsetHeight > h) && n.top > t.offsetHeight ? o = n.top - t.offsetHeight : n.bottom + t.offsetHeight <= h && (o = n.bottom),
                e + t.offsetWidth > c && (e = c - t.offsetWidth)),
                t.style.top = o + "px",
                t.style.left = t.style.right = "",
                u == "right" ? (e = s.sizer.clientWidth - t.offsetWidth,
                t.style.right = "0px") : (u == "left" ? e = 0 : u == "middle" && (e = (s.sizer.clientWidth - t.offsetWidth) / 2),
                t.style.left = e + "px"),
                i && wg(this, {
                    left: e,
                    top: o,
                    right: e + t.offsetWidth,
                    bottom: o + t.offsetHeight
                })
            },
            triggerOnKeyDown: rt(fb),
            triggerOnKeyPress: rt(ob),
            triggerOnKeyUp: eb,
            triggerOnMouseDown: rt(hb),
            execCommand: function(n) {
                if (nf.hasOwnProperty(n))
                    return nf[n].call(null, this)
            },
            triggerElectric: rt(function(n) {
                wb(this, n)
            }),
            findPosH: function(n, t, i, r) {
                var s = this, o = 1, u, e;
                for (t < 0 && (o = -1,
                t = -t),
                u = f(this.doc, n),
                e = 0; e < t; ++e)
                    if (u = na(s.doc, u, o, i, r),
                    u.hitSide)
                        break;
                return u
            },
            moveH: rt(function(n, t) {
                var i = this;
                this.extendSelectionsBy(function(r) {
                    return i.display.shift || i.doc.extend || r.empty() ? na(i.doc, r.head, n, t, i.options.rtlMoveVisually) : n < 0 ? r.from() : r.to()
                }, sf)
            }),
            deleteH: rt(function(n, t) {
                var r = this.doc.sel
                  , i = this.doc;
                r.somethingSelected() ? i.replaceSelection("", null, "+delete") : gu(this, function(r) {
                    var u = na(i, r.head, n, t, !1);
                    return n < 0 ? {
                        from: u,
                        to: r.head
                    } : {
                        from: r.head,
                        to: u
                    }
                })
            }),
            findPosV: function(n, t, i, r) {
                var h = this, c = 1, o = r, u, s, e;
                for (t < 0 && (c = -1,
                t = -t),
                u = f(this.doc, n),
                s = 0; s < t; ++s)
                    if (e = kt(h, u, "div"),
                    o == null ? o = e.left : e.left = o,
                    u = gb(h, e, c, i),
                    u.hitSide)
                        break;
                return u
            },
            moveV: rt(function(n, t) {
                var u = this, i = this.doc, f = [], e = !this.display.shift && !i.extend && i.sel.somethingSelected(), r;
                if (i.extendSelectionsBy(function(r) {
                    var o, s;
                    return e ? n < 0 ? r.from() : r.to() : (o = kt(u, r.head, "div"),
                    r.goalColumn != null && (o.left = r.goalColumn),
                    f.push(o.left),
                    s = gb(u, o, n, t),
                    t == "page" && r == i.sel.primary() && gc(u, hc(u, s, "div").top - o.top),
                    s)
                }, sf),
                f.length)
                    for (r = 0; r < i.sel.ranges.length; r++)
                        i.sel.ranges[r].goalColumn = f[r]
            }),
            findWordAt: function(i) {
                var c = this.doc, u = t(c, i.line).text, r = i.ch, f = i.ch, e, s, h;
                if (u) {
                    for (e = this.getHelper(i, "wordChars"),
                    (i.sticky == "before" || f == u.length) && r ? --r : ++f,
                    s = u.charAt(r),
                    h = uo(s, e) ? function(n) {
                        return uo(n, e)
                    }
                    : /\s/.test(s) ? function(n) {
                        return /\s/.test(n)
                    }
                    : function(n) {
                        return !/\s/.test(n) && !uo(n)
                    }
                    ; r > 0 && h(u.charAt(r - 1)); )
                        --r;
                    while (f < u.length && h(u.charAt(f)))
                        ++f
                }
                return new o(n(i.line, r),n(i.line, f))
            },
            toggleOverwrite: function(n) {
                (n == null || n != this.state.overwrite) && ((this.state.overwrite = !this.state.overwrite) ? rr(this.display.cursorDiv, "CodeMirror-overwrite") : vi(this.display.cursorDiv, "CodeMirror-overwrite"),
                p(this, "overwriteToggle", this, this.state.overwrite))
            },
            hasFocus: function() {
                return this.display.input.getField() == ei()
            },
            isReadOnly: function() {
                return !!(this.options.readOnly || this.doc.cantEdit)
            },
            scrollTo: rt(function(n, t) {
                ie(this, n, t)
            }),
            getScrollInfo: function() {
                var n = this.display.scroller;
                return {
                    left: n.scrollLeft,
                    top: n.scrollTop,
                    height: n.scrollHeight - ri(this) - this.display.barHeight,
                    width: n.scrollWidth - ri(this) - this.display.barWidth,
                    clientHeight: fc(this),
                    clientWidth: vr(this)
                }
            },
            scrollIntoView: rt(function(t, i) {
                t == null ? (t = {
                    from: this.doc.sel.primary().head,
                    to: null
                },
                i == null && (i = this.options.cursorScrollMargin)) : typeof t == "number" ? t = {
                    from: n(t, 0),
                    to: null
                } : t.from == null && (t = {
                    from: t,
                    to: null
                }),
                t.to || (t.to = t.from),
                t.margin = i || 0,
                t.from.line != null ? bg(this, t) : tp(this, t.from, t.to, t.margin)
            }),
            setSize: rt(function(n, t) {
                var u = this, r = function(n) {
                    return typeof n == "number" || /^\d+$/.test(String(n)) ? n + "px" : n
                }, i;
                n != null && (this.display.wrapper.style.width = r(n)),
                t != null && (this.display.wrapper.style.height = r(t)),
                this.options.lineWrapping && oy(this),
                i = this.display.viewFrom,
                this.doc.iter(i, this.display.viewTo, function(n) {
                    if (n.widgets)
                        for (var t = 0; t < n.widgets.length; t++)
                            if (n.widgets[t].noHScroll) {
                                ki(u, i, "widget");
                                break
                            }
                    ++i
                }),
                this.curOp.forceUpdate = !0,
                p(this, "refresh", this)
            }),
            operation: function(n) {
                return ot(this, n)
            },
            startOperation: function() {
                return dr(this)
            },
            endOperation: function() {
                return gr(this)
            },
            refresh: rt(function() {
                var n = this.display.cachedTextHeight;
                et(this),
                this.curOp.forceUpdate = !0,
                df(this),
                ie(this, this.doc.scrollLeft, this.doc.scrollTop),
                rl(this),
                (n == null || Math.abs(n - pr(this.display)) > .5) && pc(this),
                p(this, "refresh", this)
            }),
            swapDoc: rt(function(n) {
                var t = this.doc;
                return t.cm = null,
                yp(this, n),
                df(this),
                this.display.input.reset(),
                ie(this, n.scrollLeft, n.scrollTop),
                this.curOp.forceScroll = !0,
                g(this, "swapDoc", this, t),
                t
            }),
            getInputField: function() {
                return this.display.input.getField()
            },
            getWrapperElement: function() {
                return this.display.wrapper
            },
            getScrollerElement: function() {
                return this.display.scroller
            },
            getGutterElement: function() {
                return this.display.gutters
            }
        },
        uu(i),
        i.registerHelper = function(n, t, u) {
            r.hasOwnProperty(n) || (r[n] = i[n] = {
                _global: []
            }),
            r[n][t] = u
        }
        ,
        i.registerGlobalHelper = function(n, t, u, f) {
            i.registerHelper(n, t, f),
            r[n]._global.push({
                pred: u,
                val: f
            })
        }
    }
    function na(i, r, u, f, e) {
        function b() {
            var f = r.line + u;
            return f < i.first || f >= i.first + i.size ? !1 : (r = new n(f,r.ch,r.sticky),
            s = t(i, f))
        }
        function h(n) {
            var t;
            if (t = e ? ltt(i.cm, s, r, u) : bl(s, r, u),
            t == null)
                if (!n && b())
                    r = kl(e, i.cm, s, r.line, u);
                else
                    return !1;
            else
                r = t;
            return !0
        }
        var p = r, w = u, s = t(i, r.line), c, l, o, a;
        if (f == "char")
            h();
        else if (f == "column")
            h(!0);
        else if (f == "word" || f == "group") {
            var v = null
              , y = f == "group"
              , k = i.cm && i.cm.getHelper(r, "wordChars");
            for (c = !0; ; c = !1) {
                if (u < 0 && !h(!c))
                    break;
                if (l = s.text.charAt(r.ch) || "\n",
                o = uo(l, k) ? "w" : y && l == "\n" ? "n" : !y || /\s/.test(l) ? null : "p",
                !y || c || o || (o = "s"),
                v && v != o) {
                    u < 0 && (u = 1,
                    h(),
                    r.sticky = "after");
                    break
                }
                if (o && (v = o),
                u > 0 && !h(!c))
                    break
            }
        }
        return a = al(i, r, p, w, !0),
        rh(p, a) && (a.hitSide = !0),
        a
    }
    function gb(n, t, i, r) {
        var s = n.doc, h = t.left, u, e, o, f;
        for (r == "page" ? (e = Math.min(n.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight),
        o = Math.max(e - .5 * pr(n.display), 3),
        u = (i > 0 ? t.bottom : t.top) + i * o) : r == "line" && (u = i > 0 ? t.bottom + 3 : t.top - 3); ; ) {
            if (f = lc(n, h, u),
            !f.outside)
                break;
            if (i < 0 ? u <= 0 : u >= s.height) {
                f.hitSide = !0;
                break
            }
            u += i * 5
        }
        return f
    }
    function nk(n, i) {
        var u = ec(n, i.line), s, r;
        if (!u || u.hidden)
            return null;
        var f = t(n.doc, i.line)
          , h = ry(u, f, i.line)
          , e = si(f, n.doc.direction)
          , o = "left";
        return e && (s = vf(e, i.ch),
        o = s % 2 ? "right" : "left"),
        r = fy(h.map, i.ch, o),
        r.offset = r.collapse == "right" ? r.end : r.start,
        r
    }
    function sit(n) {
        for (var t = n; t; t = t.parentNode)
            if (/CodeMirror-gutter-wrapper/.test(t.className))
                return !0;
        return !1
    }
    function rf(n, t) {
        return t && (n.bad = !0),
        n
    }
    function hit(t, i, r, u, f) {
        function v(n) {
            return function(t) {
                return t.id == n
            }
        }
        function l() {
            s && (e += h,
            o && (e += h),
            s = o = !1)
        }
        function c(n) {
            n && (l(),
            e += n)
        }
        function a(i) {
            var e, y, p, w, b, r;
            if (i.nodeType == 1) {
                if (e = i.getAttribute("cm-text"),
                e) {
                    c(e);
                    return
                }
                if (y = i.getAttribute("cm-marker"),
                y) {
                    w = t.findMarks(n(u, 0), n(f + 1, 0), v(+y)),
                    w.length && (p = w[0].find(0)) && c(fr(t.doc, p.from, p.to).join(h));
                    return
                }
                if (i.getAttribute("contenteditable") == "false")
                    return;
                if (b = /^(pre|div|p|li|table|br)$/i.test(i.nodeName),
                !/^br$/i.test(i.nodeName) && i.textContent.length == 0)
                    return;
                for (b && l(),
                r = 0; r < i.childNodes.length; r++)
                    a(i.childNodes[r]);
                /^(pre|p)$/i.test(i.nodeName) && (o = !0),
                b && (s = !0)
            } else
                i.nodeType == 3 && c(i.nodeValue.replace(/\u200b/g, "").replace(/\u00a0/g, " "))
        }
        for (var e = "", s = !1, h = t.doc.lineSeparator(), o = !1; ; ) {
            if (a(i),
            i == r)
                break;
            i = i.nextSibling,
            o = !1
        }
        return e
    }
    function vs(t, i, r) {
        var u, f, e;
        if (i == t.display.lineDiv) {
            if (u = t.display.lineDiv.childNodes[r],
            !u)
                return rf(t.clipPos(n(t.display.viewTo - 1)), !0);
            i = null,
            r = 0
        } else
            for (u = i; ; u = u.parentNode) {
                if (!u || u == t.display.lineDiv)
                    return null;
                if (u.parentNode && u.parentNode == t.display.lineDiv)
                    break
            }
        for (f = 0; f < t.display.view.length; f++)
            if (e = t.display.view[f],
            e.node == u)
                return cit(e, i, r)
    }
    function cit(t, i, r) {
        function w(i, r, u) {
            for (var o, e, s, l, c, f = -1; f < (v ? v.length : 0); f++)
                for (o = f < 0 ? p.map : v[f],
                e = 0; e < o.length; e += 3)
                    if (s = o[e + 2],
                    s == i || s == r)
                        return l = h(f < 0 ? t.line : t.rest[f]),
                        c = o[e] + u,
                        (u < 0 || s != i) && (c = o[e + (u ? 1 : 0)]),
                        n(l, c)
        }
        var a = t.text.firstChild, l = !1, y, f, e, p, v, u, o, b, c, k;
        if (!i || !pi(a, i))
            return rf(n(h(t.line), 0), !0);
        if (i == a && (l = !0,
        i = a.childNodes[r],
        r = 0,
        !i))
            return y = t.rest ? s(t.rest) : t.line,
            rf(n(h(y), y.text.length), l);
        for (f = i.nodeType == 3 ? i : null,
        e = i,
        f || i.childNodes.length != 1 || i.firstChild.nodeType != 3 || (f = i.firstChild,
        r && (r = f.nodeValue.length)); e.parentNode != a; )
            e = e.parentNode;
        if (p = t.measure,
        v = p.maps,
        u = w(f, e, r),
        u)
            return rf(u, l);
        for (o = e.nextSibling,
        b = f ? f.nodeValue.length - r : 0; o; o = o.nextSibling) {
            if (u = w(o, o.firstChild, 0),
            u)
                return rf(n(u.line, u.ch - b), l);
            b += o.textContent.length
        }
        for (c = e.previousSibling,
        k = r; c; c = c.previousSibling) {
            if (u = w(c, c.firstChild, -1),
            u)
                return rf(n(u.line, u.ch + k), l);
            k += c.textContent.length
        }
    }
    function lit(n, t) {
        function u() {
            n.value = o.getValue()
        }
        var f, e, i, s, o;
        if (t = t ? ur(t) : {},
        t.value = n.value,
        !t.tabindex && n.tabIndex && (t.tabindex = n.tabIndex),
        !t.placeholder && n.placeholder && (t.placeholder = n.placeholder),
        t.autofocus == null && (f = ei(),
        t.autofocus = f == n || n.getAttribute("autofocus") != null && f == document.body),
        n.form && (r(n.form, "submit", u),
        !t.leaveSubmitMethodAlone)) {
            i = n.form,
            e = i.submit;
            try {
                s = i.submit = function() {
                    u(),
                    i.submit = e,
                    i.submit(),
                    i.submit = s
                }
            } catch (h) {}
        }
        return t.finishInit = function(t) {
            t.save = u,
            t.getTextArea = function() {
                return n
            }
            ,
            t.toTextArea = function() {
                t.toTextArea = isNaN,
                u(),
                n.parentNode.removeChild(t.getWrapperElement()),
                n.style.display = "",
                n.form && (lt(n.form, "submit", u),
                typeof n.form.submit == "function" && (n.form.submit = e))
            }
        }
        ,
        n.style.display = "none",
        o = a(function(t) {
            return n.parentNode.insertBefore(t, n.nextSibling)
        }, t)
    }
    function ait(t) {
        t.off = lt,
        t.on = r,
        t.wheelEventPixels = cn,
        t.Doc = ut,
        t.splitLines = bh,
        t.countColumn = at,
        t.findColumn = ks,
        t.isWordChar = gs,
        t.Pass = io,
        t.signal = p,
        t.Line = lr,
        t.changeEnd = nr,
        t.scrollbarModel = nl,
        t.Pos = n,
        t.cmpPos = u,
        t.modes = ao,
        t.mimeModes = sr,
        t.resolveMode = vo,
        t.getMode = dh,
        t.modeExtensions = hr,
        t.extendMode = od,
        t.copyState = cr,
        t.startState = fv,
        t.innerMode = gh,
        t.commands = nf,
        t.keyMap = fi,
        t.keyName = gw,
        t.isModifierKey = kw,
        t.lookupKey = du,
        t.normalizeKeyMap = ctt,
        t.StringStream = v,
        t.SharedTextMarker = wu,
        t.TextMarker = ci,
        t.LineWidget = yu,
        t.e_preventDefault = ft,
        t.e_stopPropagation = iv,
        t.e_stop = yf,
        t.addClass = rr,
        t.contains = pi,
        t.rmClass = vi,
        t.keyNames = li
    }
    var it = navigator.userAgent, ta = navigator.platform, ai = /gecko\/\d/i.test(it), ia = /MSIE \d/.test(it), ra = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(it), uf = /Edge\/(\d+)/.exec(it), e = ia || ra || uf, l = e && (ia ? document.documentMode || 6 : +(uf || ra)[1]), nt = !uf && /WebKit\//.test(it), ik = nt && /Qt\/\d+\.\d+/.test(it), ge = !uf && /Chrome\//.test(it), pt = /Opera\//.test(it), ua = /Apple Computer/.test(navigator.vendor), rk = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(it), uk = /PhantomJS/.test(it), ff = !uf && /AppleWebKit/.test(it) && /Mobile\/\w+/.test(it), no = /Android/.test(it), ef = ff || no || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(it), wt = ff || /Mac/.test(ta), fk = /\bCrOS\b/.test(it), ek = /win/i.test(ta), tr = pt && it.match(/Version\/(\d*\.\d*)/), ys, to, vi, ir, iu, wi, hf, sa, ca, fh, ti, ru, nv, lh, r, uv, ph, wh, ao, sr, hr, v, pf, bt, ic, lr, av, vv, ar, fu, oc, yr, bi, su, nl, fp, ee, oe, st, ht, o, yu, vl, ci, wu, pw, ut, yl, pl, li, bu, ve, ku, fi, nf, ib, ss, sb, hs, pe, we, ls, yt, c, y, tk, de;
    tr && (tr = Number(tr[1])),
    tr && tr >= 15 && (pt = !1,
    nt = !0),
    ys = wt && (ik || pt && (tr == null || tr < 12.11)),
    to = ai || e && l >= 9,
    vi = function(n, t) {
        var r = n.className, i = of(t).exec(r), u;
        i && (u = r.slice(i.index + i[0].length),
        n.className = r.slice(0, i.index) + (u ? i[1] + u : ""))
    }
    ,
    ir = document.createRange ? function(n, t, i, r) {
        var u = document.createRange();
        return u.setEnd(r || n, i),
        u.setStart(n, t),
        u
    }
    : function(n, t, i) {
        var r = document.body.createTextRange();
        try {
            r.moveToElementText(n.parentNode)
        } catch (u) {
            return r
        }
        return r.collapse(!0),
        r.moveEnd("character", i),
        r.moveStart("character", t),
        r
    }
    ,
    iu = function(n) {
        n.select()
    }
    ,
    ff ? iu = function(n) {
        n.selectionStart = 0,
        n.selectionEnd = n.value.length
    }
    : e && (iu = function(n) {
        try {
            n.select()
        } catch (t) {}
    }
    ),
    wi = function() {
        this.id = null
    }
    ,
    wi.prototype.set = function(n, t) {
        clearTimeout(this.id),
        this.id = setTimeout(t, n)
    }
    ;
    var fa = 30
      , io = {
        toString: function() {
            return "CodeMirror.Pass"
        }
    }
      , gt = {
        scroll: !1
    }
      , bs = {
        origin: "*mouse"
    }
      , sf = {
        origin: "+move"
    };
    hf = [""],
    sa = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/,
    ca = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/,
    fh = !1,
    ti = !1,
    ru = null,
    nv = function() {
        function o(n) {
            return n <= 247 ? f.charAt(n) : 1424 <= n && n <= 1524 ? "R" : 1536 <= n && n <= 1785 ? e.charAt(n - 1536) : 1774 <= n && n <= 2220 ? "r" : 8192 <= n && n <= 8203 ? "w" : n == 8204 ? "b" : "L"
        }
        function n(n, t, i) {
            this.level = n,
            this.from = t,
            this.to = i
        }
        var f = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN"
          , e = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111"
          , h = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/
          , t = /[stwN]/
          , i = /[LRr]/
          , r = /[Lb1n]/
          , u = /[1n]/;
        return function(f, e) {
            var tt = e == "ltr" ? "L" : "R", a, c, ot, ut, vt, yt, it, pt, ft, d, g, st, p, wt, w, kt, ht, et, bt, ct, b, k, lt, v, rt, l, gt, nt, at, y, ni;
            if (f.length == 0 || e == "ltr" && !h.test(f))
                return !1;
            for (a = f.length,
            c = [],
            ot = 0; ot < a; ++ot)
                c.push(o(f.charCodeAt(ot)));
            for (ut = 0,
            vt = tt; ut < a; ++ut)
                yt = c[ut],
                yt == "m" ? c[ut] = vt : vt = yt;
            for (it = 0,
            pt = tt; it < a; ++it)
                ft = c[it],
                ft == "1" && pt == "r" ? c[it] = "n" : i.test(ft) && (pt = ft,
                ft == "r" && (c[it] = "R"));
            for (d = 1,
            g = c[0]; d < a - 1; ++d)
                st = c[d],
                st == "+" && g == "1" && c[d + 1] == "1" ? c[d] = "1" : st == "," && g == c[d + 1] && (g == "1" || g == "n") && (c[d] = g),
                g = st;
            for (p = 0; p < a; ++p)
                if (wt = c[p],
                wt == ",")
                    c[p] = "N";
                else if (wt == "%") {
                    for (w = void 0,
                    w = p + 1; w < a && c[w] == "%"; ++w)
                        ;
                    for (kt = p && c[p - 1] == "!" || w < a && c[w] == "1" ? "1" : "N",
                    ht = p; ht < w; ++ht)
                        c[ht] = kt;
                    p = w - 1
                }
            for (et = 0,
            bt = tt; et < a; ++et)
                ct = c[et],
                bt == "L" && ct == "1" ? c[et] = "L" : i.test(ct) && (bt = ct);
            for (b = 0; b < a; ++b)
                if (t.test(c[b])) {
                    for (k = void 0,
                    k = b + 1; k < a && t.test(c[k]); ++k)
                        ;
                    var dt = (b ? c[b - 1] : tt) == "L"
                      , ti = (k < a ? c[k] : tt) == "L"
                      , ii = dt == ti ? dt ? "L" : "R" : tt;
                    for (lt = b; lt < k; ++lt)
                        c[lt] = ii;
                    b = k - 1
                }
            for (v = [],
            l = 0; l < a; )
                if (r.test(c[l])) {
                    for (gt = l,
                    ++l; l < a && r.test(c[l]); ++l)
                        ;
                    v.push(new n(0,gt,l))
                } else {
                    for (nt = l,
                    at = v.length,
                    ++l; l < a && c[l] != "L"; ++l)
                        ;
                    for (y = nt; y < l; )
                        if (u.test(c[y])) {
                            for (nt < y && v.splice(at, 0, new n(1,nt,y)),
                            ni = y,
                            ++y; y < l && u.test(c[y]); ++y)
                                ;
                            v.splice(at, 0, new n(2,ni,y)),
                            nt = y
                        } else
                            ++y;
                    nt < l && v.splice(at, 0, new n(1,nt,l))
                }
            return e == "ltr" && (v[0].level == 1 && (rt = f.match(/^\s+/)) && (v[0].from = rt[0].length,
            v.unshift(new n(0,0,rt[0].length))),
            s(v).level == 1 && (rt = f.match(/\s+$/)) && (s(v).to -= rt[0].length,
            v.push(new n(0,a - rt[0].length,a)))),
            e == "rtl" ? v.reverse() : v
        }
    }(),
    lh = [],
    r = function(n, t, i) {
        if (n.addEventListener)
            n.addEventListener(t, i, !1);
        else if (n.attachEvent)
            n.attachEvent("on" + t, i);
        else {
            var r = n._handlers || (n._handlers = {});
            r[t] = (r[t] || lh).concat(i)
        }
    }
    ,
    uv = function() {
        if (e && l < 9)
            return !1;
        var n = i("div");
        return "draggable"in n || "dragDrop"in n
    }();
    var bh = "\n\nb".split(/\n/).length != 3 ? function(n) {
        for (var i = 0, f = [], e = n.length, t, r, u; i <= e; )
            t = n.indexOf("\n", i),
            t == -1 && (t = n.length),
            r = n.slice(i, n.charAt(t - 1) == "\r" ? t - 1 : t),
            u = r.indexOf("\r"),
            u != -1 ? (f.push(r.slice(0, u)),
            i += u + 1) : (f.push(r),
            i = t + 1);
        return f
    }
    : function(n) {
        return n.split(/\r\n?|\n/)
    }
      , id = window.getSelection ? function(n) {
        try {
            return n.selectionStart != n.selectionEnd
        } catch (t) {
            return !1
        }
    }
    : function(n) {
        var t;
        try {
            t = n.ownerDocument.selection.createRange()
        } catch (i) {}
        return !t || t.parentElement() != n ? !1 : t.compareEndPoints("StartToEnd", t) != 0
    }
      , rd = function() {
        var n = i("div");
        return "oncopy"in n ? !0 : (n.setAttribute("oncopy", "return;"),
        typeof n.oncopy == "function")
    }()
      , kh = null;
    for (ao = {},
    sr = {},
    hr = {},
    v = function(n, t, i) {
        this.pos = this.start = 0,
        this.string = n,
        this.tabSize = t || 8,
        this.lastColumnPos = this.lastColumnValue = 0,
        this.lineStart = 0,
        this.lineOracle = i
    }
    ,
    v.prototype.eol = function() {
        return this.pos >= this.string.length
    }
    ,
    v.prototype.sol = function() {
        return this.pos == this.lineStart
    }
    ,
    v.prototype.peek = function() {
        return this.string.charAt(this.pos) || undefined
    }
    ,
    v.prototype.next = function() {
        if (this.pos < this.string.length)
            return this.string.charAt(this.pos++)
    }
    ,
    v.prototype.eat = function(n) {
        var t = this.string.charAt(this.pos), i;
        return i = typeof n == "string" ? t == n : t && (n.test ? n.test(t) : n(t)),
        i ? (++this.pos,
        t) : void 0
    }
    ,
    v.prototype.eatWhile = function(n) {
        for (var t = this.pos; this.eat(n); )
            ;
        return this.pos > t
    }
    ,
    v.prototype.eatSpace = function() {
        for (var n = this, t = this.pos; /[\s\u00a0]/.test(this.string.charAt(this.pos)); )
            ++n.pos;
        return this.pos > t
    }
    ,
    v.prototype.skipToEnd = function() {
        this.pos = this.string.length
    }
    ,
    v.prototype.skipTo = function(n) {
        var t = this.string.indexOf(n, this.pos);
        if (t > -1)
            return this.pos = t,
            !0
    }
    ,
    v.prototype.backUp = function(n) {
        this.pos -= n
    }
    ,
    v.prototype.column = function() {
        return this.lastColumnPos < this.start && (this.lastColumnValue = at(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue),
        this.lastColumnPos = this.start),
        this.lastColumnValue - (this.lineStart ? at(this.string, this.lineStart, this.tabSize) : 0)
    }
    ,
    v.prototype.indentation = function() {
        return at(this.string, null, this.tabSize) - (this.lineStart ? at(this.string, this.lineStart, this.tabSize) : 0)
    }
    ,
    v.prototype.match = function(n, t, i) {
        var u, f, r;
        if (typeof n == "string") {
            if (u = function(n) {
                return i ? n.toLowerCase() : n
            }
            ,
            f = this.string.substr(this.pos, n.length),
            u(f) == u(n))
                return t !== !1 && (this.pos += n.length),
                !0
        } else
            return (r = this.string.slice(this.pos).match(n),
            r && r.index > 0) ? null : (r && t !== !1 && (this.pos += r[0].length),
            r)
    }
    ,
    v.prototype.current = function() {
        return this.string.slice(this.start, this.pos)
    }
    ,
    v.prototype.hideFirstChars = function(n, t) {
        this.lineStart += n;
        try {
            return t()
        } finally {
            this.lineStart -= n
        }
    }
    ,
    v.prototype.lookAhead = function(n) {
        var t = this.lineOracle;
        return t && t.lookAhead(n)
    }
    ,
    v.prototype.baseToken = function() {
        var n = this.lineOracle;
        return n && n.baseToken(this.pos)
    }
    ,
    pf = function(n, t) {
        this.state = n,
        this.lookAhead = t
    }
    ,
    bt = function(n, t, i, r) {
        this.state = t,
        this.doc = n,
        this.line = i,
        this.maxLookAhead = r || 0,
        this.baseTokens = null,
        this.baseTokenPos = 1
    }
    ,
    bt.prototype.lookAhead = function(n) {
        var t = this.doc.getLine(this.line + n);
        return t != null && n > this.maxLookAhead && (this.maxLookAhead = n),
        t
    }
    ,
    bt.prototype.baseToken = function(n) {
        var i = this, t;
        if (!this.baseTokens)
            return null;
        while (this.baseTokens[this.baseTokenPos] <= n)
            i.baseTokenPos += 2;
        return t = this.baseTokens[this.baseTokenPos + 1],
        {
            type: t && t.replace(/( |^)overlay .*/, ""),
            size: this.baseTokens[this.baseTokenPos] - n
        }
    }
    ,
    bt.prototype.nextLine = function() {
        this.line++,
        this.maxLookAhead > 0 && this.maxLookAhead--
    }
    ,
    bt.fromSaved = function(n, t, i) {
        return t instanceof pf ? new bt(n,cr(n.mode, t.state),i,t.lookAhead) : new bt(n,cr(n.mode, t),i)
    }
    ,
    bt.prototype.save = function(n) {
        var t = n !== !1 ? cr(this.doc.mode, this.state) : this.state;
        return this.maxLookAhead > 0 ? new pf(t,this.maxLookAhead) : t
    }
    ,
    ic = function(n, t, i) {
        this.start = n.start,
        this.end = n.pos,
        this.string = n.current(),
        this.type = t || null,
        this.state = i
    }
    ,
    lr = function(n, t, i) {
        this.text = n,
        wa(this, t),
        this.height = i ? i(this) : 1
    }
    ,
    lr.prototype.lineNo = function() {
        return h(this)
    }
    ,
    uu(lr),
    av = {},
    vv = {},
    ar = null,
    fu = null,
    oc = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    bi = function(n, t, u) {
        this.cm = u;
        var f = this.vert = i("div", [i("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar")
          , o = this.horiz = i("div", [i("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
        f.tabIndex = o.tabIndex = -1,
        n(f),
        n(o),
        r(f, "scroll", function() {
            f.clientHeight && t(f.scrollTop, "vertical")
        }),
        r(o, "scroll", function() {
            o.clientWidth && t(o.scrollLeft, "horizontal")
        }),
        this.checkedZeroWidth = !1,
        e && l < 8 && (this.horiz.style.minHeight = this.vert.style.minWidth = "18px")
    }
    ,
    bi.prototype.update = function(n) {
        var i = n.scrollWidth > n.clientWidth + 1, r = n.scrollHeight > n.clientHeight + 1, t = n.nativeBarWidth, u, f;
        return r ? (this.vert.style.display = "block",
        this.vert.style.bottom = i ? t + "px" : "0",
        u = n.viewHeight - (i ? t : 0),
        this.vert.firstChild.style.height = Math.max(0, n.scrollHeight - n.clientHeight + u) + "px") : (this.vert.style.display = "",
        this.vert.firstChild.style.height = "0"),
        i ? (this.horiz.style.display = "block",
        this.horiz.style.right = r ? t + "px" : "0",
        this.horiz.style.left = n.barLeft + "px",
        f = n.viewWidth - n.barLeft - (r ? t : 0),
        this.horiz.firstChild.style.width = Math.max(0, n.scrollWidth - n.clientWidth + f) + "px") : (this.horiz.style.display = "",
        this.horiz.firstChild.style.width = "0"),
        !this.checkedZeroWidth && n.clientHeight > 0 && (t == 0 && this.zeroWidthHack(),
        this.checkedZeroWidth = !0),
        {
            right: r ? t : 0,
            bottom: i ? t : 0
        }
    }
    ,
    bi.prototype.setScrollLeft = function(n) {
        this.horiz.scrollLeft != n && (this.horiz.scrollLeft = n),
        this.disableHoriz && this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz")
    }
    ,
    bi.prototype.setScrollTop = function(n) {
        this.vert.scrollTop != n && (this.vert.scrollTop = n),
        this.disableVert && this.enableZeroWidthBar(this.vert, this.disableVert, "vert")
    }
    ,
    bi.prototype.zeroWidthHack = function() {
        var n = wt && !rk ? "12px" : "18px";
        this.horiz.style.height = this.vert.style.width = n,
        this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none",
        this.disableHoriz = new wi,
        this.disableVert = new wi
    }
    ,
    bi.prototype.enableZeroWidthBar = function(n, t, i) {
        function r() {
            var u = n.getBoundingClientRect()
              , f = i == "vert" ? document.elementFromPoint(u.right - 1, (u.top + u.bottom) / 2) : document.elementFromPoint((u.right + u.left) / 2, u.bottom - 1);
            f != n ? n.style.pointerEvents = "none" : t.set(1e3, r)
        }
        n.style.pointerEvents = "auto",
        t.set(1e3, r)
    }
    ,
    bi.prototype.clear = function() {
        var n = this.horiz.parentNode;
        n.removeChild(this.horiz),
        n.removeChild(this.vert)
    }
    ,
    su = function() {}
    ,
    su.prototype.update = function() {
        return {
            bottom: 0,
            right: 0
        }
    }
    ,
    su.prototype.setScrollLeft = function() {}
    ,
    su.prototype.setScrollTop = function() {}
    ,
    su.prototype.clear = function() {}
    ,
    nl = {
        "native": bi,
        "null": su
    },
    fp = 0,
    ee = function(n, t, i) {
        var r = n.display;
        this.viewport = t,
        this.visible = kc(r, n.doc, t),
        this.editorIsHidden = !r.wrapper.offsetWidth,
        this.wrapperHeight = r.wrapper.clientHeight,
        this.wrapperWidth = r.wrapper.clientWidth,
        this.oldDisplayWidth = vr(n),
        this.force = i,
        this.dims = vc(n),
        this.events = []
    }
    ,
    ee.prototype.signal = function(n, t) {
        vt(n, t) && this.events.push(arguments)
    }
    ,
    ee.prototype.finish = function() {
        for (var t = this, n = 0; n < this.events.length; n++)
            p.apply(null, t.events[n])
    }
    ,
    oe = 0,
    st = null,
    e ? st = -.53 : ai ? st = 15 : ge ? st = -.7 : ua && (st = -1 / 3),
    ht = function(n, t) {
        this.ranges = n,
        this.primIndex = t
    }
    ,
    ht.prototype.primary = function() {
        return this.ranges[this.primIndex]
    }
    ,
    ht.prototype.equals = function(n) {
        var u = this, t, i, r;
        if (n == this)
            return !0;
        if (n.primIndex != this.primIndex || n.ranges.length != this.ranges.length)
            return !1;
        for (t = 0; t < this.ranges.length; t++)
            if (i = u.ranges[t],
            r = n.ranges[t],
            !rh(i.anchor, r.anchor) || !rh(i.head, r.head))
                return !1;
        return !0
    }
    ,
    ht.prototype.deepCopy = function() {
        for (var t = this, i = [], n = 0; n < this.ranges.length; n++)
            i[n] = new o(uh(t.ranges[n].anchor),uh(t.ranges[n].head));
        return new ht(i,this.primIndex)
    }
    ,
    ht.prototype.somethingSelected = function() {
        for (var t = this, n = 0; n < this.ranges.length; n++)
            if (!t.ranges[n].empty())
                return !0;
        return !1
    }
    ,
    ht.prototype.contains = function(n, t) {
        var f = this, i, r;
        for (t || (t = n),
        i = 0; i < this.ranges.length; i++)
            if (r = f.ranges[i],
            u(t, r.from()) >= 0 && u(n, r.to()) <= 0)
                return i;
        return -1
    }
    ,
    o = function(n, t) {
        this.anchor = n,
        this.head = t
    }
    ,
    o.prototype.from = function() {
        return eo(this.anchor, this.head)
    }
    ,
    o.prototype.to = function() {
        return fo(this.anchor, this.head)
    }
    ,
    o.prototype.empty = function() {
        return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch
    }
    ,
    le.prototype = {
        chunkSize: function() {
            return this.lines.length
        },
        removeInner: function(n, t) {
            for (var u = this, r, i = n, f = n + t; i < f; ++i)
                r = u.lines[i],
                u.height -= r.height,
                ld(r),
                g(r, "delete");
            this.lines.splice(n, t)
        },
        collapse: function(n) {
            n.push.apply(n, this.lines)
        },
        insertInner: function(n, t, i) {
            var u = this, r;
            for (this.height += i,
            this.lines = this.lines.slice(0, n).concat(t).concat(this.lines.slice(n)),
            r = 0; r < t.length; ++r)
                t[r].parent = u
        },
        iterN: function(n, t, i) {
            for (var u = this, r = n + t; n < r; ++n)
                if (i(u.lines[n]))
                    return !0
        }
    },
    ae.prototype = {
        chunkSize: function() {
            return this.size
        },
        removeInner: function(n, t) {
            var e = this, r, i, u, f, s, o;
            for (this.size -= t,
            r = 0; r < this.children.length; ++r)
                if (i = e.children[r],
                u = i.chunkSize(),
                n < u) {
                    if (f = Math.min(t, u - n),
                    s = i.height,
                    i.removeInner(n, f),
                    e.height -= s - i.height,
                    u == f && (e.children.splice(r--, 1),
                    i.parent = null),
                    (t -= f) == 0)
                        break;
                    n = 0
                } else
                    n -= u;
            this.size - t < 25 && (this.children.length > 1 || !(this.children[0]instanceof le)) && (o = [],
            this.collapse(o),
            this.children = [new le(o)],
            this.children[0].parent = this)
        },
        collapse: function(n) {
            for (var i = this, t = 0; t < this.children.length; ++t)
                i.children[t].collapse(n)
        },
        insertInner: function(n, t, i) {
            var f = this, u, r, s, h, e, o;
            for (this.size += t.length,
            this.height += i,
            u = 0; u < this.children.length; ++u) {
                if (r = f.children[u],
                s = r.chunkSize(),
                n <= s) {
                    if (r.insertInner(n, t, i),
                    r.lines && r.lines.length > 50) {
                        for (h = r.lines.length % 25 + 25,
                        e = h; e < r.lines.length; )
                            o = new le(r.lines.slice(e, e += 25)),
                            r.height -= o.height,
                            f.children.splice(++u, 0, o),
                            o.parent = f;
                        r.lines = r.lines.slice(0, h),
                        f.maybeSpill()
                    }
                    break
                }
                n -= s
            }
        },
        maybeSpill: function() {
            var n, r, t, i, u;
            if (!(this.children.length <= 10)) {
                n = this;
                do
                    r = n.children.splice(n.children.length - 5, 5),
                    t = new ae(r),
                    n.parent ? (n.size -= t.size,
                    n.height -= t.height,
                    u = d(n.parent.children, n),
                    n.parent.children.splice(u + 1, 0, t)) : (i = new ae(n.children),
                    i.parent = n,
                    n.children = [i, t],
                    n = i),
                    t.parent = n.parent;
                while (n.children.length > 10);
                n.parent.maybeSpill()
            }
        },
        iterN: function(n, t, i) {
            for (var o = this, f, u, e, r = 0; r < this.children.length; ++r)
                if (f = o.children[r],
                u = f.chunkSize(),
                n < u) {
                    if (e = Math.min(t, u - n),
                    f.iterN(n, e, i))
                        return !0;
                    if ((t -= e) == 0)
                        break;
                    n = 0
                } else
                    n -= u
        }
    },
    yu = function(n, t, i) {
        var u = this, r;
        if (i)
            for (r in i)
                i.hasOwnProperty(r) && (u[r] = i[r]);
        this.doc = n,
        this.node = t
    }
    ,
    yu.prototype.clear = function() {
        var e = this, n = this.doc.cm, t = this.line.widgets, i = this.line, u = h(i), r, f;
        if (u != null && t) {
            for (r = 0; r < t.length; ++r)
                t[r] == e && t.splice(r--, 1);
            t.length || (i.widgets = null),
            f = kf(this),
            ni(i, Math.max(0, i.height - f)),
            n && (ot(n, function() {
                vw(n, i, -f),
                ki(n, u, "widget")
            }),
            g(n, "lineWidgetCleared", n, this, u))
        }
    }
    ,
    yu.prototype.changed = function() {
        var r = this, u = this.height, n = this.doc.cm, t = this.line, i;
        (this.height = null,
        i = kf(this) - u,
        i) && (ni(t, t.height + i),
        n && ot(n, function() {
            n.curOp.forceUpdate = !0,
            vw(n, t, i),
            g(n, "lineWidgetChanged", n, r, h(t))
        }))
    }
    ,
    uu(yu),
    vl = 0,
    ci = function(n, t) {
        this.lines = [],
        this.type = t,
        this.doc = n,
        this.id = ++vl
    }
    ,
    ci.prototype.clear = function() {
        var i = this, n, c, f, r, e, o, t, u, s, l, a;
        if (!this.explicitlyCleared) {
            for (n = this.doc.cm,
            c = n && !n.curOp,
            c && dr(n),
            vt(this, "clear") && (f = this.find(),
            f && g(this, "clear", f.from, f.to)),
            r = null,
            e = null,
            o = 0; o < this.lines.length; ++o)
                t = i.lines[o],
                u = af(t.markedSpans, i),
                n && !i.collapsed ? ki(n, h(t), "text") : n && (u.to != null && (e = h(t)),
                u.from != null && (r = h(t))),
                t.markedSpans = ak(t.markedSpans, u),
                u.from == null && i.collapsed && !or(i.doc, t) && n && ni(t, pr(n.display));
            if (n && this.collapsed && !n.options.lineWrapping)
                for (s = 0; s < this.lines.length; ++s)
                    l = ii(i.lines[s]),
                    a = lo(l),
                    a > n.display.maxLineLength && (n.display.maxLine = l,
                    n.display.maxLineLength = a,
                    n.display.maxLineChanged = !0);
            r != null && n && this.collapsed && et(n, r, e + 1),
            this.lines.length = 0,
            this.explicitlyCleared = !0,
            this.atomic && this.doc.cantEdit && (this.doc.cantEdit = !1,
            n && rw(n.doc)),
            n && g(n, "markerCleared", n, this, r, e),
            c && gr(n),
            this.parent && this.parent.clear()
        }
    }
    ,
    ci.prototype.find = function(t, i) {
        var s = this, f, o, e, r, u;
        for (t == null && this.type == "bookmark" && (t = 1),
        e = 0; e < this.lines.length; ++e) {
            if (r = s.lines[e],
            u = af(r.markedSpans, s),
            u.from != null && (f = n(i ? r : h(r), u.from),
            t == -1))
                return f;
            if (u.to != null && (o = n(i ? r : h(r), u.to),
            t == 1))
                return o
        }
        return f && {
            from: f,
            to: o
        }
    }
    ,
    ci.prototype.changed = function() {
        var r = this
          , i = this.find(-1, !0)
          , t = this
          , n = this.doc.cm;
        i && n && ot(n, function() {
            var u = i.line, s = h(i.line), e = ec(n, s), o, f;
            e && (ey(e),
            n.curOp.selectionChanged = n.curOp.forceUpdate = !0),
            n.curOp.updateMaxLine = !0,
            or(t.doc, u) || t.height == null || (o = t.height,
            t.height = null,
            f = kf(t) - o,
            f && ni(u, u.height + f)),
            g(n, "markerChanged", n, r)
        })
    }
    ,
    ci.prototype.attachLine = function(n) {
        if (!this.lines.length && this.doc.cm) {
            var t = this.doc.cm.curOp;
            t.maybeHiddenMarkers && d(t.maybeHiddenMarkers, this) != -1 || (t.maybeUnhiddenMarkers || (t.maybeUnhiddenMarkers = [])).push(this)
        }
        this.lines.push(n)
    }
    ,
    ci.prototype.detachLine = function(n) {
        if (this.lines.splice(d(this.lines, n), 1),
        !this.lines.length && this.doc.cm) {
            var t = this.doc.cm.curOp;
            (t.maybeHiddenMarkers || (t.maybeHiddenMarkers = [])).push(this)
        }
    }
    ,
    uu(ci),
    wu = function(n, t) {
        var r = this, i;
        for (this.markers = n,
        this.primary = t,
        i = 0; i < n.length; ++i)
            n[i].parent = r
    }
    ,
    wu.prototype.clear = function() {
        var t = this, n;
        if (!this.explicitlyCleared) {
            for (this.explicitlyCleared = !0,
            n = 0; n < this.markers.length; ++n)
                t.markers[n].clear();
            g(this, "clear")
        }
    }
    ,
    wu.prototype.find = function(n, t) {
        return this.primary.find(n, t)
    }
    ,
    uu(wu),
    pw = 0,
    ut = function(t, i, r, u, f) {
        if (!(this instanceof ut))
            return new ut(t,i,r,u,f);
        r == null && (r = 0),
        ae.call(this, [new le([new lr("",null)])]),
        this.first = r,
        this.scrollTop = this.scrollLeft = 0,
        this.cantEdit = !1,
        this.cleanGeneration = 1,
        this.modeFrontier = this.highlightFrontier = r;
        var e = n(r, 0);
        this.sel = gi(e),
        this.history = new ts(null),
        this.id = ++pw,
        this.modeOption = i,
        this.lineSep = u,
        this.direction = f == "rtl" ? "rtl" : "ltr",
        this.extend = !1,
        typeof t == "string" && (t = this.splitLines(t)),
        sl(this, {
            from: e,
            to: e,
            text: t
        }),
        tt(this, gi(e), gt)
    }
    ,
    ut.prototype = oa(ae.prototype, {
        constructor: ut,
        iter: function(n, t, i) {
            i ? this.iterN(n - this.first, t - n, i) : this.iterN(this.first, this.first + this.size, n)
        },
        insert: function(n, t) {
            for (var r = 0, i = 0; i < t.length; ++i)
                r += t[i].height;
            this.insertInner(n - this.first, t, r)
        },
        remove: function(n, t) {
            this.removeInner(n - this.first, t)
        },
        getValue: function(n) {
            var t = th(this, this.first, this.first + this.size);
            return n === !1 ? t : t.join(n || this.lineSeparator())
        },
        setValue: k(function(i) {
            var r = n(this.first, 0)
              , u = this.first + this.size - 1;
            au(this, {
                from: r,
                to: n(u, t(this, u).text.length),
                text: this.splitLines(i),
                origin: "setValue",
                full: !0
            }, !0),
            this.cm && ie(this.cm, 0, 0),
            tt(this, gi(r), gt)
        }),
        replaceRange: function(n, t, i, r) {
            t = f(this, t),
            i = i ? f(this, i) : t,
            vu(this, n, t, i, r)
        },
        getRange: function(n, t, i) {
            var r = fr(this, f(this, n), f(this, t));
            return i === !1 ? r : r.join(i || this.lineSeparator())
        },
        getLine: function(n) {
            var t = this.getLineHandle(n);
            return t && t.text
        },
        getLineHandle: function(n) {
            if (lf(this, n))
                return t(this, n)
        },
        getLineNumber: function(n) {
            return h(n)
        },
        getLineHandleVisualStart: function(n) {
            return typeof n == "number" && (n = t(this, n)),
            ii(n)
        },
        lineCount: function() {
            return this.size
        },
        firstLine: function() {
            return this.first
        },
        lastLine: function() {
            return this.first + this.size - 1
        },
        clipPos: function(n) {
            return f(this, n)
        },
        getCursor: function(n) {
            var i = this.sel.primary(), t;
            return t = n == null || n == "head" ? i.head : n == "anchor" ? i.anchor : n == "end" || n == "to" || n === !1 ? i.to() : i.from()
        },
        listSelections: function() {
            return this.sel.ranges
        },
        somethingSelected: function() {
            return this.sel.somethingSelected()
        },
        setCursor: k(function(t, i, r) {
            nw(this, f(this, typeof t == "number" ? n(t, i || 0) : t), null, r)
        }),
        setSelection: k(function(n, t, i) {
            nw(this, f(this, n), f(this, t || n), i)
        }),
        extendSelection: k(function(n, t, i) {
            rs(this, f(this, n), t && f(this, t), i)
        }),
        extendSelections: k(function(n, t) {
            gp(this, va(this, n), t)
        }),
        extendSelectionsBy: k(function(n, t) {
            var i = ro(this.sel.ranges, n);
            gp(this, va(this, i), t)
        }),
        setSelections: k(function(n, t, i) {
            var e = this, u, r;
            if (n.length) {
                for (u = [],
                r = 0; r < n.length; r++)
                    u[r] = new o(f(e, n[r].anchor),f(e, n[r].head));
                t == null && (t = Math.min(n.length - 1, this.sel.primIndex)),
                tt(this, dt(u, t), i)
            }
        }),
        addSelection: k(function(n, t, i) {
            var r = this.sel.ranges.slice(0);
            r.push(new o(f(this, n),f(this, t || n))),
            tt(this, dt(r, r.length - 1), i)
        }),
        getSelection: function(n) {
            for (var f = this, r = this.sel.ranges, t, u, i = 0; i < r.length; i++)
                u = fr(f, r[i].from(), r[i].to()),
                t = t ? t.concat(u) : u;
            return n === !1 ? t : t.join(n || this.lineSeparator())
        },
        getSelections: function(n) {
            for (var u = this, f = [], r = this.sel.ranges, i, t = 0; t < r.length; t++)
                i = fr(u, r[t].from(), r[t].to()),
                n !== !1 && (i = i.join(n || u.lineSeparator())),
                f[t] = i;
            return f
        },
        replaceSelection: function(n, t, i) {
            for (var u = [], r = 0; r < this.sel.ranges.length; r++)
                u[r] = n;
            this.replaceSelections(u, t, i || "+input")
        },
        replaceSelections: k(function(n, t, i) {
            for (var s = this, u = [], h = this.sel, e, o, f, r = 0; r < h.ranges.length; r++)
                e = h.ranges[r],
                u[r] = {
                    from: e.from(),
                    to: e.to(),
                    text: s.splitLines(n[r]),
                    origin: i
                };
            for (o = t && t != "end" && ln(this, u, t),
            f = u.length - 1; f >= 0; f--)
                au(s, u[f]);
            o ? tw(this, o) : this.cm && ou(this.cm)
        }),
        undo: k(function() {
            fs(this, "undo")
        }),
        redo: k(function() {
            fs(this, "redo")
        }),
        undoSelection: k(function() {
            fs(this, "undo", !0)
        }),
        redoSelection: k(function() {
            fs(this, "redo", !0)
        }),
        setExtending: function(n) {
            this.extend = n
        },
        getExtending: function() {
            return this.extend
        },
        historySize: function() {
            for (var n = this.history, r = 0, u = 0, i, t = 0; t < n.done.length; t++)
                n.done[t].ranges || ++r;
            for (i = 0; i < n.undone.length; i++)
                n.undone[i].ranges || ++u;
            return {
                undo: r,
                redo: u
            }
        },
        clearHistory: function() {
            this.history = new ts(this.history.maxGeneration)
        },
        markClean: function() {
            this.cleanGeneration = this.changeGeneration(!0)
        },
        changeGeneration: function(n) {
            return n && (this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null),
            this.history.generation
        },
        isClean: function(n) {
            return this.history.generation == (n || this.cleanGeneration)
        },
        getHistory: function() {
            return {
                done: cu(this.history.done),
                undone: cu(this.history.undone)
            }
        },
        setHistory: function(n) {
            var t = this.history = new ts(this.history.maxGeneration);
            t.done = cu(n.done.slice(0), null, !0),
            t.undone = cu(n.undone.slice(0), null, !0)
        },
        setGutterMarker: k(function(n, t, i) {
            return ce(this, n, "gutter", function(n) {
                var r = n.gutterMarkers || (n.gutterMarkers = {});
                return r[t] = i,
                !i && ha(r) && (n.gutterMarkers = null),
                !0
            })
        }),
        clearGutter: k(function(n) {
            var t = this;
            this.iter(function(i) {
                i.gutterMarkers && i.gutterMarkers[n] && ce(t, i, "gutter", function() {
                    return i.gutterMarkers[n] = null,
                    ha(i.gutterMarkers) && (i.gutterMarkers = null),
                    !0
                })
            })
        }),
        lineInfo: function(n) {
            var i;
            if (typeof n == "number") {
                if (!lf(this, n) || (i = n,
                n = t(this, n),
                !n))
                    return null
            } else if (i = h(n),
            i == null)
                return null;
            return {
                line: i,
                handle: n,
                text: n.text,
                gutterMarkers: n.gutterMarkers,
                textClass: n.textClass,
                bgClass: n.bgClass,
                wrapClass: n.wrapClass,
                widgets: n.widgets
            }
        },
        addLineClass: k(function(n, t, i) {
            return ce(this, n, t == "gutter" ? "gutter" : "class", function(n) {
                var r = t == "text" ? "textClass" : t == "background" ? "bgClass" : t == "gutter" ? "gutterClass" : "wrapClass";
                if (n[r]) {
                    if (of(i).test(n[r]))
                        return !1;
                    n[r] += " " + i
                } else
                    n[r] = i;
                return !0
            })
        }),
        removeLineClass: k(function(n, t, i) {
            return ce(this, n, t == "gutter" ? "gutter" : "class", function(n) {
                var f = t == "text" ? "textClass" : t == "background" ? "bgClass" : t == "gutter" ? "gutterClass" : "wrapClass", u = n[f], r, e;
                if (u)
                    if (i == null)
                        n[f] = null;
                    else {
                        if (r = u.match(of(i)),
                        !r)
                            return !1;
                        e = r.index + r[0].length,
                        n[f] = u.slice(0, r.index) + (!r.index || e == u.length ? "" : " ") + u.slice(e) || null
                    }
                else
                    return !1;
                return !0
            })
        }),
        addLineWidget: k(function(n, t, i) {
            return gn(this, n, t, i)
        }),
        removeLineWidget: function(n) {
            n.clear()
        },
        markText: function(n, t, i) {
            return pu(this, f(this, n), f(this, t), i, i && i.type || "range")
        },
        setBookmark: function(n, t) {
            var i = {
                replacedWith: t && (t.nodeType == null ? t.widget : t),
                insertLeft: t && t.insertLeft,
                clearWhenEmpty: !1,
                shared: t && t.shared,
                handleMouseEvents: t && t.handleMouseEvents
            };
            return n = f(this, n),
            pu(this, n, n, i, "bookmark")
        },
        findMarksAt: function(n) {
            var e, r, u, i;
            if (n = f(this, n),
            e = [],
            r = t(this, n.line).markedSpans,
            r)
                for (u = 0; u < r.length; ++u)
                    i = r[u],
                    (i.from == null || i.from <= n.ch) && (i.to == null || i.to >= n.ch) && e.push(i.marker.parent || i.marker);
            return e
        },
        findMarks: function(n, t, i) {
            n = f(this, n),
            t = f(this, t);
            var u = []
              , r = n.line;
            return this.iter(n.line, t.line + 1, function(f) {
                var s = f.markedSpans, o, e;
                if (s)
                    for (o = 0; o < s.length; o++)
                        e = s[o],
                        e.to != null && r == n.line && n.ch >= e.to || e.from == null && r != n.line || e.from != null && r == t.line && e.from >= t.ch || i && !i(e.marker) || u.push(e.marker.parent || e.marker);
                ++r
            }),
            u
        },
        getAllMarks: function() {
            var n = [];
            return this.iter(function(t) {
                var r = t.markedSpans, i;
                if (r)
                    for (i = 0; i < r.length; ++i)
                        r[i].from != null && n.push(r[i].marker)
            }),
            n
        },
        posFromIndex: function(t) {
            var i, r = this.first, u = this.lineSeparator().length;
            return this.iter(function(n) {
                var f = n.text.length + u;
                if (f > t)
                    return i = t,
                    !0;
                t -= f,
                ++r
            }),
            f(this, n(r, i))
        },
        indexFromPos: function(n) {
            var t, i;
            return (n = f(this, n),
            t = n.ch,
            n.line < this.first || n.ch < 0) ? 0 : (i = this.lineSeparator().length,
            this.iter(this.first, n.line, function(n) {
                t += n.text.length + i
            }),
            t)
        },
        copy: function(n) {
            var t = new ut(th(this, this.first, this.first + this.size),this.modeOption,this.first,this.lineSep,this.direction);
            return t.scrollTop = this.scrollTop,
            t.scrollLeft = this.scrollLeft,
            t.sel = this.sel,
            t.extend = !1,
            n && (t.history.undoDepth = this.history.undoDepth,
            t.setHistory(this.getHistory())),
            t
        },
        linkedDoc: function(n) {
            var i, r, t;
            return n || (n = {}),
            i = this.first,
            r = this.first + this.size,
            n.from != null && n.from > i && (i = n.from),
            n.to != null && n.to < r && (r = n.to),
            t = new ut(th(this, i, r),n.mode || this.modeOption,i,this.lineSep,this.direction),
            n.sharedHist && (t.history = this.history),
            (this.linked || (this.linked = [])).push({
                doc: t,
                sharedHist: n.sharedHist
            }),
            t.linked = [{
                doc: this,
                isParent: !0,
                sharedHist: n.sharedHist
            }],
            ttt(t, yw(this)),
            t
        },
        unlinkDoc: function(n) {
            var i = this, t, u, r;
            if (n instanceof a && (n = n.doc),
            this.linked)
                for (t = 0; t < this.linked.length; ++t)
                    if (u = i.linked[t],
                    u.doc == n) {
                        i.linked.splice(t, 1),
                        n.unlinkDoc(i),
                        itt(yw(i));
                        break
                    }
            n.history == this.history && (r = [n.id],
            nu(n, function(n) {
                return r.push(n.id)
            }, !0),
            n.history = new ts(null),
            n.history.done = cu(this.history.done, r),
            n.history.undone = cu(this.history.undone, r))
        },
        iterLinkedDocs: function(n) {
            nu(this, n)
        },
        getMode: function() {
            return this.mode
        },
        getEditor: function() {
            return this.cm
        },
        splitLines: function(n) {
            return this.lineSep ? n.split(this.lineSep) : bh(n)
        },
        lineSeparator: function() {
            return this.lineSep || "\n"
        },
        setDirection: k(function(n) {
            (n != "rtl" && (n = "ltr"),
            n != this.direction) && (this.direction = n,
            this.iter(function(n) {
                return n.order = null
            }),
            this.cm && an(this.cm))
        })
    }),
    ut.prototype.eachLine = ut.prototype.iter,
    yl = 0,
    pl = !1,
    li = {
        3: "Pause",
        8: "Backspace",
        9: "Tab",
        13: "Enter",
        16: "Shift",
        17: "Ctrl",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Esc",
        32: "Space",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "Left",
        38: "Up",
        39: "Right",
        40: "Down",
        44: "PrintScrn",
        45: "Insert",
        46: "Delete",
        59: ";",
        61: "=",
        91: "Mod",
        92: "Mod",
        93: "Mod",
        106: "*",
        107: "=",
        109: "-",
        110: ".",
        111: "/",
        127: "Delete",
        145: "ScrollLock",
        173: "-",
        186: ";",
        187: "=",
        188: ",",
        189: "-",
        190: ".",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]",
        222: "'",
        63232: "Up",
        63233: "Down",
        63234: "Left",
        63235: "Right",
        63272: "Delete",
        63273: "Home",
        63275: "End",
        63276: "PageUp",
        63277: "PageDown",
        63302: "Insert"
    },
    bu = 0; bu < 10; bu++)
        li[bu + 48] = li[bu + 96] = String(bu);
    for (ve = 65; ve <= 90; ve++)
        li[ve] = String.fromCharCode(ve);
    for (ku = 1; ku <= 12; ku++)
        li[ku + 111] = li[ku + 63235] = "F" + ku;
    fi = {},
    fi.basic = {
        Left: "goCharLeft",
        Right: "goCharRight",
        Up: "goLineUp",
        Down: "goLineDown",
        End: "goLineEnd",
        Home: "goLineStartSmart",
        PageUp: "goPageUp",
        PageDown: "goPageDown",
        Delete: "delCharAfter",
        Backspace: "delCharBefore",
        "Shift-Backspace": "delCharBefore",
        Tab: "defaultTab",
        "Shift-Tab": "indentAuto",
        Enter: "newlineAndIndent",
        Insert: "toggleOverwrite",
        Esc: "singleSelection"
    },
    fi.pcDefault = {
        "Ctrl-A": "selectAll",
        "Ctrl-D": "deleteLine",
        "Ctrl-Z": "undo",
        "Shift-Ctrl-Z": "redo",
        "Ctrl-Y": "redo",
        "Ctrl-Home": "goDocStart",
        "Ctrl-End": "goDocEnd",
        "Ctrl-Up": "goLineUp",
        "Ctrl-Down": "goLineDown",
        "Ctrl-Left": "goGroupLeft",
        "Ctrl-Right": "goGroupRight",
        "Alt-Left": "goLineStart",
        "Alt-Right": "goLineEnd",
        "Ctrl-Backspace": "delGroupBefore",
        "Ctrl-Delete": "delGroupAfter",
        "Ctrl-S": "save",
        "Ctrl-F": "find",
        "Ctrl-G": "findNext",
        "Shift-Ctrl-G": "findPrev",
        "Shift-Ctrl-F": "replace",
        "Shift-Ctrl-R": "replaceAll",
        "Ctrl-[": "indentLess",
        "Ctrl-]": "indentMore",
        "Ctrl-U": "undoSelection",
        "Shift-Ctrl-U": "redoSelection",
        "Alt-U": "redoSelection",
        fallthrough: "basic"
    },
    fi.emacsy = {
        "Ctrl-F": "goCharRight",
        "Ctrl-B": "goCharLeft",
        "Ctrl-P": "goLineUp",
        "Ctrl-N": "goLineDown",
        "Alt-F": "goWordRight",
        "Alt-B": "goWordLeft",
        "Ctrl-A": "goLineStart",
        "Ctrl-E": "goLineEnd",
        "Ctrl-V": "goPageDown",
        "Shift-Ctrl-V": "goPageUp",
        "Ctrl-D": "delCharAfter",
        "Ctrl-H": "delCharBefore",
        "Alt-D": "delWordAfter",
        "Alt-Backspace": "delWordBefore",
        "Ctrl-K": "killLine",
        "Ctrl-T": "transposeChars",
        "Ctrl-O": "openLine"
    },
    fi.macDefault = {
        "Cmd-A": "selectAll",
        "Cmd-D": "deleteLine",
        "Cmd-Z": "undo",
        "Shift-Cmd-Z": "redo",
        "Cmd-Y": "redo",
        "Cmd-Home": "goDocStart",
        "Cmd-Up": "goDocStart",
        "Cmd-End": "goDocEnd",
        "Cmd-Down": "goDocEnd",
        "Alt-Left": "goGroupLeft",
        "Alt-Right": "goGroupRight",
        "Cmd-Left": "goLineLeft",
        "Cmd-Right": "goLineRight",
        "Alt-Backspace": "delGroupBefore",
        "Ctrl-Alt-Backspace": "delGroupAfter",
        "Alt-Delete": "delGroupAfter",
        "Cmd-S": "save",
        "Cmd-F": "find",
        "Cmd-G": "findNext",
        "Shift-Cmd-G": "findPrev",
        "Cmd-Alt-F": "replace",
        "Shift-Cmd-Alt-F": "replaceAll",
        "Cmd-[": "indentLess",
        "Cmd-]": "indentMore",
        "Cmd-Backspace": "delWrappedLineLeft",
        "Cmd-Delete": "delWrappedLineRight",
        "Cmd-U": "undoSelection",
        "Shift-Cmd-U": "redoSelection",
        "Ctrl-Up": "goDocStart",
        "Ctrl-Down": "goDocEnd",
        fallthrough: ["basic", "emacsy"]
    },
    fi["default"] = wt ? fi.macDefault : fi.pcDefault,
    nf = {
        selectAll: ew,
        singleSelection: function(n) {
            return n.setSelection(n.getCursor("anchor"), n.getCursor("head"), gt)
        },
        killLine: function(i) {
            return gu(i, function(r) {
                if (r.empty()) {
                    var u = t(i.doc, r.head.line).text.length;
                    return r.head.ch == u && r.head.line < i.lastLine() ? {
                        from: r.head,
                        to: n(r.head.line + 1, 0)
                    } : {
                        from: r.head,
                        to: n(r.head.line, u)
                    }
                }
                return {
                    from: r.from(),
                    to: r.to()
                }
            })
        },
        deleteLine: function(t) {
            return gu(t, function(i) {
                return {
                    from: n(i.from().line, 0),
                    to: f(t.doc, n(i.to().line + 1, 0))
                }
            })
        },
        delLineLeft: function(t) {
            return gu(t, function(t) {
                return {
                    from: n(t.from().line, 0),
                    to: t.from()
                }
            })
        },
        delWrappedLineLeft: function(n) {
            return gu(n, function(t) {
                var i = n.charCoords(t.head, "div").top + 5
                  , r = n.coordsChar({
                    left: 0,
                    top: i
                }, "div");
                return {
                    from: r,
                    to: t.from()
                }
            })
        },
        delWrappedLineRight: function(n) {
            return gu(n, function(t) {
                var i = n.charCoords(t.head, "div").top + 5
                  , r = n.coordsChar({
                    left: n.display.lineDiv.offsetWidth + 100,
                    top: i
                }, "div");
                return {
                    from: t.from(),
                    to: r
                }
            })
        },
        undo: function(n) {
            return n.undo()
        },
        redo: function(n) {
            return n.redo()
        },
        undoSelection: function(n) {
            return n.undoSelection()
        },
        redoSelection: function(n) {
            return n.redoSelection()
        },
        goDocStart: function(t) {
            return t.extendSelection(n(t.firstLine(), 0))
        },
        goDocEnd: function(t) {
            return t.extendSelection(n(t.lastLine()))
        },
        goLineStart: function(n) {
            return n.extendSelectionsBy(function(t) {
                return nb(n, t.head.line)
            }, {
                origin: "+move",
                bias: 1
            })
        },
        goLineStartSmart: function(n) {
            return n.extendSelectionsBy(function(t) {
                return tb(n, t.head)
            }, {
                origin: "+move",
                bias: 1
            })
        },
        goLineEnd: function(n) {
            return n.extendSelectionsBy(function(t) {
                return att(n, t.head.line)
            }, {
                origin: "+move",
                bias: -1
            })
        },
        goLineRight: function(n) {
            return n.extendSelectionsBy(function(t) {
                var i = n.cursorCoords(t.head, "div").top + 5;
                return n.coordsChar({
                    left: n.display.lineDiv.offsetWidth + 100,
                    top: i
                }, "div")
            }, sf)
        },
        goLineLeft: function(n) {
            return n.extendSelectionsBy(function(t) {
                var i = n.cursorCoords(t.head, "div").top + 5;
                return n.coordsChar({
                    left: 0,
                    top: i
                }, "div")
            }, sf)
        },
        goLineLeftSmart: function(n) {
            return n.extendSelectionsBy(function(t) {
                var r = n.cursorCoords(t.head, "div").top + 5
                  , i = n.coordsChar({
                    left: 0,
                    top: r
                }, "div");
                return i.ch < n.getLine(i.line).search(/\S/) ? tb(n, t.head) : i
            }, sf)
        },
        goLineUp: function(n) {
            return n.moveV(-1, "line")
        },
        goLineDown: function(n) {
            return n.moveV(1, "line")
        },
        goPageUp: function(n) {
            return n.moveV(-1, "page")
        },
        goPageDown: function(n) {
            return n.moveV(1, "page")
        },
        goCharLeft: function(n) {
            return n.moveH(-1, "char")
        },
        goCharRight: function(n) {
            return n.moveH(1, "char")
        },
        goColumnLeft: function(n) {
            return n.moveH(-1, "column")
        },
        goColumnRight: function(n) {
            return n.moveH(1, "column")
        },
        goWordLeft: function(n) {
            return n.moveH(-1, "word")
        },
        goGroupRight: function(n) {
            return n.moveH(1, "group")
        },
        goGroupLeft: function(n) {
            return n.moveH(-1, "group")
        },
        goWordRight: function(n) {
            return n.moveH(1, "word")
        },
        delCharBefore: function(n) {
            return n.deleteH(-1, "char")
        },
        delCharAfter: function(n) {
            return n.deleteH(1, "char")
        },
        delWordBefore: function(n) {
            return n.deleteH(-1, "word")
        },
        delWordAfter: function(n) {
            return n.deleteH(1, "word")
        },
        delGroupBefore: function(n) {
            return n.deleteH(-1, "group")
        },
        delGroupAfter: function(n) {
            return n.deleteH(1, "group")
        },
        indentAuto: function(n) {
            return n.indentSelection("smart")
        },
        indentMore: function(n) {
            return n.indentSelection("add")
        },
        indentLess: function(n) {
            return n.indentSelection("subtract")
        },
        insertTab: function(n) {
            return n.replaceSelection("\t")
        },
        insertSoftTab: function(n) {
            for (var u = [], f = n.listSelections(), i = n.options.tabSize, r, e, t = 0; t < f.length; t++)
                r = f[t].from(),
                e = at(n.getLine(r.line), r.ch, i),
                u.push(ds(i - e % i));
            n.replaceSelections(u)
        },
        defaultTab: function(n) {
            n.somethingSelected() ? n.indentSelection("add") : n.execCommand("insertTab")
        },
        transposeChars: function(i) {
            return ot(i, function() {
                for (var s = i.listSelections(), h = [], r, u, e, f = 0; f < s.length; f++)
                    s[f].empty() && (r = s[f].head,
                    u = t(i.doc, r.line).text,
                    u && (r.ch == u.length && (r = new n(r.line,r.ch - 1)),
                    r.ch > 0 ? (r = new n(r.line,r.ch + 1),
                    i.replaceRange(u.charAt(r.ch - 1) + u.charAt(r.ch - 2), n(r.line, r.ch - 2), r, "+transpose")) : r.line > i.doc.first && (e = t(i.doc, r.line - 1).text,
                    e && (r = new n(r.line,1),
                    i.replaceRange(u.charAt(0) + i.doc.lineSeparator() + e.charAt(e.length - 1), n(r.line - 1, e.length - 1), r, "+transpose")))),
                    h.push(new o(r,r)));
                i.setSelections(h)
            })
        },
        newlineAndIndent: function(n) {
            return ot(n, function() {
                for (var t = n.listSelections(), r, i = t.length - 1; i >= 0; i--)
                    n.replaceRange(n.doc.lineSeparator(), t[i].anchor, t[i].head, "+input");
                for (t = n.listSelections(),
                r = 0; r < t.length; r++)
                    n.indentLine(t[r].from().line, null, !0);
                ou(n)
            })
        },
        openLine: function(n) {
            return n.replaceSelection("\n", "start")
        },
        toggleOverwrite: function(n) {
            return n.toggleOverwrite()
        }
    },
    ib = new wi,
    ss = null,
    sb = 400,
    hs = function(n, t, i) {
        this.time = n,
        this.pos = t,
        this.button = i
    }
    ,
    hs.prototype.compare = function(n, t, i) {
        return this.time + sb > n && u(t, this.pos) == 0 && i == this.button
    }
    ;
    var tf = {
        toString: function() {
            return "CodeMirror.Init"
        }
    }
      , yb = {}
      , cs = {};
    a.defaults = yb,
    a.optionHandlers = cs,
    ls = [],
    a.defineInitHook = function(n) {
        return ls.push(n)
    }
    ,
    yt = null,
    c = function(n) {
        this.cm = n,
        this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null,
        this.polling = new wi,
        this.composing = null,
        this.gracePeriod = !1,
        this.readDOMTimeout = null
    }
    ,
    c.prototype.init = function(n) {
        function e(n) {
            var r, e, i, o, s;
            if (!w(t, n)) {
                if (t.somethingSelected())
                    as({
                        lineWise: !1,
                        text: t.getSelections()
                    }),
                    n.type == "cut" && t.replaceSelection("", null, "cut");
                else if (t.options.lineWiseCopyCut)
                    r = bb(t),
                    as({
                        lineWise: !0,
                        text: r.text
                    }),
                    n.type == "cut" && t.operation(function() {
                        t.setSelections(r.ranges, 0, gt),
                        t.replaceSelection("", null, "cut")
                    });
                else
                    return;
                if (n.clipboardData && (n.clipboardData.clearData(),
                e = yt.text.join("\n"),
                n.clipboardData.setData("Text", e),
                n.clipboardData.getData("Text") == e)) {
                    n.preventDefault();
                    return
                }
                i = db(),
                o = i.firstChild,
                t.display.lineSpace.insertBefore(i, t.display.lineSpace.firstChild),
                o.value = yt.text.join("\n"),
                s = document.activeElement,
                iu(o),
                setTimeout(function() {
                    t.display.lineSpace.removeChild(i),
                    s.focus(),
                    s == u && f.showPrimarySelection()
                }, 50)
            }
        }
        var i = this
          , f = this
          , t = f.cm
          , u = f.div = n.lineDiv;
        kb(u, t.options.spellcheck),
        r(u, "paste", function(n) {
            w(t, n) || pb(n, t) || l <= 11 && setTimeout(b(t, function() {
                return i.updateFromDOM()
            }), 20)
        }),
        r(u, "compositionstart", function(n) {
            i.composing = {
                data: n.data,
                done: !1
            }
        }),
        r(u, "compositionupdate", function(n) {
            i.composing || (i.composing = {
                data: n.data,
                done: !1
            })
        }),
        r(u, "compositionend", function(n) {
            i.composing && (n.data != i.composing.data && i.readFromDOMSoon(),
            i.composing.done = !0)
        }),
        r(u, "touchstart", function() {
            return f.forceCompositionEnd()
        }),
        r(u, "input", function() {
            i.composing || i.readFromDOMSoon()
        }),
        r(u, "copy", e),
        r(u, "cut", e)
    }
    ,
    c.prototype.prepareSelection = function() {
        var n = py(this.cm, !1);
        return n.focus = this.cm.state.focused,
        n
    }
    ,
    c.prototype.showSelection = function(n, t) {
        n && this.cm.display.view.length && ((n.focus || t) && this.showPrimarySelection(),
        this.showMultipleSelections(n))
    }
    ,
    c.prototype.getSelection = function() {
        return this.cm.display.wrapper.ownerDocument.getSelection()
    }
    ,
    c.prototype.showPrimarySelection = function() {
        var n = this.getSelection(), t = this.cm, y = t.doc.sel.primary(), c = y.from(), l = y.to(), r, f, s, i, v, h;
        if (t.display.viewTo == t.display.viewFrom || c.line >= t.display.viewTo || l.line < t.display.viewFrom) {
            n.removeAllRanges();
            return
        }
        if (r = vs(t, n.anchorNode, n.anchorOffset),
        f = vs(t, n.focusNode, n.focusOffset),
        !r || r.bad || !f || f.bad || u(eo(r, f), c) != 0 || u(fo(r, f), l) != 0) {
            var a = t.display.view
              , e = c.line >= t.display.viewFrom && nk(t, c) || {
                node: a[0].measure.map[2],
                offset: 0
            }
              , o = l.line < t.display.viewTo && nk(t, l);
            if (o || (s = a[a.length - 1].measure,
            i = s.maps ? s.maps[s.maps.length - 1] : s.map,
            o = {
                node: i[i.length - 1],
                offset: i[i.length - 2] - i[i.length - 3]
            }),
            !e || !o) {
                n.removeAllRanges();
                return
            }
            v = n.rangeCount && n.getRangeAt(0);
            try {
                h = ir(e.node, e.offset, o.offset, o.node)
            } catch (p) {}
            h && (!ai && t.state.focused ? (n.collapse(e.node, e.offset),
            h.collapsed || (n.removeAllRanges(),
            n.addRange(h))) : (n.removeAllRanges(),
            n.addRange(h)),
            v && n.anchorNode == null ? n.addRange(v) : ai && this.startGracePeriod()),
            this.rememberSelection()
        }
    }
    ,
    c.prototype.startGracePeriod = function() {
        var n = this;
        clearTimeout(this.gracePeriod),
        this.gracePeriod = setTimeout(function() {
            n.gracePeriod = !1,
            n.selectionChanged() && n.cm.operation(function() {
                return n.cm.curOp.selectionChanged = !0
            })
        }, 20)
    }
    ,
    c.prototype.showMultipleSelections = function(n) {
        ct(this.cm.display.cursorDiv, n.cursors),
        ct(this.cm.display.selectionDiv, n.selection)
    }
    ,
    c.prototype.rememberSelection = function() {
        var n = this.getSelection();
        this.lastAnchorNode = n.anchorNode,
        this.lastAnchorOffset = n.anchorOffset,
        this.lastFocusNode = n.focusNode,
        this.lastFocusOffset = n.focusOffset
    }
    ,
    c.prototype.selectionInEditor = function() {
        var n = this.getSelection(), t;
        return n.rangeCount ? (t = n.getRangeAt(0).commonAncestorContainer,
        pi(this.div, t)) : !1
    }
    ,
    c.prototype.focus = function() {
        this.cm.options.readOnly != "nocursor" && (this.selectionInEditor() || this.showSelection(this.prepareSelection(), !0),
        this.div.focus())
    }
    ,
    c.prototype.blur = function() {
        this.div.blur()
    }
    ,
    c.prototype.getField = function() {
        return this.div
    }
    ,
    c.prototype.supportsTouch = function() {
        return !0
    }
    ,
    c.prototype.receivedFocus = function() {
        function t() {
            n.cm.state.focused && (n.pollSelection(),
            n.polling.set(n.cm.options.pollInterval, t))
        }
        var n = this;
        this.selectionInEditor() ? this.pollSelection() : ot(this.cm, function() {
            return n.cm.curOp.selectionChanged = !0
        }),
        this.polling.set(this.cm.options.pollInterval, t)
    }
    ,
    c.prototype.selectionChanged = function() {
        var n = this.getSelection();
        return n.anchorNode != this.lastAnchorNode || n.anchorOffset != this.lastAnchorOffset || n.focusNode != this.lastFocusNode || n.focusOffset != this.lastFocusOffset
    }
    ,
    c.prototype.pollSelection = function() {
        var n, t, i, r;
        if (this.readDOMTimeout == null && !this.gracePeriod && this.selectionChanged()) {
            if (n = this.getSelection(),
            t = this.cm,
            no && ge && this.cm.options.gutters.length && sit(n.anchorNode)) {
                this.cm.triggerOnKeyDown({
                    type: "keydown",
                    keyCode: 8,
                    preventDefault: Math.abs
                }),
                this.blur(),
                this.focus();
                return
            }
            this.composing || (this.rememberSelection(),
            i = vs(t, n.anchorNode, n.anchorOffset),
            r = vs(t, n.focusNode, n.focusOffset),
            i && r && ot(t, function() {
                tt(t.doc, gi(i, r), gt),
                (i.bad || r.bad) && (t.curOp.selectionChanged = !0)
            }))
        }
    }
    ,
    c.prototype.pollContent = function() {
        var d, v, b, k, y, g, i, e, nt, tt;
        this.readDOMTimeout != null && (clearTimeout(this.readDOMTimeout),
        this.readDOMTimeout = null);
        var r = this.cm
          , f = r.display
          , it = r.doc.sel.primary()
          , c = it.from()
          , a = it.to();
        if ((c.ch == 0 && c.line > r.firstLine() && (c = n(c.line - 1, t(r.doc, c.line - 1).length)),
        a.ch == t(r.doc, a.line).text.length && a.line < r.lastLine() && (a = n(a.line + 1, 0)),
        c.line < f.viewFrom || a.line > f.viewTo - 1) || (c.line == f.viewFrom || (d = br(r, c.line)) == 0 ? (v = h(f.view[0].line),
        b = f.view[0].node) : (v = h(f.view[d].line),
        b = f.view[d - 1].node.nextSibling),
        k = br(r, a.line),
        k == f.view.length - 1 ? (y = f.viewTo - 1,
        g = f.lineDiv.lastChild) : (y = h(f.view[k + 1].line) - 1,
        g = f.view[k + 1].node.previousSibling),
        !b))
            return !1;
        for (i = r.doc.splitLines(hit(r, b, g, v, y)),
        e = fr(r.doc, n(v, 0), n(y, t(r.doc, y).text.length)); i.length > 1 && e.length > 1; )
            if (s(i) == s(e))
                i.pop(),
                e.pop(),
                y--;
            else if (i[0] == e[0])
                i.shift(),
                e.shift(),
                v++;
            else
                break;
        for (var o = 0, l = 0, rt = i[0], ut = e[0], ft = Math.min(rt.length, ut.length); o < ft && rt.charCodeAt(o) == ut.charCodeAt(o); )
            ++o;
        for (var p = s(i), w = s(e), et = Math.min(p.length - (i.length == 1 ? o : 0), w.length - (e.length == 1 ? o : 0)); l < et && p.charCodeAt(p.length - l - 1) == w.charCodeAt(w.length - l - 1); )
            ++l;
        if (i.length == 1 && e.length == 1 && v == c.line)
            while (o && o > c.ch && p.charCodeAt(p.length - l - 1) == w.charCodeAt(w.length - l - 1))
                o--,
                l++;
        return i[i.length - 1] = p.slice(0, p.length - l).replace(/^\u200b+/, ""),
        i[0] = i[0].slice(o).replace(/\u200b+$/, ""),
        nt = n(v, o),
        tt = n(y, e.length ? s(e).length - l : 0),
        i.length > 1 || i[0] || u(nt, tt) ? (vu(r.doc, i, nt, tt, "+input"),
        !0) : void 0
    }
    ,
    c.prototype.ensurePolled = function() {
        this.forceCompositionEnd()
    }
    ,
    c.prototype.reset = function() {
        this.forceCompositionEnd()
    }
    ,
    c.prototype.forceCompositionEnd = function() {
        this.composing && (clearTimeout(this.readDOMTimeout),
        this.composing = null,
        this.updateFromDOM(),
        this.div.blur(),
        this.div.focus())
    }
    ,
    c.prototype.readFromDOMSoon = function() {
        var n = this;
        this.readDOMTimeout == null && (this.readDOMTimeout = setTimeout(function() {
            if (n.readDOMTimeout = null,
            n.composing)
                if (n.composing.done)
                    n.composing = null;
                else
                    return;
            n.updateFromDOM()
        }, 80))
    }
    ,
    c.prototype.updateFromDOM = function() {
        var n = this;
        (this.cm.isReadOnly() || !this.pollContent()) && ot(this.cm, function() {
            return et(n.cm)
        })
    }
    ,
    c.prototype.setUneditable = function(n) {
        n.contentEditable = "false"
    }
    ,
    c.prototype.onKeyPress = function(n) {
        n.charCode == 0 || this.composing || (n.preventDefault(),
        this.cm.isReadOnly() || b(this.cm, gl)(this.cm, String.fromCharCode(n.charCode == null ? n.keyCode : n.charCode), 0))
    }
    ,
    c.prototype.readOnlyChanged = function(n) {
        this.div.contentEditable = String(n != "nocursor")
    }
    ,
    c.prototype.onContextMenu = function() {}
    ,
    c.prototype.resetPosition = function() {}
    ,
    c.prototype.needsContentAttribute = !0,
    y = function(n) {
        this.cm = n,
        this.prevInput = "",
        this.pollingFast = !1,
        this.polling = new wi,
        this.hasSelection = !1,
        this.composing = null
    }
    ,
    y.prototype.init = function(n) {
        function o(n) {
            if (!w(t, n)) {
                if (t.somethingSelected())
                    as({
                        lineWise: !1,
                        text: t.getSelections()
                    });
                else if (t.options.lineWiseCopyCut) {
                    var r = bb(t);
                    as({
                        lineWise: !0,
                        text: r.text
                    }),
                    n.type == "cut" ? t.setSelections(r.ranges, null, gt) : (i.prevInput = "",
                    u.value = r.text.join("\n"),
                    iu(u))
                } else
                    return;
                n.type == "cut" && (t.state.cutIncoming = !0)
            }
        }
        var f = this, i = this, t = this.cm, u;
        this.createField(n),
        u = this.textarea,
        n.wrapper.insertBefore(this.wrapper, n.wrapper.firstChild),
        ff && (u.style.width = "0px"),
        r(u, "input", function() {
            e && l >= 9 && f.hasSelection && (f.hasSelection = null),
            i.poll()
        }),
        r(u, "paste", function(n) {
            w(t, n) || pb(n, t) || (t.state.pasteIncoming = !0,
            i.fastPoll())
        }),
        r(u, "cut", o),
        r(u, "copy", o),
        r(n.scroller, "paste", function(r) {
            hi(n, r) || w(t, r) || (t.state.pasteIncoming = !0,
            i.focus())
        }),
        r(n.lineSpace, "selectstart", function(t) {
            hi(n, t) || ft(t)
        }),
        r(u, "compositionstart", function() {
            var n = t.getCursor("from");
            i.composing && i.composing.range.clear(),
            i.composing = {
                start: n,
                range: t.markText(n, t.getCursor("to"), {
                    className: "CodeMirror-composing"
                })
            }
        }),
        r(u, "compositionend", function() {
            i.composing && (i.poll(),
            i.composing.range.clear(),
            i.composing = null)
        })
    }
    ,
    y.prototype.createField = function() {
        this.wrapper = db(),
        this.textarea = this.wrapper.firstChild
    }
    ,
    y.prototype.prepareSelection = function() {
        var n = this.cm
          , t = n.display
          , e = n.doc
          , i = py(n);
        if (n.options.moveInputWithCursor) {
            var r = kt(n, e.sel.primary().head, "div")
              , u = t.wrapper.getBoundingClientRect()
              , f = t.lineDiv.getBoundingClientRect();
            i.teTop = Math.max(0, Math.min(t.wrapper.clientHeight - 10, r.top + f.top - u.top)),
            i.teLeft = Math.max(0, Math.min(t.wrapper.clientWidth - 10, r.left + f.left - u.left))
        }
        return i
    }
    ,
    y.prototype.showSelection = function(n) {
        var i = this.cm
          , t = i.display;
        ct(t.cursorDiv, n.cursors),
        ct(t.selectionDiv, n.selection),
        n.teTop != null && (this.wrapper.style.top = n.teTop + "px",
        this.wrapper.style.left = n.teLeft + "px")
    }
    ,
    y.prototype.reset = function(n) {
        var t, i;
        this.contextMenuPending || this.composing || (t = this.cm,
        t.somethingSelected() ? (this.prevInput = "",
        i = t.getSelection(),
        this.textarea.value = i,
        t.state.focused && iu(this.textarea),
        e && l >= 9 && (this.hasSelection = i)) : n || (this.prevInput = this.textarea.value = "",
        e && l >= 9 && (this.hasSelection = null)))
    }
    ,
    y.prototype.getField = function() {
        return this.textarea
    }
    ,
    y.prototype.supportsTouch = function() {
        return !1
    }
    ,
    y.prototype.focus = function() {
        if (this.cm.options.readOnly != "nocursor" && (!ef || ei() != this.textarea))
            try {
                this.textarea.focus()
            } catch (n) {}
    }
    ,
    y.prototype.blur = function() {
        this.textarea.blur()
    }
    ,
    y.prototype.resetPosition = function() {
        this.wrapper.style.top = this.wrapper.style.left = 0
    }
    ,
    y.prototype.receivedFocus = function() {
        this.slowPoll()
    }
    ,
    y.prototype.slowPoll = function() {
        var n = this;
        this.pollingFast || this.polling.set(this.cm.options.pollInterval, function() {
            n.poll(),
            n.cm.state.focused && n.slowPoll()
        })
    }
    ,
    y.prototype.fastPoll = function() {
        function i() {
            var r = n.poll();
            r || t ? (n.pollingFast = !1,
            n.slowPoll()) : (t = !0,
            n.polling.set(60, i))
        }
        var t = !1
          , n = this;
        n.pollingFast = !0,
        n.polling.set(20, i)
    }
    ,
    y.prototype.poll = function() {
        var i = this, n = this.cm, f = this.textarea, r = this.prevInput, t, o, u, s;
        if (this.contextMenuPending || !n.state.focused || id(f) && !r && !this.composing || n.isReadOnly() || n.options.disableInput || n.state.keySeq || (t = f.value,
        t == r && !n.somethingSelected()))
            return !1;
        if (e && l >= 9 && this.hasSelection === t || wt && /[\uf700-\uf7ff]/.test(t))
            return n.display.input.reset(),
            !1;
        if (n.doc.sel == n.display.selForContextMenu && (o = t.charCodeAt(0),
        o != 8203 || r || (r = "​"),
        o == 8666))
            return this.reset(),
            this.cm.execCommand("undo");
        for (u = 0,
        s = Math.min(r.length, t.length); u < s && r.charCodeAt(u) == t.charCodeAt(u); )
            ++u;
        return ot(n, function() {
            gl(n, t.slice(u), r.length - u, null, i.composing ? "*compose" : null),
            t.length > 1e3 || t.indexOf("\n") > -1 ? f.value = i.prevInput = "" : i.prevInput = t,
            i.composing && (i.composing.range.clear(),
            i.composing.range = n.markText(i.composing.start, n.getCursor("to"), {
                className: "CodeMirror-composing"
            }))
        }),
        !0
    }
    ,
    y.prototype.ensurePolled = function() {
        this.pollingFast && this.poll() && (this.pollingFast = !1)
    }
    ,
    y.prototype.onKeyPress = function() {
        e && l >= 9 && (this.hasSelection = null),
        this.fastPoll()
    }
    ,
    y.prototype.onContextMenu = function(n) {
        function p() {
            if (u.selectionStart != null) {
                var n = t.somethingSelected()
                  , r = "​" + (n ? u.value : "");
                u.value = "⇚",
                u.value = r,
                f.prevInput = n ? "" : "​",
                u.selectionStart = 1,
                u.selectionEnd = r.length,
                i.selForContextMenu = t.doc.sel
            }
        }
        function w() {
            if (f.contextMenuPending = !1,
            f.wrapper.style.cssText = v,
            u.style.cssText = a,
            e && l < 9 && i.scrollbars.setScrollTop(i.scroller.scrollTop = k),
            u.selectionStart != null) {
                (!e || e && l < 9) && p();
                var r = 0
                  , n = function() {
                    i.selForContextMenu == t.doc.sel && u.selectionStart == 0 && u.selectionEnd > 0 && f.prevInput == "​" ? b(t, ew)(t) : r++ < 10 ? i.detectingSelectAll = setTimeout(n, 500) : (i.selForContextMenu = null,
                    i.input.reset())
                };
                i.detectingSelectAll = setTimeout(n, 200)
            }
        }
        var f = this, t = f.cm, i = t.display, u = f.textarea, o = wr(t, n), k = i.scroller.scrollTop, c, a, v, s, y, h;
        o && !pt && (c = t.options.resetSelectionOnContextMenu,
        c && t.doc.sel.contains(o) == -1 && b(t, tt)(t.doc, gi(o), gt),
        a = u.style.cssText,
        v = f.wrapper.style.cssText,
        f.wrapper.style.cssText = "position: absolute",
        s = f.wrapper.getBoundingClientRect(),
        u.style.cssText = "position: absolute; width: 30px; height: 30px;\n      top: " + (n.clientY - s.top - 5) + "px; left: " + (n.clientX - s.left - 5) + "px;\n      z-index: 1000; background: " + (e ? "rgba(255, 255, 255, .05)" : "transparent") + ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);",
        nt && (y = window.scrollY),
        i.input.focus(),
        nt && window.scrollTo(null, y),
        i.input.reset(),
        t.somethingSelected() || (u.value = f.prevInput = " "),
        f.contextMenuPending = !0,
        i.selForContextMenu = t.doc.sel,
        clearTimeout(i.detectingSelectAll),
        e && l >= 9 && p(),
        to ? (yf(n),
        h = function() {
            lt(window, "mouseup", h),
            setTimeout(w, 20)
        }
        ,
        r(window, "mouseup", h)) : setTimeout(w, 50))
    }
    ,
    y.prototype.readOnlyChanged = function(n) {
        n || this.reset(),
        this.textarea.disabled = n == "nocursor"
    }
    ,
    y.prototype.setUneditable = function() {}
    ,
    y.prototype.needsContentAttribute = !1,
    rit(a),
    oit(a),
    tk = "iter insert remove copy getEditor constructor".split(" ");
    for (de in ut.prototype)
        ut.prototype.hasOwnProperty(de) && d(tk, de) < 0 && (a.prototype[de] = function(n) {
            return function() {
                return n.apply(this.doc, arguments)
            }
        }(ut.prototype[de]));
    return uu(ut),
    a.inputStyles = {
        textarea: y,
        contenteditable: c
    },
    a.defineMode = function(n) {
        a.defaults.mode || n == "null" || (a.defaults.mode = n),
        fd.apply(this, arguments)
    }
    ,
    a.defineMIME = ed,
    a.defineMode("null", function() {
        return {
            token: function(n) {
                return n.skipToEnd()
            }
        }
    }),
    a.defineMIME("text/plain", "null"),
    a.defineExtension = function(n, t) {
        a.prototype[n] = t
    }
    ,
    a.defineDocExtension = function(n, t) {
        ut.prototype[n] = t
    }
    ,
    a.fromTextArea = lit,
    ait(a),
    a.version = "5.39.0",
    a
}),
_completion_overloadsActive = !1,
_completion_overloadsMouseOver = !1,
$("body").click(function() {
    _completion_overloadsMouseOver || $(".hint-overloads").remove()
}),
$("body").keyup(function(n) {
    (n.keyCode == 37 || n.keyCode == 39 || n.keyCode == 8) && (_completion_overloadsActive || $(".hint-overloads").remove())
}),
function(n) {
    typeof exports == "object" && typeof module == "object" ? n(require("../../lib/codemirror")) : typeof define == "function" && define.amd ? define(["../../lib/codemirror"], n) : n(CodeMirror)
}(function(n) {
    "use strict";
    function i(n, t) {
        this.cm = n,
        this.options = t,
        this.widget = null,
        this.debounce = 0,
        this.tick = 0,
        this.startPos = this.cm.getCursor("start"),
        this.startLen = this.cm.getLine(this.startPos.line).length - this.cm.getSelection().length;
        var i = this;
        n.on("cursorActivity", this.activityFunc = function() {
            i.cursorActivity()
        }
        )
    }
    function o(n, t, i) {
        var e = n.options.hintOptions, f = {}, r;
        for (r in u)
            f[r] = u[r];
        if (e)
            for (r in e)
                e[r] !== undefined && (f[r] = e[r]);
        if (i)
            for (r in i)
                i[r] !== undefined && (f[r] = i[r]);
        return f.hint.resolve && (f.hint = f.hint.resolve(n, t)),
        f
    }
    function r(n) {
        return typeof n == "string" ? n : s(n)
    }
    function s(n) {
        var t = n.Name;
        return n.ItemType != 2 && (n.ItemType != 3 || n.IsStatic) || n.IsGeneric && !n.IsExtension && (t += "<>"),
        t
    }
    function v(n, t) {
        function o(n, i) {
            var r;
            r = typeof i != "string" ? function(n) {
                return i(n, t)
            }
            : f.hasOwnProperty(i) ? f[i] : i,
            e[n] = r
        }
        var f = {
            Up: function() {
                t.moveFocus(-1)
            },
            Down: function() {
                t.moveFocus(1)
            },
            PageUp: function() {
                t.moveFocus(-t.menuSize() + 1, !0)
            },
            PageDown: function() {
                t.moveFocus(t.menuSize() - 1, !0)
            },
            Home: function() {
                t.setFocus(0)
            },
            End: function() {
                t.setFocus(t.length - 1)
            },
            Enter: t.pick,
            Tab: t.pick,
            Esc: t.close
        }, r = n.options.customKeys, e = r ? {} : f, u, i;
        if (r)
            for (i in r)
                r.hasOwnProperty(i) && o(i, r[i]);
        if (u = n.options.extraKeys,
        u)
            for (i in u)
                u.hasOwnProperty(i) && o(i, u[i]);
        return e
    }
    function h(n, t) {
        while (t && t != n) {
            if (t.nodeName.toUpperCase() === "LI" && t.parentNode == n)
                return t;
            t = t.parentNode
        }
    }
    function c(i, u) {
        var p, y, w, nt, tt, ot, ut, it, b, st;
        this.itemTypes = ["variable-type", "property-type", "method-type", "class-type", "namespace-type"],
        this.completion = i,
        this.data = u,
        this.picked = !1;
        var s = this
          , e = i.cm
          , f = this.hints = document.createElement("ul");
        for (f.className = "CodeMirror-hints",
        this.selectedHint = u.selectedHint || 0,
        p = this.buildOutputItems(u.list),
        y = 0; y < p.length; ++y) {
            var k = f.appendChild(document.createElement("li"))
              , l = p[y]
              , rt = a + (y != this.selectedHint ? "" : " " + t);
            l.className != null && (rt = l.className + " " + rt),
            k.className = rt,
            l.render ? l.render(k, u, l) : k.appendChild(document.createTextNode(l.displayText || r(l))),
            k.hintId = y
        }
        var c = e.cursorCoords(i.options.alignWithWord ? u.from : null)
          , d = c.left
          , g = c.bottom
          , ft = !0;
        f.style.left = d + "px",
        f.style.top = g + "px",
        w = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth),
        nt = window.innerHeight || Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
        (i.options.container || document.body).appendChild(f);
        var o = f.getBoundingClientRect()
          , ht = o.bottom - nt
          , ct = f.scrollHeight > f.clientHeight + 1
          , et = e.getScrollInfo();
        if (ht > 0 && (tt = o.bottom - o.top,
        ot = c.top - (c.bottom - o.top),
        ot - tt > 0 ? (f.style.top = (g = c.top - tt) + "px",
        ft = !1) : tt > nt && (f.style.height = nt - 5 + "px",
        f.style.top = (g = c.bottom - o.top) + "px",
        ut = e.getCursor(),
        u.from.ch != ut.ch && (c = e.cursorCoords(ut),
        f.style.left = (d = c.left) + "px",
        o = f.getBoundingClientRect()))),
        it = o.right - w,
        it > 0 && (o.right - o.left > w && (f.style.width = w - 5 + "px",
        it -= o.right - o.left - w),
        f.style.left = (d = c.left - it) + "px"),
        ct)
            for (b = f.firstChild; b; b = b.nextSibling)
                b.style.paddingRight = e.display.nativeBarWidth + "px";
        if (e.addKeyMap(this.keyMap = v(i, {
            moveFocus: function(n, t) {
                s.changeActive(s.selectedHint + n, t)
            },
            setFocus: function(n) {
                s.changeActive(n)
            },
            menuSize: function() {
                return s.screenAmount()
            },
            length: p.length,
            close: function() {
                i.close()
            },
            pick: function() {
                s.pick()
            },
            data: u
        })),
        i.options.closeOnUnfocus) {
            e.on("blur", this.onBlur = function() {
                st = setTimeout(function() {
                    _completion_overloadsActive || i.close()
                }, 100)
            }
            );
            e.on("focus", this.onFocus = function() {
                clearTimeout(st)
            }
            )
        }
        e.on("scroll", this.onScroll = function() {
            var t = e.getScrollInfo()
              , r = e.getWrapperElement().getBoundingClientRect()
              , u = g + et.top - t.top
              , n = u - (window.pageYOffset || (document.documentElement || document.body).scrollTop);
            if (ft || (n += f.offsetHeight),
            n <= r.top || n >= r.bottom)
                return i.close();
            f.style.top = u + "px",
            f.style.left = d + et.left - t.left + "px"
        }
        );
        n.on(f, "dblclick", function(n) {
            var t = h(f, n.target || n.srcElement);
            t && t.hintId != null && (s.changeActive(t.hintId),
            s.pick())
        });
        n.on(f, "click", function(n) {
            var t = h(f, n.target || n.srcElement);
            t && t.hintId != null && i.options.completeOnSingleClick && (s.changeActive(t.hintId),
            s.pick())
        });
        n.on(f, "mousedown", function() {
            setTimeout(function() {
                e.focus()
            }, 20)
        });
        n.on(f, "mouseover", function(n) {
            var t = n.target || n.srcElement;
            t.hintId != null && s.changeActive(t.hintId)
        });
        return n.signal(u, "select", p[this.selectedHint], f.childNodes[this.selectedHint]),
        !0
    }
    function y(n, t) {
        var r, i;
        if (!n.somethingSelected())
            return t;
        for (r = [],
        i = 0; i < t.length; i++)
            t[i].supportsSelection && r.push(t[i]);
        return r
    }
    function l(n, t, i, r) {
        if (n.async)
            n(t, r, i);
        else {
            var u = n(t, i);
            u && u.then ? u.then(r) : r(u)
        }
    }
    function p(t, i) {
        var u = t.getHelpers(i, "hint"), f, r;
        return u.length ? (r = function(n, t, i) {
            function f(u) {
                if (u == r.length)
                    return t(null);
                l(r[u], n, i, function(n) {
                    n && n.list.length > 0 ? t(n) : f(u + 1)
                })
            }
            var r = y(n, u);
            f(0)
        }
        ,
        r.async = !0,
        r.supportsSelection = !0,
        r) : (f = t.getHelper(t.getCursor(), "hintWords")) ? function(t) {
            return n.hint.fromList(t, {
                words: f
            })
        }
        : n.hint.anyword ? function(t, i) {
            return n.hint.anyword(t, i)
        }
        : function() {}
    }
    var a = "CodeMirror-hint", t = "CodeMirror-hint-active", f, e, u;
    n.showHint = function(n, t, i) {
        var r, u;
        if (!t)
            return n.showHint(i);
        if (i && i.async && (t.async = !0),
        r = {
            hint: t
        },
        i)
            for (u in i)
                r[u] = i[u];
        return n.showHint(r)
    }
    ,
    n.showOverloads = function(t, r, u) {
        if ((u = o(t, t.getCursor("start"), u),
        !t.somethingSelected()) && u.hint != null && r != null) {
            t.state.completionActive && t.state.completionActive.close();
            var f = t.state.completionActive = new i(t,u || {});
            n.signal(t, "startCompletion", t),
            r(t, function(t, i) {
                i.IsInsideArgumentList && u.hint(t, function(n) {
                    n != null && n.list.length != 0 && ($(".hint-overloads").remove(),
                    f.showOverloadsContainer(n.list[0], !1, t.getCursor(), i))
                }, u, n.Pos(i.ParentLine, i.ParentChar))
            })
        }
    }
    ,
    n.defineExtension("showHint", function(t) {
        var r, u, f;
        if (t = o(this, this.getCursor("start"), t),
        r = this.listSelections(),
        !(r.length > 1)) {
            if (this.somethingSelected()) {
                if (!t.hint.supportsSelection)
                    return;
                for (u = 0; u < r.length; u++)
                    if (r[u].head.line != r[u].anchor.line)
                        return
            }
            (this.state.completionActive && this.state.completionActive.close(),
            f = this.state.completionActive = new i(this,t),
            f.options.hint) && (n.signal(this, "startCompletion", this),
            f.update(!0))
        }
    }),
    f = window.requestAnimationFrame || function(n) {
        return setTimeout(n, 1e3 / 60)
    }
    ,
    e = window.cancelAnimationFrame || clearTimeout,
    i.prototype = {
        close: function() {
            this.active() ? (this.cm.state.completionActive = null,
            this.tick = null,
            this.widget && this.data && n.signal(this.data, "close"),
            this.widget && this.widget.close()) : $("ul.CodeMirror-hints").remove(),
            n.signal(this.cm, "endCompletion", this.cm)
        },
        active: function() {
            return this.cm.state.completionActive == this
        },
        pick: function(t, i) {
            var u = t.list[i], e = u.ItemType == 2 || u.ItemType == 3 && !u.IsStatic, f, o;
            u.hint ? u.hint(this.cm, t, u) : this.cm.replaceRange(r(u) + (e ? "()" : ""), u.from || t.from, u.to || t.to, "complete"),
            n.signal(t, "pick", u),
            this.close(),
            e && u.ConstructorsOrOverloads != null && u.ConstructorsOrOverloads.length > 0 && (f = this.cm.getCursor(),
            this.cm.setCursor(f.line, f.ch - 1),
            $(".hint-overloads").remove(),
            o = this,
            setTimeout(function() {
                o.showOverloadsContainer(u, env.siteMode == siteModes.mobile)
            }, 10))
        },
        showOverloadsContainer: function(t, i, u, f) {
            var e, p, s, v, h, c, a, w, o, y, l;
            if (u == null && (u = this.cm.getCursor()),
            _completion_overloadsActive = !0,
            t.ConstructorsOrOverloads != null && t.ConstructorsOrOverloads.length > 0) {
                for (e = $("<div/>"),
                e.addClass("hint-overloads"),
                p = 0; p < t.ConstructorsOrOverloads.length; p++) {
                    if (s = t.ConstructorsOrOverloads[p],
                    o = $("<div/>"),
                    o.addClass("hint-overloads-item"),
                    o.append("("),
                    s.Params != null && s.Params.length > 0)
                        for (v = 0; v < s.Params.length; v++)
                            h = s.Params[v],
                            c = $("<span/>"),
                            c.addClass("hint-overloads-item-param"),
                            c.attr("description", h.Description || ""),
                            c.attr("name", h.Name),
                            c.attr("type", h.Type),
                            a = h.Type + " " + h.Name,
                            h.IsOptional && (a = "[" + a + "]"),
                            h.IsParams && (a = "params " + a),
                            c.append(a),
                            o.append(c),
                            v + 1 != s.Params.length && o.append(", ");
                    else
                        o.append("&lt;no parameters&gt;");
                    o.append(")"),
                    o.append(s.Returns != null ? " : " + s.Returns : " "),
                    o.append($("<span/>").addClass("hint-overloads-item-description").append(s.Description)),
                    e.append(o)
                }
                w = e.children().sort(function(n, t) {
                    var i = $(n).text()
                      , r = $(t).text();
                    return i < r ? -1 : i > r ? 1 : 0
                }),
                e.hide().empty().append(w),
                i && (o = $('<a href="javascript:void(0);" class="back-to-list">&larr; Back to list<\/a>'),
                e.prepend(o)),
                $("body").append(e),
                y = this.widget,
                l = this,
                setTimeout(function() {
                    var i = y != null ? $(y.hints).offset() : l.cm.cursorCoords(), r = y != null ? $(y.hints).outerWidth() : 0, n = 0, u = i.top + (r > 0 ? 0 : 13), f, t;
                    n = env.siteMode == siteModes.mobile ? $(".CodeMirror-sizer").offset().left : i.left + r,
                    e.offset({
                        top: u,
                        left: n
                    }),
                    e.css("max-width", $("body").width() - n),
                    f = 0,
                    t = env.siteMode == siteModes.mobile ? $(".CodeMirror-scroll").height() + $(".CodeMirror-scroll").offset().top - $(".hint-overloads").offset().top : $("body").height() - u,
                    e.css("max-height", t),
                    env.siteMode == siteModes.mobile && (e.css("height", t),
                    e.css("width", $("body").width() - n)),
                    e.show()
                }, 100),
                e.mouseenter(function() {
                    _completion_overloadsMouseOver = !0
                }).mouseleave(function() {
                    _completion_overloadsMouseOver = !1
                }),
                $(".hint-overloads-item").click(showActiveOverloadDescription),
                $(".hint-overloads .back-to-list").click(function(i) {
                    i.preventDefault(),
                    i.stopPropagation();
                    var f = r(t).length + 1;
                    l.cm.replaceRange("", {
                        line: u.line,
                        ch: u.ch - f
                    }, {
                        line: u.line,
                        ch: u.ch + 1
                    }),
                    l.cm.setCursor(u.line, u.ch - f),
                    l.cm.focus(),
                    n.showHint(l.cm, n.hint.vbcsharp, {
                        async: !0
                    }),
                    $(".hint-overloads").remove()
                }),
                $($(".hint-overloads-item")[0]).addClass("active"),
                n.hint.highlightArgument(l.cm, f),
                $(".hint-overloads .back-to-list").addClass("active")
            }
        },
        cursorActivity: function() {
            var n, t, i;
            this.debounce && (e(this.debounce),
            this.debounce = 0),
            n = this.cm.getCursor(),
            t = this.cm.getLine(n.line),
            n.line != this.startPos.line || t.length - n.ch != this.startLen - this.startPos.ch || n.ch < this.startPos.ch || this.cm.somethingSelected() || n.ch && this.options.closeCharacters.test(t.charAt(n.ch - 1)) ? this.close() : (i = this,
            this.debounce = f(function() {
                i.update()
            }),
            this.widget && this.widget.disable())
        },
        update: function(n) {
            if (this.tick != null) {
                var t = this
                  , i = ++this.tick;
                l(this.options.hint, this.cm, this.options, function(r) {
                    t.tick == i && t.finishUpdate(r, n)
                })
            }
        },
        finishUpdate: function(t, i) {
            this.data && n.signal(this.data, "update");
            var r = this.widget && this.widget.picked || i && this.options.completeSingle;
            this.widget && this.widget.close(),
            this.data = t,
            t && t.list.length && (r && t.list.length == 1 ? this.pick(t, 0) : (this.widget = new c(this,t),
            n.signal(t, "shown")))
        }
    },
    c.prototype = {
        close: function() {
            this.completion.widget = null,
            this.hints.parentNode != null && this.hints.parentNode.removeChild(this.hints),
            this.completion.cm.removeKeyMap(this.keyMap);
            var n = this.completion.cm;
            this.completion.options.closeOnUnfocus && (n.off("blur", this.onBlur),
            n.off("focus", this.onFocus)),
            n.off("scroll", this.onScroll)
        },
        disable: function() {
            this.completion.cm.removeKeyMap(this.keyMap);
            var n = this;
            this.keyMap = {
                Enter: function() {
                    n.picked = !0
                }
            },
            this.completion.cm.addKeyMap(this.keyMap)
        },
        pick: function() {
            this.completion.pick(this.data, this.selectedHint),
            this.close()
        },
        changeActive: function(i, r) {
            var u, e, f;
            (i >= this.data.list.length ? i = r ? this.data.list.length - 1 : 0 : i < 0 && (i = r ? 0 : this.data.list.length - 1),
            this.selectedHint != i) && (u = this.hints.childNodes[this.selectedHint],
            u && (u.className = u.className.replace(" " + t, "")),
            u = this.hints.childNodes[this.selectedHint = i],
            u.className += " " + t,
            u.offsetTop < this.hints.scrollTop ? this.hints.scrollTop = u.offsetTop - 3 : u.offsetTop + u.offsetHeight > this.hints.scrollTop + this.hints.clientHeight && (this.hints.scrollTop = u.offsetTop + u.offsetHeight - this.hints.clientHeight + 3),
            e = this,
            f = this.data.list[i],
            $(".hint-overloads").remove(),
            f.ItemType != 2 && (f.ItemType != 3 || f.IsStatic) || env.siteMode == siteModes.mobile || env.siteMode == siteModes.widget || (e.completion.showOverloadsContainer(f),
            _completion_overloadsActive = !1),
            n.signal(this.data, "select", this.data.list[this.selectedHint], u))
        },
        screenAmount: function() {
            return Math.floor(this.hints.clientHeight / this.hints.firstChild.offsetHeight) || 1
        },
        buildOutputItems: function(n) {
            for (var r = [], f = n.length > 13, u = this.itemTypes, i, t = 0; t < n.length; t++)
                i = n[t],
                r.push({
                    text: s(i),
                    itemType: i.ItemType,
                    type: i.Type,
                    render: function(n, t, i) {
                        $(n).html('<span class="item-type ' + u[i.itemType] + '"><\/span>' + i.text + ""),
                        $(n).attr("title", (i.type ? i.type + " " : "") + i.text)
                    }
                });
            return r
        }
    },
    n.registerHelper("hint", "auto", {
        resolve: p
    }),
    n.registerHelper("hint", "fromList", function(t, i) {
        var r = t.getCursor(), u = t.getTokenAt(r), f, h = n.Pos(r.line, u.start), c = r, e, o, s;
        for (u.start < r.ch && /\w/.test(u.string.charAt(r.ch - u.start - 1)) ? f = u.string.substr(0, r.ch - u.start) : (f = "",
        h = r),
        e = [],
        o = 0; o < i.words.length; o++)
            s = i.words[o],
            s.slice(0, f.length) == f && e.push(s);
        if (e.length)
            return {
                list: e,
                from: h,
                to: c
            }
    }),
    n.commands.autocomplete = n.showHint,
    u = {
        hint: n.hint.auto,
        completeSingle: !0,
        alignWithWord: !0,
        closeCharacters: /[\s()\[\]{};:>,]/,
        closeOnUnfocus: !0,
        completeOnSingleClick: !0,
        container: null,
        customKeys: null,
        extraKeys: null
    },
    n.defineOption("hintOptions", null)
}),
function(n) {
    typeof exports == "object" && typeof module == "object" ? n(require("../../lib/codemirror")) : typeof define == "function" && define.amd ? define(["../../lib/codemirror"], n) : n(CodeMirror)
}(function(n) {
    "use strict";
    function h(t, i) {
        function u(t) {
            if (!r.parentNode)
                return n.off(document, "mousemove", u);
            r.style.top = Math.max(0, t.clientY - r.offsetHeight - 5) + "px",
            r.style.left = t.clientX + 5 + "px"
        }
        var r = document.createElement("div");
        r.className = "CodeMirror-lint-tooltip",
        r.appendChild(i.cloneNode(!0)),
        document.body.appendChild(r);
        n.on(document, "mousemove", u);
        return u(t),
        r.style.opacity != null && (r.style.opacity = 1),
        r
    }
    function u(n) {
        n.parentNode && n.parentNode.removeChild(n)
    }
    function c(n) {
        n.parentNode && (n.style.opacity == null && u(n),
        n.style.opacity = 0,
        setTimeout(function() {
            u(n)
        }, 100))
    }
    function f(t, i, r) {
        function f() {
            n.off(r, "mouseout", f),
            u && (c(u),
            u = null)
        }
        var u = h(t, i)
          , e = setInterval(function() {
            if (u)
                for (var n = r; ; n = n.parentNode) {
                    if (n && n.nodeType == 11 && (n = n.host),
                    n == document.body)
                        return;
                    if (!n) {
                        f();
                        break
                    }
                }
            if (!u)
                return clearInterval(e)
        }, 400);
        n.on(r, "mouseout", f)
    }
    function l(n, t, i) {
        this.marked = [],
        this.options = t,
        this.timeout = null,
        this.hasGutter = i,
        this.onMouseOver = function(t) {
            k(n, t)
        }
        ,
        this.waitingFor = 0
    }
    function a(n, t) {
        return t instanceof Function ? {
            getAnnotations: t
        } : (t && t !== !0 || (t = {}),
        t)
    }
    function e(n) {
        var i = n.state.lint, r;
        for (i.hasGutter && n.clearGutter(t),
        r = 0; r < i.marked.length; ++r)
            i.marked[r].clear();
        i.marked.length = 0
    }
    function v(t, i, r, u) {
        var e = document.createElement("div")
          , o = e;
        if (e.className = "CodeMirror-lint-marker-" + i,
        r && (o = e.appendChild(document.createElement("div")),
        o.className = "CodeMirror-lint-marker-multiple"),
        u != !1)
            n.on(o, "mouseover", function(n) {
                f(n, t, o)
            });
        return e
    }
    function y(n, t) {
        return n == "error" ? n : t
    }
    function p(n) {
        for (var i = [], r, u, t = 0; t < n.length; ++t)
            r = n[t],
            u = r.from.line,
            (i[u] || (i[u] = [])).push(r);
        return i
    }
    function o(n) {
        var i = n.severity, t;
        return i || (i = "error"),
        t = document.createElement("div"),
        t.className = "CodeMirror-lint-message-" + i,
        typeof n.messageHTML != "undefined" ? t.innerHTML = n.messageHTML : t.appendChild(document.createTextNode(n.message)),
        t
    }
    function w(t, i, u) {
        function f() {
            o = -1,
            t.off("change", f)
        }
        var e = t.state.lint
          , o = ++e.waitingFor;
        t.on("change", f);
        i(t.getValue(), function(i, u) {
            (t.off("change", f),
            e.waitingFor == o) && (u && i instanceof n && (i = u),
            t.operation(function() {
                r(t, i)
            }))
        }, u, t)
    }
    function i(t) {
        var o = t.state.lint, u = o.options, e = u.options || u, f = u.getAnnotations || t.getHelper(n.Pos(0, 0), "lint"), i;
        if (f)
            if (u.async || f.async)
                w(t, f, e);
            else {
                if (i = f(t.getValue(), e, t),
                !i)
                    return;
                i.then ? i.then(function(n) {
                    t.operation(function() {
                        r(t, n)
                    })
                }) : t.operation(function() {
                    r(t, i)
                })
            }
    }
    function r(n, i) {
        var f, s, l, b, a, r, h;
        e(n);
        var u = n.state.lint
          , c = u.options
          , w = p(i);
        for (f = 0; f < w.length; ++f)
            if (s = w[f],
            s) {
                for (l = null,
                b = u.hasGutter && document.createDocumentFragment(),
                a = 0; a < s.length; ++a)
                    r = s[a],
                    h = r.severity,
                    h || (h = "error"),
                    l = y(l, h),
                    c.formatAnnotation && (r = c.formatAnnotation(r)),
                    u.hasGutter && b.appendChild(o(r)),
                    r.to && u.marked.push(n.markText(r.from, r.to, {
                        className: "CodeMirror-lint-mark-" + h,
                        __annotation: r
                    }));
                u.hasGutter && n.setGutterMarker(f, t, v(b, l, s.length > 1, u.options.tooltips))
            }
        if (c.onUpdateLinting)
            c.onUpdateLinting(i, w, n)
    }
    function s(n) {
        var t = n.state.lint;
        t && (clearTimeout(t.timeout),
        t.timeout = setTimeout(function() {
            i(n)
        }, t.options.delay || 500))
    }
    function b(n, t) {
        for (var e = t.target || t.srcElement, r = document.createDocumentFragment(), u, i = 0; i < n.length; i++)
            u = n[i],
            r.appendChild(o(u));
        f(t, r, e)
    }
    function k(n, t) {
        var e = t.target || t.srcElement, r, f;
        if (/\bCodeMirror-lint-mark-/.test(e.className)) {
            var i = e.getBoundingClientRect()
              , s = (i.left + i.right) / 2
              , h = (i.top + i.bottom) / 2
              , o = n.findMarksAt(n.coordsChar({
                left: s,
                top: h
            }, "client"))
              , u = [];
            for (r = 0; r < o.length; ++r)
                f = o[r].__annotation,
                f && u.push(f);
            u.length && b(u, t)
        }
    }
    var t = "CodeMirror-lint-markers";
    n.defineOption("lint", !1, function(r, u, f) {
        var c, v, h, o;
        if (f && f != n.Init && (e(r),
        r.state.lint.options.lintOnChange !== !1 && r.off("change", s),
        n.off(r.getWrapperElement(), "mouseover", r.state.lint.onMouseOver),
        clearTimeout(r.state.lint.timeout),
        delete r.state.lint),
        u) {
            for (c = r.getOption("gutters"),
            v = !1,
            h = 0; h < c.length; ++h)
                c[h] == t && (v = !0);
            if (o = r.state.lint = new l(r,a(r, u),v),
            o.options.lintOnChange !== !1)
                r.on("change", s);
            if (o.options.tooltips != !1 && o.options.tooltips != "gutter")
                n.on(r.getWrapperElement(), "mouseover", o.onMouseOver);
            i(r)
        }
    }),
    n.defineExtension("performLint", function() {
        this.state.lint && i(this)
    })
}),
function(n) {
    typeof exports == "object" && typeof module == "object" ? n(require("../../lib/codemirror")) : typeof define == "function" && define.amd ? define(["../../lib/codemirror"], n) : n(CodeMirror)
}(function(n) {
    "use strict";
    function t(n, t) {
        if (!window.JSHINT)
            return window.console && window.console.error("Error: window.JSHINT not defined, CodeMirror JavaScript linting cannot run."),
            [];
        t.indent || (t.indent = 1),
        JSHINT(n, t, t.globals);
        var r = JSHINT.data().errors
          , u = [];
        return r && i(r, u),
        u
    }
    function i(t, i) {
        for (var r, f, e, o, s, u = 0; u < t.length; u++)
            if (r = t[u],
            r) {
                if (r.line <= 0) {
                    window.console && window.console.warn("Cannot display JSHint error (invalid line " + r.line + ")", r);
                    continue
                }
                f = r.character - 1,
                e = f + 1,
                r.evidence && (o = r.evidence.substring(f).search(/.\b/),
                o > -1 && (e += o)),
                s = {
                    message: r.reason,
                    severity: r.code ? r.code.startsWith("W") ? "warning" : "error" : "error",
                    from: n.Pos(r.line - 1, f),
                    to: n.Pos(r.line - 1, e)
                },
                i.push(s)
            }
    }
    n.registerHelper("lint", "javascript", t)
}),
function(n) {
    typeof exports == "object" && typeof module == "object" ? n(require("../../lib/codemirror")) : typeof define == "function" && define.amd ? define(["../../lib/codemirror"], n) : n(CodeMirror)
}(function(n) {
    "use strict";
    function a(n, t, i, r, u, f) {
        this.indented = n,
        this.column = t,
        this.type = i,
        this.info = r,
        this.align = u,
        this.prev = f
    }
    function c(n, t, i, r) {
        var u = n.indented;
        return n.context && n.context.type == "statement" && i != "statement" && (u = n.context.indented),
        n.context = new a(u,t,i,r,null,n.context)
    }
    function o(n) {
        var t = n.context.type;
        return (t == ")" || t == "]" || t == "}") && (n.indented = n.context.indented),
        n.context = n.context.prev
    }
    function y(n, t, i) {
        return t.prevToken == "variable" || t.prevToken == "type" ? !0 : /\S(?:[^- ]>|[*\]])\s*$|\*$/.test(n.string.slice(0, i)) ? !0 : t.typeAtEndOfLine && n.column() == n.indentation() ? !0 : void 0
    }
    function p(n) {
        for (; ; ) {
            if (!n || n.type == "top")
                return !0;
            if (n.type == "}" && n.prev.info != "namespace")
                return !1;
            n = n.prev
        }
    }
    function t(n) {
        for (var i = {}, r = n.split(" "), t = 0; t < r.length; ++t)
            i[r[t]] = !0;
        return i
    }
    function u(n, t) {
        return typeof n == "function" ? n(t) : n.propertyIsEnumerable(t)
    }
    function f(n, t) {
        if (!t.startOfLine)
            return !1;
        for (var i, r = null; i = n.peek(); ) {
            if (i == "\\" && n.match(/^.$/)) {
                r = f;
                break
            } else if (i == "/" && n.match(/^\/[\/\*]/, !1))
                break;
            n.next()
        }
        return t.tokenize = r,
        "meta"
    }
    function w(n, t) {
        return t.prevToken == "type" ? "type" : !1
    }
    function r(n) {
        return n.eatWhile(/[\w\.']/),
        "number"
    }
    function l(n, t) {
        if (n.backUp(1),
        n.match(/(R|u8R|uR|UR|LR)/)) {
            var i = n.match(/"([^\s\\()]{0,16})\(/);
            return i ? (t.cpp11RawStringDelim = i[1],
            t.tokenize = k,
            k(n, t)) : !1
        }
        return n.match(/(u8|u|U|L)/) ? n.match(/["']/, !1) ? "string" : !1 : (n.next(),
        !1)
    }
    function g(n) {
        var t = /(\w+)::~?(\w+)$/.exec(n);
        return t && t[1] == t[2]
    }
    function b(n, t) {
        for (var i; (i = n.next()) != null; )
            if (i == '"' && !n.eat('"')) {
                t.tokenize = null;
                break
            }
        return "string"
    }
    function k(n, t) {
        var i = t.cpp11RawStringDelim.replace(/[^\w\s]/g, "\\$&")
          , r = n.match(new RegExp(".*?\\)" + i + '"'));
        return r ? t.tokenize = null : n.skipToEnd(),
        "string"
    }
    function i(t, i) {
        function u(n) {
            if (n)
                for (var t in n)
                    n.hasOwnProperty(t) && r.push(t)
        }
        var r, f;
        for (typeof t == "string" && (t = [t]),
        r = [],
        u(i.keywords),
        u(i.types),
        u(i.builtin),
        u(i.atoms),
        r.length && (i.helperType = t[0],
        n.registerHelper("hintWords", t[0], r)),
        f = 0; f < t.length; ++f)
            n.defineMIME(t[f], i)
    }
    function nt(n, t) {
        for (var i = !1; !n.eol(); ) {
            if (!i && n.match('"""')) {
                t.tokenize = null;
                break
            }
            i = n.next() == "\\" && !i
        }
        return "string"
    }
    function v(n) {
        return function(t, i) {
            for (var r; r = t.next(); )
                if (r == "*" && t.eat("/"))
                    if (n == 1) {
                        i.tokenize = null;
                        break
                    } else
                        return i.tokenize = v(n - 1),
                        i.tokenize(t, i);
                else if (r == "/" && t.eat("*"))
                    return i.tokenize = v(n + 1),
                    i.tokenize(t, i);
            return "comment"
        }
    }
    function tt(n) {
        return function(t, i) {
            for (var r = !1, u, f = !1; !t.eol(); ) {
                if (!n && !r && t.match('"')) {
                    f = !0;
                    break
                }
                if (n && t.match('"""')) {
                    f = !0;
                    break
                }
                u = t.next(),
                !r && u == "$" && t.match("{") && t.skipTo("}"),
                r = !r && u == "\\" && !n
            }
            return (f || !n) && (i.tokenize = null),
            "string"
        }
    }
    function d(n) {
        return function(t, i) {
            for (var r = !1, f, u = !1; !t.eol(); ) {
                if (!r && t.match('"') && (n == "single" || t.match('""'))) {
                    u = !0;
                    break
                }
                if (!r && t.match("``")) {
                    h = d(n),
                    u = !0;
                    break
                }
                f = t.next(),
                r = n == "single" && !r && f == "\\"
            }
            return u && (i.tokenize = null),
            "string"
        }
    }
    var s, e, h;
    n.defineMode("clike", function(t, i) {
        function k(n, t) {
            var i = n.next(), o, e;
            if (f[i] && (o = f[i](n, t),
            o !== !1))
                return o;
            if (i == '"' || i == "'")
                return t.tokenize = at(i),
                t.tokenize(n, t);
            if (ht.test(i))
                return r = i,
                null;
            if (ct.test(i)) {
                if (n.backUp(1),
                n.match(lt))
                    return "number";
                n.next()
            }
            if (i == "/") {
                if (n.eat("*"))
                    return t.tokenize = d,
                    d(n, t);
                if (n.eat("/"))
                    return n.skipToEnd(),
                    "comment"
            }
            if (w.test(i)) {
                while (!n.match(/^\/[\/*]/, !1) && n.eat(w))
                    ;
                return "operator"
            }
            if (n.eatWhile(b),
            v)
                while (n.match(v))
                    n.eatWhile(b);
            return (e = n.current(),
            u(tt, e)) ? (u(l, e) && (r = "newstatement"),
            u(ut, e) && (s = !0),
            "keyword") : u(it, e) ? "type" : u(rt, e) ? (u(l, e) && (r = "newstatement"),
            "builtin") : u(ft, e) ? "atom" : "variable"
        }
        function at(n) {
            return function(t, i) {
                for (var r = !1, u, f = !1; (u = t.next()) != null; ) {
                    if (u == n && !r) {
                        f = !0;
                        break
                    }
                    r = !r && u == "\\"
                }
                return !f && (r || et) || (i.tokenize = null),
                "string"
            }
        }
        function d(n, t) {
            for (var r = !1, i; i = n.next(); ) {
                if (i == "/" && r) {
                    t.tokenize = null;
                    break
                }
                r = i == "*"
            }
            return "comment"
        }
        function g(n, t) {
            i.typeFirstDefinitions && n.eol() && p(t.context) && (t.typeAtEndOfLine = y(n, t, n.pos))
        }
        var e = t.indentUnit, h = i.statementIndentUnit || e, nt = i.dontAlignCalls, tt = i.keywords || {}, it = i.types || {}, rt = i.builtin || {}, l = i.blockKeywords || {}, ut = i.defKeywords || {}, ft = i.atoms || {}, f = i.hooks || {}, et = i.multiLineStrings, ot = i.indentStatements !== !1, st = i.indentSwitch !== !1, v = i.namespaceSeparator, ht = i.isPunctuationChar || /[\[\]{}\(\),;\:\.]/, ct = i.numberStart || /[\d\.]/, lt = i.number || /^(?:0x[a-f\d]+|0b[01]+|(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)(u|ll?|l|f)?/i, w = i.isOperatorChar || /[+\-*&%=<>!?|\/]/, b = i.isIdentifierChar || /[\w\$_\xa1-\uffff]/, r, s;
        return {
            startState: function(n) {
                return {
                    tokenize: null,
                    context: new a((n || 0) - e,0,"top",null,!1),
                    indented: 0,
                    startOfLine: !0,
                    prevToken: null
                }
            },
            token: function(n, t) {
                var u = t.context, e, h;
                if (n.sol() && (u.align == null && (u.align = !1),
                t.indented = n.indentation(),
                t.startOfLine = !0),
                n.eatSpace())
                    return g(n, t),
                    null;
                if (r = s = null,
                e = (t.tokenize || k)(n, t),
                e == "comment" || e == "meta")
                    return e;
                if (u.align == null && (u.align = !0),
                r == ";" || r == ":" || r == "," && n.match(/^\s*(?:\/\/.*)?$/, !1))
                    while (t.context.type == "statement")
                        o(t);
                else if (r == "{")
                    c(t, n.column(), "}");
                else if (r == "[")
                    c(t, n.column(), "]");
                else if (r == "(")
                    c(t, n.column(), ")");
                else if (r == "}") {
                    while (u.type == "statement")
                        u = o(t);
                    for (u.type == "}" && (u = o(t)); u.type == "statement"; )
                        u = o(t)
                } else
                    r == u.type ? o(t) : ot && ((u.type == "}" || u.type == "top") && r != ";" || u.type == "statement" && r == "newstatement") && c(t, n.column(), "statement", n.current());
                return e == "variable" && (t.prevToken == "def" || i.typeFirstDefinitions && y(n, t, n.start) && p(t.context) && n.match(/^\s*\(/, !1)) && (e = "def"),
                f.token && (h = f.token(n, t, e),
                h !== undefined && (e = h)),
                e == "def" && i.styleDefs === !1 && (e = "variable"),
                t.startOfLine = !1,
                t.prevToken = s ? "def" : e || r,
                g(n, t),
                e
            },
            indent: function(t, r) {
                var u, o, c, s, l;
                if (t.tokenize != k && t.tokenize != null || t.typeAtEndOfLine)
                    return n.Pass;
                if (u = t.context,
                o = r && r.charAt(0),
                u.type == "statement" && o == "}" && (u = u.prev),
                i.dontIndentStatements)
                    while (u.type == "statement" && i.dontIndentStatements.test(u.info))
                        u = u.prev;
                if (f.indent && (c = f.indent(t, u, r),
                typeof c == "number"))
                    return c;
                if (s = o == u.type,
                l = u.prev && u.prev.info == "switch",
                i.allmanIndentation && /[{(]/.test(o)) {
                    while (u.type != "top" && u.type != "}")
                        u = u.prev;
                    return u.indented
                }
                return u.type == "statement" ? u.indented + (o == "{" ? 0 : h) : u.align && (!nt || u.type != ")") ? u.column + (s ? 0 : 1) : u.type == ")" && !s ? u.indented + h : u.indented + (s ? 0 : e) + (!s && l && !/^(?:case|default)\b/.test(r) ? e : 0)
            },
            electricInput: st ? /^\s*(?:case .*?:|default:|\{\}?|\})$/ : /^\s*[{}]$/,
            blockCommentStart: "//",
            blockCommentEnd: "//",
            blockCommentContinue: "//",
            lineComment: "//",
            fold: "brace"
        }
    }),
    s = "auto if break case register continue return default do sizeof static else struct switch extern typedef union for goto while enum const volatile",
    e = "int long char short double float unsigned signed void size_t ptrdiff_t",
    i(["text/x-csrc", "text/x-c", "text/x-chdr"], {
        name: "clike",
        keywords: t(s),
        types: t(e + " bool _Complex _Bool float_t double_t intptr_t intmax_t int8_t int16_t int32_t int64_t uintptr_t uintmax_t uint8_t uint16_t uint32_t uint64_t"),
        blockKeywords: t("case do else for if switch while struct"),
        defKeywords: t("struct"),
        typeFirstDefinitions: !0,
        atoms: t("NULL true false"),
        hooks: {
            "#": f,
            "*": w
        },
        modeProps: {
            fold: ["brace", "include"]
        }
    }),
    i(["text/x-c++src", "text/x-c++hdr"], {
        name: "clike",
        keywords: t(s + " asm dynamic_cast namespace reinterpret_cast try explicit new static_cast typeid catch operator template typename class friend private this using const_cast inline public throw virtual delete mutable protected alignas alignof constexpr decltype nullptr noexcept thread_local final static_assert override"),
        types: t(e + " bool wchar_t"),
        blockKeywords: t("catch class do else finally for if struct switch try while"),
        defKeywords: t("class namespace struct enum union"),
        typeFirstDefinitions: !0,
        atoms: t("true false NULL"),
        dontIndentStatements: /^template$/,
        isIdentifierChar: /[\w\$_~\xa1-\uffff]/,
        hooks: {
            "#": f,
            "*": w,
            u: l,
            U: l,
            L: l,
            R: l,
            "0": r,
            "1": r,
            "2": r,
            "3": r,
            "4": r,
            "5": r,
            "6": r,
            "7": r,
            "8": r,
            "9": r,
            token: function(n, t, i) {
                if (i == "variable" && n.peek() == "(" && (t.prevToken == ";" || t.prevToken == null || t.prevToken == "}") && g(n.current()))
                    return "def"
            }
        },
        namespaceSeparator: "::",
        modeProps: {
            fold: ["brace", "include"]
        }
    }),
    i("text/x-java", {
        name: "clike",
        keywords: t("abstract assert break case catch class const continue default do else enum extends final finally float for goto if implements import instanceof interface native new package private protected public return static strictfp super switch synchronized this throw throws transient try volatile while @interface"),
        types: t("byte short int long float double boolean char void Boolean Byte Character Double Float Integer Long Number Object Short String StringBuffer StringBuilder Void"),
        blockKeywords: t("catch class do else finally for if switch try while"),
        defKeywords: t("class interface enum @interface"),
        typeFirstDefinitions: !0,
        atoms: t("true false null"),
        number: /^(?:0x[a-f\d_]+|0b[01_]+|(?:[\d_]+\.?\d*|\.\d+)(?:e[-+]?[\d_]+)?)(u|ll?|l|f)?/i,
        hooks: {
            "@": function(n) {
                return n.match("interface", !1) ? !1 : (n.eatWhile(/[\w\$_]/),
                "meta")
            }
        },
        modeProps: {
            fold: ["brace", "import"]
        }
    }),
    i("text/x-csharp", {
        name: "clike",
        keywords: t("abstract as async await base break case catch checked class const continue default delegate do else enum event explicit extern finally fixed for foreach goto if implicit in interface internal is lock namespace new operator out override params private protected public readonly ref return sealed sizeof stackalloc static struct switch this throw try typeof unchecked unsafe using virtual void volatile while add alias ascending descending dynamic from get global group into join let orderby partial remove select set value var yield #region #endregion"),
        types: t("Action Boolean Byte Char DateTime DateTimeOffset Decimal Double Func Guid Int16 Int32 Int64 Object SByte Single String Task TimeSpan UInt16 UInt32 UInt64 bool byte char decimal double short int long object sbyte float string ushort uint ulong"),
        blockKeywords: t("catch class do else finally for foreach if struct switch try while"),
        defKeywords: t("class interface namespace struct var"),
        typeFirstDefinitions: !0,
        atoms: t("true false null"),
        hooks: {
            "@": function(n, t) {
                return n.eat('"') ? (t.tokenize = b,
                b(n, t)) : (n.eatWhile(/[\w\$_]/),
                "meta")
            }
        }
    }),
    i("text/x-scala", {
        name: "clike",
        keywords: t("abstract case catch class def do else extends final finally for forSome if implicit import lazy match new null object override package private protected return sealed super this throw trait try type val var while with yield _ assert assume require print println printf readLine readBoolean readByte readShort readChar readInt readLong readFloat readDouble"),
        types: t("AnyVal App Application Array BufferedIterator BigDecimal BigInt Char Console Either Enumeration Equiv Error Exception Fractional Function IndexedSeq Int Integral Iterable Iterator List Map Numeric Nil NotNull Option Ordered Ordering PartialFunction PartialOrdering Product Proxy Range Responder Seq Serializable Set Specializable Stream StringBuilder StringContext Symbol Throwable Traversable TraversableOnce Tuple Unit Vector Boolean Byte Character CharSequence Class ClassLoader Cloneable Comparable Compiler Double Exception Float Integer Long Math Number Object Package Pair Process Runtime Runnable SecurityManager Short StackTraceElement StrictMath String StringBuffer System Thread ThreadGroup ThreadLocal Throwable Triple Void"),
        multiLineStrings: !0,
        blockKeywords: t("catch class enum do else finally for forSome if match switch try while"),
        defKeywords: t("class enum def object package trait type val var"),
        atoms: t("true false null"),
        indentStatements: !1,
        indentSwitch: !1,
        isOperatorChar: /[+\-*&%=<>!?|\/#:@]/,
        hooks: {
            "@": function(n) {
                return n.eatWhile(/[\w\$_]/),
                "meta"
            },
            '"': function(n, t) {
                return n.match('""') ? (t.tokenize = nt,
                t.tokenize(n, t)) : !1
            },
            "'": function(n) {
                return n.eatWhile(/[\w\$_\xa1-\uffff]/),
                "atom"
            },
            "=": function(n, t) {
                var i = t.context;
                return i.type == "}" && i.align && n.eat(">") ? (t.context = new a(i.indented,i.column,i.type,i.info,null,i.prev),
                "operator") : !1
            },
            "/": function(n, t) {
                return n.eat("*") ? (t.tokenize = v(1),
                t.tokenize(n, t)) : !1
            }
        },
        modeProps: {
            closeBrackets: {
                triples: '"'
            }
        }
    }),
    i("text/x-kotlin", {
        name: "clike",
        keywords: t("package as typealias class interface this super val operator var fun for is in This throw return annotation break continue object if else while do try when !in !is as? file import where by get set abstract enum open inner override private public internal protected catch finally out final vararg reified dynamic companion constructor init sealed field property receiver param sparam lateinit data inline noinline tailrec external annotation crossinline const operator infix suspend actual expect setparam"),
        types: t("Boolean Byte Character CharSequence Class ClassLoader Cloneable Comparable Compiler Double Exception Float Integer Long Math Number Object Package Pair Process Runtime Runnable SecurityManager Short StackTraceElement StrictMath String StringBuffer System Thread ThreadGroup ThreadLocal Throwable Triple Void Annotation Any BooleanArray ByteArray Char CharArray DeprecationLevel DoubleArray Enum FloatArray Function Int IntArray Lazy LazyThreadSafetyMode LongArray Nothing ShortArray Unit"),
        intendSwitch: !1,
        indentStatements: !1,
        multiLineStrings: !0,
        number: /^(?:0x[a-f\d_]+|0b[01_]+|(?:[\d_]+(\.\d+)?|\.\d+)(?:e[-+]?[\d_]+)?)(u|ll?|l|f)?/i,
        blockKeywords: t("catch class do else finally for if where try while enum"),
        defKeywords: t("class val var object interface fun"),
        atoms: t("true false null this"),
        hooks: {
            "@": function(n) {
                return n.eatWhile(/[\w\$_]/),
                "meta"
            },
            '"': function(n, t) {
                return t.tokenize = tt(n.match('""')),
                t.tokenize(n, t)
            }
        },
        modeProps: {
            closeBrackets: {
                triples: '"'
            }
        }
    }),
    i(["x-shader/x-vertex", "x-shader/x-fragment"], {
        name: "clike",
        keywords: t("sampler1D sampler2D sampler3D samplerCube sampler1DShadow sampler2DShadow const attribute uniform varying break continue discard return for while do if else struct in out inout"),
        types: t("float int bool void vec2 vec3 vec4 ivec2 ivec3 ivec4 bvec2 bvec3 bvec4 mat2 mat3 mat4"),
        blockKeywords: t("for while do if else struct"),
        builtin: t("radians degrees sin cos tan asin acos atan pow exp log exp2 sqrt inversesqrt abs sign floor ceil fract mod min max clamp mix step smoothstep length distance dot cross normalize ftransform faceforward reflect refract matrixCompMult lessThan lessThanEqual greaterThan greaterThanEqual equal notEqual any all not texture1D texture1DProj texture1DLod texture1DProjLod texture2D texture2DProj texture2DLod texture2DProjLod texture3D texture3DProj texture3DLod texture3DProjLod textureCube textureCubeLod shadow1D shadow2D shadow1DProj shadow2DProj shadow1DLod shadow2DLod shadow1DProjLod shadow2DProjLod dFdx dFdy fwidth noise1 noise2 noise3 noise4"),
        atoms: t("true false gl_FragColor gl_SecondaryColor gl_Normal gl_Vertex gl_MultiTexCoord0 gl_MultiTexCoord1 gl_MultiTexCoord2 gl_MultiTexCoord3 gl_MultiTexCoord4 gl_MultiTexCoord5 gl_MultiTexCoord6 gl_MultiTexCoord7 gl_FogCoord gl_PointCoord gl_Position gl_PointSize gl_ClipVertex gl_FrontColor gl_BackColor gl_FrontSecondaryColor gl_BackSecondaryColor gl_TexCoord gl_FogFragCoord gl_FragCoord gl_FrontFacing gl_FragData gl_FragDepth gl_ModelViewMatrix gl_ProjectionMatrix gl_ModelViewProjectionMatrix gl_TextureMatrix gl_NormalMatrix gl_ModelViewMatrixInverse gl_ProjectionMatrixInverse gl_ModelViewProjectionMatrixInverse gl_TexureMatrixTranspose gl_ModelViewMatrixInverseTranspose gl_ProjectionMatrixInverseTranspose gl_ModelViewProjectionMatrixInverseTranspose gl_TextureMatrixInverseTranspose gl_NormalScale gl_DepthRange gl_ClipPlane gl_Point gl_FrontMaterial gl_BackMaterial gl_LightSource gl_LightModel gl_FrontLightModelProduct gl_BackLightModelProduct gl_TextureColor gl_EyePlaneS gl_EyePlaneT gl_EyePlaneR gl_EyePlaneQ gl_FogParameters gl_MaxLights gl_MaxClipPlanes gl_MaxTextureUnits gl_MaxTextureCoords gl_MaxVertexAttribs gl_MaxVertexUniformComponents gl_MaxVaryingFloats gl_MaxVertexTextureImageUnits gl_MaxTextureImageUnits gl_MaxFragmentUniformComponents gl_MaxCombineTextureImageUnits gl_MaxDrawBuffers"),
        indentSwitch: !1,
        hooks: {
            "#": f
        },
        modeProps: {
            fold: ["brace", "include"]
        }
    }),
    i("text/x-nesc", {
        name: "clike",
        keywords: t(s + "as atomic async call command component components configuration event generic implementation includes interface module new norace nx_struct nx_union post provides signal task uses abstract extends"),
        types: t(e),
        blockKeywords: t("case do else for if switch while struct"),
        atoms: t("null true false"),
        hooks: {
            "#": f
        },
        modeProps: {
            fold: ["brace", "include"]
        }
    }),
    i("text/x-objectivec", {
        name: "clike",
        keywords: t(s + "inline restrict _Bool _Complex _Imaginary BOOL Class bycopy byref id IMP in inout nil oneway out Protocol SEL self super atomic nonatomic retain copy readwrite readonly"),
        types: t(e),
        atoms: t("YES NO NULL NILL ON OFF true false"),
        hooks: {
            "@": function(n) {
                return n.eatWhile(/[\w\$]/),
                "keyword"
            },
            "#": f,
            indent: function(n, t, i) {
                if (t.type == "statement" && /^@\w/.test(i))
                    return t.indented
            }
        },
        modeProps: {
            fold: "brace"
        }
    }),
    i("text/x-squirrel", {
        name: "clike",
        keywords: t("base break clone continue const default delete enum extends function in class foreach local resume return this throw typeof yield constructor instanceof static"),
        types: t(e),
        blockKeywords: t("case catch class else for foreach if switch try while"),
        defKeywords: t("function local class"),
        typeFirstDefinitions: !0,
        atoms: t("true false null"),
        hooks: {
            "#": f
        },
        modeProps: {
            fold: ["brace", "include"]
        }
    }),
    h = null,
    i("text/x-ceylon", {
        name: "clike",
        keywords: t("abstracts alias assembly assert assign break case catch class continue dynamic else exists extends finally for function given if import in interface is let module new nonempty object of out outer package return satisfies super switch then this throw try value void while"),
        types: function(n) {
            var t = n.charAt(0);
            return t === t.toUpperCase() && t !== t.toLowerCase()
        },
        blockKeywords: t("case catch class dynamic else finally for function if interface module new object switch try while"),
        defKeywords: t("class dynamic function interface module object package value"),
        builtin: t("abstract actual aliased annotation by default deprecated doc final formal late license native optional sealed see serializable shared suppressWarnings tagged throws variable"),
        isPunctuationChar: /[\[\]{}\(\),;\:\.`]/,
        isOperatorChar: /[+\-*&%=<>!?|^~:\/]/,
        numberStart: /[\d#$]/,
        number: /^(?:#[\da-fA-F_]+|\$[01_]+|[\d_]+[kMGTPmunpf]?|[\d_]+\.[\d_]+(?:[eE][-+]?\d+|[kMGTPmunpf]|)|)/i,
        multiLineStrings: !0,
        typeFirstDefinitions: !0,
        atoms: t("true false null larger smaller equal empty finished"),
        indentSwitch: !1,
        styleDefs: !1,
        hooks: {
            "@": function(n) {
                return n.eatWhile(/[\w\$_]/),
                "meta"
            },
            '"': function(n, t) {
                return t.tokenize = d(n.match('""') ? "triple" : "single"),
                t.tokenize(n, t)
            },
            "`": function(n, t) {
                return !h || !n.match("`") ? !1 : (t.tokenize = h,
                h = null,
                t.tokenize(n, t))
            },
            "'": function(n) {
                return n.eatWhile(/[\w\$_\xa1-\uffff]/),
                "atom"
            },
            token: function(n, t, i) {
                if ((i == "variable" || i == "type") && t.prevToken == ".")
                    return "variable-2"
            }
        },
        modeProps: {
            fold: ["brace", "import"],
            closeBrackets: {
                triples: '"'
            }
        }
    })
}),
function(n) {
    typeof exports == "object" && typeof module == "object" ? n(require("../../lib/codemirror")) : typeof define == "function" && define.amd ? define(["../../lib/codemirror"], n) : n(CodeMirror)
}(function(n) {
    "use strict";
    n.defineMode("vb", function(t, i) {
        function r(n) {
            return new RegExp("^((" + n.join(")|(") + "))\\b","i")
        }
        function e(n, t) {
            t.currentIndent++
        }
        function f(n, t) {
            t.currentIndent--
        }
        function o(n, t) {
            var o, r, i;
            if (n.eatSpace())
                return null;
            if (o = n.peek(),
            o === "'")
                return n.skipToEnd(),
                "comment";
            if (n.match(/^((&H)|(&O))?[0-9\.a-f]/i, !1)) {
                if (r = !1,
                n.match(/^\d*\.\d+F?/i) ? r = !0 : n.match(/^\d+\.\d*F?/) ? r = !0 : n.match(/^\.\d+F?/) && (r = !0),
                r)
                    return n.eat(/J/i),
                    "number";
                if (i = !1,
                n.match(/^&H[0-9a-f]+/i) ? i = !0 : n.match(/^&O[0-7]+/i) ? i = !0 : n.match(/^[1-9]\d*F?/) ? (n.eat(/J/i),
                i = !0) : n.match(/^0(?![\dx])/i) && (i = !0),
                i)
                    return n.eat(/L/i),
                    "number"
            }
            return n.match(et) ? (t.tokenize = ct(n.current()),
            t.tokenize(n, t)) : n.match(tt) || n.match(nt) ? null : n.match(g) || n.match(k) || n.match(rt) ? "operator" : n.match(d) ? null : n.match(st) ? (e(n, t),
            t.doInCurrentLine = !0,
            "keyword") : n.match(ot) ? (t.doInCurrentLine ? t.doInCurrentLine = !1 : e(n, t),
            "keyword") : n.match(y) ? "keyword" : n.match(w) ? (f(n, t),
            f(n, t),
            "keyword") : n.match(p) ? (f(n, t),
            "keyword") : n.match(ft) ? "keyword" : n.match(ut) ? "keyword" : n.match(it) ? "variable" : (n.next(),
            u)
        }
        function ct(n) {
            var r = n.length == 1
              , t = "string";
            return function(f, e) {
                while (!f.eol()) {
                    if (f.eatWhile(/[^'"]/),
                    f.match(n))
                        return e.tokenize = o,
                        t;
                    f.eat(/['"]/)
                }
                if (r) {
                    if (i.singleLineStringErrors)
                        return u;
                    e.tokenize = o
                }
                return t
            }
        }
        function lt(n, t) {
            var r = t.tokenize(n, t), o = n.current(), i;
            return o === "." ? (r = t.tokenize(n, t),
            r === "variable" ? "variable" : u) : (i = "[({".indexOf(o),
            i !== -1 && e(n, t),
            ht === "dedent" && f(n, t)) ? u : (i = "])}".indexOf(o),
            i !== -1 && f(n, t)) ? u : r
        }
        var u = "error", k = new RegExp("^[\\+\\-\\*/%&\\\\|\\^~<>!]"), d = new RegExp("^[\\(\\)\\[\\]\\{\\}@,:`=;\\.]"), g = new RegExp("^((==)|(<>)|(<=)|(>=)|(<>)|(<<)|(>>)|(//)|(\\*\\*))"), nt = new RegExp("^((\\+=)|(\\-=)|(\\*=)|(%=)|(/=)|(&=)|(\\|=)|(\\^=))"), tt = new RegExp("^((//=)|(>>=)|(<<=)|(\\*\\*=))"), it = new RegExp("^[_A-Za-z][_A-Za-z0-9]*"), s = ["class", "module", "sub", "enum", "select", "while", "if", "function", "get", "set", "property", "try"], h = ["else", "elseif", "case", "catch"], c = ["next", "loop"], l = ["and", "or", "not", "xor", "in"], rt = r(l), a = ["as", "dim", "break", "continue", "optional", "then", "until", "goto", "byval", "byref", "new", "handles", "property", "return", "const", "private", "protected", "friend", "public", "shared", "static", "true", "false", "imports"], v = ["integer", "string", "double", "decimal", "boolean", "short", "char", "float", "single"], ut = r(a), ft = r(v), et = '"', ot = r(s), y = r(h), p = r(c), w = r(["end"]), st = r(["do"]), ht = null, b;
        return n.registerHelper("hintWords", "vb", s.concat(h).concat(c).concat(l).concat(a).concat(v)),
        b = {
            electricChars: "dDpPtTfFeE ",
            startState: function() {
                return {
                    tokenize: o,
                    lastToken: null,
                    currentIndent: 0,
                    nextLineIndent: 0,
                    doInCurrentLine: !1
                }
            },
            token: function(n, t) {
                n.sol() && (t.currentIndent += t.nextLineIndent,
                t.nextLineIndent = 0,
                t.doInCurrentLine = 0);
                var i = lt(n, t);
                return t.lastToken = {
                    style: i,
                    content: n.current()
                },
                i
            },
            indent: function(n, i) {
                var r = i.replace(/^\s+|\s+$/g, "");
                return r.match(p) || r.match(w) || r.match(y) ? t.indentUnit * (n.currentIndent - 1) : n.currentIndent < 0 ? 0 : n.currentIndent * t.indentUnit
            },
            blockCommentStart: "'",
            blockCommentLead: "'",
            blockCommentEnd: "",
            lineComment: "'"
        }
    }),
    n.defineMIME("text/x-vb", "vb")
}),
CodeMirror.defineMode("fsharp", function() {
    function t(n, t) {
        var o = n.sol(), f = n.next(), e;
        return f === '"' ? (t.tokenize = r,
        t.tokenize(n, t)) : f === "(" && n.eat("*") ? (t.commentLevel++,
        t.tokenize = u,
        t.tokenize(n, t)) : f === "/" && n.eat("/") ? (n.skipToEnd(),
        "comment") : f === "~" ? (n.eatWhile(/\w/),
        "variable-2") : f === "`" ? (n.eatWhile(/\w/),
        "quote") : /\d/.test(f) ? (n.eatWhile(/[\d]/),
        n.eat(".") && n.eatWhile(/[\d]/),
        "number") : /[+\-*&%=<>!?.|]/.test(f) ? "operator" : (n.eatWhile(/\w/),
        e = n.current(),
        i[e] || "variable")
    }
    function r(n, i) {
        for (var u, f = !1, r = !1; (u = n.next()) != null; ) {
            if (u === '"' && !r) {
                f = !0;
                break
            }
            r = !r && u === "\\"
        }
        return f && !r && (i.tokenize = t),
        "string"
    }
    function u(n, i) {
        for (var u, r; i.commentLevel > 0 && (r = n.next()) != null; )
            u === "(" && r === "*" && i.commentLevel++,
            u === "*" && r === ")" && i.commentLevel--,
            u = r;
        return i.commentLevel <= 0 && (i.tokenize = t),
        "comment"
    }
    var i = {
        abstract: "keyword",
        and: "keyword",
        as: "keyword",
        assert: "keyword",
        base: "keyword",
        begin: "keyword",
        "class": "keyword",
        "default": "keyword",
        delegate: "keyword",
        "do": "keyword",
        done: "keyword",
        downcast: "keyword",
        downto: "keyword",
        elif: "keyword",
        "else": "keyword",
        end: "keyword",
        exception: "keyword",
        extern: "keyword",
        "false": "keyword",
        "finally": "keyword",
        "for": "keyword",
        fun: "keyword",
        "function": "keyword",
        global: "keyword",
        "if": "keyword",
        "in": "keyword",
        inherit: "keyword",
        inline: "keyword",
        interface: "keyword",
        internal: "keyword",
        lazy: "keyword",
        let: "keyword",
        "let!": "keyword",
        match: "keyword",
        member: "keyword",
        module: "keyword",
        mutable: "keyword",
        namespace: "keyword",
        "new": "keyword",
        not: "keyword",
        "null": "keyword",
        of: "keyword",
        open: "keyword",
        or: "keyword",
        override: "keyword",
        private: "keyword",
        public: "keyword",
        rec: "keyword",
        "return": "keyword",
        "return!": "keyword",
        select: "keyword",
        static: "keyword",
        struct: "keyword",
        then: "keyword",
        to: "keyword",
        "true": "keyword",
        "try": "keyword",
        type: "keyword",
        upcast: "keyword",
        use: "keyword",
        "use!": "keyword",
        val: "keyword",
        "void": "keyword",
        when: "keyword",
        "while": "keyword",
        "with": "keyword",
        yield: "keyword",
        "yield!": "keyword",
        asr: "keyword",
        land: "keyword",
        lor: "keyword",
        lsl: "keyword",
        lsr: "keyword",
        lxor: "keyword",
        mod: "keyword",
        sig: "keyword",
        atomic: "keyword",
        "break": "keyword",
        checked: "keyword",
        component: "keyword",
        "const": "keyword",
        constraint: "keyword",
        constructor: "keyword",
        "continue": "keyword",
        eager: "keyword",
        event: "keyword",
        external: "keyword",
        fixed: "keyword",
        functor: "keyword",
        include: "keyword",
        method: "keyword",
        mixin: "keyword",
        object: "keyword",
        parallel: "keyword",
        process: "keyword",
        protected: "keyword",
        pure: "keyword",
        sealed: "keyword",
        tailcall: "keyword",
        trait: "keyword",
        virtual: "keyword",
        volatile: "keyword"
    };
    return {
        startState: function() {
            return {
                tokenize: t,
                commentLevel: 0
            }
        },
        token: function(n, t) {
            return n.eatSpace() ? null : t.tokenize(n, t)
        },
        blockCommentStart: "//",
        blockCommentLead: "//",
        blockCommentEnd: "",
        lineComment: "//"
    }
}),
CodeMirror.defineMIME("text/x-fsharp", "fsharp"),
CodeMirror.defineMode("razor", function(n, t) {
    function f(n, t) {
        function i(i) {
            return t.tokenize = i,
            i(n, t)
        }
        var r = n.next(), s;
        if (r == "<") {
            if (n.eat("!"))
                return n.eat("[") ? n.match("[CDATA[") ? i(o("xml-cdata", "]\]>")) : null : n.match("--") ? i(o("xml-comment", "-->")) : n.match("DOCTYPE") ? (n.eatWhile(/[\w\._\-]/),
                i(o("xml-doctype", ">"))) : null;
            if (n.eat("?"))
                return n.eatWhile(/[\w\._\-]/),
                t.tokenize = o("xml-processing", "?>"),
                "xml-processing";
            for (u = n.eat("/") ? "closeTag" : "openTag",
            n.eatSpace(),
            e = ""; s = n.eat(/[^\s\u00a0=<>\"\'\/?]/); )
                e += s;
            return t.tokenize = y,
            "xml-tag"
        }
        if (r == "&")
            return n.eatWhile(/[^;]/),
            n.eat(";"),
            "xml-entity";
        if (r == "@") {
            if (n.peek() != "@")
                return t.tokenize = w(f),
                "razor-tag";
            n.next()
        } else
            return n.eatWhile(/[^&<@]/),
            null
    }
    function y(n, t) {
        var i = n.next();
        return i == ">" || i == "/" && n.eat(">") ? (t.tokenize = f,
        u = i == ">" ? "endTag" : "selfcloseTag",
        "xml-tag") : i == "=" ? (u = "equals",
        null) : /[\'\"]/.test(i) ? (t.tokenize = p(i),
        t.tokenize(n, t)) : (n.eatWhile(/[^\s\u00a0=<>\"\'\/?]/),
        "xml-word")
    }
    function p(n) {
        return function(t, i) {
            for (var r = !1; !t.eol(); )
                if (t.peek() == "@") {
                    i.tokenize = nt(n);
                    break
                } else if (t.next() == n) {
                    i.tokenize = y;
                    break
                }
            return "xml-attribute"
        }
    }
    function nt(n) {
        return function(t, i) {
            return t.eat("@"),
            i.tokenize = w(p(n), "xml-attribute"),
            "razor-tag"
        }
    }
    function o(n, t) {
        return function(i, r) {
            while (!i.eol()) {
                if (i.match(t)) {
                    r.tokenize = f;
                    break
                }
                i.next()
            }
            return n
        }
    }
    function w(n, t) {
        return function(i, r) {
            return i.match("using") ? (r.tokenize = tt(n, t),
            "razor-keyword") : i.match("if") ? (r.tokenize = it(n, t),
            "razor-keyword") : (i.match("{") ? r.tokenize = s(1, n) : (i.eatWhile(/[^\s\'\"<@]/),
            r.tokenize = n),
            t + " razor")
        }
    }
    function tt(n, t) {
        return function(i, r) {
            return i.eatWhile(/[^;]/),
            i.eat(";"),
            r.tokenize = n,
            t + " razor"
        }
    }
    function it(n, t) {
        return function(i, r) {
            while (!i.eol())
                i.next();
            return r.tokenize = n,
            t + " razor"
        }
    }
    function s(n, t) {
        var i = n || 1;
        return function(n, r) {
            while (!n.eol()) {
                if (n.eatWhile(/\w/)) {
                    if (r.tokenize = s(i, t),
                    v[n.current()])
                        return n.eatSpace(),
                        "razor-keyword";
                    n.next();
                    break
                }
                if (n.peek() == '"') {
                    r.tokenize = ut(s(i, t));
                    break
                }
                if (n.peek() == "{" && i++,
                n.peek() == "}" && i--,
                i == 0) {
                    r.tokenize = rt(t);
                    break
                }
                if (n.eatWhile(/[^\w{}\"]/)) {
                    n.eatSpace(),
                    r.tokenize = s(i, t);
                    break
                }
                n.next()
            }
            return "razor"
        }
    }
    function rt(n) {
        return function(t, i) {
            return t.eat("}"),
            i.tokenize = n,
            "razor-tag"
        }
    }
    function ut(n) {
        return function(t, i) {
            return t.eat('"'),
            t.eatWhile(/[^"]/),
            t.eat('"'),
            i.tokenize = n,
            "razor-string"
        }
    }
    function c() {
        for (var n = arguments.length - 1; n >= 0; n--)
            i.cc.push(arguments[n])
    }
    function r() {
        return c.apply(null, arguments),
        !0
    }
    function b(n, t) {
        var r = l.doNotIndent.hasOwnProperty(n) || i.context && i.context.noIndent;
        i.context = {
            prev: i.context,
            tagName: n,
            indent: i.indented,
            startOfLine: t,
            noIndent: r
        }
    }
    function k() {
        i.context && (i.context = i.context.prev)
    }
    function ft(n) {
        return n == "openTag" ? (i.tagName = e,
        r(a, et(i.startOfLine))) : n == "closeTag" ? (k(),
        r(ot)) : n == "xml-cdata" ? (i.context && i.context.name == "!cdata" || b("!cdata"),
        i.tokenize == f && k(),
        r()) : r()
    }
    function et(n) {
        return function(t) {
            return t == "selfcloseTag" || t == "endTag" && l.autoSelfClosers.hasOwnProperty(i.tagName.toLowerCase()) ? r() : t == "endTag" ? (b(i.tagName, n),
            r()) : r()
        }
    }
    function ot(n) {
        return n == "endTag" ? r() : c()
    }
    function a(n) {
        return n == "xml-word" ? (h = "xml-attname",
        r(a)) : n == "equals" ? r(st, a) : c()
    }
    function st(n) {
        return n == "xml-word" && l.allowUnquoted ? (h = "xml-attribute",
        r()) : n == "xml-attribute" ? r() : c()
    }
    function v(n) {
        for (var i = {}, r = n.split(" "), t = 0; t < r.length; ++t)
            i[r[t]] = !0;
        return i
    }
    var v = v("abstract as base bool break byte case catch char checked class const continue DateTime decimal default delegate do double dynamic else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sbyte sealed short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using var virtual void volatile while"), d = n.indentUnit, l = t.htmlMode ? {
        autoSelfClosers: {
            br: !0,
            img: !0,
            hr: !0,
            link: !0,
            input: !0,
            meta: !0,
            col: !0,
            frame: !0,
            base: !0,
            area: !0
        },
        doNotIndent: {
            pre: !0,
            "!cdata": !0
        },
        allowUnquoted: !0
    } : {
        autoSelfClosers: {},
        doNotIndent: {
            "!cdata": !0
        },
        allowUnquoted: !1
    }, g = t.alignCDATA, e, u, i, h;
    return {
        startState: function() {
            return {
                tokenize: f,
                cc: [],
                indented: 0,
                startOfLine: !0,
                tagName: null,
                context: null
            }
        },
        token: function(n, t) {
            var r, f;
            if (n.sol() && (t.startOfLine = !0,
            t.indented = n.indentation()),
            n.eatSpace())
                return null;
            if (h = u = e = null,
            r = t.tokenize(n, t),
            (r || u) && r != "xml-comment")
                for (i = t; ; )
                    if (f = t.cc.pop() || ft,
                    f(u || r))
                        break;
            return t.startOfLine = !1,
            h || r
        },
        indent: function(n, t) {
            var i = n.context;
            if (i && i.noIndent || g && /<!\[CDATA\[/.test(t))
                return 0;
            for (i && /^<\//.test(t) && (i = i.prev); i && !i.startOfLine; )
                i = i.prev;
            return i ? i.indent + d : 0
        },
        electricChars: "/"
    }
}),
CodeMirror.defineMIME("application/xml", "xml"),
CodeMirror.defineMIME("text/html", {
    name: "xml",
    htmlMode: !0
}),
function(n) {
    typeof exports == "object" && typeof module == "object" ? n(require("../../lib/codemirror")) : typeof define == "function" && define.amd ? define(["../../lib/codemirror"], n) : n(CodeMirror)
}(function(n) {
    "use strict";
    function f(n) {
        var t = n.search(i);
        return t == -1 ? 0 : t
    }
    function e(n, i, r) {
        return /\bstring\b/.test(n.getTokenTypeAt(t(i.line, 0))) && !/^[\'\"\`]/.test(r)
    }
    function u(n, t) {
        var i = n.getMode();
        return i.useInnerComments === !1 || !i.innerMode ? i : n.getModeAt(t)
    }
    var r = {}
      , i = /[^\s\u00a0]/
      , t = n.Pos;
    n.commands.toggleComment = function(n) {
        n.toggleComment()
    }
    ,
    n.defineExtension("toggleComment", function(n) {
        var f, i, u;
        n || (n = r);
        var e = this
          , o = Infinity
          , h = this.listSelections()
          , s = null;
        for (f = h.length - 1; f >= 0; f--)
            (i = h[f].from(),
            u = h[f].to(),
            i.line >= o) || (u.line >= o && (u = t(o, 0)),
            o = i.line,
            s == null ? e.uncomment(i, u, n) ? s = "un" : (e.lineComment(i, u, n),
            s = "line") : s == "un" ? e.uncomment(i, u, n) : e.lineComment(i, u, n))
    }),
    n.defineExtension("lineComment", function(n, o, s) {
        var c;
        s || (s = r);
        var h = this
          , a = u(h, n)
          , v = h.getLine(n.line);
        if (v != null && !e(h, n, v)) {
            if (c = s.lineComment || a.lineComment,
            !c) {
                (s.blockCommentStart || a.blockCommentStart) && (s.fullLines = !0,
                h.blockComment(n, o, s));
                return
            }
            var l = Math.min(o.ch != 0 || o.line == n.line ? o.line + 1 : o.line, h.lastLine() + 1)
              , y = s.padding == null ? " " : s.padding
              , p = s.commentBlankLines || n.line == o.line;
            h.operation(function() {
                var u, a, e, o, r;
                if (s.indent) {
                    for (u = null,
                    r = n.line; r < l; ++r)
                        e = h.getLine(r),
                        a = e.slice(0, f(e)),
                        (u == null || u.length > a.length) && (u = a);
                    for (r = n.line; r < l; ++r)
                        (e = h.getLine(r),
                        o = u.length,
                        p || i.test(e)) && (e.slice(0, o) != u && (o = f(e)),
                        h.replaceRange(u + c + y, t(r, 0), t(r, o)))
                } else
                    for (r = n.line; r < l; ++r)
                        (p || i.test(h.getLine(r))) && h.replaceRange(c + y, t(r, 0))
            })
        }
    }),
    n.defineExtension("blockComment", function(n, f, e) {
        var s, c;
        e || (e = r);
        var o = this
          , h = u(o, n)
          , l = e.blockCommentStart || h.blockCommentStart
          , a = e.blockCommentEnd || h.blockCommentEnd;
        if (!l || !a) {
            (e.lineComment || h.lineComment) && e.fullLines != !1 && o.lineComment(n, f, e);
            return
        }
        /\bcomment\b/.test(o.getTokenTypeAt(t(n.line, 0))) || (s = Math.min(f.line, o.lastLine()),
        s != n.line && f.ch == 0 && i.test(o.getLine(s)) && --s,
        c = e.padding == null ? " " : e.padding,
        n.line > s) || o.operation(function() {
            var v, u, r;
            if (e.fullLines != !1) {
                if (v = i.test(o.getLine(s)),
                o.replaceRange(c + a, t(s)),
                o.replaceRange(l + c, t(n.line, 0)),
                u = e.blockCommentLead || h.blockCommentLead,
                u != null)
                    for (r = n.line + 1; r <= s; ++r)
                        (r != s || v) && o.replaceRange(u + c, t(r, 0))
            } else
                o.replaceRange(a, f),
                o.replaceRange(l, n)
        })
    }),
    n.defineExtension("uncomment", function(n, f, e) {
        var b, k, v, l, a, y, p, ut;
        e || (e = r);
        var o = this, nt = u(o, n), h = Math.min(f.ch != 0 || f.line == n.line ? f.line : f.line - 1, o.lastLine()), c = Math.min(n.line, h), tt = e.lineComment || nt.lineComment, ft = [], s = e.padding == null ? " " : e.padding, et;
        n: {
            if (!tt)
                break n;
            for (b = c; b <= h; ++b) {
                if (k = o.getLine(b),
                v = k.indexOf(tt),
                v > -1 && !/comment/.test(o.getTokenTypeAt(t(b, v + 1))) && (v = -1),
                v == -1 && i.test(k))
                    break n;
                if (v > -1 && i.test(k.slice(0, v)))
                    break n;
                ft.push(k)
            }
            if (o.operation(function() {
                for (var n = c; n <= h; ++n) {
                    var u = ft[n - c]
                      , r = u.indexOf(tt)
                      , i = r + tt.length;
                    r < 0 || (u.slice(i, i + s.length) == s && (i += s.length),
                    et = !0,
                    o.replaceRange("", t(n, r), t(n, i)))
                }
            }),
            et)
                return !0
        }
        if (l = e.blockCommentStart || nt.blockCommentStart,
        a = e.blockCommentEnd || nt.blockCommentEnd,
        !l || !a)
            return !1;
        var rt = e.blockCommentLead || nt.blockCommentLead
          , d = o.getLine(c)
          , g = d.indexOf(l);
        if (g == -1)
            return !1;
        var it = h == c ? d : o.getLine(h)
          , w = it.indexOf(a, h == c ? g + l.length : 0)
          , ot = t(c, g + 1)
          , st = t(h, w + 1);
        return w == -1 || !/comment/.test(o.getTokenTypeAt(ot)) || !/comment/.test(o.getTokenTypeAt(st)) || o.getRange(ot, st, "\n").indexOf(a) > -1 ? !1 : (y = d.lastIndexOf(l, n.ch),
        p = y == -1 ? -1 : d.slice(0, n.ch).indexOf(a, y + l.length),
        y != -1 && p != -1 && p + a.length != n.ch) ? !1 : (p = it.indexOf(a, f.ch),
        ut = it.slice(f.ch).lastIndexOf(l, p - f.ch),
        y = p == -1 || ut == -1 ? -1 : f.ch + ut,
        p != -1 && y != -1 && y != f.ch) ? !1 : (o.operation(function() {
            var r, n, e, u, f;
            if (o.replaceRange("", t(h, w - (s && it.slice(w - s.length, w) == s ? s.length : 0)), t(h, w + a.length)),
            r = g + l.length,
            s && d.slice(r, r + s.length) == s && (r += s.length),
            o.replaceRange("", t(c, g), t(c, r)),
            rt)
                for (n = c + 1; n <= h; ++n)
                    (e = o.getLine(n),
                    u = e.indexOf(rt),
                    u == -1 || i.test(e.slice(0, u))) || (f = u + rt.length,
                    s && e.slice(f, f + s.length) == s && (f += s.length),
                    o.replaceRange("", t(n, u), t(n, f)))
        }),
        !0)
    })
}),
collaboration = new Collaboration,
CodeRunner = {},
$.extend(CodeRunner, {
    isRunning: !1,
    queue: null,
    currentSponsor: -1,
    currentSponsorFirstRun: !1,
    showResults: function(n) {
        var u, o, s;
        if (($("#ProjectType").val() == "Mvc" || $("#ProjectType").val() == "Nancy") && ($("#mvc-output-iframe").attr("src", "/MvcPage/" + (n.HasErrors ? "" : n.WebPageHtmlOutputId)),
        $("#mvc-output-iframe").next(".section-label").attr("href", "/MvcPage/" + (n.HasErrors ? "" : n.WebPageHtmlOutputId))),
        n.ConsoleOutput) {
            for (var f = "<fiddle_output_raw>", e = "<\/fiddle_output_raw>", t = n.ConsoleOutput, i = "", r = -1; (r = t.search(f)) > -1; )
                u = t.search(e),
                o = t.slice(0, r),
                i = i + Terminal.FormatOutput(_.escape(o)),
                s = t.slice(r + f.length, u),
                i = i + s,
                t = t.slice(u + e.length);
            i = i + Terminal.FormatOutput(_.escape(t)),
            $(".output").empty().append(i)
        } else
            $(".output").empty();
        $(".output").change(),
        Terminal.Clear(),
        n.IsConsoleInputRequested ? (Terminal.InitReadLine(),
        n.ConsoleInputLines != null && n.ConsoleInputLines.length > 0 && Terminal.Input.focus()) : (Terminal.Hide(),
        Terminal.ConsoleInputs = []),
        CodeRunner.showStats(n.Stats),
        CodeRunner.displaySponsor()
    },
    run: function(n, t) {
        n.showOverlay && $(".overlay").addClass("show"),
        $.ajax({
            url: "https://thingproxy.freeboard.io/fetch/https://dotnetfiddle.net/Home/Run",
            data: JSON.stringify(n.formData),
            type: "POST",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(i) {
                typeof collaboration != "undefined" && collaboration.codeExecuted(i),
                _.isUndefined(window.academyCode) ? CodeRunner.showResults(i) : academyCode.showResults(i, n.formData.codeBlockId),
                t != null && t(i)
            },
            complete: function() {
                n.showOverlay && $(".overlay").removeClass("show"),
                CodeRunner.isRunning = !1,
                CodeRunner.toggleStatsLoader(!1, n.loader)
            }
        })
    },
    fetchCode: function() {
        fiddle.fetchCode()
    },
    getMode: function(n) {
        var t = "";
        switch (n || fiddle.getLanguage()) {
        case "VbNet":
            t = "vb";
            break;
        case "CSharp":
            t = "text/x-csharp";
            break;
        case "FSharp":
            t = "text/x-fsharp"
        }
        return t
    },
    addToQueue: function(n) {
        CodeRunner.queue == null && (CodeRunner.queue = new RunQueue(CodeRunner.queuePushed)),
        CodeRunner.isRunning && CodeRunner.queue.clear(),
        CodeRunner.fetchCode();
        var t = CodeRunner.getFormData();
        CodeRunner.queue.push({
            formData: t,
            showOverlay: n
        })
    },
    addToQueueUseResultCache: function(n) {
        CodeRunner.queue == null && (CodeRunner.queue = new RunQueue(CodeRunner.queuePushed)),
        CodeRunner.isRunning && CodeRunner.queue.clear(),
        CodeRunner.fetchCode();
        var t = CodeRunner.getFormData();
        t.UseResultCache = !0,
        CodeRunner.queue.push({
            formData: t,
            showOverlay: n
        })
    },
    getFormData: function(n, t) {
        n && fiddle.fetchCode(t);
        var i = fiddle.getCodeBlocks()
          , f = $("#Original" + fiddle.getProjectType()).val()
          , e = _.escape(i[fiddle.getProjectType()])
          , o = fiddle.getLanguage()
          , r = fiddle.getProjectType()
          , s = fiddle.getFiddleId()
          , h = fiddle.getCompiler()
          , c = $("#NuGetPackageVersionIds").val()
          , l = $("#OriginalNuGetPackageVersionIds").val()
          , a = $("#timezone").val()
          , u = {
            CodeBlock: e,
            OriginalCodeBlock: f,
            Language: o,
            Compiler: h,
            ProjectType: r,
            OriginalFiddleId: s,
            NuGetPackageVersionIds: c,
            OriginalNuGetPackageVersionIds: l,
            TimeOffset: a,
            ConsoleInputLines: Terminal.ConsoleInputs,
            MvcViewEngine: "Razor",
            MvcCodeBlock: {
                Model: "",
                View: "",
                Controller: ""
            },
            OriginalMvcCodeBlock: {
                Model: "",
                View: "",
                Controller: ""
            },
            UseResultCache: !1
        };
        return (r == "Mvc" || r == "Nancy") && (u.MvcCodeBlock = {
            Model: _.escape(i.Model),
            View: _.escape(i.View),
            Controller: _.escape(i.Controller)
        },
        u.OriginalMvcCodeBlock = {
            Model: $("<div/>").text($("#OriginalModel").val()).html().toString(),
            View: $("<div/>").text($("#OriginalView").val()).html().toString(),
            Controller: $("<div/>").text($("#OriginalController").val()).html().toString()
        }),
        u
    },
    queuePushed: function(n) {
        if (CodeRunner.isRunning)
            setTimeout(function() {
                CodeRunner.queuePushed(n)
            }, 100);
        else {
            CodeRunner.isRunning = !0;
            var t = CodeRunner.queue.pull();
            t ? (CodeRunner.toggleStatsLoader(!0, t.loader || n.loader),
            CodeRunner.run(t)) : CodeRunner.isRunning = !1
        }
    },
    showStats: function(n) {
        if ($(".stats-pane").length > 0) {
            var t = "<table>";
            n.IsResultCache && (t += "<tr style='background-color: #fff3cd; font-weight: bold;'><td>Cached Result<\/td><td>"),
            t += "<tr><td>Last Run: <\/td><td>" + n.RunAt + "<\/td><\/tr><tr><td>Compile: <\/td><td>" + n.CompileTime + "<\/td><\/tr><tr><td>Execute: <\/td><td>" + n.ExecuteTime + "<\/td><\/tr><tr><td>Memory: <\/td><td>" + n.MemoryUsage + "<\/td><\/tr><tr><td>CPU: <\/td><td>" + n.CpuUsage + "<\/td><\/tr><\/table>",
            $(".stats-pane #stats").empty().append(t).show()
        }
        $("#resultCache").length > 0 && (n.IsResultCache ? $("#resultCache").show() : $("#resultCache").hide())
    },
    toggleStatsLoader: function(n, t) {
        typeof t == "undefined" && (t = $("#stats-loader")),
        n != null ? n ? t.show() : t.hide() : typeof AutoRunner != "undefined" && AutoRunner.isRunningByOther || CodeRunner.isRunning ? t.show() : t.hide()
    },
    displaySponsor: function() {
        if (CodeRunner.currentSponsorFirstRun) {
            CodeRunner.currentSponsorFirstRun = !1;
            return
        }
        CodeRunner.currentSponsor != -1 ? $("#sponsor-" + CodeRunner.currentSponsor).hide() : CodeRunner.currentSponsorFirstRun = !0;
        var t = 5
          , i = Math.floor(Math.random() * 100)
          , n = i % t;
        n == CodeRunner.currentSponsor && (n = (n + 1) % t),
        CodeRunner.currentSponsor = n,
        $("#sponsor-" + CodeRunner.currentSponsor).fadeIn("slow")
    }
}),
CodeRunner.displaySponsor(),
Terminal = {},
$.extend(Terminal, {
    InputPrefix: "&gt;",
    Input: $("#input"),
    ConsoleInputs: [],
    _ajustInputHeight: function(n) {
        Terminal.Input = n || $("#input"),
        Terminal.Input.css({
            height: "16px"
        }),
        Terminal.Input.css({
            height: Terminal.Input[0].scrollHeight + "px"
        }),
        Terminal._ajustScrollTop(n)
    },
    _ajustScrollTop: function(n) {
        Terminal.Input = n || $("#input"),
        Terminal.Input.parent().animate({
            scrollTop: Terminal.Input.parent()[0].scrollHeight + 16 + Terminal.Input.parent()[0].scrollHeight
        }, 50)
    },
    Show: function(n) {
        Terminal.Input = n || $("#input"),
        $(".textprefix").remove(),
        Terminal.Input.before(Terminal._getPrefix()),
        Terminal.Input.show(),
        setTimeout(function() {
            Terminal._ajustInputHeight(n),
            Terminal.Input.css({
                width: $("div", Terminal.Input.parent()).innerWidth() - $(".textprefix").width() - 1 + "px"
            }),
            env.siteMode == siteModes.mobile && Terminal.Input.focus()
        }, 100),
        Terminal.Input.parent().off("click").click(function() {
            Terminal.Input = n || $("#input"),
            Terminal.Input.is(":visible") && Terminal.Input.focus()
        })
    },
    _getPrefix: function() {
        return $("<span/>").attr("class", "textprefix").attr("contenteditable", "false").append(Terminal.InputPrefix + "&nbsp;")
    },
    Hide: function(n) {
        Terminal.Input = n || $("#input"),
        Terminal.Input.hide(),
        $(".textprefix").remove()
    },
    InitReadLine: function(n, t) {
        Terminal.Input = n || $("#input"),
        Terminal.Input.off("keydown"),
        Terminal.Input.keydown(function(i) {
            Terminal._handleReadLine(i, n, t),
            Terminal._ajustInputHeight(n)
        }),
        Terminal.Show(n)
    },
    _handleReadLine: function(n, t, i) {
        var r, u;
        n.keyCode == 13 && ($(".textprefix").remove(),
        r = Terminal._getInputVal(t),
        $(".output").append("<br/><b>" + r + "<\/b>"),
        u = typeof academyCode != "undefined",
        u ? academyCode.pushConsoleInput(i, r) : Terminal.ConsoleInputs.push(r),
        Terminal.Clear(t),
        Terminal.Hide(t),
        u ? academyCode.addToQueue(i) : CodeRunner.addToQueue(!1)),
        Terminal._ajustScrollTop(t)
    },
    Clear: function(n) {
        Terminal._setInputVal("", n)
    },
    _getInputVal: function(n) {
        Terminal.Input = n || $("#input");
        var t = "";
        switch (Terminal.Input.prop("tagName")) {
        case "TEXTAREA":
            t = Terminal.Input.val();
            break;
        default:
            t = Terminal.Input.text()
        }
        return t = t.trim()
    },
    _setInputVal: function(n, t) {
        Terminal.Input = t || $("#input");
        switch (Terminal.Input.prop("tagName")) {
        case "TEXTAREA":
            Terminal.Input.val(n);
            break;
        default:
            Terminal.Input.text(n)
        }
    },
    FormatOutput: function(n, t) {
        var i, u, f;
        if (Terminal.Input = t || $("#input"),
        Terminal.ConsoleInputs.length > 0) {
            for (var o = /\[ConsoleInputLine_\d\]/g, r = [], e = []; e = o.exec(n); )
                r.push(e[0]);
            for (i = 0; i < r.length; i++)
                u = r[i],
                f = u.split("_")[1].replace("]", ""),
                Terminal.ConsoleInputs[f] !== undefined && (n = n.replace(u, "<b>" + Terminal.ConsoleInputs[f] + "<\/b>"))
        }
        return n.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(/\r\n/g, "<br/>").replace(/\n/g, "<br/>").replace(/[ ]{4}/g, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(/[ ]/g, "&nbsp;")
    }
}),
AutoRunner = {},
$.extend(AutoRunner, {
    handleAutorun: function(n, t) {
        var i = n || !_.isUndefined(window.academyCode) || $("input[name=IsAutoRun]:checked").val() == "True";
        collaboration.refetchClients(),
        i && (!collaboration.isEnabled() || collaboration.isPrimary()) && (collaboration.codeExecuting(),
        _.isUndefined(window.academyCode) ? (Terminal.ConsoleInputs = [],
        CodeRunner.addToQueue(!1)) : academyCode.run(t))
    }
}),
Linter = {},
$.extend(Linter, {
    _ERROR_SEVERITY: 0,
    _lintTimer: null,
    _delayedRun: null,
    _result: [],
    _updateLintingHandler: null,
    _startup: !0,
    _lastObj: null,
    getSyntaxErrors: function(n, t, i, r) {
        Linter._startup && (i || r.options.lint).startup && (Linter._startup = !1),
        Linter._updateLintingHandler = t,
        Linter._lintTimer ? Linter._delayedRun = !0 : (Linter.getValidatorResultsAsync(r, t),
        Linter.startTimer(r))
    },
    startTimer: function(n) {
        Linter._lintTimer = setTimeout(function() {
            Linter._lintTimer = null,
            Linter._delayedRun && Linter.getSyntaxErrors("", Linter._updateLintingHandler, null, n),
            Linter._delayedRun = !1
        }, 3e3)
    },
    getValidatorResultsAsync: function(n, t) {
        var u = [], r, i;
        if (!nugetPackageManager.isLoaded()) {
            r = this,
            setTimeout(function() {
                Linter.getValidatorResultsAsync(n, t)
            }, 500);
            return
        }
        (i = _.isUndefined(window.academyCode) ? CodeRunner.getFormData(!0, !1) : academyCode.getFormData(n.options.codeBlockId, !0, !1),
        i) && (i.FileType = null,
        JSON.stringify(Linter._lastObj) != JSON.stringify(i)) && (Linter._lastObj = i,
        $.ajax({
            url: "https://thingproxy.freeboard.io/fetch/https://dotnetfiddle.net/Home/GetSyntaxErrors",
            method: "POST",
            async: !0,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(i),
            success: function(i) {
                function h(n, t) {
                    var i = [];
                    return t == null ? i = [] : $.each(t, function(t, r) {
                        var u = r.Column, o = n.getLine(r.Line), e, f;
                        if (o) {
                            for (e = n.getLine(r.Line).length,
                            f = n.getTokenAt({
                                line: r.Line,
                                ch: u
                            }); /^[\t ]*$/mig.test(f.string) && u < e; )
                                u = u + 1,
                                f = n.getTokenAt({
                                    line: r.Line,
                                    ch: u
                                });
                            i.push({
                                from: {
                                    line: r.Line,
                                    ch: f.start
                                },
                                to: {
                                    line: r.Line,
                                    ch: f.end
                                },
                                message: r.ErrorMessage,
                                severity: r.Severity == Linter._ERROR_SEVERITY ? "error" : "warning"
                            })
                        }
                    }),
                    i
                }
                function c(n) {
                    if (!n || !n.length)
                        return !1;
                    for (var t = 0; t < n.length; t++)
                        if (n[t].severity == "error")
                            return !0;
                    return !1
                }
                var f = _.isUndefined(window.academyCode) ? fiddle : academyCode.getFiddle(n.options.codeBlockId), r = f.getEditors(), e = !1, s, o, l, u;
                for (u in r)
                    s = (f.getProjectType() == "Mvc" || f.getProjectType() == "Nancy" ? u : "") + "Errors",
                    o = h(r[u], i[s]),
                    e = e || c(o),
                    typeof t == "function" && t(r[u], o);
                if (typeof AutoRunner != "undefined" && !e && !Linter._startup) {
                    r = f.getEditors();
                    for (u in r) {
                        l = r[u].getOption("theme");
                        break
                    }
                    window.academyCode ? AutoRunner.handleAutorun(!0, n.getOption("codeBlockId")) : AutoRunner.handleAutorun(!1)
                }
                Linter._startup && (Linter._startup = !1)
            }
        }))
    }
}),
function() {
    "use strict";
    function r(n, t) {
        return n.filter(function(n) {
            return n.Name.toUpperCase().indexOf(t.toUpperCase()) >= 0
        })
    }
    function e(n, t) {
        for (var i = 0; i < n.length; i++)
            if (n[i].Name == t)
                return i;
        return -1
    }
    function u(n, t, i) {
        this.Params = n,
        this.Returns = t,
        this.Description = i
    }
    function f(t, f) {
        var s, h, o, c, l;
        for (n.string != "." && n.string != " " && n.string != "(" && (t = r(t, n.string)),
        s = [],
        h = 0; h < t.length; h++)
            o = t[h],
            c = e(s, o.Name),
            c < 0 ? (o.ConstructorsOrOverloads = [],
            o.ConstructorsOrOverloads.push(new u(o.Params,o.Type,o.Description)),
            s.push(o)) : s[c].ConstructorsOrOverloads.push(new u(o.Params,o.Type,o.Description));
        return l = {
            list: s,
            from: i(f.line, n.string != "." && n.string != " " ? n.start : f.ch),
            to: i(f.line, n.string != "." && n.string != " " ? n.end : f.ch)
        }
    }
    function o(u, e, o, s) {
        var p = u.getDoc(), w = p.getValue(), c = u.getCursor(), k, l, v, y;
        s != null && (c = s);
        var b = null
          , a = w.split("\n")
          , d = a[c.line]
          , g = d.substring(0, c.ch)
          , h = u.getTokenAt(i(c.line, c.ch));
        if (a[c.line] = g,
        k = a.slice(0, c.line + 1).join("\n"),
        b = k.length,
        p.mode.name == "vb" && h.string.length > 1 && (h.string.indexOf(".") == 0 || h.string.indexOf(" ") == 0) && (h.string = h.string.substring(1, h.string.length),
        h.start++),
        t.length > 0 && (h.string == "(" || h.string == "." || h.string == " " || n.string != "." && n.string != " " && h.string.toUpperCase().indexOf(n.string.toUpperCase()) < 0 || r(t, h.string).length == 0) && (t = []),
        n = h,
        t.length == 0) {
            l = _.isUndefined(window.academyCode) ? CodeRunner.getFormData() : academyCode.getFormData(u.options.codeBlockId),
            v = fiddle.getEditors();
            for (y in v)
                if (v[y] == u) {
                    l.FileType = y;
                    break
                }
            l.Position = b,
            l.CodeBlock = $("<div/>").text(w).html(),
            $.ajax("https://thingproxy.freeboard.io/fetch/https://dotnetfiddle.net/Home/GetAutoComplete", {
                method: "POST",
                async: !0,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(l),
                success: function(n) {
                    t = n,
                    e(f(t, c))
                }
            })
        } else
            e(f(t, c))
    }
    function s(n, t) {
        var h = n.getDoc(), u = n.getCursor(), c = h.getValue(), e = c.split("\n"), v = e[u.line], y = v.substring(0, u.ch), r = n.getTokenAt(i(u.line, u.ch)), l, a, f, o, s;
        e[u.line] = y,
        l = e.slice(0, u.line + 1).join("\n"),
        a = l.length,
        h.mode.name == "vb" && r.string.length > 1 && (r.string.indexOf(".") == 0 || r.string.indexOf(" ") == 0) && (r.string = r.string.substring(1, r.string.length),
        r.start++),
        f = _.isUndefined(window.academyCode) ? CodeRunner.getFormData() : academyCode.getFormData(n.options.codeBlockId),
        o = fiddle.getEditors();
        for (s in o)
            if (o[s] == n) {
                f.FileType = s;
                break
            }
        f.Position = a,
        f.CodeBlock = $("<div/>").text(c).html(),
        $.ajax("https://thingproxy.freeboard.io/fetch/https://dotnetfiddle.net/Home/GetTokenType", {
            method: "POST",
            async: !0,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(f),
            success: function(i) {
                t(n, i)
            }
        })
    }
    function h(n, t) {
        var e, u;
        if (t != null) {
            if (!t.IsInsideArgumentList) {
                $(".hint-overloads").remove(),
                _completion_overloadsActive = !1;
                return
            }
            for (var i = t.RawArgumentsList, h = n.getDoc(), o = h.getCursor(), a = n.getTokenAt(o), e = /<[ ,.\w]*>\(\)/g, u = e.exec(i); u != null; )
                i = i.replace(u[0], Array(u[0].length).join("?")),
                u = e.exec(i);
            for (e = /"([^"]*)"/g,
            i = i.replace('\\"', "??"),
            u = e.exec(i); u != null; )
                i = i.replace(u[1], Array(u[1].length).join("?")),
                u = e.exec(i);
            i = i != null ? i.replace(/\( *\)/g, "") : null;
            var c = o.ch - t.ParentChar
              , l = i != null ? i.substring(0, c) : ""
              , r = l.split(",").length - 1
              , s = i != null ? $.map(i.split(","), $.trim) : []
              , f = s.length;
            $(".hint-overloads-item-param").removeClass("bold"),
            $(".hint-overloads-item-param-description").remove(),
            $.each($(".hint-overloads-item"), function(n, i) {
                var u = $(i).find(".hint-overloads-item-param"), o, e, h;
                if ((f > 1 || s[0] != "") && u.length < f) {
                    $(i).addClass("grayed");
                    return
                }
                if (o = !1,
                t != null && t.PreviousArgumentListTokenTypes != null)
                    for (e = 0; e < t.PreviousArgumentListTokenTypes.length; e++)
                        h = t.PreviousArgumentListTokenTypes[e],
                        h == null || $(u[e]).attr("type").match(/object/i) || $(u[e]).attr("type") == h || (o = !0);
                if (o) {
                    $(i).addClass("grayed");
                    return
                }
                $(i).removeClass("grayed"),
                u != null && u.length > 0 && (t == null || t.Type == null || $(u[r >= 0 ? r : f - 1]).attr("type") == t.Type || $(u[r >= 0 ? r : f - 1]).attr("type").match(/object/i)) && ($(u[r >= 0 ? r : f - 1]).addClass("bold"),
                $(i).append($("<span/>").addClass("hint-overloads-item-param-description").append("<b>" + $(u[r >= 0 ? r : f - 1]).attr("Name") + "<\/b>:" + $(u[r >= 0 ? r : f - 1]).attr("Description").replace('<paramref name="', "<b>").replace(/" ?\/>/, "<\/b>"))))
            }),
            $(".hint-overloads-item").removeClass("active"),
            $($(".hint-overloads-item").not(".grayed")[0]).addClass("active"),
            $(".hint-overloads-item.active").parent().scrollTop($(".hint-overloads-item.active").parent().scrollTop() + ($(".hint-overloads-item.active").position() || {
                top: 0
            }).top)
        }
    }
    var i = CodeMirror.Pos
      , t = []
      , n = null;
    CodeMirror.registerHelper("hint", "vbcsharp", o),
    CodeMirror.registerHelper("hint", "getTokenType", s),
    CodeMirror.registerHelper("hint", "highlightArgument", h)
}(),
CodeMirror.commands.spaceautocomplete = function(n) {
    var u = n.getCursor(), r, i;
    (n.replaceSelection(n.getSelection() + " "),
    n.setCursor({
        line: u.line,
        ch: u.ch + 1
    }),
    r = n.getCursor(),
    i = n.getTokenAt({
        line: r.line,
        ch: r.ch - 1
    }),
    i.string.toUpperCase() == "NEW" || i.string.toUpperCase() == "USING" || i.string.toUpperCase() == "IMPORTS" || i.string.toUpperCase() == "OPEN") && CodeMirror.showHint(n, CodeMirror.hint.vbcsharp, {
        async: !0
    })
}
,
CodeMirror.commands.autocomplete = function(n) {
    CodeMirror.showHint(n, CodeMirror.hint.vbcsharp, {
        async: !0
    })
}
,
CodeMirror.commands.dotautocomplete = function(n) {
    var t = n.getCursor();
    n.replaceSelection(n.getSelection() + "."),
    n.setCursor({
        line: t.line,
        ch: t.ch + 1
    }),
    CodeMirror.showHint(n, CodeMirror.hint.vbcsharp, {
        async: !0
    })
}
,
CodeMirror.commands.commaOverloads = function(n) {
    var t = n.getCursor(), i;
    n.replaceSelection(n.getSelection() + ","),
    n.setCursor({
        line: t.line,
        ch: t.ch + 1
    }),
    i = n.getTokenTypeAt(n.getCursor()),
    i != "string" && CodeMirror.showOverloads(n, CodeMirror.hint.getTokenType, {
        async: !0,
        hint: CodeMirror.hint.vbcsharp
    })
}
,
CodeMirror.commands.commentSelection = function(n) {
    var u = {
        indent: !0,
        commentBlankLines: !1,
        padding: ""
    }
      , i = n.getCursor("start")
      , r = n.getCursor("end");
    i.line == r.line ? n.lineComment(i, r, u) : n.blockComment(i, r, u)
}
,
CodeMirror.commands.uncommentSelection = function(n) {
    var f = {
        indent: !0,
        commentBlankLines: !1
    }, r = n.getCursor("start"), u = n.getCursor("end"), i;
    if (r.line == u.line)
        n.uncomment(r, u, f);
    else
        for (i = r.line; i <= u.line; i++)
            n.uncomment({
                line: i,
                ch: 0
            }, {
                line: i,
                ch: 0
            }, f)
}
,
tokenTypeTimer = null
