// Built-in anime.js-compatible API (v3 `anime()` and v4 `animate()`), running on the built-in GSAP engine.
export const ANIME_LITE = `(function(){
if(window.anime||!window.gsap)return;
var G=window.gsap;
var PROP={translateX:'x',translateY:'y',translateZ:'z',rotate:'rotation',rotateZ:'rotation',rotateX:'rotationX',rotateY:'rotationY',skewX:'skewX',skewY:'skewY',x:'x',y:'y'};
var RESV={targets:1,duration:1,delay:1,endDelay:1,easing:1,ease:1,loop:1,direction:1,autoplay:1,update:1,begin:1,complete:1,onUpdate:1,onBegin:1,onComplete:1,loopComplete:1,onLoop:1,round:1,keyframes:1,alternate:1,reversed:1,playbackRate:1};
function ms(v,d){if(v==null)return d;if(typeof v==='number')return v/1000;return parseFloat(v)/1000||d}
function ease(e){if(!e)return 'elastic.out(1,0.5)';if(typeof e==='function')return e;var s=String(e).trim();
 if(s==='linear')return 'none';
 var sp=/^spring/i.test(s);if(sp)return 'elastic.out(1,0.6)';
 var m=/^(?:ease)?(In|Out|InOut|OutIn)?(Quad|Cubic|Quart|Quint|Sine|Expo|Circ|Back|Elastic|Bounce)?(?:\\(([^)]*)\\))?$/i.exec(s);
 if(m&&m[2]){var dir=(m[1]||'Out').toLowerCase();dir=dir==='inout'?'inOut':dir==='outin'?'inOut':dir;var n=m[2].toLowerCase();var a=m[3]?'('+m[3].split(',').map(function(x){return parseFloat(x)}).filter(function(x){return !isNaN(x)}).join(',')+')':'';
  if(n==='elastic'&&m[3]){var p=m[3].split(',');a='('+(parseFloat(p[0])||1)+','+(parseFloat(p[1])||0.5)+')'}return n+'.'+dir+(n==='back'||n==='elastic'?a:'')}
 var v4=/^(in|out|inOut|outIn)(Quad|Cubic|Quart|Quint|Sine|Expo|Circ|Back|Elastic|Bounce)?(?:\\(([^)]*)\\))?$/.exec(s);
 if(v4){var n4=(v4[2]||'Quad').toLowerCase();var d4=v4[1]==='outIn'?'inOut':v4[1];if(!v4[2]&&v4[3]){var pw=parseFloat(v4[3])||2;return 'power'+Math.max(1,Math.min(4,Math.round(pw-1)))+'.'+d4}return n4+'.'+d4}
 return 'power2.out'}
function val(v,t,i,n){if(typeof v==='function')return v(t,i,n);if(typeof v==='string'&&/turn$/.test(v))return parseFloat(v)*360;if(typeof v==='string'&&/rad$/.test(v))return parseFloat(v)*180/Math.PI;if(typeof v==='string'&&/deg$/.test(v))return parseFloat(v);return v}
function split(params,t,i,n){var to={},from=null;for(var k in params){if(RESV[k])continue;var key=PROP[k]||k;var v=params[k];
 if(v&&typeof v==='object'&&!Array.isArray(v)&&('value' in v||'to' in v||'from' in v)){var tv='to' in v?v.to:v.value;if('from' in v){from=from||{};from[key]=val(v.from,t,i,n)}v=tv}
 if(Array.isArray(v)){from=from||{};from[key]=val(v[0],t,i,n);to[key]=val(v[v.length-1],t,i,n)}else to[key]=val(v,t,i,n)}
 return{to:to,from:from}}
function toTargets(t){if(t==null)return[];if(typeof t==='string')return Array.prototype.slice.call(document.querySelectorAll(t));if(Array.isArray(t)){var o=[];t.forEach(function(x){o=o.concat(toTargets(x))});return o}if(t.length!=null&&!t.nodeType&&typeof t!=='function')return Array.prototype.slice.call(t);return[t]}
function stagger(v,o){o=o||{};return function(el,i,n){var from=o.from==null?0:o.from==='center'?(n-1)/2:o.from==='last'?n-1:o.from;var d=Math.abs(i-from);var base=Array.isArray(v)?null:parseFloat(v);if(Array.isArray(v)){return v[0]+(v[1]-v[0])*(n>1?d/(Math.max(from,n-1-from)||1):0)}return (o.start||0)+d*base}}
function build(tl,params,offset,isTl){var targets=toTargets(params.targets);var n=targets.length;var dur=params.duration;var delay=params.delay;var e=ease(params.easing||params.ease);
 var loop=params.loop===true?-1:typeof params.loop==='number'?Math.max(0,params.loop-1):0;var yoyo=params.direction==='alternate'||params.alternate===true;
 if(yoyo&&loop>=0&&params.loop!==true&&params.loop!=null)loop=params.loop*2-1;
 targets.forEach(function(t,i){var p=split(params,t,i,n);var d=ms(typeof dur==='function'?dur(t,i,n):dur,1);var dl=ms(typeof delay==='function'?delay(t,i,n):delay,0);
  var v=Object.assign({duration:d,ease:e},p.to);if(!isTl){v.delay=dl;if(loop)v.repeat=loop;if(yoyo)v.yoyo=true}
  if(i===0){if(params.update||params.onUpdate)v.onUpdate=function(){(params.update||params.onUpdate)(api)};if(params.begin||params.onBegin)v.onStart=function(){(params.begin||params.onBegin)(api)}}
  if(i===n-1&&(params.complete||params.onComplete))v.onComplete=function(){(params.complete||params.onComplete)(api)};
  var pos=isTl?(offset==null?(i===0?undefined:'<'):offset):undefined;if(isTl&&dl)pos=(pos==null?'>':pos)+(dl?'+='+dl:'');
  if(isTl&&i>0&&offset==null)pos='<'+(dl?'+'+dl:'');
  if(p.from)tl.fromTo(t,p.from,v,pos);else tl.to(t,v,pos)});
 var api={began:true,completed:false,progress:0,play:function(){tl.play();return api},pause:function(){tl.pause();return api},restart:function(){tl.restart();return api},reverse:function(){tl.reverse();return api},seek:function(t){tl.time(t/1000);return api},finished:new Promise(function(r){setTimeout(r,(ms(dur,1)+ms(delay,0))*1000)})};
 return api}
function anime(params){params=params||{};var tl=G.timeline({repeat:0,paused:params.autoplay===false});var loop=params.loop===true?-1:typeof params.loop==='number'?Math.max(0,params.loop-1):0;var yoyo=params.direction==='alternate';
 if(loop||yoyo){tl.vars.repeat=yoyo&&typeof params.loop==='number'?params.loop*2-1:loop;tl.vars.yoyo=yoyo}
 var p2=Object.assign({},params);var targets=toTargets(params.targets);var n=targets.length;
 targets.forEach(function(t,i){var pp=split(params,t,i,n);var d=ms(typeof params.duration==='function'?params.duration(t,i,n):params.duration,1);var dl=ms(typeof params.delay==='function'?params.delay(t,i,n):params.delay,0);
  var v=Object.assign({duration:d,ease:ease(params.easing||params.ease)},pp.to);if(i===0&&(params.update||params.onUpdate))v.onUpdate=function(){(params.update||params.onUpdate)(api)};if(i===0&&(params.begin||params.onBegin))v.onStart=function(){(params.begin||params.onBegin)(api)};
  if(i===n-1&&(params.complete||params.onComplete))v.onComplete=function(){(params.complete||params.onComplete)(api)};
  if(pp.from)tl.fromTo(t,pp.from,v,dl);else tl.to(t,v,dl)});
 if(params.endDelay)tl.to({},{duration:ms(params.endDelay,0)});
 var api={tl:tl,play:function(){tl.play();return api},pause:function(){tl.pause();return api},restart:function(){tl.restart();return api},reverse:function(){tl.reverse();return api},seek:function(t){tl.time(t/1000);return api},get duration(){return tl.totalDuration()*1000},finished:{then:function(f){return tl.then(f)}}};void p2;return api}
function timeline(o){o=o||{};var tl=G.timeline({paused:o.autoplay===false,repeat:o.loop===true?-1:typeof o.loop==='number'?Math.max(0,o.loop-1):0,yoyo:o.direction==='alternate'});var defaults=o.defaults||{};if(o.duration!=null&&defaults.duration==null)defaults.duration=o.duration;if(o.easing&&!defaults.easing)defaults.easing=o.easing;
 var api={tl:tl,add:function(params,offset){var p=Object.assign({},defaults,params);var off=offset;if(typeof off==='string'){off=off.replace(/([+-])=(\\d+(?:\\.\\d+)?)/,function(_,s,n){return s+'='+(n/1000)})}else if(typeof off==='number')off=off/1000;build(tl,p,off,true);return api},
  play:function(){tl.play();return api},pause:function(){tl.pause();return api},restart:function(){tl.restart();return api},seek:function(t){tl.time(t/1000);return api},reverse:function(){tl.reverse();return api},get duration(){return tl.totalDuration()*1000}};
 api.set=function(t,v,pos){tl.set(toTargets(t),split(v).to,pos);return api};return api}
anime.timeline=timeline;anime.stagger=stagger;anime.random=function(a,b){return Math.floor(Math.random()*(b-a+1))+a};anime.set=function(t,v){toTargets(t).forEach(function(x,i,n){G.set(x,split(v,x,i,n.length).to)})};anime.remove=function(t){G.killTweensOf(toTargets(t))};anime.version='3-mrv';anime.running=[];anime.easing=ease;anime.get=function(t,k){return G.getProperty(toTargets(t)[0],PROP[k]||k)};
// v4-style API
function animate(t,params){var p=Object.assign({},params||{},{targets:t});if(p.ease&&!p.easing)p.easing=p.ease;if(p.loop===true)p.loop=true;if(p.alternate)p.direction='alternate';return anime(p)}
function createTimeline(o){var tl=timeline(o);var add=tl.add;tl.add=function(t,params,off){if(params&&typeof params==='object'&&!Array.isArray(params)&&(typeof t==='string'||t&&(t.nodeType||t.length!=null||typeof t==='object'))&&!('targets' in (t||{}))){var p=Object.assign({},params,{targets:t});if(p.ease&&!p.easing)p.easing=p.ease;return add(p,off)}return add(t,params)};return tl}
window.anime=anime;window.__animeV4={animate:animate,createTimeline:createTimeline,stagger:stagger,utils:{random:anime.random,set:anime.set,get:anime.get,remove:anime.remove},eases:{}};
})();`;

