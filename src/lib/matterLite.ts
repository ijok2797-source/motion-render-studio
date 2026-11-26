// Built-in Matter.js-compatible 2D physics (common subset): Engine, World/Composite, Bodies (rectangle,
// circle, polygon, trapezoid), Body (setVelocity, applyForce, setPosition, setAngle, setStatic...),
// Events (beforeUpdate, afterUpdate, collisionStart), Runner and a canvas Render. Deterministic stepping.
export const MATTER_LITE = `(function(){
if(window.Matter)return;
var ID=1;
function V(x,y){return{x:x||0,y:y||0}}
var Vector={create:V,add:function(a,b){return V(a.x+b.x,a.y+b.y)},sub:function(a,b){return V(a.x-b.x,a.y-b.y)},mult:function(a,s){return V(a.x*s,a.y*s)},div:function(a,s){return V(a.x/s,a.y/s)},dot:function(a,b){return a.x*b.x+a.y*b.y},cross:function(a,b){return a.x*b.y-a.y*b.x},magnitude:function(a){return Math.sqrt(a.x*a.x+a.y*a.y)},normalise:function(a){var m=Math.sqrt(a.x*a.x+a.y*a.y)||1;return V(a.x/m,a.y/m)},rotate:function(a,ang){var c=Math.cos(ang),s=Math.sin(ang);return V(a.x*c-a.y*s,a.x*s+a.y*c)},perp:function(a){return V(-a.y,a.x)},neg:function(a){return V(-a.x,-a.y)},angle:function(a,b){return Math.atan2(b.y-a.y,b.x-a.x)},clone:function(a){return V(a.x,a.y)}};
var COLORS=['#f2aa4c','#e8508f','#4cc3f0','#2fb37a','#8fa5f0','#ff7a57','#c9a27a'];
function mkBody(o){var b={id:ID++,type:'body',label:o.label||'Body',position:V(o.position.x,o.position.y),velocity:V(0,0),angle:o.angle||0,angularVelocity:0,force:V(0,0),torque:0,
 isStatic:!!o.isStatic,isSensor:!!o.isSensor,restitution:o.restitution==null?0:o.restitution,friction:o.friction==null?0.1:o.friction,frictionAir:o.frictionAir==null?0.01:o.frictionAir,density:o.density||0.001,
 local:o.local,circleRadius:o.circleRadius||0,render:Object.assign({visible:true,fillStyle:COLORS[(ID)%COLORS.length],strokeStyle:'transparent',lineWidth:0,opacity:1},o.render||{}),
 collisionFilter:Object.assign({group:0,category:1,mask:0xFFFFFFFF},o.collisionFilter||{}),plugin:o.plugin||{},chamfer:o.chamfer||null,parts:[],isSleeping:false,speed:0,angularSpeed:0,inertia:0,mass:0};
 b.parts=[b];
 var area=b.circleRadius?Math.PI*b.circleRadius*b.circleRadius:polyArea(b.local);b.area=area;b.mass=o.mass||area*b.density;b.inverseMass=b.isStatic?0:1/b.mass;
 var r=b.circleRadius||maxR(b.local);b.inertia=b.mass*r*r/2;b.inverseInertia=b.isStatic?0:1/b.inertia;
 if(o.inertia===Infinity){b.inertia=Infinity;b.inverseInertia=0}
 updVerts(b);return b}
function polyArea(vs){var a=0;for(var i=0;i<vs.length;i++){var j=(i+1)%vs.length;a+=vs[i].x*vs[j].y-vs[j].x*vs[i].y}return Math.abs(a)/2}
function maxR(vs){var m=0;vs.forEach(function(v){m=Math.max(m,Math.sqrt(v.x*v.x+v.y*v.y))});return m}
function updVerts(b){if(b.circleRadius){var r=b.circleRadius;b.vertices=[];for(var i=0;i<16;i++){var a=i/16*Math.PI*2;b.vertices.push(V(b.position.x+Math.cos(a)*r,b.position.y+Math.sin(a)*r))}}
 else b.vertices=b.local.map(function(v){var p=Vector.rotate(v,b.angle);return V(p.x+b.position.x,p.y+b.position.y)});
 var mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;b.vertices.forEach(function(v){mnx=Math.min(mnx,v.x);mny=Math.min(mny,v.y);mxx=Math.max(mxx,v.x);mxy=Math.max(mxy,v.y)});b.bounds={min:V(mnx,mny),max:V(mxx,mxy)}}
var Bodies={
 rectangle:function(x,y,w,h,o){o=o||{};return mkBody(Object.assign({},o,{label:o.label||'Rectangle Body',position:V(x,y),local:[V(-w/2,-h/2),V(w/2,-h/2),V(w/2,h/2),V(-w/2,h/2)]}))},
 circle:function(x,y,r,o){o=o||{};return mkBody(Object.assign({},o,{label:o.label||'Circle Body',position:V(x,y),circleRadius:r,local:[]}))},
 polygon:function(x,y,sides,r,o){o=o||{};sides=Math.max(3,sides|0);var vs=[];for(var i=0;i<sides;i++){var a=-Math.PI/2+i/sides*Math.PI*2+Math.PI/sides;vs.push(V(Math.cos(a)*r,Math.sin(a)*r))}return mkBody(Object.assign({},o,{label:o.label||'Polygon Body',position:V(x,y),local:vs}))},
 trapezoid:function(x,y,w,h,slope,o){o=o||{};var s=slope*w/2;return mkBody(Object.assign({},o,{label:'Trapezoid Body',position:V(x,y),local:[V(-w/2+s,-h/2),V(w/2-s,-h/2),V(w/2,h/2),V(-w/2,h/2)]}))},
 fromVertices:function(x,y,sets,o){var vs=(Array.isArray(sets[0])?sets[0]:sets).map(function(v){return V(v.x,v.y)});var cx=0,cy=0;vs.forEach(function(v){cx+=v.x;cy+=v.y});cx/=vs.length;cy/=vs.length;return mkBody(Object.assign({},o||{},{position:V(x,y),local:vs.map(function(v){return V(v.x-cx,v.y-cy)})}))}
};
var Body={
 setVelocity:function(b,v){b.velocity=V(v.x,v.y)},setAngularVelocity:function(b,v){b.angularVelocity=v},
 setPosition:function(b,p){b.position=V(p.x,p.y);updVerts(b)},setAngle:function(b,a){b.angle=a;updVerts(b)},
 translate:function(b,d){b.position=Vector.add(b.position,d);updVerts(b)},rotate:function(b,a){b.angle+=a;updVerts(b)},
 applyForce:function(b,p,f){b.force=Vector.add(b.force,f);var r=Vector.sub(p,b.position);b.torque+=Vector.cross(r,f)},
 setStatic:function(b,s){b.isStatic=s;b.inverseMass=s?0:1/b.mass;b.inverseInertia=s?0:1/b.inertia;if(s){b.velocity=V(0,0);b.angularVelocity=0}},
 setMass:function(b,m){b.mass=m;b.inverseMass=b.isStatic?0:1/m},setDensity:function(b,d){b.density=d;Body.setMass(b,b.area*d)},
 setInertia:function(b,i){b.inertia=i;b.inverseInertia=i===Infinity||b.isStatic?0:1/i},
 scale:function(b,sx,sy){if(b.circleRadius)b.circleRadius*=sx;else b.local=b.local.map(function(v){return V(v.x*sx,v.y*sy)});updVerts(b)},
 set:function(b,k,v){if(typeof k==='object'){for(var x in k)Body.set(b,x,k[x]);return}if(k==='position')Body.setPosition(b,v);else if(k==='angle')Body.setAngle(b,v);else if(k==='velocity')Body.setVelocity(b,v);else if(k==='isStatic')Body.setStatic(b,v);else b[k]=v},
 setSpeed:function(b,s){var n=Vector.normalise(b.velocity);b.velocity=Vector.mult(n,s)},getVelocity:function(b){return b.velocity},getSpeed:function(b){return Vector.magnitude(b.velocity)}
};
function Comp(o){return Object.assign({id:ID++,type:'composite',label:'Composite',bodies:[],composites:[],constraints:[]},o||{})}
function allBodies(c){var out=c.bodies.slice();c.composites.forEach(function(x){out=out.concat(allBodies(x))});return out}
var Composite={create:Comp,add:function(c,o){(Array.isArray(o)?o:[o]).forEach(function(x){if(!x)return;if(x.type==='body')c.bodies.push(x);else if(x.type==='composite')c.composites.push(x);else if(x.type==='constraint')c.constraints.push(x)});return c},
 remove:function(c,o){(Array.isArray(o)?o:[o]).forEach(function(x){c.bodies=c.bodies.filter(function(b){return b!==x});c.composites=c.composites.filter(function(b){return b!==x});c.constraints=c.constraints.filter(function(b){return b!==x})});return c},
 allBodies:allBodies,allConstraints:function(c){var o=c.constraints.slice();c.composites.forEach(function(x){o=o.concat(Composite.allConstraints(x))});return o},clear:function(c,keepStatic){c.bodies=keepStatic?c.bodies.filter(function(b){return b.isStatic}):[];c.composites=[];c.constraints=[]}};
var World={create:Comp,add:Composite.add,remove:Composite.remove,clear:Composite.clear};
var Composites={stack:function(x,y,cols,rows,cg,rg,cb){var c=Comp({label:'Stack'});var px=x,py=y,last=null;for(var r=0;r<rows;r++){var mh=0;for(var i=0;i<cols;i++){var b=cb(px,py,i,r,last,i+r*cols);if(b){var bh=b.bounds.max.y-b.bounds.min.y,bw=b.bounds.max.x-b.bounds.min.x;if(bh>mh)mh=bh;Body.translate(b,V(bw/2,bh/2));px=b.bounds.max.x+cg;c.bodies.push(b);last=b}else px+=cg}py+=mh+rg;px=x}return c},
 pyramid:function(x,y,cols,rows,cg,rg,cb){var c=Comp({label:'Pyramid'});for(var r=0;r<rows;r++){var n=cols-r*2;if(n<=0)break;for(var i=0;i<n;i++){var b=cb(x,y,i,r);if(!b)continue;var bw=b.bounds.max.x-b.bounds.min.x,bh=b.bounds.max.y-b.bounds.min.y;Body.setPosition(b,V(x+(r*(bw+cg))+i*(bw+cg)+bw/2,y-(r*(bh+rg))+bh/2));c.bodies.push(b)}}return c}};
function Constraint(o){var c=Object.assign({id:ID++,type:'constraint',label:'Constraint',stiffness:o.length===0?1:0.7,damping:0,pointA:V(0,0),pointB:V(0,0),render:{visible:true,strokeStyle:'#888',lineWidth:2}},o||{});
 var pa=c.bodyA?Vector.add(c.bodyA.position,c.pointA):c.pointA,pb=c.bodyB?Vector.add(c.bodyB.position,c.pointB):c.pointB;if(c.length==null)c.length=Vector.magnitude(Vector.sub(pa,pb));return c}
var Events={on:function(o,n,f){o.events=o.events||{};n.split(' ').forEach(function(x){(o.events[x]=o.events[x]||[]).push(f)})},off:function(o,n,f){if(!o.events)return;if(!n){o.events={};return}n.split(' ').forEach(function(x){o.events[x]=(o.events[x]||[]).filter(function(g){return f&&g!==f})})},trigger:function(o,n,e){var l=o.events&&o.events[n];if(l)l.slice().forEach(function(f){f(Object.assign({name:n,source:o},e||{}))})}};
function axes(b){if(b.circleRadius)return[];var vs=b.vertices,o=[];for(var i=0;i<vs.length;i++){var j=(i+1)%vs.length;o.push(Vector.normalise(Vector.perp(Vector.sub(vs[j],vs[i]))))}return o}
function proj(b,ax){if(b.circleRadius){var c=Vector.dot(b.position,ax);return[c-b.circleRadius,c+b.circleRadius]}var mn=1e9,mx=-1e9;b.vertices.forEach(function(v){var d=Vector.dot(v,ax);mn=Math.min(mn,d);mx=Math.max(mx,d)});return[mn,mx]}
function collide(a,b){if(a.bounds.max.x<b.bounds.min.x||b.bounds.max.x<a.bounds.min.x||a.bounds.max.y<b.bounds.min.y||b.bounds.max.y<a.bounds.min.y)return null;
 if(a.circleRadius&&b.circleRadius){var d=Vector.sub(b.position,a.position),dist=Vector.magnitude(d),rs=a.circleRadius+b.circleRadius;if(dist>=rs)return null;var n=dist?Vector.div(d,dist):V(0,1);return{normal:n,depth:rs-dist}}
 var list=axes(a).concat(axes(b));var circ=a.circleRadius?a:b.circleRadius?b:null;if(circ){var poly=circ===a?b:a;var best=null,bd=1e9;poly.vertices.forEach(function(v){var dd=Vector.magnitude(Vector.sub(v,circ.position));if(dd<bd){bd=dd;best=v}});list.push(Vector.normalise(Vector.sub(best,circ.position)))}
 var minD=1e9,minN=null;for(var i=0;i<list.length;i++){var ax=list[i];var pa=proj(a,ax),pb=proj(b,ax);var o=Math.min(pa[1],pb[1])-Math.max(pa[0],pb[0]);if(o<=0)return null;if(o<minD){minD=o;minN=ax}}
 if(Vector.dot(minN,Vector.sub(b.position,a.position))<0)minN=Vector.neg(minN);return{normal:minN,depth:minD}}
function canCollide(a,b){var fa=a.collisionFilter,fb=b.collisionFilter;if(fa.group===fb.group&&fa.group!==0)return fa.group>0;return (fa.mask&fb.category)!==0&&(fb.mask&fa.category)!==0}
var Engine={create:function(o){o=o||{};var e={world:o.world||Comp({label:'World'}),gravity:Object.assign({x:0,y:1,scale:0.001},o.gravity||{}),timing:{timestamp:0,timeScale:1,lastDelta:16.666},positionIterations:o.positionIterations||6,velocityIterations:o.velocityIterations||4,enableSleeping:!!o.enableSleeping,pairs:{list:[]},events:{}};e.world.gravity=e.gravity;return e},
 update:function(e,delta){delta=(delta||1000/60)*e.timing.timeScale;var dt=delta;var bodies=allBodies(e.world);var g=e.gravity;
  Events.trigger(e,'beforeUpdate',{timestamp:e.timing.timestamp,delta:delta});
  var k=dt/16.666;bodies.forEach(function(b){if(b.isStatic||b.isSleeping)return;var fa=Math.pow(1-b.frictionAir,k);
   // Matter's units: velocity is px per 16.67ms step, gravity accel = gravity * scale * (16.67ms)^2 per step^2
   b.velocity.x=b.velocity.x*fa+(b.force.x*b.inverseMass+g.x*g.scale)*16.666*16.666*k;
   b.velocity.y=b.velocity.y*fa+(b.force.y*b.inverseMass+g.y*g.scale)*16.666*16.666*k;
   b.angularVelocity=b.angularVelocity*fa+b.torque*b.inverseInertia*16.666*16.666*k;
   b.position.x+=b.velocity.x*k;b.position.y+=b.velocity.y*k;b.angle+=b.angularVelocity*k;updVerts(b)});
  Composite.allConstraints(e.world).forEach(function(c){var pa=c.bodyA?Vector.add(c.bodyA.position,Vector.rotate(c.pointA,c.bodyA.angle)):c.pointA,pb=c.bodyB?Vector.add(c.bodyB.position,Vector.rotate(c.pointB,c.bodyB.angle)):c.pointB;
   var d=Vector.sub(pb,pa),len=Vector.magnitude(d)||1e-6;var diff=(len-c.length)/len*c.stiffness;var ia=c.bodyA?c.bodyA.inverseMass:0,ib=c.bodyB?c.bodyB.inverseMass:0;var tot=ia+ib;if(!tot)return;var corr=Vector.mult(d,diff/tot*0.5);
   if(c.bodyA&&ia){c.bodyA.position=Vector.add(c.bodyA.position,Vector.mult(corr,ia));c.bodyA.velocity=Vector.add(c.bodyA.velocity,Vector.mult(corr,ia*0.5));updVerts(c.bodyA)}
   if(c.bodyB&&ib){c.bodyB.position=Vector.sub(c.bodyB.position,Vector.mult(corr,ib));c.bodyB.velocity=Vector.sub(c.bodyB.velocity,Vector.mult(corr,ib*0.5));updVerts(c.bodyB)}});
  var pairs=[];for(var it=0;it<e.positionIterations/2;it++){for(var i=0;i<bodies.length;i++)for(var j=i+1;j<bodies.length;j++){var a=bodies[i],b=bodies[j];if(a.isStatic&&b.isStatic)continue;if(!canCollide(a,b))continue;var c=collide(a,b);if(!c)continue;if(it===0)pairs.push({bodyA:a,bodyB:b,collision:c,isSensor:a.isSensor||b.isSensor});if(a.isSensor||b.isSensor)continue;
   var n=c.normal,tot=a.inverseMass+b.inverseMass;if(!tot)continue;var corr=Vector.mult(n,Math.max(c.depth-0.05,0)/tot*0.8);
   a.position=Vector.sub(a.position,Vector.mult(corr,a.inverseMass));b.position=Vector.add(b.position,Vector.mult(corr,b.inverseMass));updVerts(a);updVerts(b);
   if(it>0)continue;var rv=Vector.sub(b.velocity,a.velocity);var vn=Vector.dot(rv,n);if(vn>0)continue;var rest=Math.max(a.restitution,b.restitution);var jn=-(1+rest)*vn/tot;var imp=Vector.mult(n,jn);
   a.velocity=Vector.sub(a.velocity,Vector.mult(imp,a.inverseMass));b.velocity=Vector.add(b.velocity,Vector.mult(imp,b.inverseMass));
   var t=Vector.sub(rv,Vector.mult(n,vn));var tl=Vector.magnitude(t);if(tl>1e-6){t=Vector.div(t,tl);var fr=Math.sqrt(a.friction*b.friction);var jt=Math.min(tl/tot,fr*jn);var fi=Vector.mult(t,jt);a.velocity=Vector.add(a.velocity,Vector.mult(fi,a.inverseMass));b.velocity=Vector.sub(b.velocity,Vector.mult(fi,b.inverseMass));
    var spin=jt*0.02;if(a.inverseInertia)a.angularVelocity+=Vector.cross(n,t)*spin*a.inverseMass*(a.circleRadius?1:0.5);if(b.inverseInertia)b.angularVelocity-=Vector.cross(n,t)*spin*b.inverseMass*(b.circleRadius?1:0.5)}}}
  bodies.forEach(function(b){b.force=V(0,0);b.torque=0;b.speed=Vector.magnitude(b.velocity);b.angularSpeed=Math.abs(b.angularVelocity)});
  var prev=e.pairs.list;e.pairs.list=pairs;var started=pairs.filter(function(p){return !prev.some(function(q){return q.bodyA===p.bodyA&&q.bodyB===p.bodyB})});
  if(started.length){Events.trigger(e,'collisionStart',{pairs:started});started.forEach(function(p){Events.trigger(p.bodyA,'collisionStart',{pairs:[p]});Events.trigger(p.bodyB,'collisionStart',{pairs:[p]})})}
  if(pairs.length)Events.trigger(e,'collisionActive',{pairs:pairs});
  e.timing.timestamp+=delta;e.timing.lastDelta=delta;Events.trigger(e,'afterUpdate',{timestamp:e.timing.timestamp,delta:delta});return e},
 run:function(e){return Runner.run(Runner.create(),e)},clear:function(e){Composite.clear(e.world)}};
var Runner={create:function(o){return Object.assign({delta:1000/60,enabled:true,isFixed:true},o||{})},
 run:function(r,e){if(!e){e=r;r=Runner.create()}var last=null;function tick(t){if(!r.enabled){requestAnimationFrame(tick);return}if(last==null)last=t;var acc=t-last;last=t;r._acc=(r._acc||0)+Math.min(acc,100);var n=0;while(r._acc>=r.delta&&n<8){Events.trigger(r,'beforeTick',{});Engine.update(e,r.delta);Events.trigger(r,'afterTick',{});r._acc-=r.delta;n++}requestAnimationFrame(tick)}requestAnimationFrame(tick);return r},
 stop:function(r){r.enabled=false},start:function(r,e){return Runner.run(r,e)}};
var Render={create:function(o){var opt=Object.assign({width:800,height:600,background:'#14151a',wireframes:true,showAngleIndicator:false,pixelRatio:1},o.options||{});var canvas=o.canvas||document.createElement('canvas');
 canvas.width=opt.width*opt.pixelRatio;canvas.height=opt.height*opt.pixelRatio;canvas.style.width=opt.width+'px';canvas.style.height=opt.height+'px';if(!o.canvas&&o.element)o.element.appendChild(canvas);
 return{canvas:canvas,context:canvas.getContext('2d'),engine:o.engine,options:opt,bounds:{min:V(0,0),max:V(opt.width,opt.height)},events:{}}},
 run:function(r){function loop(){Render.world(r);requestAnimationFrame(loop)}requestAnimationFrame(loop)},stop:function(){},
 setPixelRatio:function(r,p){r.options.pixelRatio=p==='auto'?1:p;r.canvas.width=r.options.width*r.options.pixelRatio;r.canvas.height=r.options.height*r.options.pixelRatio},
 lookAt:function(){},
 world:function(r){var c=r.context,o=r.options,pr=o.pixelRatio;c.setTransform(pr,0,0,pr,0,0);if(o.background&&o.background!=='transparent'){c.fillStyle=o.background;c.fillRect(0,0,o.width,o.height)}else c.clearRect(0,0,o.width,o.height);
  Events.trigger(r,'beforeRender',{});
  allBodies(r.engine.world).forEach(function(b){if(!b.render.visible)return;c.globalAlpha=b.render.opacity;c.beginPath();
   if(b.circleRadius){c.arc(b.position.x,b.position.y,b.circleRadius,0,Math.PI*2)}else{b.vertices.forEach(function(v,i){i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y)});c.closePath()}
   if(o.wireframes){c.strokeStyle='#bbb';c.lineWidth=1;c.stroke()}else{c.fillStyle=b.render.fillStyle;c.fill();if(b.render.lineWidth){c.strokeStyle=b.render.strokeStyle;c.lineWidth=b.render.lineWidth;c.stroke()}}
   if(o.showAngleIndicator&&b.circleRadius){c.beginPath();c.moveTo(b.position.x,b.position.y);c.lineTo(b.position.x+Math.cos(b.angle)*b.circleRadius,b.position.y+Math.sin(b.angle)*b.circleRadius);c.strokeStyle='rgba(255,255,255,.6)';c.stroke()}c.globalAlpha=1});
  Composite.allConstraints(r.engine.world).forEach(function(k){if(!k.render.visible)return;var pa=k.bodyA?Vector.add(k.bodyA.position,k.pointA):k.pointA,pb=k.bodyB?Vector.add(k.bodyB.position,k.pointB):k.pointB;c.beginPath();c.moveTo(pa.x,pa.y);c.lineTo(pb.x,pb.y);c.strokeStyle=k.render.strokeStyle;c.lineWidth=k.render.lineWidth;c.stroke()});
  Events.trigger(r,'afterRender',{})}};
var Common={random:function(a,b){a=a||0;b=b==null?1:b;return a+Math.random()*(b-a)},choose:function(a){return a[Math.floor(Math.random()*a.length)]},clamp:function(v,a,b){return Math.max(a,Math.min(b,v))},setDecomp:function(){}};
var Mouse={create:function(el){return{element:el,position:V(0,0)}},setScale:function(){},setOffset:function(){}};
var MouseConstraint={create:function(e,o){return Object.assign({type:'mouseConstraint',mouse:(o||{}).mouse,constraint:Constraint({pointA:V(0,0),pointB:V(0,0),length:0,stiffness:0.1,render:{visible:false}}),body:null,events:{}},o||{})}};
window.Matter={Engine:Engine,World:World,Composite:Composite,Composites:Composites,Bodies:Bodies,Body:Body,Constraint:{create:Constraint},Events:Events,Runner:Runner,Render:Render,Vector:Vector,Common:Common,Mouse:Mouse,MouseConstraint:MouseConstraint,Vertices:{create:function(p){return p}},Query:{point:function(bodies,p){return bodies.filter(function(b){return p.x>=b.bounds.min.x&&p.x<=b.bounds.max.x&&p.y>=b.bounds.min.y&&p.y<=b.bounds.max.y})}},version:'mrv-lite'};
})();`;

