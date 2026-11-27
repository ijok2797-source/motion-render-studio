// "Perbaiki kode": safe automatic fixes for common paste problems, then a syntax check with line number.
export interface FixResult {
    code: string;
    changes: string[];
    error: string | null;
}

const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}' };

let evalBlocked = false;
function checkJs(src: string): string | null {
    if (evalBlocked) return null;
    try {
        // Only parses, never runs the code.
        new Function(src);
        return null;
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        // When the page forbids code parsing (CSP), fall back to the bracket scan only.
        if (/unsafe-eval|Content Security Policy|EvalError|code generation/i.test(msg) || (e instanceof EvalError)) { evalBlocked = true; return null; }
        return msg;
    }
}

function bracketIssue(src: string): string | null {
    const { stack, extra, unclosedStr } = scan(src);
    if (unclosedStr) return `Ada string ${unclosedStr}...${unclosedStr} yang belum ditutup`;
    if (extra.length) return `Penutup "${extra[0].ch}" berlebih di baris ${extra[0].line}`;
    if (stack.length) return `"${stack[stack.length - 1].ch}" di baris ${stack[stack.length - 1].line} belum ditutup`;
    return null;
}

/** Finds unclosed brackets / strings, ignoring comments and string contents. */
function scan(src: string): { stack: { ch: string; line: number }[]; unclosedStr: string | null; extra: { ch: string; line: number }[] } {
    const stack: { ch: string; line: number }[] = [];
    const extra: { ch: string; line: number }[] = [];
    let line = 1;
    let i = 0;
    let unclosedStr: string | null = null;
    while (i < src.length) {
        const c = src[i];
        if (c === '\n') { line++; i++; continue; }
        if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
        if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); const seg = e < 0 ? src.slice(i) : src.slice(i, e + 2); line += (seg.match(/\n/g) || []).length; i += seg.length; continue; }
        if (c === '"' || c === "'" || c === '`') {
            let j = i + 1;
            while (j < src.length && src[j] !== c) { if (src[j] === '\\') j++; else if (src[j] === '\n' && c !== '`') break; j++; }
            if (j >= src.length || (src[j] === '\n' && c !== '`')) unclosedStr = c;
            const seg = src.slice(i, j + 1);
            line += (seg.match(/\n/g) || []).length;
            i = j + 1; continue;
        }
        if (PAIRS[c]) stack.push({ ch: c, line });
        else if (c === ')' || c === ']' || c === '}') {
            const top = stack[stack.length - 1];
            if (top && PAIRS[top.ch] === c) stack.pop();
            else extra.push({ ch: c, line });
        }
        i++;
    }
    return { stack, unclosedStr, extra };
}

