import { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import type { Code, Lang, Log } from '../lib/types';

interface Props {
    code: Code;
    setCode: (c: Code | ((c: Code) => Code)) => void;
    logs: Log[];
    clearLogs: () => void;
    onReload: () => void;
    onClear: () => void;
    notify: (m: string) => void;
}

const isHtml = (s: string) => /^\s*</.test(s);

export function EditorPane({ code, setCode, logs, clearLogs, onReload, onClear, notify }: Props) {
    const [split, setSplit] = useState(() => !!code.css.trim() || (!!code.html.trim() && !!code.js.trim()));
    const [lang, setLang] = useState<Lang>('html');
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [open, setOpenState] = useState(() => {
        try { const v = localStorage.getItem('mrs-editor-open'); if (v !== null) return v === '1'; } catch { /* ignore */ }
        return !(code.html.trim() || code.js.trim());
    });
    const setOpen = (v: boolean) => { setOpenState(v); try { localStorage.setItem('mrs-editor-open', v ? '1' : '0'); } catch { /* ignore */ } };
    const errCount = logs.filter((l) => l.type === 'error').length;

    const simpleValue = code.html.trim() ? code.html : code.js;
    const setSimple = (v: string) => setCode(isHtml(v) ? { html: v, css: '', js: '' } : { html: '', css: '', js: v });

    const paste = async () => {
        try {
            const t = await navigator.clipboard.readText();
            if (!t.trim()) { notify('Clipboard kosong.'); return; }
            if (split) setCode((c) => ({ ...c, [lang]: t }));
            else setSimple(t);
            notify(`Kode ditempel (${t.split('\n').length} baris).`);
        } catch {
            notify('Browser tidak mengizinkan akses clipboard. Tekan lama di editor lalu pilih Tempel.');
        }
    };

    const empty = !code.html.trim() && !code.css.trim() && !code.js.trim();
    const kind = !simpleValue.trim() ? '' : isHtml(simpleValue) ? 'HTML' : 'JavaScript';
    const lines = (split ? code[lang] : simpleValue).split('\n').length;
    const totalLines = [code.html, code.css, code.js].filter((x) => x.trim()).reduce((s, x) => s + x.split('\n').length, 0);

    if (!open) {
        return (
            <>
                <div className="ed-collapsed">
                    <button className="ed-toggle" onClick={() => setOpen(true)} aria-expanded={false}>
                        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className="ed-label">Kode{kind && <span className="ed-kind">{kind}</span>}</span>
                        <span className="muted ed-sum">{empty ? 'Belum ada kode' : `${totalLines} baris`}</span>
                    </button>
                    <div className="ed-actions">
                        <button className="ghost" onClick={async () => { await paste(); }} title="Tempel dari clipboard" aria-label="Tempel">
                            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="3" width="10" height="11.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><rect x="5.5" y="1.5" width="5" height="3" rx="1" fill="#fff" stroke="currentColor" strokeWidth="1.4" /></svg>
                            <span className="ghost-txt">Tempel</span>
                        </button>
                        <button className="ghost icon" onClick={onReload} aria-label="Muat ulang" title="Muat ulang">
                            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        <button className={`ghost ${errCount ? 'err' : ''}`} onClick={() => { setOpen(true); setConsoleOpen(true); }} aria-label="Konsol">
                            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4l3.5 4-3.5 4M8 12.5h5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="ghost-txt">Konsol</span>{logs.length > 0 && <span className={errCount ? 'badge' : 'badge soft-l'}>{errCount || logs.length}</span>}
                        </button>
                    </div>
                </div>
                {errCount > 0 && (
                    <div className="ed-errline" role="alert">
                        <span>Error: {logs.find((l) => l.type === 'error')?.msg}</span>
                        <button className="ghost sm" onClick={() => { setOpen(true); setConsoleOpen(true); }}>Lihat</button>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <div className="ed-bar">
                <button className="ghost icon" onClick={() => setOpen(false)} aria-label="Sembunyikan editor" title="Sembunyikan editor" aria-expanded={true}>
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 6L8 10.5 12.5 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {split ? (
                    <div className="ed-tabs" role="tablist">
                        {(['html', 'css', 'js'] as Lang[]).map((l) => (
                            <button key={l} role="tab" aria-selected={lang === l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)}>
                                {l.toUpperCase()}{code[l].trim() && <span className="dot" />}
                            </button>
                        ))}
                    </div>
                ) : (
                    <span className="ed-label">Kode{kind && <span className="ed-kind">{kind}</span>}</span>
                )}
                <div className="ed-actions">
                    <button className="ghost" onClick={paste} title="Tempel dari clipboard">
                        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="3" width="10" height="11.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><rect x="5.5" y="1.5" width="5" height="3" rx="1" fill="#fff" stroke="currentColor" strokeWidth="1.4" /></svg>
                        Tempel
                    </button>
                    <button className="ghost icon" onClick={onReload} aria-label="Muat ulang" title="Muat ulang">
                        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <button className="ghost icon" onClick={onClear} disabled={empty} aria-label="Kosongkan" title="Kosongkan">
                        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                    </button>
                </div>
            </div>

            {split ? (
                <CodeEditor lang={lang} value={code[lang]} onChange={(v) => setCode((c) => ({ ...c, [lang]: v }))} />
            ) : (
                <CodeEditor lang="html" value={simpleValue} onChange={setSimple} />
            )}

            <div className="ed-foot">
                <span className="muted">{empty ? 'Tempel kode HTML lengkap atau JavaScript di sini' : `${lines} baris`}</span>
                <span className="spacer" />
                <label className="check">
                    <input type="checkbox" checked={split} onChange={(e) => {
                        if (!e.target.checked && code.css.trim()) { notify('Kosongkan tab CSS dulu, atau gabungkan ke HTML.'); return; }
                        setSplit(e.target.checked);
                    }} /> Pisah HTML/CSS/JS
                </label>
                <button className={`ghost ${errCount ? 'err' : ''}`} onClick={() => setConsoleOpen(!consoleOpen)} aria-expanded={consoleOpen}>
                    Konsol{logs.length > 0 && <span className={errCount ? 'badge' : 'badge soft'}>{errCount || logs.length}</span>}
                </button>
            </div>

            {(consoleOpen || errCount > 0) && (
                <div className="console">
                    <div className="console-h">
                        <span>Konsol</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="ghost sm" disabled={logs.length === 0} onClick={clearLogs}>Bersihkan</button>
                            <button className="ghost sm" onClick={() => setConsoleOpen(false)} disabled={errCount > 0} title={errCount > 0 ? 'Konsol tetap terbuka selama ada error' : ''}>Tutup</button>
                        </div>
                    </div>
                    <div className="console-b">
                        {logs.length === 0 ? <div className="empty">Tidak ada pesan.</div> : logs.map((l, i) => <div key={i} className={`log-${l.type}`}>{l.type === 'error' ? 'Error: ' : l.type === 'warn' ? 'Peringatan: ' : ''}{l.msg}{(l.count ?? 1) > 1 && <span className="cnt"> ×{l.count}</span>}</div>)}
                    </div>
                </div>
            )}
        </>
    );
}
