// Built-in GSAP-compatible runtime for the render frame (subset of the public GSAP 3 API).
// Driven by requestAnimationFrame + performance.now, which MRV replaces with its virtual clock,
// so every frame is rendered at its exact time.
export const GSAP_LITE = `(function(){
if(window.gsap)return;
var now=function(){return performance.now()/1000};
function pw(p){return{in:function(t){return Math.pow(t,p)},out:function(t){return 1-Math.pow(1-t,p)},inOut:function(t){return t<.5?Math.pow(2*t,p)/2:1-Math.pow(2*(1-t),p)/2}}}
var E={none:function(t){return t},linear:function(t){return t}};
[['power1',2],['power2',3],['power3',4],['power4',5],['quad',2],['cubic',3],['quart',4],['quint',5],['strong',5]].forEach(function(a){E[a[0]]=pw(a[1])});
E.sine={in:function(t){return 1-Math.cos(t*Math.PI/2)},out:function(t){return Math.sin(t*Math.PI/2)},inOut:function(t){return -(Math.cos(Math.PI*t)-1)/2}};
E.expo={in:function(t){return t===0?0:Math.pow(2,10*t-10)},out:function(t){return t===1?1:1-Math.pow(2,-10*t)},inOut:function(t){return t===0?0:t===1?1:t<.5?Math.pow(2,20*t-10)/2:(2-Math.pow(2,-20*t+10))/2}};
E.circ={in:function(t){return 1-Math.sqrt(1-t*t)},out:function(t){return Math.sqrt(1-Math.pow(t-1,2))},inOut:function(t){return t<.5?(1-Math.sqrt(1-Math.pow(2*t,2)))/2:(Math.sqrt(1-Math.pow(-2*t+2,2))+1)/2}};
function back(s){s=s==null?1.70158:s;var c3=s+1;return{in:function(t){return c3*t*t*t-s*t*t},out:function(t){return 1+c3*Math.pow(t-1,3)+s*Math.pow(t-1,2)},inOut:function(t){var c2=s*1.525;return t<.5?(Math.pow(2*t,2)*((c2+1)*2*t-c2))/2:(Math.pow(2*t-2,2)*((c2+1)*(t*2-2)+c2)+2)/2}}}
E.back=back();
function bOut(t){var n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d)return n*(t-=1.5/d)*t+.75;if(t<2.5/d)return n*(t-=2.25/d)*t+.9375;return n*(t-=2.625/d)*t+.984375}
E.bounce={out:bOut,in:function(t){return 1-bOut(1-t)},inOut:function(t){return t<.5?(1-bOut(1-2*t))/2:(1+bOut(2*t-1))/2}};
function elastic(a,p){a=Math.max(1,a||1);p=p||.3;var c4=2*Math.PI/(p/0.3*3);var c5=2*Math.PI/(p/0.3*4.5);return{out:function(t){return t===0?0:t===1?1:a*Math.pow(2,-10*t)*Math.sin((t*10-.75)*c4)+1},in:function(t){return t===0?0:t===1?1:-a*Math.pow(2,10*t-10)*Math.sin((t*10-10.75)*c4)},inOut:function(t){return t===0?0:t===1?1:t<.5?-(Math.pow(2,20*t-10)*Math.sin((20*t-11.125)*c5))/2:(Math.pow(2,-20*t+10)*Math.sin((20*t-11.125)*c5))/2+1}}}
E.elastic=elastic();
function steps(n){return function(t){return Math.min(1,Math.floor(t*n)/n)}}
function ease(e){if(typeof e==='function')return e;if(!e)return E.power1.out;var s=String(e).trim();var m=/^steps\\((\\d+)\\)$/.exec(s);if(m)return steps(+m[1]);
var p=/^([a-z0-9]+)(?:\\.(in|out|inOut))?(?:\\(([^)]*)\\))?$/i.exec(s);if(!p)return E.power1.out;var name=p[1].toLowerCase(),kind=p[2]||'out';
if(name==='none'||name==='linear')return E.none;if(name==='back'&&p[3])return back(parseFloat(p[3]))[kind];if(name==='elastic'&&p[3]){var a=p[3].split(',');return elastic(parseFloat(a[0]),parseFloat(a[1]))[kind]}
var f=E[name];return f&&f[kind]?f[kind]:(typeof f==='function'?f:E.power1.out)}
var RES={duration:1,delay:1,ease:1,repeat:1,yoyo:1,repeatDelay:1,onStart:1,onUpdate:1,onComplete:1,onRepeat:1,stagger:1,paused:1,overwrite:1,immediateRender:1,id:1,startAt:1,callbackScope:1,onCompleteParams:1,onUpdateParams:1,onStartParams:1,yoyoEase:1,keyframes:1,lazy:1,inherit:1};
function toArr(t){if(t==null)return[];if(typeof t==='string')return Array.prototype.slice.call(document.querySelectorAll(t));if(t.length!=null&&!t.nodeType&&!(t instanceof Window)&&typeof t!=='function'&&!(t.isObject3D||t.isVector3||t.isColor||t.isEuler))return Array.prototype.slice.call(t);return[t]}
var TF={x:'px',y:'px',z:'px',xPercent:'%',yPercent:'%',rotation:'deg',rotate:'deg',rotationX:'deg',rotationY:'deg',rotationZ:'deg',rotateX:'deg',rotateY:'deg',rotateZ:'deg',scale:'',scaleX:'',scaleY:'',skewX:'deg',skewY:'deg'};
var NOUNIT={opacity:1,zIndex:1,fontWeight:1,lineHeight:1,flexGrow:1,scale:1,scaleX:1,scaleY:1,autoAlpha:1};
var tfState=new WeakMap();
function tf(el){var s=tfState.get(el);if(!s){s={x:0,y:0,z:0,xPercent:0,yPercent:0,rotation:0,rotationX:0,rotationY:0,scaleX:1,scaleY:1,skewX:0,skewY:0};tfState.set(el,s)}return s}
function applyTf(el){var s=tf(el);el.style.transform='translate('+s.xPercent+'%,'+s.yPercent+'%) translate3d('+s.x+'px,'+s.y+'px,'+s.z+'px) rotate('+s.rotation+'deg) rotateX('+s.rotationX+'deg) rotateY('+s.rotationY+'deg) skew('+s.skewX+'deg,'+s.skewY+'deg) scale('+s.scaleX+','+s.scaleY+')'}
function isEl(o){return o&&o.nodeType===1}
function camel(k){return k.replace(/-([a-z])/g,function(_,c){return c.toUpperCase()})}
function parseNum(v){var m=/^(-?[\\d.]+(?:e-?\\d+)?)([a-z%]*)$/i.exec(String(v).trim());return m?{n:parseFloat(m[1]),u:m[2]}:null}
function parseColor(v){var c=document.createElement('canvas').getContext('2d');c.fillStyle='#000';c.fillStyle=String(v);var s=c.fillStyle;if(s[0]==='#'){var n=parseInt(s.slice(1),16);return[n>>16&255,n>>8&255,n&255,1]}var m=/rgba?\\(([^)]+)\\)/.exec(s);if(m){var p=m[1].split(',').map(parseFloat);return[p[0],p[1],p[2],p[3]==null?1:p[3]]}return null}
function getProp(t,k){
 if(isEl(t)){ if(k in TF){var s=tf(t);var key=k==='rotate'||k==='rotationZ'||k==='rotateZ'?'rotation':k==='rotateX'?'rotationX':k==='rotateY'?'rotationY':k;if(k==='scale')return s.scaleX;return s[key]}
  if(k==='autoAlpha')return parseFloat(getComputedStyle(t).opacity);var cs=getComputedStyle(t)[camel(k)];return cs}
 return t[k]}
function setProp(t,k,v,unit){
 if(isEl(t)){ if(k in TF){var s=tf(t);if(k==='scale'){s.scaleX=s.scaleY=v}else{var key=k==='rotate'||k==='rotationZ'||k==='rotateZ'?'rotation':k==='rotateX'?'rotationX':k==='rotateY'?'rotationY':k;s[key]=v}applyTf(t);return}
  if(k==='autoAlpha'){t.style.opacity=v;t.style.visibility=v<=0.0001?'hidden':'inherit';return}
  t.style[camel(k)]=typeof v==='number'?v+(unit!=null?unit:(NOUNIT[k]?'':'px')):v;return}
 if(t[k]&&typeof t[k]==='object'&&t[k].isColor){t[k].setRGB(v[0]/255,v[1]/255,v[2]/255);return}
 t[k]=v}
function buildProps(t,vars,from){
 var list=[];for(var k in vars){if(RES[k])continue;var end=vars[k];if(typeof end==='function')end=end(0,t,[t]);
  var cur=getProp(t,k);var isCol=(isEl(t)&&/color|background|fill|stroke|border/i.test(k))||(t[k]&&t[k].isColor);
  if(isCol){var a=t[k]&&t[k].isColor?[t[k].r*255,t[k].g*255,t[k].b*255,1]:parseColor(cur);var b=t[k]&&t[k].isColor&&typeof end!=='string'?null:parseColor(end);if(!b&&t[k]&&t[k].isColor){var tmp=new window.THREE.Color(end);b=[tmp.r*255,tmp.g*255,tmp.b*255,1]}if(a&&b)list.push({k:k,col:true,a:a,b:b});continue}
  var rel=typeof end==='string'&&/^[+-]=/.test(end);var pe=parseNum(rel?end.slice(2):end);var pc=parseNum(cur);
  if(pe&&pc!=null){var s0=pc?pc.n:0;var e0=rel?(end[0]==='+'?s0+pe.n:s0-pe.n):pe.n;list.push({k:k,a:s0,b:e0,u:pe.u||(pc&&pc.u)||null})}
  else if(typeof cur==='number'||cur==null){var ee=typeof end==='number'?end:parseFloat(end);if(!isNaN(ee))list.push({k:k,a:typeof cur==='number'?cur:0,b:ee,u:null})}
 }
 if(from)list.forEach(function(p){var x=p.a;p.a=p.b;p.b=x});return list}
function render(t,props,p){for(var i=0;i<props.length;i++){var q=props[i];if(q.col){var c=q.a.map(function(v,j){return v+(q.b[j]-v)*p});if(t[q.k]&&t[q.k].isColor)setProp(t,q.k,c);else setProp(t,q.k,'rgba('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+','+c[3]+')')}else setProp(t,q.k,q.a+(q.b-q.a)*p,q.u)}}

var root;
function Anim(){this._start=0;this._dur=0;this._parent=null;this._paused=false;this._rev=false;this._time=0;this._ts=1;this.vars={}}
Anim.prototype.duration=function(v){if(v==null)return this._dur;this._dur=v;return this};
Anim.prototype.totalDuration=function(){var r=this.vars.repeat||0;if(r<0)return 1e9;return this._dur*(r+1)+(this.vars.repeatDelay||0)*r};
Anim.prototype.play=function(){this._paused=false;this._rev=false;return this};
Anim.prototype.pause=function(){this._paused=true;return this};
Anim.prototype.resume=function(){this._paused=false;return this};
Anim.prototype.reverse=function(){this._rev=!this._rev;this._paused=false;return this};
Anim.prototype.restart=function(){this._start=(this._parent?this._parent.rawTime():now())+(this.vars.delay||0);this._paused=false;this._rev=false;return this};
Anim.prototype.kill=function(){if(this._parent)this._parent._remove(this);return this};
Anim.prototype.progress=function(v){if(v==null)return this._dur?Math.min(1,this._time/this._dur):1;this._seek(v*this._dur);return this};
Anim.prototype.time=function(v){if(v==null)return this._time;this._seek(v);return this};
Anim.prototype.seek=function(v){this._seek(typeof v==='number'?v:0);return this};
Anim.prototype.timeScale=function(v){if(v==null)return this._ts;this._ts=v;return this};
Anim.prototype.isActive=function(){return !this._paused&&this._time>0&&this._time<this.totalDuration()};
Anim.prototype.then=function(f){var self=this;return new Promise(function(res){var o=self.vars.onComplete;self.vars.onComplete=function(){o&&o.apply(this,arguments);res(self)}}).then(f)};
Anim.prototype.eventCallback=function(n,f){if(f===undefined)return this.vars[n];this.vars[n]=f;return this};
Anim.prototype._seek=function(t){this._paused=true;this._render(t,true)};
Anim.prototype._local=function(parentTime){var t=(parentTime-this._start)*this._ts;var r=this.vars.repeat||0,rd=this.vars.repeatDelay||0,d=this._dur;if(t<0)return{t:-1,it:0};
 var cyc=d+rd;var it=0;if(r!==0&&cyc>0){it=Math.floor(t/cyc);if(r>0&&it>r){it=r;t=d}else t=t-it*cyc;if(t>d)t=d}else if(t>d)t=d;
 if(this.vars.yoyo&&it%2===1)t=d-t;return{t:t,it:it}};

function Tween(targets,vars,mode){Anim.call(this);this.targets=toArr(targets);this.vars=vars||{};this._dur=this.vars.duration==null?0.5:this.vars.duration;this._mode=mode;this._props=null;this._started=false;this._done=false;this._lastIt=0;this._fromVars=null;
 var st=this.vars.stagger;if(st!=null&&this.targets.length>1){var each=typeof st==='number'?st:(st.each||0);var self=this;var tl=new Timeline({paused:false});
  this.targets.forEach(function(t,i){var v={};for(var k in self.vars)if(k!=='stagger'&&k!=='delay')v[k]=self.vars[k];tl.add(new Tween(t,v,mode),i*each)});this._group=tl}}
Tween.prototype=Object.create(Anim.prototype);
Tween.prototype._init=function(){var self=this;this._props=this.targets.map(function(t){if(self._mode==='fromTo'){var fv=self._fromVars;for(var k in fv)if(!RES[k]){var v=fv[k];if(isEl(t)&&k in TF)setProp(t,k,parseFloat(v));else if(isEl(t))setProp(t,k,v);else if(t[k]&&t[k].isColor)t[k].set(v);else t[k]=v}}return buildProps(t,self.vars,self._mode==='from')})};
Tween.prototype._render=function(parentTime,abs){
 if(this._group){this._group._render(abs?parentTime:parentTime-this._start,true);return}
 var L=abs?{t:Math.max(0,Math.min(this._dur,parentTime)),it:0}:this._local(parentTime);if(L.t<0){if(this._mode!=='to'&&this.vars.immediateRender!==false){if(!this._props)this._init();this.targets.forEach(function(t,i){render(t,this._props[i],0)},this)}return}
 if(!this._props)this._init();if(!this._started){this._started=true;this.vars.onStart&&this.vars.onStart.apply(this.vars.callbackScope||this,this.vars.onStartParams||[])}
 if(L.it!==this._lastIt){this._lastIt=L.it;this.vars.onRepeat&&this.vars.onRepeat.call(this)}
 this._time=L.t;var p=this._dur?L.t/this._dur:1;var e=ease(this.vars.ease)(p);
 for(var i=0;i<this.targets.length;i++)render(this.targets[i],this._props[i],e);
 this.vars.onUpdate&&this.vars.onUpdate.apply(this.vars.callbackScope||this,this.vars.onUpdateParams||[]);
 var r=this.vars.repeat||0;if(!this._done&&r>=0&&(parentTime-this._start)*this._ts>=this.totalDuration()&&!abs){this._done=true;this.vars.onComplete&&this.vars.onComplete.apply(this.vars.callbackScope||this,this.vars.onCompleteParams||[])}};
Tween.prototype.totalDuration=function(){if(this._group)return this._group.totalDuration();return Anim.prototype.totalDuration.call(this)};
Tween.prototype.invalidate=function(){this._props=null;return this};

function Timeline(vars){Anim.call(this);this.vars=vars||{};this._children=[];this._cursor=0;this._labels={};this._dur=0;this._done=false}
Timeline.prototype=Object.create(Anim.prototype);
Timeline.prototype.rawTime=function(){return this._time};
Timeline.prototype._pos=function(pos){if(pos==null)return this._cursor;if(typeof pos==='number')return pos;var s=String(pos);
 if(s[0]==='<'){var last=this._last;var b=last?last._start:0;return b+(parseFloat(s.slice(1))||0)}if(s[0]==='>'){var l2=this._last;var e=l2?l2._start+l2.totalDuration():0;return e+(parseFloat(s.slice(1))||0)}
 var m=/^([+-])=([\\d.]+)$/.exec(s);if(m)return this._cursor+(m[1]==='+'?1:-1)*parseFloat(m[2]);
 var lm=/^([^+-]+)([+-]=[\\d.]+)?$/.exec(s);if(lm&&this._labels[lm[1]]!=null){var off=lm[2]?(lm[2][0]==='+'?1:-1)*parseFloat(lm[2].slice(2)):0;return this._labels[lm[1]]+off}
 if(lm){this._labels[lm[1]]=this._cursor;return this._cursor}return this._cursor};
Timeline.prototype.add=function(child,pos){if(typeof child==='function'){var fn=child;child=new Tween({},{duration:0,onComplete:fn})}if(typeof child==='string'){this.addLabel(child,pos);return this}
 var at=this._pos(pos);child._start=at+(child.vars.delay||0);child._parent=this;this._children.push(child);this._last=child;var end=child._start+child.totalDuration();if(end>this._cursor)this._cursor=end;if(end>this._dur)this._dur=end;return this};
Timeline.prototype._remove=function(c){this._children=this._children.filter(function(x){return x!==c})};
Timeline.prototype.addLabel=function(n,pos){this._labels[n]=this._pos(pos);return this};
Timeline.prototype.call=function(f,params,pos){return this.add(new Tween({},{duration:0,onComplete:function(){f.apply(null,params||[])}}),pos)};
Timeline.prototype.set=function(t,v,pos){var vv=Object.assign({},v,{duration:0});return this.add(new Tween(t,vv,'to'),pos)};
Timeline.prototype.to=function(t,v,pos){var d=this._defaults();return this.add(new Tween(t,Object.assign({},d,v),'to'),pos)};
Timeline.prototype.from=function(t,v,pos){var d=this._defaults();return this.add(new Tween(t,Object.assign({},d,v),'from'),pos)};
Timeline.prototype.fromTo=function(t,a,b,pos){var d=this._defaults();var tw=new Tween(t,Object.assign({},d,b),'fromTo');tw._fromVars=a;return this.add(tw,pos)};
Timeline.prototype._defaults=function(){return this.vars.defaults||{}};
Timeline.prototype.getChildren=function(){return this._children.slice()};
Timeline.prototype.clear=function(){this._children=[];this._cursor=0;this._dur=0;return this};
Timeline.prototype._render=function(parentTime,abs){var L=abs?{t:Math.max(0,parentTime),it:0}:this._local(parentTime);if(L.t<0)return;this._time=L.t;
 var cs=this._children;for(var i=0;i<cs.length;i++)cs[i]._render(L.t,false);
 this.vars.onUpdate&&this.vars.onUpdate.call(this);
 var r=this.vars.repeat||0;if(!this._done&&r>=0&&!abs&&(parentTime-this._start)*this._ts>=this.totalDuration()){this._done=true;this.vars.onComplete&&this.vars.onComplete.call(this)}};

root=new Timeline();root._start=0;
var rootStart=now();
root.rawTime=function(){return now()-rootStart};
function attach(a){a._parent=root;a._start=root.rawTime()+(a.vars.delay||0);root._children.push(a);return a}
var running=false;
function tick(){var t=root.rawTime();var cs=root._children;for(var i=0;i<cs.length;i++){if(!cs[i]._paused)cs[i]._render(t,false)}requestAnimationFrame(tick)}
function ensure(){if(!running){running=true;requestAnimationFrame(tick)}}

var gsap={
 to:function(t,v){ensure();var tw=new Tween(t,v,'to');attach(tw);if(v&&v.paused)tw.pause();return tw},
 from:function(t,v){ensure();var tw=new Tween(t,v,'from');attach(tw);tw._init();tw.targets.forEach(function(x,i){render(x,tw._props[i],0)});if(v&&v.paused)tw.pause();return tw},
 fromTo:function(t,a,b){ensure();var tw=new Tween(t,b,'fromTo');tw._fromVars=a;attach(tw);tw._init();tw.targets.forEach(function(x,i){render(x,tw._props[i],0)});if(b&&b.paused)tw.pause();return tw},
 set:function(t,v){var tw=new Tween(t,Object.assign({},v,{duration:0}),'to');tw._init();tw.targets.forEach(function(x,i){render(x,tw._props[i],1)});return tw},
 timeline:function(v){ensure();var tl=new Timeline(v);attach(tl);if(v&&v.paused)tl.pause();return tl},
 delayedCall:function(d,f,p){ensure();return attach(new Tween({},{duration:0,delay:d,onComplete:function(){f.apply(null,p||[])}},'to'))},
 killTweensOf:function(t){var ts=toArr(t);root._children=root._children.filter(function(c){return !(c.targets&&c.targets.some(function(x){return ts.indexOf(x)>=0}))})},
 getProperty:function(t,k){return getProp(toArr(t)[0],k)},
 registerPlugin:function(){},registerEase:function(n,f){E[n]=f},
 config:function(){},defaults:function(){},
 ticker:{add:function(f){ensure();(function loop(){f(root.rawTime(),0,0);requestAnimationFrame(loop)})()},remove:function(){},lagSmoothing:function(){},fps:function(){}},
 globalTimeline:root,
 utils:{
  clamp:function(a,b,v){var f=function(x){return Math.min(b,Math.max(a,x))};return v===undefined?f:f(v)},
  mapRange:function(a,b,c,d,v){var f=function(x){return c+(x-a)*(d-c)/(b-a)};return v===undefined?f:f(v)},
  interpolate:function(a,b,p){return a+(b-a)*p},
  random:function(a,b,snap){if(Array.isArray(a))return a[Math.floor(Math.random()*a.length)];var r=a+Math.random()*(b-a);return snap?Math.round(r/snap)*snap:r},
  wrap:function(a,b,v){var f=function(x){var r=b-a;return ((((x-a)%r)+r)%r)+a};return v===undefined?f:f(v)},
  snap:function(s,v){var f=function(x){return Math.round(x/s)*s};return v===undefined?f:f(v)},
  toArray:toArr,
  degToRad:function(d){return d*Math.PI/180}
 },
 parseEase:ease,version:'3-mrv'
};
window.gsap=gsap;window.TweenMax=window.TweenLite=gsap;window.TimelineMax=window.TimelineLite=function(v){return gsap.timeline(v)};
window.Power0={easeNone:E.none};['Power1','Power2','Power3','Power4'].forEach(function(n,i){var e=E['power'+(i+1)];window[n]={easeIn:e.in,easeOut:e.out,easeInOut:e.inOut}});
window.Sine={easeIn:E.sine.in,easeOut:E.sine.out,easeInOut:E.sine.inOut};window.Back={easeIn:E.back.in,easeOut:E.back.out,easeInOut:E.back.inOut};
window.Elastic={easeIn:E.elastic.in,easeOut:E.elastic.out,easeInOut:E.elastic.inOut};window.Bounce={easeIn:E.bounce.in,easeOut:E.bounce.out,easeInOut:E.bounce.inOut};
window.Expo={easeIn:E.expo.in,easeOut:E.expo.out,easeInOut:E.expo.inOut};window.Linear={easeNone:E.none};
})();`;

