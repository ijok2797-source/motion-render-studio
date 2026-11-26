// 16x16 pixel-art icons, drawn on a grid with crisp edges (90s style).
// Each icon: palette + rows; '.' = transparent.
type Px = { pal: Record<string, string>; rows: string[] };

const ICONS: Record<string, Px> = {
    paste: { pal: { k: '#000', y: '#ffd23f', w: '#fff', g: '#808080', b: '#7a4a12' }, rows: [
        '.....kkkkkk.....', '....kgwwwwgk....', '.kkkkkkkkkkkkkk.', '.kbbbbbbbbbbbbk.', '.kbkkkkkkkkkkbk.', '.kbkwwwwwwwwkbk.',
        '.kbkwkkkkkkwkbk.', '.kbkwwwwwwwwkbk.', '.kbkwkkkkkwwkbk.', '.kbkwwwwwwwwkbk.', '.kbkwkkkkkkwkbk.', '.kbkwwwwwwwwkbk.',
        '.kbkkkkkkkkkkbk.', '.kbbbbbbbbbbbbk.', '.kkkkkkkkkkkkkk.', '................'] },
    fix: { pal: { k: '#000', s: '#c0c0c0', d: '#606060', r: '#d42020', o: '#ff8a1f' }, rows: [
        '..........kkk...', '.........ksssk..', '........kss.ssk.', '........ks..dk..', '........kss.k...', '.......kssddk....'.slice(0, 16), '......kssdk.....',
        '.....kssdk......', '....kooook......', '...kooook.......', '..kroook........', '.krrook.........', 'krrrok..........', 'krrk............', '.kk.............', '................'] },
    format: { pal: { k: '#000', b: '#000080' }, rows: [
        '................', 'kkkkkkkkkkkkkk..', '................', '...bbbbbbbbbbb..', '................', '...bbbbbbbbbbb..', '................',
        'kkkkkkkkkkkkkk..', '................', '...bbbbbbbbbbb..', '................', '...bbbbbbbbb....', '................', 'kkkkkkkkkkkkkk..', '................', '................'] },
    open: { pal: { k: '#000', y: '#ffd23f', d: '#c89b1a' }, rows: [
        '................', '................', '.kkkk...........', 'kyyyyk..........', 'kyyyyykkkkkkkk..', 'kyyyyyyyyyyyyk..', 'kyyykkkkkkkkkkkk',
        'kyyk dddddddddk'.replace(' ', 'd').padEnd(16, '.'), 'kyykddddddddddk.', 'kykddddddddddk..', 'kykdddddddddk...', 'kkddddddddddk...', 'kkkkkkkkkkkk....', '................', '................', '................'] },
    template: { pal: { k: '#000', w: '#fff', b: '#1084d0', o: '#ff8a1f', p: '#e11d74' }, rows: [
        '................', '.kkkkkkkkkkkkkk.', '.kwwwwwwwwwwwwk.', '.kwbbbbwwoooowk.', '.kwbbbbwwoooowk.', '.kwbbbbwwoooowk.', '.kwwwwwwwwwwwwk.',
        '.kwppppwwbbbbwk.', '.kwppppwwbbbbwk.', '.kwppppwwbbbbwk.', '.kwwwwwwwwwwwwk.', '.kkkkkkkkkkkkkk.', '................', '................', '................', '................'] },
    render: { pal: { k: '#000', w: '#fff', y: '#ffe14a' }, rows: [
        '................', '..kk............', '..kwk...........', '..kwwk..........', '..kwwwk.........', '..kwwwwk........', '..kwwwwwk.......',
        '..kwwwwwwk......', '..kwwwwwk.......', '..kwwwwk........', '..kwwwk.........', '..kwwk..........', '..kwk...........', '..kk............', '................', '................'] },
    film: { pal: { k: '#000', g: '#404040', w: '#fff', o: '#ff8a1f', p: '#e11d74' }, rows: [
        'kkkkkkkkkkkkkkkk', 'kwkwkwkwkwkwkwkk', 'kkkkkkkkkkkkkkkk', 'kooooooopppppppk', 'kooooooopppppppk', 'kooowwoopppppppk', 'koooowwwopppppk'.padEnd(16, 'k'),
        'kooowwoopppppppk', 'kooooooopppppppk', 'kooooooopppppppk', 'kkkkkkkkkkkkkkkk', 'kwkwkwkwkwkwkwkk', 'kkkkkkkkkkkkkkkk', '................', '................', '................'] },
    ok: { pal: { k: '#000', g: '#00a000', w: '#fff' }, rows: [
        '.....kkkkkk.....', '...kkggggggkk...', '..kggggggggggk..', '.kgggggggggwwgk.', '.kggggggggwwwgk.', 'kggggggggwwwggk', 'kgwwggggwwwgggk', 'kgwwwggwwwggggk',
        'kggwwwwwwgggggk', 'kgggwwwwggggggk', '.kgggwwgggggggk.', '.kggggggggggggk.', '..kggggggggggk..', '...kkggggggkk...', '.....kkkkkk.....', '................'].map((r) => r.padEnd(16, '.')) },
    warn: { pal: { k: '#000', y: '#ffd23f' }, rows: [
        '.......kk.......', '......kyyk......', '......kyyk......', '.....kyyyyk.....', '.....kykkyk.....', '....kyykkyyk....', '....kyykkyyk....', '...kyyykkyyyk...',
        '...kyyykkyyyk...', '..kyyyyyyyyyyk..', '..kyyyykkyyyyk..', '.kyyyyykkyyyyyk.', '.kyyyyyyyyyyyyk.', 'kkkkkkkkkkkkkkkk', '................', '................'] },
    save: { pal: { k: '#000', b: '#000080', w: '#fff', g: '#c0c0c0' }, rows: [
        'kkkkkkkkkkkkkkk.', 'kbbwwwwwwwwwbbk.', 'kbbwwwwwwwwwbbk.', 'kbbwwwwwwwwwbbk.', 'kbbwwwwwwwwwbbk.', 'kbbbbbbbbbbbbbk.', 'kbbbbbbbbbbbbbk.', 'kbbgggggggggbbk.',
        'kbbgkkggggggbbk.', 'kbbgkkggggggbbk.', 'kbbgkkggggggbbk.', 'kbbgggggggggbbk.', 'kkkkkkkkkkkkkkk.', '................', '................', '................'] },
    play: { pal: { k: '#000', g: '#00a000' }, rows: [
        '................', '...kk...........', '...kgk..........', '...kggk.........', '...kgggk........', '...kggggk.......', '...kgggggk......', '...kggggggk.....',
        '...kgggggk......', '...kggggk.......', '...kgggk........', '...kggk.........', '...kgk..........', '...kk...........', '................', '................'] },
    share: { pal: { k: '#000', b: '#1084d0' }, rows: [
        '................', '...........kkk..', '..........kbbbk.', '..........kbbbk.', '.......kkk.kkk..', '.....kk.........', '.kkkk...........', 'kbbbbk..........',
        'kbbbbk..........', '.kkkk...........', '.....kk.........', '.......kkk.kkk..', '..........kbbbk.', '..........kbbbk.', '...........kkk..', '................'] },
};

