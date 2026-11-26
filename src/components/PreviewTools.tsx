import { useState } from 'react';

export type Guides = { grid: boolean; safe: boolean; center: boolean; checker: boolean };
type GuideKey = keyof Guides;
const OFF: Guides = { grid: false, safe: false, center: false, checker: false };

/** Preview guide toggles, remembered between visits. */
export function useGuides(): [Guides, (g: GuideKey) => void] {
    const [guides, setGuides] = useState<Guides>(() => {
        try { return { ...OFF, ...JSON.parse(localStorage.getItem('miv-guides') || '{}') }; } catch { return OFF; }
    });
    const toggle = (g: GuideKey) => setGuides((x) => { const n = { ...x, [g]: !x[g] }; try { localStorage.setItem('miv-guides', JSON.stringify(n)); } catch { /* ignore */ } return n; });
    return [guides, toggle];
}

/** Grid / safe area / center overlay drawn on top of the preview (not rendered into the video). */
export function PreviewGuides({ guides, W, H }: { guides: Guides; W: number; H: number }) {
    return (
        <>
                    {(guides.grid || guides.safe || guides.center) && (
                        <svg className="pv-guides" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
                            {guides.grid && <g stroke="rgba(255,255,255,.75)" strokeWidth={Math.max(1, W / 800)} vectorEffect="non-scaling-stroke">
                                <line x1={W / 3} y1={0} x2={W / 3} y2={H} /><line x1={(2 * W) / 3} y1={0} x2={(2 * W) / 3} y2={H} />
                                <line x1={0} y1={H / 3} x2={W} y2={H / 3} /><line x1={0} y1={(2 * H) / 3} x2={W} y2={(2 * H) / 3} />
                            </g>}
                            {guides.safe && <g fill="none" vectorEffect="non-scaling-stroke">
                                <rect x={W * 0.05} y={H * 0.05} width={W * 0.9} height={H * 0.9} stroke="rgba(0,255,120,.85)" strokeDasharray="8 6" />
                                <rect x={W * 0.1} y={H * 0.1} width={W * 0.8} height={H * 0.8} stroke="rgba(255,210,60,.9)" strokeDasharray="8 6" />
                            </g>}
                            {guides.center && <g stroke="rgba(255,60,140,.95)" vectorEffect="non-scaling-stroke">
                                <line x1={W / 2 - W * 0.04} y1={H / 2} x2={W / 2 + W * 0.04} y2={H / 2} /><line x1={W / 2} y1={H / 2 - W * 0.04} x2={W / 2} y2={H / 2 + W * 0.04} />
                            </g>}
                        </svg>
                    )}
        </>
    );
}

interface ToolsProps {
    guides: Guides;
    toggleGuide: (g: GuideKey) => void;
    speed: number;
    setSpeed: (n: number) => void;
    onEnd: () => void;
    onFull: () => void;
}

/** Preview toolbar: guides, transparency check, speed, last frame, fullscreen. */
export function PreviewTools({ guides, toggleGuide, speed, setSpeed, onEnd, onFull }: ToolsProps) {
    return (
            <div className="pv-tools" role="toolbar" aria-label="Alat pratinjau">
                <button className={guides.grid ? 'on' : ''} aria-pressed={guides.grid} onClick={() => toggleGuide('grid')} title="Grid sepertiga">
                    <svg width="14" height="14" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"><path d="M1 1h14v14H1zM5.5 1v14M10.5 1v14M1 5.5h14M1 10.5h14" fill="none" stroke="currentColor" /></svg>Grid
                </button>
                <button className={guides.safe ? 'on' : ''} aria-pressed={guides.safe} onClick={() => toggleGuide('safe')} title="Area aman judul dan aksi">
                    <svg width="14" height="14" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"><path d="M1 1h14v14H1z" fill="none" stroke="currentColor" /><path d="M3.5 3.5h9v9h-9z" fill="none" stroke="currentColor" strokeDasharray="2 1" /></svg>Area aman
                </button>
                <button className={guides.center ? 'on' : ''} aria-pressed={guides.center} onClick={() => toggleGuide('center')} title="Tanda tengah">
                    <svg width="14" height="14" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" /></svg>Tengah
                </button>
                <button className={guides.checker ? 'on' : ''} aria-pressed={guides.checker} onClick={() => toggleGuide('checker')} title="Latar kotak-kotak untuk cek transparansi">
                    <svg width="14" height="14" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"><path d="M1 1h7v7H1zM8 8h7v7H8z" fill="currentColor" /><path d="M1 1h14v14H1z" fill="none" stroke="currentColor" /></svg>Transparan
                </button>
                <label className="pv-speed">Kecepatan
                    <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Kecepatan pratinjau">
                        <option value={0.25}>0.25×</option><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option>
                    </select>
                </label>
                <button onClick={onEnd} title="Ke frame terakhir">
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 2v12M2 2l9 6-9 6z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" /></svg>Akhir
                </button>
                <button onClick={onFull} title="Layar penuh">
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>Penuh
                </button>
            </div>
    );
}
