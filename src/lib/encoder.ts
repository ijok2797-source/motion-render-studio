// Frame-accurate video encoding with WebCodecs + in-memory WebM / MP4 muxers.
// Every frame gets an exact timestamp (i / fps), so duration and smoothness no
// longer depend on how fast the browser can render each frame.

type Bytes = Uint8Array;

const concat = (parts: Bytes[]): Bytes => {
    const n = parts.reduce((s, p) => s + p.length, 0);
    const out = new Uint8Array(n);
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
};
const u8 = (...b: number[]) => new Uint8Array(b);
const str = (s: string) => new TextEncoder().encode(s);
const be = (v: number, n: number) => {
    const b = new Uint8Array(n);
    for (let i = n - 1; i >= 0; i--) { b[i] = v & 255; v = Math.floor(v / 256); }
    return b;
};

// ---------------- WebM ----------------
const ebmlSize = (n: number) => concat([u8(0x01), be(n, 7)]);
const uintMin = (v: number) => { let n = 1; while (v >= 2 ** (8 * n) && n < 8) n++; return be(v, n); };
const el = (id: number[], ...data: Bytes[]) => { const d = concat(data); return concat([u8(...id), ebmlSize(d.length), d]); };
const elU = (id: number[], v: number) => el(id, uintMin(v));
const elF = (id: number[], v: number) => { const b = new Uint8Array(8); new DataView(b.buffer).setFloat64(0, v); return el(id, b); };

interface Sample { data: Bytes; ts: number; key: boolean }

function muxWebm(samples: Sample[], codecId: string, w: number, h: number, durMs: number): Blob {
    const header = el([0x1a, 0x45, 0xdf, 0xa3],
        elU([0x42, 0x86], 1), elU([0x42, 0xf7], 1), elU([0x42, 0xf2], 4), elU([0x42, 0xf3], 8),
        el([0x42, 0x82], str('webm')), elU([0x42, 0x87], 2), elU([0x42, 0x85], 2));
    const info = el([0x15, 0x49, 0xa9, 0x66],
        elU([0x2a, 0xd7, 0xb1], 1_000_000), el([0x4d, 0x80], str('Motion Render Studio')),
        el([0x57, 0x41], str('Motion Render Studio')), elF([0x44, 0x89], durMs));
    const tracks = el([0x16, 0x54, 0xae, 0x6b], el([0xae],
        elU([0xd7], 1), elU([0x73, 0xc5], 1), el([0x86], str(codecId)), elU([0x83], 1),
        el([0xe0], elU([0xb0], w), elU([0xba], h))));
    const clusters: Bytes[] = [];
    let cur: Bytes[] = [];
    let base = 0;
    const flush = () => { if (cur.length) clusters.push(el([0x1f, 0x43, 0xb6, 0x75], elU([0xe7], base), ...cur)); cur = []; };
    for (const s of samples) {
        const ms = Math.round(s.ts / 1000);
        if (!cur.length || s.key || ms - base > 30000) { flush(); base = ms; }
        const rel = ms - base;
        cur.push(el([0xa3], u8(0x81, (rel >> 8) & 255, rel & 255, s.key ? 0x80 : 0), s.data));
    }
    flush();
    const segment = el([0x18, 0x53, 0x80, 0x67], info, tracks, ...clusters);
    return new Blob([concat([header, segment]) as BlobPart], { type: 'video/webm' });
}

// ---------------- MP4 ----------------
const box = (type: string, ...data: Bytes[]) => { const d = concat(data); return concat([be(d.length + 8, 4), str(type), d]); };
const full = (type: string, ver: number, flags: number, ...data: Bytes[]) => box(type, u8(ver), be(flags, 3), ...data);
const MATRIX = concat([0x00010000, 0, 0, 0, 0x00010000, 0, 0, 0, 0x40000000].map((v) => be(v, 4)));

function muxMp4(samples: Sample[], avcC: Bytes, w: number, h: number, fps: number): Blob {
    const n = samples.length;
    const ts = fps * 1000, delta = 1000;
    const durTs = n * delta;
    const durMs = Math.round((n / fps) * 1000);
    const ftyp = box('ftyp', str('isom'), be(512, 4), str('isom'), str('iso2'), str('avc1'), str('mp41'));
    const mdatPayload = concat(samples.map((s) => s.data));
    const mdatHeader = concat([be(mdatPayload.length + 8, 4), str('mdat')]);
    const firstOffset = ftyp.length + 8;

    const mvhd = full('mvhd', 0, 0, be(0, 4), be(0, 4), be(1000, 4), be(durMs, 4), be(0x00010000, 4), be(0x0100, 2), new Uint8Array(10), MATRIX, new Uint8Array(24), be(2, 4));
    const tkhd = full('tkhd', 0, 3, be(0, 4), be(0, 4), be(1, 4), be(0, 4), be(durMs, 4), new Uint8Array(8), be(0, 2), be(0, 2), be(0, 2), be(0, 2), MATRIX, be(w * 65536, 4), be(h * 65536, 4));
    const mdhd = full('mdhd', 0, 0, be(0, 4), be(0, 4), be(ts, 4), be(durTs, 4), be(0x55c4, 2), be(0, 2));
    const hdlr = full('hdlr', 0, 0, be(0, 4), str('vide'), new Uint8Array(12), str('VideoHandler'), u8(0));
    const vmhd = full('vmhd', 0, 1, be(0, 2), new Uint8Array(6));
    const dinf = box('dinf', full('dref', 0, 0, be(1, 4), full('url ', 0, 1)));
    const avc1 = box('avc1', new Uint8Array(6), be(1, 2), be(0, 2), be(0, 2), new Uint8Array(12), be(w, 2), be(h, 2),
        be(0x00480000, 4), be(0x00480000, 4), be(0, 4), be(1, 2), new Uint8Array(32), be(0x0018, 2), be(0xffff, 2), box('avcC', avcC));
    const stsd = full('stsd', 0, 0, be(1, 4), avc1);
    const stts = full('stts', 0, 0, be(1, 4), be(n, 4), be(delta, 4));
    const keys = samples.map((s, i) => (s.key ? i + 1 : 0)).filter(Boolean);
    const stss = full('stss', 0, 0, be(keys.length, 4), ...keys.map((k) => be(k, 4)));
    const stsc = full('stsc', 0, 0, be(1, 4), be(1, 4), be(n, 4), be(1, 4));
    const stsz = full('stsz', 0, 0, be(0, 4), be(n, 4), ...samples.map((s) => be(s.data.length, 4)));
    const stco = full('stco', 0, 0, be(1, 4), be(firstOffset, 4));
    const stbl = box('stbl', stsd, stts, stss, stsc, stsz, stco);
    const moov = box('moov', mvhd, box('trak', tkhd, box('mdia', mdhd, hdlr, box('minf', vmhd, dinf, stbl))));
    return new Blob([ftyp as BlobPart, mdatHeader as BlobPart, mdatPayload as BlobPart, moov as BlobPart], { type: 'video/mp4' });
}

