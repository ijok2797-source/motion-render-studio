import { buildDoc } from './shim';
import { FrameLink } from './frameLink';
import type { Code, Settings } from './types';
import { dims, effectiveSS } from './types';

/** Renders one frame at time tMs at full output resolution and returns it as a PNG or JPG blob. */
export async function captureStill(code: Code, s: Settings, tMs: number, host: HTMLElement, type: 'png' | 'jpg'): Promise<Blob> {
    const { W, H } = dims(s);
    const ss = effectiveSS(W, H, s.supersample);
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('sandbox', 'allow-scripts');
    Object.assign(iframe.style, { position: 'fixed', left: '-100000px', top: '0', width: `${W}px`, height: `${H}px`, border: '0', pointerEvents: 'none' });
    host.appendChild(iframe);
    const link = new FrameLink(iframe);
    try {
        await link.load(buildDoc(code, s.bgMode, true, ss));
        const codeBg = await link.codeBg();
        const img = await link.capture(tMs, W, H, s.capture, s.bgMode === 'code' ? codeBg : null, ss);
        const out = document.createElement('canvas');
        out.width = W; out.height = H;
        const g = out.getContext('2d')!;
        const transparent = s.bgMode === 'transparent' && type === 'png';
        if (!transparent) {
            g.fillStyle = s.bgMode === 'color' ? s.bgColor : s.bgMode === 'code' ? codeBg : '#000000';
            g.fillRect(0, 0, W, H);
        }
        if (s.bgMode === 'image' && s.bgImage) {
            const bg = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Gambar latar gagal dimuat.')); i.src = s.bgImage!; });
            const k = Math.max(W / bg.naturalWidth, H / bg.naturalHeight);
            g.drawImage(bg, (W - bg.naturalWidth * k) / 2, (H - bg.naturalHeight * k) / 2, bg.naturalWidth * k, bg.naturalHeight * k);
        }
        let src: CanvasImageSource = img as ImageBitmap;
        if (img instanceof ImageData) {
            const t = document.createElement('canvas'); t.width = img.width; t.height = img.height;
            t.getContext('2d')!.putImageData(img, 0, 0); src = t;
        }
        const z = (s.zoom || 100) / 100;
        g.imageSmoothingQuality = 'high';
        g.drawImage(src, (W - W * z) / 2 + (s.offsetX / 100) * W, (H - H * z) / 2 + (s.offsetY / 100) * H, W * z, H * z);
        if (!(img instanceof ImageData)) img.close();
        return await new Promise<Blob>((res, rej) => out.toBlob((b) => (b ? res(b) : rej(new Error('Gagal membuat gambar.'))), type === 'png' ? 'image/png' : 'image/jpeg', 0.95));
    } finally {
        link.dispose();
        iframe.remove();
    }
}
