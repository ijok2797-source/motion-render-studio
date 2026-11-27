// 90s desktop look (Windows 95 style): teal desktop, gray beveled panels, navy title bar, square controls.
const UP = 'inset -1px -1px #0a0a0a,inset 1px 1px #ffffff,inset -2px -2px #808080,inset 2px 2px #dfdfdf';
const DOWN = 'inset -1px -1px #ffffff,inset 1px 1px #0a0a0a,inset -2px -2px #dfdfdf,inset 2px 2px #808080';
const FIELD = 'inset -1px -1px #ffffff,inset 1px 1px #808080,inset -2px -2px #dfdfdf,inset 2px 2px #0a0a0a';
const FONT = '"MS Sans Serif","Microsoft Sans Serif",Tahoma,Verdana,Geneva,sans-serif';

export const RETRO = `
.app,.app.dark{background:#008080 !important;color:#000 !important;font-family:${FONT} !important;font-size:13px}
.app *{border-radius:0 !important;text-shadow:none !important}
.app .main{background:transparent !important}

/* Header = window title bar */
.app header.top{background:linear-gradient(90deg,#000080,#1084d0) !important;color:#fff !important;border:0 !important;box-shadow:${UP} !important;padding:4px 6px !important;margin:6px 6px 0 !important;backdrop-filter:none !important}
.app header.top .brand-text .sub{color:#e8e8ff !important;font-family:${FONT} !important;font-size:11px !important;letter-spacing:0 !important;opacity:1 !important}
.app .mrv-title{color:#fff !important;font-family:${FONT} !important;font-weight:700 !important;letter-spacing:1px !important;-webkit-text-fill-color:#fff}
.app .mrv-title .mrv-m{background:linear-gradient(135deg,#ffb547 0%,#ff6a2b 50%,#e11d74 100%) !important;-webkit-background-clip:text !important;background-clip:text !important;color:transparent !important;-webkit-text-fill-color:transparent !important;font-weight:900 !important;font-size:1em !important;letter-spacing:1px}
.app .mrv-title{font-weight:900 !important;font-size:22px !important;line-height:1 !important}

/* Render button: colored, readable */
.app button.render-btn{background:linear-gradient(135deg,#ff8a1f,#e11d74) !important;color:#fff !important;font-weight:700 !important;outline:1px solid #000 !important}
.app button.render-btn span,.app button.render-btn svg{color:#fff !important;-webkit-text-fill-color:#fff}
.app button.render-btn:disabled{background:#808080 !important;color:#fff !important}
.app button.render-btn .render-badge{background:#000080 !important;color:#fff !important;padding:1px 6px}
.app button.render-btn .render-fill{background:rgba(255,255,0,.35) !important}
.app .logo3d{background:#c0c0c0 !important;box-shadow:${UP} !important;padding:2px !important;transform:none !important}

/* Panels = windows */
.app .col,.app .panel,.app .preview{background:#c0c0c0 !important;color:#000 !important;border:0 !important;box-shadow:${UP} !important;backdrop-filter:none !important}
.app h2,.app h3,.app h4,.app label,.app small,.app p{color:inherit}
/* keep code colors */
.app .code-hl{color:#d6deeb !important}
.app .code-hl .tk-k{color:#c792ea !important}.app .code-hl .tk-s{color:#c3e88d !important}.app .code-hl .tk-n{color:#f78c6c !important}
.app .code-hl .tk-l{color:#ff5370 !important}.app .code-hl .tk-c{color:#8a93b8 !important}.app .code-hl .tk-f{color:#82aaff !important}
.app .code-hl .tk-b,.app .code-hl .tk-t{color:#ffcb6b !important}.app .code-hl .tk-a{color:#f78c6c !important}
.app .code-hl .tk-o,.app .code-hl .tk-p{color:#89ddff !important}.app .code-hl .tk-r{color:#f07178 !important}
.app .editor,.app .editor .code-wrap{background:#1b1f2b !important}
.app .editor .gutter{background:#171a24 !important;color:#7a8296 !important}
.app .muted{color:#404040 !important}
.app header.top .muted,.app header.top span{color:#fff}

/* Buttons */
.app button:not(.tl *){background:#c0c0c0 !important;color:#000 !important;border:0 !important;box-shadow:${UP} !important;font-family:${FONT} !important;font-size:12px !important;font-weight:400 !important;transform:none !important;transition:none !important;min-height:26px;padding:3px 10px}
.app button:not(.tl *):active:not(:disabled),.app button.on,.app button[aria-selected="true"],.app button[aria-pressed="true"]{box-shadow:${DOWN} !important;background:#c0c0c0 !important}
.app button:focus-visible{outline:1px dotted #000 !important;outline-offset:-4px}
.app button:disabled{color:#808080 !important;-webkit-text-fill-color:#808080;text-shadow:1px 1px 0 #fff !important}
.app button svg{color:#000}
.app button.render{background:#c0c0c0 !important;color:#000 !important;font-weight:700 !important;outline:1px solid #000 !important}
.app header.top button{min-height:24px}

/* Tabs */
.app [role="tablist"]{background:transparent !important;box-shadow:none !important;border-bottom:0 !important;gap:0 !important}
.app [role="tab"]{box-shadow:inset 1px 1px #fff,inset -1px 0 #0a0a0a,inset -2px 0 #808080 !important;margin-right:-1px}
.app [role="tab"][aria-selected="true"]{box-shadow:inset 1px 1px #fff,inset -1px 0 #0a0a0a,inset -2px 0 #808080 !important;font-weight:700 !important;position:relative;top:1px;padding-bottom:5px}

/* Fields */
.app input:not([type=checkbox]):not([type=radio]):not([type=range]),.app select,.app textarea:not(.code-ta){background:#fff !important;color:#000 !important;border:0 !important;box-shadow:${FIELD} !important;font-family:${FONT} !important;font-size:12px !important}
.app input[type=checkbox],.app input[type=radio]{accent-color:#000080}
.app input[type=range]{accent-color:#000080}

/* Editor: classic text window */
.app .editor{box-shadow:${FIELD} !important;border:0 !important}
.app .ed-bar,.app .ed-foot,.app .ed-collapsed{background:#c0c0c0 !important;color:#000 !important;border:0 !important}
.app .console{background:#000 !important;color:#c0c0c0 !important;box-shadow:${FIELD} !important;font-family:"Courier New",monospace !important}
.app .console-h{background:#000080 !important;color:#fff !important}
.app .badge{background:#000080 !important;color:#fff !important}

/* Progress bars: blocky */
.app progress,.app .progress,.app .bar{background:#fff !important;box-shadow:${FIELD} !important;border:0 !important}
.app .progress > *,.app .bar > *{background:repeating-linear-gradient(90deg,#ff6a2b 0 10px,#e11d74 10px 12px) !important}
.app .bar{height:18px !important}
.app .job-st,.app .eta{color:#000080 !important;font-weight:700}
.app .error{color:#a00000 !important}
.app button.primary{background:#000080 !important;color:#fff !important}
.app button.primary span,.app button.primary svg{color:#fff !important}

/* Fix report / toasts as dialog boxes */
.app .fix-report,.app .toast{background:#c0c0c0 !important;color:#000 !important;border:0 !important;box-shadow:${UP} !important}
.app .fix-report.bad b{color:#800000}
.app .fix-report.ok b{color:#000080}

/* Pixel icons */
.app .px-icon{image-rendering:pixelated;flex:0 0 auto;vertical-align:middle}
.app button .px-icon{margin-right:2px}

/* 90s dialog windows */
.w95-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(0,0,0,.25);font-family:${FONT}}
.w95-win{width:min(420px,100%);background:#c0c0c0;color:#000;box-shadow:${UP},4px 4px 0 rgba(0,0,0,.45);padding:3px;animation:w95-pop .18s steps(4)}
@keyframes w95-pop{from{transform:scale(.6);opacity:.2}to{transform:none;opacity:1}}
.w95-title{display:flex;align-items:center;gap:6px;height:22px;padding:0 3px 0 5px;background:linear-gradient(90deg,#000080,#1084d0);color:#fff;font-weight:700;font-size:12px}
.w95-title span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.w95-overlay button{font-family:${FONT};font-size:12px;color:#000;background:#c0c0c0;border:0;border-radius:0;box-shadow:${UP};min-height:26px;padding:3px 12px;display:inline-flex;align-items:center;gap:5px;cursor:pointer}
.w95-overlay button:active{box-shadow:${DOWN}}
.w95-overlay .w95-x{min-height:16px;height:16px;width:18px;padding:0;justify-content:center;font-weight:700;font-size:11px;line-height:1}
.w95-body{padding:12px 10px 8px;font-size:12.5px}
.w95-anim{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
.w95-reel .px-icon{image-rendering:pixelated}
.w95-reel:first-child{animation:w95-bob 0.8s steps(2) infinite}
@keyframes w95-bob{50%{transform:translateY(-3px)}}
.w95-dots{flex:1;display:flex;justify-content:center;gap:6px}
.w95-dots i{width:8px;height:8px;background:#ff6a2b;box-shadow:1px 1px 0 #000;animation:w95-dot 1.2s steps(1) infinite}
.w95-dots i:nth-child(2){animation-delay:.2s;background:#ff4f52}.w95-dots i:nth-child(3){animation-delay:.4s;background:#f73a66}
.w95-dots i:nth-child(4){animation-delay:.6s;background:#ec2a6f}.w95-dots i:nth-child(5){animation-delay:.8s;background:#e11d74}
@keyframes w95-dot{0%{opacity:.15}20%{opacity:1}60%{opacity:1}80%{opacity:.15}}
.w95-file{margin-bottom:2px;word-break:break-all}
.w95-info{color:#303030;font-size:12px}
.w95-bar{height:20px;margin:10px 0 6px;background:#fff;box-shadow:${FIELD};padding:3px}
.w95-bar div{height:100%;background:repeating-linear-gradient(90deg,#ff6a2b 0 9px,#e11d74 9px 10px,transparent 10px 12px);transition:width .3s steps(3)}
.w95-row{display:flex;justify-content:space-between;gap:8px;font-size:12px;flex-wrap:wrap}
.muted-w{color:#303030}
.w95-hint{margin:8px 0 0;font-size:11.5px;color:#303030}
.w95-btns{display:flex;justify-content:flex-end;gap:6px;margin-top:12px;flex-wrap:wrap}
.w95-overlay .w95-def{outline:1px solid #000;outline-offset:0;font-weight:700}
.w95-msg{display:flex;gap:12px;align-items:flex-start;word-break:break-all}
.w95-video{display:block;width:100%;max-height:44vh;margin-top:10px;background:#000;box-shadow:${FIELD}}
.w95-err{margin:8px 0 0;color:#a00000}

/* Code editor window */
.ed-overlay{align-items:stretch;padding:10px}
.app .ed-win{width:min(980px,100%);height:100%;max-height:calc(100dvh - 20px);display:flex;flex-direction:column;animation:w95-pop .18s steps(4)}
.ed-menu{display:flex;gap:14px;padding:3px 8px;font-size:12px;border-bottom:1px solid #808080;box-shadow:0 1px 0 #fff}
.ed-menu u{text-decoration:underline}
.ed-menu-r{margin-left:auto;color:#303030}
.ed-win-body{flex:1;min-height:0;display:flex;flex-direction:column;padding:6px 4px 0;overflow:hidden}
.app .ed-win-body .editor{flex:1 1 auto;min-height:260px;height:auto;display:flex !important;background:#0c0c0c !important;box-shadow:inset -1px -1px #fff,inset 1px 1px #808080,inset -2px -2px #dfdfdf,inset 2px 2px #0a0a0a !important;overflow:hidden}
.app .ed-win-body .editor .gutter{background:#0c0c0c !important;color:#5f8f5f !important;flex:0 0 auto;min-width:36px;text-align:right;padding-right:6px;overflow:hidden}
.app .ed-win-body .code-wrap{background:#0c0c0c !important;flex:1;min-height:100%}
.app .ed-win-body .code-ta{position:absolute !important;inset:0;width:100% !important;height:100% !important;caret-color:#33ff66 !important}
.app .ed-win-body .code-ta::placeholder{color:#3f7f3f;-webkit-text-fill-color:#3f7f3f}
.app .ed-win-body .code-hl{color:#c8ffc8 !important}
.app .ed-win-body .ed-bar,.app .ed-win-body .ed-foot{flex:0 0 auto}
.app .ed-win-body .console{flex:0 0 auto;max-height:22vh;overflow:auto}
.ed-win-btns{margin:6px 4px 4px !important}
/* Editor window layout: toolbar wraps, code area fills, footer never clipped */
.app .ed-win-body .ed-bar{display:flex !important;flex-wrap:wrap;gap:4px;align-items:center;padding:2px 0 6px !important;height:auto !important;overflow:visible !important}
.app .ed-win-body .ed-bar .ed-actions{display:flex;flex-wrap:wrap;gap:4px;margin-left:auto}
.app .ed-win-body .ed-bar button{min-height:30px;padding:2px 8px}
.app .ed-win-body .ed-bar .ghost-txt{display:inline !important}
.app .ed-win-body .editor{min-height:0 !important;flex:1 1 0 !important}
.app .ed-win-body .editor .gutter{padding-bottom:30px !important}
.app .ed-win-body .ed-foot{flex:0 0 auto;padding:6px 2px 2px !important;overflow:visible !important}
.app .ed-win-body .ed-foot button{min-height:28px}
.app .ed-win-body .editor ::-webkit-scrollbar{width:10px;height:10px;background:#0c0c0c}
.app .ed-win-body .editor ::-webkit-scrollbar-thumb{background:#3a3f4b;box-shadow:none}
.app .ed-win-body .editor ::-webkit-scrollbar-corner{background:#0c0c0c}
.app .ed-win-body .code-ta{scrollbar-color:#3a3f4b #0c0c0c;scrollbar-width:thin}

/* Preview: always visible, as its own window */
.app .main{display:grid !important;align-items:start}
@media (max-width: 1150px){.app .main{grid-template-columns:1fr !important}}
.app .col{overflow:visible !important;min-height:0 !important;height:auto !important;position:relative !important}
.app .col-preview{order:1 !important;display:flex !important;flex-direction:column;padding:3px !important;z-index:1}
.app .col-editor{order:2 !important;z-index:2}
.app .col-side{order:3 !important}
@media (min-width: 1151px){.app .col-editor{order:1 !important}.app .col-preview{order:2 !important}}
.app .col-preview::before{content:'Pratinjau';display:block;height:20px;line-height:20px;padding:0 6px;background:linear-gradient(90deg,#000080,#1084d0);color:#fff;font-weight:700;font-size:12px}
.app .col-preview .preview{display:flex !important;flex-direction:column;height:auto !important;min-height:0 !important;flex:0 0 auto;background:#c0c0c0 !important;box-shadow:none !important}
.app .col-preview .pv-head{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:4px 6px !important;background:#c0c0c0 !important}
.app .col-preview .pv-tc{font-family:"Courier New",monospace !important;font-size:16px !important;font-weight:700;background:#000;color:#33ff66 !important;padding:1px 6px;box-shadow:${FIELD}}
.app .col-preview .pv-info{display:flex;gap:8px;flex-wrap:wrap;font-size:11.5px;color:#000}
.app .col-preview .stage-wrap{position:relative !important;display:flex !important;align-items:center;justify-content:center;height:min(56vw,460px) !important;min-height:200px !important;flex:0 0 auto !important;margin:0 6px !important;padding:8px !important;background:#000 !important;box-shadow:${FIELD} !important;border-radius:0 !important;overflow:hidden !important}
.app .col-preview .stage{border-radius:0 !important;box-shadow:0 0 0 1px #404040 !important}
.app .col-preview .fs-btn{position:absolute;top:6px;right:6px;z-index:5;min-height:24px;padding:2px 5px}
.pv-guides{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none}
.pv-checker{background-color:#fff !important;background-image:linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%) !important;background-size:16px 16px !important;background-position:0 0,0 8px,8px -8px,-8px 0 !important}
.app .pv-tools{display:flex;flex-wrap:wrap;gap:4px;padding:6px 6px 2px;align-items:center}
.app .pv-tools button{min-height:26px;padding:2px 8px;display:inline-flex;align-items:center;gap:4px}
.app .pv-tools button.on{box-shadow:${DOWN} !important;background:#d8d8d8 !important;font-weight:700 !important}
.app .pv-speed{display:inline-flex;align-items:center;gap:4px;font-size:12px}
.app .pv-speed select{min-height:24px;padding:1px 4px}
.app .col-preview .transport{display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding:4px 6px 6px !important;background:#c0c0c0 !important}
.app .col-preview .transport .icon-btn{min-height:28px;min-width:32px;display:inline-flex;align-items:center;justify-content:center}
.app .col-preview .transport .play{background:linear-gradient(135deg,#ff8a1f,#e11d74) !important;color:#fff !important}
.app .col-preview .transport .play svg{color:#fff}
.app .ed-win-body .ed-foot,.app .ed-win-body .ed-foot label,.app .ed-win-body .ed-foot span,.app .ed-foot .check{color:#000 !important;-webkit-text-fill-color:#000;opacity:1 !important}
.app .ed-win-body .ed-foot{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:6px 2px !important}

/* Scrollbars */
.app ::-webkit-scrollbar{width:16px;height:16px;background:#dfdfdf}
.app ::-webkit-scrollbar-thumb{background:#c0c0c0;box-shadow:${UP}}
.app ::-webkit-scrollbar-corner{background:#c0c0c0}
`;
