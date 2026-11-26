// Lightweight syntax highlighter for HTML / CSS / JS (no dependencies). Returns HTML with <span class="tk-*">.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const JS_KW = new Set('break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new of return super switch this throw try typeof var void while with yield async await static get set from as'.split(' '));
const JS_LIT = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);
const JS_BUILTIN = new Set('Math Date JSON Object Array String Number Promise window document console THREE gsap anime Matter CANNON p5 performance requestAnimationFrame setTimeout setInterval innerWidth innerHeight'.split(' '));

function hlJs(src: string): string {
    let out = '';
    let i = 0;
    const n = src.length;
    let prevSig = '';
    while (i < n) {
        const c = src[i];
        const rest = src.slice(i);
        let m: RegExpExecArray | null;
        if (c === '/' && src[i + 1] === '/') {
            const e = src.indexOf('\n', i);
            const t = e < 0 ? src.slice(i) : src.slice(i, e);
            out += `<span class="tk-c">${esc(t)}</span>`; i += t.length; continue;
        }
        if (c === '/' && src[i + 1] === '*') {
            const e = src.indexOf('*/', i + 2);
            const t = e < 0 ? src.slice(i) : src.slice(i, e + 2);
            out += `<span class="tk-c">${esc(t)}</span>`; i += t.length; continue;
        }
        if (c === '"' || c === "'" || c === '`') {
            let j = i + 1;
            while (j < n && src[j] !== c) { if (src[j] === '\\') j++; j++; }
            const t = src.slice(i, j + 1);
            if (c === '`') {
                // highlight ${...} inside template literals
                out += '<span class="tk-s">' + esc(t).replace(/\$\{([^}]*)\}/g, '</span><span class="tk-p">${</span>$1<span class="tk-p">}</span><span class="tk-s">') + '</span>';
            } else out += `<span class="tk-s">${esc(t)}</span>`;
            i += t.length; prevSig = 's'; continue;
        }
        if (c === '/' && /[=(,:;!&|?{}\[\n]|^$|return$/.test(prevSig) && (m = /^\/(?![*/])(?:\\.|\[(?:\\.|[^\]])*\]|[^/\\\n])+\/[gimsuy]*/.exec(rest))) {
            out += `<span class="tk-r">${esc(m[0])}</span>`; i += m[0].length; prevSig = 'r'; continue;
        }
        if ((m = /^(?:0[xX][\da-fA-F]+|\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?|\.\d+)/.exec(rest))) {
            out += `<span class="tk-n">${m[0]}</span>`; i += m[0].length; prevSig = 'n'; continue;
        }
        if ((m = /^[A-Za-z_$][\w$]*/.exec(rest))) {
            const w = m[0];
            const after = src.slice(i + w.length).match(/^\s*\(/);
            const cls = JS_KW.has(w) ? 'tk-k' : JS_LIT.has(w) ? 'tk-l' : JS_BUILTIN.has(w) ? 'tk-b' : after ? 'tk-f' : /^[A-Z]/.test(w) ? 'tk-t' : '';
            out += cls ? `<span class="${cls}">${w}</span>` : w;
            i += w.length; prevSig = w === 'return' ? 'return' : 'w'; continue;
        }
        if (/[{}()[\];,.]/.test(c)) { out += `<span class="tk-p">${esc(c)}</span>`; prevSig = c; i++; continue; }
        if (/[=+\-*%<>!&|^~?:]/.test(c)) { out += `<span class="tk-o">${esc(c)}</span>`; prevSig = c; i++; continue; }
        if (c === '/') { out += `<span class="tk-o">/</span>`; prevSig = '/'; i++; continue; }
        if (c === '\n') prevSig = '\n';
        else if (!/\s/.test(c)) prevSig = c;
        out += esc(c); i++;
    }
    return out;
}

function hlCss(src: string): string {
    return esc(src)
        .replace(/\/\*[\s\S]*?\*\//g, (m) => `\u0001c${m}\u0002`)
        .replace(/(&quot;|"|')(?:(?!\1).)*\1/g, (m) => `\u0001s${m}\u0002`)
        .replace(/(@[\w-]+)/g, '\u0001k$1\u0002')
        .replace(/([\w-]+)(\s*):(?![^{]*\{)/g, '\u0001a$1\u0002$2:')
        .replace(/(#[\da-fA-F]{3,8})\b/g, '\u0001n$1\u0002')
        .replace(/(-?\d*\.?\d+)(px|%|s|ms|deg|vh|vw|em|rem|fr)?\b/g, '\u0001n$1$2\u0002')
        .replace(/^([^\u0001{}\n][^{}\n]*?)(\s*\{)/gm, '\u0001t$1\u0002$2')
        .replace(/\u0001(\w)/g, (_m, k) => `<span class="tk-${({ c: 'c', s: 's', k: 'k', a: 'a', n: 'n', t: 'f' } as Record<string, string>)[k] || k}">`)
        .replace(/\u0002/g, '</span>');
}

function hlHtml(src: string): string {
    let out = '';
    const re = /(<!--[\s\S]*?-->)|(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)|(<style\b[^>]*>)([\s\S]*?)(<\/style\s*>)|(<\/?[A-Za-z][^>]*>)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    const tag = (t: string) => {
        const mm = /^<(\/?)([\w:-]+)([\s\S]*?)(\/?)>$/.exec(t);
        if (!mm) return esc(t);
        const attrs = esc(mm[3]).replace(/([\w:@.-]+)(\s*=\s*)(&quot;[\s\S]*?&quot;|"[^"]*"|'[^']*'|[^\s>]+)?/g, (_x: string, n: string, eq: string, v?: string) =>
            `<span class="tk-a">${n}</span><span class="tk-o">${eq}</span>${v ? `<span class="tk-s">${v}</span>` : ''}`);
        return `<span class="tk-p">&lt;${mm[1]}</span><span class="tk-k">${mm[2]}</span>${attrs}<span class="tk-p">${mm[4]}&gt;</span>`;
    };
    while ((m = re.exec(src))) {
        out += esc(src.slice(last, m.index));
        if (m[1]) out += `<span class="tk-c">${esc(m[1])}</span>`;
        else if (m[2]) out += tag(m[2]) + hlJs(m[3]) + tag(m[4]);
        else if (m[5]) out += tag(m[5]) + hlCss(m[6]) + tag(m[7]);
        else if (m[8]) out += tag(m[8]);
        last = re.lastIndex;
    }
    return out + esc(src.slice(last));
}

export function highlight(src: string, lang: 'html' | 'css' | 'js'): string {
    if (src.length > 400_000) return esc(src);
    const isHtml = lang === 'html' || /^\s*</.test(src);
    return (isHtml ? hlHtml(src) : lang === 'css' ? hlCss(src) : hlJs(src)) + '\n';
}
