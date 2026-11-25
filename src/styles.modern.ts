// Modern clean skin: replaces the neumorphic layer with flat surfaces, thin borders and soft elevation.

/** Removes the old neumorphic block from the base stylesheet. */
export function stripNeo(css: string): string {
    const a = css.indexOf('/* ============ Neumorphic skin');
    if (a < 0) return css;
    const b = css.indexOf('/* Responsive */', a);
    return b < 0 ? css.slice(0, a) : css.slice(0, a) + css.slice(b);
}

export const MODERN = `
.app{--neo:#ffffff;--press:inset 0 0 0 1px var(--line2);--raise-sm:none;--bg:#f5f6f8;--panel:#ffffff;--line:#e6e8ec;--line2:#d5d9e0;--ink:#15181d;--ink2:#3c434d;--mute:#5d6470;background:var(--bg)}
.app.dark{--neo:#24272c;--bg:#111317;--panel:#1a1d22;--line:#2a2e35;--line2:#373c45}
.app .top{background:var(--panel);border-bottom:1px solid var(--line);padding:12px 20px}
.app .logo{border-radius:9px}
.app .main{gap:16px;padding:16px}
.app .col{border:1px solid var(--line)!important;border-radius:14px;background:var(--panel);box-shadow:0 1px 2px rgba(16,24,40,.05),0 6px 20px rgba(16,24,40,.04);overflow:hidden}
.app.dark .col{box-shadow:0 1px 2px rgba(0,0,0,.4)}
.app .col-side{overflow:auto}
.app .col-preview{background:var(--panel)}
.app .stage-wrap{margin:12px;border-radius:12px;background:#eceef2}
.app.dark .stage-wrap{background:#0d0f12}
.app .stage{border-radius:4px}
.app .editor{margin:0 12px;border-radius:10px}
.app .ed-foot{margin:8px 12px 12px;border-radius:10px;border:0}
.app .console{margin:0 12px 12px;border:1px solid var(--line);border-radius:10px}
.app .side-tabs{margin:12px;height:42px;border:0;border-radius:10px;background:#f0f2f5;padding:4px;gap:4px;top:12px}
.app.dark .side-tabs{background:#24272c}
.app .side-tabs button{border:0;border-radius:7px;font-weight:600}
.app .side-tabs button.on{background:var(--panel);color:var(--ink);box-shadow:0 1px 3px rgba(16,24,40,.12)}
.app.dark .side-tabs button.on{background:#343841}
.app .secondary,.app .icon-btn{border-radius:8px}
.app .icon-btn.play{border-radius:50%;background:var(--acc);border-color:var(--acc);color:#fff}
.app .icon-btn.play:hover{background:var(--acc2)}
.app .primary{height:44px;border-radius:10px;font-size:14px;letter-spacing:0}
.app .field input:not([type=range]):not([type=color]):not([type=checkbox]):not([type=file]),.app .field select,.app .top select{border-radius:8px;height:36px}
.app .seg{border-radius:9px;background:#f0f2f5;border:0;padding:3px;gap:3px}
.app.dark .seg{background:#24272c}
.app .seg button{border:0!important;border-radius:7px;background:transparent}
.app .seg button.on{background:var(--panel);color:var(--ink);box-shadow:0 1px 3px rgba(16,24,40,.12)}
.app.dark .seg button.on{background:#343841;color:var(--ink)}
.app .fmt{border-radius:10px}
.app .fmt.on{background:var(--accbg);border-color:var(--acc)}
.app .chip{border-radius:999px}
.app .progress,.app .details{border-radius:10px}
.app .loop,.app .error,.app .suggest{border-radius:10px}
.app .result-media,.app .thumb{border-radius:10px}
.app .panel h3{border-top:1px solid var(--line)}
.app .panel h3:first-child{border-top:0}
.app .ghost{border-radius:7px}
@media (max-width:760px){.app .main{gap:12px;padding:10px}.app .top{padding:10px 14px}}
.app .stage-wrap{position:relative}
.fs-btn{position:absolute;top:10px;right:10px;z-index:3;opacity:.92}
.app .preview.fullview{position:fixed;inset:0;z-index:50;background:#0b0c0e;display:flex;flex-direction:column}
.app .preview.fullview .stage-wrap{flex:1;margin:0;border-radius:0;background:#0b0c0e}
.app .preview.fullview .transport,.app .preview.fullview .scalebar,.app .preview.fullview .meta{background:#15171b;color:#eceae5}
.app .preview.fullview .tc,.app .preview.fullview .check,.app .preview.fullview .sb-lbl,.app .preview.fullview .sb-xy{color:#d6d8dc}
.app .preview.fullview .meta{display:none}
.still{position:relative;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.still-menu{position:absolute;bottom:36px;left:0;z-index:6;display:flex;flex-direction:column;min-width:220px;background:var(--panel);border:1px solid var(--line2);border-radius:10px;box-shadow:0 10px 30px rgba(16,24,40,.18);padding:4px}
.still-menu button{display:flex;flex-direction:column;align-items:flex-start;gap:1px;border:0;background:none;padding:8px 10px;border-radius:7px;font-size:13px;font-weight:600;color:var(--ink);cursor:pointer;text-align:left}
.still-menu button span{font-size:11.5px;font-weight:400;color:var(--mute)}
.still-menu button:hover{background:#f1f2f5}
.app.dark .still-menu button:hover{background:#2a2e35}
.still-msg{font-size:12px;color:var(--ink2)}
`;
