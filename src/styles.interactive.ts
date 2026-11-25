// Interaction polish: motion, feedback and hover/press states.
export const INTERACTIVE = `
@media (prefers-reduced-motion:no-preference){
.app .col{animation:mrs-rise .45s cubic-bezier(.2,.8,.2,1) both}
.app .col-preview{animation-delay:.06s}.app .col-side{animation-delay:.12s}
.tab-pane.on{animation:mrs-fade .25s ease both}
.job{animation:mrs-rise .3s cubic-bezier(.2,.8,.2,1) both}
.toast{animation:mrs-toast .3s cubic-bezier(.2,.8,.2,1) both}
.stage-flash{animation:mrs-pop .45s ease-out forwards}
.icon-btn.play.is-playing{animation:mrs-pulse 2s ease-in-out infinite}
}
@keyframes mrs-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes mrs-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes mrs-toast{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes mrs-pop{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.25)}}
@keyframes mrs-pulse{0%,100%{box-shadow:0 0 0 0 rgba(194,65,12,.35)}50%{box-shadow:0 0 0 6px rgba(194,65,12,0)}}
@keyframes mrs-shine{from{transform:translateX(-100%)}to{transform:translateX(250%)}}

.tab-pane{display:none}.tab-pane.on{display:block}

/* tactile buttons */
.app button,.app .secondary,.app .fmt,.app .seg button{transition:transform .12s ease,background-color .15s,box-shadow .15s,border-color .15s,color .15s}
.app button:active:not(:disabled),.app label.secondary:active{transform:scale(.96)}
.app .fmt:hover:not(:disabled){border-color:var(--acc);transform:translateY(-1px)}
.app .secondary:hover,.app .icon-btn:hover{border-color:var(--acc);color:var(--acc)}
.app .icon-btn.play:hover{color:#fff}
.app .field input:focus,.app .field select:focus{box-shadow:0 0 0 3px rgba(194,65,12,.16)}

/* render button: shimmer while rendering */
.render-btn{transition:transform .12s ease,background-color .15s,box-shadow .2s}
.render-btn:hover:not(:disabled){box-shadow:0 6px 18px rgba(194,65,12,.35);transform:translateY(-1px)}
.render-btn::before{content:'';position:absolute;top:0;bottom:0;left:0;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);transform:translateX(-100%);pointer-events:none}
.render-btn:has(.render-badge)::before{animation:mrs-shine 1.4s linear infinite}

/* preview stage */
.stage{cursor:pointer}
.stage-flash{position:absolute;left:50%;top:50%;width:64px;height:64px;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;display:flex;align-items:center;justify-content:center;z-index:4;pointer-events:none;transform:translate(-50%,-50%)}

/* timeline feedback */
.tl-track:hover .tl-head{width:3px}
.tl-handle{transition:transform .12s}
.tl-handle:hover,.tl-handle:active{transform:scaleX(1.25)}
.tl-head{transition:left .05s linear}

/* keyboard shortcuts popover */
.transport .spacer{flex:1}
.kbd-wrap{position:relative}
.kbd-pop{position:absolute;right:0;bottom:38px;z-index:8;min-width:250px;display:flex;flex-direction:column;gap:7px;padding:12px;background:var(--panel);border:1px solid var(--line2);border-radius:12px;box-shadow:0 12px 32px rgba(16,24,40,.18);font-size:12.5px;color:var(--ink);animation:mrs-fade .2s ease both}
kbd{display:inline-block;min-width:20px;padding:1px 6px;border-radius:5px;border:1px solid var(--line2);border-bottom-width:2px;background:var(--bg);font:600 11px ui-monospace,Menlo,Consolas,monospace;text-align:center;color:var(--ink)}

/* drag and drop */
.drop-hint{position:fixed;inset:0;z-index:60;background:rgba(194,65,12,.12);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;pointer-events:none}
.drop-hint div{padding:18px 26px;border:2px dashed var(--acc);border-radius:16px;background:var(--panel);color:var(--ink);font-weight:650;font-size:14px}

/* queue job states */
.job.rendering .bar div{background-image:linear-gradient(45deg,rgba(255,255,255,.22) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.22) 50%,rgba(255,255,255,.22) 75%,transparent 75%);background-size:18px 18px;animation:mrs-stripes .8s linear infinite}
@keyframes mrs-stripes{from{background-position:0 0}to{background-position:18px 0}}
.job.done{border-color:rgba(31,157,85,.45)}
.job-h:hover .job-name{color:var(--acc)}
`;
