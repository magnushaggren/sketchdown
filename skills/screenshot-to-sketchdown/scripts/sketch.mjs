// Sketchdown spec checker, generated from src/cli by npm run skill. Do not edit.
// Usage: node sketch.mjs spec.txt out.svg out.png (PNG needs Chrome or Edge)
// Includes Rough.js (MIT), https://roughjs.com
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/roughjs/bundled/rough.cjs.js
var require_rough_cjs = __commonJS({
  "node_modules/roughjs/bundled/rough.cjs.js"(exports, module) {
    "use strict";
    var t = function(e2, n2) {
      return t = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t2, e3) {
        t2.__proto__ = e3;
      } || function(t2, e3) {
        for (var n3 in e3) Object.prototype.hasOwnProperty.call(e3, n3) && (t2[n3] = e3[n3]);
      }, t(e2, n2);
    };
    function e(e2, n2) {
      if ("function" != typeof n2 && null !== n2) throw new TypeError("Class extends value " + String(n2) + " is not a constructor or null");
      function r2() {
        this.constructor = e2;
      }
      t(e2, n2), e2.prototype = null === n2 ? Object.create(n2) : (r2.prototype = n2.prototype, new r2());
    }
    var n = function() {
      return n = Object.assign || function(t2) {
        for (var e2, n2 = 1, r2 = arguments.length; n2 < r2; n2++) for (var a2 in e2 = arguments[n2]) Object.prototype.hasOwnProperty.call(e2, a2) && (t2[a2] = e2[a2]);
        return t2;
      }, n.apply(this, arguments);
    };
    function r(t2, e2, n2) {
      if (n2 || 2 === arguments.length) for (var r2, a2 = 0, s2 = e2.length; a2 < s2; a2++) !r2 && a2 in e2 || (r2 || (r2 = Array.prototype.slice.call(e2, 0, a2)), r2[a2] = e2[a2]);
      return t2.concat(r2 || Array.prototype.slice.call(e2));
    }
    function a(t2, e2, n2) {
      if (t2 && t2.length) {
        const [r2, a2] = e2, s2 = Math.PI / 180 * n2, o2 = Math.cos(s2), i2 = Math.sin(s2);
        for (const e3 of t2) {
          const [t3, n3] = e3;
          e3[0] = (t3 - r2) * o2 - (n3 - a2) * i2 + r2, e3[1] = (t3 - r2) * i2 + (n3 - a2) * o2 + a2;
        }
      }
    }
    function s(t2, e2) {
      return t2[0] === e2[0] && t2[1] === e2[1];
    }
    function o(t2, e2, n2, r2 = 1) {
      const o2 = n2, i2 = Math.max(e2, 0.1), h2 = t2[0] && t2[0][0] && "number" == typeof t2[0][0] ? [t2] : t2, u2 = [0, 0];
      if (o2) for (const t3 of h2) a(t3, u2, o2);
      const p2 = (function(t3, e3, n3) {
        const r3 = [];
        for (const e4 of t3) {
          const t4 = [...e4];
          s(t4[0], t4[t4.length - 1]) || t4.push([t4[0][0], t4[0][1]]), t4.length > 2 && r3.push(t4);
        }
        const a2 = [];
        e3 = Math.max(e3, 0.1);
        const o3 = [];
        for (const t4 of r3) for (let e4 = 0; e4 < t4.length - 1; e4++) {
          const n4 = t4[e4], r4 = t4[e4 + 1];
          if (n4[1] !== r4[1]) {
            const t5 = Math.min(n4[1], r4[1]);
            o3.push({ ymin: t5, ymax: Math.max(n4[1], r4[1]), x: t5 === n4[1] ? n4[0] : r4[0], islope: (r4[0] - n4[0]) / (r4[1] - n4[1]) });
          }
        }
        if (o3.sort(((t4, e4) => t4.ymin < e4.ymin ? -1 : t4.ymin > e4.ymin ? 1 : t4.x < e4.x ? -1 : t4.x > e4.x ? 1 : t4.ymax === e4.ymax ? 0 : (t4.ymax - e4.ymax) / Math.abs(t4.ymax - e4.ymax))), !o3.length) return a2;
        let i3 = [], h3 = o3[0].ymin, u3 = 0;
        for (; i3.length || o3.length; ) {
          if (o3.length) {
            let t4 = -1;
            for (let e4 = 0; e4 < o3.length && !(o3[e4].ymin > h3); e4++) t4 = e4;
            o3.splice(0, t4 + 1).forEach(((t5) => {
              i3.push({ s: h3, edge: t5 });
            }));
          }
          if (i3 = i3.filter(((t4) => !(t4.edge.ymax <= h3))), i3.sort(((t4, e4) => t4.edge.x === e4.edge.x ? 0 : (t4.edge.x - e4.edge.x) / Math.abs(t4.edge.x - e4.edge.x))), (1 !== n3 || u3 % e3 == 0) && i3.length > 1) for (let t4 = 0; t4 < i3.length; t4 += 2) {
            const e4 = t4 + 1;
            if (e4 >= i3.length) break;
            const n4 = i3[t4].edge, r4 = i3[e4].edge;
            a2.push([[Math.round(n4.x), h3], [Math.round(r4.x), h3]]);
          }
          h3 += n3, i3.forEach(((t4) => {
            t4.edge.x = t4.edge.x + n3 * t4.edge.islope;
          })), u3++;
        }
        return a2;
      })(h2, i2, r2);
      if (o2) {
        for (const t3 of h2) a(t3, u2, -o2);
        !(function(t3, e3, n3) {
          const r3 = [];
          t3.forEach(((t4) => r3.push(...t4))), a(r3, e3, n3);
        })(p2, u2, -o2);
      }
      return p2;
    }
    function i(t2, e2) {
      var n2, r2 = e2.hachureAngle + 90, a2 = e2.hachureGap;
      a2 < 0 && (a2 = 4 * e2.strokeWidth), a2 = Math.round(Math.max(a2, 0.1));
      var s2 = 1;
      return e2.roughness >= 1 && ((null === (n2 = e2.randomizer) || void 0 === n2 ? void 0 : n2.next()) || Math.random()) > 0.7 && (s2 = a2), o(t2, a2, r2, s2 || 1);
    }
    var h = (function() {
      function t2(t3) {
        this.helper = t3;
      }
      return t2.prototype.fillPolygons = function(t3, e2) {
        return this._fillPolygons(t3, e2);
      }, t2.prototype._fillPolygons = function(t3, e2) {
        var n2 = i(t3, e2);
        return { type: "fillSketch", ops: this.renderLines(n2, e2) };
      }, t2.prototype.renderLines = function(t3, e2) {
        for (var n2 = [], r2 = 0, a2 = t3; r2 < a2.length; r2++) {
          var s2 = a2[r2];
          n2.push.apply(n2, this.helper.doubleLineOps(s2[0][0], s2[0][1], s2[1][0], s2[1][1], e2));
        }
        return n2;
      }, t2;
    })();
    function u(t2) {
      var e2 = t2[0], n2 = t2[1];
      return Math.sqrt(Math.pow(e2[0] - n2[0], 2) + Math.pow(e2[1] - n2[1], 2));
    }
    var p = (function(t2) {
      function n2() {
        return null !== t2 && t2.apply(this, arguments) || this;
      }
      return e(n2, t2), n2.prototype.fillPolygons = function(t3, e2) {
        var n3 = e2.hachureGap;
        n3 < 0 && (n3 = 4 * e2.strokeWidth), n3 = Math.max(n3, 0.1);
        for (var a2 = i(t3, Object.assign({}, e2, { hachureGap: n3 })), s2 = Math.PI / 180 * e2.hachureAngle, o2 = [], h2 = 0.5 * n3 * Math.cos(s2), p2 = 0.5 * n3 * Math.sin(s2), l2 = 0, c2 = a2; l2 < c2.length; l2++) {
          var f2 = c2[l2], d2 = f2[0], g2 = f2[1];
          u([d2, g2]) && o2.push([[d2[0] - h2, d2[1] + p2], r([], g2, true)], [[d2[0] + h2, d2[1] - p2], r([], g2, true)]);
        }
        return { type: "fillSketch", ops: this.renderLines(o2, e2) };
      }, n2;
    })(h);
    var l = (function(t2) {
      function n2() {
        return null !== t2 && t2.apply(this, arguments) || this;
      }
      return e(n2, t2), n2.prototype.fillPolygons = function(t3, e2) {
        var n3 = this._fillPolygons(t3, e2), r2 = Object.assign({}, e2, { hachureAngle: e2.hachureAngle + 90 }), a2 = this._fillPolygons(t3, r2);
        return n3.ops = n3.ops.concat(a2.ops), n3;
      }, n2;
    })(h);
    var c = (function() {
      function t2(t3) {
        this.helper = t3;
      }
      return t2.prototype.fillPolygons = function(t3, e2) {
        var n2 = i(t3, e2 = Object.assign({}, e2, { hachureAngle: 0 }));
        return this.dotsOnLines(n2, e2);
      }, t2.prototype.dotsOnLines = function(t3, e2) {
        var n2 = [], r2 = e2.hachureGap;
        r2 < 0 && (r2 = 4 * e2.strokeWidth), r2 = Math.max(r2, 0.1);
        var a2 = e2.fillWeight;
        a2 < 0 && (a2 = e2.strokeWidth / 2);
        for (var s2 = r2 / 4, o2 = 0, i2 = t3; o2 < i2.length; o2++) for (var h2 = i2[o2], p2 = u(h2), l2 = p2 / r2, c2 = Math.ceil(l2) - 1, f2 = p2 - c2 * r2, d2 = (h2[0][0] + h2[1][0]) / 2 - r2 / 4, g2 = Math.min(h2[0][1], h2[1][1]), y2 = 0; y2 < c2; y2++) {
          var v2 = g2 + f2 + y2 * r2, M2 = d2 - s2 + 2 * Math.random() * s2, k2 = v2 - s2 + 2 * Math.random() * s2, b2 = this.helper.ellipse(M2, k2, a2, a2, e2);
          n2.push.apply(n2, b2.ops);
        }
        return { type: "fillSketch", ops: n2 };
      }, t2;
    })();
    var f = (function() {
      function t2(t3) {
        this.helper = t3;
      }
      return t2.prototype.fillPolygons = function(t3, e2) {
        var n2 = i(t3, e2);
        return { type: "fillSketch", ops: this.dashedLine(n2, e2) };
      }, t2.prototype.dashedLine = function(t3, e2) {
        var n2 = this, r2 = e2.dashOffset < 0 ? e2.hachureGap < 0 ? 4 * e2.strokeWidth : e2.hachureGap : e2.dashOffset, a2 = e2.dashGap < 0 ? e2.hachureGap < 0 ? 4 * e2.strokeWidth : e2.hachureGap : e2.dashGap, s2 = [];
        return t3.forEach((function(t4) {
          var o2 = u(t4), i2 = Math.floor(o2 / (r2 + a2)), h2 = (o2 + a2 - i2 * (r2 + a2)) / 2, p2 = t4[0], l2 = t4[1];
          p2[0] > l2[0] && (p2 = t4[1], l2 = t4[0]);
          for (var c2 = Math.atan((l2[1] - p2[1]) / (l2[0] - p2[0])), f2 = 0; f2 < i2; f2++) {
            var d2 = f2 * (r2 + a2), g2 = d2 + r2, y2 = [p2[0] + d2 * Math.cos(c2) + h2 * Math.cos(c2), p2[1] + d2 * Math.sin(c2) + h2 * Math.sin(c2)], v2 = [p2[0] + g2 * Math.cos(c2) + h2 * Math.cos(c2), p2[1] + g2 * Math.sin(c2) + h2 * Math.sin(c2)];
            s2.push.apply(s2, n2.helper.doubleLineOps(y2[0], y2[1], v2[0], v2[1], e2));
          }
        })), s2;
      }, t2;
    })();
    var d = (function() {
      function t2(t3) {
        this.helper = t3;
      }
      return t2.prototype.fillPolygons = function(t3, e2) {
        var n2 = e2.hachureGap < 0 ? 4 * e2.strokeWidth : e2.hachureGap, r2 = e2.zigzagOffset < 0 ? n2 : e2.zigzagOffset, a2 = i(t3, e2 = Object.assign({}, e2, { hachureGap: n2 + r2 }));
        return { type: "fillSketch", ops: this.zigzagLines(a2, r2, e2) };
      }, t2.prototype.zigzagLines = function(t3, e2, n2) {
        var a2 = this, s2 = [];
        return t3.forEach((function(t4) {
          var o2 = u(t4), i2 = Math.round(o2 / (2 * e2)), h2 = t4[0], p2 = t4[1];
          h2[0] > p2[0] && (h2 = t4[1], p2 = t4[0]);
          for (var l2 = Math.atan((p2[1] - h2[1]) / (p2[0] - h2[0])), c2 = 0; c2 < i2; c2++) {
            var f2 = 2 * c2 * e2, d2 = 2 * (c2 + 1) * e2, g2 = Math.sqrt(2 * Math.pow(e2, 2)), y2 = [h2[0] + f2 * Math.cos(l2), h2[1] + f2 * Math.sin(l2)], v2 = [h2[0] + d2 * Math.cos(l2), h2[1] + d2 * Math.sin(l2)], M2 = [y2[0] + g2 * Math.cos(l2 + Math.PI / 4), y2[1] + g2 * Math.sin(l2 + Math.PI / 4)];
            s2.push.apply(s2, r(r([], a2.helper.doubleLineOps(y2[0], y2[1], M2[0], M2[1], n2), false), a2.helper.doubleLineOps(M2[0], M2[1], v2[0], v2[1], n2), false));
          }
        })), s2;
      }, t2;
    })();
    var g = {};
    var y = (function() {
      function t2(t3) {
        this.seed = t3;
      }
      return t2.prototype.next = function() {
        return this.seed ? (Math.pow(2, 31) - 1 & (this.seed = Math.imul(48271, this.seed))) / Math.pow(2, 31) : Math.random();
      }, t2;
    })();
    var v = 0;
    var M = 1;
    var k = 2;
    var b = { A: 7, a: 7, C: 6, c: 6, H: 1, h: 1, L: 2, l: 2, M: 2, m: 2, Q: 4, q: 4, S: 4, s: 4, T: 2, t: 2, V: 1, v: 1, Z: 0, z: 0 };
    function m(t2, e2) {
      return t2.type === e2;
    }
    function w(t2) {
      const e2 = [], n2 = (function(t3) {
        const e3 = new Array();
        for (; "" !== t3; ) if (t3.match(/^([ \t\r\n,]+)/)) t3 = t3.substr(RegExp.$1.length);
        else if (t3.match(/^([aAcChHlLmMqQsStTvVzZ])/)) e3[e3.length] = { type: v, text: RegExp.$1 }, t3 = t3.substr(RegExp.$1.length);
        else {
          if (!t3.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/)) return [];
          e3[e3.length] = { type: M, text: `${parseFloat(RegExp.$1)}` }, t3 = t3.substr(RegExp.$1.length);
        }
        return e3[e3.length] = { type: k, text: "" }, e3;
      })(t2);
      let r2 = "BOD", a2 = 0, s2 = n2[a2];
      for (; !m(s2, k); ) {
        let o2 = 0;
        const i2 = [];
        if ("BOD" === r2) {
          if ("M" !== s2.text && "m" !== s2.text) return w("M0,0" + t2);
          a2++, o2 = b[s2.text], r2 = s2.text;
        } else m(s2, M) ? o2 = b[r2] : (a2++, o2 = b[s2.text], r2 = s2.text);
        if (!(a2 + o2 < n2.length)) throw new Error("Path data ended short");
        for (let t3 = a2; t3 < a2 + o2; t3++) {
          const e3 = n2[t3];
          if (!m(e3, M)) throw new Error("Param not a number: " + r2 + "," + e3.text);
          i2[i2.length] = +e3.text;
        }
        if ("number" != typeof b[r2]) throw new Error("Bad segment: " + r2);
        {
          const t3 = { key: r2, data: i2 };
          e2.push(t3), a2 += o2, s2 = n2[a2], "M" === r2 && (r2 = "L"), "m" === r2 && (r2 = "l");
        }
      }
      return e2;
    }
    function P(t2) {
      let e2 = 0, n2 = 0, r2 = 0, a2 = 0;
      const s2 = [];
      for (const { key: o2, data: i2 } of t2) switch (o2) {
        case "M":
          s2.push({ key: "M", data: [...i2] }), [e2, n2] = i2, [r2, a2] = i2;
          break;
        case "m":
          e2 += i2[0], n2 += i2[1], s2.push({ key: "M", data: [e2, n2] }), r2 = e2, a2 = n2;
          break;
        case "L":
          s2.push({ key: "L", data: [...i2] }), [e2, n2] = i2;
          break;
        case "l":
          e2 += i2[0], n2 += i2[1], s2.push({ key: "L", data: [e2, n2] });
          break;
        case "C":
          s2.push({ key: "C", data: [...i2] }), e2 = i2[4], n2 = i2[5];
          break;
        case "c": {
          const t3 = i2.map(((t4, r3) => r3 % 2 ? t4 + n2 : t4 + e2));
          s2.push({ key: "C", data: t3 }), e2 = t3[4], n2 = t3[5];
          break;
        }
        case "Q":
          s2.push({ key: "Q", data: [...i2] }), e2 = i2[2], n2 = i2[3];
          break;
        case "q": {
          const t3 = i2.map(((t4, r3) => r3 % 2 ? t4 + n2 : t4 + e2));
          s2.push({ key: "Q", data: t3 }), e2 = t3[2], n2 = t3[3];
          break;
        }
        case "A":
          s2.push({ key: "A", data: [...i2] }), e2 = i2[5], n2 = i2[6];
          break;
        case "a":
          e2 += i2[5], n2 += i2[6], s2.push({ key: "A", data: [i2[0], i2[1], i2[2], i2[3], i2[4], e2, n2] });
          break;
        case "H":
          s2.push({ key: "H", data: [...i2] }), e2 = i2[0];
          break;
        case "h":
          e2 += i2[0], s2.push({ key: "H", data: [e2] });
          break;
        case "V":
          s2.push({ key: "V", data: [...i2] }), n2 = i2[0];
          break;
        case "v":
          n2 += i2[0], s2.push({ key: "V", data: [n2] });
          break;
        case "S":
          s2.push({ key: "S", data: [...i2] }), e2 = i2[2], n2 = i2[3];
          break;
        case "s": {
          const t3 = i2.map(((t4, r3) => r3 % 2 ? t4 + n2 : t4 + e2));
          s2.push({ key: "S", data: t3 }), e2 = t3[2], n2 = t3[3];
          break;
        }
        case "T":
          s2.push({ key: "T", data: [...i2] }), e2 = i2[0], n2 = i2[1];
          break;
        case "t":
          e2 += i2[0], n2 += i2[1], s2.push({ key: "T", data: [e2, n2] });
          break;
        case "Z":
        case "z":
          s2.push({ key: "Z", data: [] }), e2 = r2, n2 = a2;
      }
      return s2;
    }
    function x(t2) {
      const e2 = [];
      let n2 = "", r2 = 0, a2 = 0, s2 = 0, o2 = 0, i2 = 0, h2 = 0;
      for (const { key: u2, data: p2 } of t2) {
        switch (u2) {
          case "M":
            e2.push({ key: "M", data: [...p2] }), [r2, a2] = p2, [s2, o2] = p2;
            break;
          case "C":
            e2.push({ key: "C", data: [...p2] }), r2 = p2[4], a2 = p2[5], i2 = p2[2], h2 = p2[3];
            break;
          case "L":
            e2.push({ key: "L", data: [...p2] }), [r2, a2] = p2;
            break;
          case "H":
            r2 = p2[0], e2.push({ key: "L", data: [r2, a2] });
            break;
          case "V":
            a2 = p2[0], e2.push({ key: "L", data: [r2, a2] });
            break;
          case "S": {
            let t3 = 0, s3 = 0;
            "C" === n2 || "S" === n2 ? (t3 = r2 + (r2 - i2), s3 = a2 + (a2 - h2)) : (t3 = r2, s3 = a2), e2.push({ key: "C", data: [t3, s3, ...p2] }), i2 = p2[0], h2 = p2[1], r2 = p2[2], a2 = p2[3];
            break;
          }
          case "T": {
            const [t3, s3] = p2;
            let o3 = 0, u3 = 0;
            "Q" === n2 || "T" === n2 ? (o3 = r2 + (r2 - i2), u3 = a2 + (a2 - h2)) : (o3 = r2, u3 = a2);
            const l2 = r2 + 2 * (o3 - r2) / 3, c2 = a2 + 2 * (u3 - a2) / 3, f2 = t3 + 2 * (o3 - t3) / 3, d2 = s3 + 2 * (u3 - s3) / 3;
            e2.push({ key: "C", data: [l2, c2, f2, d2, t3, s3] }), i2 = o3, h2 = u3, r2 = t3, a2 = s3;
            break;
          }
          case "Q": {
            const [t3, n3, s3, o3] = p2, u3 = r2 + 2 * (t3 - r2) / 3, l2 = a2 + 2 * (n3 - a2) / 3, c2 = s3 + 2 * (t3 - s3) / 3, f2 = o3 + 2 * (n3 - o3) / 3;
            e2.push({ key: "C", data: [u3, l2, c2, f2, s3, o3] }), i2 = t3, h2 = n3, r2 = s3, a2 = o3;
            break;
          }
          case "A": {
            const t3 = Math.abs(p2[0]), n3 = Math.abs(p2[1]), s3 = p2[2], o3 = p2[3], i3 = p2[4], h3 = p2[5], u3 = p2[6];
            if (0 === t3 || 0 === n3) e2.push({ key: "C", data: [r2, a2, h3, u3, h3, u3] }), r2 = h3, a2 = u3;
            else if (r2 !== h3 || a2 !== u3) {
              O(r2, a2, h3, u3, t3, n3, s3, o3, i3).forEach((function(t4) {
                e2.push({ key: "C", data: t4 });
              })), r2 = h3, a2 = u3;
            }
            break;
          }
          case "Z":
            e2.push({ key: "Z", data: [] }), r2 = s2, a2 = o2;
        }
        n2 = u2;
      }
      return e2;
    }
    function S(t2, e2, n2) {
      return [t2 * Math.cos(n2) - e2 * Math.sin(n2), t2 * Math.sin(n2) + e2 * Math.cos(n2)];
    }
    function O(t2, e2, n2, r2, a2, s2, o2, i2, h2, u2) {
      const p2 = (l2 = o2, Math.PI * l2 / 180);
      var l2;
      let c2 = [], f2 = 0, d2 = 0, g2 = 0, y2 = 0;
      if (u2) [f2, d2, g2, y2] = u2;
      else {
        [t2, e2] = S(t2, e2, -p2), [n2, r2] = S(n2, r2, -p2);
        const o3 = (t2 - n2) / 2, u3 = (e2 - r2) / 2;
        let l3 = o3 * o3 / (a2 * a2) + u3 * u3 / (s2 * s2);
        l3 > 1 && (l3 = Math.sqrt(l3), a2 *= l3, s2 *= l3);
        const c3 = a2 * a2, v3 = s2 * s2, M3 = c3 * v3 - c3 * u3 * u3 - v3 * o3 * o3, k3 = c3 * u3 * u3 + v3 * o3 * o3, b3 = (i2 === h2 ? -1 : 1) * Math.sqrt(Math.abs(M3 / k3));
        g2 = b3 * a2 * u3 / s2 + (t2 + n2) / 2, y2 = b3 * -s2 * o3 / a2 + (e2 + r2) / 2, f2 = Math.asin(parseFloat(((e2 - y2) / s2).toFixed(9))), d2 = Math.asin(parseFloat(((r2 - y2) / s2).toFixed(9))), t2 < g2 && (f2 = Math.PI - f2), n2 < g2 && (d2 = Math.PI - d2), f2 < 0 && (f2 = 2 * Math.PI + f2), d2 < 0 && (d2 = 2 * Math.PI + d2), h2 && f2 > d2 && (f2 -= 2 * Math.PI), !h2 && d2 > f2 && (d2 -= 2 * Math.PI);
      }
      let v2 = d2 - f2;
      if (Math.abs(v2) > 120 * Math.PI / 180) {
        const t3 = d2, e3 = n2, i3 = r2;
        d2 = h2 && d2 > f2 ? f2 + 120 * Math.PI / 180 * 1 : f2 + 120 * Math.PI / 180 * -1, c2 = O(n2 = g2 + a2 * Math.cos(d2), r2 = y2 + s2 * Math.sin(d2), e3, i3, a2, s2, o2, 0, h2, [d2, t3, g2, y2]);
      }
      v2 = d2 - f2;
      const M2 = Math.cos(f2), k2 = Math.sin(f2), b2 = Math.cos(d2), m2 = Math.sin(d2), w2 = Math.tan(v2 / 4), P2 = 4 / 3 * a2 * w2, x2 = 4 / 3 * s2 * w2, L2 = [t2, e2], T2 = [t2 + P2 * k2, e2 - x2 * M2], _2 = [n2 + P2 * m2, r2 - x2 * b2], D2 = [n2, r2];
      if (T2[0] = 2 * L2[0] - T2[0], T2[1] = 2 * L2[1] - T2[1], u2) return [T2, _2, D2].concat(c2);
      {
        c2 = [T2, _2, D2].concat(c2);
        const t3 = [];
        for (let e3 = 0; e3 < c2.length; e3 += 3) {
          const n3 = S(c2[e3][0], c2[e3][1], p2), r3 = S(c2[e3 + 1][0], c2[e3 + 1][1], p2), a3 = S(c2[e3 + 2][0], c2[e3 + 2][1], p2);
          t3.push([n3[0], n3[1], r3[0], r3[1], a3[0], a3[1]]);
        }
        return t3;
      }
    }
    var L = { randOffset: function(t2, e2) {
      return F(t2, e2);
    }, randOffsetWithRange: function(t2, e2, n2) {
      return q(t2, e2, n2);
    }, ellipse: function(t2, e2, n2, r2, a2) {
      var s2 = I(n2, r2, a2);
      return C(t2, e2, a2, s2).opset;
    }, doubleLineOps: function(t2, e2, n2, r2, a2) {
      return V(t2, e2, n2, r2, a2, true);
    } };
    function T(t2, e2, n2, r2, a2) {
      return { type: "path", ops: V(t2, e2, n2, r2, a2) };
    }
    function _(t2, e2, n2) {
      var r2 = (t2 || []).length;
      if (r2 > 2) {
        for (var a2 = [], s2 = 0; s2 < r2 - 1; s2++) a2.push.apply(a2, V(t2[s2][0], t2[s2][1], t2[s2 + 1][0], t2[s2 + 1][1], n2));
        return e2 && a2.push.apply(a2, V(t2[r2 - 1][0], t2[r2 - 1][1], t2[0][0], t2[0][1], n2)), { type: "path", ops: a2 };
      }
      return 2 === r2 ? T(t2[0][0], t2[0][1], t2[1][0], t2[1][1], n2) : { type: "path", ops: [] };
    }
    function D(t2, e2, n2, r2, a2) {
      return (function(t3, e3) {
        return _(t3, true, e3);
      })([[t2, e2], [t2 + n2, e2], [t2 + n2, e2 + r2], [t2, e2 + r2]], a2);
    }
    function A(t2, e2) {
      if (t2.length) {
        for (var n2 = "number" == typeof t2[0][0] ? [t2] : t2, r2 = Q(n2[0], 1 * (1 + 0.2 * e2.roughness), e2), a2 = e2.disableMultiStroke ? [] : Q(n2[0], 1.5 * (1 + 0.22 * e2.roughness), R(e2)), s2 = 1; s2 < n2.length; s2++) {
          var o2 = n2[s2];
          if (o2.length) {
            for (var i2 = Q(o2, 1 * (1 + 0.2 * e2.roughness), e2), h2 = e2.disableMultiStroke ? [] : Q(o2, 1.5 * (1 + 0.22 * e2.roughness), R(e2)), u2 = 0, p2 = i2; u2 < p2.length; u2++) {
              "move" !== (f2 = p2[u2]).op && r2.push(f2);
            }
            for (var l2 = 0, c2 = h2; l2 < c2.length; l2++) {
              var f2;
              "move" !== (f2 = c2[l2]).op && a2.push(f2);
            }
          }
        }
        return { type: "path", ops: r2.concat(a2) };
      }
      return { type: "path", ops: [] };
    }
    function I(t2, e2, n2) {
      var r2 = Math.sqrt(2 * Math.PI * Math.sqrt((Math.pow(t2 / 2, 2) + Math.pow(e2 / 2, 2)) / 2)), a2 = Math.ceil(Math.max(n2.curveStepCount, n2.curveStepCount / Math.sqrt(200) * r2)), s2 = 2 * Math.PI / a2, o2 = Math.abs(t2 / 2), i2 = Math.abs(e2 / 2), h2 = 1 - n2.curveFitting;
      return { increment: s2, rx: o2 += F(o2 * h2, n2), ry: i2 += F(i2 * h2, n2) };
    }
    function C(t2, e2, n2, r2) {
      var a2 = $(r2.increment, t2, e2, r2.rx, r2.ry, 1, r2.increment * q(0.1, q(0.4, 1, n2), n2), n2), s2 = a2[0], o2 = a2[1], i2 = H(s2, null, n2);
      if (!n2.disableMultiStroke && 0 !== n2.roughness) {
        var h2 = H($(r2.increment, t2, e2, r2.rx, r2.ry, 1.5, 0, n2)[0], null, n2);
        i2 = i2.concat(h2);
      }
      return { estimatedPoints: o2, opset: { type: "path", ops: i2 } };
    }
    function z(t2, e2, n2, a2, s2, o2, i2, h2, u2) {
      var p2 = t2, l2 = e2, c2 = Math.abs(n2 / 2), f2 = Math.abs(a2 / 2);
      c2 += F(0.01 * c2, u2), f2 += F(0.01 * f2, u2);
      for (var d2 = s2, g2 = o2; d2 < 0; ) d2 += 2 * Math.PI, g2 += 2 * Math.PI;
      g2 - d2 > 2 * Math.PI && (d2 = 0, g2 = 2 * Math.PI);
      var y2 = 2 * Math.PI / u2.curveStepCount, v2 = Math.min(y2 / 2, (g2 - d2) / 2), M2 = N(v2, p2, l2, c2, f2, d2, g2, 1, u2);
      if (!u2.disableMultiStroke) {
        var k2 = N(v2, p2, l2, c2, f2, d2, g2, 1.5, u2);
        M2.push.apply(M2, k2);
      }
      return i2 && (h2 ? M2.push.apply(M2, r(r([], V(p2, l2, p2 + c2 * Math.cos(d2), l2 + f2 * Math.sin(d2), u2), false), V(p2, l2, p2 + c2 * Math.cos(g2), l2 + f2 * Math.sin(g2), u2), false)) : M2.push({ op: "lineTo", data: [p2, l2] }, { op: "lineTo", data: [p2 + c2 * Math.cos(d2), l2 + f2 * Math.sin(d2)] })), { type: "path", ops: M2 };
    }
    function W(t2, e2) {
      for (var n2 = [], r2 = [0, 0], a2 = [0, 0], s2 = 0, o2 = x(P(w(t2))); s2 < o2.length; s2++) {
        var i2 = o2[s2], h2 = i2.key, u2 = i2.data;
        switch (h2) {
          case "M":
            a2 = [u2[0], u2[1]], r2 = [u2[0], u2[1]];
            break;
          case "L":
            n2.push.apply(n2, V(a2[0], a2[1], u2[0], u2[1], e2)), a2 = [u2[0], u2[1]];
            break;
          case "C":
            var p2 = u2[0], l2 = u2[1], c2 = u2[2], f2 = u2[3], d2 = u2[4], g2 = u2[5];
            n2.push.apply(n2, B(p2, l2, c2, f2, d2, g2, a2, e2)), a2 = [d2, g2];
            break;
          case "Z":
            n2.push.apply(n2, V(a2[0], a2[1], r2[0], r2[1], e2)), a2 = [r2[0], r2[1]];
        }
      }
      return { type: "path", ops: n2 };
    }
    function E(t2, e2) {
      for (var n2 = [], r2 = 0, a2 = t2; r2 < a2.length; r2++) {
        var s2 = a2[r2];
        if (s2.length) {
          var o2 = e2.maxRandomnessOffset || 0, i2 = s2.length;
          if (i2 > 2) {
            n2.push({ op: "move", data: [s2[0][0] + F(o2, e2), s2[0][1] + F(o2, e2)] });
            for (var h2 = 1; h2 < i2; h2++) n2.push({ op: "lineTo", data: [s2[h2][0] + F(o2, e2), s2[h2][1] + F(o2, e2)] });
          }
        }
      }
      return { type: "fillPath", ops: n2 };
    }
    function G(t2, e2) {
      return (function(t3, e3) {
        var n2 = t3.fillStyle || "hachure";
        if (!g[n2]) switch (n2) {
          case "zigzag":
            g[n2] || (g[n2] = new p(e3));
            break;
          case "cross-hatch":
            g[n2] || (g[n2] = new l(e3));
            break;
          case "dots":
            g[n2] || (g[n2] = new c(e3));
            break;
          case "dashed":
            g[n2] || (g[n2] = new f(e3));
            break;
          case "zigzag-line":
            g[n2] || (g[n2] = new d(e3));
            break;
          default:
            g[n2 = "hachure"] || (g[n2] = new h(e3));
        }
        return g[n2];
      })(e2, L).fillPolygons(t2, e2);
    }
    function R(t2) {
      var e2 = n({}, t2);
      return e2.randomizer = void 0, t2.seed && (e2.seed = t2.seed + 1), e2;
    }
    function j(t2) {
      return t2.randomizer || (t2.randomizer = new y(t2.seed || 0)), t2.randomizer.next();
    }
    function q(t2, e2, n2, r2) {
      return void 0 === r2 && (r2 = 1), n2.roughness * r2 * (j(n2) * (e2 - t2) + t2);
    }
    function F(t2, e2, n2) {
      return void 0 === n2 && (n2 = 1), q(-t2, t2, e2, n2);
    }
    function V(t2, e2, n2, r2, a2, s2) {
      void 0 === s2 && (s2 = false);
      var o2 = s2 ? a2.disableMultiStrokeFill : a2.disableMultiStroke, i2 = Z(t2, e2, n2, r2, a2, true, false);
      if (o2) return i2;
      var h2 = Z(t2, e2, n2, r2, a2, true, true);
      return i2.concat(h2);
    }
    function Z(t2, e2, n2, r2, a2, s2, o2) {
      var i2 = Math.pow(t2 - n2, 2) + Math.pow(e2 - r2, 2), h2 = Math.sqrt(i2), u2 = 1;
      u2 = h2 < 200 ? 1 : h2 > 500 ? 0.4 : -16668e-7 * h2 + 1.233334;
      var p2 = a2.maxRandomnessOffset || 0;
      p2 * p2 * 100 > i2 && (p2 = h2 / 10);
      var l2 = p2 / 2, c2 = 0.2 + 0.2 * j(a2), f2 = a2.bowing * a2.maxRandomnessOffset * (r2 - e2) / 200, d2 = a2.bowing * a2.maxRandomnessOffset * (t2 - n2) / 200;
      f2 = F(f2, a2, u2), d2 = F(d2, a2, u2);
      var g2 = [], y2 = function() {
        return F(l2, a2, u2);
      }, v2 = function() {
        return F(p2, a2, u2);
      }, M2 = a2.preserveVertices;
      return s2 && (o2 ? g2.push({ op: "move", data: [t2 + (M2 ? 0 : y2()), e2 + (M2 ? 0 : y2())] }) : g2.push({ op: "move", data: [t2 + (M2 ? 0 : F(p2, a2, u2)), e2 + (M2 ? 0 : F(p2, a2, u2))] })), o2 ? g2.push({ op: "bcurveTo", data: [f2 + t2 + (n2 - t2) * c2 + y2(), d2 + e2 + (r2 - e2) * c2 + y2(), f2 + t2 + 2 * (n2 - t2) * c2 + y2(), d2 + e2 + 2 * (r2 - e2) * c2 + y2(), n2 + (M2 ? 0 : y2()), r2 + (M2 ? 0 : y2())] }) : g2.push({ op: "bcurveTo", data: [f2 + t2 + (n2 - t2) * c2 + v2(), d2 + e2 + (r2 - e2) * c2 + v2(), f2 + t2 + 2 * (n2 - t2) * c2 + v2(), d2 + e2 + 2 * (r2 - e2) * c2 + v2(), n2 + (M2 ? 0 : v2()), r2 + (M2 ? 0 : v2())] }), g2;
    }
    function Q(t2, e2, n2) {
      if (!t2.length) return [];
      var r2 = [];
      r2.push([t2[0][0] + F(e2, n2), t2[0][1] + F(e2, n2)]), r2.push([t2[0][0] + F(e2, n2), t2[0][1] + F(e2, n2)]);
      for (var a2 = 1; a2 < t2.length; a2++) r2.push([t2[a2][0] + F(e2, n2), t2[a2][1] + F(e2, n2)]), a2 === t2.length - 1 && r2.push([t2[a2][0] + F(e2, n2), t2[a2][1] + F(e2, n2)]);
      return H(r2, null, n2);
    }
    function H(t2, e2, n2) {
      var r2 = t2.length, a2 = [];
      if (r2 > 3) {
        var s2 = [], o2 = 1 - n2.curveTightness;
        a2.push({ op: "move", data: [t2[1][0], t2[1][1]] });
        for (var i2 = 1; i2 + 2 < r2; i2++) {
          var h2 = t2[i2];
          s2[0] = [h2[0], h2[1]], s2[1] = [h2[0] + (o2 * t2[i2 + 1][0] - o2 * t2[i2 - 1][0]) / 6, h2[1] + (o2 * t2[i2 + 1][1] - o2 * t2[i2 - 1][1]) / 6], s2[2] = [t2[i2 + 1][0] + (o2 * t2[i2][0] - o2 * t2[i2 + 2][0]) / 6, t2[i2 + 1][1] + (o2 * t2[i2][1] - o2 * t2[i2 + 2][1]) / 6], s2[3] = [t2[i2 + 1][0], t2[i2 + 1][1]], a2.push({ op: "bcurveTo", data: [s2[1][0], s2[1][1], s2[2][0], s2[2][1], s2[3][0], s2[3][1]] });
        }
        if (e2 && 2 === e2.length) {
          var u2 = n2.maxRandomnessOffset;
          a2.push({ op: "lineTo", data: [e2[0] + F(u2, n2), e2[1] + F(u2, n2)] });
        }
      } else 3 === r2 ? (a2.push({ op: "move", data: [t2[1][0], t2[1][1]] }), a2.push({ op: "bcurveTo", data: [t2[1][0], t2[1][1], t2[2][0], t2[2][1], t2[2][0], t2[2][1]] })) : 2 === r2 && a2.push.apply(a2, Z(t2[0][0], t2[0][1], t2[1][0], t2[1][1], n2, true, true));
      return a2;
    }
    function $(t2, e2, n2, r2, a2, s2, o2, i2) {
      var h2 = [], u2 = [];
      if (0 === i2.roughness) {
        t2 /= 4, u2.push([e2 + r2 * Math.cos(-t2), n2 + a2 * Math.sin(-t2)]);
        for (var p2 = 0; p2 <= 2 * Math.PI; p2 += t2) {
          var l2 = [e2 + r2 * Math.cos(p2), n2 + a2 * Math.sin(p2)];
          h2.push(l2), u2.push(l2);
        }
        u2.push([e2 + r2 * Math.cos(0), n2 + a2 * Math.sin(0)]), u2.push([e2 + r2 * Math.cos(t2), n2 + a2 * Math.sin(t2)]);
      } else {
        var c2 = F(0.5, i2) - Math.PI / 2;
        u2.push([F(s2, i2) + e2 + 0.9 * r2 * Math.cos(c2 - t2), F(s2, i2) + n2 + 0.9 * a2 * Math.sin(c2 - t2)]);
        var f2 = 2 * Math.PI + c2 - 0.01;
        for (p2 = c2; p2 < f2; p2 += t2) {
          l2 = [F(s2, i2) + e2 + r2 * Math.cos(p2), F(s2, i2) + n2 + a2 * Math.sin(p2)];
          h2.push(l2), u2.push(l2);
        }
        u2.push([F(s2, i2) + e2 + r2 * Math.cos(c2 + 2 * Math.PI + 0.5 * o2), F(s2, i2) + n2 + a2 * Math.sin(c2 + 2 * Math.PI + 0.5 * o2)]), u2.push([F(s2, i2) + e2 + 0.98 * r2 * Math.cos(c2 + o2), F(s2, i2) + n2 + 0.98 * a2 * Math.sin(c2 + o2)]), u2.push([F(s2, i2) + e2 + 0.9 * r2 * Math.cos(c2 + 0.5 * o2), F(s2, i2) + n2 + 0.9 * a2 * Math.sin(c2 + 0.5 * o2)]);
      }
      return [u2, h2];
    }
    function N(t2, e2, n2, r2, a2, s2, o2, i2, h2) {
      var u2 = s2 + F(0.1, h2), p2 = [];
      p2.push([F(i2, h2) + e2 + 0.9 * r2 * Math.cos(u2 - t2), F(i2, h2) + n2 + 0.9 * a2 * Math.sin(u2 - t2)]);
      for (var l2 = u2; l2 <= o2; l2 += t2) p2.push([F(i2, h2) + e2 + r2 * Math.cos(l2), F(i2, h2) + n2 + a2 * Math.sin(l2)]);
      return p2.push([e2 + r2 * Math.cos(o2), n2 + a2 * Math.sin(o2)]), p2.push([e2 + r2 * Math.cos(o2), n2 + a2 * Math.sin(o2)]), H(p2, null, h2);
    }
    function B(t2, e2, n2, r2, a2, s2, o2, i2) {
      for (var h2 = [], u2 = [i2.maxRandomnessOffset || 1, (i2.maxRandomnessOffset || 1) + 0.3], p2 = [0, 0], l2 = i2.disableMultiStroke ? 1 : 2, c2 = i2.preserveVertices, f2 = 0; f2 < l2; f2++) 0 === f2 ? h2.push({ op: "move", data: [o2[0], o2[1]] }) : h2.push({ op: "move", data: [o2[0] + (c2 ? 0 : F(u2[0], i2)), o2[1] + (c2 ? 0 : F(u2[0], i2))] }), p2 = c2 ? [a2, s2] : [a2 + F(u2[f2], i2), s2 + F(u2[f2], i2)], h2.push({ op: "bcurveTo", data: [t2 + F(u2[f2], i2), e2 + F(u2[f2], i2), n2 + F(u2[f2], i2), r2 + F(u2[f2], i2), p2[0], p2[1]] });
      return h2;
    }
    function J(t2) {
      return [...t2];
    }
    function K(t2, e2 = 0) {
      const n2 = t2.length;
      if (n2 < 3) throw new Error("A curve must have at least three points.");
      const r2 = [];
      if (3 === n2) r2.push(J(t2[0]), J(t2[1]), J(t2[2]), J(t2[2]));
      else {
        const n3 = [];
        n3.push(t2[0], t2[0]);
        for (let e3 = 1; e3 < t2.length; e3++) n3.push(t2[e3]), e3 === t2.length - 1 && n3.push(t2[e3]);
        const a2 = [], s2 = 1 - e2;
        r2.push(J(n3[0]));
        for (let t3 = 1; t3 + 2 < n3.length; t3++) {
          const e3 = n3[t3];
          a2[0] = [e3[0], e3[1]], a2[1] = [e3[0] + (s2 * n3[t3 + 1][0] - s2 * n3[t3 - 1][0]) / 6, e3[1] + (s2 * n3[t3 + 1][1] - s2 * n3[t3 - 1][1]) / 6], a2[2] = [n3[t3 + 1][0] + (s2 * n3[t3][0] - s2 * n3[t3 + 2][0]) / 6, n3[t3 + 1][1] + (s2 * n3[t3][1] - s2 * n3[t3 + 2][1]) / 6], a2[3] = [n3[t3 + 1][0], n3[t3 + 1][1]], r2.push(a2[1], a2[2], a2[3]);
        }
      }
      return r2;
    }
    function U(t2, e2) {
      return Math.pow(t2[0] - e2[0], 2) + Math.pow(t2[1] - e2[1], 2);
    }
    function X(t2, e2, n2) {
      const r2 = U(e2, n2);
      if (0 === r2) return U(t2, e2);
      let a2 = ((t2[0] - e2[0]) * (n2[0] - e2[0]) + (t2[1] - e2[1]) * (n2[1] - e2[1])) / r2;
      return a2 = Math.max(0, Math.min(1, a2)), U(t2, Y(e2, n2, a2));
    }
    function Y(t2, e2, n2) {
      return [t2[0] + (e2[0] - t2[0]) * n2, t2[1] + (e2[1] - t2[1]) * n2];
    }
    function tt(t2, e2, n2, r2) {
      const a2 = r2 || [];
      if ((function(t3, e3) {
        const n3 = t3[e3 + 0], r3 = t3[e3 + 1], a3 = t3[e3 + 2], s3 = t3[e3 + 3];
        let o3 = 3 * r3[0] - 2 * n3[0] - s3[0];
        o3 *= o3;
        let i2 = 3 * r3[1] - 2 * n3[1] - s3[1];
        i2 *= i2;
        let h2 = 3 * a3[0] - 2 * s3[0] - n3[0];
        h2 *= h2;
        let u2 = 3 * a3[1] - 2 * s3[1] - n3[1];
        return u2 *= u2, o3 < h2 && (o3 = h2), i2 < u2 && (i2 = u2), o3 + i2;
      })(t2, e2) < n2) {
        const n3 = t2[e2 + 0];
        if (a2.length) {
          (s2 = a2[a2.length - 1], o2 = n3, Math.sqrt(U(s2, o2))) > 1 && a2.push(n3);
        } else a2.push(n3);
        a2.push(t2[e2 + 3]);
      } else {
        const r3 = 0.5, s3 = t2[e2 + 0], o3 = t2[e2 + 1], i2 = t2[e2 + 2], h2 = t2[e2 + 3], u2 = Y(s3, o3, r3), p2 = Y(o3, i2, r3), l2 = Y(i2, h2, r3), c2 = Y(u2, p2, r3), f2 = Y(p2, l2, r3), d2 = Y(c2, f2, r3);
        tt([s3, u2, c2, d2], 0, n2, a2), tt([d2, f2, l2, h2], 0, n2, a2);
      }
      var s2, o2;
      return a2;
    }
    function et(t2, e2) {
      return nt(t2, 0, t2.length, e2);
    }
    function nt(t2, e2, n2, r2, a2) {
      const s2 = a2 || [], o2 = t2[e2], i2 = t2[n2 - 1];
      let h2 = 0, u2 = 1;
      for (let r3 = e2 + 1; r3 < n2 - 1; ++r3) {
        const e3 = X(t2[r3], o2, i2);
        e3 > h2 && (h2 = e3, u2 = r3);
      }
      return Math.sqrt(h2) > r2 ? (nt(t2, e2, u2 + 1, r2, s2), nt(t2, u2, n2, r2, s2)) : (s2.length || s2.push(o2), s2.push(i2)), s2;
    }
    function rt(t2, e2 = 0.15, n2) {
      const r2 = [], a2 = (t2.length - 1) / 3;
      for (let n3 = 0; n3 < a2; n3++) {
        tt(t2, 3 * n3, e2, r2);
      }
      return n2 && n2 > 0 ? nt(r2, 0, r2.length, n2) : r2;
    }
    var at = "none";
    var st = (function() {
      function t2(t3) {
        this.defaultOptions = { maxRandomnessOffset: 2, roughness: 1, bowing: 1, stroke: "#000", strokeWidth: 1, curveTightness: 0, curveFitting: 0.95, curveStepCount: 9, fillStyle: "hachure", fillWeight: -1, hachureAngle: -41, hachureGap: -1, dashOffset: -1, dashGap: -1, zigzagOffset: -1, seed: 0, disableMultiStroke: false, disableMultiStrokeFill: false, preserveVertices: false, fillShapeRoughnessGain: 0.8 }, this.config = t3 || {}, this.config.options && (this.defaultOptions = this._o(this.config.options));
      }
      return t2.newSeed = function() {
        return Math.floor(Math.random() * Math.pow(2, 31));
      }, t2.prototype._o = function(t3) {
        return t3 ? Object.assign({}, this.defaultOptions, t3) : this.defaultOptions;
      }, t2.prototype._d = function(t3, e2, n2) {
        return { shape: t3, sets: e2 || [], options: n2 || this.defaultOptions };
      }, t2.prototype.line = function(t3, e2, n2, r2, a2) {
        var s2 = this._o(a2);
        return this._d("line", [T(t3, e2, n2, r2, s2)], s2);
      }, t2.prototype.rectangle = function(t3, e2, n2, r2, a2) {
        var s2 = this._o(a2), o2 = [], i2 = D(t3, e2, n2, r2, s2);
        if (s2.fill) {
          var h2 = [[t3, e2], [t3 + n2, e2], [t3 + n2, e2 + r2], [t3, e2 + r2]];
          "solid" === s2.fillStyle ? o2.push(E([h2], s2)) : o2.push(G([h2], s2));
        }
        return s2.stroke !== at && o2.push(i2), this._d("rectangle", o2, s2);
      }, t2.prototype.ellipse = function(t3, e2, n2, r2, a2) {
        var s2 = this._o(a2), o2 = [], i2 = I(n2, r2, s2), h2 = C(t3, e2, s2, i2);
        if (s2.fill) if ("solid" === s2.fillStyle) {
          var u2 = C(t3, e2, s2, i2).opset;
          u2.type = "fillPath", o2.push(u2);
        } else o2.push(G([h2.estimatedPoints], s2));
        return s2.stroke !== at && o2.push(h2.opset), this._d("ellipse", o2, s2);
      }, t2.prototype.circle = function(t3, e2, n2, r2) {
        var a2 = this.ellipse(t3, e2, n2, n2, r2);
        return a2.shape = "circle", a2;
      }, t2.prototype.linearPath = function(t3, e2) {
        var n2 = this._o(e2);
        return this._d("linearPath", [_(t3, false, n2)], n2);
      }, t2.prototype.arc = function(t3, e2, r2, a2, s2, o2, i2, h2) {
        void 0 === i2 && (i2 = false);
        var u2 = this._o(h2), p2 = [], l2 = z(t3, e2, r2, a2, s2, o2, i2, true, u2);
        if (i2 && u2.fill) if ("solid" === u2.fillStyle) {
          var c2 = n({}, u2);
          c2.disableMultiStroke = true;
          var f2 = z(t3, e2, r2, a2, s2, o2, true, false, c2);
          f2.type = "fillPath", p2.push(f2);
        } else p2.push((function(t4, e3, n2, r3, a3, s3, o3) {
          var i3 = t4, h3 = e3, u3 = Math.abs(n2 / 2), p3 = Math.abs(r3 / 2);
          u3 += F(0.01 * u3, o3), p3 += F(0.01 * p3, o3);
          for (var l3 = a3, c3 = s3; l3 < 0; ) l3 += 2 * Math.PI, c3 += 2 * Math.PI;
          c3 - l3 > 2 * Math.PI && (l3 = 0, c3 = 2 * Math.PI);
          for (var f3 = (c3 - l3) / o3.curveStepCount, d2 = [], g2 = l3; g2 <= c3; g2 += f3) d2.push([i3 + u3 * Math.cos(g2), h3 + p3 * Math.sin(g2)]);
          return d2.push([i3 + u3 * Math.cos(c3), h3 + p3 * Math.sin(c3)]), d2.push([i3, h3]), G([d2], o3);
        })(t3, e2, r2, a2, s2, o2, u2));
        return u2.stroke !== at && p2.push(l2), this._d("arc", p2, u2);
      }, t2.prototype.curve = function(t3, e2) {
        var r2 = this._o(e2), a2 = [], s2 = A(t3, r2);
        if (r2.fill && r2.fill !== at) if ("solid" === r2.fillStyle) {
          var o2 = A(t3, n(n({}, r2), { disableMultiStroke: true, roughness: r2.roughness ? r2.roughness + r2.fillShapeRoughnessGain : 0 }));
          a2.push({ type: "fillPath", ops: this._mergedShape(o2.ops) });
        } else {
          var i2 = [], h2 = t3;
          if (h2.length) for (var u2 = 0, p2 = "number" == typeof h2[0][0] ? [h2] : h2; u2 < p2.length; u2++) {
            var l2 = p2[u2];
            l2.length < 3 ? i2.push.apply(i2, l2) : 3 === l2.length ? i2.push.apply(i2, rt(K([l2[0], l2[0], l2[1], l2[2]]), 10, (1 + r2.roughness) / 2)) : i2.push.apply(i2, rt(K(l2), 10, (1 + r2.roughness) / 2));
          }
          i2.length && a2.push(G([i2], r2));
        }
        return r2.stroke !== at && a2.push(s2), this._d("curve", a2, r2);
      }, t2.prototype.polygon = function(t3, e2) {
        var n2 = this._o(e2), r2 = [], a2 = _(t3, true, n2);
        return n2.fill && ("solid" === n2.fillStyle ? r2.push(E([t3], n2)) : r2.push(G([t3], n2))), n2.stroke !== at && r2.push(a2), this._d("polygon", r2, n2);
      }, t2.prototype.path = function(t3, e2) {
        var r2 = this._o(e2), a2 = [];
        if (!t3) return this._d("path", a2, r2);
        t3 = (t3 || "").replace(/\n/g, " ").replace(/(-\s)/g, "-").replace("/(ss)/g", " ");
        var s2 = r2.fill && "transparent" !== r2.fill && r2.fill !== at, o2 = r2.stroke !== at, i2 = !!(r2.simplification && r2.simplification < 1), h2 = (function(t4, e3, n2) {
          const r3 = x(P(w(t4))), a3 = [];
          let s3 = [], o3 = [0, 0], i3 = [];
          const h3 = () => {
            i3.length >= 4 && s3.push(...rt(i3, e3)), i3 = [];
          }, u3 = () => {
            h3(), s3.length && (a3.push(s3), s3 = []);
          };
          for (const { key: t5, data: e4 } of r3) switch (t5) {
            case "M":
              u3(), o3 = [e4[0], e4[1]], s3.push(o3);
              break;
            case "L":
              h3(), s3.push([e4[0], e4[1]]);
              break;
            case "C":
              if (!i3.length) {
                const t6 = s3.length ? s3[s3.length - 1] : o3;
                i3.push([t6[0], t6[1]]);
              }
              i3.push([e4[0], e4[1]]), i3.push([e4[2], e4[3]]), i3.push([e4[4], e4[5]]);
              break;
            case "Z":
              h3(), s3.push([o3[0], o3[1]]);
          }
          if (u3(), !n2) return a3;
          const p3 = [];
          for (const t5 of a3) {
            const e4 = et(t5, n2);
            e4.length && p3.push(e4);
          }
          return p3;
        })(t3, 1, i2 ? 4 - 4 * (r2.simplification || 1) : (1 + r2.roughness) / 2), u2 = W(t3, r2);
        if (s2) if ("solid" === r2.fillStyle) if (1 === h2.length) {
          var p2 = W(t3, n(n({}, r2), { disableMultiStroke: true, roughness: r2.roughness ? r2.roughness + r2.fillShapeRoughnessGain : 0 }));
          a2.push({ type: "fillPath", ops: this._mergedShape(p2.ops) });
        } else a2.push(E(h2, r2));
        else a2.push(G(h2, r2));
        return o2 && (i2 ? h2.forEach((function(t4) {
          a2.push(_(t4, false, r2));
        })) : a2.push(u2)), this._d("path", a2, r2);
      }, t2.prototype.opsToPath = function(t3, e2) {
        for (var n2 = "", r2 = 0, a2 = t3.ops; r2 < a2.length; r2++) {
          var s2 = a2[r2], o2 = "number" == typeof e2 && e2 >= 0 ? s2.data.map((function(t4) {
            return +t4.toFixed(e2);
          })) : s2.data;
          switch (s2.op) {
            case "move":
              n2 += "M".concat(o2[0], " ").concat(o2[1], " ");
              break;
            case "bcurveTo":
              n2 += "C".concat(o2[0], " ").concat(o2[1], ", ").concat(o2[2], " ").concat(o2[3], ", ").concat(o2[4], " ").concat(o2[5], " ");
              break;
            case "lineTo":
              n2 += "L".concat(o2[0], " ").concat(o2[1], " ");
          }
        }
        return n2.trim();
      }, t2.prototype.toPaths = function(t3) {
        for (var e2 = t3.sets || [], n2 = t3.options || this.defaultOptions, r2 = [], a2 = 0, s2 = e2; a2 < s2.length; a2++) {
          var o2 = s2[a2], i2 = null;
          switch (o2.type) {
            case "path":
              i2 = { d: this.opsToPath(o2), stroke: n2.stroke, strokeWidth: n2.strokeWidth, fill: at };
              break;
            case "fillPath":
              i2 = { d: this.opsToPath(o2), stroke: at, strokeWidth: 0, fill: n2.fill || at };
              break;
            case "fillSketch":
              i2 = this.fillSketch(o2, n2);
          }
          i2 && r2.push(i2);
        }
        return r2;
      }, t2.prototype.fillSketch = function(t3, e2) {
        var n2 = e2.fillWeight;
        return n2 < 0 && (n2 = e2.strokeWidth / 2), { d: this.opsToPath(t3), stroke: e2.fill || at, strokeWidth: n2, fill: at };
      }, t2.prototype._mergedShape = function(t3) {
        return t3.filter((function(t4, e2) {
          return 0 === e2 || "move" !== t4.op;
        }));
      }, t2;
    })();
    var ot = (function() {
      function t2(t3, e2) {
        this.canvas = t3, this.ctx = this.canvas.getContext("2d"), this.gen = new st(e2);
      }
      return t2.prototype.draw = function(t3) {
        for (var e2 = t3.sets || [], n2 = t3.options || this.getDefaultOptions(), r2 = this.ctx, a2 = t3.options.fixedDecimalPlaceDigits, s2 = 0, o2 = e2; s2 < o2.length; s2++) {
          var i2 = o2[s2];
          switch (i2.type) {
            case "path":
              r2.save(), r2.strokeStyle = "none" === n2.stroke ? "transparent" : n2.stroke, r2.lineWidth = n2.strokeWidth, n2.strokeLineDash && r2.setLineDash(n2.strokeLineDash), n2.strokeLineDashOffset && (r2.lineDashOffset = n2.strokeLineDashOffset), this._drawToContext(r2, i2, a2), r2.restore();
              break;
            case "fillPath":
              r2.save(), r2.fillStyle = n2.fill || "";
              var h2 = "curve" === t3.shape || "polygon" === t3.shape || "path" === t3.shape ? "evenodd" : "nonzero";
              this._drawToContext(r2, i2, a2, h2), r2.restore();
              break;
            case "fillSketch":
              this.fillSketch(r2, i2, n2);
          }
        }
      }, t2.prototype.fillSketch = function(t3, e2, n2) {
        var r2 = n2.fillWeight;
        r2 < 0 && (r2 = n2.strokeWidth / 2), t3.save(), n2.fillLineDash && t3.setLineDash(n2.fillLineDash), n2.fillLineDashOffset && (t3.lineDashOffset = n2.fillLineDashOffset), t3.strokeStyle = n2.fill || "", t3.lineWidth = r2, this._drawToContext(t3, e2, n2.fixedDecimalPlaceDigits), t3.restore();
      }, t2.prototype._drawToContext = function(t3, e2, n2, r2) {
        void 0 === r2 && (r2 = "nonzero"), t3.beginPath();
        for (var a2 = 0, s2 = e2.ops; a2 < s2.length; a2++) {
          var o2 = s2[a2], i2 = "number" == typeof n2 && n2 >= 0 ? o2.data.map((function(t4) {
            return +t4.toFixed(n2);
          })) : o2.data;
          switch (o2.op) {
            case "move":
              t3.moveTo(i2[0], i2[1]);
              break;
            case "bcurveTo":
              t3.bezierCurveTo(i2[0], i2[1], i2[2], i2[3], i2[4], i2[5]);
              break;
            case "lineTo":
              t3.lineTo(i2[0], i2[1]);
          }
        }
        "fillPath" === e2.type ? t3.fill(r2) : t3.stroke();
      }, Object.defineProperty(t2.prototype, "generator", { get: function() {
        return this.gen;
      }, enumerable: false, configurable: true }), t2.prototype.getDefaultOptions = function() {
        return this.gen.defaultOptions;
      }, t2.prototype.line = function(t3, e2, n2, r2, a2) {
        var s2 = this.gen.line(t3, e2, n2, r2, a2);
        return this.draw(s2), s2;
      }, t2.prototype.rectangle = function(t3, e2, n2, r2, a2) {
        var s2 = this.gen.rectangle(t3, e2, n2, r2, a2);
        return this.draw(s2), s2;
      }, t2.prototype.ellipse = function(t3, e2, n2, r2, a2) {
        var s2 = this.gen.ellipse(t3, e2, n2, r2, a2);
        return this.draw(s2), s2;
      }, t2.prototype.circle = function(t3, e2, n2, r2) {
        var a2 = this.gen.circle(t3, e2, n2, r2);
        return this.draw(a2), a2;
      }, t2.prototype.linearPath = function(t3, e2) {
        var n2 = this.gen.linearPath(t3, e2);
        return this.draw(n2), n2;
      }, t2.prototype.polygon = function(t3, e2) {
        var n2 = this.gen.polygon(t3, e2);
        return this.draw(n2), n2;
      }, t2.prototype.arc = function(t3, e2, n2, r2, a2, s2, o2, i2) {
        void 0 === o2 && (o2 = false);
        var h2 = this.gen.arc(t3, e2, n2, r2, a2, s2, o2, i2);
        return this.draw(h2), h2;
      }, t2.prototype.curve = function(t3, e2) {
        var n2 = this.gen.curve(t3, e2);
        return this.draw(n2), n2;
      }, t2.prototype.path = function(t3, e2) {
        var n2 = this.gen.path(t3, e2);
        return this.draw(n2), n2;
      }, t2;
    })();
    var it = "http://www.w3.org/2000/svg";
    var ht = (function() {
      function t2(t3, e2) {
        this.svg = t3, this.gen = new st(e2);
      }
      return t2.prototype.draw = function(t3) {
        for (var e2 = t3.sets || [], n2 = t3.options || this.getDefaultOptions(), r2 = this.svg.ownerDocument || window.document, a2 = r2.createElementNS(it, "g"), s2 = t3.options.fixedDecimalPlaceDigits, o2 = 0, i2 = e2; o2 < i2.length; o2++) {
          var h2 = i2[o2], u2 = null;
          switch (h2.type) {
            case "path":
              (u2 = r2.createElementNS(it, "path")).setAttribute("d", this.opsToPath(h2, s2)), u2.setAttribute("stroke", n2.stroke), u2.setAttribute("stroke-width", n2.strokeWidth + ""), u2.setAttribute("fill", "none"), n2.strokeLineDash && u2.setAttribute("stroke-dasharray", n2.strokeLineDash.join(" ").trim()), n2.strokeLineDashOffset && u2.setAttribute("stroke-dashoffset", "".concat(n2.strokeLineDashOffset));
              break;
            case "fillPath":
              (u2 = r2.createElementNS(it, "path")).setAttribute("d", this.opsToPath(h2, s2)), u2.setAttribute("stroke", "none"), u2.setAttribute("stroke-width", "0"), u2.setAttribute("fill", n2.fill || ""), "curve" !== t3.shape && "polygon" !== t3.shape || u2.setAttribute("fill-rule", "evenodd");
              break;
            case "fillSketch":
              u2 = this.fillSketch(r2, h2, n2);
          }
          u2 && a2.appendChild(u2);
        }
        return a2;
      }, t2.prototype.fillSketch = function(t3, e2, n2) {
        var r2 = n2.fillWeight;
        r2 < 0 && (r2 = n2.strokeWidth / 2);
        var a2 = t3.createElementNS(it, "path");
        return a2.setAttribute("d", this.opsToPath(e2, n2.fixedDecimalPlaceDigits)), a2.setAttribute("stroke", n2.fill || ""), a2.setAttribute("stroke-width", r2 + ""), a2.setAttribute("fill", "none"), n2.fillLineDash && a2.setAttribute("stroke-dasharray", n2.fillLineDash.join(" ").trim()), n2.fillLineDashOffset && a2.setAttribute("stroke-dashoffset", "".concat(n2.fillLineDashOffset)), a2;
      }, Object.defineProperty(t2.prototype, "generator", { get: function() {
        return this.gen;
      }, enumerable: false, configurable: true }), t2.prototype.getDefaultOptions = function() {
        return this.gen.defaultOptions;
      }, t2.prototype.opsToPath = function(t3, e2) {
        return this.gen.opsToPath(t3, e2);
      }, t2.prototype.line = function(t3, e2, n2, r2, a2) {
        var s2 = this.gen.line(t3, e2, n2, r2, a2);
        return this.draw(s2);
      }, t2.prototype.rectangle = function(t3, e2, n2, r2, a2) {
        var s2 = this.gen.rectangle(t3, e2, n2, r2, a2);
        return this.draw(s2);
      }, t2.prototype.ellipse = function(t3, e2, n2, r2, a2) {
        var s2 = this.gen.ellipse(t3, e2, n2, r2, a2);
        return this.draw(s2);
      }, t2.prototype.circle = function(t3, e2, n2, r2) {
        var a2 = this.gen.circle(t3, e2, n2, r2);
        return this.draw(a2);
      }, t2.prototype.linearPath = function(t3, e2) {
        var n2 = this.gen.linearPath(t3, e2);
        return this.draw(n2);
      }, t2.prototype.polygon = function(t3, e2) {
        var n2 = this.gen.polygon(t3, e2);
        return this.draw(n2);
      }, t2.prototype.arc = function(t3, e2, n2, r2, a2, s2, o2, i2) {
        void 0 === o2 && (o2 = false);
        var h2 = this.gen.arc(t3, e2, n2, r2, a2, s2, o2, i2);
        return this.draw(h2);
      }, t2.prototype.curve = function(t3, e2) {
        var n2 = this.gen.curve(t3, e2);
        return this.draw(n2);
      }, t2.prototype.path = function(t3, e2) {
        var n2 = this.gen.path(t3, e2);
        return this.draw(n2);
      }, t2;
    })();
    var ut = { canvas: function(t2, e2) {
      return new ot(t2, e2);
    }, svg: function(t2, e2) {
      return new ht(t2, e2);
    }, generator: function(t2) {
      return new st(t2);
    }, newSeed: function() {
      return st.newSeed();
    } };
    module.exports = ut;
  }
});