export function usesGsap(all: string): boolean {
    return /\bgsap\b|TweenMax|TweenLite|TimelineMax|TimelineLite/.test(all);
}

/** Removes gsap CDN tags and rewrites ESM imports of gsap to the global. */
export function rewriteGsap(code: string): string {
    let out = code.replace(/<script[^>]+src=["'][^"']*gsap[^"']*["'][^>]*>\s*<\/script>/gi, '');
    out = out.replace(/import\s+([\s\S]*?)\s+from\s+['"][^'"]*gsap[^'"]*['"];?/g, (_m, clause: string) => {
        const decl: string[] = [];
        const named = /\{([^}]*)\}/.exec(clause);
        if (named) named[1].split(',').map((x) => x.trim()).filter(Boolean).forEach((p) => {
            const [a, b] = p.split(/\s+as\s+/).map((x) => x.trim());
            decl.push(`const ${b || a} = ${a === 'gsap' || a === 'default' ? 'window.gsap' : `(window.gsap[${JSON.stringify(a)}] || window[${JSON.stringify(a)}] || {})`};`);
        });
        const def = /^\s*([A-Za-z_$][\w$]*)\s*(,|$)/.exec(clause);
        if (def) decl.push(`const ${def[1]} = window.gsap;`);
        return decl.join(' ');
    });
    return out;
}
