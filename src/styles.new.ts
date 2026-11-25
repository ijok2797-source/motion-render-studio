export const CSS = `
*{box-sizing:border-box}
body{margin:0;background:#f4f4f1}
.app{--ink:#17191d;--ink2:#3d424a;--mute:#5b616b;--line:#e2e2dc;--line2:#d2d2ca;--panel:#ffffff;--bg:#f4f4f1;--acc:#c2410c;--acc2:#a3360a;--accbg:#fff4ec;
font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;display:flex;flex-direction:column;font-size:14px;-webkit-font-smoothing:antialiased}
button{font-family:inherit}

/* Header */
.top{display:flex;align-items:center;gap:12px;padding:10px 20px;border-bottom:1px solid var(--line);background:var(--panel);flex-wrap:wrap;position:sticky;top:0;z-index:5}
.brand{display:flex;align-items:center;gap:10px;min-width:0}
.logo{width:30px;height:30px;border-radius:7px;background:var(--ink);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.brand-text{display:flex;flex-direction:column;min-width:0}
.top h1{font-size:15px;margin:0;font-weight:650;line-height:1.2}
.top .sub{color:var(--mute);font-size:12px;line-height:1.3}
.top .spacer{flex:1}
.top-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.top select{height:34px;padding:0 10px;border:1px solid var(--line2);border-radius:7px;background:#fff;color:var(--ink);font-size:13px;max-width:200px}

/* Layout */
.main{display:grid;grid-template-columns:minmax(320px,1fr) minmax(380px,1.3fr) 330px;flex:1;min-height:0;gap:0}
.col{display:flex;flex-direction:column;min-width:0;min-height:0;border-right:1px solid var(--line);background:var(--panel)}
.col:last-child{border-right:0;overflow:auto}
.col-editor{order:1}.col-preview{order:2;background:var(--bg)}.col-side{order:3}
.sec-title{display:flex;align-items:center;justify-content:space-between;padding:0 14px;height:42px;border-bottom:1px solid var(--line);font-size:12px;font-weight:600;color:var(--ink2);background:var(--panel);gap:8px}

/* Editor */
.tabs{display:flex;border-bottom:1px solid var(--line);background:var(--panel);align-items:stretch;height:42px}
.tabs button[role=tab]{border:0;background:none;padding:0 16px;color:var(--mute);cursor:pointer;border-bottom:2px solid transparent;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;font-weight:600}
.tabs button[role=tab].on{color:var(--ink);border-bottom-color:var(--acc)}
.tabs .dot{display:inline-block;width:6px;height:6px;border-radius:3px;background:var(--acc);margin-left:6px;vertical-align:middle}
.tabs .act{margin-left:auto;display:flex;gap:6px;padding:0 10px;align-items:center}
.editor{flex:1;display:flex;background:#1b1d21;min-height:340px;overflow:hidden}
.gutter{padding:14px 10px 14px 12px;color:#7d838d;font:12.5px/20px ui-monospace,Menlo,Consolas,monospace;text-align:right;user-select:none;overflow:hidden;min-width:46px;background:#17191c;border-right:1px solid #26292e}
.editor textarea{flex:1;border:0;outline:0;resize:none;background:transparent;color:#e9e6df;font:12.5px/20px ui-monospace,Menlo,Consolas,monospace;padding:14px;white-space:pre;tab-size:2;overflow:auto;caret-color:#fdba74}
.editor textarea::placeholder{color:#7d838d}
.console{border-top:1px solid var(--line);background:var(--panel);max-height:180px;display:flex;flex-direction:column}
.console-h{display:flex;align-items:center;justify-content:space-between;padding:0 14px;height:38px;font-size:12px;font-weight:600;color:var(--ink2);border-bottom:1px solid #efefea}
.console-b{overflow:auto;font:12px/18px ui-monospace,Menlo,Consolas,monospace;padding:6px 14px 8px}
.console-b>div{padding:2px 0;border-bottom:1px dashed #f0f0eb;word-break:break-word}
.console-b .log-error{color:#b42318}
.console-b .log-warn{color:#8a5300}
.console-b .cnt{color:var(--mute);font-weight:600}
.console-b .empty{color:var(--mute);border:0}
.badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 6px;border-radius:9px;background:#fdecea;color:#a1190f;font-size:11px;font-weight:600;margin-left:4px;flex-shrink:0}

/* Preview */
.preview{display:flex;flex-direction:column;flex:1;min-height:0}
.stage-wrap{flex:1;display:flex;align-items:center;justify-content:center;min-height:320px;overflow:hidden;padding:12px;background:#e8e8e3}
.stage{position:relative;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.12),0 8px 24px rgba(0,0,0,.10);border-radius:2px}
.transport{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--panel);border-top:1px solid var(--line);flex-wrap:wrap}
.transport input[type=range]{flex:1;min-width:140px;accent-color:var(--acc);height:20px}
.tc{font:12px ui-monospace,Menlo,Consolas,monospace;white-space:nowrap;color:var(--ink)}
.meta{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 12px;background:var(--panel);font-size:12px}
.chip{display:inline-flex;align-items:center;height:24px;padding:0 9px;border-radius:12px;background:#f1f1ec;border:1px solid var(--line);color:var(--ink2);font-size:11.5px;font-variant-numeric:tabular-nums}
.muted{color:var(--mute)}
.icon-btn{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line2);border-radius:7px;background:#fff;color:var(--ink);cursor:pointer;flex-shrink:0}
.icon-btn:hover{background:#f4f4f0}
.icon-btn.play{background:var(--ink);color:#fff;border-color:var(--ink)}
.icon-btn.play:hover{background:#2a2d33}

/* Side panel */
.side-tabs{display:flex;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--panel);z-index:1;height:42px}
.side-tabs button{flex:1;border:0;background:none;font-size:13px;color:var(--mute);cursor:pointer;border-bottom:2px solid transparent;font-weight:500}
.side-tabs button.on{color:var(--ink);font-weight:650;border-bottom-color:var(--acc)}
.panel{padding:4px 18px 28px}
.panel h3{font-size:12.5px;font-weight:650;margin:0;padding:18px 0 10px;color:var(--ink);border-top:1px solid #efefea}
.panel h3:first-child{border-top:0}
.field{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
.field label,.lbl{font-size:12px;color:var(--ink2);font-weight:500}
input,select{font:inherit;font-size:13px}
.field input:not([type=range]):not([type=color]):not([type=checkbox]):not([type=file]),.field select{height:34px;padding:0 10px;border:1px solid var(--line2);border-radius:7px;background:#fff;color:var(--ink);width:100%}
.field input:focus,.field select:focus,.top select:focus{outline:2px solid #fdba74;outline-offset:0;border-color:var(--acc)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.slider-row{display:flex;gap:10px;align-items:center}
.slider-row input[type=range]{flex:1;accent-color:var(--acc)}
.slider-row input[type=number]{width:78px!important;flex-shrink:0}
.field input[type=range]{accent-color:var(--acc)}
.hint{font-size:12px;color:var(--mute);margin:0 0 10px;line-height:1.45}
.hint.warn{color:#8a5300}
.hint.ok{color:#1f6b3a}
.suggest{display:flex;align-items:center;gap:10px;justify-content:space-between;background:var(--accbg);border:1px solid #f3cfb4;border-radius:7px;padding:9px 11px;font-size:12px;color:#5a2a0c;margin-bottom:12px;line-height:1.4}
.seg{display:flex;border:1px solid var(--line2);border-radius:7px;overflow:hidden;margin-bottom:12px;background:#fff}
.seg.wrap{flex-wrap:wrap}
.seg button{flex:1;border:0;border-right:1px solid var(--line2);background:#fff;padding:8px 6px;font-size:12px;cursor:pointer;color:var(--ink);font-weight:500;min-width:0}
.seg button:last-child{border-right:0}
.seg button.on{background:var(--ink);color:#fff}
.color-row{flex-direction:row;align-items:center;gap:8px}
.color-row label{flex:1}
.color-row input[type=color]{width:38px;height:34px;border:1px solid var(--line2);border-radius:7px;padding:2px;background:#fff}
.color-row input:not([type=color]){width:100px!important}
.thumb{width:100%;max-height:120px;object-fit:cover;border-radius:7px;margin-top:6px;border:1px solid var(--line)}
.check{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--ink2);cursor:pointer}
.check input{accent-color:var(--acc);width:15px;height:15px}
.formats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
.fmt{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;border:1px solid var(--line2);border-radius:8px;background:#fff;padding:10px 11px;cursor:pointer;color:var(--ink)}
.fmt b{font-size:13px}
.fmt span{font-size:11px;color:var(--mute);line-height:1.3}
.fmt.on{border-color:var(--acc);box-shadow:inset 0 0 0 1px var(--acc);background:var(--accbg)}
.fmt:disabled{opacity:.6;cursor:default}

/* Buttons */
.primary{width:100%;height:42px;border:0;border-radius:8px;background:var(--acc);color:#fff;font-size:14px;font-weight:650;cursor:pointer;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:8px}
.primary:hover{background:var(--acc2)}
.primary:disabled{background:#a3a39c;cursor:default}
.secondary{height:34px;padding:0 13px;border:1px solid var(--line2);border-radius:7px;background:#fff;font-size:13px;cursor:pointer;color:var(--ink);font-weight:500;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.secondary:hover{background:#f4f4f0}
.secondary.sm{height:28px;padding:0 10px;font-size:12px}
.secondary:disabled{opacity:.5;cursor:default}

/* Render progress / result */
.progress{display:flex;flex-direction:column;gap:9px;padding:12px;border:1px solid var(--line);border-radius:8px;background:#fafaf8}
.progress-top{display:flex;justify-content:space-between;font-size:12px;font-variant-numeric:tabular-nums;color:var(--ink2)}
.bar{height:8px;background:#e9e9e3;border-radius:4px;overflow:hidden}
.bar div{height:100%;background:var(--acc);transition:width .15s}
.error{background:#fdecea;color:#8c1d13;border:1px solid #f3c1bb;border-radius:8px;padding:10px 12px;font-size:12.5px;margin-top:12px;line-height:1.45}
.result{margin-top:8px}
.result-media{width:100%;border-radius:8px;border:1px solid var(--line);display:block}
.checker{background-color:#fff;background-image:conic-gradient(#e6e6e6 25%,#fff 0 50%,#e6e6e6 0 75%,#fff 0);background-size:16px 16px}
.result-meta{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--ink2);margin:10px 0;word-break:break-all}
.result-meta span:first-child{font-weight:600;color:var(--ink)}

.toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:10px 16px;border-radius:8px;font-size:13px;display:flex;gap:14px;align-items:center;z-index:20;box-shadow:0 6px 20px rgba(0,0,0,.2);max-width:calc(100vw - 24px)}
.toast button{background:none;border:0;color:#fdba74;font-weight:650;cursor:pointer;font-size:13px}

/* Minimal editor */
.ed-bar{display:flex;align-items:center;gap:8px;height:44px;padding:0 8px 0 14px;border-bottom:1px solid var(--line);background:var(--panel)}
.ed-label{font-size:12.5px;font-weight:650;color:var(--ink);display:flex;align-items:center;gap:8px}
.ed-kind{font-size:11px;font-weight:600;color:var(--ink2);background:#f1f1ec;border:1px solid var(--line);border-radius:10px;padding:1px 8px}
.ed-tabs{display:flex;height:100%}
.ed-tabs button{border:0;background:none;padding:0 12px;color:var(--mute);cursor:pointer;border-bottom:2px solid transparent;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;font-weight:600}
.ed-tabs button.on{color:var(--ink);border-bottom-color:var(--acc)}
.ed-tabs .dot{display:inline-block;width:5px;height:5px;border-radius:3px;background:var(--acc);margin-left:5px;vertical-align:middle}
.ed-actions{margin-left:auto;display:flex;gap:2px;align-items:center}
.ghost{height:30px;padding:0 10px;border:0;border-radius:6px;background:none;color:var(--ink2);font-size:12.5px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.ghost:hover{background:#f1f1ec;color:var(--ink)}
.ghost:disabled{opacity:.4;cursor:default;background:none}
.ghost.icon{width:30px;padding:0;justify-content:center}
.ghost.sm{height:26px;padding:0 8px;font-size:12px}
.ghost.err{color:#a1190f}
.ed-foot{display:flex;align-items:center;gap:12px;height:38px;padding:0 8px 0 14px;border-top:1px solid #26292e;background:#1b1d21;font-size:11.5px}
.ed-foot .muted{color:#9aa0a9}
.ed-foot .spacer{flex:1}
.ed-foot .check{color:#c7cbd1;font-size:11.5px}
.ed-foot .ghost{color:#c7cbd1;height:26px;font-size:11.5px}
.ed-foot .ghost:hover{background:#2a2d33;color:#fff}
.ed-foot .ghost.err{color:#ff9b8f}
.badge.soft{background:#3a3e45;color:#e2e4e8}
.gutter{background:#1b1d21;border-right:0;color:#5f656e}

.ed-bar{padding-left:6px;overflow:hidden}
.ed-bar .ed-actions{flex-shrink:0}
.ed-foot{flex-wrap:wrap;height:auto;min-height:38px;row-gap:4px;padding-top:4px;padding-bottom:4px}
.ed-collapsed{display:flex;align-items:center;gap:4px;min-height:48px;padding:6px 8px 6px 6px;background:var(--panel);border-bottom:1px solid var(--line);flex-wrap:nowrap;overflow:hidden}
.ed-toggle{display:flex;align-items:center;gap:8px;flex:1 1 auto;min-width:0;height:36px;border:0;background:none;cursor:pointer;color:var(--ink);padding:0 8px;border-radius:6px;text-align:left;overflow:hidden}
.ed-toggle svg{flex-shrink:0}
.ed-toggle .ed-label{flex-shrink:0}
.ed-toggle:hover{background:#f4f4f0}
.ed-sum{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1 1 auto}
.ed-collapsed .ed-actions{flex:0 0 auto;margin-left:0}
.ed-collapsed .ghost{padding:0 8px}
@media (max-width:480px){.ed-kind{display:none}.ed-collapsed .ghost .ghost-txt{display:none}}
.badge.soft-l{background:#ececE6;color:var(--ink2)}
.ed-errline{display:flex;align-items:center;gap:8px;padding:6px 8px 6px 14px;background:#fdecea;color:#8c1d13;font-size:12px;border-bottom:1px solid #f3c1bb}
.ed-errline span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.col-editor{flex:0 0 auto}

.eta{display:flex;justify-content:space-between;font-size:12px;color:var(--ink2);font-variant-numeric:tabular-nums}
.details{border:1px solid var(--line);border-radius:8px;padding:10px 12px;margin:10px 0;background:#fafaf8}
.details-h{font-size:12px;font-weight:650;margin-bottom:6px}
.drow{display:flex;justify-content:space-between;gap:10px;font-size:12px;padding:4px 0;border-top:1px dashed #ecece6}
.drow:first-of-type{border-top:0}
.dk{color:var(--mute)}
.dv{color:var(--ink);font-variant-numeric:tabular-nums;text-align:right}
.dwarn{color:#8a5300;font-weight:600}
.loop{border-radius:8px;padding:10px 12px;margin-bottom:10px;font-size:12px;line-height:1.45;display:flex;flex-direction:column;gap:3px;border:1px solid}
.loop-h{display:flex;justify-content:space-between;gap:8px}
.loop.ok{background:#ecf7ef;border-color:#bfe3c9;color:#1f4f2e}
.loop.near{background:#fff7e6;border-color:#f1d79c;color:#5c3d00}
.loop.bad{background:#fdecea;border-color:#f3c1bb;color:#7a1a10}

/* Dark theme */
.app.dark{--ink:#eceae5;--ink2:#c4c7cd;--mute:#9ba1ab;--line:#2c2f35;--line2:#3a3e45;--panel:#1c1e22;--bg:#141518;--acc:#f0682a;--acc2:#ff7d42;--accbg:#2e1f16;color-scheme:dark}
.app.dark .top select,.app.dark .field input:not([type=range]):not([type=color]):not([type=checkbox]):not([type=file]),.app.dark .field select,
.app.dark .secondary,.app.dark .icon-btn,.app.dark .seg,.app.dark .seg button,.app.dark .fmt,.app.dark .color-row input[type=color]{background:#24272c;color:var(--ink);border-color:var(--line2)}
.app.dark .seg button.on{background:var(--ink);color:#141518}
.app.dark .icon-btn.play{background:var(--ink);color:#141518;border-color:var(--ink)}
.app.dark .secondary:hover,.app.dark .icon-btn:hover,.app.dark .ghost:hover,.app.dark .ed-toggle:hover{background:#2c3036}
.app.dark .icon-btn.play:hover{background:#fff}
.app.dark .fmt.on{background:var(--accbg)}
.app.dark .logo{background:#2c3036}
.app.dark .stage-wrap{background:#101113}
.app.dark .chip,.app.dark .ed-kind,.app.dark .badge.soft-l{background:#2a2d33;border-color:var(--line2);color:var(--ink2)}
.app.dark .progress,.app.dark .details{background:#202227;border-color:var(--line)}
.app.dark .bar{background:#2c2f35}
.app.dark .drow{border-top-color:#2c2f35}
.app.dark .panel h3,.app.dark .console-h,.app.dark .console-b>div{border-color:#2a2d33}
.app.dark .suggest{background:var(--accbg);border-color:#5a3520;color:#ffd2b8}
.app.dark .hint.warn,.app.dark .dwarn,.app.dark .console-b .log-warn{color:#f2c06b}
.app.dark .hint.ok{color:#7fd39a}
.app.dark .console-b .log-error{color:#ff9b8f}
.app.dark .error,.app.dark .ed-errline,.app.dark .loop.bad{background:#3a1d1a;border-color:#6b2c25;color:#ffc4bb}
.app.dark .badge{background:#4a201b;color:#ffb3a8}
.app.dark .loop.ok{background:#16301f;border-color:#2f5a3c;color:#b9ecc8}
.app.dark .loop.near{background:#33280f;border-color:#6b5320;color:#f6dc9f}
.app.dark .thumb,.app.dark .result-media{border-color:var(--line)}
.app.dark .toast{background:#eceae5;color:#141518}
.app.dark .toast button{color:#c2410c}
.app.dark .field input:focus,.app.dark .field select:focus,.app.dark .top select:focus{outline-color:#8a3f1a}

/* ============ Neumorphic skin ============ */
.app{--neo:#e4e6ec;--hi:#ffffff;--lo:#b9bcc6;--ink:#1f2329;--ink2:#3b414b;--mute:#565d68;--line:transparent;--line2:transparent;--panel:var(--neo);--bg:var(--neo);
--raise:6px 6px 14px var(--lo),-6px -6px 14px var(--hi);--raise-sm:3px 3px 7px var(--lo),-3px -3px 7px var(--hi);--press:inset 3px 3px 7px var(--lo),inset -3px -3px 7px var(--hi);--press-lg:inset 5px 5px 12px var(--lo),inset -5px -5px 12px var(--hi);background:var(--neo)}
.app.dark{--neo:#23262c;--hi:#2f333b;--lo:#121418;--ink:#eceae5;--ink2:#c8cbd1;--mute:#a0a6b0;--panel:var(--neo);--bg:var(--neo)}
.app .top{background:var(--neo);border-bottom:0;box-shadow:0 6px 14px -8px var(--lo);padding:14px 22px}
.app .logo{background:var(--neo);box-shadow:var(--raise-sm);border-radius:10px;width:36px;height:36px}
.app .logo path{fill:var(--acc)}
.app .main{gap:22px;padding:22px}
.app .col{background:var(--neo);border:0!important;border-radius:22px;box-shadow:var(--raise);overflow:hidden}
.app .col-side{overflow:auto}
.app .col-preview{background:var(--neo)}
.app .ed-bar,.app .ed-collapsed,.app .side-tabs,.app .transport,.app .meta,.app .console,.app .console-h{background:var(--neo);border:0}
.app .ed-collapsed{padding:10px 12px;min-height:58px}
.app .ed-bar{height:54px;padding:0 12px}
/* editor well stays dark for code readability */
.app .editor{margin:0 14px;border-radius:14px;box-shadow:inset 4px 4px 10px #0e0f12,inset -2px -2px 6px #2a2d33;background:#1b1d21}
.app .gutter{background:transparent}
.app .ed-foot{margin:10px 14px 14px;border-radius:12px;border:0;background:var(--neo);box-shadow:var(--press)}
.app .ed-foot .muted,.app .ed-foot .check,.app .ed-foot .ghost{color:var(--ink2)}
.app .ed-foot .ghost:hover{background:transparent;color:var(--ink)}
.app .ed-foot .ghost.err{color:#b42318}
.app.dark .ed-foot .ghost.err{color:#ff9b8f}
.app .console{margin:0 14px 14px;border-radius:12px;box-shadow:var(--press)}
.app .console-b>div{border-bottom-color:rgba(127,127,127,.15)}
/* stage */
.app .stage-wrap{background:var(--neo);margin:16px;border-radius:18px;box-shadow:var(--press-lg)}
.app .stage{box-shadow:var(--raise-sm);border-radius:6px}
.app .transport{padding:6px 18px 10px;gap:12px}
.app .meta{padding:0 18px 18px}
.app .chip{background:var(--neo);border:0;box-shadow:var(--raise-sm);height:26px;padding:0 11px;color:var(--ink2)}
/* range sliders */
.app input[type=range]{-webkit-appearance:none;appearance:none;height:10px;border-radius:6px;background:var(--neo);box-shadow:var(--press);outline:0}
.app input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--acc);box-shadow:2px 2px 5px var(--lo),-2px -2px 5px var(--hi);cursor:pointer;border:3px solid var(--neo)}
.app input[type=range]::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:var(--acc);border:3px solid var(--neo);box-shadow:2px 2px 5px var(--lo),-2px -2px 5px var(--hi)}
.app input[type=range]:disabled::-webkit-slider-thumb{background:var(--mute)}
/* buttons: raised, pressed when active */
.app .icon-btn,.app .secondary,.app .ghost{background:var(--neo);border:0;box-shadow:var(--raise-sm);color:var(--ink);border-radius:10px;transition:box-shadow .15s,color .15s}
.app .ghost.icon{width:34px;height:34px}
.app .ghost{height:34px}
.app .ghost.sm,.app .secondary.sm{height:28px}
.app .icon-btn:hover,.app .secondary:hover,.app .ghost:hover{background:var(--neo);color:var(--acc)}
.app .icon-btn:active,.app .secondary:active,.app .ghost:active{box-shadow:var(--press)}
.app .ghost:disabled,.app .secondary:disabled{box-shadow:none;opacity:.45}
.app .icon-btn{width:38px;height:38px;border-radius:12px}
.app .icon-btn.play{background:var(--acc);color:#fff;box-shadow:var(--raise-sm)}
.app .icon-btn.play:hover{background:var(--acc2);color:#fff}
.app .ed-toggle{border-radius:10px}
.app .ed-toggle:hover{background:transparent;box-shadow:var(--press)}
/* tabs as pill switch */
.app .side-tabs{margin:14px;height:46px;border-radius:14px;box-shadow:var(--press);padding:5px;gap:5px;position:sticky;top:14px}
.app .side-tabs button{border:0;border-radius:10px;color:var(--mute)}
.app .side-tabs button.on{background:var(--neo);box-shadow:var(--raise-sm);color:var(--acc)}
.app .ed-tabs{gap:4px;padding:6px 0}
.app .ed-tabs button{border:0;border-radius:9px}
.app .ed-tabs button.on{box-shadow:var(--raise-sm);color:var(--acc)}
/* segmented controls */
.app .seg{background:var(--neo);border:0;box-shadow:var(--press);border-radius:12px;padding:4px;gap:4px;overflow:visible}
.app .seg button{background:transparent;border:0!important;border-radius:9px;color:var(--ink2);padding:8px 6px}
.app .seg button.on{background:var(--neo);color:var(--acc);box-shadow:var(--raise-sm);font-weight:650}
/* inputs: inset wells */
.app .field input:not([type=range]):not([type=color]):not([type=checkbox]):not([type=file]),.app .field select,.app .top select{background:var(--neo);border:0;box-shadow:var(--press);border-radius:11px;height:38px;color:var(--ink)}
.app .field input:focus,.app .field select:focus,.app .top select:focus{outline:2px solid var(--acc);outline-offset:1px}
.app .color-row input[type=color]{background:var(--neo);border:0;box-shadow:var(--raise-sm);border-radius:10px;height:38px;width:42px}
.app .check input{accent-color:var(--acc)}
/* panels */
.app .panel{padding:4px 18px 26px}
.app .panel h3{border-top:0;padding:20px 0 12px;font-size:13px;letter-spacing:0}
.app .formats{gap:12px}
.app .fmt{background:var(--neo);border:0;box-shadow:var(--raise-sm);border-radius:14px;padding:12px}
.app .fmt.on{box-shadow:var(--press);background:var(--neo)}
.app .fmt.on b{color:var(--acc)}
.app .primary{height:48px;border-radius:14px;box-shadow:var(--raise-sm);font-size:14.5px}
.app .primary:active{box-shadow:inset 3px 3px 7px rgba(0,0,0,.25)}
.app .primary:disabled{box-shadow:none}
.app .progress,.app .details{background:var(--neo);border:0;border-radius:14px;box-shadow:var(--press)}
.app .bar{background:var(--neo);box-shadow:var(--press);height:10px;border-radius:6px}
.app .bar div{border-radius:6px}
.app .drow{border-top-color:rgba(127,127,127,.18)}
.app .suggest{border:0;border-radius:12px;box-shadow:var(--raise-sm)}
.app .loop,.app .error{border:0;border-radius:12px;box-shadow:var(--raise-sm)}
.app .result-media,.app .thumb{border:0;border-radius:14px;box-shadow:var(--raise-sm)}
.app .badge.soft-l{background:var(--neo);box-shadow:var(--press)}
.app .ed-kind{background:var(--neo);border:0;box-shadow:var(--press)}
.app .toast{border-radius:14px}
@media (max-width:760px){.app .main{gap:16px;padding:14px}.app .col{border-radius:18px}.app .top{padding:12px 14px}.app .stage-wrap{margin:12px}}

/* Responsive */
@media (max-width:1150px){.main{grid-template-columns:1fr 1fr}.col-side{grid-column:1/-1;border-top:1px solid var(--line)}}
@media (max-width:760px){
.top{padding:10px 14px}
.top .sub{display:none}
.top-actions{width:100%}
.top-actions select{flex:1;max-width:none}
.main{grid-template-columns:1fr}
.col{border-right:0;border-bottom:1px solid var(--line)}
.col-preview{order:1}.col-editor{order:2}.col-side{order:3}
.stage-wrap{min-height:230px;padding:10px}
.editor{min-height:220px;height:45vh;flex:none}
.panel{padding:4px 16px 28px}
}
`;
