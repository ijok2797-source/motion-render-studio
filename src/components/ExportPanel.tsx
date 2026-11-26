import { useEffect, useState } from 'react';
import { pickVideoMime } from '../lib/renderer.new';
import { useRender } from '../lib/renderQueue';
import type { LoopCheck } from '../lib/renderer.new';
import type { Code, ExportFormat, Settings } from '../lib/types';
import { autoBitrate, dims, formatBytes, renderRange } from '../lib/types';
import { isRandomName } from '../lib/detectName';
import { RenderOptions } from './RenderOptions';

interface Props {
    code?: Code;
    s: Settings;
    set: (p: Partial<Settings>) => void;
}

export interface Result {
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
    rateMode?: 'cbr' | 'vbr';
    wantCbr?: boolean;
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

export function ResultDetails({ result, targetMbps }: { result: Result; targetMbps: number }) {
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
            {isVideo && <Row k="Mode bitrate" v={result.rateMode === 'cbr' ? 'CBR (konstan)' : result.rateMode === 'vbr' ? 'VBR (variabel)' : 'Rekaman real-time'} ok={result.wantCbr ? result.rateMode === 'cbr' : null} />}
            {isVideo && <Row k="Bitrate rata-rata" v={`${mbps.toFixed(1)} Mbps (target ${targetMbps})`} ok={result.rateMode === 'cbr' ? mbps >= targetMbps * 0.75 : null} />}
            <Row k="Ukuran" v={formatBytes(result.blob.size)} />
            {isVideo && result.wantCbr && result.rateMode !== 'cbr' && (
                <p className="hint warn" style={{ marginTop: 6 }}>Browser atau encoder di perangkat ini tidak mendukung CBR, jadi render memakai VBR. Untuk bitrate konstan, render di Chrome/Edge di laptop atau PC.</p>
            )}
            {isVideo && result.rateMode === 'cbr' && mbps >= targetMbps * 0.75 && (
                <p className="hint ok" style={{ marginTop: 6 }}>Bitrate sesuai target.</p>
            )}
            {isVideo && result.rateMode === 'cbr' && mbps < targetMbps * 0.75 && (
                <p className="hint warn" style={{ marginTop: 6 }}>CBR menghasilkan sekitar {Math.round(mbps)} Mbps, jauh di bawah target. Encoder di perangkat ini kemungkinan tidak benar-benar menjalankan CBR. Coba render ulang dengan VBR, yang di banyak HP justru menghasilkan bitrate lebih tinggi. Kalau gambar terlihat tajam dan tidak kotak-kotak, file ini tetap aman dipakai.</p>
            )}
            {isVideo && result.rateMode !== 'cbr' && !result.wantCbr && mbps < targetMbps * 0.4 && (
                <p className="hint" style={{ marginTop: 6 }}>Pada VBR, encoder hanya memakai data sesuai kebutuhan, dan encoder HP biasanya punya batas maksimal. Bitrate rendah wajar untuk animasi sederhana. Kalau gambar terlihat tajam dan tidak kotak-kotak, file ini aman dipakai. Untuk bitrate lebih tinggi, render di laptop atau PC.</p>
            )}
            {probe === null && p !== 'loading' && isVideo && <p className="hint" style={{ marginTop: 6 }}>File tidak bisa dibaca ulang oleh browser ini, nilai di atas berasal dari setting render.</p>}
        </div>
    );
}

export function LoopBadge({ loop }: { loop: LoopCheck }) {
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
    { id: 'mp4', label: 'MP4', desc: 'H.264, paling kompatibel untuk microstock dan semua pemutar' },
];

export function ExportPanel({ s, set }: Props) {
    const { format, setFormat, enqueue, active } = useRender();
    const { W, H } = dims(s);
    const effBitrate = s.autoBitrate ? autoBitrate(W, H, s.fps) : s.bitrate;
    const supported = (f: ExportFormat) => (f === 'mp4' || f === 'webm' ? !!pickVideoMime(f, false) : true);
    void enqueue; void active;

    return (
        <div className="panel">
            <h3>Format export</h3>
            <div className="formats" role="radiogroup" aria-label="Format export">
                <button role="radio" aria-checked={s.container !== 'mov'} className={`fmt ${s.container !== 'mov' ? 'on' : ''}`} onClick={() => set({ container: 'mp4' })}>
                    <b>MP4</b><span>H.264, paling kompatibel untuk microstock dan semua pemutar</span>
                </button>
                <button role="radio" aria-checked={s.container === 'mov'} className={`fmt ${s.container === 'mov' ? 'on' : ''}`} onClick={() => set({ container: 'mov' })}>
                    <b>MOV</b><span>QuickTime H.264, untuk Premiere, After Effects, Final Cut</span>
                </button>
            </div>
            {!supported('mp4') && <p className="hint warn">Browser ini tidak mendukung encoder video. Coba Chrome atau Edge versi terbaru.</p>}
            {s.container === 'mov' && <p className="hint">MOV di sini memakai H.264 tanpa transparansi. MOV ProRes atau dengan alpha belum bisa dibuat di browser.</p>}
            {false && <div className="formats" role="radiogroup" aria-label="Format export">
                {FORMATS.map((f) => (
                    <button key={f.id} role="radio" aria-checked={format === f.id} className={`fmt ${format === f.id ? 'on' : ''}`} onClick={() => setFormat(f.id)}>
                        <b>{f.label}</b>
                        <span>{supported(f.id) ? f.desc : 'Tidak didukung browser ini'}</span>
                    </button>
                ))}
            </div>}
            {(format === 'mp4' || format === 'webm') && (
                <div className="field">
                    <label className="check" style={{ marginBottom: 6 }}>
                        <input type="checkbox" checked={s.autoBitrate} onChange={(e) => set({ autoBitrate: e.target.checked })} /> Bitrate otomatis sesuai resolusi dan FPS
                    </label>
                    <label htmlFor="br">Bitrate: {effBitrate} Mbps{s.autoBitrate ? ' (otomatis)' : ''}</label>
                    <input id="br" type="range" min={1} max={100} value={effBitrate} disabled={s.autoBitrate} onChange={(e) => set({ bitrate: Number(e.target.value) })} />
                    <p className="hint">Ukuran maksimal: {formatBytes((effBitrate * 1_000_000 * renderRange(s).len) / 8)}. Untuk microstock 4K, pakai 50–100 Mbps.</p>
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

            <RenderOptions s={s} set={set} />

            <div className="field">
                <label htmlFor="fn">Nama file</label>
                <input id="fn" value={s.fileName} onChange={(e) => set({ fileName: e.target.value.replace(/[^\p{L}\p{N}_\- ]/gu, ''), fileNameAuto: false })} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="hint" style={{ margin: 0, flex: 1 }}>
                        {s.fileNameAuto
                            ? (isRandomName(s.fileName) ? 'Nama tidak terdeteksi dari kode, jadi dipakai nama acak.' : 'Nama otomatis dari kode.')
                            : 'Nama diisi manual.'}
                    </span>
                    {!s.fileNameAuto && <button className="ghost sm" onClick={() => set({ fileNameAuto: true })}>Pakai nama otomatis</button>}
                </div>
            </div>

            <p className="hint">Tekan Render di bagian atas untuk menambah video ke antrian. Hasil render ada di tab Antrian.</p>
        </div>
    );
}