// ---------------- Encoder ----------------
const even = (v: number) => v - (v % 2);

export function webCodecsAvailable(): boolean {
    return typeof window !== 'undefined' && 'VideoEncoder' in window && 'VideoFrame' in window;
}

async function pickConfig(format: 'mp4' | 'webm', w: number, h: number, fps: number, bitrate: number, cbr: boolean) {
    const cands = format === 'mp4'
        ? [['avc1.640033', ''], ['avc1.640028', ''], ['avc1.4d0033', ''], ['avc1.42003e', '']]
        : [['vp09.00.51.08', 'V_VP9'], ['vp09.00.41.08', 'V_VP9'], ['vp8', 'V_VP8']];
    const modes: ('constant' | 'variable')[] = cbr ? ['constant', 'variable'] : ['variable'];
    for (const mode of modes) {
        for (const [codec, mkv] of cands) {
            const cfg: VideoEncoderConfig = { codec, width: w, height: h, bitrate, framerate: fps, latencyMode: 'quality', bitrateMode: mode };
            if (format === 'mp4') (cfg as VideoEncoderConfig & { avc?: { format: string } }).avc = { format: 'avc' };
            try {
                const r = await VideoEncoder.isConfigSupported(cfg);
                if (r.supported) return { cfg, mkv, mode };
            } catch { /* try next */ }
        }
    }
    return null;
}

export class FrameEncoder {
    private enc!: VideoEncoder;
    private samples: Sample[] = [];
    private avcC: Bytes | null = null;
    private err: Error | null = null;
    private mkv = '';
    private count = 0;
    w: number;
    h: number;

    private constructor(private format: 'mp4' | 'webm', w: number, h: number, private fps: number) {
        this.w = even(w);
        this.h = even(h);
    }

    /** 'constant' or 'variable': the rate control mode the device actually accepted. */
    usedMode: 'constant' | 'variable' = 'variable';

    static async create(format: 'mp4' | 'webm', w: number, h: number, fps: number, bitrateMbps: number, cbr = false): Promise<FrameEncoder | null> {
        if (!webCodecsAvailable()) return null;
        const fe = new FrameEncoder(format, w, h, fps);
        const pick = await pickConfig(format, fe.w, fe.h, fps, bitrateMbps * 1_000_000, cbr);
        if (!pick) return null;
        fe.mkv = pick.mkv;
        fe.usedMode = pick.mode;
        fe.enc = new VideoEncoder({
            output: (chunk, meta) => {
                const d = new Uint8Array(chunk.byteLength);
                chunk.copyTo(d);
                fe.samples.push({ data: d, ts: chunk.timestamp, key: chunk.type === 'key' });
                const desc = meta?.decoderConfig?.description;
                if (desc && !fe.avcC) {
                    fe.avcC = desc instanceof ArrayBuffer ? new Uint8Array(desc.slice(0)) : new Uint8Array((desc as ArrayBufferView).buffer.slice(0) as ArrayBuffer);
                }
            },
            error: (e) => { fe.err = e instanceof Error ? e : new Error(String(e)); },
        });
        fe.enc.configure(pick.cfg);
        return fe;
    }

    async add(canvas: HTMLCanvasElement) {
        if (this.err) throw this.err;
        while (this.enc.encodeQueueSize > 6) await new Promise((r) => setTimeout(r, 5));
        const us = 1_000_000 / this.fps;
        const frame = new VideoFrame(canvas, { timestamp: Math.round(this.count * us), duration: Math.round(us) });
        this.enc.encode(frame, { keyFrame: this.count % Math.max(1, Math.round(this.fps)) === 0 });
        frame.close();
        this.count++;
    }

    async finish(): Promise<Blob> {
        await this.enc.flush();
        this.enc.close();
        if (this.err) throw this.err;
        this.samples.sort((a, b) => a.ts - b.ts);
        if (this.format === 'webm') return muxWebm(this.samples, this.mkv, this.w, this.h, (this.count / this.fps) * 1000);
        if (!this.avcC) throw new Error('Encoder H.264 tidak memberikan konfigurasi decoder.');
        return muxMp4(this.samples, this.avcC, this.w, this.h, this.fps);
    }

    close() {
        try { if (this.enc && this.enc.state !== 'closed') this.enc.close(); } catch { /* ignore */ }
    }
}
