import { videoExt } from '../lib/toMov';
import { useEffect, useRef, useState } from 'react';
import { downloadFile } from '../lib/download';
import { jobEta, useRender } from '../lib/renderQueue';
import type { Job } from '../lib/renderQueue';
import { formatBytes } from '../lib/types';
import { fmtDur } from './ExportPanel';
import { PixelIcon } from './PixelIcon';

/** 90s-style dialog windows: "Rendering..." while a job runs, "Render selesai" when it finishes. */
export function RenderDialog() {
    const { jobs, active, cancel } = useRender();
    const [now, setNow] = useState(Date.now());
    const [hidden, setHidden] = useState<number | null>(null);
    const [doneJob, setDoneJob] = useState<Job | null>(null);
    const [err, setErr] = useState('');
    const prevActive = useRef<number | null>(null);
    const vid = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!active) return;
        const t = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(t);
    }, [active]);

    // When the active job finishes, show the "done" dialog for it.
    useEffect(() => {
        const id = active?.id ?? null;
        if (prevActive.current !== null && prevActive.current !== id) {
            const fin = jobs.find((j) => j.id === prevActive.current);
            if (fin && (fin.status === 'done' || fin.status === 'error')) { setDoneJob(fin); setErr(''); }
        }
        prevActive.current = id;
    }, [active, jobs]);

    if (active && hidden !== active.id) {
        const pct = active.prog ? Math.round((active.prog.frame / Math.max(1, active.prog.total)) * 100) : 0;
        const eta = jobEta(active, now);
        const waiting = jobs.filter((j) => j.status === 'queued').length;
        return (
            <div className="w95-overlay" role="dialog" aria-modal="false" aria-label="Rendering">
                <div className="w95-win">
                    <div className="w95-title">
                        <PixelIcon name="film" size={14} />
                        <span>Rendering... {pct}%</span>
                        <button className="w95-x" onClick={() => setHidden(active.id)} aria-label="Sembunyikan">_</button>
                    </div>
                    <div className="w95-body">
                        <div className="w95-anim" aria-hidden="true">
                            <div className="w95-reel"><PixelIcon name="film" size={40} /></div>
                            <div className="w95-dots"><i /><i /><i /><i /><i /></div>
                            <div className="w95-reel"><PixelIcon name="save" size={40} /></div>
                        </div>
                        <div className="w95-file"><b>{active.name}.{videoExt(active.settings)}</b></div>
                        <div className="w95-info">{active.width}×{active.height} · {active.fps} fps · {active.seconds} detik</div>
                        <div className="w95-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                            <div style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w95-row">
                            <span>{active.prog?.phase ?? 'Menyiapkan'}{active.prog && active.prog.phase === 'Merender frame' ? ` ${active.prog.frame}/${active.prog.total}` : ''}</span>
                            <span>{eta === null ? 'Menghitung sisa waktu...' : `Sisa ${fmtDur(eta)}`}</span>
                        </div>
                        {waiting > 0 && <div className="w95-row muted-w">{waiting} video lagi di antrian</div>}
                        <p className="w95-hint">Jangan tutup atau pindah tab supaya render tidak melambat.</p>
                        <div className="w95-btns">
                            <button onClick={() => setHidden(active.id)}>Sembunyikan</button>
                            <button onClick={() => cancel(active.id)}>Batal</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!doneJob || active) return null;
    const j = jobs.find((x) => x.id === doneJob.id) ?? doneJob;
    const ok = j.status === 'done' && !!j.blob;
    const fname = `${j.name}.${videoExt(j.settings)}`;
    const save = async () => {
        if (!j.blob) return;
        try { await downloadFile(fname, j.blob); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    };
    const share = async () => {
        if (!j.blob) return;
        try {
            const file = new File([j.blob], fname, { type: j.blob.type || 'video/mp4' });
            const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
            if (nav.share && nav.canShare?.({ files: [file] })) await nav.share({ files: [file], title: j.name });
            else setErr('Browser ini tidak bisa membagikan file langsung. Simpan dulu, lalu bagikan dari Galeri.');
        } catch (e) { if (!(e instanceof DOMException && e.name === 'AbortError')) setErr(e instanceof Error ? e.message : String(e)); }
    };
    return (
        <div className="w95-overlay" role="dialog" aria-modal="true" aria-label={ok ? 'Render selesai' : 'Render gagal'}>
            <div className="w95-win">
                <div className="w95-title">
                    <PixelIcon name={ok ? 'ok' : 'warn'} size={14} />
                    <span>{ok ? 'Render selesai' : 'Render gagal'}</span>
                    <button className="w95-x" onClick={() => setDoneJob(null)} aria-label="Tutup">X</button>
                </div>
                <div className="w95-body">
                    <div className="w95-msg">
                        <PixelIcon name={ok ? 'ok' : 'warn'} size={32} />
                        <div>
                            {ok ? (
                                <>
                                    <b>{fname}</b>
                                    <div className="w95-info">{j.width}×{j.height} · {j.fps} fps · {j.blob ? formatBytes(j.blob.size) : ''}{j.ms ? ` · ${fmtDur(j.ms)}` : ''}</div>
                                </>
                            ) : (
                                <><b>Video tidak berhasil dibuat.</b><div className="w95-info">{j.error}</div></>
                            )}
                        </div>
                    </div>
                    {ok && j.url && <video ref={vid} className="w95-video" src={j.url} loop muted playsInline controls />}
                    {err && <p className="w95-err">{err}</p>}
                    <div className="w95-btns">
                        {ok && <button onClick={() => { void vid.current?.play(); }}><PixelIcon name="play" size={14} /> Putar</button>}
                        {ok && <button className="w95-def" onClick={save}><PixelIcon name="save" size={14} /> Simpan</button>}
                        {ok && <button onClick={share}><PixelIcon name="share" size={14} /> Bagikan</button>}
                        <button onClick={() => setDoneJob(null)}>{ok ? 'Tutup' : 'OK'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