// src/cli/sketch.ts
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// src/adapters/svg.ts
var import_roughjs = __toESM(require_rough_cjs());

// src/core/theme.ts
var FONT_SIZE = 16;
var DEFAULT_THEME = {
  colors: {
    fill: "#e9ecef",
    // neutral component fill
    primary: "#a5d8ff",
    // primary button
    selected: "#d0ebff",
    // selected grid row
    paper: "#ffffff",
    // inside of inputs and checkboxes
    disabled: "#adb5bd",
    // stroke and text of (disabled) components
    muted: "#868e96",
    // secondary text
    dark: "#343a40",
    // background of (dark) panels
    onDark: "#f8f9fa",
    // text and lines on (dark) panels
    stripe: "#f1f3f5",
    // every other row of a (striped) grid
    link: "#1971c2",
    // [links] in labels and link:
    error: "#e03131"
    // (required) and (invalid) marks
  },
  gap: { root: 24, stack: 14, row: 12, pad: 16 }
};
var INK = "ink";

// src/adapters/svg.ts
var FONTS = {
  1: "Virgil, Excalifont, cursive",
  2: "Helvetica, Arial, sans-serif",
  3: "Cascadia, 'Cascadia Code', monospace",
  5: "Excalifont, Virgil, cursive",
  6: "Nunito, sans-serif",
  7: "'Lilita One', sans-serif",
  8: "'Comic Shanns', monospace",
  9: "'Liberation Sans', Arial, sans-serif"
};
function fontFamilyCss(fontFamily) {
  return FONTS[fontFamily] ?? FONTS[5];
}
function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
var num = (n) => String(Math.round(n * 100) / 100);
function roundedRectPath(x, y, w, h) {
  const r = Math.min(Math.min(w, h) * 0.25, 32);
  return `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y}, ${x + w} ${y + r} L ${x + w} ${y + h - r} Q ${x + w} ${y + h}, ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h}, ${x} ${y + h - r} L ${x} ${y + r} Q ${x} ${y}, ${x + r} ${y}`;
}
function bounds(ops) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y) => {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  };
  for (const op of ops) {
    if (op.kind === "line") op.points.forEach((p) => add(p[0], p[1]));
    else {
      add(op.x, op.y);
      add(op.x + op.w, op.y + op.h);
    }
  }
  return ops.length ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : { x: 0, y: 0, w: 0, h: 0 };
}
function renderSvg(ops, style, options = {}) {
  const pad = options.padding ?? 8;
  const gen = import_roughjs.default.generator();
  let seed = options.seed ?? 1;
  const out = [];
  const emit = (drawable, dashed = false) => {
    for (const p of gen.toPaths(drawable)) {
      const d = p.d.replace(/-?\d+\.\d{3,}(e-?\d+)?/g, (n) => num(Number(n)));
      out.push(
        `<path d="${d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${p.fill ?? "none"}"${dashed ? ' stroke-dasharray="8 6"' : ""} stroke-linecap="round" stroke-linejoin="round"/>`
      );
    }
  };
  for (const op of ops) {
    const base = {
      seed: seed++,
      roughness: style.roughness,
      strokeWidth: op.kind === "text" ? 1 : op.strokeWidth
    };
    switch (op.kind) {
      case "rect":
      case "ellipse": {
        const o = {
          ...base,
          stroke: op.stroke ? op.color ?? style.stroke : "none",
          fill: op.fill === INK ? op.color ?? style.stroke : op.fill ?? void 0,
          fillStyle: "solid"
        };
        if (op.kind === "ellipse") {
          emit(gen.ellipse(op.x + op.w / 2, op.y + op.h / 2, op.w, op.h, o));
        } else if (op.rounded) {
          emit(gen.path(roundedRectPath(op.x, op.y, op.w, op.h), o), op.dashed);
        } else {
          emit(gen.rectangle(op.x, op.y, op.w, op.h, o), op.dashed);
        }
        break;
      }
      case "line":
        emit(
          gen.linearPath(
            op.points.map((p) => [p[0], p[1]]),
            { ...base, stroke: op.color ?? style.stroke }
          )
        );
        break;
      case "text": {
        const lines2 = op.text.split("\n");
        const lineH = op.h / lines2.length;
        const paint = (op.color ? ` fill="${escapeXml(op.color)}"` : "") + (op.fontSize ? ` font-size="${op.fontSize}"` : "");
        lines2.forEach((line, i) => {
          out.push(
            `<text x="${num(op.x)}" y="${num(op.y + (i + 0.5) * lineH)}"${paint} dominant-baseline="central" xml:space="preserve">${escapeXml(line)}</text>`
          );
        });
        break;
      }
    }
  }
  const b = bounds(ops);
  const w = b.w + 2 * pad;
  const h = b.h + 2 * pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${num(w)}" height="${num(h)}" viewBox="${num(b.x - pad)} ${num(b.y - pad)} ${num(w)} ${num(h)}" font-family="${escapeXml(fontFamilyCss(style.fontFamily))}" font-size="${style.fontSize}" fill="${escapeXml(style.stroke)}">` + out.join("") + `</svg>`;
}

