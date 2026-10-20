import type { AccessoryId } from '@/lib/catalog';
export function AccessoryPreview({ id }: { id:AccessoryId }) {
  return <svg viewBox="0 0 280 180" role="img" aria-label={`${id==='lamp'?'Desk lamp':id==='monitor-stand'?'Monitor stand':'Cable tray'} concept preview`} className="accessory-preview"><path d="M35 153h210" stroke="var(--colour-border)" fill="none" />
    {id==='lamp'?<g fill="#2b211c" stroke="#2b211c" strokeWidth="3"><ellipse cx="127" cy="148" rx="40" ry="7"/><path d="M128 145V62l28-28" fill="none" strokeWidth="7"/><path d="m152 27 23 14 15 36-54-32Z"/><path d="m139 47 40 23" stroke="#e4ac94" strokeWidth="4"/></g>:id==='monitor-stand'?<g fill="#4c3c31" stroke="#2b211c" strokeWidth="2"><path d="m55 86 147-26 36 21-149 30Z" fill="#b48b58"/><path d="M65 91v54l14 5v-52m132-12v48l14-5V83"/><path d="m56 86 33 25 149-30v8L89 119 56 94Z" fill="#967447"/></g>:<g fill="#4c3c31" stroke="#2b211c" strokeWidth="2"><path d="m49 102 155-29 29 18-157 34Z" fill="#8c7464"/><path d="m49 102 27 23 157-34v26l-157 35-27-22Z"/><path d="m76 125 157-34M89 131l133-30m-124 39 123-28" stroke="#bba696"/><path d="M66 100V78m146 0V59" fill="none" strokeWidth="5"/></g>}
  </svg>;
}
