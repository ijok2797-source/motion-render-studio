// Built-in physics for the render frame: a compact subset of the cannon-es API.
// Supports World, Body (sphere, box, plane), gravity, mass, restitution, friction,
// linear/angular damping, sphere-sphere / sphere-box / sphere-plane / box-plane / box-box (approx) collisions,
// applyForce/applyImpulse, sleep, and fixedStep/step. Deterministic, so every render frame matches.
export const CANNON_LITE = `(function(){
if(window.CANNON)return;
function V(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0}
V.prototype.set=function(x,y,z){this.x=x;this.y=y;this.z=z;return this};
V.prototype.copy=function(v){this.x=v.x;this.y=v.y;this.z=v.z;return this};
V.prototype.clone=function(){return new V(this.x,this.y,this.z)};
V.prototype.vadd=function(v,t){t=t||new V();return t.set(this.x+v.x,this.y+v.y,this.z+v.z)};
V.prototype.vsub=function(v,t){t=t||new V();return t.set(this.x-v.x,this.y-v.y,this.z-v.z)};
V.prototype.scale=function(s,t){t=t||new V();return t.set(this.x*s,this.y*s,this.z*s)};
V.prototype.dot=function(v){return this.x*v.x+this.y*v.y+this.z*v.z};
V.prototype.cross=function(v,t){t=t||new V();return t.set(this.y*v.z-this.z*v.y,this.z*v.x-this.x*v.z,this.x*v.y-this.y*v.x)};
V.prototype.length=function(){return Math.sqrt(this.dot(this))};V.prototype.norm=V.prototype.length;
V.prototype.normalize=function(){var l=this.length()||1;this.x/=l;this.y/=l;this.z/=l;return l};
V.prototype.unit=function(t){t=t||new V();var l=this.length()||1;return t.set(this.x/l,this.y/l,this.z/l)};
V.prototype.negate=function(t){t=t||new V();return t.set(-this.x,-this.y,-this.z)};
V.prototype.distanceTo=function(v){return this.vsub(v).length()};
V.prototype.lengthSquared=function(){return this.dot(this)};
V.prototype.setZero=function(){return this.set(0,0,0)};
V.prototype.addScaledVector=function(s,v,t){t=t||new V();return t.set(this.x+v.x*s,this.y+v.y*s,this.z+v.z*s)};
V.prototype.almostZero=function(e){e=e||1e-6;return Math.abs(this.x)<e&&Math.abs(this.y)<e&&Math.abs(this.z)<e};
V.prototype.toArray=function(){return[this.x,this.y,this.z]};
function Q(x,y,z,w){this.x=x||0;this.y=y||0;this.z=z||0;this.w=w==null?1:w}
Q.prototype.set=function(x,y,z,w){this.x=x;this.y=y;this.z=z;this.w=w;return this};
Q.prototype.copy=function(q){return this.set(q.x,q.y,q.z,q.w)};
Q.prototype.clone=function(){return new Q(this.x,this.y,this.z,this.w)};
Q.prototype.setFromAxisAngle=function(a,ang){var s=Math.sin(ang/2);return this.set(a.x*s,a.y*s,a.z*s,Math.cos(ang/2))};
Q.prototype.setFromEuler=function(x,y,z){var c1=Math.cos(x/2),c2=Math.cos(y/2),c3=Math.cos(z/2),s1=Math.sin(x/2),s2=Math.sin(y/2),s3=Math.sin(z/2);return this.set(s1*c2*c3+c1*s2*s3,c1*s2*c3-s1*c2*s3,c1*c2*s3+s1*s2*c3,c1*c2*c3-s1*s2*s3)};
Q.prototype.mult=function(q,t){t=t||new Q();var ax=this.x,ay=this.y,az=this.z,aw=this.w,bx=q.x,by=q.y,bz=q.z,bw=q.w;return t.set(aw*bx+ax*bw+ay*bz-az*by,aw*by+ay*bw+az*bx-ax*bz,aw*bz+az*bw+ax*by-ay*bx,aw*bw-ax*bx-ay*by-az*bz)};
Q.prototype.normalize=function(){var l=Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)||1;this.x/=l;this.y/=l;this.z/=l;this.w/=l;return this};
Q.prototype.vmult=function(v,t){t=t||new V();var x=v.x,y=v.y,z=v.z,qx=this.x,qy=this.y,qz=this.z,qw=this.w;var ix=qw*x+qy*z-qz*y,iy=qw*y+qz*x-qx*z,iz=qw*z+qx*y-qy*x,iw=-qx*x-qy*y-qz*z;return t.set(ix*qw+iw*-qx+iy*-qz-iz*-qy,iy*qw+iw*-qy+iz*-qx-ix*-qz,iz*qw+iw*-qz+ix*-qy-iy*-qx)};
Q.prototype.conjugate=function(t){t=t||new Q();return t.set(-this.x,-this.y,-this.z,this.w)};
Q.prototype.toEuler=function(t){var x=this.x,y=this.y,z=this.z,w=this.w;t.x=Math.atan2(2*(w*x+y*z),1-2*(x*x+y*y));var s=2*(w*y-z*x);t.y=Math.abs(s)>=1?Math.sign(s)*Math.PI/2:Math.asin(s);t.z=Math.atan2(2*(w*z+x*y),1-2*(y*y+z*z));return t};
Q.prototype.integrate=function(av,dt,af,t){t=t||new Q();var hx=av.x*dt/2,hy=av.y*dt/2,hz=av.z*dt/2;var x=this.x,y=this.y,z=this.z,w=this.w;t.set(x+(hx*w+hy*z-hz*y),y+(hy*w+hz*x-hx*z),z+(hz*w+hx*y-hy*x),w+(-hx*x-hy*y-hz*z));return t.normalize()};
function Sphere(r){this.type=1;this.radius=r||1}
function Box(he){this.type=4;this.halfExtents=he||new V(.5,.5,.5)}
function Plane(){this.type=2}
function Cylinder(rt,rb,h){this.type=16;this.radius=Math.max(rt||1,rb||1);this.halfHeight=(h||1)/2}
function Material(o){if(typeof o==='string')o={name:o};o=o||{};this.name=o.name||'';this.friction=o.friction==null?-1:o.friction;this.restitution=o.restitution==null?-1:o.restitution}
function ContactMaterial(a,b,o){o=o||{};this.materials=[a,b];this.friction=o.friction==null?0.3:o.friction;this.restitution=o.restitution==null?0.3:o.restitution}
var BID=0;
function Body(o){o=o||{};this.id=BID++;this.mass=o.mass||0;this.invMass=this.mass>0?1/this.mass:0;this.type=this.mass>0?1:2;if(o.type!=null){this.type=o.type;if(o.type!==1){this.invMass=0}}
 this.position=o.position?new V().copy(o.position):new V();this.velocity=o.velocity?new V().copy(o.velocity):new V();this.angularVelocity=o.angularVelocity?new V().copy(o.angularVelocity):new V();
 this.quaternion=o.quaternion?new Q().copy(o.quaternion):new Q();this.force=new V();this.torque=new V();this.linearDamping=o.linearDamping==null?0.01:o.linearDamping;this.angularDamping=o.angularDamping==null?0.01:o.angularDamping;
 this.material=o.material||null;this.shapes=[];this.shapeOffsets=[];this.fixedRotation=!!o.fixedRotation;this.allowSleep=o.allowSleep!==false;this.sleepState=0;this.collisionResponse=o.collisionResponse!==false;this._listeners={};this.world=null;this.previousPosition=this.position.clone();this.interpolatedPosition=this.position.clone();this.interpolatedQuaternion=this.quaternion.clone();
 if(o.shape)this.addShape(o.shape)}
Body.DYNAMIC=1;Body.STATIC=2;Body.KINEMATIC=4;
Body.prototype.addShape=function(s,off){this.shapes.push(s);this.shapeOffsets.push(off?new V().copy(off):new V());return this};
Body.prototype.applyForce=function(f,p){this.force.vadd(f,this.force);if(p){var r=p.vsub?p:new V();this.torque.vadd(r.cross(f),this.torque)}};
Body.prototype.applyImpulse=function(i,p){if(!this.invMass)return;this.velocity.vadd(i.scale(this.invMass),this.velocity);if(p){var r=p;this.angularVelocity.vadd(r.cross(i).scale(this.invMass*2),this.angularVelocity)}this.wakeUp()};
Body.prototype.applyLocalForce=function(f,p){this.applyForce(this.quaternion.vmult(f),p&&this.quaternion.vmult(p))};
Body.prototype.applyLocalImpulse=function(i,p){this.applyImpulse(this.quaternion.vmult(i),p&&this.quaternion.vmult(p))};
Body.prototype.applyTorque=function(t){this.torque.vadd(t,this.torque)};
Body.prototype.wakeUp=function(){this.sleepState=0};Body.prototype.sleep=function(){this.sleepState=2};
Body.prototype.updateMassProperties=function(){this.invMass=this.mass>0&&this.type===1?1/this.mass:0};
Body.prototype.addEventListener=function(t,f){(this._listeners[t]=this._listeners[t]||[]).push(f)};
Body.prototype.removeEventListener=function(t,f){var l=this._listeners[t];if(l)this._listeners[t]=l.filter(function(x){return x!==f})};
Body.prototype._emit=function(t,e){var l=this._listeners[t];if(l)l.forEach(function(f){f(e)})};
function radius(b){var s=b.shapes[0];if(!s)return 0;if(s.type===1)return s.radius;if(s.type===4)return s.halfExtents.length();if(s.type===16)return Math.sqrt(s.radius*s.radius+s.halfHeight*s.halfHeight);return 0}
function World(o){o=o||{};this.gravity=o.gravity?new V().copy(o.gravity):new V();this.bodies=[];this.time=0;this.stepnumber=0;this.defaultContactMaterial=new ContactMaterial(null,null,{friction:.3,restitution:0});this.contactMaterials=[];this.allowSleep=!!o.allowSleep;this._acc=0;this.broadphase={};this.solver={iterations:10};this.quatNormalizeFast=false;this._listeners={}}
World.prototype.addBody=function(b){b.world=this;this.bodies.push(b)};World.prototype.add=World.prototype.addBody;
World.prototype.removeBody=function(b){this.bodies=this.bodies.filter(function(x){return x!==b})};World.prototype.remove=World.prototype.removeBody;
World.prototype.addContactMaterial=function(cm){this.contactMaterials.push(cm)};
World.prototype.addEventListener=Body.prototype.addEventListener;World.prototype.removeEventListener=Body.prototype.removeEventListener;
World.prototype._cm=function(a,b){for(var i=0;i<this.contactMaterials.length;i++){var c=this.contactMaterials[i];if((c.materials[0]===a.material&&c.materials[1]===b.material)||(c.materials[0]===b.material&&c.materials[1]===a.material))return c}
 var cm=this.defaultContactMaterial;var f=cm.friction,r=cm.restitution;if(a.material&&a.material.restitution>=0&&b.material&&b.material.restitution>=0)r=a.material.restitution*b.material.restitution;else if(a.material&&a.material.restitution>=0)r=a.material.restitution;else if(b.material&&b.material.restitution>=0)r=b.material.restitution;
 if(a.material&&a.material.friction>=0)f=a.material.friction;return{friction:f,restitution:r}};
function contact(a,b){var sa=a.shapes[0],sb=b.shapes[0];if(!sa||!sb)return null;
 if(sb.type===2&&sa.type!==2)return planeContact(a,b);if(sa.type===2&&sb.type!==2){var c=planeContact(b,a);if(c){c.n.negate(c.n);c.swap=true}return c}
 if(sa.type===4&&sb.type===4)return boxBox(a,b);
 if(sa.type===4&&sb.type!==4){var c2=boxSphere(a,b);return c2}
 if(sb.type===4&&sa.type!==4){var c3=boxSphere(b,a);if(c3){c3.n.negate(c3.n)}return c3}
 var ra=radius(a),rb=radius(b);var d=b.position.vsub(a.position);var dist=d.length();if(dist>=ra+rb||dist===0)return null;return{n:d.scale(1/dist),depth:ra+rb-dist}}
function planeContact(body,plane){var n=plane.quaternion.vmult(new V(0,0,1));var s=body.shapes[0];var rel=body.position.vsub(plane.position);var d=rel.dot(n);var r;
 if(s.type===1)r=s.radius;else if(s.type===4){var h=s.halfExtents;var ln=body.quaternion.conjugate().vmult(n);r=Math.abs(ln.x)*h.x+Math.abs(ln.y)*h.y+Math.abs(ln.z)*h.z}else r=radius(body);
 if(d>=r)return null;return{n:n.negate(),depth:r-d}}
function boxSphere(box,sph){var inv=box.quaternion.conjugate();var local=inv.vmult(sph.position.vsub(box.position));var h=box.shapes[0].halfExtents;var cl=new V(Math.max(-h.x,Math.min(h.x,local.x)),Math.max(-h.y,Math.min(h.y,local.y)),Math.max(-h.z,Math.min(h.z,local.z)));var dv=local.vsub(cl);var dist=dv.length();var r=radius(sph);
 if(dist>=r)return null;if(dist<1e-6){var ax=h.x-Math.abs(local.x),ay=h.y-Math.abs(local.y),az=h.z-Math.abs(local.z);var nl=ax<ay&&ax<az?new V(Math.sign(local.x)||1,0,0):ay<az?new V(0,Math.sign(local.y)||1,0):new V(0,0,Math.sign(local.z)||1);return{n:box.quaternion.vmult(nl),depth:r+Math.min(ax,ay,az)}}
 return{n:box.quaternion.vmult(dv.scale(1/dist)),depth:r-dist}}
function boxBox(a,b){var ha=a.shapes[0].halfExtents,hb=b.shapes[0].halfExtents;var d=b.position.vsub(a.position);var axes=[];[a,b].forEach(function(x){axes.push(x.quaternion.vmult(new V(1,0,0)),x.quaternion.vmult(new V(0,1,0)),x.quaternion.vmult(new V(0,0,1)))});
 var best=null,bestD=1e9;function proj(body,h,ax){var q=body.quaternion;return Math.abs(q.vmult(new V(1,0,0)).dot(ax))*h.x+Math.abs(q.vmult(new V(0,1,0)).dot(ax))*h.y+Math.abs(q.vmult(new V(0,0,1)).dot(ax))*h.z}
 for(var i=0;i<axes.length;i++){var ax=axes[i];var o=proj(a,ha,ax)+proj(b,hb,ax)-Math.abs(d.dot(ax));if(o<=0)return null;if(o<bestD){bestD=o;best=d.dot(ax)<0?ax.negate():ax.clone()}}
 return{n:best,depth:bestD}}
World.prototype._solve=function(dt){var bs=this.bodies;for(var i=0;i<bs.length;i++)for(var j=i+1;j<bs.length;j++){var a=bs[i],b=bs[j];if(!a.invMass&&!b.invMass)continue;if(a.sleepState===2&&b.sleepState===2)continue;
  var ra=radius(a),rb=radius(b);var sa=a.shapes[0],sb=b.shapes[0];if(sa&&sb&&sa.type!==2&&sb.type!==2&&a.position.distanceTo(b.position)>ra+rb)continue;
  var c=contact(a,b);if(!c)continue;var n=c.n;
  if(!a.collisionResponse||!b.collisionResponse){a._emit('collide',{body:b,target:a});b._emit('collide',{body:a,target:b});continue}
  var tot=a.invMass+b.invMass;if(tot===0)continue;var corr=n.scale(Math.max(c.depth-0.001,0)/tot*0.8);a.position.vsub(corr.scale(a.invMass),a.position);b.position.vadd(corr.scale(b.invMass),b.position);
  var rv=b.velocity.vsub(a.velocity);var vn=rv.dot(n);if(vn>0)continue;var m=this._cm(a,b);var e=Math.abs(vn)<0.4?0:m.restitution;var jn=-(1+e)*vn/tot;var imp=n.scale(jn);a.velocity.vsub(imp.scale(a.invMass),a.velocity);b.velocity.vadd(imp.scale(b.invMass),b.velocity);
  var t=rv.vsub(n.scale(vn));var tl=t.length();if(tl>1e-6){t.scale(1/tl,t);var jt=Math.min(tl/tot,m.friction*jn);var fi=t.scale(jt);a.velocity.vadd(fi.scale(a.invMass),a.velocity);b.velocity.vsub(fi.scale(b.invMass),b.velocity);
   var spin=n.cross(t).scale(jt*1.2);if(!a.fixedRotation&&a.invMass)a.angularVelocity.vsub(spin.scale(a.invMass/Math.max(ra,0.05)),a.angularVelocity);if(!b.fixedRotation&&b.invMass)b.angularVelocity.vsub(spin.scale(b.invMass/Math.max(rb,0.05)),b.angularVelocity)}
  a.wakeUp();b.wakeUp();var ev={body:b,target:a,contact:{getImpactVelocityAlongNormal:function(){return vn},ni:n}};a._emit('collide',ev);b._emit('collide',{body:a,target:b,contact:ev.contact})}};
World.prototype.step=function(dt,timeSinceLast,maxSub){if(timeSinceLast==null){this._step(dt);return}this._acc+=timeSinceLast;var n=0;maxSub=maxSub||10;while(this._acc>=dt&&n<maxSub){this._step(dt);this._acc-=dt;n++}var a=this._acc/dt;this.bodies.forEach(function(b){b.interpolatedPosition.set(b.previousPosition.x+(b.position.x-b.previousPosition.x)*a,b.previousPosition.y+(b.position.y-b.previousPosition.y)*a,b.previousPosition.z+(b.position.z-b.previousPosition.z)*a);b.interpolatedQuaternion.copy(b.quaternion)})};
World.prototype.fixedStep=function(dt,maxSub){dt=dt||1/60;var t=performance.now()/1000;if(this._last==null)this._last=t;var d=t-this._last;this._last=t;this.step(dt,d,maxSub||10)};
World.prototype._step=function(dt){var g=this.gravity;for(var it=0;it<3;it++){}
 for(var i=0;i<this.bodies.length;i++){var b=this.bodies[i];b.previousPosition.copy(b.position);if(b.type===2||!b.invMass){if(b.type===4){b.position.vadd(b.velocity.scale(dt),b.position);b.quaternion.integrate(b.angularVelocity,dt,null,b.quaternion)}continue}if(b.sleepState===2)continue;
  b.velocity.x+=(g.x+b.force.x*b.invMass)*dt;b.velocity.y+=(g.y+b.force.y*b.invMass)*dt;b.velocity.z+=(g.z+b.force.z*b.invMass)*dt;
  if(!b.fixedRotation){b.angularVelocity.vadd(b.torque.scale(b.invMass*dt),b.angularVelocity)}
  var ld=Math.pow(1-b.linearDamping,dt),ad=Math.pow(1-b.angularDamping,dt);b.velocity.scale(ld,b.velocity);b.angularVelocity.scale(ad,b.angularVelocity)}
 for(var k=0;k<4;k++)this._solve(dt);
 for(var j=0;j<this.bodies.length;j++){var bb=this.bodies[j];bb.force.setZero();bb.torque.setZero();if(!bb.invMass||bb.sleepState===2)continue;bb.position.vadd(bb.velocity.scale(dt),bb.position);if(!bb.fixedRotation)bb.quaternion.integrate(bb.angularVelocity,dt,null,bb.quaternion);
  if(this.allowSleep&&bb.allowSleep&&bb.velocity.lengthSquared()<1e-4&&bb.angularVelocity.lengthSquared()<1e-4){bb._still=(bb._still||0)+dt;if(bb._still>1)bb.sleepState=2}else bb._still=0}
 this.time+=dt;this.stepnumber++;this._emit&&0};
World.prototype._emit=Body.prototype._emit;
function NaiveBroadphase(){}function SAPBroadphase(){}function GSSolver(){this.iterations=10}
var CANNON={World:World,Body:Body,Vec3:V,Quaternion:Q,Sphere:Sphere,Box:Box,Plane:Plane,Cylinder:Cylinder,Material:Material,ContactMaterial:ContactMaterial,NaiveBroadphase:NaiveBroadphase,SAPBroadphase:SAPBroadphase,GSSolver:GSSolver,BODY_TYPES:{DYNAMIC:1,STATIC:2,KINEMATIC:4},SHAPE_TYPES:{SPHERE:1,PLANE:2,BOX:4,CYLINDER:16},version:'mrv-lite'};
window.CANNON=CANNON;
})();`;

