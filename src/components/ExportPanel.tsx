import { useEffect, useRef, useState } from 'react';
import { downloadFile } from '../lib/download';
import { pickVideoMime, renderVideo } from '../lib/renderer.new';
import type { LoopCheck, RenderProgress } from '../lib/renderer.new';
import type { Code, ExportFormat, Settings } from '../lib/types';
import { autoBitrate, dims, formatBytes } from '../lib/types';

interface Props {
    code: Code;
    s: Settings;
    set: (p: Partial<Settings>) => void;
}

interface Result {
    url: string;
    blob: Blob;
    name: string;
    format: ExportFormat;
    note?: string;
    ms: number;
    loop?: LoopCheck;
    frames: number;
    fps: number;
    width: number;
    height: number;
}

export function fmtDur(ms: number): string {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return `${s} dtk`;
    const m = Math.floor(s / 60), r = s % 60;
    if (m < 60) return `${m} mnt ${r} dtk`;
    return `${Math.floor(m / 60)} jam ${m % 60} mnt`;
}

interface Probe { width: number; height: number; duration: number }

function probeMedia(r: Result): Promise<Probe | null> {
    return new Promise((res) => {
        if (r.format === 'png') return res(null);
        const done = (p: Probe | null) => { clearTimeout(to); res(p); };
        const to = setTimeout(() => res(null), 8000);
        if (r.format === 'gif') {
            const img = new Image();
            img.onload = () => done({ width: img.naturalWidth, height: img.naturalHeight, duration: r.frames / r.fps });
            img.onerror = () => done(null);
            img.src = r.url;
            return;
        }
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.muted = true;
        v.onloadedmetadata = () => {
            if (Number.isFinite(v.duration)) return done({ width: v.videoWidth, height: v.videoHeight, duration: v.duration });
            // WebM without a duration index: seek far to force the browser to compute it.
            v.ontimeupdate = () => { v.ontimeupdate = null; done({ width: v.videoWidth, height: v.videoHeight, duration: v.duration }); v.currentTime = 0; };
            v.currentTime = 1e7;
        };
        v.onerror = () => done(null);
        v.src = r.url;
    });
}

function Row({ k, v, ok }: { k: string; v: string; ok?: boolean | null }) {
    return (
        <div className="drow">
            <span className="dk">{k}</span>
            <span className="dv">{v}{ok === false && <span className="dwarn"> periksa</span>}</span>
        </div>
    );
}

function ResultDetails({ result, targetMbps }: { result: Result; targetMbps: number }) {
    const [p, setP] = useState<Probe | null | 'loading'>('loading');
    useEffect(() => { let on = true; probeMedia(result).then((x) => on && setP(x)); return () => { on = false; }; }, [result]);
    const expectDur = result.frames / result.fps;
    const probe = p === 'loading' ? null : p;
    const dur = probe?.duration ?? expectDur;
    const mbps = (result.blob.size * 8) / Math.max(0.01, dur) / 1_000_000;
    const isVideo = result.format === 'mp4' || result.format === 'webm';
    const codec = result.format === 'mp4' ? 'H.264 (AVC)' : result.format === 'webm' ? (result.note?.includes('real-time') ? 'VP8/VP9' : 'VP9') : result.format === 'gif' ? 'GIF 256 warna' : 'PNG lossless';
    return (
        <div className="details">
            <div className="details-h">Detail file {p === 'loading' && <span className="muted">· membaca file…</span>}</div>
            <Row k="Resolusi" v={probe ? `${probe.width} × ${probe.height}` : `${result.width} × ${result.height}`} ok={probe ? probe.width === result.width && probe.height === result.height : null} />
            <Row k="Durasi" v={`${dur.toFixed(2)} dtk`} ok={probe ? Math.abs(probe.duration - expectDur) < 0.15 : null} />
            <Row k="Frame rate" v={`${result.fps} fps · ${result.frames} frame`} />
            <Row k="Codec" v={codec} />
            {isVideo && <Row k="Bitrate rata-rata" v={`${mbps.toFixed(1)} Mbps (target ${targetMbps})`} ok={mbps >= targetMbps * 0.4} />}
            <Row k="Ukuran" v={formatBytes(result.blob.size)} />
            {isVideo && mbps < targetMbps * 0.4 && (
                <p className="hint warn" style={{ marginTop: 6 }}>Bitrate jauh di bawah target. Encoder di perangkat ini membatasinya, atau animasinya sangat sederhana sehingga mudah dikompres. Kalau gambar terlihat blur atau kotak-kotak, render di laptop/PC.</p>
            )}
            {probe === null && p !== 'loading' && isVideo && <p className="hint" style={{ marginTop: 6 }}>File tidak bisa dibaca ulang oleh browser ini, nilai di atas berasal dari setting render.</p>}
        </div>
    );
}

