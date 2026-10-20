import {
  LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, SRGBColorSpace, Texture,
} from 'three';
import type { FinishId } from '../../lib/catalog';
import { textureKinds, woodPresets, woodTextureURL, type TextureKind } from './wood-presets';

export interface WoodTextureSet { colour: Texture; normal: Texture; roughness: Texture }
interface Entry { promise: Promise<WoodTextureSet>; result?: WoodTextureSet; failed: boolean; attempt: number }

export function configureWoodTexture(texture: Texture, kind: TextureKind, finishId: FinishId, anisotropy: number) {
  texture.colorSpace = kind === 'colour' ? SRGBColorSpace : NoColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = Math.min(8, Math.max(1, anisotropy));
  texture.flipY = false; // ImageBitmap was explicitly flipped while decoding.
  const scale = 1 / woodPresets[finishId].tileMetres;
  texture.repeat.set(scale, scale);
  texture.offset.set(0.5, 0.5);
  texture.rotation = 0; // Inspected source grain runs horizontally, along local U / desk width.
  texture.needsUpdate = true;
}

function release(texture: Texture) {
  texture.dispose();
  (texture.image as ImageBitmap).close();
}
function releaseSet(set: WoodTextureSet) {
  for (const texture of Object.values(set)) release(texture);
}

/** Per-viewer, at most three sets. No global loader cache or shared mutable texture objects. */
export class WoodTextureLibrary {
  private entries = new Map<FinishId, Entry>();
  private controllers = new Set<AbortController>();
  private disposed = false;

  constructor(private readonly anisotropy: number, private readonly textureSize = 1024) {}

  private async loadMap(finishId: FinishId, kind: TextureKind, attempt: number) {
    const controller = new AbortController();
    this.controllers.add(controller);
    const timeout = setTimeout(() => controller.abort(), 12000);
    let bitmap: ImageBitmap | undefined;
    try {
      const suffix = attempt > 0 ? `?retry=${attempt}` : '';
      const response = await fetch(woodTextureURL(finishId, kind) + suffix, { signal: controller.signal });
      if (!response.ok) throw new Error('Wood texture download failed');
      bitmap = await createImageBitmap(await response.blob(), {
        imageOrientation: 'flipY', premultiplyAlpha: 'none', colorSpaceConversion: 'none',
        resizeWidth: this.textureSize, resizeHeight: this.textureSize, resizeQuality: 'high',
      });
      if (this.disposed || controller.signal.aborted) throw new Error('Wood texture request cancelled');
      const texture = new Texture(bitmap);
      configureWoodTexture(texture, kind, finishId, this.anisotropy);
      return texture;
    } catch (error) {
      bitmap?.close();
      throw error;
    } finally {
      clearTimeout(timeout);
      this.controllers.delete(controller);
    }
  }

  load(finishId: FinishId, attempt = 0): Promise<WoodTextureSet> {
    if (this.disposed) return Promise.reject(new Error('Wood texture library disposed'));
    const previous = this.entries.get(finishId);
    if (previous && (!previous.failed || previous.attempt === attempt)) return previous.promise;
    const entry: Entry = { failed: false, attempt, promise: Promise.allSettled(textureKinds.map(kind => this.loadMap(finishId, kind, attempt))).then(results => {
      if (this.disposed || results.some(result => result.status === 'rejected')) {
        for (const result of results) if (result.status === 'fulfilled') release(result.value);
        throw new Error('Wood finish unavailable');
      }
      const textures = results.map(result => (result as PromiseFulfilledResult<Texture>).value);
      const set = { colour: textures[0], normal: textures[1], roughness: textures[2] };
      entry.result = set;
      return set;
    }).catch(error => { entry.failed = true; throw error; }) };
    this.entries.set(finishId, entry);
    return entry.promise;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    for (const controller of this.controllers) controller.abort();
    for (const entry of this.entries.values()) if (entry.result) releaseSet(entry.result);
    this.entries.clear();
  }
}
