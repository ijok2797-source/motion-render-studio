// Runs inside the sandboxed preview/render frame. Controlled only via postMessage,
// because the frame has an opaque origin and cannot be accessed directly.
export const FRAME_SHIM = `(function(){
var vt=0,raf=[],rid=1,timers=[],tid=1,started=false,seen=new WeakMap();
var oST=window.setTimeout,oCT=window.clearTimeout,oSI=window.setInterval,oCI=window.clearInterval,oPN=performance.now.bind(performance),oDN=Date.now;
function report(t,m){try{parent.postMessage({__motion:1,type:t,msg:String(m)},'*')}catch(e){}}
window.addEventListener('error',function(e){report('error',(e.message||'Error')+(e.lineno?' (baris '+e.lineno+')':''))});
window.addEventListener('unhandledrejection',function(e){var r=e.reason;report('error',(r&&r.message)||String(r))});
['log','warn','error','info'].forEach(function(k){var f=console[k]&&console[k].bind(console);console[k]=function(){var a=[].slice.call(arguments).map(function(x){try{return typeof x==='object'?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(' ');report(k==='info'?'log':k,a);if(f)f.apply(null,arguments)}});
var base=oDN();
function fPN(){return vt}
function fDN(){return base+vt}
function fST(cb,ms){var id=tid++;timers.push({id:id,due:vt+(+ms||0),cb:cb,args:[].slice.call(arguments,2),iv:0});return id}
function fSI(cb,ms){var id=tid++;var d=Math.max(1,+ms||0);timers.push({id:id,due:vt+d,cb:cb,args:[].slice.call(arguments,2),iv:d});return id}
function fCT(id){timers=timers.filter(function(t){return t.id!==id})}
function real(on){if(on){window.setTimeout=oST;window.clearTimeout=oCT;window.setInterval=oSI;window.clearInterval=oCI;performance.now=oPN;Date.now=oDN}else{window.setTimeout=fST;window.setInterval=fSI;window.clearTimeout=window.clearInterval=fCT;performance.now=fPN;Date.now=fDN}}
real(false);
window.requestAnimationFrame=function(cb){var id=rid++;raf.push({id:id,cb:cb});return id};
window.cancelAnimationFrame=function(id){raf=raf.filter(function(r){return r.id!==id})};
function runTimers(to){var g=0;while(g++<20000){var n=null;for(var i=0;i<timers.length;i++){if(timers[i].due<=to&&(!n||timers[i].due<n.due))n=timers[i]}if(!n)break;if(n.due>vt)vt=n.due;if(n.iv){n.due+=n.iv}else{timers.splice(timers.indexOf(n),1)}try{if(typeof n.cb==='function')n.cb.apply(window,n.args)}catch(e){report('error',e.message)}}}
function frame(){var q=raf;raf=[];for(var i=0;i<q.length;i++){try{q[i].cb(vt)}catch(e){report('error',e.message)}}}
function sync(){if(!document.getAnimations)return;document.getAnimations().forEach(function(a){var s=seen.get(a);if(s===undefined){s=started?vt:0;seen.set(a,s)}try{a.pause();a.currentTime=Math.max(0,vt-s)}catch(e){}})}
function step(to){if(!started){sync();started=true;runTimers(0);frame()}while(vt<to-1e-6){var nx=Math.min(to,vt+1000/60);runTimers(nx);vt=nx;frame()}sync()}
function largest(){var b=null,a=0;[].forEach.call(document.querySelectorAll('canvas'),function(c){var x=c.width*c.height;if(x>a){a=x;b=c}});return b}
function visibleCount(){return [].filter.call(document.body.children,function(e){return ['SCRIPT','STYLE','LINK'].indexOf(e.tagName)<0}).length}
function codeBg(){var b=getComputedStyle(document.body).backgroundColor,h=getComputedStyle(document.documentElement).backgroundColor;function cl(c){return c==='transparent'||c==='rgba(0, 0, 0, 0)'}return !cl(b)?b:!cl(h)?h:'#ffffff'}
function fail(id,e){parent.postMessage({__motion:1,type:'frameError',id:id,msg:(e&&e.message)||String(e)},'*')}
function send(id,cv,mode){if(window.createImageBitmap){createImageBitmap(cv).then(function(b){parent.postMessage({__motion:1,type:'frame',id:id,mode:mode,bmp:b},'*',[b])},function(e){fail(id,e)})}else{var x=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);parent.postMessage({__motion:1,type:'frame',id:id,mode:mode,img:x},'*')}}
function capture(d){try{step(d.t);var mc=document.getElementById('__mc');var cv=mc||largest();var mode=d.mode==='auto'?(mc||(cv&&visibleCount()<=2)?'canvas':'dom'):d.mode;
if(mode==='canvas'){if(!cv)return fail(d.id,{message:'Mode Canvas dipilih, tapi kode tidak punya elemen canvas.'});var o=document.createElement('canvas');o.width=d.w;o.height=d.h;var r=cv.getBoundingClientRect(),sx=d.w/innerWidth,sy=d.h/innerHeight;var oc=o.getContext('2d');oc.imageSmoothingEnabled=true;oc.imageSmoothingQuality='high';oc.drawImage(cv,r.left*sx,r.top*sy,r.width*sx,r.height*sy);send(d.id,o,mode);return}
var ss=d.ss||1;
if(typeof html2canvas!=='function')return fail(d.id,{message:'Perender DOM tidak tersedia.'});
var t=d.t;real(true);
html2canvas(document.documentElement,{width:innerWidth,height:innerHeight,windowWidth:innerWidth,windowHeight:innerHeight,scale:(d.w/innerWidth)*ss,backgroundColor:d.bg,logging:false,onclone:function(cd){if(cd.getAnimations)cd.getAnimations().forEach(function(a){try{a.pause();a.currentTime=t}catch(e){}})}}).then(function(c){real(false);if(ss>1){var o2=document.createElement('canvas');o2.width=d.w;o2.height=d.h;var g=o2.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(c,0,0,d.w,d.h);c=o2}send(d.id,c,mode)},function(e){real(false);fail(d.id,e)})
}catch(e){fail(d.id,e)}}
window.addEventListener('message',function(e){var d=e.data;if(!d||!d.__mcmd)return;
if(d.__mcmd==='step')step(d.t);
else if(d.__mcmd==='capture')capture(d);
else if(d.__mcmd==='info')parent.postMessage({__motion:1,type:'info',codeBg:codeBg()},'*')});
window.addEventListener('load',function(){parent.postMessage({__motion:1,type:'ready'},'*')});
})();`;