// src/core/icons.ts
function star() {
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 ? 0.2 : 0.45;
    pts.push([0.5 + r * Math.cos(a), 0.55 + r * Math.sin(a)]);
  }
  return pts;
}
function user(p, dx, scale) {
  const at = (x, y) => [dx + x * scale, 1 - (1 - y) * scale];
  p.circle(dx + 0.5 * scale, 1 - 0.72 * scale, 0.18 * scale);
  p.line(
    at(0.15, 0.92),
    at(0.2, 0.68),
    at(0.35, 0.58),
    at(0.65, 0.58),
    at(0.8, 0.68),
    at(0.85, 0.92)
  );
}
var DRAW = {
  search: (p) => {
    p.circle(0.42, 0.42, 0.28);
    p.line([0.63, 0.63], [0.9, 0.9]);
  },
  filter: (p) => p.line(
    [0.1, 0.15],
    [0.9, 0.15],
    [0.58, 0.5],
    [0.58, 0.88],
    [0.42, 0.76],
    [0.42, 0.5],
    [0.1, 0.15]
  ),
  more: (p) => {
    p.circle(0.2, 0.5, 0.07, true);
    p.circle(0.5, 0.5, 0.07, true);
    p.circle(0.8, 0.5, 0.07, true);
  },
  close: (p) => {
    p.line([0.2, 0.2], [0.8, 0.8]);
    p.line([0.8, 0.2], [0.2, 0.8]);
  },
  back: (p) => {
    p.line([0.88, 0.5], [0.12, 0.5]);
    p.line([0.42, 0.2], [0.12, 0.5], [0.42, 0.8]);
  },
  menu: (p) => {
    p.line([0.12, 0.22], [0.88, 0.22]);
    p.line([0.12, 0.5], [0.88, 0.5]);
    p.line([0.12, 0.78], [0.88, 0.78]);
  },
  home: (p) => {
    p.line([0.08, 0.5], [0.5, 0.12], [0.92, 0.5]);
    p.line([0.22, 0.4], [0.22, 0.88], [0.78, 0.88], [0.78, 0.4]);
  },
  user: (p) => user(p, 0, 1),
  users: (p) => {
    user(p, 0.3, 0.7);
    user(p, 0, 0.8);
  },
  settings: (p) => {
    p.circle(0.5, 0.5, 0.15);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const c = Math.cos(a), s = Math.sin(a);
      p.line([0.5 + 0.28 * c, 0.5 + 0.28 * s], [0.5 + 0.44 * c, 0.5 + 0.44 * s]);
    }
    p.circle(0.5, 0.5, 0.3);
  },
  plus: (p) => {
    p.line([0.5, 0.12], [0.5, 0.88]);
    p.line([0.12, 0.5], [0.88, 0.5]);
  },
  edit: (p) => {
    p.line([0.15, 0.85], [0.2, 0.65], [0.7, 0.15], [0.85, 0.3], [0.35, 0.8], [0.15, 0.85]);
    p.line([0.6, 0.25], [0.75, 0.4]);
  },
  trash: (p) => {
    p.line([0.12, 0.25], [0.88, 0.25]);
    p.line([0.38, 0.25], [0.38, 0.12], [0.62, 0.12], [0.62, 0.25]);
    p.line([0.22, 0.25], [0.28, 0.9], [0.72, 0.9], [0.78, 0.25]);
  },
  bell: (p) => {
    p.line(
      [0.18, 0.75],
      [0.28, 0.62],
      [0.28, 0.4],
      [0.4, 0.2],
      [0.6, 0.2],
      [0.72, 0.4],
      [0.72, 0.62],
      [0.82, 0.75],
      [0.18, 0.75]
    );
    p.line([0.42, 0.88], [0.58, 0.88]);
  },
  calendar: (p) => {
    p.line([0.12, 0.2], [0.88, 0.2], [0.88, 0.9], [0.12, 0.9], [0.12, 0.2]);
    p.line([0.12, 0.42], [0.88, 0.42]);
    p.line([0.32, 0.08], [0.32, 0.28]);
    p.line([0.68, 0.08], [0.68, 0.28]);
  },
  file: (p) => {
    p.line([0.2, 0.08], [0.6, 0.08], [0.82, 0.3], [0.82, 0.92], [0.2, 0.92], [0.2, 0.08]);
    p.line([0.6, 0.08], [0.6, 0.3], [0.82, 0.3]);
  },
  folder: (p) => p.line(
    [0.08, 0.22],
    [0.4, 0.22],
    [0.5, 0.34],
    [0.92, 0.34],
    [0.92, 0.86],
    [0.08, 0.86],
    [0.08, 0.22]
  ),
  star: (p) => p.line(...star()),
  info: (p) => {
    p.circle(0.5, 0.5, 0.42);
    p.line([0.5, 0.46], [0.5, 0.74]);
    p.circle(0.5, 0.3, 0.04, true);
  },
  check: (p) => p.line([0.12, 0.52], [0.4, 0.78], [0.88, 0.22]),
  "chevron-down": (p) => p.line([0.2, 0.35], [0.5, 0.65], [0.8, 0.35]),
  "chevron-right": (p) => p.line([0.35, 0.2], [0.65, 0.5], [0.35, 0.8]),
  "chevron-left": (p) => p.line([0.65, 0.2], [0.35, 0.5], [0.65, 0.8]),
  "chevron-up": (p) => p.line([0.2, 0.65], [0.5, 0.35], [0.8, 0.65]),
  mail: (p) => {
    p.line([0.08, 0.22], [0.92, 0.22], [0.92, 0.8], [0.08, 0.8], [0.08, 0.22]);
    p.line([0.08, 0.22], [0.5, 0.55], [0.92, 0.22]);
  },
  phone: (p) => {
    p.line([0.28, 0.06], [0.72, 0.06], [0.72, 0.94], [0.28, 0.94], [0.28, 0.06]);
    p.line([0.44, 0.82], [0.56, 0.82]);
  },
  lock: (p) => {
    p.line([0.18, 0.45], [0.82, 0.45], [0.82, 0.9], [0.18, 0.9], [0.18, 0.45]);
    p.line([0.32, 0.45], [0.32, 0.28], [0.42, 0.14], [0.58, 0.14], [0.68, 0.28], [0.68, 0.45]);
  },
  dot: (p) => p.circle(0.5, 0.5, 0.25, true)
};
var ICON_NAMES = Object.keys(DRAW);
function isIcon(name) {
  return Object.prototype.hasOwnProperty.call(DRAW, name.toLowerCase());
}
function drawIcon(ctx, name, x, y, s) {
  const at = (px, py) => [x + px * s, y + py * s];
  DRAW[name.toLowerCase()]({
    line: (...pts) => ctx.line(pts.map(([px, py]) => at(px, py))),
    circle: (cx, cy, r, filled) => ctx.ellipse(x + (cx - r) * s, y + (cy - r) * s, 2 * r * s, 2 * r * s, {
      ...filled ? { fill: INK } : {}
    })
  });
}

