// Source text of the Three.js addons bundled into MRV, keyed by their path under examples/jsm/.
// They are injected into the render frame only when the pasted code imports them.
const RAW = import.meta.glob(
    [
        '../../node_modules/three/examples/jsm/postprocessing/*.js',
        '../../node_modules/three/examples/jsm/shaders/*.js',
        '../../node_modules/three/examples/jsm/geometries/*.js',
        '../../node_modules/three/examples/jsm/environments/*.js',
        '../../node_modules/three/examples/jsm/controls/*.js',
        '../../node_modules/three/examples/jsm/math/*.js',
        '../../node_modules/three/examples/jsm/objects/*.js',
        '../../node_modules/three/examples/jsm/lines/*.js',
        '../../node_modules/three/examples/jsm/curves/*.js',
        '../../node_modules/three/examples/jsm/modifiers/*.js',
        '../../node_modules/three/examples/jsm/lights/*.js',
        '../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js',
        '../../node_modules/three/examples/jsm/utils/GeometryUtils.js',
        '../../node_modules/three/examples/jsm/utils/SceneUtils.js',
        '../../node_modules/three/examples/jsm/utils/SkeletonUtils.js',
        '../../node_modules/three/examples/jsm/utils/WorkerPool.js',
        '../../node_modules/three/examples/jsm/loaders/FontLoader.js',
        '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js',
        '../../node_modules/three/examples/jsm/loaders/RGBELoader.js',
        '../../node_modules/three/examples/jsm/loaders/SVGLoader.js',
        '../../node_modules/three/examples/jsm/loaders/OBJLoader.js',
        '../../node_modules/three/examples/jsm/loaders/MTLLoader.js',
        '../../node_modules/three/examples/jsm/loaders/FBXLoader.js',
        '../../node_modules/three/examples/jsm/loaders/DRACOLoader.js',
        '../../node_modules/three/examples/jsm/loaders/KTX2Loader.js',
        '../../node_modules/three/examples/jsm/loaders/EXRLoader.js',
        '../../node_modules/three/examples/jsm/loaders/STLLoader.js',
        '../../node_modules/three/examples/jsm/loaders/PLYLoader.js',
        '../../node_modules/three/examples/jsm/loaders/TGALoader.js',
        '../../node_modules/three/examples/jsm/loaders/HDRLoader.js',
        '../../node_modules/three/examples/jsm/libs/fflate.module.js',
        '../../node_modules/three/examples/jsm/libs/ktx-parse.module.js',
        '../../node_modules/three/examples/jsm/libs/zstddec.module.js',
        '../../node_modules/three/examples/jsm/renderers/CSS2DRenderer.js',
        '../../node_modules/three/examples/jsm/renderers/CSS3DRenderer.js',
    ],
    { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

const RAW_FONTS = import.meta.glob(
    [
        '../../node_modules/three/examples/fonts/helvetiker_regular.typeface.json',
        '../../node_modules/three/examples/fonts/helvetiker_bold.typeface.json',
    ],
    { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

export const ADDON_SRC: Record<string, string> = {};
for (const [p, src] of Object.entries(RAW)) {
    const k = p.split('/examples/jsm/')[1];
    if (k && typeof src === 'string') ADDON_SRC[k] = src;
}

export const FONT_SRC: Record<string, string> = {};
for (const [p, src] of Object.entries(RAW_FONTS)) {
    const m = /([\w-]+)\.typeface\.json$/.exec(p);
    if (m && typeof src === 'string') FONT_SRC[m[1]] = src;
}
