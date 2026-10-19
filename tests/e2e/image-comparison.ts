import type { Page } from '@playwright/test';

// Element screenshots can have subpixel clipping at their edges after orientation/scroll.
// Compare the interior pixels; the product is fully inside this 12px inset.
export async function changedInteriorFraction(page: Page, before: Buffer, after: Buffer) {
  return page.evaluate(async images => {
    const buffers: ImageData[] = [];
    for (const source of images) {
      const image = new Image();
      image.src = `data:image/png;base64,${source}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      buffers.push(context.getImageData(0, 0, canvas.width, canvas.height));
    }
    const [a, b] = buffers;
    if (a.width !== b.width || a.height !== b.height) return 1;
    let changed = 0;
    let total = 0;
    for (let y = 12; y < a.height - 12; y++) {
      for (let x = 12; x < a.width - 12; x++) {
        const i = (y * a.width + x) * 4;
        if ([0, 1, 2].some(c => Math.abs(a.data[i + c] - b.data[i + c]) > 2)) changed++;
        total++;
      }
    }
    return changed / total;
  }, [before.toString('base64'), after.toString('base64')]);
}

