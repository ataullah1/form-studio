import { catalogV1, defaultConfiguration } from '@/lib/catalog';

/** Accessible HTML/SVG fallback, independent of Three/WebGL and the Canvas boundary. */
export function DeskSchematic() {
  const size = catalogV1.sizes[defaultConfiguration.sizeId];
  return <figure className="schematic">
    <svg viewBox="0 0 500 280" role="img" aria-labelledby="schematic-title schematic-desc">
      <title id="schematic-title">Studio Desk 01 — 2D dimension schematic</title>
      <desc id="schematic-desc">Front elevation: 140 centimetres wide, 74 centimetres high. The tabletop is 3 centimetres thick; depth is 70 centimetres.</desc>
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="80" y="78" width="320" height="9" rx="3" fill="#c39c69" />
        <path d="M96 87v151h12V87m264 0v151h12V87M108 110h264M60 78v160m-6-160h12m-12 160h12M80 55h320m-320-6v12m320-12v12" />
        <path d="M72 238h336" stroke="var(--colour-control-border)" />
      </g>
      <g fill="currentColor" textAnchor="middle" fontSize="12" fontFamily="var(--font-body), sans-serif">
        <text x="240" y="40">{size.widthMetres * 100} cm</text>
        <text x="35" y="165">{catalogV1.heightMetres * 100} cm</text>
        <text x="240" y="270">Depth {size.depthMetres * 100} cm · Top 3 cm · Oak / Black</text>
      </g>
    </svg>
    <figcaption>2D design schematic · Default setup · Not a manufacturing drawing</figcaption>
  </figure>;
}
