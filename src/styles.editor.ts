// Code editor colors (syntax highlight overlay) and the fix report.
export const EDITOR = `
.editor{position:relative;background:#1b1f2b !important;border-color:#2a3040 !important}
.editor .gutter{background:#171a24 !important;color:#5c6478 !important;border-color:#2a3040 !important;font:12.5px/20px ui-monospace,Menlo,Consolas,monospace !important;padding-top:14px !important}
.editor .gutter div{height:20px;line-height:20px}
.code-wrap{position:relative;flex:1;min-width:0;display:flex}
.code-hl,.app .editor .code-ta{margin:0 !important;border:0 !important;border-radius:0 !important;box-shadow:none !important;font:12.5px/20px ui-monospace,Menlo,Consolas,monospace !important;padding:14px !important;white-space:pre !important;tab-size:2;letter-spacing:0 !important;word-spacing:0;box-sizing:border-box;overflow-wrap:normal !important}
.code-hl{position:absolute;inset:0;overflow:hidden;pointer-events:none;color:#d6deeb;background:transparent}
.app .editor .code-ta{position:relative;flex:1;width:100%;height:100%;resize:none;outline:0;background:transparent !important;color:transparent !important;-webkit-text-fill-color:transparent;caret-color:#ffcc66;overflow:auto;z-index:1}
.code-ta::selection{background:rgba(130,170,255,.35);-webkit-text-fill-color:transparent}
.code-ta::placeholder{color:#6b7380;-webkit-text-fill-color:#6b7380}
.tk-k{color:#c792ea;font-weight:600}
.tk-s{color:#c3e88d}
.tk-n{color:#f78c6c}
.tk-l{color:#ff5370}
.tk-c{color:#697098;font-style:italic}
.tk-f{color:#82aaff}
.tk-b{color:#ffcb6b}
.tk-t{color:#ffcb6b}
.tk-a{color:#f78c6c}
.tk-o{color:#89ddff}
.tk-p{color:#89ddff}
.tk-r{color:#f07178}
.fix-btn{color:#e8a23a}
.fix-report{margin:8px 12px 0;border-radius:10px;padding:10px 12px;font-size:12.5px;line-height:1.5;border:1px solid}
.fix-report.ok{background:#ecf7ef;border-color:#bfe3c9;color:#1f4f2e}
.fix-report.bad{background:#fdecea;border-color:#f3c1bb;color:#7a1a10}
.app.dark .fix-report.ok{background:#16301f;border-color:#2f5a3c;color:#b9ecc8}
.app.dark .fix-report.bad{background:#3a1d1a;border-color:#6b2c25;color:#ffc4bb}
.fix-h{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px}
.fix-report ul{margin:4px 0 0;padding-left:18px}
.fix-report p{margin:4px 0 0}
`;