export function usesCannon(all: string): boolean {
    return /\bCANNON\b|cannon-es|cannon(\.min)?\.js/.test(all);
}

/** Removes cannon CDN tags and rewrites ESM imports to the global. */
export function rewriteCannon(code: string): string {
    let out = code.replace(/<script[^>]+src=["'][^"']*cannon[^"']*["'][^>]*>\s*<\/script>/gi, '');
    out = out.replace(/import\s+([\s\S]*?)\s+from\s+['"][^'"]*cannon[^'"]*['"];?/g, (_m, clause: string) => {
        const decl: string[] = [];
        const named = /\{([^}]*)\}/.exec(clause);
        if (named) {
            const parts = named[1].split(',').map((x) => x.trim()).filter(Boolean).map((p) => { const [a, b] = p.split(/\s+as\s+/).map((x) => x.trim()); return b ? `${a}: ${b}` : a; });
            decl.push(`const { ${parts.join(', ')} } = window.CANNON;`);
        }
        const ns = /\*\s+as\s+([A-Za-z_$][\w$]*)/.exec(clause);
        if (ns) decl.push(`const ${ns[1]} = window.CANNON;`);
        const def = /^\s*([A-Za-z_$][\w$]*)\s*(,|$)/.exec(clause);
        if (def) decl.push(`const ${def[1]} = window.CANNON;`);
        return decl.join(' ');
    });
    return out;
}
