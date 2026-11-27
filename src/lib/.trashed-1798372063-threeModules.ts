import { ADDON_SRC, FONT_SRC } from './threeAddons';

/** Normalises '../shaders/CopyShader.js' relative to 'postprocessing/X.js' → 'shaders/CopyShader.js'. */
function resolve(from: string, spec: string): string {
    const base = from.split('/').slice(0, -1);
    for (const part of spec.split('/')) {
        if (part === '..') base.pop();
        else if (part !== '.' && part) base.push(part);
    }
    let k = base.join('/');
    if (!/\.js$/.test(k)) k += '.js';
    return k;
}

/** Maps a user import path ('three/addons/x/Y.js', '.../examples/jsm/x/Y.js') to an addon key. */
export function addonKey(spec: string): string | null {
    const m = /(?:examples\/jsm|addons)\/(.+?)(?:\?.*)?$/.exec(spec);
    if (!m) return null;
    return /\.js$/.test(m[1]) ? m[1] : m[1] + '.js';
}

const importRe = /import\s*([\s\S]*?)\s*from\s*['"]([^'"]+)['"];?/g;

function destructure(clause: string, from: string): string {
    const out: string[] = [];
    const named = /\{([^}]*)\}/.exec(clause);
    if (named) {
        const parts = named[1].split(',').map((x) => x.trim()).filter(Boolean)
            .map((p) => { const [a, b] = p.split(/\s+as\s+/).map((x) => x.trim()); return b ? `${a}: ${b}` : a; });
        out.push(`const { ${parts.join(', ')} } = ${from};`);
    }
    const ns = /\*\s+as\s+([A-Za-z_$][\w$]*)/.exec(clause);
    if (ns) out.push(`const ${ns[1]} = ${from};`);
    const def = /^\s*([A-Za-z_$][\w$]*)\s*(,|$)/.exec(clause);
    if (def) out.push(`const ${def[1]} = (${from}).default;`);
    return out.join(' ');
}

/** Turns one ES-module addon into a lazy registry entry. Returns the code and its dependencies. */
function convert(key: string, src: string): { code: string; deps: string[] } {
    const deps: string[] = [];
    let body = src.replace(importRe, (_m, clause: string, spec: string) => {
        if (spec === 'three' || /\/three(\.module)?(\.min)?\.js$/.test(spec)) return destructure(clause, 'window.THREE');
        if (spec.startsWith('.')) {
            const k = resolve(key, spec);
            deps.push(k);
            return destructure(clause, `__mrvReq(${JSON.stringify(k)})`);
        }
        return '';
    });
    const exp: string[] = [];
    body = body.replace(/export\s*\{([^}]*)\}\s*(?:from\s*['"]([^'"]+)['"])?;?/g, (_m, list: string, from?: string) => {
        const pairs = list.split(',').map((x) => x.trim()).filter(Boolean).map((p) => { const [a, b] = p.split(/\s+as\s+/).map((x) => x.trim()); return [a, b || a]; });
        if (from) {
            const k = resolve(key, from);
            deps.push(k);
            pairs.forEach(([a, b]) => exp.push(`${JSON.stringify(b)}: __mrvReq(${JSON.stringify(k)})[${JSON.stringify(a)}]`));
        } else pairs.forEach(([a, b]) => exp.push(`${JSON.stringify(b)}: ${a}`));
        return '';
    });
    body = body.replace(/export\s+default\s+/g, () => { exp.push('"default": __default'); return 'const __default = '; });
    body = body.replace(/export\s+(class|function\*?|const|let|var|async\s+function)\s+([A-Za-z_$][\w$]*)/g, (_m, kind: string, name: string) => {
        exp.push(`${JSON.stringify(name)}: ${name}`);
        return `${kind} ${name}`;
    });
    const code = `__mrvDef(${JSON.stringify(key)}, function(){\n${body}\nreturn { ${exp.join(', ')} };\n});`;
    return { code, deps };
}

const SO = ['<', 'script>'].join('');
const SC = ['</', 'script>'].join('');

/** Script tags for the requested addons and everything they depend on. */
export function addonScripts(keys: string[]): { html: string; missing: string[] } {
    const done = new Set<string>();
    const parts: string[] = [];
    const missing: string[] = [];
    const visit = (k: string) => {
        if (done.has(k)) return;
        done.add(k);
        const src = ADDON_SRC[k];
        if (!src) { missing.push(k); return; }
        const { code, deps } = convert(k, src);
        deps.forEach(visit);
        parts.push(code);
    };
    keys.forEach(visit);
    const runtime = `(function(){var defs={},cache={};window.__mrvDef=function(k,f){defs[k]=f};window.__mrvReq=function(k){if(cache[k])return cache[k];var f=defs[k];if(!f){if(window.__threeAddon){return new Proxy({},{get:function(_t,n){return window.__threeAddon(String(n))}})}return {}}cache[k]={};var r=f();cache[k]=r;return r};
window.__mrvFonts=${JSON.stringify(FONT_SRC)};})();`;
    const fontPatch = `(function(){try{var FL=window.__mrvReq('loaders/FontLoader.js').FontLoader;if(!FL)return;var orig=FL.prototype.load;FL.prototype.load=function(url,onLoad,onProgress,onError){var f=window.__mrvFonts,name=null;for(var k in f){if(String(url).indexOf(k)>=0){name=k;break}}if(!name&&/typeface/i.test(String(url)))name=/bold/i.test(String(url))?'helvetiker_bold':'helvetiker_regular';if(name&&f[name]){var font=this.parse(JSON.parse(f[name]));if(onLoad)setTimeout(function(){onLoad(font)},0);return font}return orig.apply(this,arguments)};FL.prototype.loadAsync=function(url){var self=this;return new Promise(function(res,rej){self.load(url,res,undefined,rej)})}}catch(e){}})();`;
    const html = `${SO}${runtime}${SC}` + parts.map((p) => `${SO}${p.replace(/<\/script/gi, '<\\/script')}${SC}`).join('') + (done.has('loaders/FontLoader.js') ? `${SO}${fontPatch}${SC}` : '');
    return { html, missing };
}

/** Rewrites imports of addons in user code to the registry. */
export function rewriteAddonImports(code: string, keys: string[]): string {
    return code.replace(/import\s+([\s\S]*?)\s+from\s+['"]([^'"]*(?:examples\/jsm|addons)\/[^'"]+)['"];?/g, (_m, clause: string, spec: string) => {
        const k = addonKey(spec);
        if (!k) return '';
        keys.push(k);
        return destructure(clause, `__mrvReq(${JSON.stringify(k)})`);
    });
}

export const ADDON_COUNT = Object.keys(ADDON_SRC).length;
