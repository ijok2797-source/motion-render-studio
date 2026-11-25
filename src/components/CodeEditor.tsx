import { useRef } from 'react';
import type { Lang } from '../lib/types';

interface Props {
    lang: Lang;
    value: string;
    onChange: (v: string) => void;
}

const PH: Record<Lang, string> = {
    html: '<div class="box"></div>',
    css: '.box { animation: spin 2s linear infinite; }',
    js: 'requestAnimationFrame(function loop(t) { ... })',
};

export function CodeEditor({ lang, value, onChange }: Props) {
    const ta = useRef<HTMLTextAreaElement>(null);
    const gutter = useRef<HTMLDivElement>(null);
    const lines = value.split('\n').length;

    const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const el = e.currentTarget;
        if (e.key === 'Tab') {
            e.preventDefault();
            const { selectionStart: s, selectionEnd: en } = el;
            const v = value.slice(0, s) + '  ' + value.slice(en);
            onChange(v);
            requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
        } else if (e.key === 'Enter') {
            const s = el.selectionStart;
            const lineStart = value.lastIndexOf('\n', s - 1) + 1;
            const indent = /^\s*/.exec(value.slice(lineStart, s))?.[0] ?? '';
            const extra = /[{([>]\s*$/.test(value.slice(lineStart, s)) ? '  ' : '';
            if (indent || extra) {
                e.preventDefault();
                const ins = '\n' + indent + extra;
                onChange(value.slice(0, s) + ins + value.slice(el.selectionEnd));
                requestAnimationFrame(() => el.setSelectionRange(s + ins.length, s + ins.length));
            }
        }
    };

    return (
        <div className="editor">
            <div className="gutter" ref={gutter} aria-hidden="true">
                {Array.from({ length: lines }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                ))}
            </div>
            <textarea
                ref={ta}
                aria-label={`Kode ${lang.toUpperCase()}`}
                spellCheck={false}
                value={value}
                placeholder={PH[lang]}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKey}
                onScroll={(e) => {
                    if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
                }}
            />
        </div>
    );
}
