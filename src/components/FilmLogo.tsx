/** Simple 3D logo: an extruded gradient tile with a raised play button and film-strip holes. Reads well on light and dark. */
export function FilmLogo({ size = 40 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="MRV">
            <defs>
                <linearGradient id="mrv-top" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffb547" />
                    <stop offset="0.55" stopColor="#ff6a2b" />
                    <stop offset="1" stopColor="#e11d74" />
                </linearGradient>
                <linearGradient id="mrv-depth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#a3360a" />
                    <stop offset="1" stopColor="#7a1f3d" />
                </linearGradient>
                <linearGradient id="mrv-shine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
            </defs>
            <rect x="6" y="11" width="52" height="48" rx="14" fill="url(#mrv-depth)" />
            <rect x="6" y="5" width="52" height="48" rx="14" fill="url(#mrv-top)" />
            {[0, 1, 2, 3, 4].map((i) => (
                <g key={i} fill="#ffffff" fillOpacity="0.35">
                    <rect x={14 + i * 8.5} y="9" width="4" height="3" rx="1" />
                    <rect x={14 + i * 8.5} y="46" width="4" height="3" rx="1" />
                </g>
            ))}
            <rect x="9" y="7" width="46" height="20" rx="11" fill="url(#mrv-shine)" />
            <path d="M27 21.5 L43 29 L27 36.5 Z" fill="#7a1f3d" fillOpacity="0.55" transform="translate(0 2.2)" />
            <path d="M27 21.5 L43 29 L27 36.5 Z" fill="#ffffff" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
        </svg>
    );
}
