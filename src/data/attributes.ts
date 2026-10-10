import { Attribute, Profession } from './types';

export interface AttributeInfo {
  id: Attribute;
  name: string;
  professionId: Profession;
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

export const ATTRIBUTES: Record<Attribute, AttributeInfo> = {
  [Attribute.FastCasting]: { id: Attribute.FastCasting, name: 'Fast Casting', professionId: Profession.Mesmer, isPrimary: true },
  [Attribute.IllusionMagic]: { id: Attribute.IllusionMagic, name: 'Illusion Magic', professionId: Profession.Mesmer, isPrimary: false },
  [Attribute.DominationMagic]: { id: Attribute.DominationMagic, name: 'Domination Magic', professionId: Profession.Mesmer, isPrimary: false },
  [Attribute.InspirationMagic]: { id: Attribute.InspirationMagic, name: 'Inspiration Magic', professionId: Profession.Mesmer, isPrimary: false },
  [Attribute.BloodMagic]: { id: Attribute.BloodMagic, name: 'Blood Magic', professionId: Profession.Necromancer, isPrimary: false },
  [Attribute.DeathMagic]: { id: Attribute.DeathMagic, name: 'Death Magic', professionId: Profession.Necromancer, isPrimary: false },
  [Attribute.SoulReaping]: { id: Attribute.SoulReaping, name: 'Soul Reaping', professionId: Profession.Necromancer, isPrimary: true },
  [Attribute.Curses]: { id: Attribute.Curses, name: 'Curses', professionId: Profession.Necromancer, isPrimary: false },
  [Attribute.AirMagic]: { id: Attribute.AirMagic, name: 'Air Magic', professionId: Profession.Elementalist, isPrimary: false },
  [Attribute.EarthMagic]: { id: Attribute.EarthMagic, name: 'Earth Magic', professionId: Profession.Elementalist, isPrimary: false },
  [Attribute.FireMagic]: { id: Attribute.FireMagic, name: 'Fire Magic', professionId: Profession.Elementalist, isPrimary: false },
  [Attribute.WaterMagic]: { id: Attribute.WaterMagic, name: 'Water Magic', professionId: Profession.Elementalist, isPrimary: false },
  [Attribute.EnergyStorage]: { id: Attribute.EnergyStorage, name: 'Energy Storage', professionId: Profession.Elementalist, isPrimary: true },
  [Attribute.HealingPrayers]: { id: Attribute.HealingPrayers, name: 'Healing Prayers', professionId: Profession.Monk, isPrimary: false },
  [Attribute.SmitingPrayers]: { id: Attribute.SmitingPrayers, name: 'Smiting Prayers', professionId: Profession.Monk, isPrimary: false },
  [Attribute.ProtectionPrayers]: { id: Attribute.ProtectionPrayers, name: 'Protection Prayers', professionId: Profession.Monk, isPrimary: false },
  [Attribute.DivineFavor]: { id: Attribute.DivineFavor, name: 'Divine Favor', professionId: Profession.Monk, isPrimary: true },
  [Attribute.Strength]: { id: Attribute.Strength, name: 'Strength', professionId: Profession.Warrior, isPrimary: true },
  [Attribute.AxeMastery]: { id: Attribute.AxeMastery, name: 'Axe Mastery', professionId: Profession.Warrior, isPrimary: false },
  [Attribute.HammerMastery]: { id: Attribute.HammerMastery, name: 'Hammer Mastery', professionId: Profession.Warrior, isPrimary: false },
  [Attribute.Swordsmanship]: { id: Attribute.Swordsmanship, name: 'Swordsmanship', professionId: Profession.Warrior, isPrimary: false },
  [Attribute.Tactics]: { id: Attribute.Tactics, name: 'Tactics', professionId: Profession.Warrior, isPrimary: false },
  [Attribute.BeastMastery]: { id: Attribute.BeastMastery, name: 'Beast Mastery', professionId: Profession.Ranger, isPrimary: false },
  [Attribute.Expertise]: { id: Attribute.Expertise, name: 'Expertise', professionId: Profession.Ranger, isPrimary: true },
  [Attribute.WildernessSurvival]: { id: Attribute.WildernessSurvival, name: 'Wilderness Survival', professionId: Profession.Ranger, isPrimary: false },
  [Attribute.Marksmanship]: { id: Attribute.Marksmanship, name: 'Marksmanship', professionId: Profession.Ranger, isPrimary: false },
  [Attribute.DaggerMastery]: { id: Attribute.DaggerMastery, name: 'Dagger Mastery', professionId: Profession.Assassin, isPrimary: false },
  [Attribute.DeadlyArts]: { id: Attribute.DeadlyArts, name: 'Deadly Arts', professionId: Profession.Assassin, isPrimary: false },
  [Attribute.ShadowArts]: { id: Attribute.ShadowArts, name: 'Shadow Arts', professionId: Profession.Assassin, isPrimary: false },
  [Attribute.Communing]: { id: Attribute.Communing, name: 'Communing', professionId: Profession.Ritualist, isPrimary: false },
  [Attribute.RestorationMagic]: { id: Attribute.RestorationMagic, name: 'Restoration Magic', professionId: Profession.Ritualist, isPrimary: false },
  [Attribute.ChannelingMagic]: { id: Attribute.ChannelingMagic, name: 'Channeling Magic', professionId: Profession.Ritualist, isPrimary: false },
  [Attribute.CriticalStrikes]: { id: Attribute.CriticalStrikes, name: 'Critical Strikes', professionId: Profession.Assassin, isPrimary: true },
  [Attribute.SpawningPower]: { id: Attribute.SpawningPower, name: 'Spawning Power', professionId: Profession.Ritualist, isPrimary: true },
  [Attribute.SpearMastery]: { id: Attribute.SpearMastery, name: 'Spear Mastery', professionId: Profession.Paragon, isPrimary: false },
  [Attribute.Command]: { id: Attribute.Command, name: 'Command', professionId: Profession.Paragon, isPrimary: false },
  [Attribute.Motivation]: { id: Attribute.Motivation, name: 'Motivation', professionId: Profession.Paragon, isPrimary: false },
  [Attribute.Leadership]: { id: Attribute.Leadership, name: 'Leadership', professionId: Profession.Paragon, isPrimary: true },
  [Attribute.ScytheMastery]: { id: Attribute.ScytheMastery, name: 'Scythe Mastery', professionId: Profession.Dervish, isPrimary: false },
  [Attribute.WindPrayers]: { id: Attribute.WindPrayers, name: 'Wind Prayers', professionId: Profession.Dervish, isPrimary: false },
  [Attribute.EarthPrayers]: { id: Attribute.EarthPrayers, name: 'Earth Prayers', professionId: Profession.Dervish, isPrimary: false },
  [Attribute.Mysticism]: { id: Attribute.Mysticism, name: 'Mysticism', professionId: Profession.Dervish, isPrimary: true },
};

export function getAttribute(id: Attribute): AttributeInfo | undefined {
  return ATTRIBUTES[id];
}

export function getProfessionAttributes(professionId: Profession): AttributeInfo[] {
  return Object.values(ATTRIBUTES).filter(attr => attr.professionId === professionId);
}
