import type { BgMode, Code } from './types';
import { FRAME_SHIM } from './frameShim';
import { rewriteThree, threeHead, usesThree } from './three';
import { GSAP_LITE, rewriteGsap, usesGsap } from './gsapLite';
import { CANNON_LITE, rewriteCannon, usesCannon } from './cannonLite';
import { ANIME_LITE, rewriteAnime, usesAnime } from './animeLite';
import { MATTER_LITE, rewriteMatter, usesMatter } from './matterLite';
import { P5_LITE, p5NeedsGlobal, rewriteP5, usesP5 } from './p5Lite';
import H2C_SRC from 'html2canvas/dist/html2canvas.min.js?raw';

// Split tag names so the inlined bundle never contains a literal closing script tag.
const SO = ['<', 'script>'].join('');
const SC = ['</', 'script>'].join('');

// Virtual clock: replaces rAF, timers, performance.now and Date.now inside the
// animation frame, and pauses Web Animations (CSS animations/transitions) so
// every frame can be rendered at an exact time.
const SHIM_JS = `(function(){
var vt=0,raf=[],rid=1,timers=[],tid=1,started=false,seen=new WeakMap();
function report(t,m){try{parent.postMessage({__motion:1,type:t,msg:String(m)},'*')}catch(e){}}
window.addEventListener('error',function(e){report('error',(e.message||'Error')+(e.lineno?' (baris '+e.lineno+')':''))});
window.addEventListener('unhandledrejection',function(e){var r=e.reason;report('error',(r&&r.message)||String(r))});
['log','warn','error','info'].forEach(function(k){var f=console[k]&&console[k].bind(console);console[k]=function(){var a=[].slice.call(arguments).map(function(x){try{return typeof x==='object'?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(' ');report(k==='info'?'log':k,a);if(f)f.apply(null,arguments)}});
var base=Date.now();
performance.now=function(){return vt};
Date.now=function(){return base+vt};
window.requestAnimationFrame=function(cb){var id=rid++;raf.push({id:id,cb:cb});return id};
window.cancelAnimationFrame=function(id){raf=raf.filter(function(r){return r.id!==id})};
window.setTimeout=function(cb,ms){var id=tid++;timers.push({id:id,due:vt+(+ms||0),cb:cb,args:[].slice.call(arguments,2),iv:0});return id};
window.setInterval=function(cb,ms){var id=tid++;var d=Math.max(1,+ms||0);timers.push({id:id,due:vt+d,cb:cb,args:[].slice.call(arguments,2),iv:d});return id};
window.clearTimeout=window.clearInterval=function(id){timers=timers.filter(function(t){return t.id!==id})};
function runTimers(to){var g=0;while(g++<20000){var n=null;for(var i=0;i<timers.length;i++){if(timers[i].due<=to&&(!n||timers[i].due<n.due))n=timers[i]}if(!n)break;if(n.due>vt)vt=n.due;if(n.iv){n.due+=n.iv}else{timers.splice(timers.indexOf(n),1)}try{if(typeof n.cb==='function')n.cb.apply(window,n.args)}catch(e){report('error',e.message)}}}
function frame(){var q=raf;raf=[];for(var i=0;i<q.length;i++){try{q[i].cb(vt)}catch(e){report('error',e.message)}}}
function sync(){if(!document.getAnimations)return;document.getAnimations().forEach(function(a){var s=seen.get(a);if(s===undefined){s=started?vt:0;seen.set(a,s)}try{a.pause();a.currentTime=Math.max(0,vt-s)}catch(e){}})}
function step(to){if(!started){sync();started=true;runTimers(0);frame()}while(vt<to-1e-6){var nx=Math.min(to,vt+1000/60);runTimers(nx);vt=nx;frame()}sync()}
window.__motion={step:step,time:function(){return vt},times:function(){return document.getAnimations?document.getAnimations().map(function(a){return a.currentTime}):[]}};
})();`;

void SHIM_JS;

const looksHtml = (s: string) => /^\s*(<!doctype|<html|<head|<body|<div|<svg|<canvas|<style|<script|<section|<main|<span|<h1|<p[\s>])/i.test(s);

