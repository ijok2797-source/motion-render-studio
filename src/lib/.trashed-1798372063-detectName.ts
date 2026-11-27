import type { Code } from './types';

const clean = (s: string) =>
    s.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/[^\p{L}\p{N}\- ]/gu, ' ').replace(/\s+/g, ' ').trim();

const ok = (s: string | undefined | null): s is string => {
    if (!s) return false;
    const c = clean(s);
    return c.length >= 3 && c.length <= 60 && /\p{L}{2}/u.test(c) && !/^(untitled|document|index|test|demo|preview|player|canvas|animation)$/i.test(c);
};

// Words that describe what is on screen; used only when no title, caption or comment is found.
const OBJECTS = ['coin', 'rocket', 'burger', 'pizza', 'scooter', 'courier', 'car', 'truck', 'bike', 'plane', 'planet', 'earth', 'globe', 'sun', 'moon', 'star', 'heart', 'cube', 'sphere', 'robot', 'laptop', 'phone', 'chart', 'wallet', 'cart', 'gift', 'house', 'city', 'tree', 'flower', 'fish', 'bird', 'cat', 'dog', 'logo', 'particle', 'wave', 'ring', 'diamond', 'trophy', 'money', 'bitcoin', 'crypto'];

/** Tries to find a human name for the animation in the code. Returns null when nothing reliable is found. */
export function detectName(code: Code): string | null {
    const all = `${code.html}\n${code.css}\n${code.js}`;

    // 1. Caption / title constants: CAPTION = 'Food Delivery', const TITLE = "..."
    const cap = /\b(?:CAPTION|TITLE|HEADLINE|HEADING|LABEL|caption|title|headline|heading)\s*[:=]\s*(['"`])([^'"`\n]{3,60})\1/.exec(all);
    if (cap && ok(cap[2])) return clean(cap[2]);

    // 2. <title> tag
    const title = /<title[^>]*>([^<]{3,80})<\/title>/i.exec(all);
    if (title && ok(title[1])) return clean(title[1]);

    // 3. Main heading text
    const h = /<h1[^>]*>([\s\S]{3,120}?)<\/h1>/i.exec(all);
    if (h && ok(h[1])) return clean(h[1]);

    // 4. A comment on the first lines of the code: // Food Delivery  or  /* Golden coin */
    for (const src of [code.js, code.html, code.css]) {
        const lines = src.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 3);
        for (const l of lines) {
            const m = /^(?:\/\/+|\/\*+|<!--)\s*(.+?)\s*(?:\*+\/|-->)?$/.exec(l);
            if (m && !/[-=*_#]{4,}/.test(m[1]) && !/[;{}()=]/.test(m[1]) && ok(m[1])) return clean(m[1]);
        }
    }

    // 5. Recognised objects named in the code (variables, functions, comments)
    const lower = all.toLowerCase();
    const found = OBJECTS.map((w) => ({ w, n: (lower.match(new RegExp(`\\b${w}s?\\b`, 'g')) || []).length }))
        .filter((x) => x.n >= 2)
        .sort((a, b) => b.n - a.n)
        .slice(0, 2)
        .map((x) => x.w);
    if (found.length) return found.join(' ');

    return null;
}

/** Fallback name: "motion " followed by 10 random digits. */
export function randomMotionName(): string {
    let d = String(1 + Math.floor(Math.random() * 9));
    for (let i = 0; i < 9; i++) d += Math.floor(Math.random() * 10);
    return `motion ${d}`;
}

export const isRandomName = (s: string) => /^motion \d{10}$/.test(s);
