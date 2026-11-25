import type { Settings } from '../lib/types';
import { renderRange } from '../lib/types';

interface Props {
    s: Settings;
    set: (p: Partial<Settings>) => void;
}

const BLUR = [
    { n: 1, label: 'Mati' },
    { n: 4, label: 'Ringan' },
    { n: 8, label: 'Sedang' },
    { n: 12, label: 'Kuat' },
];

/** Motion blur and render range controls for the Export tab. */
export function RenderOptions({ s, set }: Props) {
    const r = renderRange(s);
    const partial = r.start > 0 || r.end < s.duration;
    return (
        <>
            <h3>Rentang render</h3>
            <div className="row2">
                <div className="field">
                    <label htmlFor="rs">Mulai (detik)</label>
                    <input id="rs" type="number" min={0} max={s.duration} step={0.1} value={s.rangeStart}
                        onChange={(e) => set({ rangeStart: Math.max(0, Number(e.target.value) || 0) })} />
                </div>
                <div className="field">
                    <label htmlFor="re">Selesai (detik)</label>
                    <input id="re" type="number" min={0} max={s.duration} step={0.1} value={s.rangeEnd > 0 ? s.rangeEnd : s.duration}
                        onChange={(e) => set({ rangeEnd: Math.max(0, Number(e.target.value) || 0) })} />
                </div>
            </div>
            <p className="hint">
                {partial ? `Render detik ${r.start.toFixed(1)}–${r.end.toFixed(1)} (${r.len.toFixed(1)} dtk, ${Math.round(r.len * s.fps)} frame).` : `Seluruh animasi (${s.duration} dtk).`}
                {partial && ' Cek loop hanya berlaku kalau rentangnya satu siklus penuh.'}
            </p>
            {partial && <button className="secondary sm" style={{ marginBottom: 6 }} onClick={() => set({ rangeStart: 0, rangeEnd: 0 })}>Render seluruh durasi</button>}

            <h3>Motion blur</h3>
            <div className="seg" role="group" aria-label="Motion blur">
                {BLUR.map((b) => (
                    <button key={b.n} className={s.blurSamples === b.n ? 'on' : ''} onClick={() => set({ blurSamples: b.n })}>{b.label}</button>
                ))}
            </div>
            {s.blurSamples > 1 && (
                <div className="field">
                    <label htmlFor="sh">Shutter: {Math.round(s.shutter * 360)}°</label>
                    <input id="sh" type="range" min={0.1} max={1} step={0.05} value={s.shutter} onChange={(e) => set({ shutter: Number(e.target.value) })} />
                </div>
            )}
            <p className="hint">
                {s.blurSamples > 1
                    ? `Tiap frame menggabungkan ${s.blurSamples} gambar, jadi render sekitar ${s.blurSamples}× lebih lama. Shutter 180° terlihat seperti kamera film.`
                    : 'Gerakan cepat terlihat lebih natural. Tidak dipakai di pratinjau, hanya di hasil render.'}
            </p>
        </>
    );
}
