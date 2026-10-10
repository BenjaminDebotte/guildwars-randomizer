import { describe, it, expect } from 'vitest';
import {
  CUMULATIVE_ATTRIBUTE_COSTS,
  INCREMENTAL_ATTRIBUTE_COSTS,
  MAX_ATTRIBUTE_POINTS,
  MAX_ATTRIBUTE_RANK,
  getCumulativeCost,
  getIncrementalCost,
  getProfessionAttributes,
} from './attributes';
import { PROFESSIONS, isPrimaryAttribute } from './professions';
import { Profession, Attribute } from './types';

describe('Attribute Costs & Math Invariants', () => {
  it('matches official cumulative costs progression up to Rank 12 = 97', () => {
    expect(CUMULATIVE_ATTRIBUTE_COSTS[0]).toBe(0);
    expect(CUMULATIVE_ATTRIBUTE_COSTS[1]).toBe(1);
    expect(CUMULATIVE_ATTRIBUTE_COSTS[2]).toBe(3);
    expect(CUMULATIVE_ATTRIBUTE_COSTS[3]).toBe(6);
    expect(CUMULATIVE_ATTRIBUTE_COSTS[4]).toBe(10);
    expect(CUMULATIVE_ATTRIBUTE_COSTS[5]).toBe(15);
    expect(CUMULATIVE_ATTRIBUTE_COSTS[6]).toBe(21);
    expect(CUMULATIVE_ATTRIBUTE_COSTS[7]).toBe(28);
    expect(CUMULATIVE_ATTRIBUTE_COSTS[8]).toBe(37);
    expect(CUMULATIVE_ATTRIBUTE_COSTS[9]).toBe(48);
    expect(CUMULATIVE_ATTRIBUTE_COSTS[10]).toBe(61);
    expect(CUMULATIVE_ATTRIBUTE_COSTS[11]).toBe(77);
    expect(CUMULATIVE_ATTRIBUTE_COSTS[12]).toBe(97);
  });

  it('cumulative cost equals sum of incremental costs', () => {
    let runningSum = 0;
    for (let r = 1; r <= MAX_ATTRIBUTE_RANK; r++) {
      runningSum += INCREMENTAL_ATTRIBUTE_COSTS[r];
      expect(runningSum).toBe(CUMULATIVE_ATTRIBUTE_COSTS[r]);
      expect(getCumulativeCost(r)).toBe(CUMULATIVE_ATTRIBUTE_COSTS[r]);
      expect(getIncrementalCost(r)).toBe(INCREMENTAL_ATTRIBUTE_COSTS[r]);
    }
  });

  it('validates classic meta attribute spreads fit within 200 AP budget', () => {
    // 12 / 12 / 3 spread
    const spread12_12_3 = getCumulativeCost(12) + getCumulativeCost(12) + getCumulativeCost(3);
    expect(spread12_12_3).toBe(200); // 97 + 97 + 6 = 200

    // 12 / 10 / 8 spread
    const spread12_10_8 = getCumulativeCost(12) + getCumulativeCost(10) + getCumulativeCost(8);
    expect(spread12_10_8).toBe(195); // 97 + 61 + 37 = 195 (5 residual)
    expect(spread12_10_8).toBeLessThanOrEqual(MAX_ATTRIBUTE_POINTS);

    // 12 / 9 / 9 spread
    const spread12_9_9 = getCumulativeCost(12) + getCumulativeCost(9) + getCumulativeCost(9);
    expect(spread12_9_9).toBe(193); // 97 + 48 + 48 = 193 (7 residual)
    expect(spread12_9_9).toBeLessThanOrEqual(MAX_ATTRIBUTE_POINTS);
  });

  it('maps each profession to its canonical primary attribute', () => {
    expect(PROFESSIONS[Profession.Warrior].primaryAttributeId).toBe(Attribute.Strength);
    expect(PROFESSIONS[Profession.Ranger].primaryAttributeId).toBe(Attribute.Expertise);
    expect(PROFESSIONS[Profession.Monk].primaryAttributeId).toBe(Attribute.DivineFavor);
    expect(PROFESSIONS[Profession.Necromancer].primaryAttributeId).toBe(Attribute.SoulReaping);
    expect(PROFESSIONS[Profession.Mesmer].primaryAttributeId).toBe(Attribute.FastCasting);
    expect(PROFESSIONS[Profession.Elementalist].primaryAttributeId).toBe(Attribute.EnergyStorage);
    expect(PROFESSIONS[Profession.Assassin].primaryAttributeId).toBe(Attribute.CriticalStrikes);
    expect(PROFESSIONS[Profession.Ritualist].primaryAttributeId).toBe(Attribute.SpawningPower);
    expect(PROFESSIONS[Profession.Paragon].primaryAttributeId).toBe(Attribute.Leadership);
    expect(PROFESSIONS[Profession.Dervish].primaryAttributeId).toBe(Attribute.Mysticism);

    expect(isPrimaryAttribute(Attribute.Strength, Profession.Warrior)).toBe(true);
    expect(isPrimaryAttribute(Attribute.AxeMastery, Profession.Warrior)).toBe(false);
    expect(isPrimaryAttribute(Attribute.Strength, Profession.Ranger)).toBe(false);
  });

  it('retrieves attributes for a given profession', () => {
    const warriorAttrs = getProfessionAttributes(Profession.Warrior);
    expect(warriorAttrs.map(a => a.name).sort()).toEqual([
      'Axe Mastery',
      'Hammer Mastery',
      'Strength',
      'Swordsmanship',
      'Tactics',
    ].sort());

    const necroAttrs = getProfessionAttributes(Profession.Necromancer);
    expect(necroAttrs.map(a => a.name).sort()).toEqual([
      'Blood Magic',
      'Curses',
      'Death Magic',
      'Soul Reaping',
    ].sort());
  });
});
