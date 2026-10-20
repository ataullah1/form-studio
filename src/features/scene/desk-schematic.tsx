import { catalogV1, type ProductConfiguration } from '@/lib/catalog';
import { woodPresets } from './wood-presets';
/** Selected accessories remain visible independently of Three/WebGL. */
export function DeskSchematic({ configuration, compact=false }: { configuration: ProductConfiguration; compact?:boolean }) {
  const size=catalogV1.sizes[configuration.sizeId];const frame=configuration.frameColourId==='white'?'#e9e6df':'#30322f';
  return <figure className={`schematic${compact?' schematic-compact':''}`}><svg viewBox="0 0 500 330" role="img" aria-label={compact?`${catalogV1.finishes[configuration.finishId].label} desk, ${size.label}, ${catalogV1.frameColours[configuration.frameColourId].label} frame`:'Studio Desk 01 — 2D dimension schematic'}>
    <title>Studio Desk 01 — 2D dimension schematic</title><desc>Front elevation: {size.widthMetres*100} centimetres wide, 74 centimetres high. Tabletop 3 centimetres thick; depth {size.depthMetres*100} centimetres. {configuration.accessoryIds.map(id=>catalogV1.accessories[id].label).join(', ')}</desc>
    <g fill={frame} stroke="#705e53" strokeWidth="1"><path d="M96 128v151h12V128m264 0v151h12V128M108 151h264v9H108Z"/>
      {configuration.accessoryIds.includes('lamp')&&<g data-accessory="lamp"><ellipse cx="140" cy="116" rx="24" ry="5"/><path d="M139 115V54l15-16" fill="none" stroke={frame} strokeWidth="5"/><path d="m149 33 14 8 10 22-33-14Z" fill={frame}/></g>}
      {configuration.accessoryIds.includes('monitor-stand')&&<g data-accessory="monitor-stand"><rect x="205" y="91" width="110" height="8" rx="2" fill={woodPresets[configuration.finishId].neutralColour}/><path d="M213 99v20h7V99m80 0v20h7V99Z"/></g>}
      {configuration.accessoryIds.includes('cable-tray')&&<g data-accessory="cable-tray"><path d="M197 130v15h124v-15m-118 17v14h112v-14Z" fill={frame}/><path d="M211 153h94" stroke="#bba696"/></g>}
      <rect x="80" y="119" width="320" height="9" rx="3" fill={woodPresets[configuration.finishId].neutralColour}/>
    </g><g fill="none" stroke="var(--colour-control-border)" strokeWidth="1"><path d="M72 279h336M60 119v160m-6-160h12m-12 160h12M80 302h320m-320-6v12m320-12v12"/></g>
    <g fill="currentColor" textAnchor="middle" fontSize="12" fontFamily="var(--font-body), sans-serif"><text x="240" y="322">{size.widthMetres*100} cm</text><text x="35" y="205">74 cm</text><text x="240" y="24">{compact?'STUDIO DESK 01':`DEPTH ${size.depthMetres*100} CM · TOP 3 CM`}</text></g>
  </svg>{!compact&&<figcaption><span>{catalogV1.finishes[configuration.finishId].label} / {catalogV1.frameColours[configuration.frameColourId].label} · Depth {size.depthMetres*100} cm</span><br/>{configuration.accessoryIds.length?`Selected accessories: ${configuration.accessoryIds.map(id=>catalogV1.accessories[id].label).join(', ')}. `:'No accessories selected. '}2D design schematic · Not to scale</figcaption>}</figure>;
}
