import { PixelIcon } from './PixelIcon';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CodeEditor } from './CodeEditor';
import type { Code, Lang, Log } from '../lib/types';
import { fixCode, formatCode } from '../lib/fixCode';
import type { FixResult } from '../lib/fixCode';

interface Props {
    code: Code;
    setCode: (c: Code | ((c: Code) => Code)) => void;
    logs: Log[];
    clearLogs: () => void;
    onReload: () => void;
    onClear: () => void;
    notify: (m: string) => void;
    onFileName: (fileName: string) => void;
    onPasted: () => void;
}

const isHtml = (s: string) => /^\s*</.test(s);

export function EditorPane({ code, setCode, logs, clearLogs, onReload, onClear, notify, onFileName, onPasted }: Props) {
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
            onPasted();
            notify(`Kode ditempel (${t.split('\n').length} baris).`);
        } catch {
            notify('Browser tidak mengizinkan akses clipboard. Tekan lama di editor lalu pilih Tempel.');
        }
    };

    const empty = !code.html.trim() && !code.css.trim() && !code.js.trim();
    const [report, setReport] = useState<FixResult | null>(null);
    const [prevCode, setPrevCode] = useState<Code | null>(null);
    const curLang: Lang = split ? lang : (isHtml(simpleValue) ? 'html' : 'js');
    const curValue = split ? code[lang] : simpleValue;
    const apply = (v: string) => { if (split) setCode((c) => ({ ...c, [lang]: v })); else setSimple(v); };
    const runFix = () => {
        const r = fixCode(curValue, curLang);
        setReport(r);
        if (r.code !== curValue) { setPrevCode(code); apply(r.code); }
        else setPrevCode(null);
    };
    const runFormat = () => {
        const f = formatCode(curValue);
        if (f === curValue) { notify('Indentasi sudah rapi.'); return; }
        setPrevCode(code); apply(f);
        setReport({ code: f, changes: ['Indentasi dirapikan.'], error: null });
    };
    const fileInput = useRef<HTMLInputElement>(null);
    const openFile = async (f: File | undefined) => {
        if (!f) return;
        if (f.size > 5_000_000) { notify('File terlalu besar (maksimal 5 MB).'); return; }
        let t = '';
        try { t = await f.text(); } catch { notify('File tidak bisa dibaca.'); return; }
        if (!t.trim()) { notify('File kosong.'); return; }
        const ext = (f.name.split('.').pop() || '').toLowerCase();
        setPrevCode(code); setReport(null);
        if (split) {
            const target: Lang = ext === 'css' ? 'css' : ext === 'js' || ext === 'mjs' ? 'js' : ext === 'html' || ext === 'htm' ? 'html' : lang;
            setCode((c) => ({ ...c, [target]: t }));
            setLang(target);
        } else if (ext === 'css') {
            setCode((c) => ({ ...c, css: t }));
            setSplit(true); setLang('css');
        } else setSimple(t);
        onFileName(f.name);
        notify(`${f.name} dimuat (${t.split('\n').length} baris).`);
    };
    const undo = () => { if (prevCode) { setCode(prevCode); setPrevCode(null); setReport(null); notify('Perubahan dibatalkan.'); } };
    const kind = !simpleValue.trim() ? '' : isHtml(simpleValue) ? 'HTML' : 'JavaScript';
    const lines = (split ? code[lang] : simpleValue).split('\n').length;
    const totalLines = [code.html, code.css, code.js].filter((x) => x.trim()).reduce((s, x) => s + x.split('\n').length, 0);

    const collapsedBar = (
            <>
                <div className="ed-collapsed">
                    <button className="ed-toggle" onClick={() => setOpen(true)} aria-expanded={false}>
                        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className="ed-label">Kode{kind && <span className="ed-kind">{kind}</span>}</span>
                        <span className="muted ed-sum">{empty ? 'Belum ada kode' : `${totalLines} baris`}</span>
                    </button>
                    <div className="ed-actions">
                        <button className="ghost" onClick={async () => { await paste(); }} title="Tempel dari clipboard" aria-label="Tempel">
                            <PixelIcon name="paste" />
                            <span className="ghost-txt">Tempel</span>
                        </button>
                        <button className="ghost icon" onClick={onReload} aria-label="Muat ulang" title="Muat ulang">
                            <PixelIcon name="reload" />
                        </button>
                        <button className={`ghost ${errCount ? 'err' : ''}`} onClick={() => { setOpen(true); setConsoleOpen(true); }} aria-label="Konsol">
                            <PixelIcon name="console" />
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
    if (!open) return collapsedBar;

    return (
        <>
        {collapsedBar}
        {createPortal(
        <div className="w95-overlay ed-overlay" role="dialog" aria-modal="true" aria-label="Editor kode" onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}>
        <div className="w95-win ed-win">
            <div className="w95-title">
                <PixelIcon name="console" size={14} />
                <span>Kode{kind ? ` - ${kind}` : ''} - MIV Editor</span>
                <button className="w95-x" onClick={() => setOpen(false)} aria-label="Tutup editor">X</button>
            </div>
            <div className="ed-win-body">
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
                    <button className="ghost fix-btn" onClick={runFix} disabled={empty} title="Perbaiki kode otomatis">
                        <PixelIcon name="fix" />
                        <span className="ghost-txt">Perbaiki</span>
                    </button>
                    <button className="ghost icon" onClick={runFormat} disabled={empty} aria-label="Rapikan indentasi" title="Rapikan indentasi">
                        <PixelIcon name="format" />
                    </button>
                    <button className="ghost" onClick={() => fileInput.current?.click()} title="Buka file kode dari perangkat">
                        <PixelIcon name="open" />
                        <span className="ghost-txt">Buka file</span>
                    </button>
                    <input ref={fileInput} type="file" accept=".html,.htm,.js,.mjs,.css,.txt,.svg,text/html,text/javascript,text/css,text/plain" style={{ display: 'none' }}
                        onChange={(e) => { void openFile(e.target.files?.[0]); e.target.value = ''; }} />
                    <button className="ghost" onClick={paste} title="Tempel dari clipboard">
                        <PixelIcon name="paste" />
                        Tempel
                    </button>
                    <button className="ghost icon" onClick={onReload} aria-label="Muat ulang" title="Muat ulang">
                        <PixelIcon name="reload" />
                    </button>
                </div>
            </div>

            {split ? (
                <CodeEditor lang={lang} value={code[lang]} onChange={(v) => { setReport(null); setPrevCode(null); setCode((c) => ({ ...c, [lang]: v })); }} />
            ) : (
                <CodeEditor lang={isHtml(simpleValue) || !simpleValue.trim() ? 'html' : 'js'} value={simpleValue} onChange={(v) => { setReport(null); setPrevCode(null); setSimple(v); }} />
            )}

            {report && (
                <div className={`fix-report ${report.error ? 'bad' : 'ok'}`} role="status">
                    <div className="fix-h">
                        <b>{report.error ? 'Masih ada error' : report.changes.length ? 'Kode diperbaiki' : 'Tidak ditemukan masalah'}</b>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {prevCode && <button className="ghost sm" onClick={undo}>Urungkan</button>}
                            <button className="ghost sm" onClick={() => setReport(null)}>Tutup</button>
                        </div>
                    </div>
                    {report.changes.length > 0 && <ul>{report.changes.map((c, i) => <li key={i}>{c}</li>)}</ul>}
                    {report.error && <p>{report.error}</p>}
                    {report.error && <p className="muted">Bagian ini tidak bisa diperbaiki otomatis. Cek baris yang disebut, atau salin ulang kode dari sumber aslinya.</p>}
                </div>
            )}

            <div className="ed-foot">
                <span className="muted">{empty ? 'Tempel kode HTML lengkap atau JavaScript di sini' : `${lines} baris`}</span>
                <span className="spacer" />
                <label className="check">
                    <input type="checkbox" checked={split} onChange={(e) => {
                        if (!e.target.checked && (code.css.trim() || (code.html.trim() && code.js.trim()))) {
                            // Merge the three tabs into one HTML so nothing is lost.
                            let h = code.html.trim() ? code.html : '<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n</body>\n</html>';
                            if (code.css.trim()) {
                                const st = '<style>\n' + code.css + '\n</style>\n';
                                h = /<\/head>/i.test(h) ? h.replace(/<\/head>/i, st + '</head>') : st + h;
                            }
                            if (code.js.trim()) {
                                const sc = '<script>\n' + code.js + '\n</' + 'script>\n';
                                h = /<\/body>/i.test(h) ? h.replace(/<\/body>(?![\s\S]*<\/body>)/i, sc + '</body>') : h + '\n' + sc;
                            }
                            setCode({ html: h, css: '', js: '' });
                            notify('HTML, CSS, dan JS digabung jadi satu kode HTML.');
                        }
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
            </div>
            <div className="w95-btns ed-win-btns">
                <button onClick={() => { setPrevCode(code); setReport(null); onClear(); }} disabled={empty} style={{ marginRight: 'auto' }}><PixelIcon name="trash" size={14} /> Hapus kode</button>
                {prevCode && !report && <button onClick={undo}>Urungkan</button>}
                <button onClick={onReload}>Terapkan</button>
                <button className="w95-def" onClick={() => setOpen(false)}>Selesai</button>
            </div>
        </div>
        </div>,
        (document.querySelector('.app') as HTMLElement | null) ?? document.body)}
        </>
    );
}
