export type BgMode = 'code' | 'color' | 'image' | 'transparent';
export type CaptureMode = 'auto' | 'dom' | 'canvas';
export type ExportFormat = 'webm' | 'mp4' | 'gif' | 'png';
export type Lang = 'html' | 'css' | 'js';

export interface Code {
    html: string;
    css: string;
    js: string;
}

export interface Settings {
    ratio: string;
    quality: number;
    customW: number;
    customH: number;
    fps: number;
    duration: number;
    bgMode: BgMode;
    bgColor: string;
    bgImage: string | null;
    capture: CaptureMode;
    bitrate: number;
    autoBitrate: boolean;
    bitrateMode: 'vbr' | 'cbr';
    supersample: number;
    grain: number;
    /** Animation scale inside the video, in percent (100 = original). */
    zoom: number;
    /** Horizontal / vertical offset of the animation, in percent of the frame size. */
    offsetX: number;
    offsetY: number;
    /** Render only part of the timeline, in seconds. end <= 0 means "until the end". */
    rangeStart: number;
    rangeEnd: number;
    /** Motion blur sub-frames per frame (1 = off) and shutter fraction of a frame (0..1). */
    blurSamples: number;
    shutter: number;
    gifScale: number;
    gifFps: number;
    dither: boolean;
    fileName: string;
    /** True while the file name follows the code automatically; false once the user types their own. */
    fileNameAuto: boolean;
}

export interface Log {
    type: 'log' | 'warn' | 'error';
    msg: string;
    time: number;
    count?: number;
}

export const RATIOS: { id: string; label: string; w: number; h: number }[] = [
    { id: '16:9', label: '16:9 Landscape', w: 16, h: 9 },
    { id: '9:16', label: '9:16 Story / Reels', w: 9, h: 16 },
    { id: '1:1', label: '1:1 Persegi', w: 1, h: 1 },
    { id: '4:5', label: '4:5 Feed', w: 4, h: 5 },
    { id: '4:3', label: '4:3 Klasik', w: 4, h: 3 },
    { id: '21:9', label: '21:9 Sinematik', w: 21, h: 9 },
    { id: 'custom', label: 'Kustom', w: 0, h: 0 },
];

export const QUALITIES = [
    { v: 480, label: '480p' },
    { v: 720, label: '720p HD' },
    { v: 1080, label: '1080p Full HD' },
    { v: 1440, label: '1440p 2K' },
    { v: 2160, label: '2160p 4K' },
];

export const FPS_OPTIONS = [24, 25, 30, 50, 60];

export const DEFAULT_SETTINGS: Settings = {
    ratio: '16:9',
    quality: 1080,
    customW: 1200,
    customH: 800,
    fps: 30,
    duration: 4,
    bgMode: 'code',
    bgColor: '#101820',
    bgImage: null,
    capture: 'auto',
    bitrate: 8,
    autoBitrate: true,
    bitrateMode: 'vbr',
    supersample: 2,
    grain: 1,
    zoom: 100,
    offsetX: 0,
    offsetY: 0,
    rangeStart: 0,
    rangeEnd: 0,
    blurSamples: 1,
    shutter: 0.5,
    gifScale: 0.5,
    gifFps: 20,
    dither: true,
    fileName: 'motion',
    fileNameAuto: true,
};

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

export function dims(s: Settings): { W: number; H: number } {
    if (s.ratio === 'custom') {
        return { W: even(Math.min(4096, Math.max(16, s.customW || 16))), H: even(Math.min(4096, Math.max(16, s.customH || 16))) };
    }
    const r = RATIOS.find((x) => x.id === s.ratio) ?? RATIOS[0];
    if (r.w >= r.h) return { W: even((s.quality * r.w) / r.h), H: even(s.quality) };
    return { W: even(s.quality), H: even((s.quality * r.h) / r.w) };
}

/** Effective render range in seconds, clamped to the duration. */
export function renderRange(s: Settings): { start: number; end: number; len: number } {
    const start = Math.max(0, Math.min(s.duration - 0.05, s.rangeStart || 0));
    const rawEnd = s.rangeEnd && s.rangeEnd > 0 ? s.rangeEnd : s.duration;
    const end = Math.max(start + 0.05, Math.min(s.duration, rawEnd));
    return { start, end, len: end - start };
}

/** Max internal canvas area (~16.7 MP). Larger canvases get dropped by phone GPUs and render blank. */
export const MAX_CANVAS_AREA = 4096 * 4096;

/** Supersampling factor actually used, limited by side length (8192) and total canvas area. */
export function effectiveSS(W: number, H: number, req: number): number {
    const bySide = Math.floor(8192 / Math.max(W, H));
    const byArea = Math.floor(Math.sqrt(MAX_CANVAS_AREA / (W * H)));
    return Math.max(1, Math.min(req || 1, bySide || 1, byArea || 1));
}

/** Bitrate (Mbps) tuned for stock-footage quality: ~0.2 bits per pixel per frame, 4K30 ≈ 50, 4K60 ≈ 100. */
export function autoBitrate(W: number, H: number, fps: number): number {
    const mbps = (W * H * fps * 0.2) / 1_000_000;
    return Math.min(100, Math.max(4, Math.round(mbps)));
}

export function formatBytes(b: number): string {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(2)} MB`;
}