// src/core/parse.ts
var KEYWORDS = /* @__PURE__ */ new Map([
  ["button", "button"],
  ["btn", "button"],
  ["dropdown", "dropdown"],
  ["select", "dropdown"],
  ["combo", "dropdown"],
  ["combobox", "dropdown"],
  ["checkbox", "checkbox"],
  ["check", "checkbox"],
  ["checkboxes", "checkbox"],
  ["text", "text"],
  ["label", "text"],
  ["grid", "grid"],
  ["table", "grid"],
  ["datagrid", "grid"],
  ["tabs", "tabs"],
  ["tab", "tabs"],
  ["box", "box"],
  ["panel", "box"],
  ["group", "box"],
  ["row", "row"],
  ["icon", "icon"],
  ["input", "input"],
  ["field", "input"],
  ["textbox", "input"],
  ["search", "search"],
  ["password", "password"],
  ["textarea", "textarea"],
  ["heading", "h1"],
  ["h1", "h1"],
  ["h2", "h2"],
  ["subheading", "h2"],
  ["columns", "columns"],
  ["cols", "columns"],
  ["nav", "nav"],
  ["navigation", "nav"],
  ["avatar", "avatar"],
  ["details", "details"],
  ["properties", "details"],
  ["window", "window"],
  ["dialog", "dialog"],
  ["modal", "dialog"],
  ["browser", "browser"],
  ["phone", "phone"],
  ["buttons", "buttons"],
  ["link", "link"],
  ["paragraph", "paragraph"],
  ["p", "paragraph"],
  ["lorem", "paragraph"],
  ["radio", "radio"],
  ["radios", "radio"],
  ["option", "radio"],
  ["toggle", "toggle"],
  ["switch", "toggle"],
  ["slider", "slider"],
  ["range", "slider"],
  ["alert", "alert"],
  ["message", "alert"],
  ["notice", "alert"],
  ["progress", "progress"],
  ["tooltip", "tooltip"],
  ["hint", "tooltip"],
  ["image", "image"],
  ["img", "image"],
  ["picture", "image"],
  ["placeholder", "placeholder"],
  ["form", "form"],
  ["section", "section"],
  ["breadcrumb", "breadcrumb"],
  ["breadcrumbs", "breadcrumb"],
  ["crumbs", "breadcrumb"],
  ["pagination", "pagination"],
  ["pager", "pagination"],
  ["pages", "pagination"],
  ["menu", "menu"],
  ["contextmenu", "menu"],
  ["tree", "tree"],
  ["spin", "spin"],
  ["number", "spin"],
  ["stepper", "spin"]
]);
var FRAMES = ["window", "dialog", "browser", "phone"];
var CONTAINERS = /* @__PURE__ */ new Set([
  "root",
  "box",
  "form",
  "section",
  "tabs",
  "row",
  "columns",
  ...FRAMES
]);
var BARE_OK = /* @__PURE__ */ new Set([
  "grid",
  "tabs",
  "box",
  "form",
  "section",
  "row",
  "columns",
  ...FRAMES
]);
var CONTAINER_NAMES = [...CONTAINERS].filter((t) => t !== "root");
var NO_BODY = new Set([...CONTAINERS].filter((t) => t !== "tabs"));
function notUnderstood(line, keyword, type) {
  const message = `don't understand "${line}"`;
  if (!keyword || !type || BARE_OK.has(type)) return message;
  const rest = line.slice(keyword.length).trim();
  return `${message}: "${keyword}" needs a colon, as in "${keyword}:${rest ? " " + rest : ""}"`;
}
var DEFAULT_OPTS = { buttons: { fill: 1 } };
var FLAGS = /* @__PURE__ */ new Set([
  "fill",
  "disabled",
  "dark",
  "round",
  "segmented",
  "underline",
  "plain",
  "striped",
  "floating",
  "required",
  "invalid",
  "collapsible",
  "collapsed",
  "top",
  "empty",
  "stacked"
]);
function parseOptions(s) {
  const opts = {};
  const m = s.match(/\(([^()]*)\)\s*$/);
  if (!m || m.index === void 0) return { rest: s.trim(), opts };
  const entries = m[1].split(",").map((t) => t.trim());
  if (!m[1].includes("=") && !entries.every((e) => FLAGS.has(e.toLowerCase()))) {
    return { rest: s.trim(), opts };
  }
  entries.forEach((entry) => {
    if (FLAGS.has(entry.toLowerCase())) {
      opts[entry.toLowerCase()] = 1;
      return;
    }
    const [k, v] = entry.split("=").map((t) => t.trim());
    if (k && v && !isNaN(Number(v))) opts[k.toLowerCase()] = Number(v);
  });
  return { rest: s.slice(0, m.index).trim(), opts };
}
var FIELD_OPTS = ["fill", "disabled", "floating", "required"];
function splitField(content) {
  for (let i = content.indexOf("|"); i >= 0; i = content.indexOf("|", i + 1)) {
    const line = content.slice(i + 1).trim();
    const m = line.match(/^([a-zA-Z][a-zA-Z0-9]*)\s*:/);
    if (m && KEYWORDS.has(m[1].toLowerCase())) return { label: content.slice(0, i).trim(), line };
  }
  return null;
}
function parse(source) {
  const root2 = { type: "root", text: "", body: [], children: [], opts: {} };
  const errors = [];
  const stack = [{ node: root2, indent: -1 }];
  let last = null;
  source.replace(/\r/g, "").split("\n").forEach((raw, i) => {
    if (!raw.trim()) {
      last = null;
      return;
    }
    const indent = (raw.match(/^[ \t]*/) ?? [""])[0].replace(/\t/g, "    ").length;
    const s = raw.trim();
    const m = s.match(/^([a-zA-Z][a-zA-Z0-9]*)\s*(?::\s*(.*)|(\([^()]*\)))?$/);
    const type = m ? KEYWORDS.get(m[1].toLowerCase()) : void 0;
    const hasColon = /^[a-zA-Z][a-zA-Z0-9]*\s*:/.test(s);
    const bareOpts = m?.[3] ? parseOptions(m[3]) : null;
    const bareOk = !bareOpts || bareOpts.rest === "";
    if (m && type && (hasColon || BARE_OK.has(type) && bareOk)) {
      while (stack[stack.length - 1].indent >= indent) stack.pop();
      const parent = stack[stack.length - 1].node;
      if (!CONTAINERS.has(parent.type)) {
        errors.push({
          line: i + 1,
          message: `"${parent.type}" can't contain other components (only ${CONTAINER_NAMES.slice(0, -1).join(", ")} and ${CONTAINER_NAMES[CONTAINER_NAMES.length - 1]} can)`
        });
        last = null;
        return;
      }
      const component = (type2, content) => {
        const { rest, opts } = parseOptions(content);
        if (type2 === "icon" && !isIcon(rest)) {
          errors.push({
            line: i + 1,
            message: `unknown icon "${rest}"; known icons: ${ICON_NAMES.join(", ")}`
          });
        }
        const node2 = { type: type2, text: rest, body: [], children: [], line: i + 1 };
        return { ...node2, opts: { ...DEFAULT_OPTS[type2], ...opts } };
      };
      const labelled = m[1].toLowerCase() === "field" && hasColon ? splitField(m[2]) : null;
      let node;
      if (labelled) {
        const im = labelled.line.match(/^([a-zA-Z][a-zA-Z0-9]*)\s*:\s*(.*)$/);
        let innerType = KEYWORDS.get(im[1].toLowerCase());
        let content = im[2];
        if (CONTAINERS.has(innerType)) {
          errors.push({
            line: i + 1,
            message: `a field holds one component like input or dropdown, not "${im[1]}"`
          });
          innerType = "input";
          content = "";
        }
        const inner = component(innerType, content);
        const opts = {};
        for (const k of FIELD_OPTS) if (inner.opts[k]) opts[k] = inner.opts[k];
        node = {
          type: "field",
          text: labelled.label,
          body: [],
          children: [inner],
          opts,
          line: i + 1
        };
      } else if (bareOpts) {
        node = { ...component(type, ""), opts: { ...DEFAULT_OPTS[type], ...bareOpts.opts } };
      } else {
        node = component(type, m[2] || "");
      }
      parent.children.push(node);
      stack.push({ node, indent });
      last = node.type === "field" ? node.children[0] : node;
    } else if (last && !NO_BODY.has(last.type)) {
      last.body.push(last.type === "tree" ? raw.replace(/\t/g, "    ").trimEnd() : s);
    } else {
      errors.push({ line: i + 1, message: notUnderstood(s, m?.[1], type) });
    }
  });
  return { tree: root2, errors };
}

