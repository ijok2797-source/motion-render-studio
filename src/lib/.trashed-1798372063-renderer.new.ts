import { buildDoc } from './shim';
import { FrameLink } from './frameLink';
import { GifEncoder } from './gif';
import { makeZip } from './zip';
import { makePngMov } from './movPng';
import { FrameEncoder, webCodecsAvailable } from './encoder';
import type { Code, ExportFormat, Settings } from './types';
import { dims, effectiveSS, renderRange } from './types';

/** True when a captured frame has no visible pixels (canvas dropped by the GPU). */
function isBlank(src: CanvasImageSource): boolean {
    const c = document.createElement('canvas');
    c.width = 48; c.height = 27;
    const g = c.getContext('2d', { willReadFrequently: true });
    if (!g) return false;
    g.drawImage(src, 0, 0, 48, 27);
    const d = g.getImageData(0, 0, 48, 27).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 8) return false;
    return true;
}

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
    rateMode?: 'cbr' | 'vbr';
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

/** Fine film grain / dither drawn by the GPU: a cached noise tile blended with 'overlay' at a random offset per frame. */
let grainTile: HTMLCanvasElement | null = null;
let grainAmount = -1;
function applyGrain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
    if (!grainTile || grainAmount !== amount) {
        grainTile = document.createElement('canvas');
        grainTile.width = grainTile.height = 256;
        const g = grainTile.getContext('2d')!;
        const img = g.createImageData(256, 256);
        const a = (amount / 100) * 255; // overlay at mid-grey adds about the noise value itself
        for (let i = 0; i < img.data.length; i += 4) {
            const n = (Math.random() + Math.random() - 1) * a;
            const v = Math.max(0, Math.min(255, 128 + n));
            img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
            img.data[i + 3] = 255;
        }
        g.putImageData(img, 0, 0);
        grainAmount = amount;
    }
    const pat = ctx.createPattern(grainTile, 'repeat');
    if (!pat) return;
    const ox = Math.floor(Math.random() * 256), oy = Math.floor(Math.random() * 256);
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.translate(-ox, -oy);
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, w + 256, h + 256);
    ctx.restore();
}