function fixText(src: string, changes: string[]): string {
    let s = src;
    const before = s;
    // Smart quotes and dashes from chat apps / docs
    s = s.replace(/[\u201C\u201D\u201E\u2033]/g, '"').replace(/[\u2018\u2019\u201A\u2032]/g, "'").replace(/[\u2013\u2014]/g, '-');
    if (s !== before) changes.push('Tanda kutip miring dan tanda pisah diganti jadi tanda kutip dan minus biasa.');
    const b2 = s;
    s = s.replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, (m) => (m === '\u00A0' ? ' ' : ''));
    if (s !== b2) changes.push('Spasi tak terlihat (non-breaking space / zero-width) dihapus.');
    const b3 = s;
    // Markdown escapes copied from chat: p\[0\], 10 \* x, \`...\`
    s = s.replace(/\\([[\]*_`#|])/g, '$1');
    if (s !== b3) changes.push('Garis miring terbalik dari salinan chat (misalnya \\[ \\] \\* \\`) dihapus.');
    const b4 = s;
    // Markdown code fences
    s = s.replace(/^\s*```[\w-]*\s*\n/, '').replace(/\n\s*```\s*$/, '');
    if (s !== b4) changes.push('Penanda blok kode ``` dihapus.');
    const b5 = s;
    s = s.replace(/\r\n?/g, '\n').replace(/\t/g, '  ').replace(/[ \t]+$/gm, '');
    if (s !== b5) changes.push('Akhir baris, tab, dan spasi di ujung baris dirapikan.');
    return s;
}

function closeBrackets(src: string, changes: string[]): string {
    const { stack } = scan(src);
    if (!stack.length) return src;
    const closers = stack.slice().reverse().map((x) => PAIRS[x.ch]).join('');
    changes.push(`Menambahkan penutup yang kurang di akhir kode: ${closers.split('').join(' ')} (pembuka dari baris ${stack.map((x) => x.line).join(', ')}).`);
    return src.replace(/\s*$/, '') + '\n' + closers + '\n';
}

function fixJs(src: string, changes: string[]): string {
    let s = src;
    const broken = evalBlocked ? !!scan(s).stack.length : !!checkJs(s);
    if (broken && scan(s).stack.length) {
        const tried = closeBrackets(s, []);
        if (evalBlocked || !checkJs(tried)) s = closeBrackets(s, changes);
    }
    return s;
}

function fixHtml(src: string, changes: string[]): string {
    let s = src;
    // Fix JS inside <script> blocks
    s = s.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi, (m, a: string, body: string, b: string) => {
        if (/type=["']module["']/i.test(a) || /type=["'](importmap|application\/json|text\/template)/i.test(a)) return m;
        const fixed = fixJs(body, changes);
        return a + fixed + b;
    });
    // Unclosed <script> / <style> at the end
    const openScript = (s.match(/<script\b/gi) || []).length, closeScript = (s.match(/<\/script\s*>/gi) || []).length;
    if (openScript > closeScript) { s = s.replace(/\s*$/, '') + '\n</script>\n'; changes.push('Menambahkan </script> yang belum ditutup.'); }
    const openStyle = (s.match(/<style\b/gi) || []).length, closeStyle = (s.match(/<\/style\s*>/gi) || []).length;
    if (openStyle > closeStyle) { s = s.replace(/<script\b/i, '</style>\n<script'); changes.push('Menambahkan </style> yang belum ditutup.'); }
    return s;
}

function fixCss(src: string, changes: string[]): string {
    const open = (src.match(/\{/g) || []).length, close = (src.match(/\}/g) || []).length;
    if (open > close) { changes.push(`Menambahkan ${open - close} kurung kurawal } yang kurang di akhir CSS.`); return src.replace(/\s*$/, '') + '\n' + '}'.repeat(open - close) + '\n'; }
    return src;
}

function lineOfError(src: string): string | null {
    const err = checkJs(src);
    const b = bracketIssue(src);
    if (!err) return b;
    return b ? `${err}. ${b}.` : err;
}

export function fixCode(src: string, lang: 'html' | 'css' | 'js'): FixResult {
    const changes: string[] = [];
    let s = fixText(src, changes);
    const isHtml = lang === 'html' || /^\s*</.test(s);
    if (isHtml) s = fixHtml(s, changes);
    else if (lang === 'css') s = fixCss(s, changes);
    else s = fixJs(s, changes);

    let error: string | null = null;
    if (!isHtml && lang === 'js') error = lineOfError(s);
    if (isHtml) {
        const blocks = [...s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
        for (const b of blocks) {
            if (/type=["'](module|importmap|application\/json)/i.test(b[1])) continue;
            const e = lineOfError(b[2]);
            if (e) {
                const startLine = s.slice(0, b.index ?? 0).split('\n').length;
                error = `Di dalam <script> mulai baris ${startLine}: ${e}`;
                break;
            }
        }
    }
    return { code: s, changes, error };
}

/** Re-indents code with 2 spaces based on bracket depth (keeps strings and comments intact). */
export function formatCode(src: string): string {
    const lines = src.split('\n');
    let depth = 0;
    let inBlock = false;
    return lines.map((raw) => {
        const t = raw.trim();
        if (!t) return '';
        if (inBlock) { if (t.includes('*/')) inBlock = false; return '  '.repeat(depth) + t; }
        const stripped = t.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '""').replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
        if (stripped.includes('/*') && !stripped.includes('*/')) inBlock = true;
        const lead = (/^[}\])]+/.exec(stripped) || [''])[0].length;
        const d = Math.max(0, depth - lead);
        const opens = (stripped.match(/[{[(]/g) || []).length;
        const closes = (stripped.match(/[}\])]/g) || []).length;
        depth = Math.max(0, depth + opens - closes);
        return '  '.repeat(d) + t;
    }).join('\n');
}
