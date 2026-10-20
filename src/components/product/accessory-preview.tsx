import Image from 'next/image';
import type { AccessoryId } from '@/lib/catalog';

const previews: Record<AccessoryId, { src: string; alt: string }> = {
  lamp: { src: '/assets/accessories/light.webp', alt: 'Black desk lamp concept with a warm inner shade' },
  'monitor-stand': { src: '/assets/accessories/monitor stn.webp', alt: 'Black raised monitor stand concept' },
  'cable-tray': { src: '/assets/accessories/line tray.webp', alt: 'Black under-desk cable tray concept' },
};

export function AccessoryPreview({ id }: { id: AccessoryId }) {
  const preview = previews[id];
  return <Image src={preview.src} alt={preview.alt} width={1448} height={1086} sizes="(max-width: 650px) 90vw, (max-width: 1050px) 45vw, 23vw" className="accessory-preview" />;
}
