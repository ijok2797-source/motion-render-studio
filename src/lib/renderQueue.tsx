import { toMov } from './toMov';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { renderVideo } from './renderer.new';
import type { LoopCheck, RenderProgress } from './renderer.new';
import type { Code, ExportFormat, Settings } from './types';
import { autoBitrate, dims, renderRange } from './types';

export interface Job {
    id: number;
    name: string;
    format: ExportFormat;
    status: 'queued' | 'rendering' | 'done' | 'error' | 'cancelled';
    width: number;
    height: number;
    fps: number;
    seconds: number;
    targetMbps: number;
    startedAt?: number;
    firstFrameAt?: { frame: number; at: number };
    prog?: RenderProgress;
    error?: string;
    // results
    url?: string;
    blob?: Blob;
    note?: string;
    ms?: number;
    loop?: LoopCheck;
    frames?: number;
    rateMode?: 'cbr' | 'vbr';
    // inputs captured when queued
    code: Code;
    settings: Settings;
}

interface Ctx {
    jobs: Job[];
    active: Job | null;
    format: ExportFormat;
    setFormat: (f: ExportFormat) => void;
    enqueue: (code: Code, s: Settings) => void;
    cancel: (id: number) => void;
    remove: (id: number) => void;
    clearDone: () => void;
    selected: number | null;
    select: (id: number | null) => void;
}

const RenderCtx = createContext<Ctx | null>(null);
export const useRender = () => {
    const c = useContext(RenderCtx);
    if (!c) throw new Error('RenderProvider missing');
    return c;
};

export function RenderProvider({ children }: { children: ReactNode }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [format, setFormatState] = useState<ExportFormat>('mp4');
    const setFormat = (_f: ExportFormat) => setFormatState('mp4');
    void setFormatState;
    const [selected, select] = useState<number | null>(null);
    const nextId = useRef(1);
    const cancelled = useRef(new Set<number>());
    const running = useRef(false);
    const host = useRef<HTMLDivElement>(null);

    const patch = useCallback((id: number, p: Partial<Job>) => setJobs((js) => js.map((j) => (j.id === id ? { ...j, ...p } : j))), []);

    const enqueue = useCallback((code: Code, s: Settings) => {
        const { W, H } = dims(s);
        const isGif = format === 'gif';
        const id = nextId.current++;
        const mbps = s.autoBitrate ? autoBitrate(W, H, s.fps) : s.bitrate;
        const job: Job = {
            id, format, status: 'queued',
            name: (s.fileName || 'motion').trim(),
            width: isGif ? Math.round(W * s.gifScale) : W, height: isGif ? Math.round(H * s.gifScale) : H,
            fps: isGif ? s.gifFps : s.fps, seconds: renderRange(s).len, targetMbps: mbps,
            code, settings: { ...s, bitrate: mbps, bitrateMode: 'vbr' },
        };
        setJobs((js) => [...js, job]);
        select(id);
    }, [format]);

    // Process the queue one job at a time.
    useEffect(() => {
        if (running.current || !host.current) return;
        const next = jobs.find((j) => j.status === 'queued');
        if (!next) return;
        running.current = true;
        const t0 = performance.now();
        patch(next.id, { status: 'rendering', startedAt: t0 });
        const onProg = (p: RenderProgress) => {
            const extra: Partial<Job> = { prog: p };
            if (p.phase === 'Merender frame' && p.frame === 1) extra.firstFrameAt = { frame: 1, at: performance.now() };
            patch(next.id, extra);
        };
        renderVideo(next.code, next.settings, next.format, host.current, onProg, () => cancelled.current.has(next.id))
            .then(async (r) => {
                if (next.settings.container === 'mov' && r.blob) r = { ...r, blob: await toMov(r.blob) };
                patch(next.id, {
                    status: 'done', url: URL.createObjectURL(r.blob), blob: r.blob, note: r.note, ms: performance.now() - t0,
                    loop: r.loop, frames: r.frames, rateMode: r.rateMode, prog: undefined, name: `${next.name}`,
                });
            })
            .catch((e) => {
                const m = e instanceof Error ? e.message : String(e);
                patch(next.id, m === '__cancel__' ? { status: 'cancelled', prog: undefined } : { status: 'error', error: m, prog: undefined });
            })
            .finally(() => { running.current = false; setJobs((js) => [...js]); });
    }, [jobs, patch]);

    const cancel = useCallback((id: number) => {
        cancelled.current.add(id);
        setJobs((js) => js.map((j) => (j.id === id && j.status === 'queued' ? { ...j, status: 'cancelled' } : j)));
    }, []);

    const remove = useCallback((id: number) => {
        setJobs((js) => {
            const j = js.find((x) => x.id === id);
            if (j?.url) URL.revokeObjectURL(j.url);
            return js.filter((x) => x.id !== id || x.status === 'rendering');
        });
        select((s) => (s === id ? null : s));
    }, []);

    const clearDone = useCallback(() => {
        setJobs((js) => {
            js.forEach((j) => { if (j.status !== 'rendering' && j.status !== 'queued' && j.url) URL.revokeObjectURL(j.url); });
            return js.filter((j) => j.status === 'rendering' || j.status === 'queued');
        });
    }, []);

    const active = jobs.find((j) => j.status === 'rendering') ?? null;

    return (
        <RenderCtx.Provider value={{ jobs, active, format, setFormat, enqueue, cancel, remove, clearDone, selected, select }}>
            {children}
            <div ref={host} />
        </RenderCtx.Provider>
    );
}

/** Remaining time estimate for a rendering job, in ms, or null while still measuring. */
export function jobEta(j: Job, now: number): number | null {
    const p = j.prog;
    if (!p) return null;
    if (p.phase === 'Merender frame' && p.frame >= 3 && j.firstFrameAt) {
        const done = p.frame - j.firstFrameAt.frame;
        const spent = now - j.firstFrameAt.at;
        if (done > 0 && spent > 0) return ((p.total - p.frame) * spent) / done + 1500;
    }
    if (p.phase !== 'Merender frame' && p.frame === p.total) return 2000;
    return null;
}
