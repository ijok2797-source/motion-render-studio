import { useCallback, useEffect, useRef, useState } from 'react';
import { buildDoc } from '../lib/shim';
import type { Code, Settings } from '../lib/types';
import { dims } from '../lib/types';
import { ScaleBar } from './ScaleBar';
import { StillButton } from './StillButton';
import { Timeline, timecode } from './Timeline';

interface Props {
    code: Code;
    settings: Settings;
    reloadKey: number;
    set: (p: Partial<Settings>) => void;
}

export function Preview({ code, settings, reloadKey, set }: Props) {
    const [full, setFull] = useState(false);
    const { W, H } = dims(settings);
    const durMs = settings.duration * 1000;
    const wrap = useRef<HTMLDivElement>(null);
    const iframe = useRef<HTMLIFrameElement>(null);
    const [scale, setScale] = useState(0.3);
    const [playing, setPlaying] = useState(true);
    const [loop, setLoop] = useState(true);
    const [time, setTime] = useState(0);
    const timeRef = useRef(0);
    const ready = useRef(false);
    const pendingSeek = useRef<number | null>(null);

    const post = (t: number) => iframe.current?.contentWindow?.postMessage({ __mcmd: 'step', t }, '*');

    const load = useCallback(() => {
        ready.current = false;
        timeRef.current = 0;
        setTime(0);
        if (iframe.current) iframe.current.srcdoc = buildDoc(code, settings.bgMode, false, 1, settings.duration, settings.fps);
    }, [code, settings.bgMode, settings.duration, settings.fps]);

    useEffect(() => {
        const t = setTimeout(load, 350);
        return () => clearTimeout(t);
    }, [load, reloadKey]);

    useEffect(() => {
        const el = wrap.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const r = el.getBoundingClientRect();
            setScale(Math.max(0.01, Math.min((r.width - 24) / W, (r.height - 24) / H)));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [W, H]);

    // Frame announces readiness via postMessage
    useEffect(() => {
        const on = (e: MessageEvent) => {
            if (!iframe.current || e.source !== iframe.current.contentWindow) return;
            if (e.data?.__motion && e.data.type === 'ready') {
                ready.current = true;
                const t = pendingSeek.current ?? 0;
                pendingSeek.current = null;
                post(t);
                timeRef.current = t;
                setTime(t);
            }
        };
        window.addEventListener('message', on);
        return () => window.removeEventListener('message', on);
    }, []);

    useEffect(() => {
        if (!playing) return;
        let id = 0;
        let last = performance.now();
        const tick = (now: number) => {
            const dt = Math.min(100, now - last);
            last = now;
            if (ready.current) {
                const next = timeRef.current + dt;
                if (next >= durMs) {
                    if (loop) {
                        load();
                    } else {
                        post(durMs);
                        timeRef.current = durMs;
                        setTime(durMs);
                        setPlaying(false);
                        return;
                    }
                } else {
                    post(next);
                    timeRef.current = next;
                    setTime(next);
                }
            }
            id = requestAnimationFrame(tick);
        };
        id = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(id);
    }, [playing, loop, durMs, load]);

    const seek = (t: number) => {
        setPlaying(false);
        if (t >= timeRef.current && ready.current) {
            post(t);
            timeRef.current = t;
            setTime(t);
        } else {
            pendingSeek.current = t;
            setTime(t);
            load();
        }
    };

    const bgStyle: React.CSSProperties =
        settings.bgMode === 'color'
            ? { background: settings.bgColor }
            : settings.bgMode === 'image' && settings.bgImage
              ? { backgroundImage: `url(${settings.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : settings.bgMode === 'transparent'
                ? { backgroundColor: '#fff', backgroundImage: 'conic-gradient(#d9d9d9 25%, #fff 0 50%, #d9d9d9 0 75%, #fff 0)', backgroundSize: '20px 20px' }
                : { background: '#fff' };

    const cur = Math.min(time, durMs);
    const frameNo = Math.floor((cur / 1000) * settings.fps + 1e-6);
    const totalFrames = Math.round(settings.duration * settings.fps);
    const stepFrame = (d: number) => seek(Math.max(0, Math.min(durMs, (frameNo + d) * (1000 / settings.fps))));
    const [flash, setFlash] = useState<string | null>(null);
    const toggle = () => { if (!playing && timeRef.current >= durMs - 1) seek(0); setPlaying((p) => !p); };

    // Keyboard shortcuts like a video editor: Space play/pause, arrows step frames, Home/End, F fullscreen, Esc exits.
    const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
    keyRef.current = (e: KeyboardEvent) => {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.isContentEditable)) return;
        const k = e.key;
        if (k === ' ' || k === 'k' || k === 'K') { e.preventDefault(); toggle(); setFlash(playing ? 'pause' : 'play'); }
        else if (k === 'ArrowRight' || k === '.') { e.preventDefault(); stepFrame(e.shiftKey ? settings.fps : 1); }
        else if (k === 'ArrowLeft' || k === ',') { e.preventDefault(); stepFrame(e.shiftKey ? -settings.fps : -1); }
        else if (k === 'Home') { e.preventDefault(); seek(0); }
        else if (k === 'End') { e.preventDefault(); seek(durMs); }
        else if (k === 'f' || k === 'F') { e.preventDefault(); setFull((f) => !f); }
        else if (k === 'Escape' && full) setFull(false);
        else if (k === 'l' || k === 'L') setLoop((l) => !l);
    };
    useEffect(() => {
        const h = (e: KeyboardEvent) => keyRef.current(e);
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, []);
    useEffect(() => {
        if (!flash) return;
        const id = setTimeout(() => setFlash(null), 450);
        return () => clearTimeout(id);
    }, [flash]);
    const [hint, setHint] = useState(false);

    return (
        <div className={`preview${full ? ' fullview' : ''}`}>
            <div className="pv-head">
                <span className="pv-tc" aria-label="Timecode">{timecode(cur, settings.fps)}</span>
                <span className="pv-info">
                    <b>{W}×{H}</b><span>{settings.fps} fps</span><span>Frame {frameNo}/{totalFrames}</span>
                    {(settings.zoom !== 100 || settings.offsetX !== 0 || settings.offsetY !== 0) && <span>Skala {settings.zoom}%</span>}
                </span>
            </div>
            <div className="stage-wrap" ref={wrap}>
                <button className="icon-btn fs-btn" aria-label={full ? 'Keluar layar penuh' : 'Layar penuh'} title={full ? 'Keluar layar penuh' : 'Layar penuh'} onClick={() => setFull(!full)}>
                    {full ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                </button>
                <div className="stage" style={{ width: W * scale, height: H * scale, ...bgStyle }} onClick={() => { toggle(); setFlash(playing ? 'pause' : 'play'); }} onDoubleClick={() => setFull((f) => !f)}>
                    {flash && (
                        <div className="stage-flash" aria-hidden="true">
                            {flash === 'play'
                                ? <svg width="28" height="28" viewBox="0 0 16 16"><path d="M5 3l8 5-8 5z" fill="currentColor" /></svg>
                                : <svg width="28" height="28" viewBox="0 0 16 16"><rect x="4" y="3" width="3" height="10" fill="currentColor" /><rect x="9" y="3" width="3" height="10" fill="currentColor" /></svg>}
                        </div>
                    )}
                    <iframe
                        ref={iframe}
                        title="Pratinjau animasi"
                        sandbox="allow-scripts"
                        tabIndex={-1}
                        style={{
                            pointerEvents: 'none',
                            width: W, height: H, border: 0, background: 'transparent', transformOrigin: '0 0',
                            transform: `scale(${scale}) translate(${(settings.offsetX || 0) / 100 * W}px, ${(settings.offsetY || 0) / 100 * H}px) translate(${W / 2}px, ${H / 2}px) scale(${(settings.zoom || 100) / 100}) translate(${-W / 2}px, ${-H / 2}px)`,
                        }}
                    />
                </div>
            </div>
            <Timeline
                durMs={durMs}
                timeMs={cur}
                fps={settings.fps}
                rangeStart={settings.rangeStart}
                rangeEnd={settings.rangeEnd}
                onSeek={seek}
                onRange={(a, b) => set({ rangeStart: Math.max(0, a), rangeEnd: b })}
            />
            <div className="transport">
                <button className="icon-btn" aria-label="Frame sebelumnya" title="Frame sebelumnya" onClick={() => stepFrame(-1)}>
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3v10M13 3L6 8l7 5z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                </button>
                <button className={`icon-btn play${playing ? ' is-playing' : ''}`} aria-label={playing ? 'Jeda' : 'Putar'} title="Putar / jeda (Spasi)" onClick={toggle}>
                    {playing ? (
                        <svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor" /></svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 2l10 6-10 6z" fill="currentColor" /></svg>
                    )}
                </button>
                <button className="icon-btn" aria-label="Frame berikutnya" title="Frame berikutnya" onClick={() => stepFrame(1)}>
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 3v10M3 3l7 5-7 5z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                </button>
                <button className="icon-btn" aria-label="Ulang dari awal" title="Ke awal" onClick={() => { seek(0); setPlaying(true); }}>
                    <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 2v12M14 2L5 8l9 6z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" /></svg>
                </button>
                <span className="tc muted">{(cur / 1000).toFixed(2)} / {(durMs / 1000).toFixed(2)} dtk</span>
                <label className="check">
                    <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> Ulang
                </label>
                <StillButton code={code} s={settings} timeMs={cur} />
                <span className="spacer" />
                <div className="kbd-wrap">
                    <button className="ghost sm" onClick={() => setHint((h) => !h)} aria-expanded={hint} title="Pintasan keyboard">
                        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="4" width="13" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M4 7h1M7 7h1M10 7h1M5 9.5h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                        Pintasan
                    </button>
                    {hint && (
                        <div className="kbd-pop" role="dialog" aria-label="Pintasan keyboard">
                            <div><kbd>Spasi</kbd> Putar / jeda</div>
                            <div><kbd>←</kbd> <kbd>→</kbd> Mundur / maju 1 frame</div>
                            <div><kbd>Shift</kbd> + <kbd>←</kbd> <kbd>→</kbd> Lompat 1 detik</div>
                            <div><kbd>Home</kbd> <kbd>End</kbd> Ke awal / akhir</div>
                            <div><kbd>F</kbd> Layar penuh</div>
                            <div><kbd>L</kbd> Ulang on/off</div>
                            <div className="muted">Sentuh pratinjau untuk putar/jeda, ketuk dua kali untuk layar penuh.</div>
                        </div>
                    )}
                </div>
            </div>
            <ScaleBar s={settings} set={set} />
        </div>
    );
}