function LoopBadge({ loop }: { loop: LoopCheck }) {
    const map = {
        seamless: { cls: 'loop ok', title: 'Loop mulus', desc: 'Frame terakhir menyambung ke frame pertama. Aman diputar berulang.' },
        near: { cls: 'loop near', title: 'Loop hampir mulus', desc: 'Ada sedikit lompatan saat video diulang. Coba sesuaikan durasi dengan siklus animasi.' },
        jump: { cls: 'loop bad', title: 'Loop tidak menyambung', desc: 'Ada lompatan jelas saat video diulang. Durasi tidak sama dengan siklus animasi, atau animasinya memang tidak berulang.' },
    }[loop.verdict];
    return (
        <div className={map.cls}>
            <div className="loop-h">
                <b>{map.title}</b>
                <span className="muted">selisih {loop.diff.toFixed(2)}%</span>
            </div>
            <span>{map.desc}</span>
        </div>
    );
}

const FORMATS: { id: ExportFormat; label: string; desc: string }[] = [
    { id: 'mp4', label: 'MP4', desc: 'H.264, paling kompatibel' },
    { id: 'webm', label: 'WebM', desc: 'VP9, mendukung alpha' },
    { id: 'gif', label: 'GIF', desc: 'Animasi loop ringan' },
    { id: 'png', label: 'PNG sequence', desc: 'ZIP berisi frame' },
];

