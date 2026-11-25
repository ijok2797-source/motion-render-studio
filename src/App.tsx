/* Build prompt
Motion Render Studio — converts pasted HTML/CSS/JS motion code (CSS keyframes, GSAP, anime.js, Canvas) into video.
Art direction: soft neumorphic hardware console (like a premium audio interface / camera control surface):
one matte grey-blue body color (#e4e6ec light, #23262c dark) with raised panels and inset wells made of paired light/dark
shadows, pill tab switches, pressed state for active controls, a single orange accent (#c2410c / #f0682a) for active
state, playhead and render button; dark inset well for code. System sans for UI, monospace for code and timecode. Indonesian UI.
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
import { TEMPLATES } from './lib/templates';
import type { Code, Log, Settings } from './lib/types';
import { DEFAULT_SETTINGS } from './lib/types';
import { CSS } from './styles.new';
import { NEO_DARK } from './styles.neoDark';

const KEY = 'motion-render-studio-v1';

function loadSaved(): { code: Code; settings: Settings } {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
            const p = JSON.parse(raw);
            return { code: p.code, settings: { ...DEFAULT_SETTINGS, ...p.settings, capture: 'auto' } };
        }
    } catch { /* ignore */ }
    return { code: TEMPLATES[0].code, settings: DEFAULT_SETTINGS };
}

export const App = () => {
    const [init] = useState(loadSaved);
    const [code, setCode] = useState<Code>(init.code);
    const [settings, setSettings] = useState<Settings>(init.settings);
    const [side, setSide] = useState<'settings' | 'export'>('settings');
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

    const clearAll = () => {
        const prev = code;
        setCode({ html: '', css: '', js: '' });
        setToast({ msg: 'Semua kode dikosongkan.', undo: () => setCode(prev) });
    };

    const exportProject = async () => {
        const blob = new Blob([JSON.stringify({ app: 'motion-render-studio', code, settings }, null, 2)], { type: 'application/json' });
        try { await downloadFile(`${settings.fileName || 'motion'}.motion.json`, blob); } catch (e) { setToast({ msg: e instanceof Error ? e.message : 'Gagal menyimpan proyek.' }); }
    };

    const importProject = (f: File | undefined) => {
        if (!f) return;
        f.text().then((t) => {
            try {
                const p = JSON.parse(t);
                if (!p.code) throw new Error();
                const prev = { code, settings };
                setCode({ html: p.code.html ?? '', css: p.code.css ?? '', js: p.code.js ?? '' });
                setSettings({ ...DEFAULT_SETTINGS, ...p.settings, capture: 'auto' });
                setToast({ msg: `Proyek ${f.name} dibuka.`, undo: () => { setCode(prev.code); setSettings(prev.settings); } });
            } catch {
                setToast({ msg: 'File proyek tidak valid.' });
            }
        });
    };


    return (
        <div className={`app${dark ? ' dark' : ''}`}>
            <style>{CSS + NEO_DARK}</style>
            <header className="top">
                <div className="brand">
                    <div className="logo" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M5 3.5l8 4.5-8 4.5z" fill="#fff" /><rect x="1.5" y="3" width="2" height="10" rx="1" fill="#fdba74" /></svg>
                    </div>
                    <div className="brand-text">
                        <h1>Motion Render Studio</h1>
                        <span className="sub">Kode HTML, CSS, JS jadi video siap pakai</span>
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
                        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 4.5v8h13v-7H8L6.5 4z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                        Buka
                        <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => { importProject(e.target.files?.[0]); e.target.value = ''; }} />
                    </label>
                    <button className="secondary" onClick={exportProject}>
                        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M4.5 6.5L8 10l3.5-3.5M2 13.5h12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Simpan proyek
                    </button>
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
                    />
                </section>

                <section className="col col-preview" aria-label="Pratinjau">
                    <Preview code={code} settings={settings} reloadKey={reloadKey} />
                </section>

                <aside className="col col-side">
                    <div className="side-tabs" role="tablist">
                        <button role="tab" aria-selected={side === 'settings'} className={side === 'settings' ? 'on' : ''} onClick={() => setSide('settings')}>Pengaturan</button>
                        <button role="tab" aria-selected={side === 'export'} className={side === 'export' ? 'on' : ''} onClick={() => setSide('export')}>Export</button>
                    </div>
                    <div style={{ display: side === 'settings' ? 'block' : 'none' }}><SettingsPanel s={settings} set={set} code={code} /></div>
                    <div style={{ display: side === 'export' ? 'block' : 'none' }}><ExportPanel code={code} s={settings} set={set} /></div>
                </aside>
            </main>

            {toast && (
                <div className="toast" role="status">
                    <span>{toast.msg}</span>
                    {toast.undo && <button onClick={() => { toast.undo!(); setToast(null); }}>Urungkan</button>}
                </div>
            )}
        </div>
    );
};

export default App;
