// Responsive page layout for every screen size (phone, tablet, desktop). Loaded last so it wins over older layout rules.
export const LAYOUT = `
.app{min-height:100dvh;box-sizing:border-box;padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right);padding-bottom:env(safe-area-inset-bottom)}
.app .main{width:100%;max-width:1680px;margin:0 auto;box-sizing:border-box;padding:8px 6px 16px !important;gap:8px !important}
.app .col{box-sizing:border-box;min-width:0 !important}

/* Dark mode keeps text readable on the gray 90s panels */
.app.dark{--ink:#000;--ink2:#202020;--mute:#404040;color-scheme:light;background:#004848 !important}

/* Code bar (editor itself opens as a window) */
.app .ed-collapsed{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:4px}
.app .ed-collapsed .ed-toggle{flex:1 1 180px;min-width:0;display:flex;align-items:center;gap:8px;justify-content:flex-start;text-align:left}
.app .ed-collapsed .ed-label{display:inline-flex;align-items:center;gap:6px;font-weight:700;color:#000 !important;white-space:nowrap}
.app .ed-collapsed .ed-kind{background:#000080 !important;color:#fff !important;font-size:11px;line-height:16px;padding:0 6px;font-weight:700}
.app .ed-collapsed .ed-sum{color:#404040 !important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.app .ed-collapsed .ed-actions{display:flex;gap:4px;flex-wrap:wrap}

/* Preview info line: plain readable text */
.app .col-preview .pv-info b,.app .col-preview .pv-info span{background:transparent !important;color:#000 !important;padding:0 !important;box-shadow:none !important;font-size:12px}

/* Tablet landscape and desktop: code bar + preview on the left, settings on the right */
@media (min-width: 900px){
  .app .main{display:grid !important;grid-template-columns:minmax(0,1fr) clamp(300px,30vw,380px) !important;grid-template-areas:"ed side" "pv side";align-items:start}
  .app .col-editor{grid-area:ed}
  .app .col-preview{grid-area:pv}
  .app .col-side{grid-area:side;position:sticky !important;top:8px;max-height:calc(100dvh - 16px);overflow:auto !important}
  .app .col-preview .stage-wrap{height:clamp(240px,calc((100vw - 440px) * 0.5625),66vh) !important}
}
`;
