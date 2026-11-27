// Bundled Three.js for 3D code: CDN/module imports are rewritten to use the built-in copy.
import THREE_SRC from '../../node_modules/three/build/three.cjs?raw';
import { addonScripts, rewriteAddonImports } from './threeModules';

const SO = ['<', 'script>'].join('');
const SC = ['</', 'script>'].join('');

export function usesThree(all: string): boolean {
    return /\bTHREE\b|from\s+['"][^'"]*three[^'"]*['"]|three(\.min)?\.js|three\.module/i.test(all);
}

/** Script tag defining window.THREE, plus a WebGL patch so frames can always be captured. */
export function threeHead(addonKeys: string[] = []): string {
    const src = THREE_SRC.replace(/<\/script/gi, '<\\/script');
    const glPatch = `(function(){var g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){if(/webgl/i.test(t)){o=Object.assign({},o||{},{preserveDrawingBuffer:true})}return g.call(this,t,o)}})();`;
    return `${SO}${glPatch}${SC}${SO}(function(){var module={exports:{}};var exports=module.exports;\n${src}\n;window.THREE=module.exports;})();${SC}${SO}${sizePatch}${SC}${SO}${ADDONS}${SC}` + (addonKeys.length ? addonScripts(addonKeys).html : '');
}

/** Keeps the WebGL canvas no bigger than the frame needs (code that hard-codes setSize(3840, 2160) ran out of GPU memory on iPad). */
const sizePatch = `(function(){var T=window.THREE;if(!T||!T.WebGLRenderer)return;var R=T.WebGLRenderer;var ap=/iP(ad|hone|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);function lim(){return window.__motionRender?(ap?1:Math.max(1,Math.min(2,window.__motionSS||1))):1}function W2(p){var r=new R(p);var s0=r.setSize;r.setSize=function(w,h,u){var k=lim();var f=Math.min(1,Math.max(innerWidth*k/Math.max(1,w),innerHeight*k/Math.max(1,h)));if(!(f>0))f=1;return s0.call(r,Math.max(1,Math.round(w*f)),Math.max(1,Math.round(h*f)),u)};return r}W2.prototype=R.prototype;try{Object.setPrototypeOf(W2,R)}catch(e){}try{T.WebGLRenderer=W2}catch(e){}})();`;

// Built-in replacements for common Three.js addons, plus a harmless stub for the rest.
const ADDONS = `(function(){var T=window.THREE;if(!T)return;
function RoomEnvironment(){var s=new T.Scene();var geo=new T.BoxGeometry();geo.deleteAttribute&&geo.deleteAttribute('uv');
var roomMat=new T.MeshStandardMaterial({side:T.BackSide});var boxMat=new T.MeshStandardMaterial();
var main=new T.PointLight(0xffffff,900,28,2);main.position.set(0.418,16.199,0.300);s.add(main);
var room=new T.Mesh(geo,roomMat);room.position.set(-0.757,13.219,0.717);room.scale.set(31.713,28.305,28.591);s.add(room);
[[-10.906,2.009,1.846,-0.521,2.426,1.026,3.111],[-5.607,-0.754,-0.758,0.140,1.302,1.227,1.240],[6.167,0.857,7.803,0.120,1.402,3.299,2.553],[-2.288,2.164,-8.637,0.150,1.410,3.301,1.270],[4.454,1.069,-5.913,-0.260,1.316,3.054,2.032],[1.769,4.130,9.011,0.000,1.326,3.130,1.040]].forEach(function(b){var m=new T.Mesh(geo,boxMat);m.position.set(b[0],b[1],b[2]);m.rotation.set(0,b[3],0);m.scale.set(b[4],b[5],b[6]);s.add(m)});
function light(px,py,pz,sx,sy,sz,i){var mat=new T.MeshBasicMaterial({color:0xffffff});mat.color.setScalar(i);var m=new T.Mesh(geo,mat);m.position.set(px,py,pz);m.scale.set(sx,sy,sz);s.add(m)}
light(-16.116,14.37,8.208,0.1,2.428,2.739,50);light(-16.109,18.021,-8.207,0.1,2.425,2.751,50);light(14.904,12.198,-1.832,0.15,4.265,6.331,17);light(-0.462,8.89,14.520,4.38,5.441,0.088,43);light(3.235,11.486,-12.541,2.5,2,0.1,20);light(0,20,0,1,0.1,1,100);
s.dispose=function(){};return s}
function OrbitControls(cam,el){this.object=cam;this.domElement=el;this.target=new T.Vector3();this.enabled=true;this.enableDamping=false;this.autoRotate=false}
OrbitControls.prototype.update=function(){if(this.object&&this.object.lookAt)this.object.lookAt(this.target);return false};
OrbitControls.prototype.dispose=OrbitControls.prototype.addEventListener=OrbitControls.prototype.removeEventListener=OrbitControls.prototype.saveState=OrbitControls.prototype.reset=function(){};
function Stub(){return new Proxy(this,{get:function(t,k){if(k in t)return t[k];if(k==='then')return undefined;return function(){return undefined}}})}
var known={RoomEnvironment:RoomEnvironment,OrbitControls:OrbitControls};
window.__threeAddon=function(n){return known[n]||(T[n]!==undefined?T[n]:Stub)};
})();`;


/** Removes CDN three script tags, import maps, and rewrites ES imports of three to window.THREE. */
export function rewriteThree(code: string, warnings: string[], addonKeysOut: string[] = []): string {
    let out = code;
    out = out.replace(/<script[^>]+src=["'][^"']*three[^"']*["'][^>]*>\s*<\/script>/gi, '');
    out = out.replace(/<script[^>]+type=["']importmap["'][^>]*>[\s\S]*?<\/script>/gi, '');
    let addon = false;
    const addonDecl = (clause: string) => {
        const decls: string[] = [];
        const named = /\{([^}]*)\}/.exec(clause);
        if (named) {
            named[1].split(',').map((x) => x.trim()).filter(Boolean).forEach((part) => {
                const [orig, alias] = part.split(/\s+as\s+/).map((x) => x.trim());
                decls.push(`const ${alias || orig} = window.__threeAddon('${orig}');`);
            });
        }
        const def = /^\s*([A-Za-z_$][\w$]*)\s*(,|$)/.exec(clause);
        if (def) decls.push(`const ${def[1]} = window.__threeAddon('${def[1]}');`);
        const ns = /\*\s+as\s+([A-Za-z_$][\w$]*)/.exec(clause);
        if (ns) decls.push(`const ${ns[1]} = new Proxy({}, { get: (_t, k) => window.__threeAddon(String(k)) });`);
        return decls.join(' ');
    };
    out = out.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]three['"];?/g, 'const $1 = window.THREE;');
    out = out.replace(/import\s+\{([^}]+)\}\s+from\s+['"]three['"];?/g, (_m, names: string) => `const {${names.replace(/\s+as\s+/g, ': ')}} = window.THREE;`);
    out = out.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]https?:[^'"]*three[^'"]*\/build\/three[^'"]*['"];?/g, 'const $1 = window.THREE;');
    const keys: string[] = [];
    out = rewriteAddonImports(out, keys);
    void addonDecl; void addon;
    if (keys.length) {
        const { missing } = addonScripts(keys);
        if (missing.length) warnings.push(`Addon Three.js belum tersedia: ${missing.join(', ')}. Bagian yang memakainya tidak akan tampil.`);
        if (keys.some((k) => /Loader\.js$/.test(k) && !/FontLoader/.test(k))) warnings.push('Loader (misalnya GLTFLoader, RGBELoader) tersedia, tetapi file model/tekstur dari internet tetap diblokir. Pakai data yang ditulis langsung di kode, atau file data: URL.');
    }
    addonKeysOut.push(...keys);
    return out;
}
