import { videoExt } from '../lib/toMov';
import { useEffect, useState } from 'react';
import { downloadFile } from '../lib/download';
import { jobEta, useRender } from '../lib/renderQueue';
import type { Job } from '../lib/renderQueue';
import { formatBytes } from '../lib/types';
import { LoopBadge, ResultDetails, fmtDur } from './ExportPanel';

const STATUS: Record<Job['status'], string> = {
    queued: 'Menunggu', rendering: 'Merender', done: 'Selesai', error: 'Gagal', cancelled: 'Dibatalkan',
};

function JobRow({ j, now }: { j: Job; now: number }) {
    const { cancel, remove, selected, select } = useRender();
    const [err, setErr] = useState<string | null>(null);
    const pct = j.prog ? Math.round((j.prog.frame / j.prog.total) * 100) : j.status === 'done' ? 100 : 0;
    const eta = j.status === 'rendering' ? jobEta(j, now) : null;
    const open = selected === j.id;
    const ext = j.format === 'png' ? 'zip' : j.format === 'mp4' ? videoExt(j.settings) : j.format;
    const save = async () => {
        if (!j.blob) return;
        try { await downloadFile(`${j.name}.${ext}`, j.blob); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    };
    return (
        <div className={`job ${j.status}${open ? ' open' : ''}`}>
            <button className="job-h" onClick={() => select(open ? null : j.id)} aria-expanded={open}>
                <span className={`job-dot ${j.status}`} aria-hidden="true" />
                <span className="job-name">{j.name}.{ext}</span>
                <span className="job-st">{STATUS[j.status]}{j.status === 'rendering' ? ` ${pct}%` : ''}</span>
            </button>
            <div className="job-meta">{j.width}×{j.height} · {j.fps} fps · {j.seconds.toFixed(1)} dtk{j.blob ? ` · ${formatBytes(j.blob.size)}` : ''}{j.ms ? ` · ${fmtDur(j.ms)}` : ''}</div>
            {j.status === 'rendering' && (
                <>
                    <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${pct}%` }} /></div>
                    <div className="eta">
                        <span>{j.prog?.phase ?? 'Menyiapkan'}{j.prog && j.prog.phase === 'Merender frame' ? ` ${j.prog.frame}/${j.prog.total}` : ''}</span>
                        <span>{eta === null ? 'Menghitung sisa waktu…' : `Sisa sekitar ${fmtDur(eta)}`}</span>
                    </div>
                </>
            )}
            {j.status === 'error' && <div className="error" role="alert"><b>Render gagal.</b> {j.error}</div>}
            {err && <div className="error" role="alert">{err}</div>}
            <div className="job-actions">
                {j.status === 'done' && <button className="primary sm-btn" onClick={save}>Unduh</button>}
                {(j.status === 'rendering' || j.status === 'queued') && <button className="secondary sm" onClick={() => cancel(j.id)}>Batalkan</button>}
                {j.status !== 'rendering' && <button className="ghost sm" onClick={() => remove(j.id)}>Hapus</button>}
            </div>
            {open && j.status === 'done' && j.url && j.blob && (
                <div className="job-body">
                    {j.format === 'png' || j.settings.container === 'mova' ? (j.settings.container === 'mova' ? <p className="hint">MOV transparan tidak bisa diputar di browser. Unduh, lalu buka di After Effects, Premiere Pro, Final Cut, DaVinci Resolve, atau VLC.</p> : null) : j.format === 'gif'
                        ? <img className="result-media checker" src={j.url} alt="Hasil GIF" />
                        : <video className="result-media checker" src={j.url} controls loop muted autoPlay playsInline />}
                    <ResultDetails result={{ url: j.url, blob: j.blob, name: j.name, format: j.format, note: j.note, ms: j.ms ?? 0, loop: j.loop, frames: j.frames ?? 0, fps: j.fps, width: j.width, height: j.height, rateMode: j.rateMode, wantCbr: false }} targetMbps={j.targetMbps} />
                    {j.loop && <LoopBadge loop={j.loop} />}
                    {j.note && <p className="hint warn">{j.note}</p>}
                </div>
            )}
        </div>
    );
}

export function RenderQueue() {
    const { jobs, clearDone } = useRender();
    const [now, setNow] = useState(performance.now());
    const busy = jobs.some((j) => j.status === 'rendering');
    useEffect(() => {
        if (!busy) return;
        const id = setInterval(() => setNow(performance.now()), 500);
        return () => clearInterval(id);
    }, [busy]);
    const finished = jobs.filter((j) => j.status !== 'rendering' && j.status !== 'queued').length;
    return (
        <div className="panel">
            <div className="q-h">
                <h3 style={{ border: 0, padding: '18px 0 10px' }}>Antrian render</h3>
                {finished > 0 && <button className="ghost sm" onClick={clearDone}>Bersihkan selesai</button>}
            </div>
            {jobs.length === 0 ? (
                <p className="hint">Belum ada render. Tekan Render di atas untuk menambah video ke antrian. Hasilnya tetap ada di sini selama aplikasi terbuka, jadi bisa diunduh ulang.</p>
            ) : (
                <div className="jobs">{[...jobs].reverse().map((j) => <JobRow key={j.id} j={j} now={now} />)}</div>
            )}
            {busy && <p className="hint" style={{ marginTop: 10 }}>Jangan tutup atau pindah tab supaya render tidak melambat.</p>}
        </div>
    );
}
