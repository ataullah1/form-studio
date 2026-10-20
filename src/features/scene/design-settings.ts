export type RoomView = 'studio' | 'room';
export type FloorFinish = 'sand' | 'stone' | 'clay';
export const floorFinishes: Record<FloorFinish, { label: string; colour: string }> = {
  sand: { label: 'Warm sand', colour: '#cfc1ad' },
  stone: { label: 'Soft stone', colour: '#b8bab4' },
  clay: { label: 'Muted clay', colour: '#b58c76' },
};

