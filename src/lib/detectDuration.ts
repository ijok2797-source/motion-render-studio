import type { Code } from './types';

export interface Detected {
    seconds: number;
    source: string;
}

const toSec = (v: string, unit: string) => (unit === 'ms' ? parseFloat(v) / 1000 : parseFloat(v));
const TIMEVAR = '(?:time|clock|t|tt|elapsed|sec|secs|seconds|now|progress)';

function fromCss(css: string): Detected | null {
    let max = 0;
    let infinite = false;
    // animation shorthand
    for (const m of css.matchAll(/animation\s*:\s*([^;}]+)/gi)) {
        for (const part of m[1].split(',')) {
            const times = [...part.matchAll(/(-?[\d.]+)(ms|s)\b/g)].map((x) => toSec(x[1], x[2]));
            if (/infinite/.test(part)) infinite = true;
            const iter = /\s(\d+(?:\.\d+)?)\s/.exec(' ' + part.replace(/[\d.]+m?s\b/g, '') + ' ');
            const n = iter ? parseFloat(iter[1]) : 1;
            if (times.length) max = Math.max(max, (times[0] || 0) * (infinite ? 1 : n) + (times[1] || 0));
        }
    }
    // longhand
    const durs = [...css.matchAll(/animation-duration\s*:\s*([^;}]+)/gi)].flatMap((m) => [...m[1].matchAll(/([\d.]+)(ms|s)\b/g)].map((x) => toSec(x[1], x[2])));
    const dels = [...css.matchAll(/animation-delay\s*:\s*([^;}]+)/gi)].flatMap((m) => [...m[1].matchAll(/(-?[\d.]+)(ms|s)\b/g)].map((x) => toSec(x[1], x[2])));
    if (durs.length) max = Math.max(max, Math.max(...durs) + (dels.length ? Math.max(0, ...dels) : 0));
    if (max <= 0) return null;
    return { seconds: max, source: infinite ? 'satu siklus animasi CSS (infinite)' : 'animasi CSS (durasi + delay)' };
}

function fromJs(js: string): Detected | null {
    // time % N  /  ((time % N) + N) % N
    const mod = new RegExp(`\\b${TIMEVAR}\\b\\s*\\)?\\s*%\\s*([\\d.]+)`, 'i').exec(js);
    if (mod) {
        const n = parseFloat(mod[1]);
        if (n > 0 && n <= 600) {
            const ms = /performance\.now|Date\.now/.test(js) && n >= 100;
            return { seconds: ms ? n / 1000 : n, source: `loop "% ${mod[1]}" di kode` };
        }
    }
    // GSAP: duration: N / repeat cycles via timeline totals are hard; take largest duration+delay
    const gsap = [...js.matchAll(/duration\s*:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]));
    const delays = [...js.matchAll(/delay\s*:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]));
    if (gsap.length && /gsap|TweenMax|TweenLite|anime\(/.test(js)) {
        const isMs = /anime\(/.test(js) && Math.max(...gsap) > 50;
        const total = Math.max(...gsap) + (delays.length ? Math.max(...delays) : 0);
        return { seconds: isMs ? total / 1000 : total, source: 'durasi tween GSAP/anime.js' };
    }
    // progress(t, a, b) style keyframes: largest numeric end time
    const prog = [...js.matchAll(/\b(?:progress|P|prog)\(\s*\w+\s*,\s*([\d.]+)\s*,\s*([\d.]+)/g)].map((m) => parseFloat(m[2]));
    if (prog.length) {
        const end = Math.max(...prog);
        if (end > 0 && end < 600) return { seconds: Math.ceil(end * 2) / 2, source: 'timeline keyframe terakhir di kode' };
    }
    return null;
}

export function detectDuration(code: Code): Detected | null {
    const all = code.html + '\n' + code.css + '\n' + code.js;
    const styleBlocks = [...all.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
    const scriptBlocks = [...all.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join('\n');
    const js = code.js + '\n' + scriptBlocks + '\n' + (/<script/i.test(code.html) ? '' : '');
    const d = fromJs(js) ?? fromJs(code.html) ?? fromCss(code.css + '\n' + styleBlocks);
    if (!d) return null;
    const seconds = Math.round(d.seconds * 10) / 10;
    if (!(seconds > 0) || seconds > 300) return null;
    return { seconds, source: d.source };
}
