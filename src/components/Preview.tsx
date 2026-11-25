import { useCallback, useEffect, useRef, useState } from 'react';
import { buildDoc } from '../lib/shim';
import type { Code, Settings } from '../lib/types';
import { dims } from '../lib/types';

interface Props {
    code: Code;
    settings: Settings;
    reloadKey: number;
}

const fmt = (ms: number) => (ms / 1000).toFixed(2) + ' dtk';

export function Preview({ code, settings, reloadKey }: Props) {
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
        if (iframe.current) iframe.current.srcdoc = buildDoc(code, settings.bgMode);
    }, [code, settings.bgMode]);

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

    return (
        <div className="preview">
            <div className="stage-wrap" ref={wrap}>
                <div className="stage" style={{ width: W * scale, height: H * scale, ...bgStyle }}>
                    <iframe
                        ref={iframe}
                        title="Pratinjau animasi"
                        sandbox="allow-scripts"
                        style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: '0 0', border: 0, background: 'transparent' }}
                    />
                </div>
            </div>
            <div className="transport">
                <button className="icon-btn play" aria-label={playing ? 'Jeda' : 'Putar'} onClick={() => {
                    if (!playing && timeRef.current >= durMs - 1) seek(0);
                    setPlaying(!playing);
                }}>
                    {playing ? (
                        <svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor" /></svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 2l10 6-10 6z" fill="currentColor" /></svg>
                    )}
                </button>
                <button className="icon-btn" aria-label="Ulang dari awal" onClick={() => { seek(0); setPlaying(true); }}>
                    <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 2v12M14 2L5 8l9 6z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" /></svg>
                </button>
                <input
                    type="range"
                    aria-label="Posisi waktu"
                    min={0}
                    max={durMs}
                    step={1000 / settings.fps}
                    value={Math.min(time, durMs)}
                    onChange={(e) => seek(Number(e.target.value))}
                />
                <span className="tc">{fmt(Math.min(time, durMs))} / {fmt(durMs)}</span>
                <span className="tc muted">Frame {Math.floor((Math.min(time, durMs) / 1000) * settings.fps)}</span>
                <label className="check">
                    <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> Ulang
                </label>
            </div>
            <div className="meta">
                <span className="chip">{W} × {H}</span>
                <span className="chip">{settings.fps} fps</span>
                <span className="chip">{settings.duration} dtk</span>
                <span className="chip">{Math.round(settings.duration * settings.fps)} frame</span>
            </div>
        </div>
    );
}
