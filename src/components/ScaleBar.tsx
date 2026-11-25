import type { Settings } from '../lib/types';

interface Props {
    s: Settings;
    set: (p: Partial<Settings>) => void;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Compact scale / position bar shown right under the preview. */
export function ScaleBar({ s, set }: Props) {
    const changed = s.zoom !== 100 || s.offsetX !== 0 || s.offsetY !== 0;
    const step = (dz: number) => set({ zoom: clamp(Math.round((s.zoom + dz) / 5) * 5, 10, 400) });
    return (
        <div className="scalebar">
            <div className="sb-row">
                <span className="sb-lbl">Skala</span>
                <button className="icon-btn sm" aria-label="Perkecil" onClick={() => step(-5)}>
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </button>
                <input type="range" aria-label="Skala animasi" min={25} max={300} step={1} value={s.zoom} onChange={(e) => set({ zoom: Number(e.target.value) })} />
                <button className="icon-btn sm" aria-label="Perbesar" onClick={() => step(5)}>
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </button>
                <input className="sb-num" type="number" aria-label="Skala dalam persen" min={10} max={400} value={s.zoom} onChange={(e) => set({ zoom: clamp(Number(e.target.value) || 100, 10, 400) })} />
                <span className="sb-unit">%</span>
                <button className="ghost sm" disabled={!changed} onClick={() => set({ zoom: 100, offsetX: 0, offsetY: 0 })}>Reset</button>
            </div>
        </div>
    );
}
