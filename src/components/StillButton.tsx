import { useRef, useState } from 'react';
import { downloadFile } from '../lib/download';
import { captureStill } from '../lib/still';
import type { Code, Settings } from '../lib/types';
import { dims } from '../lib/types';

interface Props {
    code: Code;
    s: Settings;
    timeMs: number;
}

/** Saves the frame currently shown in the preview as a full-resolution thumbnail / poster frame. */
export function StillButton({ code, s, timeMs }: Props) {
    const [busy, setBusy] = useState(false);
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const host = useRef<HTMLDivElement>(null);
    const { W, H } = dims(s);

    const save = async (type: 'png' | 'jpg') => {
        if (!host.current) return;
        setOpen(false);
        setBusy(true);
        setMsg(null);
        try {
            const blob = await captureStill(code, s, timeMs, host.current, type);
            await downloadFile(`${(s.fileName || 'motion').trim()} thumbnail.${type}`, blob);
            setMsg(`Thumbnail ${W}×${H} disimpan dari detik ${(timeMs / 1000).toFixed(2)}.`);
        } catch (e) {
            setMsg(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="still">
            <button className="secondary sm" disabled={busy} onClick={() => setOpen(!open)} aria-expanded={open}>
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="3.5" width="13" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" /><circle cx="8" cy="8.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M5.5 3.5L6.5 2h3l1 1.5" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
                {busy ? 'Menyimpan…' : 'Simpan thumbnail'}
            </button>
            {open && (
                <div className="still-menu" role="menu">
                    <button role="menuitem" onClick={() => save('jpg')}>JPG <span>untuk thumbnail upload</span></button>
                    <button role="menuitem" onClick={() => save('png')}>PNG <span>{s.bgMode === 'transparent' ? 'dengan latar transparan' : 'tanpa kompresi'}</span></button>
                </div>
            )}
            {msg && <span className="still-msg" role="status">{msg}</span>}
            <div ref={host} />
        </div>
    );
}