/** Draws the captured frame scaled around the center and shifted by the offset settings. */
function placeFrame(g: CanvasRenderingContext2D, src: CanvasImageSource, w: number, h: number, s: Settings) {
    const k = (s.zoom || 100) / 100;
    const dw = w * k, dh = h * k;
    const x = (w - dw) / 2 + ((s.offsetX || 0) / 100) * w;
    const y = (h - dh) / 2 + ((s.offsetY || 0) / 100) * h;
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(src, x, y, dw, dh);
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
    const range = renderRange(s);
    const total = Math.max(1, Math.round(range.len * fps));
    const startMs = range.start * 1000;
    const blurN = Math.max(1, Math.min(16, Math.round(s.blurSamples || 1)));
    const shutter = Math.max(0.05, Math.min(1, s.shutter || 0.5));
    const outW = isGif ? Math.max(2, Math.round(W * s.gifScale)) : W;
    const outH = isGif ? Math.max(2, Math.round(H * s.gifScale)) : H;
    const alpha = s.bgMode === 'transparent';
    // Supersampling factor, capped so the internal canvas stays within GPU limits (8192 px per side).
    const ss = effectiveSS(W, H, s.supersample);

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
    const blurC = document.createElement('canvas');
    const bctx = blurC.getContext('2d');

    let recorder: MediaRecorder | null = null;
    let track: CanvasCaptureMediaStreamTrack | null = null;
    const chunks: Blob[] = [];
    let mime = '';
    let note: string | undefined;
    let encoder: FrameEncoder | null = null;
    let rateMode: 'cbr' | 'vbr' | undefined;
    let blankFrames = 0;
    let glLostFrames = 0;

    try {
        onProgress({ phase: 'Memuat kode', frame: 0, total });
        await link.load(buildDoc(code, s.bgMode, true, ss, s.duration, fps), 60000);
        const codeBg = await link.codeBg();
        const bgImg = s.bgMode === 'image' && s.bgImage ? await loadImage(s.bgImage) : null;

        const gif = isGif ? new GifEncoder(outW, outH, s.dither) : null;
        const pngs: { name: string; blob: Blob }[] = [];

        if (format === 'webm' || format === 'mp4') {
            encoder = await FrameEncoder.create(format, outW, outH, fps, s.bitrate, s.bitrateMode === 'cbr');
            if (encoder) {
                rateMode = encoder.usedMode === 'constant' ? 'cbr' : 'vbr';
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
            const t = startMs + i * frameMs;
            // Phones can briefly lose the WebGL context on very large 3D canvases (4K):
            // the frame comes back without the 3D objects, so wait for the GPU and redraw it.
            const grab = async (tt: number) => {
                for (let k = 0; ; k++) {
                    try {
                        return await link.capture(tt, outW, outH, s.capture, s.bgMode === 'code' ? codeBg : null, ss);
                    } catch (e) {
                        if (!(e instanceof Error) || e.message !== '__gllost__' || k >= 6) throw e;
                        if (k === 0) glLostFrames++;
                        await sleep(400);
                    }
                }
            };
            let img = await grab(t);
            // A frame with no pixels at all means the GPU dropped the canvas: redraw and retry.
            // Only check for a GPU-dropped blank frame when it can actually happen (very large canvases).
            if (s.bgMode !== 'transparent' && outW * outH * ss * ss > 6_000_000) {
                for (let k = 0; k < 3; k++) {
                    let blank = false;
                    if (img instanceof ImageData) {
                        tmp.width = img.width; tmp.height = img.height; tctx?.putImageData(img, 0, 0); blank = isBlank(tmp);
                    } else blank = isBlank(img);
                    if (!blank) break;
                    if (!(img instanceof ImageData)) img.close();
                    await sleep(60);
                    img = await link.capture(t + 0.01 * (k + 1), outW, outH, s.capture, s.bgMode === 'code' ? codeBg : null, ss);
                    if (k === 2) blankFrames++;
                }
            }
            // Motion blur: average extra sub-frames spread over the shutter interval.
            let src: CanvasImageSource;
            if (img instanceof ImageData) {
                tmp.width = img.width; tmp.height = img.height;
                tctx?.putImageData(img, 0, 0);
                src = tmp;
            } else src = img;
            if (blurN > 1 && bctx) {
                blurC.width = src === tmp ? tmp.width : (img as ImageBitmap).width;
                blurC.height = src === tmp ? tmp.height : (img as ImageBitmap).height;
                bctx.globalAlpha = 1;
                bctx.clearRect(0, 0, blurC.width, blurC.height);
                bctx.drawImage(src, 0, 0, blurC.width, blurC.height);
                if (!(img instanceof ImageData)) img.close();
                for (let k = 1; k < blurN; k++) {
                    const sub = await grab(t + (k * frameMs * shutter) / blurN);
                    let ssrc: CanvasImageSource;
                    if (sub instanceof ImageData) { tmp.width = sub.width; tmp.height = sub.height; tctx?.putImageData(sub, 0, 0); ssrc = tmp; } else ssrc = sub;
                    bctx.globalAlpha = 1 / (k + 1);
                    bctx.drawImage(ssrc, 0, 0, blurC.width, blurC.height);
                    if (!(sub instanceof ImageData)) sub.close();
                }
                bctx.globalAlpha = 1;
                src = blurC;
            }

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
            placeFrame(ctx, src, outW, outH, s);
            if (src !== tmp && src !== blurC) (img as ImageBitmap).close();

            if (i === 0) firstThumb = thumb(out, outW, outH);
            if (i === total - 1) prevThumb = thumb(out, outW, outH);
            if (!gif && s.grain > 0 && !(format === 'png' && s.container === 'mova')) applyGrain(ctx, outW, outH, s.grain);

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
                placeFrame(g2, src, outW, outH, s);
                if (!(im instanceof ImageData)) im.close();
                return thumb(c2, outW, outH);
            };
            if (!firstThumb || !prevThumb) throw new Error('no frames');
            const endT = startMs + total * frameMs;
            const after = await raw(endT);
            const diff = diffPct(firstThumb, after);
            const stepDiff = diffPct(prevThumb, after);
            const verdict: LoopCheck['verdict'] = diff <= Math.max(0.6, stepDiff * 1.5) ? 'seamless' : diff <= Math.max(2.5, stepDiff * 4) ? 'near' : 'jump';
            loop = { diff, stepDiff, verdict };
        } catch { /* loop check is optional */ }

        onProgress({ phase: 'Menyusun file', frame: total, total });
        if (glLostFrames > 0) note = (note ? note + ' ' : '') + `GPU sempat kehabisan memori di ${glLostFrames} frame dan frame itu digambar ulang. Kalau objek 3D masih berkedip, render 4K di laptop/PC atau pakai 1080p.`;
        if (blankFrames > 0) note = (note ? note + ' ' : '') + `${blankFrames} frame tetap kosong setelah dicoba ulang. Perangkat kehabisan memori grafis: matikan anti-alias atau turunkan resolusi, lalu render ulang.`;
        const meta = { loop, frames: total, fps, width: outW, height: outH, rateMode };
        if (gif) return { blob: gif.finish(), ext: 'gif', ...meta };
        if (format === 'png' && s.container === 'mova') {
            onProgress({ phase: 'Menyusun MOV transparan', frame: total, total });
            return { blob: await makePngMov(pngs.map((p) => p.blob), outW, outH, fps), ext: 'mov', note, ...meta };
        }
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
