import { afterEach, describe, expect, it, vi } from 'vitest';
import { NoColorSpace, SRGBColorSpace } from 'three';
import { WoodTextureLibrary } from './wood-texture-library';

function browserStubs(failedKind?: string) {
  const close = vi.fn();
  const fetchMock = vi.fn(async (url: string) => new Response('image', { status: failedKind && url.includes(failedKind) ? 503 : 200 }));
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 1024, height: 1024, close })));
  return { close, fetchMock };
}
afterEach(() => { vi.unstubAllGlobals(); });

describe('owned wood resources', () => {
  it('loads each set once, distinguishes data/colour spaces and keeps metre-based grain orientation', async () => {
    const { fetchMock } = browserStubs();
    const library = new WoodTextureLibrary(16);
    const [one, two] = await Promise.all([library.load('oak'), library.load('oak')]);
    expect(one).toBe(two);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(one.colour.colorSpace).toBe(SRGBColorSpace);
    expect(one.normal.colorSpace).toBe(NoColorSpace);
    expect(one.roughness.colorSpace).toBe(NoColorSpace);
    expect(one.colour.rotation).toBe(0);
    expect(one.colour.repeat.toArray()).toEqual([1, 1]);
    expect(one.colour.anisotropy).toBe(8);
    expect(one.colour.flipY).toBe(false);
    library.dispose();
  });
  it('bounds 30 changes to three sets and releases all GPU textures and decoded images once', async () => {
    const { fetchMock, close } = browserStubs();
    const library = new WoodTextureLibrary(4);
    const disposed = vi.fn();
    for (const id of ['oak', 'walnut', 'ash'] as const) {
      const set = await library.load(id);
      for (const texture of Object.values(set)) texture.addEventListener('dispose', disposed);
    }
    for (let i = 0; i < 30; i++) await library.load((['oak', 'walnut', 'ash'] as const)[i % 3]);
    expect(fetchMock).toHaveBeenCalledTimes(9);
    library.dispose();
    library.dispose();
    expect(disposed).toHaveBeenCalledTimes(9);
    expect(close).toHaveBeenCalledTimes(9);
  });
  it('cleans partially loaded maps after a failure and retries only when explicitly requested', async () => {
    const { fetchMock, close } = browserStubs('normal');
    const library = new WoodTextureLibrary(1);
    await expect(library.load('walnut')).rejects.toThrow('unavailable');
    expect(close).toHaveBeenCalledTimes(2);
    await expect(library.load('walnut')).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    fetchMock.mockImplementation(async () => new Response('image'));
    await expect(library.load('walnut', 1)).resolves.toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(6);
    library.dispose();
    expect(close).toHaveBeenCalledTimes(5);
  });
  it('releases decoded results arriving after teardown and never publishes them', async () => {
    const { close } = browserStubs();
    let complete!: () => void;
    const gate = new Promise<void>(resolve => { complete = resolve; });
    vi.stubGlobal('createImageBitmap', vi.fn(async () => { await gate; return { width: 1024, height: 1024, close }; }));
    const library = new WoodTextureLibrary(1);
    const pending = library.load('ash');
    // Let all downloads reach the asynchronous decode stage before disposal.
    await vi.waitFor(() => expect(createImageBitmap).toHaveBeenCalledTimes(3));
    library.dispose();
    complete();
    await expect(pending).rejects.toThrow();
    expect(close).toHaveBeenCalledTimes(3);
    await expect(library.load('oak')).rejects.toThrow('disposed');
  });
});
