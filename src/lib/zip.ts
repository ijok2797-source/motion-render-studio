const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c >>> 0;
    }
    return t;
})();

function crc32(d: Uint8Array): number {
    let c = 0xffffffff;
    for (let i = 0; i < d.length; i++) c = CRC_TABLE[(c ^ d[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

/** Builds an uncompressed (store) ZIP archive. */
export async function makeZip(files: { name: string; blob: Blob }[]): Promise<Blob> {
    const parts: BlobPart[] = [];
    const central: BlobPart[] = [];
    let offset = 0;
    for (const f of files) {
        const data = new Uint8Array(await f.blob.arrayBuffer());
        const name = new TextEncoder().encode(f.name);
        const crc = crc32(data);
        const lh = new DataView(new ArrayBuffer(30));
        lh.setUint32(0, 0x04034b50, true);
        lh.setUint16(4, 20, true);
        lh.setUint32(14, crc, true);
        lh.setUint32(18, data.length, true);
        lh.setUint32(22, data.length, true);
        lh.setUint16(26, name.length, true);
        parts.push(lh.buffer as ArrayBuffer, name as BlobPart, data as BlobPart);
        const ch = new DataView(new ArrayBuffer(46));
        ch.setUint32(0, 0x02014b50, true);
        ch.setUint16(4, 20, true);
        ch.setUint16(6, 20, true);
        ch.setUint32(16, crc, true);
        ch.setUint32(20, data.length, true);
        ch.setUint32(24, data.length, true);
        ch.setUint16(28, name.length, true);
        ch.setUint32(42, offset, true);
        const entry = new Uint8Array(46 + name.length);
        entry.set(new Uint8Array(ch.buffer), 0);
        entry.set(name, 46);
        central.push(entry as BlobPart);
        offset += 30 + name.length + data.length;
    }
    const cdSize = central.reduce<number>((s, c) => s + (c as Uint8Array).length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true);
    end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end.buffer as ArrayBuffer] as BlobPart[], { type: 'application/zip' });
}
