// Rewrites the MP4 file type box to QuickTime (.mov). Same H.264 video, same size; opens in Premiere, After Effects, Final Cut, QuickTime.
export async function toMov(mp4: Blob): Promise<Blob> {
    const head = new Uint8Array(await mp4.slice(0, 64).arrayBuffer());
    const tag = String.fromCharCode(head[4], head[5], head[6], head[7]);
    if (tag !== 'ftyp') return new Blob([mp4], { type: 'video/quicktime' });
    const size = (head[0] << 24) | (head[1] << 16) | (head[2] << 8) | head[3];
    if (size < 16 || size > 64) return new Blob([mp4], { type: 'video/quicktime' });
    const box = new Uint8Array(size);
    const dv = new DataView(box.buffer);
    dv.setUint32(0, size);
    box.set([0x66, 0x74, 0x79, 0x70], 4); // ftyp
    const qt = [0x71, 0x74, 0x20, 0x20]; // 'qt  '
    box.set(qt, 8);
    dv.setUint32(12, 0x20050300);
    for (let o = 16; o + 4 <= size; o += 4) box.set(qt, o);
    return new Blob([box, mp4.slice(size)], { type: 'video/quicktime' });
}

export const videoExt = (s: { container?: 'mp4' | 'mov' | 'mova' } | undefined) => (s?.container === 'mov' || s?.container === 'mova' ? 'mov' : 'mp4');
