// Styles for the pro workspace pieces: preview header, timeline, toolbar render button, render queue.
export const PRO = `
.pv-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px 0;flex-wrap:wrap}
.pv-tc{font:600 20px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.5px;color:var(--ink);font-variant-numeric:tabular-nums}
.pv-info{display:flex;gap:6px;flex-wrap:wrap;font-size:11.5px;color:var(--ink2)}
.pv-info>*{padding:3px 8px;border-radius:999px;background:#f0f2f5;font-variant-numeric:tabular-nums}
.app.dark .pv-info>*{background:#2a2e35}
.pv-info b{font-weight:650;color:var(--ink)}

.tl{padding:6px 14px 2px}
.tl-track{position:relative;height:58px;cursor:pointer;touch-action:none;user-select:none;outline:none}
.tl-track:focus-visible{outline:2px solid var(--acc);outline-offset:2px;border-radius:8px}
.tl-ruler{position:absolute;left:0;right:0;top:0;height:18px}
.tl-tick{position:absolute;transform:translateX(-50%);font:11px ui-monospace,Menlo,Consolas,monospace;color:var(--mute);white-space:nowrap;top:0}
.tl-tick:first-child{transform:none}
.tl-tick:last-child{transform:translateX(-100%)}
.tl-tick i{position:absolute;left:50%;top:15px;width:1px;height:6px;background:var(--line2)}
.tl-tick:first-child i{left:0}.tl-tick:last-child i{left:100%}
.tl-lane{position:absolute;left:0;right:0;top:24px;height:28px;border-radius:7px;background:#eceef2;overflow:visible}
.app.dark .tl-lane{background:#24272c}
.tl-range{position:absolute;top:0;bottom:0;background:rgba(194,65,12,.16);border-top:2px solid var(--acc);border-bottom:2px solid var(--acc);border-radius:6px}
.tl-range:not(.partial){background:rgba(194,65,12,.10);border-color:rgba(194,65,12,.45)}
.tl-handle{position:absolute;top:-2px;bottom:-2px;width:14px;margin-left:-7px;border-radius:5px;background:var(--acc);cursor:ew-resize;z-index:2;touch-action:none}
.tl-handle::after{content:'';position:absolute;left:5px;right:5px;top:9px;bottom:9px;border-left:1.5px solid rgba(255,255,255,.85);border-right:1.5px solid rgba(255,255,255,.85)}
.tl-head{position:absolute;top:16px;bottom:0;width:2px;margin-left:-1px;background:var(--ink);z-index:3;pointer-events:none}
.tl-head b{position:absolute;top:-4px;left:-6px;width:14px;height:10px;background:var(--ink);clip-path:polygon(0 0,100% 0,50% 100%)}
.tl-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;font:11.5px ui-monospace,Menlo,Consolas,monospace;color:var(--mute);min-height:26px}

.render-btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px;border:0;border-radius:9px;background:var(--acc);color:#fff;font-size:13.5px;font-weight:650;cursor:pointer;white-space:nowrap}
.render-btn:hover{background:var(--acc2)}
.render-btn:disabled{background:#9a9a94;cursor:default}
.render-btn svg{color:#fff}
.render-badge{position:relative;z-index:1;font:600 11.5px ui-monospace,Menlo,Consolas,monospace;padding:2px 6px;border-radius:6px;background:rgba(0,0,0,.22)}
.render-btn span{position:relative;z-index:1}
.render-fill{position:absolute;left:0;top:0;bottom:0;background:rgba(255,255,255,.18);transition:width .3s}

.q-h{display:flex;align-items:center;justify-content:space-between}
.jobs{display:flex;flex-direction:column;gap:10px}
.job{border:1px solid var(--line);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;background:var(--panel)}
.job.rendering{border-color:var(--acc)}
.job-h{display:flex;align-items:center;gap:8px;border:0;background:none;padding:0;cursor:pointer;text-align:left;color:var(--ink);font-size:13px;font-weight:600}
.job-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.job-st{font-size:12px;font-weight:600;color:var(--ink2);white-space:nowrap}
.job-dot{width:8px;height:8px;border-radius:50%;background:var(--mute);flex-shrink:0}
.job-dot.rendering{background:var(--acc)}.job-dot.done{background:#1f9d55}.job-dot.error{background:#c0392b}
.job-meta{font-size:11.5px;color:var(--mute);font-variant-numeric:tabular-nums}
.job-actions{display:flex;gap:6px;align-items:center}
.app .primary.sm-btn{width:auto;height:30px;padding:0 14px;margin:0;font-size:12.5px;border-radius:8px}
.job-body{display:flex;flex-direction:column;gap:8px}
@media (max-width:760px){.render-btn{flex:1;justify-content:center}.pv-tc{font-size:17px}}
`;