export function usesAnime(all: string): boolean {
    return /\banime\s*\(|\banime\.(timeline|stagger)|animejs|anime(\.min)?\.js|from\s+['"]animejs/.test(all);
}

export function rewriteAnime(code: string): string {
    let out = code.replace(/<script[^>]+src=["'][^"']*anime[^"']*["'][^>]*>\s*<\/script>/gi, '');
    out = out.replace(/import\s+([\s\S]*?)\s+from\s+['"][^'"]*animejs[^'"]*['"];?/g, (_m, clause: string) => {
        const decl: string[] = [];
        const named = /\{([^}]*)\}/.exec(clause);
        if (named) named[1].split(',').map((x) => x.trim()).filter(Boolean).forEach((p) => {
            const [a, b] = p.split(/\s+as\s+/).map((x) => x.trim());
            decl.push(`const ${b || a} = ${a === 'default' ? 'window.anime' : `(window.__animeV4[${JSON.stringify(a)}] || window.anime[${JSON.stringify(a)}])`};`);
        });
        const def = /^\s*([A-Za-z_$][\w$]*)\s*(,|$)/.exec(clause);
        if (def) decl.push(`const ${def[1]} = window.anime;`);
        const ns = /\*\s+as\s+([A-Za-z_$][\w$]*)/.exec(clause);
        if (ns) decl.push(`const ${ns[1]} = Object.assign({}, window.__animeV4, { default: window.anime });`);
        return decl.join(' ');
    });
    return out;
}
