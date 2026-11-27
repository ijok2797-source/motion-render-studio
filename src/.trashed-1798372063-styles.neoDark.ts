// Dark-mode neumorphic overrides (beat the earlier flat dark rules by specificity).
export const NEO_DARK = `
.scalebar{display:flex;flex-direction:column;gap:10px;padding:4px 18px 12px}
.sb-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.sb-lbl{font-size:12px;font-weight:600;color:var(--ink2);width:44px;flex-shrink:0}
.sb-row input[type=range]{flex:1;min-width:110px}
.app .icon-btn.sm{width:30px;height:30px;border-radius:9px}
.sb-num{width:58px;height:32px;border:0;border-radius:9px;background:var(--neo);box-shadow:var(--press);color:var(--ink);text-align:center;font-variant-numeric:tabular-nums}
.sb-unit{font-size:12px;color:var(--mute);margin-left:-4px}
.sb-pad{display:flex;gap:5px}
.sb-xy{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--ink2);font-weight:600}
.sb-xy input{width:52px;height:30px;border:0;border-radius:9px;background:var(--neo);box-shadow:var(--press);color:var(--ink);text-align:center}
.sb-num:focus,.sb-xy input:focus{outline:2px solid var(--acc)}
@media (max-width:480px){.sb-lbl{width:100%}}`;
export const NEO_DARK_REST = `
.app.dark .top select,.app.dark .field input:not([type=range]):not([type=color]):not([type=checkbox]):not([type=file]),.app.dark .field select{background:var(--neo);border:0;box-shadow:var(--press);color:var(--ink)}
.app.dark .secondary,.app.dark .icon-btn,.app.dark .ghost,.app.dark .fmt,.app.dark .color-row input[type=color]{background:var(--neo);border:0;box-shadow:var(--raise-sm);color:var(--ink)}
.app.dark .secondary:hover,.app.dark .icon-btn:hover,.app.dark .ghost:hover{background:var(--neo);color:var(--acc)}
.app.dark .ed-toggle:hover{background:transparent}
.app.dark .icon-btn.play{background:var(--acc);color:#fff;box-shadow:var(--raise-sm)}
.app.dark .icon-btn.play:hover{background:var(--acc2)}
.app.dark .seg{background:var(--neo);box-shadow:var(--press)}
.app.dark .seg button{background:transparent;color:var(--ink2)}
.app.dark .seg button.on{background:var(--neo);color:var(--acc);box-shadow:var(--raise-sm)}
.app.dark .fmt.on{box-shadow:var(--press);background:var(--neo)}
.app.dark .logo{background:var(--neo)}
.app.dark .stage-wrap{background:var(--neo)}
.app.dark .chip{background:var(--neo);border:0;box-shadow:var(--raise-sm)}
.app.dark .ed-kind,.app.dark .badge.soft-l{background:var(--neo);border:0;box-shadow:var(--press)}
.app.dark .progress,.app.dark .details{background:var(--neo);box-shadow:var(--press)}
.app.dark .bar{background:var(--neo)}
.app.dark .error,.app.dark .ed-errline,.app.dark .loop{border:0}
`;