export function usesMatter(all: string): boolean {
    return /\bMatter\.(Engine|Bodies|World|Composite|Runner|Render)|matter-js|matter(\.min)?\.js/.test(all);
}

export function rewriteMatter(code: string): string {
    let out = code.replace(/<script[^>]+src=["'][^"']*matter[^"']*["'][^>]*>\s*<\/script>/gi, '');
    out = out.replace(/import\s+([\s\S]*?)\s+from\s+['"]matter-js['"];?/g, (_m, clause: string) => {
        const decl: string[] = [];
        const named = /\{([^}]*)\}/.exec(clause);
        if (named) {
            const parts = named[1].split(',').map((x) => x.trim()).filter(Boolean).map((p) => { const [a, b] = p.split(/\s+as\s+/).map((x) => x.trim()); return b ? `${a}: ${b}` : a; });
            decl.push(`const { ${parts.join(', ')} } = window.Matter;`);
        }
        const def = /^\s*([A-Za-z_$][\w$]*)\s*(,|$)/.exec(clause);
        if (def) decl.push(`const ${def[1]} = window.Matter;`);
        const ns = /\*\s+as\s+([A-Za-z_$][\w$]*)/.exec(clause);
        if (ns) decl.push(`const ${ns[1]} = window.Matter;`);
        return decl.join(' ');
    });
    return out;
}