ICONS.reload = { pal: { k: '#000', g: '#00a000' }, rows: [
    '................', '.....kkkkk..k...', '...kkgggggkkgk..', '..kggk...kggggk.', '.kgk......kgggk.', '.kgk.....kggggk.', 'kgk......kkkkk..', 'kgk.............',
    'kgk.............', 'kgk......kgk....', '.kgk.....kgk....', '.kgk....kgk.....', '..kggk.kggk.....', '...kkgggkk......', '.....kkk........', '................'] };
ICONS.trash = { pal: { k: '#000', g: '#c0c0c0', d: '#808080', w: '#fff' }, rows: [
    '.....kkkkkk.....', '.....k....k.....', '.kkkkkkkkkkkkkk.', '.kwwwwwwwwwwwwk.', '.kkkkkkkkkkkkkk.', '..kgdgdgdgdgdk..', '..kgdgdgdgdgdk..', '..kgdgdgdgdgdk..',
    '..kgdgdgdgdgdk..', '..kgdgdgdgdgdk..', '..kgdgdgdgdgdk..', '..kgdgdgdgdgdk..', '..kgdgdgdgdgdk..', '..kkkkkkkkkkkk..', '................', '................'] };
ICONS.console = { pal: { k: '#000', g: '#00ff00', s: '#c0c0c0' }, rows: [
    'kkkkkkkkkkkkkkkk', 'ksssssssssssssk'.padEnd(16, 'k'), 'kkkkkkkkkkkkkkkk', 'kkkkkkkkkkkkkkkk', 'kkgkkkkkkkkkkkkk', 'kkkgkkkkkkkkkkkk', 'kkkkgkkkkkkkkkkk', 'kkkgkkkkkkkkkkkk',
    'kkgkkkkkkkkkkkkk', 'kkkkkkggggggkkkk', 'kkkkkkkkkkkkkkkk', 'kkkkkkkkkkkkkkkk', 'kkkkkkkkkkkkkkkk', 'kkkkkkkkkkkkkkkk', '................', '................'] };

export type PixelName = string;

export function PixelIcon({ name, size = 16 }: { name: PixelName; size?: number }) {
    const ic = ICONS[name];
    if (!ic) return null;
    const rects: JSX.Element[] = [];
    ic.rows.forEach((row, y) => {
        for (let x = 0; x < 16; x++) {
            const c = row[x];
            const fill = c && ic.pal[c];
            if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />);
        }
    });
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true" className="px-icon">
            {rects}
        </svg>
    );
}
