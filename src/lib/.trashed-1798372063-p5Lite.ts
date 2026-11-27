// Built-in p5.js-compatible runtime (common drawing subset). Supports global mode (setup/draw on window)
// and instance mode (new p5(sketch)). Runs on requestAnimationFrame, which MRV drives with its virtual clock.
export const P5_LITE = `(function(){
if(window.p5)return;
var PI=Math.PI;
function Noise(){var p=[];for(var i=0;i<256;i++)p[i]=i;var s=1;function r(){s=(s*16807)%2147483647;return s/2147483647}
 this.seed=function(v){s=(v|0)%2147483646+1;for(var i=255;i>0;i--){var j=Math.floor(r()*(i+1));var t=p[i];p[i]=p[j];p[j]=t}this.perm=p.concat(p)};this.seed(1);
 function f(t){return t*t*t*(t*(t*6-15)+10)}function l(a,b,t){return a+t*(b-a)}function g(h,x,y,z){var u=h<8?x:y,v=h<4?y:h===12||h===14?x:z;return((h&1)?-u:u)+((h&2)?-v:v)}
 this.get=function(x,y,z){var P=this.perm;var X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);var u=f(x),v=f(y),w=f(z);
  var A=P[X]+Y,AA=P[A]+Z,AB=P[A+1]+Z,B=P[X+1]+Y,BA=P[B]+Z,BB=P[B+1]+Z;
  return(l(l(l(g(P[AA]&15,x,y,z),g(P[BA]&15,x-1,y,z),u),l(g(P[AB]&15,x,y-1,z),g(P[BB]&15,x-1,y-1,z),u),v),l(l(g(P[AA+1]&15,x,y,z-1),g(P[BA+1]&15,x-1,y,z-1),u),l(g(P[AB+1]&15,x,y-1,z-1),g(P[BB+1]&15,x-1,y-1,z-1),u),v),w)+1)/2}}
function Vec(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0}
Vec.prototype.set=function(x,y,z){if(x&&typeof x==='object'){this.x=x.x;this.y=x.y;this.z=x.z||0}else{this.x=x||0;this.y=y||0;this.z=z||0}return this};
(function(m){for(var k in m)Vec.prototype[k]=m[k]})({copy:function(){return new Vec(this.x,this.y,this.z)},
 add:function(x,y,z){if(x&&typeof x==='object'){this.x+=x.x;this.y+=x.y;this.z+=x.z||0}else{this.x+=x||0;this.y+=y||0;this.z+=z||0}return this},
 sub:function(x,y,z){if(x&&typeof x==='object'){this.x-=x.x;this.y-=x.y;this.z-=x.z||0}else{this.x-=x||0;this.y-=y||0;this.z-=z||0}return this},
 mult:function(s){this.x*=s;this.y*=s;this.z*=s;return this},div:function(s){this.x/=s;this.y/=s;this.z/=s;return this},mag:function(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)},magSq:function(){return this.x*this.x+this.y*this.y+this.z*this.z},
 normalize:function(){var m=this.mag();if(m)this.div(m);return this},setMag:function(n){return this.normalize().mult(n)},limit:function(n){var m=this.mag();if(m>n)this.setMag(n);return this},
 heading:function(){return Math.atan2(this.y,this.x)},rotate:function(a){var h=this.heading()+a,m=this.mag();this.x=Math.cos(h)*m;this.y=Math.sin(h)*m;return this},
 dist:function(v){return Math.sqrt(Math.pow(this.x-v.x,2)+Math.pow(this.y-v.y,2)+Math.pow(this.z-v.z,2))},dot:function(v){return this.x*v.x+this.y*v.y+this.z*v.z},
 lerp:function(v,a){this.x+=(v.x-this.x)*a;this.y+=(v.y-this.y)*a;this.z+=(v.z-this.z)*a;return this},array:function(){return[this.x,this.y,this.z]}});
Vec.fromAngle=function(a,l){l=l==null?1:l;return new Vec(Math.cos(a)*l,Math.sin(a)*l)};Vec.random2D=function(){return Vec.fromAngle(Math.random()*PI*2)};
Vec.add=function(a,b){return a.copy().add(b)};Vec.sub=function(a,b){return a.copy().sub(b)};Vec.mult=function(a,s){return a.copy().mult(s)};Vec.div=function(a,s){return a.copy().div(s)};Vec.dist=function(a,b){return a.dist(b)};Vec.lerp=function(a,b,t){return a.copy().lerp(b,t)};
function Color(r,g,b,a){this.levels=[r,g,b,a]}Object.defineProperty(Color.prototype,'toString',{value:function(){return 'rgba('+this.levels[0]+','+this.levels[1]+','+this.levels[2]+','+(this.levels[3]/255)+')'},writable:true,configurable:true});Color.prototype.setAlpha=function(a){this.levels[3]=a};
function P5(sketch,node){var P=this;var cv=null,c=null;var st={fill:'#ffffff',stroke:'#000000',doFill:true,doStroke:true,sw:1,rectMode:'corner',ellipseMode:'center',imageMode:'corner',textSize:12,textAlign:'left',textBase:'alphabetic',textFont:'sans-serif',textStyle:'normal',colorMode:'rgb',maxes:[255,255,255,255],angleMode:'radians'};
 var stack=[];var noise=new Noise();var nOct=4,nFall=0.5;var looping=true;var seedR=null;var shape=null;
 P.PI=PI;P.TWO_PI=PI*2;P.HALF_PI=PI/2;P.QUARTER_PI=PI/4;P.TAU=PI*2;P.CENTER='center';P.CORNER='corner';P.CORNERS='corners';P.RADIUS='radius';P.LEFT='left';P.RIGHT='right';P.TOP='top';P.BOTTOM='bottom';P.BASELINE='alphabetic';P.RGB='rgb';P.HSB='hsb';P.HSL='hsl';P.DEGREES='degrees';P.RADIANS='radians';P.CLOSE='close';P.ROUND='round';P.SQUARE='butt';P.PROJECT='square';P.MITER='miter';P.BEVEL='bevel';P.NORMAL='normal';P.BOLD='bold';P.ITALIC='italic';P.BLEND='source-over';P.ADD='lighter';P.MULTIPLY='multiply';P.SCREEN='screen';P.WEBGL='webgl';P.P2D='p2d';
 P.frameCount=0;P.width=100;P.height=100;P.mouseX=0;P.mouseY=0;P.pmouseX=0;P.pmouseY=0;P.mouseIsPressed=false;P.keyIsPressed=false;P.deltaTime=16.67;P.windowWidth=innerWidth;P.windowHeight=innerHeight;P.displayDensity=function(){return 1};P.pixelDensity=function(){return 1};
 var t0=null;P.millis=function(){return t0==null?0:performance.now()-t0};P.second=function(){return new Date().getSeconds()};P.minute=function(){return new Date().getMinutes()};P.hour=function(){return new Date().getHours()};
 function ang(a){return st.angleMode==='degrees'?a*PI/180:a}
 function hsb2rgb(h,s,v){h=(h%360+360)%360/60;s/=100;v/=100;var i=Math.floor(h),f=h-i,p=v*(1-s),q=v*(1-s*f),t=v*(1-s*(1-f));var r=[[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i%6];return[r[0]*255,r[1]*255,r[2]*255]}
 function hsl2rgb(h,s,l){s/=100;l/=100;var k=function(n){return(n+h/30)%12},a=s*Math.min(l,1-l),f=function(n){return l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)))};return[f(0)*255,f(8)*255,f(4)*255]}
 function col(args){var a=Array.prototype.slice.call(args);if(a[0] instanceof Color)return a[0].toString();if(Array.isArray(a[0]))a=a[0];if(typeof a[0]==='string'&&a.length===1)return a[0];
  if(typeof a[0]==='string'&&a.length===2){var tmp=document.createElement('canvas').getContext('2d');tmp.fillStyle=a[0];var s=tmp.fillStyle;var n=parseInt(s.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+(a[1]/st.maxes[3])+')'}
  var m=st.maxes,r,g,b,al;if(a.length<=2){r=g=b=a[0]/m[0]*255;al=a.length===2?a[1]/m[3]:1}else{var v=[a[0]/m[0],a[1]/m[1],a[2]/m[2]];al=a.length>3?a[3]/m[3]:1;
   if(st.colorMode==='hsb'){var x=hsb2rgb(v[0]*360,v[1]*100,v[2]*100);r=x[0];g=x[1];b=x[2]}else if(st.colorMode==='hsl'){var y=hsl2rgb(v[0]*360,v[1]*100,v[2]*100);r=y[0];g=y[1];b=y[2]}else{r=v[0]*255;g=v[1]*255;b=v[2]*255}}
  return 'rgba('+Math.round(r)+','+Math.round(g)+','+Math.round(b)+','+al+')'}
 P.color=function(){var s=col(arguments);var tmp=document.createElement('canvas').getContext('2d');tmp.fillStyle=s;var o=tmp.fillStyle;if(o[0]==='#'){var n=parseInt(o.slice(1),16);return new Color(n>>16&255,n>>8&255,n&255,255)}var mm=/rgba?\\(([^)]+)\\)/.exec(o);var p=mm?mm[1].split(',').map(parseFloat):[0,0,0,1];return new Color(p[0],p[1],p[2],(p[3]==null?1:p[3])*255)};
 P.red=function(c){return c.levels[0]};P.green=function(c){return c.levels[1]};P.blue=function(c){return c.levels[2]};P.alpha=function(c){return c.levels[3]};
 P.lerpColor=function(a,b,t){return new Color(a.levels[0]+(b.levels[0]-a.levels[0])*t,a.levels[1]+(b.levels[1]-a.levels[1])*t,a.levels[2]+(b.levels[2]-a.levels[2])*t,a.levels[3]+(b.levels[3]-a.levels[3])*t)};
 P.colorMode=function(m,a,b,cc,d){st.colorMode=m;if(a!=null){st.maxes=b==null?[a,a,a,a]:[a,b,cc,d==null?(m==='rgb'?255:1):d]}else st.maxes=m==='hsb'||m==='hsl'?[360,100,100,1]:[255,255,255,255]};
 P.createCanvas=function(w,h){if(!cv){cv=document.createElement('canvas');(node||document.body).appendChild(cv)}P.resizeCanvas(w,h);return{elt:cv,parent:function(){},position:function(){},style:function(){},id:function(){},class:function(){}}};
 P.resizeCanvas=function(w,h){P.width=w;P.height=h;cv.width=w;cv.height=h;cv.style.width=w+'px';cv.style.height=h+'px';c=cv.getContext('2d');P.drawingContext=c;apply()};
 P.noCanvas=function(){};P.windowResized=null;P.frameRate=function(){return 60};P.noLoop=function(){looping=false};P.loop=function(){looping=true};P.redraw=function(){frame()};P.isLooping=function(){return looping};
 function apply(){if(!c)return;c.fillStyle=st.fill;c.strokeStyle=st.stroke;c.lineWidth=st.sw;c.font=st.textStyle+' '+st.textSize+'px '+st.textFont;c.textAlign=st.textAlign;c.textBaseline=st.textBase}
 function paint(){if(st.doFill){c.fillStyle=st.fill;c.fill()}if(st.doStroke){c.strokeStyle=st.stroke;c.lineWidth=st.sw;c.stroke()}}
 P.background=function(){if(!c)return;c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.fillStyle=col(arguments);c.fillRect(0,0,cv.width,cv.height);c.restore()};
 P.clear=function(){c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);c.restore()};
 P.fill=function(){st.fill=col(arguments);st.doFill=true};P.noFill=function(){st.doFill=false};P.stroke=function(){st.stroke=col(arguments);st.doStroke=true};P.noStroke=function(){st.doStroke=false};
 P.strokeWeight=function(w){st.sw=w};P.strokeCap=function(m){c.lineCap=m};P.strokeJoin=function(m){c.lineJoin=m};P.blendMode=function(m){c.globalCompositeOperation=m};P.erase=function(){c.globalCompositeOperation='destination-out'};P.noErase=function(){c.globalCompositeOperation='source-over'};
 P.rectMode=function(m){st.rectMode=m};P.ellipseMode=function(m){st.ellipseMode=m};P.imageMode=function(m){st.imageMode=m};P.angleMode=function(m){st.angleMode=m};P.smooth=function(){};P.noSmooth=function(){};
 P.rect=function(x,y,w,h,r){h=h==null?w:h;if(st.rectMode==='center'){x-=w/2;y-=h/2}else if(st.rectMode==='corners'){w-=x;h-=y}else if(st.rectMode==='radius'){x-=w;y-=h;w*=2;h*=2}c.beginPath();if(r&&c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);paint()};
 P.square=function(x,y,s,r){P.rect(x,y,s,s,r)};
 P.ellipse=function(x,y,w,h){h=h==null?w:h;if(st.ellipseMode==='corner'){x+=w/2;y+=h/2}else if(st.ellipseMode==='radius'){w*=2;h*=2}else if(st.ellipseMode==='corners'){var cx=(x+w)/2,cy=(y+h)/2;w=Math.abs(w-x);h=Math.abs(h-y);x=cx;y=cy}c.beginPath();c.ellipse(x,y,Math.abs(w/2),Math.abs(h/2),0,0,PI*2);paint()};
 P.circle=function(x,y,d){P.ellipse(x,y,d,d)};
 P.arc=function(x,y,w,h,a,b,mode){c.beginPath();if(mode==='pie'){c.moveTo(x,y)}c.ellipse(x,y,w/2,h/2,0,ang(a),ang(b));if(mode==='pie'||mode==='chord')c.closePath();paint()};P.PIE='pie';P.CHORD='chord';P.OPEN='open';
 P.line=function(a,b,x,y){if(!st.doStroke)return;c.beginPath();c.moveTo(a,b);c.lineTo(x,y);c.strokeStyle=st.stroke;c.lineWidth=st.sw;c.stroke()};
 P.point=function(x,y){if(!st.doStroke)return;c.beginPath();c.arc(x,y,Math.max(st.sw/2,0.5),0,PI*2);c.fillStyle=st.stroke;c.fill()};
 P.triangle=function(a,b,cc,d,e,f){c.beginPath();c.moveTo(a,b);c.lineTo(cc,d);c.lineTo(e,f);c.closePath();paint()};
 P.quad=function(a,b,cc,d,e,f,g,h){c.beginPath();c.moveTo(a,b);c.lineTo(cc,d);c.lineTo(e,f);c.lineTo(g,h);c.closePath();paint()};
 P.bezier=function(a,b,cc,d,e,f,g,h){c.beginPath();c.moveTo(a,b);c.bezierCurveTo(cc,d,e,f,g,h);paint()};
 P.beginShape=function(k){shape={pts:[],kind:k}};P.vertex=function(x,y){shape.pts.push({x:x,y:y})};P.curveVertex=P.vertex;P.bezierVertex=function(a,b,cc,d,e,f){shape.pts.push({bz:[a,b,cc,d,e,f]})};P.quadraticVertex=function(a,b,cc,d){shape.pts.push({q:[a,b,cc,d]})};
 P.endShape=function(mode){if(!shape)return;var pts=shape.pts;c.beginPath();if(shape.kind==='points'){pts.forEach(function(p){P.point(p.x,p.y)});shape=null;return}
  pts.forEach(function(p,i){if(p.bz)c.bezierCurveTo.apply(c,p.bz);else if(p.q)c.quadraticCurveTo.apply(c,p.q);else if(i===0)c.moveTo(p.x,p.y);else c.lineTo(p.x,p.y)});if(mode==='close')c.closePath();paint();shape=null};P.POINTS='points';P.LINES='lines';P.TRIANGLES='triangles';
 P.push=function(){c.save();stack.push(Object.assign({},st))};P.pop=function(){c.restore();var s=stack.pop();if(s)st=s;apply()};
 P.translate=function(x,y){c.translate(x,y)};P.rotate=function(a){c.rotate(ang(a))};P.scale=function(x,y){c.scale(x,y==null?x:y)};P.shearX=function(a){c.transform(1,0,Math.tan(ang(a)),1,0,0)};P.shearY=function(a){c.transform(1,Math.tan(ang(a)),0,1,0,0)};P.resetMatrix=function(){c.setTransform(1,0,0,1,0,0)};P.applyMatrix=function(a,b,cc,d,e,f){c.transform(a,b,cc,d,e,f)};
 P.text=function(s,x,y){c.font=st.textStyle+' '+st.textSize+'px '+st.textFont;c.textAlign=st.textAlign;c.textBaseline=st.textBase;if(st.doFill){c.fillStyle=st.fill;c.fillText(String(s),x,y)}if(st.doStroke&&st.sw>1){c.strokeStyle=st.stroke;c.lineWidth=st.sw;c.strokeText(String(s),x,y)}};
 P.textSize=function(s){if(s==null)return st.textSize;st.textSize=s};P.textAlign=function(h,v){st.textAlign=h;if(v)st.textBase=v==='center'?'middle':v};P.textFont=function(f){st.textFont=typeof f==='string'?f:'sans-serif'};P.textStyle=function(s){st.textStyle=s};P.textWidth=function(s){c.font=st.textSize+'px '+st.textFont;return c.measureText(String(s)).width};P.textLeading=function(){};
 P.loadFont=function(){return 'sans-serif'};P.loadImage=function(src,cb){var img=new Image();img.src=src;var o={elt:img,width:0,height:0};img.onload=function(){o.width=img.width;o.height=img.height;cb&&cb(o)};return o};
 P.image=function(img,x,y,w,h){var el=img&&img.elt?img.elt:img&&img.canvas?img.canvas:img;if(!el)return;w=w==null?(img.width||el.width):w;h=h==null?(img.height||el.height):h;if(st.imageMode==='center'){x-=w/2;y-=h/2}try{c.drawImage(el,x,y,w,h)}catch(e){}};
 P.createGraphics=function(w,h){var g=new P5(null,document.createElement('div'));g.createCanvas(w,h);g.canvas=g.drawingContext.canvas;g.elt=g.canvas;return g};
 P.random=function(a,b){var r=seedR?seedR():Math.random();if(Array.isArray(a))return a[Math.floor(r*a.length)];if(a==null)return r;if(b==null)return r*a;return a+r*(b-a)};
 P.randomSeed=function(s){var x=(s|0)||1;seedR=function(){x=(x*16807)%2147483647;return (x-1)/2147483646}};
 P.randomGaussian=function(m,sd){var u=1-P.random(),v=P.random();return (m||0)+(sd==null?1:sd)*Math.sqrt(-2*Math.log(u))*Math.cos(2*PI*v)};
 P.noise=function(x,y,z){y=y||0;z=z||0;var r=0,amp=0.5,f=1,tot=0;for(var o=0;o<nOct;o++){r+=amp*noise.get(x*f,y*f,z*f);tot+=amp;amp*=nFall;f*=2}return r/tot};
 P.noiseSeed=function(s){noise.seed(s)};P.noiseDetail=function(o,f){nOct=o;if(f!=null)nFall=f};
 P.map=function(v,a,b,cc,d,within){var r=cc+(v-a)*(d-cc)/(b-a);if(within)r=cc<d?Math.max(cc,Math.min(d,r)):Math.max(d,Math.min(cc,r));return r};
 P.constrain=function(v,a,b){return Math.max(a,Math.min(b,v))};P.lerp=function(a,b,t){return a+(b-a)*t};P.dist=function(a,b,cc,d){return Math.sqrt((cc-a)*(cc-a)+(d-b)*(d-b))};P.mag=function(a,b){return Math.sqrt(a*a+b*b)};P.norm=function(v,a,b){return (v-a)/(b-a)};
 P.sq=function(x){return x*x};P.sqrt=Math.sqrt;P.pow=Math.pow;P.abs=Math.abs;P.floor=Math.floor;P.ceil=Math.ceil;P.round=function(v,d){if(!d)return Math.round(v);var f=Math.pow(10,d);return Math.round(v*f)/f};P.min=function(){return Math.min.apply(null,Array.isArray(arguments[0])?arguments[0]:arguments)};P.max=function(){return Math.max.apply(null,Array.isArray(arguments[0])?arguments[0]:arguments)};P.exp=Math.exp;P.log=Math.log;P.fract=function(x){return x-Math.floor(x)};
 P.sin=function(a){return Math.sin(ang(a))};P.cos=function(a){return Math.cos(ang(a))};P.tan=function(a){return Math.tan(ang(a))};P.asin=Math.asin;P.acos=Math.acos;P.atan=Math.atan;P.atan2=Math.atan2;P.radians=function(d){return d*PI/180};P.degrees=function(r){return r*180/PI};
 P.createVector=function(x,y,z){return new Vec(x,y,z)};P.int=function(v){return parseInt(v,10)};P.float=parseFloat;P.str=String;P.nf=function(n,l,r){var s=r!=null?Number(n).toFixed(r):String(n);return s};P.shuffle=function(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(P.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a};
 P.print=function(){console.log.apply(console,arguments)};P.cursor=function(){};P.noCursor=function(){};P.save=function(){};P.saveCanvas=function(){};P.keyIsDown=function(){return false};
 P.loadPixels=function(){var d=c.getImageData(0,0,cv.width,cv.height);P.pixels=d.data;P._img=d};P.updatePixels=function(){if(P._img)c.putImageData(P._img,0,0)};P.get=function(x,y){var d=c.getImageData(x,y,1,1).data;return[d[0],d[1],d[2],d[3]]};P.set=function(){};
 var user={};
 function call(n){var f=user[n];if(typeof f==='function')return f.call(P)}
 function frame(){if(t0==null)t0=performance.now();P.deltaTime=16.67;c&&c.save();call('draw');c&&c.restore();apply();P.frameCount++}
 function tick(){if(looping)frame();requestAnimationFrame(tick)}
 function start(){if(sketch&&typeof sketch==='function'){sketch(P);['preload','setup','draw','windowResized'].forEach(function(k){if(typeof P[k]==='function')user[k]=P[k]})}
  else{['preload','setup','draw','windowResized'].forEach(function(k){if(typeof window[k]==='function')user[k]=window[k]})}
  call('preload');call('setup');if(!cv)P.createCanvas(100,100);apply();t0=performance.now();if(user.draw)requestAnimationFrame(tick)}
 P._start=start;
 if(sketch!==null){if(document.readyState==='complete'||document.readyState==='interactive')setTimeout(start,0);else window.addEventListener('DOMContentLoaded',start)}
 P.Vector=Vec;}
P5.Vector=Vec;P5.Color=Color;
window.p5=P5;
// Global mode: expose the API on window once a global setup()/draw() exists.
window.__p5Global=function(){if(window.__p5Inst)return;var inst=new P5(null);window.__p5Inst=inst;
 for(var k in inst){(function(k){if(k[0]==='_')return;if(k==='setup'||k==='draw'||k==='preload')return;var v=inst[k];
  if(typeof v==='function'){window[k]=v.bind(inst)}else{try{Object.defineProperty(window,k,{get:function(){return inst[k]},configurable:true})}catch(e){}}})(k)}
 if(document.readyState==='complete'||document.readyState==='interactive')setTimeout(function(){inst._start()},0);else window.addEventListener('DOMContentLoaded',function(){inst._start()})};
})();`;

export function usesP5(all: string): boolean {
    return /\bcreateCanvas\s*\(|new\s+p5\s*\(|p5(\.min)?\.js|from\s+['"]p5['"]/.test(all);
}

/** Removes p5 CDN tags; when the code uses global mode, starts the global instance after user scripts run. */
export function rewriteP5(code: string): string {
    let out = code.replace(/<script[^>]+src=["'][^"']*\/p5[^"']*["'][^>]*>\s*<\/script>/gi, '');
    out = out.replace(/import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]p5['"];?/g, 'const $1 = window.p5;');
    return out;
}

export function p5NeedsGlobal(all: string): boolean {
    return usesP5(all) && !/new\s+p5\s*\(/.test(all) && /function\s+(setup|draw)\s*\(|(setup|draw)\s*=\s*(function|\()/.test(all);
}
