/* Build prompt
Motion Render Studio — converts pasted HTML/CSS/JS motion code (CSS keyframes, GSAP, anime.js, Canvas) into video.
Art direction: modern clean product UI (like a current video tool such as a web editor dashboard): light grey canvas
(#f5f6f8) with white rounded panels, thin borders and soft elevation, segmented pill controls, a single orange accent
(#c2410c) for active state, playhead and render button; dark well for code; full dark mode. System sans for UI,
monospace for code and timecode. Indonesian UI.
Layout: 3 columns: editor (HTML/CSS/JS tabs, line numbers, console of errors/logs) | live preview stage at true
output aspect ratio with play/pause, restart, scrubber, timecode, frame counter, loop | side panel tabs Settings / Export.
Features: aspect ratio presets + custom size, resolution 480p-4K, FPS 24-60, duration; background from code / color /
image / transparent; capture mode auto/DOM/canvas; export MP4, WebM (bitrate), GIF (scale, fps, dither), PNG sequence ZIP;
deterministic frame-by-frame render via virtual clock (rAF, timers, performance.now, Web Animations); progress, cancel,
result preview, download; templates; autosave to localStorage; import/export project JSON; reset with Undo.
States: empty editor placeholder, render errors, unsupported format, console empty.
*/
import { useCallback, useEffect, useState } from 'react';
import { downloadFile } from './lib/download';
import { EditorPane } from './components/EditorPane';
import { Preview } from './components/Preview';
import { SettingsPanel } from './components/SettingsPanel';
import { ExportPanel } from './components/ExportPanel';
import { RenderQueue } from './components/RenderQueue';
import { RenderButton } from './components/RenderButton';
import { RenderProvider } from './lib/renderQueue';
import { FilmLogo } from './components/FilmLogo';
import { TEMPLATES } from './lib/templates';
import { detectName, isRandomName, randomMotionName } from './lib/detectName';
import type { Code, Log, Settings } from './lib/types';
import { DEFAULT_SETTINGS, nameFromFileName } from './lib/types';
import { CSS } from './styles.new';
import { NEO_DARK } from './styles.neoDark';
import { MODERN, stripNeo } from './styles.modern';
import { PRO } from './styles.pro';
import { INTERACTIVE } from './styles.interactive';
import { EDITOR } from './styles.editor';
import { PixelIcon } from './components/PixelIcon';
import { RenderDialog } from './components/RenderDialog';
import { RETRO } from './styles.retro';
import { LAYOUT } from './styles.layout';

const KEY = 'motion-render-studio-v1';

function loadSaved(): { code: Code; settings: Settings } {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
            const p = JSON.parse(raw);
            return { code: p.code, settings: { ...DEFAULT_SETTINGS, ...p.settings, capture: 'auto', offsetX: 0, offsetY: 0 } };
        }
    } catch { /* ignore */ }
    return { code: TEMPLATES[0].code, settings: DEFAULT_SETTINGS };
}