// src/core/detect.ts
var FENCE_KEYWORD = "sketchdown";
function dedent(lines2) {
  let start = 0, end = lines2.length;
  while (start < end && !lines2[start].trim()) start++;
  while (end > start && !lines2[end - 1].trim()) end--;
  const body = lines2.slice(start, end);
  const indents = body.filter((l) => l.trim()).map((l) => (l.match(/^[ \t]*/) ?? [""])[0]);
  let common = indents[0] ?? "";
  for (const indent of indents) {
    while (!indent.startsWith(common)) common = common.slice(0, -1);
  }
  return body.map((l) => l.slice(Math.min(common.length, l.length))).join("\n");
}
var OPEN = new RegExp(`^[ \\t]*(\`{3,}|~{3,})[ \\t]*${FENCE_KEYWORD}[ \\t]*$`, "i");
function nextBlock(lines2, from) {
  const open = lines2.findIndex((l, i) => i >= from && OPEN.test(l));
  if (open < 0) return null;
  const fence = OPEN.exec(lines2[open])[1];
  const closeRe = new RegExp(`^[ \\t]*${fence[0] === "`" ? "`" : "~"}{${fence.length},}[ \\t]*$`);
  let close = lines2.findIndex((l, i) => i > open && closeRe.test(l));
  if (close < 0) close = lines2.length;
  const spec = dedent(lines2.slice(open + 1, close));
  return { open, close, spec: spec.trim() ? spec : null };
}
var splitLines = (text2) => text2.replace(/\r\n?/g, "\n").split("\n");
function extractSpec(text2, options) {
  const lines2 = splitLines(text2);
  const block = nextBlock(lines2, 0)?.spec ?? null;
  if (block !== null || !options.plain) return block;
  const spec = dedent(lines2);
  if (!spec.trim()) return null;
  const { tree: tree2, errors } = parse(spec);
  return errors.length || !tree2.children.length ? null : spec;
}

// src/core/components/label.ts
var TOKEN = /\{([a-zA-Z-]+)\}|\[([^[\]]+)\]|(?<=^|\s)-([^\s-](?:[^-]*[^\s-])?)-(?=$|[\s.,;:!?)])/g;
var NOT_LINKS = /* @__PURE__ */ new Set(["x", "on", "off"]);
function tokens(str) {
  const out = [];
  for (const m of str.matchAll(TOKEN)) {
    const at = { index: m.index, length: m[0].length };
    if (m[1] !== void 0) {
      if (isIcon(m[1])) out.push({ ...at, part: { kind: "icon", name: m[1] } });
    } else if (m[2] !== void 0) {
      const text2 = m[2].trim();
      if (text2 && !NOT_LINKS.has(text2.toLowerCase())) {
        out.push({ ...at, part: { kind: "text", text: text2, tone: "link" } });
      }
    } else {
      out.push({ ...at, part: { kind: "text", text: m[3], tone: "disabled" } });
    }
  }
  return out;
}
function isRich(str) {
  return tokens(str).length > 0;
}
function iconSizeFor(ctx, fontSize) {
  return Math.round(ctx.measure(" ", fontSize).h * 0.8);
}
function measureLabel(ctx, str, fontSize) {
  const found = tokens(str);
  if (!found.length) {
    const m = ctx.measure(str, fontSize);
    return {
      parts: [{ kind: "text", text: str, m, space: false }],
      w: m.w,
      h: m.h,
      iconSize: 0,
      iconOnly: false
    };
  }
  const s = iconSizeFor(ctx, fontSize);
  const parts = [];
  let space = false;
  const pushText = (raw) => {
    if (/^\s/.test(raw)) space = true;
    const text2 = raw.trim();
    if (text2) {
      parts.push({ kind: "text", text: text2, m: ctx.measure(text2, fontSize), space });
      space = /\s$/.test(raw);
    }
  };
  let last = 0;
  for (const t of found) {
    pushText(str.slice(last, t.index));
    if (t.part.kind === "icon") parts.push({ ...t.part, space });
    else parts.push({ ...t.part, m: ctx.measure(t.part.text, fontSize), space });
    space = false;
    last = t.index + t.length;
  }
  pushText(str.slice(last));
  const lineH = ctx.measure(" ", fontSize).h;
  const w = parts.reduce(
    (sum, p, i) => sum + gapBefore(parts, i, s, ctx, fontSize) + (p.kind === "icon" ? s : p.m.w),
    0
  );
  const h = Math.max(lineH, ...parts.map((p) => p.kind === "icon" ? s : p.m.h));
  return { parts, w, h, iconSize: s, iconOnly: parts.every((p) => p.kind === "icon") };
}
function gapBefore(parts, i, iconSize, ctx, fontSize) {
  if (i === 0) return 0;
  if (parts[i].kind === "icon" || parts[i - 1].kind === "icon") return Math.round(iconSize * 0.4);
  return parts[i].space ? ctx.measure(" ", fontSize).w : 0;
}
function drawLabel(ctx, x, y, label, o = {}) {
  const { colors } = ctx.theme;
  const disabled = ctx.ink === colors.disabled;
  let cx = x;
  label.parts.forEach((part, i) => {
    cx += gapBefore(label.parts, i, label.iconSize, ctx, o.fontSize);
    if (part.kind === "text") {
      const ty = y + (label.h - part.m.h) / 2;
      const color = part.tone === "link" && !disabled ? colors.link : part.tone === "disabled" ? colors.disabled : o.color;
      ctx.text(cx, ty, part.text, part.m, { ...o, ...color ? { color } : {} });
      if (part.tone === "link") {
        ctx.line(
          [
            [cx, ty + part.m.h - 2],
            [cx + part.m.w, ty + part.m.h - 2]
          ],
          1,
          color
        );
      }
      cx += part.m.w;
    } else {
      const ink = ctx.ink;
      if (o.color) ctx.ink = o.color;
      drawIcon(ctx, part.name, cx, y + (label.h - label.iconSize) / 2, label.iconSize);
      ctx.ink = ink;
      cx += label.iconSize;
    }
  });
}

// src/core/components/shared.ts
function contentLines(node) {
  return [node.text, ...node.body].filter(Boolean);
}
function splitItems(s, allowComma = true) {
  return (s.includes("|") || !allowComma ? s.split("|") : s.split(",")).map((t) => t.trim()).filter((t) => t.length);
}
function parseCheck(t) {
  const cb = t.match(/^\[( |x|X)?\]\s*(.*)$/);
  if (cb) return { checked: !!cb[1] && cb[1] !== " ", label: cb[2] };
  return null;
}
function starred(items2) {
  const sel = items2.findIndex((t) => t.startsWith("*") || t.endsWith("*"));
  const labels = items2.map((t) => t.replace(/^\*\s*/, "").replace(/\s*\*$/, ""));
  return { sel: sel < 0 ? 0 : sel, labels };
}
var BOX = 14;
function checkMark(ctx, x, y, checked) {
  ctx.rect(x, y, BOX, BOX, { fill: ctx.theme.colors.paper });
  if (checked) {
    ctx.line(
      [
        [x + 3, y + 7],
        [x + 6, y + 11],
        [x + 12, y + 2]
      ],
      2
    );
  }
}
function stackSize(ctx, children, gap, width) {
  const saved = ctx.dry;
  ctx.dry = true;
  const r = ctx.stack(children, 0, 0, gap, width);
  ctx.dry = saved;
  return r;
}
function needsWidthFirst(node, slot) {
  return !!slot?.w || node.children.some((c) => c.opts.fill);
}
function trailingIcon(text2, alone = false) {
  const m = text2.match(/(^|\s)\{([a-zA-Z-]+)\}\s*$/);
  if (!m || m.index === void 0 || !isIcon(m[2])) return { text: text2, icon: null };
  const rest = text2.slice(0, m.index).trim();
  if (!rest && !alone) return { text: text2, icon: null };
  return { text: rest, icon: m[2] };
}
function trailingButton(ctx, right, y, h, icon2) {
  ctx.line(
    [
      [right - h, y],
      [right - h, y + h]
    ],
    1
  );
  const s = iconSizeFor(ctx);
  drawIcon(ctx, icon2, right - h + (h - s) / 2, y + (h - s) / 2, s);
}

// src/core/components/avatar.ts
var avatar = (ctx, node, x, y) => {
  const initials = contentLines(node).join(" ").trim();
  const s = node.opts.w || 2 * ctx.measure(" ").h;
  ctx.ellipse(x, y, s, s, { fill: ctx.theme.colors.fill });
  if (initials) {
    const m = ctx.measure(initials);
    ctx.text(x + (s - m.w) / 2, y + (s - m.h) / 2, initials, m);
  } else {
    const i = s * 0.6;
    drawIcon(ctx, "user", x + (s - i) / 2, y + (s - i) / 2, i);
  }
  return { w: s, h: s };
};

// src/core/components/frame.ts
function framed(ctx, node, x, y, slot, chrome) {
  const { pad, stack } = ctx.theme.gap;
  const shadow = chrome.shadow ?? 0;
  const contentTop = chrome.top ? y + chrome.top + pad * 0.75 : y + pad;
  const minW = Math.max(node.opts.w || 0, (slot?.w || 0) - shadow, chrome.minW);
  const height = (contentH) => Math.max(
    node.opts.h || 0,
    (slot?.h || 0) - shadow,
    chrome.minH ?? 0,
    node.children.length ? contentTop - y + contentH + (chrome.bottom ?? 0) : chrome.emptyH
  );
  const frame = (W2, H2) => {
    if (shadow) {
      ctx.rect(x + shadow, y + shadow, W2, H2, {
        fill: ctx.theme.colors.disabled,
        noStroke: true,
        rounded: chrome.rounded
      });
    }
    ctx.rect(x, y, W2, H2, {
      width: 2,
      ...chrome.fill ? { fill: chrome.fill } : {},
      ...chrome.color ? { color: chrome.color } : {},
      ...chrome.rounded ? { rounded: true } : {}
    });
  };
  let W, H;
  if (chrome.fill) {
    const natural = stackSize(ctx, node.children, stack);
    W = Math.max(minW, natural.w + 2 * pad);
    const content = stackSize(ctx, node.children, stack, W - 2 * pad);
    H = height(content.h + pad);
    frame(W, H);
    ctx.stack(node.children, x + pad, contentTop, stack, W - 2 * pad);
  } else {
    let content;
    if (needsWidthFirst(node, slot)) {
      W = Math.max(minW, stackSize(ctx, node.children, stack).w + 2 * pad);
      content = ctx.stack(node.children, x + pad, contentTop, stack, W - 2 * pad);
    } else {
      content = ctx.stack(node.children, x + pad, contentTop, stack);
      W = Math.max(minW, content.w + 2 * pad);
    }
    H = height(content.h + pad);
    frame(W, H);
  }
  chrome.decorate?.(W, H);
  return { w: W + shadow, h: H + shadow };
}
function titleBar(ctx, x, y, W, title) {
  if (title) ctx.text(x + 12, y + 10, title, ctx.measure(title));
  const h = ctx.measure(title).h + 20;
  ctx.line(
    [
      [x, y + h],
      [x + W, y + h]
    ],
    1
  );
}

// src/core/components/box.ts
var box = (ctx, node, x, y, slot) => {
  if (node.opts.plain) return plain(ctx, node, x, y, slot);
  const title = node.text;
  const tm = title ? ctx.measure(title) : { w: 0, h: 0 };
  const { colors } = ctx.theme;
  const dark = !!node.opts.dark;
  const folds = !!(node.opts.collapsible || node.opts.collapsed);
  const icon2 = folds ? iconSizeFor(ctx) : 0;
  const barH = ctx.measure(title).h + 20;
  const minW = Math.max(tm.w + 2 * 12 + (folds ? icon2 + 12 : 0), 120);
  const chevron = (W, name) => drawIcon(ctx, name, x + W - 12 - icon2, y + (barH - icon2) / 2, icon2);
  if (node.opts.collapsed) {
    const W = Math.max(node.opts.w || 0, slot?.w || 0, minW);
    ctx.rect(x, y, W, barH, {
      width: 2,
      ...dark ? { fill: colors.dark, color: colors.dark } : {}
    });
    if (title) ctx.text(x + 12, y + 10, title, tm);
    chevron(W, "chevron-down");
    return { w: W, h: barH };
  }
  return framed(ctx, node, x, y, slot, {
    top: title || folds ? barH : 0,
    minW,
    emptyH: title || folds ? barH + 80 : 100,
    ...dark ? { fill: colors.dark, color: colors.dark } : {},
    decorate: (W) => {
      if (title || folds) titleBar(ctx, x, y, W, title);
      if (folds) chevron(W, "chevron-up");
    }
  });
};
function plain(ctx, node, x, y, slot) {
  const { stack } = ctx.theme.gap;
  const label = node.text ? measureLabel(ctx, node.text) : null;
  const natural = stackSize(ctx, node.children, stack);
  const W = Math.max(node.opts.w || 0, slot?.w || 0, natural.w, label?.w ?? 0);
  let h = 0;
  if (label) {
    drawLabel(ctx, x, y, label);
    h = label.h;
  }
  if (node.children.length) {
    if (label) h += stack;
    h += ctx.stack(node.children, x, y + h, stack, W).h;
  }
  return { w: W, h: Math.max(node.opts.h || 0, slot?.h || 0, h) };
}

// src/core/components/button.ts
var button = (ctx, node, x, y, slot) => {
  let text2 = (node.text || node.body[0] || "Button").trim();
  let primary = false;
  if (text2.startsWith("*")) {
    primary = true;
    text2 = text2.slice(1).trim();
  }
  const label = measureLabel(ctx, text2);
  const h = Math.max(node.opts.h || 0, label.h + 20);
  const w = label.iconOnly ? Math.max(node.opts.w || 0, slot?.w || 0, h) : Math.max(node.opts.w || 0, slot?.w || 0, 80, label.w + 40);
  const { colors } = ctx.theme;
  const fill = primary ? colors.primary : colors.fill;
  if (label.iconOnly && node.opts.round) ctx.ellipse(x, y, w, h, { fill, width: 2 });
  else ctx.rect(x, y, w, h, { fill, rounded: true, width: 2 });
  drawLabel(ctx, x + (w - label.w) / 2, y + (h - label.h) / 2, label);
  return { w, h };
};

// src/core/components/checkbox.ts
var checkbox = (ctx, node, x, y) => {
  const items2 = splitItems(contentLines(node).join("|"), false).map(
    (t) => parseCheck(t) || { checked: false, label: t }
  );
  if (!items2.length) items2.push({ checked: false, label: "Checkbox" });
  const gap = 8, rowGap = 8;
  let w = 0, cy = y;
  items2.forEach((it, i) => {
    const m = ctx.measure(it.label);
    const rh = Math.max(m.h, BOX);
    checkMark(ctx, x, cy + (rh - BOX) / 2, it.checked);
    ctx.text(x + BOX + gap, cy + (rh - m.h) / 2, it.label, m);
    w = Math.max(w, BOX + (it.label ? gap + m.w : 0));
    cy += rh + (i < items2.length - 1 ? rowGap : 0);
  });
  return { w, h: cy - y };
};

// src/core/components/columns.ts
var columns = (ctx, node, x, y, slot) => {
  const gap = node.opts.gap ?? 0;
  const kids = node.children;
  let sizes = kids.map((c) => ctx.size(c));
  const widths = kids.map(() => void 0);
  const target = Math.max(node.opts.w || 0, slot?.w || 0);
  const fills = kids.filter((c) => c.opts.fill).length;
  if (target && fills) {
    const used = sizes.reduce((sum, s, i) => sum + (kids[i].opts.fill ? 0 : s.w), 0);
    const share = (target - used - gap * (kids.length - 1)) / fills;
    kids.forEach((c, i) => widths[i] = c.opts.fill ? share : void 0);
    sizes = kids.map((c, i) => widths[i] ? ctx.size(c, { w: widths[i] }) : sizes[i]);
  }
  const H = Math.max(node.opts.h || 0, slot?.h || 0, ...sizes.map((s) => s.h));
  const slots = kids.map((_, i) => widths[i] ? { w: widths[i], h: H } : { h: H });
  let cx = x;
  kids.forEach((c, i) => {
    const r = ctx.draw(c, cx, y, slots[i]);
    cx += r.w + (i < kids.length - 1 ? gap : 0);
  });
  return { w: cx - x, h: H };
};

// src/core/components/controls.ts
var GAP = 8;
var ROW_GAP = 8;
function items(node, mark, fallback) {
  const out = splitItems(contentLines(node).join("|"), false).map((t) => {
    const m = t.match(mark);
    if (m) return { on: !!m[1] && !/^(off| )$/i.test(m[1]), label: m[2] };
    if (t.startsWith("*")) return { on: true, label: t.slice(1).trim() };
    return { on: false, label: t };
  });
  return out.length ? out : [{ on: false, label: fallback }];
}
function stackItems(ctx, x, y, list, mark, drawMark) {
  let w = 0, cy = y;
  list.forEach((it, i) => {
    const label = it.label ? measureLabel(ctx, it.label) : null;
    const rh = Math.max(label?.h ?? 0, mark.h);
    drawMark(x, cy + (rh - mark.h) / 2, it.on);
    if (label) drawLabel(ctx, x + mark.w + GAP, cy + (rh - label.h) / 2, label);
    w = Math.max(w, mark.w + (label ? GAP + label.w : 0));
    cy += rh + (i < list.length - 1 ? ROW_GAP : 0);
  });
  return { w, h: cy - y };
}
var radio = (ctx, node, x, y) => {
  const list = items(node, /^\(([oOxX* ])?\)\s*(.*)$/, "Option");
  return stackItems(ctx, x, y, list, { w: BOX, h: BOX }, (mx, my, on) => {
    ctx.ellipse(mx, my, BOX, BOX, { fill: ctx.theme.colors.paper });
    if (on) ctx.ellipse(mx + 4, my + 4, BOX - 8, BOX - 8, { fill: INK });
  });
};
var TRACK_W = 32;
var TRACK_H = 18;
var KNOB = 12;
var toggle = (ctx, node, x, y) => {
  const list = items(node, /^\[(on|off)\]\s*(.*)$/i, "Toggle");
  const { colors } = ctx.theme;
  return stackItems(ctx, x, y, list, { w: TRACK_W, h: TRACK_H }, (mx, my, on) => {
    ctx.rect(mx, my, TRACK_W, TRACK_H, { fill: on ? colors.primary : colors.fill, rounded: true });
    const inset = (TRACK_H - KNOB) / 2;
    const kx = on ? mx + TRACK_W - inset - KNOB : mx + inset;
    ctx.ellipse(kx, my + inset, KNOB, KNOB, { fill: colors.paper });
  });
};
var SLIDER_W = 200;
var SLIDER_KNOB = 16;
var SLIDER_TRACK = 6;
var slider = (ctx, node, x, y, slot) => {
  const m = contentLines(node).join(" ").match(/(-?\d+(?:\.\d+)?)\s*%?/);
  const value = Math.min(100, Math.max(0, m ? Number(m[1]) : 50)) / 100;
  const W = Math.max(node.opts.w || 0, slot?.w || 0) || SLIDER_W;
  const { colors } = ctx.theme;
  const r = SLIDER_KNOB / 2;
  const trackW = W - SLIDER_KNOB;
  const ty = y + (SLIDER_KNOB - SLIDER_TRACK) / 2;
  ctx.rect(x + r, ty, trackW, SLIDER_TRACK, { fill: colors.fill, rounded: true });
  if (value > 0) {
    ctx.rect(x + r, ty, trackW * value, SLIDER_TRACK, { fill: colors.primary, rounded: true });
  }
  ctx.ellipse(x + trackW * value, y, SLIDER_KNOB, SLIDER_KNOB, { fill: colors.paper, width: 2 });
  return { w: W, h: SLIDER_KNOB };
};

// src/core/components/details.ts
var ROW_PAD = 6;
var COL_GAP = 16;
function pairs(node) {
  return contentLines(node).map((line) => {
    const at = line.indexOf("|");
    if (at < 0) return [line.trim(), ""];
    return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
  });
}
var details = (ctx, node, x, y, slot) => {
  if (node.opts.stacked) return stacked(ctx, node, x, y, slot);
  const rows = pairs(node).map(([key, value]) => ({
    key: measureLabel(ctx, key),
    value: measureLabel(ctx, value)
  }));
  const keyW = Math.max(0, ...rows.map((r) => r.key.w));
  const valueW = Math.max(0, ...rows.map((r) => r.value.w));
  const valueX = x + keyW + COL_GAP;
  let cy = y;
  for (const r of rows) {
    const h = Math.max(r.key.h, r.value.h) + 2 * ROW_PAD;
    drawLabel(ctx, x, cy + (h - r.key.h) / 2, r.key);
    if (r.value.w) {
      const ink = ctx.ink;
      if (ink === null) ctx.ink = ctx.theme.colors.muted;
      drawLabel(ctx, valueX, cy + (h - r.value.h) / 2, r.value);
      ctx.ink = ink;
    }
    cy += h;
  }
  const w = valueW ? keyW + COL_GAP + valueW : keyW;
  return { w: Math.max(w, slot?.w || 0), h: cy - y };
};
var stacked = (ctx, node, x, y, slot) => {
  const fontSize = Math.round(ctx.fontSize * 0.75);
  const grey = ctx.ink === null ? { color: ctx.theme.colors.muted } : {};
  let cy = y, w = 0;
  for (const [key, value] of pairs(node)) {
    const k = measureLabel(ctx, key, fontSize);
    const v = measureLabel(ctx, value);
    cy += ROW_PAD;
    drawLabel(ctx, x, cy, k, { fontSize, ...grey });
    cy += k.h;
    if (v.w) {
      drawLabel(ctx, x, cy, v);
      cy += v.h;
    }
    cy += ROW_PAD;
    w = Math.max(w, k.w, v.w);
  }
  return { w: Math.max(w, node.opts.w || 0, slot?.w || 0), h: cy - y };
};

