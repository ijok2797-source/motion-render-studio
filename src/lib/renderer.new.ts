import { buildDoc } from './shim';
import { FrameLink } from './frameLink';
import { GifEncoder } from './gif';
import { makeZip } from './zip';
import { FrameEncoder, webCodecsAvailable } from './encoder';
import type { Code, ExportFormat, Settings } from './types';
import { dims } from './types';

export interface RenderProgress {
    phase: string;
    frame: number;
    total: number;
}

export interface LoopCheck {
    diff: number; // 0-100, mean pixel difference between first frame and the frame right after the last
    stepDiff: number; // typical difference between two consecutive frames
    verdict: 'seamless' | 'near' | 'jump';
}

export interface RenderResult {
    blob: Blob;
    ext: string;
    note?: string;
    loop?: LoopCheck;
    frames: number;
    fps: number;
    width: number;
    height: number;
}

const THUMB_W = 96;
function thumb(src: CanvasImageSource, w: number, h: number): Uint8ClampedArray {
    const th = Math.max(1, Math.round((THUMB_W * h) / w));
    const c = document.createElement('canvas');
    c.width = THUMB_W; c.height = th;
    const g = c.getContext('2d')!;
    g.drawImage(src, 0, 0, THUMB_W, th);
    return g.getImageData(0, 0, THUMB_W, th).data;
}
function diffPct(a: Uint8ClampedArray, b: Uint8ClampedArray): number {
    let s = 0;
    for (let i = 0; i < a.length; i += 4) s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) + Math.abs(a[i + 3] - b[i + 3]);
    return (s / (a.length * 255)) * 100;
}

/** Fine monochrome film grain / dither (triangular noise) that breaks up gradient banding. amount in % (0-3). */
function applyGrain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    const a = (amount / 100) * 255;
    let seed = (Math.random() * 0x7fffffff) | 0;
    for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue;
        seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
        const n = ((seed & 0xffff) / 65535 + ((seed >>> 15) & 0xffff) / 65535 - 1) * a;
        d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function pickVideoMime(format: 'webm' | 'mp4', _alpha: boolean): string | null {
    if (webCodecsAvailable()) return format;
    const list =
        format === 'mp4'
            ? ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1', 'video/mp4']
            : ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    if (typeof MediaRecorder === 'undefined') return null;
    return list.find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => rej(new Error('Gambar latar gagal dimuat.'));
        img.src = src;
    });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) {
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
}