export const App = () => {
    const [init] = useState(loadSaved);
    const [code, setCode] = useState<Code>(init.code);
    const [settings, setSettings] = useState<Settings>(init.settings);
    const [side, setSide] = useState<'settings' | 'export' | 'queue'>('settings');
    const [logs, setLogs] = useState<Log[]>([]);
    const [reloadKey, setReloadKey] = useState(0);
    const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
    const [dark, setDarkState] = useState<boolean>(() => {
        try {
            const v = localStorage.getItem('mrs-theme');
            if (v) return v === 'dark';
            return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
        } catch { return false; }
    });
    const toggleDark = () => setDarkState((d) => { try { localStorage.setItem('mrs-theme', d ? 'light' : 'dark'); } catch { /* ignore */ } return !d; });

    const set = useCallback((p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })), []);

    useEffect(() => {
        const t = setTimeout(() => {
            try { localStorage.setItem(KEY, JSON.stringify({ code, settings: { ...settings, bgImage: settings.bgImage && settings.bgImage.length < 2_000_000 ? settings.bgImage : null } })); } catch { /* ignore */ }
        }, 500);
        return () => clearTimeout(t);
    }, [code, settings]);

    useEffect(() => { setLogs([]); }, [code, reloadKey]);

    // Automatic file name: name found in the code, otherwise "motion" + 10 random digits.
    useEffect(() => {
        if (!settings.fileNameAuto) return;
        const t = setTimeout(() => {
            const found = detectName(code);
            setSettings((s) => {
                if (!s.fileNameAuto) return s;
                const next = found ?? (isRandomName(s.fileName) ? s.fileName : randomMotionName());
                return next === s.fileName ? s : { ...s, fileName: next };
            });
        }, 400);
        return () => clearTimeout(t);
    }, [code, settings.fileNameAuto]);

    useEffect(() => {
        const on = (e: MessageEvent) => {
            const d = e.data;
            if (!d || !d.__motion) return;
            setLogs((l) => {
                const i = l.findIndex((x) => x.type === d.type && x.msg === d.msg);
                if (i >= 0) {
                    const c = [...l];
                    c[i] = { ...c[i], count: (c[i].count ?? 1) + 1, time: Date.now() };
                    return c;
                }
                return [...l.slice(-199), { type: d.type, msg: d.msg, time: Date.now(), count: 1 }];
            });
        };
        window.addEventListener('message', on);
        return () => window.removeEventListener('message', on);
    }, []);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 6000);
        return () => clearTimeout(t);
    }, [toast]);

    const applyTemplate = (id: string) => {
        const tpl = TEMPLATES.find((t) => t.id === id);
        if (!tpl) return;
        const prev = { code, settings };
        setCode(tpl.code);
        setSettings({ ...settings, bgMode: 'code', ...tpl.settings });
        setToast({ msg: `Template "${tpl.name}" dimuat.`, undo: () => { setCode(prev.code); setSettings(prev.settings); } });
    };

    const applyFileName = (fname: string) => {
        const n = nameFromFileName(fname);
        if (n) setSettings((s) => ({ ...s, fileName: n, fileNameAuto: false, nameFromFile: true }));
        else setSettings((s) => ({ ...s, fileNameAuto: true, nameFromFile: false }));
    };
    const applyCodeName = () => setSettings((s) => (s.nameFromFile ? { ...s, fileNameAuto: true, nameFromFile: false } : s));

    const clearAll = () => {
        const prev = code;
        applyCodeName();
        setCode({ html: '', css: '', js: '' });
        setToast({ msg: 'Semua kode dikosongkan.', undo: () => setCode(prev) });
    };

    const [dropping, setDropping] = useState(false);

    const importProject = (f: File | undefined) => {
        if (!f) return;
        if (!/\.json$/i.test(f.name)) {
            f.text().then((t) => {
                const prev = code;
                const isHtml = /^\s*</.test(t);
                setCode(isHtml ? { html: t, css: '', js: '' } : /\.css$/i.test(f.name) ? { html: '', css: t, js: '' } : { html: '', css: '', js: t });
                applyFileName(f.name);
                setToast({ msg: `Kode dari ${f.name} dimuat.`, undo: () => setCode(prev) });
            });
            return;
        }
        f.text().then((t) => {
            try {
                const p = JSON.parse(t);
                if (!p.code) throw new Error();
                const prev = { code, settings };
                setCode({ html: p.code.html ?? '', css: p.code.css ?? '', js: p.code.js ?? '' });
                setSettings({ ...DEFAULT_SETTINGS, ...p.settings, capture: 'auto', offsetX: 0, offsetY: 0 });
                setToast({ msg: `Proyek ${f.name} dibuka.`, undo: () => { setCode(prev.code); setSettings(prev.settings); } });
            } catch {
                setToast({ msg: 'File proyek tidak valid.' });
            }
        });
    };


    return (
        <RenderProvider>
        <div
            className={`app${dark ? ' dark' : ''}${dropping ? ' dropping' : ''}`}
            onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDropping(true); } }}
            onDragLeave={(e) => { if (e.currentTarget === e.target) setDropping(false); }}
            onDrop={(e) => { e.preventDefault(); setDropping(false); importProject(e.dataTransfer.files?.[0]); }}
        >
            <style>{stripNeo(CSS) + MODERN + NEO_DARK + PRO + INTERACTIVE + EDITOR + RETRO + LAYOUT}</style>
            {dropping && <div className="drop-hint" aria-hidden="true"><div>Lepaskan file .html, .js, atau .json untuk memuat kode</div></div>}
            <header className="top">
                <div className="brand">
                    <div className="logo3d"><FilmLogo size={40} /></div>
                    <div className="brand-text">
                        <h1 className="mrv-title"><span className="mrv-m">MI</span>V</h1>
                        <span className="sub">Maxime Illust Video</span>
                    </div>
                </div>
                <span className="spacer" />
                <div className="top-actions">
                    <button className="icon-btn" onClick={toggleDark} aria-label={dark ? 'Mode terang' : 'Mode gelap'} title={dark ? 'Mode terang' : 'Mode gelap'}>
                        {dark ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.8 5.8 0 1 0 7.1 7.1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                        )}
                    </button>
                    <select aria-label="Pilih template" value="" onChange={(e) => applyTemplate(e.target.value)}>
                        <option value="" disabled>Template contoh</option>
                        {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <label className="secondary" style={{ cursor: 'pointer' }}>
                        <PixelIcon name="open" />
                        Buka
                        <input type="file" accept=".json,.html,.htm,.js,.css,.txt" style={{ display: 'none' }} onChange={(e) => { importProject(e.target.files?.[0]); e.target.value = ''; }} />
                    </label>
                    <RenderButton code={code} s={settings} onQueued={() => { setSide('queue'); }} />
                </div>
            </header>

            <main className="main">
                <section className="col col-editor" aria-label="Editor kode">
                    <EditorPane
                        code={code}
                        setCode={setCode}
                        logs={logs}
                        clearLogs={() => { setLogs([]); setToast({ msg: 'Konsol dibersihkan.' }); }}
                        onReload={() => setReloadKey((k) => k + 1)}
                        onClear={clearAll}
                        notify={(m) => setToast({ msg: m })}
                        onFileName={applyFileName}
                        onPasted={applyCodeName}
                    />
                </section>

                <section className="col col-preview" aria-label="Pratinjau">
                    <Preview code={code} settings={settings} reloadKey={reloadKey} set={set} />
                </section>

                <aside className="col col-side">
                    <div className="side-tabs" role="tablist">
                        <button role="tab" aria-selected={side === 'settings'} className={side === 'settings' ? 'on' : ''} onClick={() => setSide('settings')}>Pengaturan</button>
                        <button role="tab" aria-selected={side === 'export'} className={side === 'export' ? 'on' : ''} onClick={() => setSide('export')}>Export</button>
                        <button role="tab" aria-selected={side === 'queue'} className={side === 'queue' ? 'on' : ''} onClick={() => setSide('queue')}>Antrian</button>
                    </div>
                    <div className={side === 'settings' ? 'tab-pane on' : 'tab-pane'}><SettingsPanel s={settings} set={set} code={code} /></div>
                    <div className={side === 'export' ? 'tab-pane on' : 'tab-pane'}><ExportPanel s={settings} set={set} /></div>
                    <div className={side === 'queue' ? 'tab-pane on' : 'tab-pane'}><RenderQueue /></div>
                </aside>
            </main>
            <RenderDialog />

            {toast && (
                <div className="toast" role="status">
                    <span>{toast.msg}</span>
                    {toast.undo && <button onClick={() => { toast.undo!(); setToast(null); }}>Urungkan</button>}
                </div>
            )}
        </div>
        </RenderProvider>
    );
};

export default App;