// src/core/components/dropdown.ts
var dropdown = (ctx, node, x, y, slot) => {
  const own = trailingIcon(contentLines(node).join("|"));
  const raw = splitItems(own.text);
  const { sel, labels } = starred(raw.length ? raw : ["Select\u2026"]);
  const arrowW = 28, padX = 10;
  const textW = Math.max(...labels.map((l) => ctx.measure(l).w));
  const m = ctx.measure(labels[sel]);
  const h = m.h + 16;
  const btn = own.icon ? h : 0;
  const w = Math.max(node.opts.w || 0, slot?.w || 0, 120 + btn, textW + 2 * padX + arrowW + btn);
  ctx.rect(x, y, w, h, { fill: ctx.theme.colors.paper });
  ctx.line(
    [
      [x + w - arrowW, y],
      [x + w - arrowW, y + h]
    ],
    1
  );
  const ax = x + w - arrowW / 2, ay = y + h / 2;
  ctx.line(
    [
      [ax - 5, ay - 2],
      [ax, ay + 3],
      [ax + 5, ay - 2]
    ],
    2
  );
  if (own.icon) trailingButton(ctx, x + w - arrowW, y, h, own.icon);
  if (!node.opts.empty) ctx.text(x + padX, y + (h - m.h) / 2, labels[sel], m);
  return { w, h };
};

// src/core/components/feedback.ts
var alert = (ctx, node, x, y, slot) => {
  const PAD_X4 = 12, PAD_Y3 = 10;
  const labels = (contentLines(node).length ? contentLines(node) : ["Alert"]).map(
    (l) => measureLabel(ctx, l)
  );
  const contentW = Math.max(...labels.map((l) => l.w));
  const contentH = labels.reduce((h, l) => h + l.h, 0);
  const W = Math.max(node.opts.w || 0, slot?.w || 0, contentW + 2 * PAD_X4);
  const H = Math.max(node.opts.h || 0, contentH + 2 * PAD_Y3);
  ctx.rect(x, y, W, H, { fill: ctx.theme.colors.selected, rounded: true });
  let cy = y + (H - contentH) / 2;
  for (const label of labels) {
    drawLabel(ctx, x + PAD_X4, cy, label);
    cy += label.h;
  }
  return { w: W, h: H };
};
var PERCENT = /(-?\d+(?:\.\d+)?)\s*%/;
var progress = (ctx, node, x, y, slot) => {
  const BAR_H = 14, WIDTH2 = 200, LABEL_GAP2 = 6;
  const str = contentLines(node).join(" ");
  const m = str.match(PERCENT);
  const value = m ? Math.min(100, Math.max(0, Number(m[1]))) / 100 : 0;
  const title = str.replace(PERCENT, "").trim();
  const W = Math.max(node.opts.w || 0, slot?.w || 0) || WIDTH2;
  const { colors } = ctx.theme;
  let by = y;
  if (title) {
    const label = measureLabel(ctx, title);
    drawLabel(ctx, x, y, label);
    by += label.h + LABEL_GAP2;
  }
  ctx.rect(x, by, W, BAR_H, { fill: colors.fill, rounded: true });
  if (value > 0) ctx.rect(x, by, W * value, BAR_H, { fill: colors.primary, rounded: true });
  return { w: W, h: by - y + BAR_H };
};
var tooltip = (ctx, node, x, y) => {
  const PAD_X4 = 10, PAD_Y3 = 6, POINTER = 8;
  const label = measureLabel(ctx, contentLines(node).join(" ") || "Tooltip");
  const W = label.w + 2 * PAD_X4;
  const H = label.h + 2 * PAD_Y3;
  const { colors } = ctx.theme;
  ctx.rect(x, y, W, H, { fill: colors.dark, color: colors.dark, rounded: true });
  const ink = ctx.ink;
  if (ink !== colors.disabled) ctx.ink = colors.onDark;
  drawLabel(ctx, x + PAD_X4, y + PAD_Y3, label);
  ctx.ink = ink;
  const px = x + Math.min(16, W / 2 - POINTER);
  ctx.line(
    [
      [px, y + H],
      [px + POINTER, y + H + POINTER],
      [px + 2 * POINTER, y + H]
    ],
    2,
    colors.dark
  );
  return { w: W, h: H + POINTER };
};
var image = (ctx, node, x, y, slot) => {
  const str = contentLines(node).join(" ");
  const m = str.match(/(\d+)\s*[x×]\s*(\d+)/);
  const W = Math.max(node.opts.w || 0, slot?.w || 0) || (m ? Number(m[1]) : 200);
  const H = Math.max(node.opts.h || 0, slot?.h || 0) || (m ? Number(m[2]) : 120);
  const caption = (m ? str.replace(m[0], "") : str).trim();
  const { colors } = ctx.theme;
  ctx.rect(x, y, W, H);
  ctx.line([
    [x, y],
    [x + W, y + H]
  ]);
  ctx.line([
    [x + W, y],
    [x, y + H]
  ]);
  if (caption) {
    const label = measureLabel(ctx, caption);
    const lx = x + (W - label.w) / 2, ly = y + (H - label.h) / 2;
    ctx.rect(lx - 6, ly - 2, label.w + 12, label.h + 4, { fill: colors.paper, noStroke: true });
    drawLabel(ctx, lx, ly, label, ctx.ink === colors.disabled ? {} : { color: colors.muted });
  }
  return { w: W, h: H };
};
var placeholder = (ctx, node, x, y, slot) => {
  const PAD_X4 = 12, PAD_Y3 = 8, MIN_W = 120, MIN_H = 40;
  const str = contentLines(node).join(" ");
  const m = str.match(/(\d+)\s*[x×]\s*(\d+)/);
  const name = (m ? str.replace(m[0], "") : str).trim();
  const label = name ? measureLabel(ctx, name) : null;
  const fitW = label ? label.w + 2 * PAD_X4 : 0, fitH = label ? label.h + 2 * PAD_Y3 : 0;
  const W = Math.max(fitW, Math.max(node.opts.w || 0, slot?.w || 0) || (m ? Number(m[1]) : MIN_W));
  const H = Math.max(fitH, Math.max(node.opts.h || 0, slot?.h || 0) || (m ? Number(m[2]) : MIN_H));
  const { colors } = ctx.theme;
  ctx.rect(x, y, W, H, { rounded: true, dashed: true });
  if (label) {
    const grey = ctx.ink === colors.disabled ? {} : { color: colors.muted };
    drawLabel(ctx, x + (W - label.w) / 2, y + (H - label.h) / 2, label, grey);
  }
  return { w: W, h: H };
};

// src/core/components/form.ts
var LABEL_GAP = 12;
var LABEL_TOP = 8;
var STAR_GAP = 4;
function measureFieldLabel(ctx, node, fontSize) {
  const label = measureLabel(ctx, node.text, fontSize);
  const star2 = node.opts.required ? ctx.measure("*", fontSize) : null;
  return { label, star: star2, w: label.w + (star2 ? STAR_GAP + star2.w : 0) };
}
function drawFieldLabel(ctx, x, y, m, o = {}) {
  drawLabel(ctx, x, y, m.label, o);
  if (m.star) {
    const fontSize = o.fontSize ? { fontSize: o.fontSize } : {};
    ctx.text(x + m.label.w + STAR_GAP, y, "*", m.star, {
      color: ctx.theme.colors.error,
      ...fontSize
    });
  }
}
function alignLabels(ctx, node) {
  const columns2 = [];
  const add = (child, i) => {
    if (child.type === "field" && !child.opts.floating) (columns2[i] ??= []).push(child);
  };
  for (const child of node.children) {
    if (child.type === "row") child.children.forEach(add);
    else add(child, 0);
  }
  for (const fields of columns2) {
    if (!fields) continue;
    const w = node.opts.label || Math.max(...fields.map((f) => measureFieldLabel(ctx, f).w));
    for (const f of fields) ctx.labelWidths.set(f, w);
  }
}
var form = (ctx, node, x, y, slot) => {
  alignLabels(ctx, node);
  return box(ctx, node, x, y, slot);
};
var field = (ctx, node, x, y, slot) => {
  const inner = node.children[0];
  if (node.opts.floating) return floating(ctx, node, inner, x, y, slot);
  const label = measureFieldLabel(ctx, node);
  const labelW = ctx.labelWidths.get(node) ?? label.w;
  const offset = labelW + LABEL_GAP;
  const innerSlot = slot?.w ? { w: slot.w - offset } : void 0;
  const size = ctx.size(inner, innerSlot);
  const H = Math.max(size.h, label.label.h);
  drawFieldLabel(ctx, x, y + Math.min((H - label.label.h) / 2, LABEL_TOP), label);
  ctx.draw(inner, x + offset, y + (H - size.h) / 2, innerSlot);
  return { w: offset + size.w, h: H };
};
function floating(ctx, node, inner, x, y, slot) {
  const { colors } = ctx.theme;
  const fontSize = Math.round(ctx.fontSize * 0.75);
  const label = measureFieldLabel(ctx, node, fontSize);
  const top = label.label.h / 2;
  const size = ctx.draw(inner, x, y + top, slot);
  ctx.rect(x + 8, y, label.w + 8, label.label.h, { fill: colors.paper, noStroke: true });
  const grey = ctx.ink === colors.disabled ? {} : { color: colors.muted };
  drawFieldLabel(ctx, x + 12, y, label, { fontSize, ...grey });
  return { w: size.w, h: size.h + top };
}

// src/core/components/section.ts
var section = (ctx, node, x, y, slot) => {
  const GAP2 = 8, MIN_GAP = 24;
  const { stack } = ctx.theme.gap;
  const { colors } = ctx.theme;
  const label = measureLabel(ctx, node.text || " ");
  const icon2 = iconSizeFor(ctx);
  const count = node.opts.count !== void 0 ? String(node.opts.count) : "";
  const cm = count ? ctx.measure(count) : null;
  const headerH = Math.max(label.h, icon2);
  const open = !node.opts.collapsed && node.children.length > 0;
  const natural = open ? stackSize(ctx, node.children, stack) : { w: 0, h: 0 };
  const W = Math.max(
    node.opts.w || 0,
    slot?.w || 0,
    natural.w,
    label.w + MIN_GAP + (cm ? cm.w + GAP2 : 0) + icon2
  );
  drawLabel(ctx, x, y + (headerH - label.h) / 2, label);
  if (cm) {
    const grey = ctx.ink === colors.disabled ? {} : { color: colors.muted };
    ctx.text(x + W - icon2 - GAP2 - cm.w, y + (headerH - cm.h) / 2, count, cm, grey);
  }
  const chevron = node.opts.collapsed ? "chevron-down" : "chevron-up";
  drawIcon(ctx, chevron, x + W - icon2, y + (headerH - icon2) / 2, icon2);
  if (!open) return { w: W, h: Math.max(node.opts.h || 0, headerH) };
  const content = ctx.stack(node.children, x, y + headerH + stack, stack, W);
  return { w: W, h: Math.max(node.opts.h || 0, slot?.h || 0, headerH + stack + content.h) };
};

// src/core/components/frames.ts
var CONTROL_GAP = 8;
var windowFrame = (ctx, node, x, y, slot) => {
  const title = node.text;
  const bar = ctx.measure(title).h + 20;
  const s = iconSizeFor(ctx);
  const controls = 3 * s + 2 * CONTROL_GAP;
  return framed(ctx, node, x, y, slot, {
    top: bar,
    minW: Math.max(320, (title ? ctx.measure(title).w : 0) + 12 + 24 + controls + 12),
    emptyH: bar + 200,
    fill: ctx.theme.colors.paper,
    decorate: (W) => {
      titleBar(ctx, x, y, W, title);
      const cy = y + (bar - s) / 2;
      const close = x + W - 12 - s;
      const max = close - CONTROL_GAP - s;
      const min = max - CONTROL_GAP - s;
      ctx.line([
        [min + 0.2 * s, cy + 0.8 * s],
        [min + 0.8 * s, cy + 0.8 * s]
      ]);
      ctx.rect(max, cy, s, s);
      drawIcon(ctx, "close", close, cy, s);
    }
  });
};
var SHADOW = 8;
var dialog = (ctx, node, x, y, slot) => {
  const title = node.text;
  const bar = ctx.measure(title).h + 20;
  const s = iconSizeFor(ctx);
  return framed(ctx, node, x, y, slot, {
    top: bar,
    minW: Math.max(280, (title ? ctx.measure(title).w : 0) + 12 + 24 + s + 12),
    emptyH: bar + 120,
    fill: ctx.theme.colors.paper,
    shadow: SHADOW,
    decorate: (W) => {
      titleBar(ctx, x, y, W, title);
      drawIcon(ctx, "close", x + W - 12 - s, y + (bar - s) / 2, s);
    }
  });
};
var browser = (ctx, node, x, y, slot) => {
  const [title = "", url = ""] = node.text.split("|").map((t) => t.trim());
  const lineH = ctx.measure(" ").h;
  const s = iconSizeFor(ctx);
  const tabBar = title ? lineH + 12 : 0;
  const addressBar = lineH + 20;
  const tm = ctx.measure(title);
  const tabW = tm.w + 32;
  const { colors } = ctx.theme;
  return framed(ctx, node, x, y, slot, {
    top: tabBar + addressBar,
    minW: Math.max(480, title ? 8 + tabW + 8 : 0),
    emptyH: tabBar + addressBar + 240,
    fill: colors.paper,
    decorate: (W) => {
      if (title) {
        ctx.line([
          [x, y + tabBar],
          [x + 8, y + tabBar],
          [x + 8, y + 6],
          [x + 8 + tabW, y + 6],
          [x + 8 + tabW, y + tabBar],
          [x + W, y + tabBar]
        ]);
        ctx.text(x + 8 + 16, y + 6 + (tabBar - 6 - tm.h) / 2, title, tm);
      }
      const top = y + tabBar;
      const iy = top + (addressBar - s) / 2;
      drawIcon(ctx, "back", x + 12, iy, s);
      drawIcon(ctx, "chevron-right", x + 12 + s + CONTROL_GAP, iy, s);
      const fx = x + 12 + 2 * s + 2 * CONTROL_GAP;
      const fh = lineH + 8;
      ctx.rect(fx, top + 6, x + W - 12 - fx, fh, { fill: colors.paper, rounded: true });
      if (url) {
        const um = ctx.measure(url);
        ctx.text(fx + 8, top + 6 + (fh - um.h) / 2, url, um, { color: colors.muted });
      }
      ctx.line([
        [x, top + addressBar],
        [x + W, top + addressBar]
      ]);
    }
  });
};
var PHONE_W = 375;
var PHONE_H = 667;
var HOME_BAR = 24;
var phone = (ctx, node, x, y, slot) => {
  const title = node.text;
  const lineH = ctx.measure(" ").h;
  const status = lineH + 8;
  const appBar = title ? lineH + 20 : 0;
  const { colors } = ctx.theme;
  return framed(ctx, node, x, y, slot, {
    top: status + appBar,
    bottom: HOME_BAR,
    minW: Math.max(node.opts.w ? 0 : PHONE_W, ctx.measure(title).w + 48),
    minH: node.opts.h ? 0 : PHONE_H,
    emptyH: 0,
    fill: colors.paper,
    rounded: true,
    decorate: (W, H) => {
      const time = ctx.measure("9:41");
      ctx.text(x + 24, y + (status - time.h) / 2, "9:41", time);
      ctx.rect(x + W - 24 - 22, y + (status - 10) / 2, 22, 10);
      if (title) {
        const tm = ctx.measure(title);
        ctx.text(x + (W - tm.w) / 2, y + status + 10, title, tm);
        ctx.line([
          [x, y + status + appBar],
          [x + W, y + status + appBar]
        ]);
      }
      ctx.line(
        [
          [x + W / 2 - 60, y + H - HOME_BAR / 2],
          [x + W / 2 + 60, y + H - HOME_BAR / 2]
        ],
        2
      );
    }
  });
};
var buttons = (ctx, node, x, y, slot) => {
  const gap = ctx.theme.gap.row;
  const kids = splitItems(contentLines(node).join("|")).map((text2) => ({
    type: "button",
    text: text2,
    body: [],
    children: [],
    opts: {}
  }));
  const sizes = kids.map((k) => ctx.size(k));
  const natural = sizes.reduce((sum, s) => sum + s.w, 0) + gap * Math.max(0, kids.length - 1);
  const W = Math.max(node.opts.w || 0, slot?.w || 0, natural);
  const H = Math.max(0, ...sizes.map((s) => s.h));
  let cx = x + W - natural;
  kids.forEach((k, i) => {
    ctx.draw(k, cx, y + (H - sizes[i].h) / 2);
    cx += sizes[i].w + gap;
  });
  return { w: W, h: H };
};

// src/core/components/grid.ts
var NUMERIC = /^[-+]?[$€£]?\s?\d[\d\s.,:]*\s?(%|kr|sek|€|\$|£)?$/i;
var grid = (ctx, node, x, y, slot) => {
  let rows = contentLines(node);
  if (!rows.length) rows = ["Column A, Column B", "Value, Value"];
  rows = rows.filter((r) => !/^\|?\s*:?-{2,}/.test(r));
  const usePipe = rows.some((r) => r.includes("|"));
  const parsed = rows.map((r) => {
    let s = r.trim();
    let selected = false;
    if (s.startsWith("*") && !s.startsWith("*|") && !s.startsWith("*,")) {
      selected = true;
      s = s.slice(1).trim();
    }
    if (usePipe) s = s.replace(/^\|/, "").replace(/\|$/, "");
    const cells = (usePipe ? s.split("|") : s.split(",")).map((t) => t.trim()).map((t) => {
      const cb = parseCheck(t);
      if (cb) return { check: true, ...cb, m: ctx.measure(cb.label) };
      const lab = measureLabel(ctx, t);
      return { label: t, numeric: NUMERIC.test(t), m: { w: lab.w, h: lab.h }, lab };
    });
    return { selected, cells };
  });
  const ncols = Math.max(...parsed.map((r) => r.cells.length));
  parsed.forEach((r) => {
    while (r.cells.length < ncols) r.cells.push({ label: "", m: ctx.measure("") });
  });
  const padX = 10, padY = 7, gap = 6;
  let textH = 0;
  const colW = new Array(ncols).fill(0);
  parsed.forEach(
    (r) => r.cells.forEach((cell, i) => {
      textH = Math.max(textH, cell.m.h);
      const w = cell.check ? BOX + (cell.label ? gap + cell.m.w : 0) : cell.m.w;
      colW[i] = Math.max(colW[i], w + 2 * padX);
    })
  );
  const rowH = Math.max(textH, BOX) + 2 * padY;
  const natural = colW.reduce((a, b) => a + b, 0);
  const extra = Math.max(0, node.opts.w || 0, slot?.w || 0) - natural;
  if (extra > 0) colW.forEach((_, i) => colW[i] += extra / ncols);
  const W = colW.reduce((a, b) => a + b, 0);
  const H = rowH * parsed.length;
  if (ctx.dry) return { w: W, h: H };
  const colX = [x];
  colW.forEach((w, i) => colX.push(colX[i] + w));
  const { colors } = ctx.theme;
  const plain2 = !!node.opts.plain;
  if (!plain2) ctx.rect(x, y, W, rowH, { fill: colors.fill, noStroke: true });
  parsed.forEach((r, ri) => {
    if (ri === 0) return;
    const fill = r.selected ? colors.selected : node.opts.striped && ri % 2 === 0 ? colors.stripe : null;
    if (fill) ctx.rect(x, y + ri * rowH, W, rowH, { fill, noStroke: true });
  });
  if (!plain2) ctx.rect(x, y, W, H, { width: 2 });
  for (let ri = 1; ri < parsed.length; ri++) {
    ctx.line(
      [
        [x, y + ri * rowH],
        [x + W, y + ri * rowH]
      ],
      ri === 1 ? 2 : 1
    );
  }
  for (let ci = 1; ci < ncols && !plain2; ci++) {
    ctx.line(
      [
        [colX[ci], y],
        [colX[ci], y + H]
      ],
      1
    );
  }
  parsed.forEach(
    (r, ri) => r.cells.forEach((cell, ci) => {
      const cy = y + ri * rowH;
      const inner = colW[ci] - 2 * padX;
      if (cell.check) {
        const contentW = BOX + (cell.label ? gap + cell.m.w : 0);
        const bx = cell.label ? colX[ci] + padX : colX[ci] + padX + (inner - contentW) / 2;
        checkMark(ctx, bx, cy + (rowH - BOX) / 2, !!cell.checked);
        if (cell.label) ctx.text(bx + BOX + gap, cy + (rowH - cell.m.h) / 2, cell.label, cell.m);
      } else if (cell.label) {
        const tx = cell.numeric && ri > 0 ? colX[ci] + colW[ci] - padX - cell.m.w : colX[ci] + padX;
        drawLabel(ctx, tx, cy + (rowH - cell.m.h) / 2, cell.lab);
      }
    })
  );
  return { w: W, h: H };
};

// src/core/components/heading.ts
var SCALE = { h1: 1.75, h2: 1.375 };
var heading = (ctx, node, x, y, slot) => {
  const fontSize = Math.round(ctx.fontSize * (node.type === "h2" ? SCALE.h2 : SCALE.h1));
  const label = measureLabel(ctx, contentLines(node).join(" ") || "Heading", fontSize);
  drawLabel(ctx, x, y, label, { fontSize });
  return { w: Math.max(label.w, slot?.w || 0), h: label.h };
};

