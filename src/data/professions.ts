import { ProfessionId, AttributeId } from './types';

export interface ProfessionInfo {
  id: ProfessionId;
  name: string;
  code: string;
  primaryAttributeId: AttributeId | null;
  baseEnergy: number;
  energyRegenPips: number; // 2 pips = 0.67 e/s, 3 pips = 1.0 e/s, 4 pips = 1.33 e/s
}

export const PROFESSIONS: Record<ProfessionId, ProfessionInfo> = {
  0: {
    id: 0,
    name: 'None',
    code: 'None',
    primaryAttributeId: null,
    baseEnergy: 20,
    energyRegenPips: 2,
  },
  1: {
    id: 1,
    name: 'Warrior',
    code: 'W',
    primaryAttributeId: 17, // Strength
    baseEnergy: 20,
    energyRegenPips: 2,
  },
  2: {
    id: 2,
    name: 'Ranger',
    code: 'R',
    primaryAttributeId: 23, // Expertise
    baseEnergy: 20,
    energyRegenPips: 3,
  },
  3: {
    id: 3,
    name: 'Monk',
    code: 'Mo',
    primaryAttributeId: 16, // Divine Favor
    baseEnergy: 20,
    energyRegenPips: 4,
  },
  4: {
    id: 4,
    name: 'Necromancer',
    code: 'N',
    primaryAttributeId: 6, // Soul Reaping
    baseEnergy: 20,
    energyRegenPips: 4,
  },
  5: {
    id: 5,
    name: 'Mesmer',
    code: 'Me',
    primaryAttributeId: 0, // Fast Casting
    baseEnergy: 20,
    energyRegenPips: 4,
  },
  6: {
    id: 6,
    name: 'Elementalist',
    code: 'E',
    primaryAttributeId: 12, // Energy Storage
    baseEnergy: 20,
    energyRegenPips: 4,
  },
  7: {
    id: 7,
    name: 'Assassin',
    code: 'A',
    primaryAttributeId: 35, // Critical Strikes
    baseEnergy: 20,
    energyRegenPips: 2,
  },
  8: {
    id: 8,
    name: 'Ritualist',
    code: 'Rt',
    primaryAttributeId: 36, // Spawning Power
    baseEnergy: 20,
    energyRegenPips: 4,
  },
  9: {
    id: 9,
    name: 'Paragon',
    code: 'P',
    primaryAttributeId: 40, // Leadership
    baseEnergy: 20,
    energyRegenPips: 2,
  },
  10: {
    id: 10,
    name: 'Dervish',
    code: 'D',
    primaryAttributeId: 44, // Mysticism
    baseEnergy: 25,
    energyRegenPips: 2,
  },
};

export const PLAYABLE_PROFESSION_IDS: ProfessionId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function getProfession(id: ProfessionId): ProfessionInfo {
  return PROFESSIONS[id] ?? PROFESSIONS[0];
}

export function isPrimaryAttribute(attributeId: AttributeId, professionId: ProfessionId): boolean {
  return PROFESSIONS[professionId]?.primaryAttributeId === attributeId;
}
