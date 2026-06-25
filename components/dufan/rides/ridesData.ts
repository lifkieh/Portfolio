export type CutsceneType = 'cinematic' | 'timing' | 'darkride' | 'runner';

export interface RideDef {
  id: string;
  name: string;
  x: number;
  width: number;
  type: CutsceneType;
}

export const rides: RideDef[] = [
  {
    id: 'bianglala',
    name: 'Bianglala',
    x: 400,
    width: 200,
    type: 'cinematic',
  },
  {
    id: 'korakora',
    name: 'Kora-Kora',
    x: 1000,
    width: 200,
    type: 'timing',
  },
  {
    id: 'istanaboneka',
    name: 'Istana Boneka',
    x: 1800,
    width: 300,
    type: 'darkride',
  },
  {
    id: 'halilintar',
    name: 'Halilintar',
    x: 2600,
    width: 300,
    type: 'runner',
  }
];

export const INTERACTION_ZONE = 160; // px on each side of the ride bounds

export function checkInteraction(playerX: number): RideDef | null {
  for (const ride of rides) {
    // Use full ride bounding box [x, x+width] + generous padding on each side
    const left  = ride.x - INTERACTION_ZONE;
    const right = ride.x + ride.width + INTERACTION_ZONE;
    if (playerX >= left && playerX <= right) {
      return ride;
    }
  }
  return null;
}