// src/core/components/icon.ts
var icon = (ctx, node, x, y) => {
  const name = node.text.trim();
  const s = node.opts.w || iconSizeFor(ctx);
  if (isIcon(name)) {
    drawIcon(ctx, name, x, y, s);
  } else {
    ctx.rect(x, y, s, s);
    ctx.line([
      [x, y],
      [x + s, y + s]
    ]);
  }
  return { w: s, h: s };
};

// src/core/components/input.ts
var PAD_X = 10;
function fieldText(node, text2) {
  const empty = !!node.opts.empty;
  if (node.type === "password") return empty ? "" : "\u2022".repeat(Math.min(text2.length || 8, 24));
  if (node.type === "search") return empty ? "{search}" : `{search} ${text2 || "Search"}`;
  return empty ? "" : text2;
}
var input = (ctx, node, x, y, slot) => {
  const own = trailingIcon(contentLines(node).join(" "), node.type === "search");
  const label = measureLabel(ctx, fieldText(node, own.text));
  const lineH = ctx.measure(" ").h;
  const h = Math.max(node.opts.h || 0, lineH + 16);
  const btn = own.icon ? h : 0;
  const w = Math.max(node.opts.w || 0, slot?.w || 0, 200 + btn, label.w + 2 * PAD_X + btn);
  ctx.rect(x, y, w, h, { fill: ctx.theme.colors.paper });
  if (label.w) drawLabel(ctx, x + PAD_X, y + (h - label.h) / 2, label);
  if (own.icon) trailingButton(ctx, x + w, y, h, own.icon);
  return { w, h };
};
var spin = (ctx, node, x, y, slot) => {
  const ARROWS = 24;
  const str = node.opts.empty ? "" : contentLines(node).join(" ");
  const label = measureLabel(ctx, str);
  const h = Math.max(node.opts.h || 0, ctx.measure(" ").h + 16);
  const w = Math.max(node.opts.w || 0, slot?.w || 0, 80, label.w + 2 * PAD_X + ARROWS);
  ctx.rect(x, y, w, h, { fill: ctx.theme.colors.paper });
  if (label.w) drawLabel(ctx, x + PAD_X, y + (h - label.h) / 2, label);
  const ax = x + w - ARROWS, mid = y + h / 2, cx = ax + ARROWS / 2;
  ctx.line([
    [ax, y],
    [ax, y + h]
  ]);
  ctx.line([
    [ax, mid],
    [x + w, mid]
  ]);
  const up = y + h / 4, down = y + 3 * h / 4;
  ctx.line([
    [cx - 4, up + 2],
    [cx, up - 2],
    [cx + 4, up + 2]
  ]);
  ctx.line([
    [cx - 4, down - 2],
    [cx, down + 2],
    [cx + 4, down - 2]
  ]);
  return { w, h };
};
var textarea = (ctx, node, x, y, slot) => {
  const str = contentLines(node).join("\n");
  const m = str ? ctx.measure(str) : { w: 0, h: 0 };
  const h = Math.max(node.opts.h || 0, slot?.h || 0, m.h + 16, 80);
  const w = Math.max(node.opts.w || 0, slot?.w || 0, 240, m.w + 2 * PAD_X);
  ctx.rect(x, y, w, h, { fill: ctx.theme.colors.paper });
  if (str) ctx.text(x + PAD_X, y + 8, str, m);
  const gx = x + w - 4, gy = y + h - 4;
  ctx.line([
    [gx - 10, gy],
    [gx, gy - 10]
  ]);
  ctx.line([
    [gx - 5, gy],
    [gx, gy - 5]
  ]);
  return { w, h };
};

// src/core/components/link.ts
var link = (ctx, node, x, y, slot) => {
  const label = measureLabel(ctx, contentLines(node).join(" ") || "Link");
  for (const part of label.parts) if (part.kind === "text" && !part.tone) part.tone = "link";
  drawLabel(ctx, x, y, label);
  return { w: Math.max(label.w, slot?.w || 0), h: label.h };
};

// src/core/components/nav.ts
var PAD_X2 = 12;
var PAD_Y = 8;
var nav = (ctx, node, x, y, slot) => {
  const raw = splitItems(contentLines(node).join("|"), false);
  const items2 = raw.map((t) => {
    if (/^-+$/.test(t)) return { divider: true };
    const active = t.startsWith("*");
    return { divider: false, active, label: measureLabel(ctx, active ? t.slice(1).trim() : t) };
  });
  const lineH = ctx.measure(" ").h;
  const itemH = lineH + 2 * PAD_Y;
  const dividerH = PAD_Y * 2;
  const W = Math.max(
    node.opts.w || 0,
    slot?.w || 0,
    120,
    ...items2.map((it) => it.divider ? 0 : it.label.w + 2 * PAD_X2)
  );
  const contentH = items2.reduce((h, it) => h + (it.divider ? dividerH : itemH), 0);
  const H = Math.max(node.opts.h || 0, slot?.h || 0, contentH);
  const { colors } = ctx.theme;
  if (node.opts.dark) ctx.rect(x, y, W, H, { fill: colors.dark, color: colors.dark });
  let cy = y;
  for (const it of items2) {
    if (it.divider) {
      ctx.line([
        [x + PAD_X2, cy + dividerH / 2],
        [x + W - PAD_X2, cy + dividerH / 2]
      ]);
      cy += dividerH;
      continue;
    }
    if (it.active) {
      ctx.rect(x + 4, cy + 2, W - 8, itemH - 4, {
        fill: colors.primary,
        noStroke: true,
        rounded: true
      });
      const ink = ctx.ink;
      if (ink === colors.onDark) ctx.ink = null;
      drawLabel(ctx, x + PAD_X2, cy + (itemH - it.label.h) / 2, it.label);
      ctx.ink = ink;
    } else {
      drawLabel(ctx, x + PAD_X2, cy + (itemH - it.label.h) / 2, it.label);
    }
    cy += itemH;
  }
  return { w: W, h: H };
};

// src/core/components/navigation.ts
function asLink(label) {
  for (const part of label.parts) if (part.kind === "text" && !part.tone) part.tone = "link";
  return label;
}
var breadcrumb = (ctx, node, x, y) => {
  const str = contentLines(node).join(" ");
  const raw = str.includes(">") ? str.split(">") : str.split("|");
  const items2 = raw.map((t) => t.trim()).filter(Boolean);
  if (!items2.length) items2.push("Home");
  let current = items2.findIndex((t) => t.startsWith("*"));
  if (current < 0) current = items2.length - 1;
  const labels = items2.map((t, i) => {
    const label = measureLabel(ctx, t.replace(/^\*\s*/, ""));
    return i === current ? label : asLink(label);
  });
  const s = iconSizeFor(ctx);
  const gap = Math.round(s * 0.4);
  const H = Math.max(...labels.map((l) => l.h));
  let cx = x;
  labels.forEach((label, i) => {
    if (i > 0) {
      drawIcon(ctx, "chevron-right", cx + gap, y + (H - s) / 2, s);
      cx += 2 * gap + s;
    }
    drawLabel(ctx, cx, y + (H - label.h) / 2, label);
    cx += label.w;
  });
  return { w: cx - x, h: H };
};
var CHEVRONS = {
  "<": "chevron-left",
  "\xAB": "chevron-left",
  ">": "chevron-right",
  "\xBB": "chevron-right"
};
var pagination = (ctx, node, x, y) => {
  const GAP2 = 6;
  const tokens2 = contentLines(node).join(" ").split(/\s+/).filter(Boolean);
  if (!tokens2.length) tokens2.push("1");
  const B = ctx.measure(" ").h + 12;
  const s = iconSizeFor(ctx);
  const { colors } = ctx.theme;
  let cx = x;
  tokens2.forEach((raw, i) => {
    if (i > 0) cx += GAP2;
    const active = raw.length > 1 && raw.startsWith("*");
    const t = active ? raw.slice(1) : raw;
    if (t === "\u2026" || t === "...") {
      const m2 = ctx.measure(t);
      ctx.text(cx, y + (B - m2.h) / 2, t, m2);
      cx += m2.w;
      return;
    }
    const chevron = CHEVRONS[t];
    const m = chevron ? { w: s, h: s } : ctx.measure(t);
    const w = Math.max(B, m.w + 16);
    ctx.rect(cx, y, w, B, { fill: active ? colors.primary : colors.paper });
    if (chevron) drawIcon(ctx, chevron, cx + (w - s) / 2, y + (B - s) / 2, s);
    else ctx.text(cx + (w - m.w) / 2, y + (B - m.h) / 2, t, m);
    cx += w;
  });
  return { w: cx - x, h: B };
};
var menu = (ctx, node, x, y, slot) => {
  const PAD_X4 = 12, PAD_Y3 = 4, DIVIDER = 9;
  const lineH = ctx.measure(" ").h;
  const ITEM = lineH + 12;
  const s = iconSizeFor(ctx);
  const { colors } = ctx.theme;
  const items2 = (contentLines(node).length ? contentLines(node) : ["Item"]).map(
    (line) => {
      if (/^-+$/.test(line.trim())) return { divider: true };
      const [first = "", shortcut = ""] = splitItems(line, false);
      let text2 = first;
      const active = text2.startsWith("*");
      if (active) text2 = text2.slice(1).trim();
      let check = null;
      const cb = text2.match(/^\[( |x|X)?\]\s*(.*)$/);
      if (cb) {
        check = !!cb[1] && cb[1] !== " ";
        text2 = cb[2];
      }
      const submenu = /\s*>$/.test(text2);
      if (submenu) text2 = text2.replace(/\s*>$/, "");
      return { divider: false, label: measureLabel(ctx, text2), shortcut, active, check, submenu };
    }
  );
  const gutter = items2.some((it) => !it.divider && it.check !== null) ? s + 8 : 0;
  const W = Math.max(
    node.opts.w || 0,
    slot?.w || 0,
    160,
    ...items2.map(
      (it) => it.divider ? 0 : 2 * PAD_X4 + gutter + it.label.w + (it.shortcut ? 32 + ctx.measure(it.shortcut).w : 0) + (it.submenu ? 8 + s : 0)
    )
  );
  const H = 2 * PAD_Y3 + items2.reduce((h, it) => h + (it.divider ? DIVIDER : ITEM), 0);
  ctx.rect(x, y, W, H, { fill: colors.paper, width: 2 });
  let cy = y + PAD_Y3;
  for (const it of items2) {
    if (it.divider) {
      ctx.line([
        [x + PAD_X4, cy + DIVIDER / 2],
        [x + W - PAD_X4, cy + DIVIDER / 2]
      ]);
      cy += DIVIDER;
      continue;
    }
    if (it.active) {
      ctx.rect(x + 4, cy + 2, W - 8, ITEM - 4, {
        fill: colors.primary,
        noStroke: true,
        rounded: true
      });
    }
    if (it.check) drawIcon(ctx, "check", x + PAD_X4, cy + (ITEM - s) / 2, s);
    drawLabel(ctx, x + PAD_X4 + gutter, cy + (ITEM - it.label.h) / 2, it.label);
    if (it.shortcut) {
      const m = ctx.measure(it.shortcut);
      ctx.text(x + W - PAD_X4 - m.w, cy + (ITEM - m.h) / 2, it.shortcut, m, {
        ...ctx.ink === colors.disabled ? {} : { color: colors.muted }
      });
    }
    if (it.submenu) drawIcon(ctx, "chevron-right", x + W - PAD_X4 - s, cy + (ITEM - s) / 2, s);
    cy += ITEM;
  }
  return { w: W, h: H };
};
var tree = (ctx, node, x, y, slot) => {
  const STEP = 20, PAD_Y3 = 4;
  const ROW = ctx.measure(" ").h + 2 * PAD_Y3;
  const s = iconSizeFor(ctx);
  const TEXT = s + 4;
  const indentOf = (l) => l.length - l.trimStart().length;
  const body = node.body.filter((l) => l.trim());
  const indents = [...new Set(body.map(indentOf))].sort((a, b) => a - b);
  const base = node.text ? 1 : 0;
  const lines2 = [
    ...node.text ? [{ level: 0, raw: node.text }] : [],
    ...body.map((l) => ({ level: base + indents.indexOf(indentOf(l)), raw: l.trim() }))
  ];
  if (!lines2.length) lines2.push({ level: 0, raw: "Item" });
  const rows = lines2.map(({ level, raw }) => {
    let t = raw;
    let selected = false;
    const star2 = () => {
      if (t.startsWith("*")) {
        selected = true;
        t = t.slice(1).trim();
      }
    };
    star2();
    const m = t.match(/^([+-])\s+(.*)$/);
    const folder = m ? m[1] === "+" ? "chevron-right" : "chevron-down" : null;
    if (m) t = m[2];
    star2();
    return { level, folder, selected, label: measureLabel(ctx, t) };
  });
  const W = Math.max(
    node.opts.w || 0,
    slot?.w || 0,
    ...rows.map((r) => r.level * STEP + TEXT + r.label.w)
  );
  const { colors } = ctx.theme;
  rows.forEach((r, i) => {
    const ry = y + i * ROW;
    if (r.selected) ctx.rect(x, ry, W, ROW, { fill: colors.selected, noStroke: true });
    const rx = x + r.level * STEP;
    if (r.folder) drawIcon(ctx, r.folder, rx, ry + (ROW - s) / 2, s);
    drawLabel(ctx, rx + TEXT, ry + (ROW - r.label.h) / 2, r.label);
  });
  return { w: W, h: rows.length * ROW };
};