export function ExportPanel({ code, s, set }: Props) {
    const [format, setFormat] = useState<ExportFormat>('mp4');
    const [busy, setBusy] = useState(false);
    const [prog, setProg] = useState<RenderProgress | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [result, setResult] = useState<Result | null>(null);
    const cancel = useRef(false);
    const host = useRef<HTMLDivElement>(null);
    const { W, H } = dims(s);
    const effBitrate = s.autoBitrate ? autoBitrate(W, H, s.fps) : s.bitrate;
    const startAt = useRef(0);
    const firstFrameAt = useRef<{ frame: number; at: number } | null>(null);
    const [now, setNow] = useState(0);

    useEffect(() => {
        if (!busy) return;
        const id = setInterval(() => setNow(performance.now()), 500);
        return () => clearInterval(id);
    }, [busy]);

    useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

    const supported = (f: ExportFormat) => (f === 'mp4' || f === 'webm' ? !!pickVideoMime(f, false) : true);

    const start = async () => {
        if (!host.current) return;
        setErr(null);
        setBusy(true);
        cancel.current = false;
        const t0 = performance.now();
        startAt.current = t0;
        firstFrameAt.current = null;
        setNow(t0);
        const onProg = (p: RenderProgress) => {
            if (p.phase === 'Merender frame' && p.frame === 1) firstFrameAt.current = { frame: 1, at: performance.now() };
            setProg(p);
        };
        try {
            const r = await renderVideo(code, { ...s, bitrate: effBitrate }, format, host.current, onProg, () => cancel.current);
            const name = `${s.fileName || 'motion'}_${W}x${H}.${r.ext}`;
            if (result) URL.revokeObjectURL(result.url);
            setResult({ url: URL.createObjectURL(r.blob), blob: r.blob, name, format, note: r.note, ms: performance.now() - t0, loop: r.loop, frames: r.frames, fps: r.fps, width: r.width, height: r.height });
        } catch (e) {
            const m = e instanceof Error ? e.message : String(e);
            if (m !== '__cancel__') setErr(m);
        } finally {
            setBusy(false);
            setProg(null);
        }
    };

    const save = async () => {
        if (!result) return;
        try {
            await downloadFile(result.name, result.blob);
        } catch (e) {
            setErr(e instanceof Error ? e.message : String(e));
        }
    };

    const pct = prog ? Math.round((prog.frame / prog.total) * 100) : 0;
    const elapsed = busy ? now - startAt.current : 0;
    let eta: number | null = null;
    if (busy && prog && prog.phase === 'Merender frame' && prog.frame >= 3 && firstFrameAt.current) {
        const done = prog.frame - firstFrameAt.current.frame;
        const spent = now - firstFrameAt.current.at;
        if (done > 0 && spent > 0) eta = ((prog.total - prog.frame) * spent) / done + 1500;
    } else if (busy && prog && prog.phase !== 'Merender frame' && prog.frame === prog.total) {
        eta = 2000;
    }

    return (
        <div className="panel">
            <h3>Format export</h3>
            <div className="formats" role="radiogroup" aria-label="Format export">
                {FORMATS.map((f) => (
                    <button key={f.id} role="radio" aria-checked={format === f.id} className={`fmt ${format === f.id ? 'on' : ''}`} onClick={() => setFormat(f.id)} disabled={busy}>
                        <b>{f.label}</b>
                        <span>{supported(f.id) ? f.desc : 'Tidak didukung browser ini'}</span>
                    </button>
                ))}
            </div>

            {(format === 'mp4' || format === 'webm') && (
                <div className="field">
                    <label className="check" style={{ marginBottom: 6 }}>
                        <input type="checkbox" checked={s.autoBitrate} onChange={(e) => set({ autoBitrate: e.target.checked })} /> Bitrate otomatis sesuai resolusi dan FPS
                    </label>
                    <label htmlFor="br">Bitrate: {effBitrate} Mbps{s.autoBitrate ? ' (otomatis)' : ''}</label>
                    <input id="br" type="range" min={1} max={100} value={effBitrate} disabled={s.autoBitrate} onChange={(e) => set({ bitrate: Number(e.target.value) })} />
                    <p className="hint">Perkiraan ukuran: {formatBytes((effBitrate * 1_000_000 * s.duration) / 8)}. Untuk microstock 4K, pakai 50–100 Mbps.</p>
                </div>
            )}
            {format === 'gif' && (
                <>
                    <div className="row2">
                        <div className="field">
                            <label htmlFor="gs">Skala</label>
                            <select id="gs" value={s.gifScale} onChange={(e) => set({ gifScale: Number(e.target.value) })}>
                                <option value={0.25}>25%</option>
                                <option value={0.5}>50%</option>
                                <option value={0.75}>75%</option>
                                <option value={1}>100%</option>
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="gf">FPS GIF</label>
                            <select id="gf" value={s.gifFps} onChange={(e) => set({ gifFps: Number(e.target.value) })}>
                                {[10, 12, 15, 20, 25, 30, 50].map((f) => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>
                    <label className="check"><input type="checkbox" checked={s.dither} onChange={(e) => set({ dither: e.target.checked })} /> Dithering (gradasi lebih halus)</label>
                    <p className="hint">Ukuran GIF: {Math.round(W * s.gifScale)} × {Math.round(H * s.gifScale)} px</p>
                </>
            )}

            <div className="field">
                <label htmlFor="fn">Nama file</label>
                <input id="fn" value={s.fileName} onChange={(e) => set({ fileName: e.target.value.replace(/[^\w\- ]/g, '') })} />
            </div>

            {!busy ? (
                <button className="primary" onClick={start} disabled={!supported(format)}>Render video</button>
            ) : (
                <div className="progress">
                    <div className="progress-top">
                        <span>{prog?.phase ?? 'Menyiapkan'} {prog && prog.frame > 0 && prog.phase === 'Merender frame' ? `${prog.frame}/${prog.total}` : ''}</span>
                        <span>{pct}%</span>
                    </div>
                    <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${pct}%` }} /></div>
                    <div className="eta">
                        <span>Berjalan {fmtDur(elapsed)}</span>
                        <span>{eta === null ? 'Menghitung sisa waktu…' : `Sisa sekitar ${fmtDur(eta)}`}</span>
                    </div>
                    {eta !== null && <span className="hint" style={{ margin: 0 }}>Perkiraan selesai pukul {new Date(Date.now() + eta).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}. Jangan tutup atau pindah tab supaya render tidak melambat.</span>}
                    <button className="secondary" onClick={() => (cancel.current = true)}>Batalkan</button>
                </div>
            )}

            {err && <div className="error" role="alert"><b>Render gagal.</b> {err}</div>}

            {result && !busy && (
                <div className="result">
                    <h3>Hasil render</h3>
                    {result.format === 'png' ? (
                        <p className="hint">Arsip ZIP berisi {Math.round(s.duration * s.fps)} frame PNG.</p>
                    ) : result.format === 'gif' ? (
                        <img className="result-media checker" src={result.url} alt="Hasil GIF" />
                    ) : (
                        <video className="result-media checker" src={result.url} controls loop muted autoPlay playsInline />
                    )}
                    <div className="result-meta">
                        <span>{result.name}</span>
                        <span>{formatBytes(result.blob.size)} · selesai dalam {fmtDur(result.ms)}</span>
                    </div>
                    <ResultDetails result={result} targetMbps={effBitrate} />
                    {result.loop && <LoopBadge loop={result.loop} />}
                    {result.note && <p className="hint warn">{result.note}</p>}
                    <button className="primary" onClick={save}>Unduh file</button>
                </div>
            )}
            <div ref={host} />
        </div>
    );
}
