class ByteBuf {
    buf = new Uint8Array(1 << 20);
    len = 0;
    ensure(n: number) {
        if (this.len + n <= this.buf.length) return;
        let size = this.buf.length * 2;
        while (size < this.len + n) size *= 2;
        const nb = new Uint8Array(size);
        nb.set(this.buf.subarray(0, this.len));
        this.buf = nb;
    }
    byte(b: number) {
        this.ensure(1);
        this.buf[this.len++] = b & 255;
    }
    word(w: number) {
        this.byte(w);
        this.byte(w >> 8);
    }
    bytes(arr: ArrayLike<number>) {
        this.ensure(arr.length);
        for (let i = 0; i < arr.length; i++) this.buf[this.len++] = arr[i];
    }
    str(s: string) {
        for (let i = 0; i < s.length; i++) this.byte(s.charCodeAt(i));
    }
    result() {
        return this.buf.slice(0, this.len);
    }
}

// Fixed palette: 6 red x 7 green x 6 blue = 252 colors, index 252 = transparent.
const RL = 6, GL = 7, BL = 6;
const TRANSPARENT = 252;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.5);

function palette(): Uint8Array {
    const p = new Uint8Array(256 * 3);
    let i = 0;
    for (let r = 0; r < RL; r++)
        for (let g = 0; g < GL; g++)
            for (let b = 0; b < BL; b++) {
                p[i * 3] = Math.round((r * 255) / (RL - 1));
                p[i * 3 + 1] = Math.round((g * 255) / (GL - 1));
                p[i * 3 + 2] = Math.round((b * 255) / (BL - 1));
                i++;
            }
    return p;
}

function quantize(data: Uint8ClampedArray, w: number, h: number, dither: boolean): Uint8Array {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = y * w + x;
            const o = i * 4;
            if (data[o + 3] < 128) {
                out[i] = TRANSPARENT;
                continue;
            }
            const d = dither ? BAYER[(y & 3) * 4 + (x & 3)] : 0;
            const r = Math.min(RL - 1, Math.max(0, Math.round((data[o] / 255) * (RL - 1) + d)));
            const g = Math.min(GL - 1, Math.max(0, Math.round((data[o + 1] / 255) * (GL - 1) + d)));
            const b = Math.min(BL - 1, Math.max(0, Math.round((data[o + 2] / 255) * (BL - 1) + d)));
            out[i] = r * GL * BL + g * BL + b;
        }
    }
    return out;
}

function lzw(indices: Uint8Array, out: ByteBuf) {
    const minCode = 8;
    out.byte(minCode);
    const clear = 1 << minCode;
    const eoi = clear + 1;
    let codeSize = minCode + 1;
    let next = eoi + 1;
    const dict = new Map<number, number>();
    let cur = 0, bits = 0;
    const block: number[] = [];
    const emit = (code: number) => {
        cur |= code << bits;
        bits += codeSize;
        while (bits >= 8) {
            block.push(cur & 255);
            cur >>>= 8;
            bits -= 8;
            if (block.length === 255) {
                out.byte(255);
                out.bytes(block);
                block.length = 0;
            }
        }
    };
    emit(clear);
    let prefix = indices[0];
    for (let i = 1; i < indices.length; i++) {
        const k = indices[i];
        const key = (prefix << 8) | k;
        const v = dict.get(key);
        if (v !== undefined) {
            prefix = v;
            continue;
        }
        emit(prefix);
        if (next === 4096) {
            emit(clear);
            dict.clear();
            codeSize = minCode + 1;
            next = eoi + 1;
        } else {
            if (next >= 1 << codeSize) codeSize++;
            dict.set(key, next++);
        }
        prefix = k;
    }
    emit(prefix);
    emit(eoi);
    if (bits > 0) block.push(cur & 255);
    if (block.length) {
        out.byte(block.length);
        out.bytes(block);
    }
    out.byte(0);
}

export class GifEncoder {
    private out = new ByteBuf();
    constructor(private w: number, private h: number, private dither: boolean) {
        const o = this.out;
        o.str('GIF89a');
        o.word(w);
        o.word(h);
        o.byte(0xf7);
        o.byte(0);
        o.byte(0);
        o.bytes(palette());
        o.byte(0x21); o.byte(0xff); o.byte(11);
        o.str('NETSCAPE2.0');
        o.byte(3); o.byte(1); o.word(0); o.byte(0);
    }
    addFrame(data: Uint8ClampedArray, delayCs: number) {
        const o = this.out;
        o.byte(0x21); o.byte(0xf9); o.byte(4);
        o.byte((2 << 2) | 1);
        o.word(delayCs);
        o.byte(TRANSPARENT);
        o.byte(0);
        o.byte(0x2c);
        o.word(0); o.word(0);
        o.word(this.w); o.word(this.h);
        o.byte(0);
        lzw(quantize(data, this.w, this.h, this.dither), o);
    }
    finish(): Blob {
        this.out.byte(0x3b);
        return new Blob([this.out.result()], { type: 'image/gif' });
    }
}
