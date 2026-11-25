// Dark-mode neumorphic overrides (beat the earlier flat dark rules by specificity).
export const NEO_DARK = `
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