/** Fixes code pasted into the wrong tab and reports blocked external resources. */
type Libs = { gsap?: boolean; cannon?: boolean; anime?: boolean; matter?: boolean; p5?: boolean; p5Global?: boolean };

function normalize(code: Code, libs: Libs = {}): { code: Code; warnings: string[]; hasThree: boolean; addonKeys: string[] } {
    const warnings: string[] = [];
    let { html, css, js } = code;
    if (looksHtml(js)) {
        html = html.trim() ? html + '\n' + js : js;
        js = '';
        warnings.push('Kode HTML terdeteksi di tab JS, otomatis dijalankan sebagai HTML.');
    }
    if (looksHtml(css)) {
        html = html.trim() ? html + '\n' + css : css;
        css = '';
        warnings.push('Kode HTML terdeteksi di tab CSS, otomatis dijalankan sebagai HTML.');
    }
    // Partial file: ends with </script> but its opening <script> tag was not pasted.
    const closeIdx = html.search(/<\/script>/i);
    const openIdx = html.search(/<script[\s>]/i);
    if (closeIdx >= 0 && (openIdx < 0 || openIdx > closeIdx)) {
        const jsPart = html.slice(0, closeIdx);
        html = html.slice(closeIdx + 9).replace(/<\/?(body|html)[^>]*>/gi, '');
        js = js.trim() ? jsPart + '\n' + js : jsPart;
        warnings.push('Awal file tidak ikut ter-paste (tag pembuka <script>, <html>, atau bagian atas kode hilang). Bagian yang ada dijalankan sebagai JS, tapi fungsi yang hilang akan error. Paste ulang seluruh file dari baris paling atas.');
    }
    if (/\\[[\]*_`]/.test(html + js) && /p\\\[|\\\*\s|\\`/.test(html + js)) {
        warnings.push('Kode berisi garis miring terbalik seperti \\[ \\] \\* \\` (biasanya karena disalin dari chat atau dokumen). Ini membuat kode error. Salin ulang dari file aslinya.');
    }
    const all = html + css + js;
    const hasThree = usesThree(all);
    const addonKeys: string[] = [];
    if (hasThree) {
        html = rewriteThree(html, warnings, addonKeys);
        js = rewriteThree(js, warnings, addonKeys);
    }
    const hasGsap = usesGsap(all);
    if (hasGsap) { html = rewriteGsap(html); js = rewriteGsap(js); }
    const hasCannon = usesCannon(all);
    if (hasCannon) { html = rewriteCannon(html); js = rewriteCannon(js); }
    const hasAnime = usesAnime(all);
    if (hasAnime) { html = rewriteAnime(html); js = rewriteAnime(js); }
    const hasMatter = usesMatter(all);
    if (hasMatter) { html = rewriteMatter(html); js = rewriteMatter(js); }
    const hasP5 = usesP5(all);
    if (hasP5) { html = rewriteP5(html); js = rewriteP5(js); }
    libs.gsap = hasGsap || hasAnime;
    libs.cannon = hasCannon;
    libs.anime = hasAnime;
    libs.matter = hasMatter;
    libs.p5 = hasP5;
    libs.p5Global = p5NeedsGlobal(all);
    const ext = [...(html + css + js).matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]).filter((u) => /^(https?:)?\/\//i.test(u));
    ext.forEach((u) => warnings.push(`Library eksternal diblokir: ${u}. Paste isi file library ini langsung ke tab JS.`));
    if (/<link[^>]+href=["'](https?:)?\/\//i.test(all) || /@import\s+url\(["']?https?:/i.test(all)) warnings.push('Font atau CSS eksternal diblokir, tampilan bisa memakai font bawaan.');
    if (/^\s*(import|export)\s/m.test(js) || /<script[^>]+type=["']module["'][^>]*>[\s\S]*?^\s*(import|export)\s/im.test(html)) warnings.push('Kode memakai import/export (module). Ubah jadi script biasa supaya bisa jalan.');
    return { code: { html, css, js }, warnings, hasThree, addonKeys };
}

export function buildDoc(rawCode: Code, bgMode: BgMode, withRenderer = false, ss = 1): string {
    const libs: Libs = {};
    const { code, warnings, hasThree, addonKeys } = normalize(rawCode, libs);
    const extraLibs = (libs.gsap ? `${SO}${GSAP_LITE}${SC}` : '') + (libs.cannon ? `${SO}${CANNON_LITE}${SC}` : '')
        + (libs.anime ? `${SO}${ANIME_LITE}${SC}` : '') + (libs.matter ? `${SO}${MATTER_LITE}${SC}` : '') + (libs.p5 ? `${SO}${P5_LITE}${SC}` : '');
    const p5Start = libs.p5Global ? `${SO}window.__p5Global&&window.__p5Global();${SC}` : '';
    const warnJs = warnings.length ? `${SO}(function(){var w=${JSON.stringify(warnings)};w.forEach(function(m){console.warn(m)})})();${SC}` : '';
    const base = `html,body{margin:0;width:100%;height:100%;overflow:hidden}`;
    const override = bgMode !== 'code' ? `html,body{background:transparent !important}` : '';
    const h2c = withRenderer ? `${SO}${H2C_SRC.replace(/<\/script/gi, '<\\/script')}${SC}` : '';
    const head = h2c + `${SO}window.__motionSS=${Math.max(1, Math.min(4, ss))};${SC}` + `${SO}${FRAME_SHIM}${SC}` + (hasThree ? threeHead(addonKeys) : '') + extraLibs + warnJs + `<style>${base}${override}</style>`;
    const userCss = code.css.trim() ? `<style>${code.css}</style>` : '';
    // Auto-runner: if the code only defines draw(ctx, time, width, height) (time in seconds),
    // create a full-size canvas and call it every frame.
    // Takes over any global draw(ctx, time, width, height): draws on its own full-frame canvas,
    // hides the code's own player UI (buttons, sliders), and mutes the code's own draw loop.
    const runner = `(function(){var fn=typeof window.draw==='function'?window.draw:(typeof window.render==='function'?window.render:null);if(!fn||fn.length<3||window.__motionDrawHooked)return;window.__motionDrawHooked=1;var c=document.createElement('canvas');c.id='__mc';c.style.cssText='display:block;position:fixed;left:0;top:0;width:100%;height:100%;z-index:2147483647;visibility:visible';document.body.appendChild(c);var st=document.createElement('style');st.textContent='body>*:not(#__mc){visibility:hidden!important}';document.head.appendChild(st);var x=c.getContext('2d');var name=typeof window.draw==='function'?'draw':'render';try{window[name]=function(cx){if(cx===x)return fn.apply(this,arguments)}}catch(e){}var ss=window.__motionSS||1;function fit(){c.width=Math.round(innerWidth*ss);c.height=Math.round(innerHeight*ss)}fit();function f(t){if(c.width!==Math.round(innerWidth*ss)||c.height!==Math.round(innerHeight*ss))fit();x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height);try{fn(x,t/1000,c.width,c.height)}catch(e){console.error(e&&e.message||String(e));return}requestAnimationFrame(f)}requestAnimationFrame(f)})();`;
    const userJs = (code.js.trim() ? `${SO}${code.js}\n${SC}` : '') + `${SO}${runner}${SC}` + p5Start;

    if (/<html[\s>]/i.test(code.html)) {
        let d = code.html;
        if (/<head[^>]*>/i.test(d)) d = d.replace(/<head[^>]*>/i, (m) => m + head);
        else d = d.replace(/<html[^>]*>/i, (m) => `${m}<head>${head}</head>`);
        d = /<\/head>/i.test(d) ? d.replace(/<\/head>/i, `${userCss}</head>`) : d + userCss;
        d = /<\/body>/i.test(d) ? d.replace(/<\/body>/i, `${userJs}</body>`) : d + userJs;
        return d;
    }
    return `<!doctype html><html><head><meta charset="utf-8">${head}${userCss}</head><body>${code.html}${userJs}</body></html>`;
}
