/** Talks to a sandboxed motion frame purely through postMessage. */
export class FrameLink {
    private nextId = 1;
    private pending = new Map<number, { res: (v: ImageBitmap | ImageData) => void; rej: (e: Error) => void }>();
    private readyRes: (() => void) | null = null;
    private infoRes: ((bg: string) => void) | null = null;
    private onMsg = (e: MessageEvent) => {
        if (!this.iframe.contentWindow || e.source !== this.iframe.contentWindow) return;
        const d = e.data;
        if (!d || !d.__motion) return;
        if (d.type === 'ready') { this.readyRes?.(); this.readyRes = null; }
        else if (d.type === 'info') { this.infoRes?.(d.codeBg); this.infoRes = null; }
        else if (d.type === 'frame') {
            const p = this.pending.get(d.id);
            if (p) { this.pending.delete(d.id); p.res(d.bmp ?? d.img); }
        } else if (d.type === 'frameError') {
            const p = this.pending.get(d.id);
            if (p) { this.pending.delete(d.id); p.rej(new Error(d.msg)); }
        }
    };

    constructor(public iframe: HTMLIFrameElement) {
        window.addEventListener('message', this.onMsg);
    }

    load(doc: string, timeoutMs = 15000): Promise<void> {
        return new Promise((resolve, reject) => {
            const t = setTimeout(() => { this.readyRes = null; reject(new Error(`Kode tidak selesai dimuat dalam ${Math.round(timeoutMs / 1000)} detik.`)); }, timeoutMs);
            this.readyRes = () => { clearTimeout(t); resolve(); };
            this.iframe.srcdoc = doc;
        });
    }

    post(msg: Record<string, unknown>) {
        this.iframe.contentWindow?.postMessage({ ...msg }, '*');
    }

    step(t: number) {
        this.post({ __mcmd: 'step', t });
    }

    codeBg(): Promise<string> {
        return new Promise((res) => {
            const t = setTimeout(() => res('#ffffff'), 2000);
            this.infoRes = (bg) => { clearTimeout(t); res(bg); };
            this.post({ __mcmd: 'info' });
        });
    }

    capture(t: number, w: number, h: number, mode: string, bg: string | null, ss = 1): Promise<ImageBitmap | ImageData> {
        const id = this.nextId++;
        return new Promise((res, rej) => {
            const timer = setTimeout(() => { this.pending.delete(id); rej(new Error('Frame tidak merespons saat dirender.')); }, 30000);
            this.pending.set(id, { res: (v) => { clearTimeout(timer); res(v); }, rej: (e) => { clearTimeout(timer); rej(e); } });
            this.post({ __mcmd: 'capture', id, t, w, h, mode, bg, ss });
        });
    }

    dispose() {
        window.removeEventListener('message', this.onMsg);
        this.pending.forEach((p) => p.rej(new Error('__cancel__')));
        this.pending.clear();
    }
}
