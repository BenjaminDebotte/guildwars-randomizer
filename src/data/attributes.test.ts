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
    expect(PROFESSIONS[1].primaryAttributeId).toBe(17); // Warrior -> Strength
    expect(PROFESSIONS[2].primaryAttributeId).toBe(23); // Ranger -> Expertise
    expect(PROFESSIONS[3].primaryAttributeId).toBe(16); // Monk -> Divine Favor
    expect(PROFESSIONS[4].primaryAttributeId).toBe(6);  // Necro -> Soul Reaping
    expect(PROFESSIONS[5].primaryAttributeId).toBe(0);  // Mesmer -> Fast Casting
    expect(PROFESSIONS[6].primaryAttributeId).toBe(12); // Ele -> Energy Storage
    expect(PROFESSIONS[7].primaryAttributeId).toBe(35); // Assassin -> Critical Strikes
    expect(PROFESSIONS[8].primaryAttributeId).toBe(36); // Ritualist -> Spawning Power
    expect(PROFESSIONS[9].primaryAttributeId).toBe(40); // Paragon -> Leadership
    expect(PROFESSIONS[10].primaryAttributeId).toBe(44); // Dervish -> Mysticism

    expect(isPrimaryAttribute(17, 1)).toBe(true);
    expect(isPrimaryAttribute(18, 1)).toBe(false); // Axe is not primary
    expect(isPrimaryAttribute(17, 2)).toBe(false); // Strength on Ranger is false
  });

  it('retrieves attributes for a given profession', () => {
    const warriorAttrs = getProfessionAttributes(1);
    expect(warriorAttrs.map(a => a.name).sort()).toEqual([
      'Axe Mastery',
      'Hammer Mastery',
      'Strength',
      'Swordsmanship',
      'Tactics',
    ].sort());

    const necroAttrs = getProfessionAttributes(4);
    expect(necroAttrs.map(a => a.name).sort()).toEqual([
      'Blood Magic',
      'Curses',
      'Death Magic',
      'Soul Reaping',
    ].sort());
  });
});
