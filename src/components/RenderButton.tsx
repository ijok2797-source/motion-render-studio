import { PixelIcon } from './PixelIcon';
import { useRender } from '../lib/renderQueue';
import { pickVideoMime } from '../lib/renderer.new';
import type { Code, ExportFormat, Settings } from '../lib/types';

const LABEL: Record<ExportFormat, string> = { mp4: 'MP4', webm: 'WebM', gif: 'GIF', png: 'PNG' };

/** Main Render button for the toolbar: adds a job to the queue with the current code and settings. */
export function RenderButton({ code, s, onQueued }: { code: Code; s: Settings; onQueued: () => void }) {
    const { enqueue, active, jobs, format } = useRender();
    const waiting = jobs.filter((j) => j.status === 'queued').length;
    const ok = format === 'gif' || format === 'png' || !!pickVideoMime(format, false);
    const pct = active?.prog ? Math.round((active.prog.frame / active.prog.total) * 100) : 0;
    return (
        <button
            className="render-btn"
            disabled={!ok}
            title={ok ? `Render ${LABEL[format]}` : 'Format ini tidak didukung browser'}
            onClick={() => { enqueue(code, s); onQueued(); }}
        >
            <PixelIcon name="render" />
            <span>Render {format === 'mp4' && s.container === 'mov' ? 'MOV' : LABEL[format]}</span>
            {active && <span className="render-badge">{pct}%{waiting > 0 ? ` +${waiting}` : ''}</span>}
            {active && <i className="render-fill" style={{ width: `${pct}%` }} />}
        </button>
    );
}
