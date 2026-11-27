// QuickTime .mov with the PNG codec ('png ', 32-bit RGBA): every frame is a lossless PNG with its alpha channel.
// Opens in After Effects, Premiere Pro, Final Cut Pro, DaVinci Resolve and VLC. Large files, like ProRes 4444.
// The frame PNGs stay as Blobs (the browser can keep them on disk), so long 4K renders do not need to fit in memory.

const u32 = (n: number) => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n >>> 0); return b; };
const u16 = (n: number) => { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, n & 0xffff); return b; };
const u64 = (n: number) => { const b = new Uint8Array(8); const d = new DataView(b.buffer); d.setUint32(0, Math.floor(n / 2 ** 32)); d.setUint32(4, n >>> 0); return b; };
const str = (s: string) => new TextEncoder().encode(s);
const zeros = (n: number) => new Uint8Array(n);
const cat = (parts: Uint8Array[]) => {
    const len = parts.reduce((a, p) => a + p.length, 0);
    const out = new Uint8Array(len);
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
};
const box = (type: string, ...parts: Uint8Array[]) => { const body = cat(parts); return cat([u32(body.length + 8), str(type), body]); };
const full = (type: string, flags: number, ...parts: Uint8Array[]) => box(type, u32(flags & 0xffffff), ...parts);
const pascal = (s: string, size?: number) => {
    const t = str(s).slice(0, 255);
    const b = new Uint8Array(size ?? t.length + 1);
    b[0] = Math.min(t.length, (size ?? 256) - 1);
    b.set(t.slice(0, b[0]), 1);
    return b;
};
// Identity transform matrix (16.16 / 2.30 fixed point).
const MATRIX = cat([u32(0x00010000), u32(0), u32(0), u32(0), u32(0x00010000), u32(0), u32(0), u32(0), u32(0x40000000)]);

export async function makePngMov(frames: Blob[], width: number, height: number, fps: number): Promise<Blob> {
    const n = frames.length;
    if (!n) throw new Error('Tidak ada frame untuk disimpan.');
    const timescale = Math.round(fps * 100);
    const delta = 100;
    const mediaDur = n * delta;
    const movieScale = 1000;
    const movieDur = Math.round((n / fps) * 1000);

    const ftyp = box('ftyp', str('qt  '), u32(0x20050300), str('qt  '));
    const mdatHead = cat([u32(1), str('mdat'), u64(0)]); // 64-bit size, filled below
    let offset = ftyp.length + mdatHead.length;
    const offsets: number[] = [];
    const sizes: number[] = [];
    for (const f of frames) { offsets.push(offset); sizes.push(f.size); offset += f.size; }
    const mdatSize = offset - ftyp.length;
    mdatHead.set(u64(mdatSize), 8);

    const mvhd = full('mvhd', 0, u32(0), u32(0), u32(movieScale), u32(movieDur), u32(0x00010000), u16(0x0100), zeros(10), MATRIX,
        u32(0), u32(0), u32(0), u32(0), u32(0), u32(0), u32(2));
    const tkhd = full('tkhd', 0x0f, u32(0), u32(0), u32(1), u32(0), u32(movieDur), zeros(8), u16(0), u16(0), u16(0), u16(0), MATRIX,
        u32(width * 65536), u32(height * 65536));
    const mdhd = full('mdhd', 0, u32(0), u32(0), u32(timescale), u32(mediaDur), u16(0x7fff), u16(0));
    const hdlr = full('hdlr', 0, str('mhlr'), str('vide'), u32(0), u32(0), u32(0), pascal('VideoHandler'));
    const vmhd = full('vmhd', 1, u16(0x40), u16(0x8000), u16(0x8000), u16(0x8000));
    const dhlr = full('hdlr', 0, str('dhlr'), str('alis'), u32(0), u32(0), u32(0), pascal('DataHandler'));
    const dinf = box('dinf', full('dref', 0, u32(1), full('alis', 1)));
    const entry = box('png ', zeros(6), u16(1), u16(0), u16(0), u32(0), u32(0), u32(512), u16(width), u16(height),
        u32(0x00480000), u32(0x00480000), u32(0), u16(1), pascal('PNG', 32), u16(32), u16(0xffff));
    const stsd = full('stsd', 0, u32(1), entry);
    const stts = full('stts', 0, u32(1), u32(n), u32(delta));
    const stsc = full('stsc', 0, u32(1), u32(1), u32(1), u32(1));
    const stsz = full('stsz', 0, u32(0), u32(n), ...sizes.map(u32));
    const co64 = full('co64', 0, u32(n), ...offsets.map(u64));
    const stbl = box('stbl', stsd, stts, stsc, stsz, co64);
    const minf = box('minf', vmhd, dhlr, dinf, stbl);
    const mdia = box('mdia', mdhd, hdlr, minf);
    const trak = box('trak', tkhd, mdia);
    const moov = box('moov', mvhd, trak);

    return new Blob([ftyp, mdatHead, ...frames, moov], { type: 'video/quicktime' });
}