export async function renderVideo(
    code: Code,
    s: Settings,
    format: ExportFormat,
    host: HTMLElement,
    onProgress: (p: RenderProgress) => void,
    isCancelled: () => boolean,
): Promise<RenderResult> {
    const { W, H } = dims(s);
    const isGif = format === 'gif';
    const fps = isGif ? s.gifFps : s.fps;
    const total = Math.max(1, Math.round(s.duration * fps));
    const outW = isGif ? Math.max(2, Math.round(W * s.gifScale)) : W;
    const outH = isGif ? Math.max(2, Math.round(H * s.gifScale)) : H;
    const alpha = s.bgMode === 'transparent';
    // Supersampling factor, capped so the internal canvas stays within GPU limits (8192 px per side).
    const ss = Math.max(1, Math.min(s.supersample || 1, Math.floor(8192 / Math.max(W, H)) || 1));

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('sandbox', 'allow-scripts');
    Object.assign(iframe.style, {
        position: 'fixed', left: '-100000px', top: '0', width: `${W}px`, height: `${H}px`, border: '0', pointerEvents: 'none',
    });
    host.appendChild(iframe);
    const link = new FrameLink(iframe);

    const out = document.createElement('canvas');
    out.width = outW;
    out.height = outH;
    const ctx = out.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Canvas tidak tersedia di browser ini.');
    const tmp = document.createElement('canvas');
    const tctx = tmp.getContext('2d');

    let recorder: MediaRecorder | null = null;
    let track: CanvasCaptureMediaStreamTrack | null = null;
    const chunks: Blob[] = [];
    let mime = '';
    let note: string | undefined;
    let encoder: FrameEncoder | null = null;

    try {
        onProgress({ phase: 'Memuat kode', frame: 0, total });
        await link.load(buildDoc(code, s.bgMode, true, ss));
        const codeBg = await link.codeBg();
        const bgImg = s.bgMode === 'image' && s.bgImage ? await loadImage(s.bgImage) : null;

        const gif = isGif ? new GifEncoder(outW, outH, s.dither) : null;
        const pngs: { name: string; blob: Blob }[] = [];

        if (format === 'webm' || format === 'mp4') {
            encoder = await FrameEncoder.create(format, outW, outH, fps, s.bitrate);
            if (encoder) {
                if (alpha && format === 'mp4') note = 'MP4 (H.264) tidak mendukung transparansi, latar jadi hitam. Pakai PNG sequence untuk alpha.';
                if (alpha && format === 'webm') note = 'Transparansi tidak disimpan di WebM. Pakai PNG sequence atau GIF untuk alpha.';
                if (alpha) { ctx.fillStyle = '#000'; }
            }
        }
        if (!encoder && (format === 'webm' || format === 'mp4')) {
            const m = pickVideoMime(format, alpha);
            if (!m) {
                throw new Error(
                    format === 'mp4'
                        ? 'Browser ini tidak mendukung perekaman MP4. Pakai WebM, atau buka di Chrome/Edge versi terbaru atau Safari.'
                        : 'Browser ini tidak mendukung perekaman WebM.',
                );
            }
            mime = m;
            if (alpha && format === 'mp4') note = 'MP4 (H.264) tidak mendukung transparansi, latar jadi hitam. Pakai WebM VP9 atau PNG sequence untuk alpha.';
            const stream = out.captureStream(0);
            track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;
            recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: s.bitrate * 1_000_000 });
            recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
            recorder.start();
            recorder.pause();
        }

        const frameMs = 1000 / fps;
        let firstThumb: Uint8ClampedArray | null = null;
        let prevThumb: Uint8ClampedArray | null = null;
        for (let i = 0; i < total; i++) {
            if (isCancelled()) throw new Error('__cancel__');
            const t = i * frameMs;
            const img = await link.capture(t, outW, outH, s.capture, s.bgMode === 'code' ? codeBg : null, ss);

            ctx.clearRect(0, 0, outW, outH);
            if (s.bgMode === 'color') {
                ctx.fillStyle = s.bgColor;
                ctx.fillRect(0, 0, outW, outH);
            } else if (bgImg) {
                drawCover(ctx, bgImg, outW, outH);
            } else if (s.bgMode === 'code') {
                ctx.fillStyle = codeBg;
                ctx.fillRect(0, 0, outW, outH);
            } else if (alpha && (format === 'mp4' || (encoder && format === 'webm'))) {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, outW, outH);
            }
            if (img instanceof ImageData) {
                tmp.width = img.width; tmp.height = img.height;
                tctx?.putImageData(img, 0, 0);
                ctx.drawImage(tmp, 0, 0, outW, outH);
            } else {
                ctx.drawImage(img, 0, 0, outW, outH);
                img.close();
            }

            if (i === 0) firstThumb = thumb(out, outW, outH);
            if (i === total - 1) prevThumb = thumb(out, outW, outH);
            if (!gif && s.grain > 0) applyGrain(ctx, outW, outH, s.grain);

            if (gif) {
                gif.addFrame(ctx.getImageData(0, 0, outW, outH).data, Math.max(2, Math.round(100 / fps)));
            } else if (format === 'png') {
                const b: Blob = await new Promise((res, rej) => out.toBlob((x) => (x ? res(x) : rej(new Error('Gagal membuat PNG.'))), 'image/png'));
                pngs.push({ name: `${s.fileName || 'motion'}_${String(i).padStart(5, '0')}.png`, blob: b });
            } else if (encoder) {
                await encoder.add(out);
            } else if (recorder && track) {
                recorder.resume();
                track.requestFrame();
                await sleep(frameMs);
                recorder.pause();
            }
            onProgress({ phase: 'Merender frame', frame: i + 1, total });
        }

        onProgress({ phase: 'Mengecek loop', frame: total, total });
        let loop: LoopCheck | undefined;
        try {
            // The virtual clock only moves forward, so compare the frame at t = duration
            // (what would play right after the last frame) against the stored first frame.
            const raw = async (t: number) => {
                const im = await link.capture(t, outW, outH, s.capture, s.bgMode === 'code' ? codeBg : null, ss);
                let src: CanvasImageSource;
                if (im instanceof ImageData) { tmp.width = im.width; tmp.height = im.height; tctx?.putImageData(im, 0, 0); src = tmp; } else src = im;
                const c2 = document.createElement('canvas'); c2.width = outW; c2.height = outH;
                const g2 = c2.getContext('2d')!;
                if (s.bgMode === 'code') { g2.fillStyle = codeBg; g2.fillRect(0, 0, outW, outH); }
                else if (s.bgMode === 'color') { g2.fillStyle = s.bgColor; g2.fillRect(0, 0, outW, outH); }
                g2.drawImage(src, 0, 0, outW, outH);
                if (!(im instanceof ImageData)) im.close();
                return thumb(c2, outW, outH);
            };
            if (!firstThumb || !prevThumb) throw new Error('no frames');
            const endT = total * frameMs;
            const after = await raw(endT);
            const diff = diffPct(firstThumb, after);
            const stepDiff = diffPct(prevThumb, after);
            const verdict: LoopCheck['verdict'] = diff <= Math.max(0.6, stepDiff * 1.5) ? 'seamless' : diff <= Math.max(2.5, stepDiff * 4) ? 'near' : 'jump';
            loop = { diff, stepDiff, verdict };
        } catch { /* loop check is optional */ }

        onProgress({ phase: 'Menyusun file', frame: total, total });
        const meta = { loop, frames: total, fps, width: outW, height: outH };
        if (gif) return { blob: gif.finish(), ext: 'gif', ...meta };
        if (format === 'png') return { blob: await makeZip(pngs), ext: 'zip', ...meta };
        if (encoder) return { blob: await encoder.finish(), ext: format, note, ...meta };
        note = (note ? note + ' ' : '') + 'Browser ini tidak mendukung encoder per-frame, jadi video direkam real-time. Durasi dan kehalusan bisa sedikit meleset.';
        const rec = recorder!;
        const done = new Promise<void>((r) => (rec.onstop = () => r()));
        rec.resume();
        rec.stop();
        await done;
        return { blob: new Blob(chunks, { type: mime.split(';')[0] }), ext: format, note, ...meta };
    } finally {
        try { if (recorder && recorder.state !== 'inactive') recorder.stop(); } catch { /* ignore */ }
        link.dispose();
        encoder?.close();
        iframe.remove();
    }
}