// src/core/components/paragraph.ts
var LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
var WIDTH = 320;
var LOREM_LINES = 4;
function wrap(ctx, text2, width) {
  const out = [];
  let line = "";
  for (const word of text2.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measure(next).w > width) {
      out.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out;
}
var paragraph = (ctx, node, x, y, slot) => {
  const W = Math.max(node.opts.w || 0, slot?.w || 0) || WIDTH;
  const given = contentLines(node).join(" ").trim();
  let lines2;
  if (!given || given.toLowerCase() === "lorem") {
    const want = node.opts.lines || LOREM_LINES;
    for (let copies = 1; ; copies *= 2) {
      lines2 = wrap(ctx, Array(copies).fill(LOREM).join(" "), W);
      if (lines2.length > want || copies > 64) break;
    }
    lines2 = lines2.slice(0, want);
  } else {
    lines2 = wrap(ctx, given, W);
    if (node.opts.lines) lines2 = lines2.slice(0, node.opts.lines);
  }
  const str = lines2.join("\n");
  const m = ctx.measure(str);
  ctx.text(x, y, str, m);
  return { w: W, h: m.h };
};

// src/core/components/row.ts
var row = (ctx, node, x, y, slot) => {
  const gap = ctx.theme.gap.row;
  const kids = node.children;
  let sizes = kids.map((c) => ctx.size(c));
  let slots = kids.map(() => void 0);
  const target = Math.max(node.opts.w || 0, slot?.w || 0);
  const fills = kids.filter((c) => c.opts.fill).length;
  if (target && fills) {
    const used = sizes.reduce((sum, s, i) => sum + (kids[i].opts.fill ? 0 : s.w), 0);
    const share = (target - used - gap * (kids.length - 1)) / fills;
    slots = kids.map((c) => c.opts.fill ? { w: share } : void 0);
    sizes = kids.map((c, i) => slots[i] ? ctx.size(c, slots[i]) : sizes[i]);
  }
  const H = Math.max(0, ...sizes.map((s) => s.h));
  let cx = x;
  kids.forEach((c, i) => {
    ctx.draw(c, cx, node.opts.top ? y : y + (H - sizes[i].h) / 2, slots[i]);
    cx += sizes[i].w + (i < kids.length - 1 ? gap : 0);
  });
  return { w: Math.max(cx - x, target), h: H };
};

// src/core/components/tabstrip.ts
var PAD_X3 = 16;
var PAD_Y2 = 8;
function tabStrip(ctx, node, x, y, labels, sel, slot) {
  const { colors, gap } = ctx.theme;
  const segmented = !!node.opts.segmented;
  const ls = labels.map((l) => measureLabel(ctx, l));
  const h = Math.max(...ls.map((l) => l.h)) + 2 * PAD_Y2;
  const natural = ls.map((l) => l.w + 2 * PAD_X3);
  const naturalW = natural.reduce((a, b) => a + b, 0);
  const target = Math.max(node.opts.w || 0, slot?.w || 0);
  const extra = segmented && target > naturalW ? (target - naturalW) / ls.length : 0;
  const widths = natural.map((w) => w + extra);
  const W = Math.max(
    target,
    widths.reduce((a, b) => a + b, 0)
  );
  let cx = x;
  if (segmented) {
    widths.forEach((w, i) => {
      if (i === sel) ctx.rect(cx, y, w, h, { fill: colors.primary, noStroke: true });
      cx += w;
    });
    ctx.rect(x, y, W, h);
    cx = x;
    widths.forEach((w, i) => {
      if (i > 0) {
        ctx.line([
          [cx, y],
          [cx, y + h]
        ]);
      }
      cx += w;
    });
  } else {
    ctx.line([
      [x, y + h],
      [x + W, y + h]
    ]);
  }
  cx = x;
  ls.forEach((l, i) => {
    const w = widths[i];
    const ink = ctx.ink;
    if (!segmented && i !== sel && ink === null) ctx.ink = colors.muted;
    drawLabel(ctx, cx + (w - l.w) / 2, y + (h - l.h) / 2, l);
    ctx.ink = ink;
    if (!segmented && i === sel) {
      ctx.line(
        [
          [cx, y + h - 1],
          [cx + w, y + h - 1]
        ],
        2
      );
    }
    cx += w;
  });
  if (!node.children.length) return { w: W, h };
  const content = ctx.stack(node.children, x, y + h + gap.stack, gap.stack, W);
  return { w: Math.max(W, content.w), h: h + gap.stack + content.h };
}

// src/core/components/tabs.ts
var tabs = (ctx, node, x, y, slot) => {
  const { pad, stack } = ctx.theme.gap;
  const raw = splitItems(contentLines(node).join("|"));
  const { sel, labels } = starred(raw.length ? raw : ["Tab 1", "Tab 2", "Tab 3"]);
  if (node.opts.segmented || node.opts.underline) {
    return tabStrip(ctx, node, x, y, labels, sel, slot);
  }
  const padX = 16, padY = 8, lift = 4;
  const ms = labels.map((l) => ctx.measure(l));
  const tabH = Math.max(...ms.map((m) => m.h)) + 2 * padY;
  const tabRects = [];
  let cx = x;
  ms.forEach((m) => {
    tabRects.push({ x: cx, w: m.w + 2 * padX });
    cx += m.w + 2 * padX;
  });
  const top = y + tabH + lift;
  const hasKids = node.children.length > 0;
  const minW = Math.max(node.opts.w || (hasKids ? 0 : 360), slot?.w || 0, cx - x + 40);
  let content;
  let W;
  if (needsWidthFirst(node, slot)) {
    W = Math.max(minW, stackSize(ctx, node.children, stack).w + 2 * pad);
    content = ctx.stack(node.children, x + pad, top + pad, stack, W - 2 * pad);
  } else {
    content = ctx.stack(node.children, x + pad, top + pad, stack);
    W = Math.max(minW, content.w + 2 * pad);
  }
  const minH = Math.max(node.opts.h || 0, (slot?.h || 0) - tabH - lift);
  const panelH = hasKids ? Math.max(minH, content.h + 2 * pad) : minH || 160;
  const bottom = top + panelH;
  const sL = tabRects[sel].x, sR = tabRects[sel].x + tabRects[sel].w;
  tabRects.forEach((t, i) => {
    if (i !== sel) ctx.rect(t.x, y + lift, t.w, tabH, { fill: ctx.theme.colors.fill });
  });
  ctx.line(
    [
      [sR, top],
      [x + W, top],
      [x + W, bottom],
      [x, bottom],
      [x, top],
      [sL, top]
    ],
    2
  );
  ctx.line(
    [
      [sL, top],
      [sL, y],
      [sR, y],
      [sR, top]
    ],
    2
  );
  tabRects.forEach((t, i) => {
    const ty = i === sel ? y : y + lift;
    const th = i === sel ? tabH + lift : tabH;
    ctx.text(t.x + padX, ty + (th - ms[i].h) / 2, labels[i], ms[i]);
  });
  return { w: W, h: tabH + lift + panelH };
};

// src/core/components/text.ts
var text = (ctx, node, x, y, slot) => {
  const str = contentLines(node).join("\n") || "Text";
  let w, h;
  if (isRich(str)) {
    const labels = str.split("\n").map((line) => measureLabel(ctx, line));
    h = 0;
    for (const label of labels) {
      drawLabel(ctx, x, y + h, label);
      h += label.h;
    }
    w = Math.max(...labels.map((l) => l.w));
  } else {
    const m = ctx.measure(str);
    ctx.text(x, y, str, m);
    ({ w, h } = m);
  }
  return { w: Math.max(w, slot?.w || 0), h };
};

// src/core/components/index.ts
var root = (ctx, node, x, y) => ctx.stack(node.children, x, y, ctx.theme.gap.root);
var COMPONENTS = {
  root,
  row,
  box,
  tabs,
  text,
  button,
  dropdown,
  checkbox,
  grid,
  icon,
  input,
  search: input,
  password: input,
  textarea,
  h1: heading,
  h2: heading,
  columns,
  nav,
  avatar,
  details,
  window: windowFrame,
  dialog,
  browser,
  phone,
  buttons,
  link,
  paragraph,
  radio,
  toggle,
  slider,
  alert,
  progress,
  tooltip,
  image,
  breadcrumb,
  pagination,
  menu,
  tree,
  placeholder,
  form,
  field,
  section,
  spin
};

// src/core/layout.ts
var LIGHT_SURFACES = /* @__PURE__ */ new Set([
  "button",
  "dropdown",
  "input",
  "search",
  "password",
  "textarea",
  "grid",
  "avatar",
  "window",
  "dialog",
  "browser",
  "phone",
  "alert",
  "pagination",
  "menu"
]);
var MARK_GAP = 6;
var markSize = (ctx) => Math.round(ctx.measure(" ").h * 0.8);
function markInvalid(ctx, x, y, size) {
  const GAP2 = MARK_GAP;
  const red = ctx.theme.colors.error;
  const s = markSize(ctx);
  const mx = x + size.w + GAP2, my = y + (size.h - s) / 2;
  ctx.rect(x, y, size.w, size.h, { width: 2, color: red });
  ctx.ellipse(mx, my, s, s, { color: red });
  const i = s * 0.3;
  ctx.line(
    [
      [mx + i, my + i],
      [mx + s - i, my + s - i]
    ],
    1,
    red
  );
  ctx.line(
    [
      [mx + s - i, my + i],
      [mx + i, my + s - i]
    ],
    1,
    red
  );
  return { w: size.w + GAP2 + s, h: size.h };
}
function layout(tree2, origin, env) {
  const ops = [];
  const textStyle = { fontSize: env.style.fontSize, fontFamily: env.style.fontFamily };
  const color = (c) => c ? { color: c } : {};
  const ctx = {
    theme: env.theme ?? DEFAULT_THEME,
    dry: false,
    fontSize: env.style.fontSize,
    ink: null,
    labelWidths: /* @__PURE__ */ new WeakMap(),
    measure(str, fontSize) {
      const style = fontSize ? { ...textStyle, fontSize } : textStyle;
      return env.measure(str && str.length ? str : " ", style);
    },
    rect(x, y, w, h, o = {}) {
      if (ctx.dry) return;
      ops.push({
        kind: "rect",
        x,
        y,
        w,
        h,
        fill: o.fill || null,
        stroke: !o.noStroke,
        strokeWidth: o.width || 1,
        rounded: !!o.rounded,
        ...color(o.color ?? ctx.ink),
        ...o.dashed ? { dashed: true } : {}
      });
    },
    ellipse(x, y, w, h, o = {}) {
      if (ctx.dry) return;
      ops.push({
        kind: "ellipse",
        x,
        y,
        w,
        h,
        fill: o.fill || null,
        stroke: !o.noStroke,
        strokeWidth: o.width || 1,
        ...color(o.color ?? ctx.ink)
      });
    },
    line(pts, strokeWidth = 1, c) {
      if (ctx.dry) return;
      const points = pts.filter(
        (p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]
      );
      ops.push({ kind: "line", points, strokeWidth, ...color(c ?? ctx.ink) });
    },
    text(x, y, str, size2, o = {}) {
      if (ctx.dry || !str) return;
      ops.push({
        kind: "text",
        x,
        y,
        w: size2.w,
        h: size2.h,
        text: str,
        ...color(o.color ?? ctx.ink),
        ...o.fontSize ? { fontSize: o.fontSize } : {}
      });
    },
    draw(node, x, y, slot) {
      const ink = ctx.ink;
      const { colors } = ctx.theme;
      if (node.opts.disabled) ctx.ink = colors.disabled;
      else if (node.opts.dark) ctx.ink = colors.onDark;
      else if (ink === colors.onDark && LIGHT_SURFACES.has(node.type)) ctx.ink = null;
      const own = node.opts.invalid && slot?.w ? { ...slot, w: slot.w - MARK_GAP - markSize(ctx) } : slot;
      let r = COMPONENTS[node.type](ctx, node, x, y, own);
      if (node.opts.invalid) r = markInvalid(ctx, x, y, r);
      ctx.ink = ink;
      return r;
    },
    size(node, slot) {
      const saved = ctx.dry;
      ctx.dry = true;
      const r = ctx.draw(node, 0, 0, slot);
      ctx.dry = saved;
      return r;
    },
    stack(children, x, y, gap, width) {
      let fillW = width ?? 0;
      if (width === void 0 && children.some((c) => c.opts.fill)) {
        fillW = Math.max(0, ...children.map((c) => ctx.size(c).w));
      }
      let w = 0, cy = y;
      children.forEach((c, i) => {
        const r = ctx.draw(c, x, cy, c.opts.fill && fillW ? { w: fillW } : void 0);
        w = Math.max(w, r.w);
        cy += r.h + (i < children.length - 1 ? gap : 0);
      });
      return { w, h: cy - y };
    }
  };
  const size = ctx.draw(tree2, origin.x, origin.y);
  return { ops, size };
}

// src/core/snippets.ts
var lines = (...l) => l.join("\n");
var SNIPPETS = [
  { name: "Button", description: "A plain button", text: "button: Cancel" },
  { name: "Primary button", description: "* makes it the blue one", text: "button: *Save" },
  {
    name: "Dropdown",
    description: "Shows the starred value",
    text: "dropdown: *All roles | Developer | Project manager"
  },
  { name: "Checkbox", description: "[x] is ticked, [ ] is not", text: "checkbox: [x] Remember me" },
  {
    name: "Checkbox list",
    description: "Several checkboxes, stacked",
    text: "checkbox: [x] Email | [ ] SMS | [ ] Push"
  },
  { name: "Text", description: "A label or a line of text", text: "text: Label" },
  {
    name: "Grid",
    description: "Table: the first row is the header, * selects a row",
    text: lines(
      "grid",
      "Name, Role, Active",
      "Anna, Developer, [x]",
      "*Erik, Project manager, [ ]"
    )
  },
  {
    name: "Tabs",
    description: "Tab strip with a panel; indent the content under it",
    text: lines("tabs: Overview | *Details | History", "  text: Tab content")
  },
  {
    name: "Box",
    description: "Framed panel with a title; indent the content under it",
    text: lines("box: Title", "  text: Box content")
  },
  {
    name: "Row",
    description: "Puts the indented components side by side",
    text: lines("row:", "  text: Label", "  button: Action")
  },
  {
    name: "Labelled dropdown",
    description: "A label and a dropdown on one line",
    text: lines("row:", "  text: Role", "  dropdown: *Developer | Project manager")
  },
  {
    name: "Button row",
    description: "Cancel and a primary button",
    text: lines("row:", "  button: Cancel", "  button: *Save")
  },
  {
    name: "Form in a box",
    description: "Fields, options and buttons inside a titled box",
    text: lines(
      "box: New user",
      "  row:",
      "    text: Role",
      "    dropdown: *Developer | Project manager",
      "  checkbox: [x] Active | [ ] Administrator",
      "  row:",
      "    button: Cancel",
      "    button: *Create"
    )
  },
  {
    name: "Filter bar and grid",
    description: "A row of filters above a table",
    text: lines(
      "row:",
      "  text: Role",
      "  dropdown: *All roles | Developer | Project manager",
      "  checkbox: [x] Show inactive",
      "grid",
      "Name, Role, Active",
      "Anna, Developer, [x]",
      "*Erik, Project manager, [ ]"
    )
  },
  {
    name: "Tabbed screen",
    description: "Tabs with filters, a grid and buttons",
    text: lines(
      "tabs: Overview | *Users | Settings",
      "  row:",
      "    text: Role",
      "    dropdown: *All roles | Developer | Project manager",
      "    checkbox: [x] Show inactive",
      "  grid",
      "  Name, Role, Active",
      "  Anna, Developer, [x]",
      "  *Erik, Project manager, [ ]",
      "  row:",
      "    button: Cancel",
      "    button: *Save"
    )
  },
  {
    name: "Input",
    description: "One-line text field",
    text: "input: Anna Svensson"
  },
  { name: "Search field", description: "Field with a search icon", text: "search: Search users" },
  { name: "Password", description: "Field with masked text", text: "password: secret" },
  {
    name: "Field with a button",
    description: "An {icon} at the end is a button at the right edge; (empty) draws no text",
    text: "input: 2026-10-14 {calendar}"
  },
  { name: "Number field", description: "Value with up and down arrows", text: "spin: 12" },
  {
    name: "Text area",
    description: "Multi-line field; more lines below it are more text",
    text: lines("textarea: Notes", "Second line")
  },
  { name: "Heading", description: "h1 is the big one, h2 smaller", text: "h1: Users" },
  { name: "Icon", description: "One icon; {name} also works inside labels", text: "icon: bell" },
  {
    name: "Icon buttons",
    description: "Square, or round with (round)",
    text: lines("row:", "  button: {filter}", "  button: {more} (round)", "  button: {plus} Add")
  },
  {
    name: "Page header",
    description: "Title on the left, close button on the right",
    text: lines(
      "box: (w=600)",
      "  row: (fill)",
      "    h1: Users (fill)",
      "    button: {close} (round)"
    )
  },
  {
    name: "Segmented control",
    description: "Joined options, the starred one active",
    text: "tabs: *ACTIVE | INACTIVE | ALL (segmented)"
  },
  {
    name: "Underlined tabs",
    description: "Tabs without a frame, the active one underlined",
    text: "tabs: *CONTENT | FILES (underline)"
  },
  {
    name: "Plain table",
    description: "Borderless grid with striped rows and status dots",
    text: lines(
      "grid (plain, striped)",
      "Name, Role, Status",
      "Anna, Developer, {dot} Active",
      "*Erik, Project manager, {dot} Active",
      "Lisa, Designer, Away"
    )
  },
  {
    name: "Navigation",
    description: "Vertical menu with icons; * is active, - a divider",
    text: "nav: {home} Home | *{users} Users | {settings} Settings | - | {back} Log out"
  },
  {
    name: "User block",
    description: "Avatar with a name beside it",
    text: lines("row:", "  avatar: AS", "  text: Anna Svensson")
  },
  {
    name: "Detail list",
    description: "Rows of label | value",
    text: lines(
      "details: {mail} E-mail | anna@example.com",
      "{phone} Phone | 070-123 45 67",
      "{lock} Role | Administrator"
    )
  },
  {
    name: "Radio buttons",
    description: "Pick one; * marks the chosen one",
    text: "radio: Small | *Medium | Large"
  },
  {
    name: "Toggles",
    description: "Switches; [on] or * is on",
    text: "toggle: [on] Wi-Fi | [off] Bluetooth"
  },
  { name: "Slider", description: "A value from 0 to 100%", text: "slider: 40%" },
  {
    name: "Alert",
    description: "Tinted message box; icons and [links] work",
    text: "alert: {info} Saved! [Undo]"
  },
  {
    name: "Progress bar",
    description: "Text above, the bar filled to the percentage",
    text: "progress: Uploading 60%"
  },
  { name: "Tooltip", description: "Small dark box with a pointer", text: "tooltip: Copied!" },
  {
    name: "Image",
    description: "Crossed placeholder: width x height and a caption",
    text: "image: 320x180 Team photo"
  },
  {
    name: "Placeholder",
    description: "Dashed box for something not drawn yet: width x height and a name",
    text: "placeholder: 240x40 Date picker"
  },
  {
    name: "Field",
    description: "A label before one component; (floating) puts it on the border",
    text: "field: Name | input: Anna Svensson"
  },
  {
    name: "Section",
    description: "Header with a count and a chevron over a group; (collapsed) folds it",
    text: lines(
      "section: {users} Ownership (count=2)",
      "  details: Owner | Anna Svensson",
      "  Team | Platform"
    )
  },
  {
    name: "Form",
    description: "Group of fields whose labels line up",
    text: lines(
      "form: New user (w=420)",
      "  field: Name | input: Anna Svensson (fill)",
      "  field: Role | dropdown: *Developer | Project manager (fill)",
      "  field: E-mail | input: {mail} anna@example.com (fill)"
    )
  },
  {
    name: "Breadcrumb",
    description: "Links separated by >; the last (or starred) is current",
    text: "breadcrumb: Home > Users > Anna Svensson"
  },
  {
    name: "Pagination",
    description: "Page boxes; * is the current page, < > are arrows",
    text: "pagination: < 1 *2 3 \u2026 10 >"
  },
  {
    name: "Menu",
    description: "One item per line: label | shortcut, - divider, > submenu",
    text: lines(
      "menu: Cut | Ctrl+X",
      "*Copy | Ctrl+C",
      "Paste | Ctrl+V",
      "-",
      "[x] Show ruler",
      "Zoom >"
    )
  },
  {
    name: "Tree",
    description: "Indented lines; + closed folder, - open folder, * selected",
    text: lines(
      "tree: {folder} Project",
      "  - {folder} src",
      "    *{file} index.ts",
      "    {file} main.ts",
      "  + {folder} docs"
    )
  },
  {
    name: "Link",
    description: "Blue, underlined text; [text] does the same inside any label",
    text: "link: Forgot password?"
  },
  {
    name: "Inline formatting",
    description: "[link] is a link, -text- is grey",
    text: "text: Read the [terms] or -skip for now-"
  },
  {
    name: "Paragraph",
    description: "Wrapped text; lorem gives placeholder text",
    text: "paragraph: lorem (lines=4)"
  },
  {
    name: "Window",
    description: "Desktop window with a title bar; indent the content under it",
    text: lines("window: Settings", "  text: Window content")
  },
  {
    name: "Dialog",
    description: "Pop-up with a shadow and buttons on the right",
    text: lines(
      "dialog: Delete user?",
      "  text: Anna Svensson will lose access.",
      "  buttons: Cancel | *Delete"
    )
  },
  {
    name: "Browser",
    description: "Browser window: title | address",
    text: lines("browser: My app | example.com/users", "  h1: Users")
  },
  {
    name: "Phone",
    description: "Phone screen; the text is the app bar title",
    text: lines("phone: Users", "  search: (fill)", "  button: *{plus} New user (fill)")
  },
  {
    name: "Buttons",
    description: "Buttons on the right, as in a dialog footer",
    text: "buttons: Cancel | *OK"
  },
  {
    name: "App shell",
    description: "Dark sidebar, main area and detail panel, full height",
    text: lines(
      "columns: (w=1200, h=700)",
      "  box (dark, w=220)",
      "    nav: {home} Home | *{users} Users (fill)",
      "  box (fill)",
      "    h1: Users",
      "  box: Details (w=320)",
      "    text: Select a user"
    )
  },
  {
    name: "Portal screen",
    description: "App shell with navigation, a filtered table and details",
    text: lines(
      "columns: (w=1280, h=720)",
      "  box (dark, w=240)",
      "    row:",
      "      avatar: AS",
      "      text: Anna Svensson",
      "    nav: {home} Home | *{users} Users | {settings} Settings | - | {back} Log out (fill)",
      "    button: *{plus} New user (fill)",
      "  box (fill)",
      "    row: (fill)",
      "      h1: Users (fill)",
      "      button: {close} (round)",
      "    row: (fill)",
      "      tabs: *ACTIVE | INACTIVE | ALL (segmented)",
      "      search: Search users (fill)",
      "      button: {filter} (round)",
      "      button: {more} (round)",
      "    grid (plain, striped, fill)",
      "    Name, Role, E-mail, Status",
      "    Anna Svensson, Developer, anna@example.com, {dot} Active",
      "    *Erik Berg, Project manager, erik@example.com, {dot} Active",
      "    Lisa Holm, Designer, lisa@example.com, Away",
      "  box (w=360)",
      "    row: (fill)",
      "      h2: Erik Berg (fill)",
      "      button: {close} (round)",
      "    tabs: *CONTENT | FILES (underline)",
      "    details: {mail} E-mail | erik@example.com",
      "    {phone} Phone | 070-123 45 67",
      "    {calendar} Since | 2021-03-01",
      "    {lock} Role | Project manager",
      "    button: *Save (fill)"
    )
  },
  {
    name: "Dialog form",
    description: "Dialog with fields, options and buttons in the footer",
    text: lines(
      "dialog: New user (w=420)",
      "  text: Name",
      "  input: Anna Svensson (fill)",
      "  text: E-mail",
      "  input: {mail} anna@example.com (fill)",
      "  row:",
      "    text: Role",
      "    dropdown: *Developer | Project manager",
      "  toggle: [on] Send invitation",
      "  buttons: Cancel | *Create"
    )
  },
  {
    name: "Mobile screen",
    description: "Phone with search, filter tabs, a list and an action",
    text: lines(
      "phone: Users",
      "  search: Search users (fill)",
      "  tabs: *ALL | ACTIVE | AWAY (segmented, fill)",
      "  grid (plain, fill)",
      "  Name, Status",
      "  Anna Svensson, {dot} Active",
      "  *Erik Berg, {dot} Active",
      "  Lisa Holm, Away",
      "  alert: {info} 2 invitations pending (fill)",
      "  button: *{plus} New user (fill)"
    )
  },
  {
    name: "Web page",
    description: "Browser with a breadcrumb, a table and pagination",
    text: lines(
      "browser: Users | example.com/users",
      "  breadcrumb: {home} Home > Admin > Users",
      "  h1: Users",
      "  grid (striped, fill)",
      "  Name, Role, Status",
      "  Anna Svensson, Developer, {dot} Active",
      "  Erik Berg, Project manager, Away",
      "  pagination: < 1 *2 3 \u2026 10 >"
    )
  }
];

// src/cli/sketch.ts
var STYLE = { stroke: "#1e1e1e", fontFamily: 3, roughness: 1, fontSize: FONT_SIZE };
var PADDING = 16;
var monoMeasure = (text2, style) => {
  const lines2 = text2.split("\n");
  const scale = style.fontSize / 16;
  return {
    w: 9 * scale * Math.max(...lines2.map((l) => l.length)),
    h: 21 * scale * lines2.length
  };
};
function unknownIcons(spec) {
  return spec.split("\n").flatMap(
    (line, i) => [...line.matchAll(/\{([\w-]+)\}/g)].filter((m) => !isIcon(m[1])).map((m) => ({ line: i + 1, message: `${m[0]} is not an icon, so it is drawn as text` }))
  );
}
function placeholderNodes(node) {
  const own = node.type === "placeholder" ? [node] : [];
  return own.concat(...node.children.map(placeholderNodes));
}
function sketch(text2) {
  const spec = extractSpec(text2, { plain: false }) ?? text2;
  const { tree: tree2, errors } = parse(spec);
  const { ops, size } = layout(tree2, { x: 0, y: 0 }, { measure: monoMeasure, style: STYLE });
  const svg = renderSvg(ops, STYLE, { padding: PADDING }).replace(
    "<svg ",
    '<svg style="background:#ffffff" '
  );
  const dashed = ops.filter((o) => o.kind === "rect" && !!o.dashed);
  const placeholders = placeholderNodes(tree2).map((node, i) => ({
    line: node.line ?? 0,
    name: [node.text, ...node.body].join(" ").replace(/\d+\s*[x×]\s*\d+/, "").trim(),
    w: Math.round(dashed[i]?.w ?? 0),
    h: Math.round(dashed[i]?.h ?? 0)
  }));
  const pad = 2 * PADDING;
  const warnings = unknownIcons(spec);
  return { svg, errors, warnings, size: { w: size.w + pad, h: size.h + pad }, placeholders };
}
var USAGE = "usage: sketch <spec file or -> [out.svg] [out.png] ...";
function parseArgs(argv) {
  const [input2, ...outputs] = argv;
  if (!input2) throw new Error(USAGE);
  const svg = [], png = [];
  for (const out of outputs) {
    if (/\.svg$/i.test(out)) svg.push(out);
    else if (/\.png$/i.test(out)) png.push(out);
    else throw new Error(`${out}: outputs must end in .svg or .png
${USAGE}`);
  }
  if (!outputs.length) svg.push(input2.replace(/(\.[^./\\]*)?$/, ".svg"));
  return { input: input2, svg, png };
}
function report(result, written) {
  const lines2 = [`size: ${Math.round(result.size.w)}x${Math.round(result.size.h)}`];
  if (!result.errors.length) lines2.push("errors: none");
  for (const e of result.errors) lines2.push(`error: line ${e.line}: ${e.message}`);
  for (const w of result.warnings) lines2.push(`warning: line ${w.line}: ${w.message}`);
  for (const p of result.placeholders) {
    lines2.push(`placeholder: line ${p.line}: ${p.name || "(no name)"} (${p.w}x${p.h})`);
  }
  for (const path of written) lines2.push(`wrote ${path}`);
  return lines2.join("\n");
}
var CHROME_PATHS = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
];
function findChrome() {
  const env = process.env.SKETCHDOWN_CHROME ?? process.env.CHROME_PATH;
  if (env) return env;
  return CHROME_PATHS.find((p) => existsSync(p)) ?? null;
}
function writePng(svgPath, pngPath, size) {
  const chrome = findChrome();
  if (!chrome)
    throw new Error("PNG output needs Chrome or Edge; set SKETCHDOWN_CHROME to its path");
  const run = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${Math.ceil(size.w)},${Math.ceil(size.h)}`,
    `--screenshot=${pngPath}`,
    pathToFileURL(svgPath).href
  ]);
  if (run.status !== 0 || !existsSync(pngPath)) {
    throw new Error(`${chrome} failed to write ${pngPath}: ${run.stderr?.toString().trim()}`);
  }
}
function main(argv) {
  try {
    const args = parseArgs(argv);
    const text2 = readFileSync(args.input === "-" ? 0 : args.input, "utf8");
    const result = sketch(text2);
    for (const path of args.svg) writeFileSync(path, result.svg + "\n");
    if (args.png.length) {
      const tmp = mkdtempSync(join(tmpdir(), "sketchdown-"));
      try {
        const svgPath = join(tmp, "sketch.svg");
        writeFileSync(svgPath, result.svg);
        for (const path of args.png) writePng(svgPath, path, result.size);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    }
    console.log(report(result, [...args.svg, ...args.png]));
    return result.errors.length ? 1 : 0;
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    return 2;
  }
}

// src/cli/bin.ts
process.exitCode = main(process.argv.slice(2));
