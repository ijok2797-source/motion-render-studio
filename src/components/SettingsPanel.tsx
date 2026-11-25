import { useMemo } from 'react';
import type { BgMode, Code, Settings } from '../lib/types';
import { detectDuration } from '../lib/detectDuration';
import { FPS_OPTIONS, QUALITIES, RATIOS, dims } from '../lib/types';

interface Props {
    s: Settings;
    set: (p: Partial<Settings>) => void;
    code: Code;
}

const BG: { id: BgMode; label: string }[] = [
    { id: 'code', label: 'Dari kode' },
    { id: 'color', label: 'Warna' },
    { id: 'image', label: 'Gambar' },
    { id: 'transparent', label: 'Transparan' },
];

export function SettingsPanel({ s, set, code }: Props) {
    const { W, H } = dims(s);
    const detected = useMemo(() => detectDuration(code), [code]);
    const onImage = (f: File | undefined) => {
        if (!f) return;
        const r = new FileReader();
        r.onload = () => set({ bgImage: String(r.result), bgMode: 'image' });
        r.readAsDataURL(f);
    };

    return (
        <div className="panel">
            <h3>Ukuran</h3>
            <div className="field">
                <label htmlFor="ratio">Rasio aspek</label>
                <select id="ratio" value={s.ratio} onChange={(e) => set({ ratio: e.target.value })}>
                    {RATIOS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
            </div>
            {s.ratio === 'custom' ? (
                <div className="row2">
                    <div className="field">
                        <label htmlFor="cw">Lebar (px)</label>
                        <input id="cw" type="number" min={16} max={4096} value={s.customW} onChange={(e) => set({ customW: Number(e.target.value) })} />
                    </div>
                    <div className="field">
                        <label htmlFor="ch">Tinggi (px)</label>
                        <input id="ch" type="number" min={16} max={4096} value={s.customH} onChange={(e) => set({ customH: Number(e.target.value) })} />
                    </div>
                </div>
            ) : (
                <div className="field">
                    <label htmlFor="q">Resolusi</label>
                    <select id="q" value={s.quality} onChange={(e) => set({ quality: Number(e.target.value) })}>
                        {QUALITIES.map((q) => <option key={q.v} value={q.v}>{q.label}</option>)}
                    </select>
                </div>
            )}
            <p className="hint">Output: {W} × {H} px</p>

            <h3>Waktu</h3>
            <div className="field">
                <span className="lbl">Frame per detik</span>
                <div className="seg" role="group" aria-label="Frame per detik">
                    {FPS_OPTIONS.map((f) => (
                        <button key={f} className={s.fps === f ? 'on' : ''} onClick={() => set({ fps: f })}>{f}</button>
                    ))}
                </div>
            </div>
            <div className="field">
                <label htmlFor="dur">Durasi (detik)</label>
                <div className="slider-row">
                    <input type="range" aria-label="Durasi slider" min={0.5} max={60} step={0.5} value={s.duration} onChange={(e) => set({ duration: Number(e.target.value) })} />
                    <input id="dur" type="number" min={0.1} max={300} step={0.1} value={s.duration} onChange={(e) => set({ duration: Math.max(0.1, Number(e.target.value)) })} />
                </div>
            </div>
            <p className="hint">Total {Math.round(s.duration * s.fps)} frame</p>
            {detected && Math.abs(detected.seconds - s.duration) > 0.05 && (
                <div className="suggest" role="status">
                    <span>Durasi terdeteksi: <b>{detected.seconds} detik</b> dari {detected.source}.</span>
                    <button className="secondary sm" onClick={() => set({ duration: detected.seconds })}>Pakai</button>
                </div>
            )}
            {detected && Math.abs(detected.seconds - s.duration) <= 0.05 && (
                <p className="hint ok">Durasi sudah sesuai animasi ({detected.source}).</p>
            )}
            {!detected && <p className="hint">Durasi tidak terdeteksi dari kode, isi manual.</p>}

            <h3>Latar belakang</h3>
            <div className="seg wrap" role="group" aria-label="Latar belakang">
                {BG.map((b) => (
                    <button key={b.id} className={s.bgMode === b.id ? 'on' : ''} onClick={() => set({ bgMode: b.id })}>{b.label}</button>
                ))}
            </div>
            {s.bgMode === 'color' && (
                <div className="field color-row">
                    <label htmlFor="bgc">Warna latar</label>
                    <input id="bgc" type="color" value={s.bgColor} onChange={(e) => set({ bgColor: e.target.value })} />
                    <input aria-label="Kode warna hex" value={s.bgColor} onChange={(e) => set({ bgColor: e.target.value })} />
                </div>
            )}
            {s.bgMode === 'image' && (
                <div className="field">
                    <label htmlFor="bgi">Gambar latar</label>
                    <input id="bgi" type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0])} />
                    {s.bgImage ? <img className="thumb" src={s.bgImage} alt="Gambar latar terpilih" /> : <p className="hint">Belum ada gambar dipilih.</p>}
                </div>
            )}
            {s.bgMode === 'transparent' && (
                <p className="hint">Latar body dari kode diabaikan. Transparansi tersimpan di WebM (VP9), GIF, dan PNG sequence.</p>
            )}

            <h3>Kualitas render</h3>
            <div className="field">
                <span className="lbl">Anti-alias (supersampling)</span>
                <div className="seg" role="group" aria-label="Anti-alias">
                    {[1, 2, 3].map((v) => (
                        <button key={v} className={s.supersample === v ? 'on' : ''} onClick={() => set({ supersample: v })}>{v === 1 ? 'Mati' : `${v}×`}</button>
                    ))}
                </div>
                <p className="hint">
                    Digambar {s.supersample}× lebih besar lalu diperkecil, sehingga tepi halus dan tidak berkedip.
                    {s.supersample > 1 && Math.max(W, H) * s.supersample > 8192 && ` Untuk ${W}×${H}, faktor dibatasi ke ${Math.max(1, Math.floor(8192 / Math.max(W, H)))}× supaya tidak melebihi batas GPU.`}
                    {s.supersample > 1 && ' Render sekitar ' + (s.supersample * s.supersample) + '× lebih lama.'}
                </p>
            </div>
            <div className="field">
                <label htmlFor="grain">Film grain / dither: {s.grain.toFixed(1)}%</label>
                <input id="grain" type="range" min={0} max={3} step={0.1} value={s.grain} onChange={(e) => set({ grain: Number(e.target.value) })} />
                <p className="hint">Mencegah banding pada gradasi gelap. Untuk microstock disarankan 0,5–1,5%. Di atas 2% bisa dianggap noise.</p>
            </div>
        </div>
    );
}
