import type { Code, Settings } from './types';

export interface Template {
    id: string;
    name: string;
    code: Code;
    settings?: Partial<Settings>;
}

export const TEMPLATES: Template[] = [
    {
        id: 'kinetic',
        name: 'Judul kinetik (CSS)',
        code: {
            html: `<div class="wrap">
  <h1><span>Motion</span><span>to</span><span>Video</span></h1>
  <p>Render langsung dari kode</p>
</div>`,
            css: `body {
  background: #101820;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  color: #fff;
}
h1 { font-size: 13vh; margin: 0; display: flex; gap: 3vh; }
h1 span {
  display: inline-block;
  opacity: 0;
  transform: translateY(8vh);
  animation: up .8s cubic-bezier(.2,.8,.2,1) forwards;
}
h1 span:nth-child(2) { animation-delay: .25s; color: #f2aa4c; }
h1 span:nth-child(3) { animation-delay: .5s; }
p {
  text-align: center;
  font-size: 3.6vh;
  opacity: 0;
  animation: fade 1s 1.2s forwards;
}
@keyframes up { to { opacity: 1; transform: none; } }
@keyframes fade { to { opacity: .8; } }`,
            js: '',
        },
    },
    {
        id: 'particles',
        name: 'Partikel orbit (Canvas)',
        code: {
            html: `<canvas id="c"></canvas>`,
            css: `canvas { display: block; width: 100%; height: 100%; }`,
            js: `const c = document.getElementById('c');
const x = c.getContext('2d');
c.width = innerWidth;
c.height = innerHeight;

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const P = Array.from({ length: 160 }, () => ({
  a: rnd() * Math.PI * 2,
  r: rnd() * 0.45 + 0.05,
  sp: rnd() * 0.6 + 0.2,
  z: rnd() * 3 + 1,
}));

function draw(t) {
  const w = c.width, h = c.height, m = Math.min(w, h);
  x.fillStyle = '#0b0f1a';
  x.fillRect(0, 0, w, h);
  for (const p of P) {
    const a = p.a + (t / 1000) * p.sp;
    const px = w / 2 + Math.cos(a) * p.r * m;
    const py = h / 2 + Math.sin(a * 1.3) * p.r * m * 0.6;
    x.beginPath();
    x.arc(px, py, (p.z * m) / 400, 0, Math.PI * 2);
    x.fillStyle = 'hsl(' + ((a * 40) % 360) + ', 80%, 65%)';
    x.fill();
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);`,
        },
    },
    {
        id: 'lower',
        name: 'Lower third transparan',
        settings: { bgMode: 'transparent' },
        code: {
            html: `<div class="lt">
  <div class="bar"></div>
  <div class="txt">
    <div class="in">
      <b>Kaiji Iji</b>
      <span>Motion Designer</span>
    </div>
  </div>
</div>`,
            css: `body { font-family: system-ui, sans-serif; }
.lt { position: absolute; left: 6vw; bottom: 12vh; display: flex; gap: 1.2vw; }
.bar {
  width: .9vh; background: #e63946;
  transform: scaleY(0); transform-origin: bottom;
  animation: grow .5s .2s forwards;
}
.txt {
  background: #fff; overflow: hidden; max-width: 0;
  animation: wipe .8s .5s cubic-bezier(.7,0,.2,1) forwards;
}
.in { padding: 1.6vh 2.4vw; white-space: nowrap; }
b { display: block; font-size: 5vh; color: #111; }
span { font-size: 2.8vh; color: #444; }
@keyframes grow { to { transform: scaleY(1); } }
@keyframes wipe { to { max-width: 60vw; } }`,
            js: '',
        },
    },
    {
        id: 'counter',
        name: 'Counter angka (JS)',
        code: {
            html: `<div class="box">
  <div id="n">0</div>
  <div class="lbl">pengguna aktif bulan ini</div>
</div>`,
            css: `body {
  background: #f4f1ea; display: grid; place-items: center;
  font-family: system-ui, sans-serif; color: #1d1b18;
}
.box { text-align: center; }
#n { font-size: 18vh; font-weight: 800; font-variant-numeric: tabular-nums; }
.lbl { font-size: 4vh; color: #5f5a52; }`,
            js: `const el = document.getElementById('n');
const target = 128450, dur = 2500;
function tick(t) {
  const p = Math.min(1, t / dur);
  const e = 1 - Math.pow(1 - p, 3);
  el.textContent = Math.round(target * e).toLocaleString('id-ID');
  if (p < 1) requestAnimationFrame(tick);
}
requestAnimationFrame(tick);`,
        },
    },
];
