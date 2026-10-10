import { Profession, Attribute } from './types';

export interface ProfessionInfo {
  id: Profession;
  name: string;
  code: string;
  primaryAttributeId: Attribute | null;
  baseEnergy: number;
  energyRegenPips: number; // 2 pips = 0.67 e/s, 3 pips = 1.0 e/s, 4 pips = 1.33 e/s
}

export const PROFESSIONS: Record<Profession, ProfessionInfo> = {
  [Profession.None]: {
    id: Profession.None,
    name: 'None',
    code: 'None',
    primaryAttributeId: null,
    baseEnergy: 20,
    energyRegenPips: 2,
  },
  [Profession.Warrior]: {
    id: Profession.Warrior,
    name: 'Warrior',
    code: 'W',
    primaryAttributeId: Attribute.Strength,
    baseEnergy: 20,
    energyRegenPips: 2,
  },
  [Profession.Ranger]: {
    id: Profession.Ranger,
    name: 'Ranger',
    code: 'R',
    primaryAttributeId: Attribute.Expertise,
    baseEnergy: 20,
    energyRegenPips: 3,
  },
  [Profession.Monk]: {
    id: Profession.Monk,
    name: 'Monk',
    code: 'Mo',
    primaryAttributeId: Attribute.DivineFavor,
    baseEnergy: 20,
    energyRegenPips: 4,
  },
  [Profession.Necromancer]: {
    id: Profession.Necromancer,
    name: 'Necromancer',
    code: 'N',
    primaryAttributeId: Attribute.SoulReaping,
    baseEnergy: 20,
    energyRegenPips: 4,
  },
  [Profession.Mesmer]: {
    id: Profession.Mesmer,
    name: 'Mesmer',
    code: 'Me',
    primaryAttributeId: Attribute.FastCasting,
    baseEnergy: 20,
    energyRegenPips: 4,
  },
  [Profession.Elementalist]: {
    id: Profession.Elementalist,
    name: 'Elementalist',
    code: 'E',
    primaryAttributeId: Attribute.EnergyStorage,
    baseEnergy: 20,
    energyRegenPips: 4,
  },
  [Profession.Assassin]: {
    id: Profession.Assassin,
    name: 'Assassin',
    code: 'A',
    primaryAttributeId: Attribute.CriticalStrikes,
    baseEnergy: 20,
    energyRegenPips: 2,
  },
  [Profession.Ritualist]: {
    id: Profession.Ritualist,
    name: 'Ritualist',
    code: 'Rt',
    primaryAttributeId: Attribute.SpawningPower,
    baseEnergy: 20,
    energyRegenPips: 4,
  },
  [Profession.Paragon]: {
    id: Profession.Paragon,
    name: 'Paragon',
    code: 'P',
    primaryAttributeId: Attribute.Leadership,
    baseEnergy: 20,
    energyRegenPips: 2,
  },
  [Profession.Dervish]: {
    id: Profession.Dervish,
    name: 'Dervish',
    code: 'D',
    primaryAttributeId: Attribute.Mysticism,
    baseEnergy: 25,
    energyRegenPips: 2,
  },
};

export const PLAYABLE_PROFESSION_IDS: Profession[] = [
  Profession.Warrior,
  Profession.Ranger,
  Profession.Monk,
  Profession.Necromancer,
  Profession.Mesmer,
  Profession.Elementalist,
  Profession.Assassin,
  Profession.Ritualist,
  Profession.Paragon,
  Profession.Dervish,
];

export function getProfession(id: Profession): ProfessionInfo {
  return PROFESSIONS[id] ?? PROFESSIONS[Profession.None];
}

export function isPrimaryAttribute(attributeId: Attribute, professionId: Profession): boolean {
  return PROFESSIONS[professionId]?.primaryAttributeId === attributeId;
}
