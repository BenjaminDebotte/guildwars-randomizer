import { AttributeId, ProfessionId } from './types';

export interface AttributeInfo {
  id: AttributeId;
  name: string;
  professionId: ProfessionId;
  isPrimary: boolean;
}

export const MAX_ATTRIBUTE_POINTS = 200;
export const MAX_ATTRIBUTE_RANK = 12;

// Cumulative points required to reach rank 0..12
export const CUMULATIVE_ATTRIBUTE_COSTS: readonly number[] = [
  0,  // Rank 0
  1,  // Rank 1
  3,  // Rank 2
  6,  // Rank 3
  10, // Rank 4
  15, // Rank 5
  21, // Rank 6
  28, // Rank 7
  37, // Rank 8
  48, // Rank 9
  61, // Rank 10
  77, // Rank 11
  97, // Rank 12
] as const;

// Incremental points required to step from (rank - 1) to rank
export const INCREMENTAL_ATTRIBUTE_COSTS: readonly number[] = [
  0,  // Rank 0
  1,  // Rank 1 (0 -> 1)
  2,  // Rank 2 (1 -> 2)
  3,  // Rank 3 (2 -> 3)
  4,  // Rank 4 (3 -> 4)
  5,  // Rank 5 (4 -> 5)
  6,  // Rank 6 (5 -> 6)
  7,  // Rank 7 (6 -> 7)
  9,  // Rank 8 (7 -> 8)
  11, // Rank 9 (8 -> 9)
  13, // Rank 10 (9 -> 10)
  16, // Rank 11 (10 -> 11)
  20, // Rank 12 (11 -> 12)
] as const;

export function getCumulativeCost(rank: number): number {
  if (rank <= 0) return 0;
  if (rank >= MAX_ATTRIBUTE_RANK) return CUMULATIVE_ATTRIBUTE_COSTS[MAX_ATTRIBUTE_RANK];
  return CUMULATIVE_ATTRIBUTE_COSTS[rank] ?? 0;
}

export function getIncrementalCost(rank: number): number {
  if (rank <= 0 || rank > MAX_ATTRIBUTE_RANK) return 0;
  return INCREMENTAL_ATTRIBUTE_COSTS[rank] ?? 0;
}

export const ATTRIBUTES: Record<AttributeId, AttributeInfo> = {
  0:  { id: 0,  name: 'Fast Casting', professionId: 5, isPrimary: true },
  1:  { id: 1,  name: 'Illusion Magic', professionId: 5, isPrimary: false },
  2:  { id: 2,  name: 'Domination Magic', professionId: 5, isPrimary: false },
  3:  { id: 3,  name: 'Inspiration Magic', professionId: 5, isPrimary: false },
  4:  { id: 4,  name: 'Blood Magic', professionId: 4, isPrimary: false },
  5:  { id: 5,  name: 'Death Magic', professionId: 4, isPrimary: false },
  6:  { id: 6,  name: 'Soul Reaping', professionId: 4, isPrimary: true },
  7:  { id: 7,  name: 'Curses', professionId: 4, isPrimary: false },
  8:  { id: 8,  name: 'Air Magic', professionId: 6, isPrimary: false },
  9:  { id: 9,  name: 'Earth Magic', professionId: 6, isPrimary: false },
  10: { id: 10, name: 'Fire Magic', professionId: 6, isPrimary: false },
  11: { id: 11, name: 'Water Magic', professionId: 6, isPrimary: false },
  12: { id: 12, name: 'Energy Storage', professionId: 6, isPrimary: true },
  13: { id: 13, name: 'Healing Prayers', professionId: 3, isPrimary: false },
  14: { id: 14, name: 'Smiting Prayers', professionId: 3, isPrimary: false },
  15: { id: 15, name: 'Protection Prayers', professionId: 3, isPrimary: false },
  16: { id: 16, name: 'Divine Favor', professionId: 3, isPrimary: true },
  17: { id: 17, name: 'Strength', professionId: 1, isPrimary: true },
  18: { id: 18, name: 'Axe Mastery', professionId: 1, isPrimary: false },
  19: { id: 19, name: 'Hammer Mastery', professionId: 1, isPrimary: false },
  20: { id: 20, name: 'Swordsmanship', professionId: 1, isPrimary: false },
  21: { id: 21, name: 'Tactics', professionId: 1, isPrimary: false },
  22: { id: 22, name: 'Beast Mastery', professionId: 2, isPrimary: false },
  23: { id: 23, name: 'Expertise', professionId: 2, isPrimary: true },
  24: { id: 24, name: 'Wilderness Survival', professionId: 2, isPrimary: false },
  25: { id: 25, name: 'Marksmanship', professionId: 2, isPrimary: false },
  29: { id: 29, name: 'Dagger Mastery', professionId: 7, isPrimary: false },
  30: { id: 30, name: 'Deadly Arts', professionId: 7, isPrimary: false },
  31: { id: 31, name: 'Shadow Arts', professionId: 7, isPrimary: false },
  32: { id: 32, name: 'Communing', professionId: 8, isPrimary: false },
  33: { id: 33, name: 'Restoration Magic', professionId: 8, isPrimary: false },
  34: { id: 34, name: 'Channeling Magic', professionId: 8, isPrimary: false },
  35: { id: 35, name: 'Critical Strikes', professionId: 7, isPrimary: true },
  36: { id: 36, name: 'Spawning Power', professionId: 8, isPrimary: true },
  37: { id: 37, name: 'Spear Mastery', professionId: 9, isPrimary: false },
  38: { id: 38, name: 'Command', professionId: 9, isPrimary: false },
  39: { id: 39, name: 'Motivation', professionId: 9, isPrimary: false },
  40: { id: 40, name: 'Leadership', professionId: 9, isPrimary: true },
  41: { id: 41, name: 'Scythe Mastery', professionId: 10, isPrimary: false },
  42: { id: 42, name: 'Wind Prayers', professionId: 10, isPrimary: false },
  43: { id: 43, name: 'Earth Prayers', professionId: 10, isPrimary: false },
  44: { id: 44, name: 'Mysticism', professionId: 10, isPrimary: true },
};

export function getAttribute(id: AttributeId): AttributeInfo | undefined {
  return ATTRIBUTES[id];
}

export function getProfessionAttributes(professionId: ProfessionId): AttributeInfo[] {
  return Object.values(ATTRIBUTES).filter(attr => attr.professionId === professionId);
}
