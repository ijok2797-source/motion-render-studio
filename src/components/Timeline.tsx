import { useRef } from 'react';

interface Props {
    durMs: number;
    timeMs: number;
    fps: number;
    /** Render range in seconds. */
    rangeStart: number;
    rangeEnd: number;
    onSeek: (ms: number) => void;
    onRange: (start: number, end: number) => void;
}

export function timecode(ms: number, fps: number): string {
    const totalFrames = Math.floor((ms / 1000) * fps + 1e-6);
    const f = totalFrames % fps;
    const sec = Math.floor(totalFrames / fps);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(Math.floor(sec / 3600))}:${p(Math.floor(sec / 60) % 60)}:${p(sec % 60)}:${p(f)}`;
}

/** Timeline with second ticks, draggable playhead and draggable render-range handles. */
export function Timeline({ durMs, timeMs, fps, rangeStart, rangeEnd, onSeek, onRange }: Props) {
    const track = useRef<HTMLDivElement>(null);
    const drag = useRef<'head' | 'in' | 'out' | null>(null);
    const dur = durMs / 1000;
    const end = rangeEnd > 0 ? Math.min(rangeEnd, dur) : dur;
    const start = Math.min(rangeStart, end);
    const pct = (s: number) => `${Math.max(0, Math.min(100, (s / dur) * 100))}%`;
    const snap = (s: number) => Math.round(s * fps) / fps;

    const posToSec = (clientX: number) => {
        const r = track.current?.getBoundingClientRect();
        if (!r || r.width === 0) return 0;
        return snap(Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * dur);
    };

    const move = (clientX: number) => {
        const sec = posToSec(clientX);
        if (drag.current === 'head') onSeek(sec * 1000);
        else if (drag.current === 'in') onRange(Math.min(sec, end - 1 / fps), rangeEnd);
        else if (drag.current === 'out') {
            const e = Math.max(sec, start + 1 / fps);
            onRange(rangeStart, e >= dur - 1e-6 ? 0 : e);
        }
    };

    const down = (kind: 'head' | 'in' | 'out') => (e: React.PointerEvent) => {
        e.stopPropagation();
        drag.current = kind;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        if (kind === 'head') move(e.clientX);
    };

    const step = dur <= 12 ? 1 : dur <= 30 ? 2 : dur <= 75 ? 5 : 10;
    const ticks: number[] = [];
    for (let s = 0; s <= dur + 1e-6; s += step) ticks.push(s);
    const partial = start > 0 || end < dur;

    return (
        <div className="tl">
            <div
                className="tl-track"
                ref={track}
                onPointerDown={down('head')}
                onPointerMove={(e) => drag.current && move(e.clientX)}
                onPointerUp={() => (drag.current = null)}
                onPointerCancel={() => (drag.current = null)}
                role="slider"
                aria-label="Timeline"
                aria-valuemin={0}
                aria-valuemax={dur}
                aria-valuenow={timeMs / 1000}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') onSeek(Math.min(durMs, timeMs + 1000 / fps));
                    if (e.key === 'ArrowLeft') onSeek(Math.max(0, timeMs - 1000 / fps));
                }}
            >
                <div className="tl-ruler">
                    {ticks.map((s) => (
                        <span key={s} className="tl-tick" style={{ left: pct(s) }}><i />{s}s</span>
                    ))}
                </div>
                <div className="tl-lane">
                    <div className={`tl-range${partial ? ' partial' : ''}`} style={{ left: pct(start), width: `calc(${pct(end)} - ${pct(start)})` }} />
                    <div className="tl-handle in" style={{ left: pct(start) }} onPointerDown={down('in')} onPointerMove={(e) => drag.current && move(e.clientX)} onPointerUp={() => (drag.current = null)} aria-label="Awal rentang render" role="slider" aria-valuenow={start} tabIndex={0} />
                    <div className="tl-handle out" style={{ left: pct(end) }} onPointerDown={down('out')} onPointerMove={(e) => drag.current && move(e.clientX)} onPointerUp={() => (drag.current = null)} aria-label="Akhir rentang render" role="slider" aria-valuenow={end} tabIndex={0} />
                </div>
                <div className="tl-head" style={{ left: pct(timeMs / 1000) }}><b /></div>
            </div>
            <div className="tl-foot">
                <span>Rentang render {timecode(start * 1000, fps)} – {timecode(end * 1000, fps)}</span>
                {partial && <button className="ghost sm" onClick={() => onRange(0, 0)}>Reset rentang</button>}
            </div>
        </div>
    );
}
