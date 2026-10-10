import { describe, it, expect } from 'vitest';
import { allocateAttributePoints } from './attributeAllocator';
import { AttributeId, Gw1Skill } from '../../data/types';

function makeMockSkill(attribute: AttributeId | null, name = 'Mock Skill'): Gw1Skill {
  return {
    id: 9999,
    name,
    profession: 1,
    attribute,
    campaign: 0,
    isElite: false,
    isPvEOnly: false,
    type: 'Skill',
    energy: 5,
    activation: 1,
    recharge: 5,
    description: '',
  };
}

describe('200 Attribute Point Mathematical Allocator', () => {
  it('never exceeds 200 Attribute Points', () => {
    // 4 Swordsmanship (20), 2 Strength (17), 2 Tactics (21)
    const skills: Gw1Skill[] = [
      makeMockSkill(20),
      makeMockSkill(20),
      makeMockSkill(20),
      makeMockSkill(20),
      makeMockSkill(17),
      makeMockSkill(17),
      makeMockSkill(21),
      makeMockSkill(21),
    ];

    const result = allocateAttributePoints({
      primaryProfession: 1, // Warrior
      secondaryProfession: 3, // Monk
      skills,
    });

    expect(result.totalPointsUsed).toBeLessThanOrEqual(200);
    expect(result.remainingPoints).toBeGreaterThanOrEqual(0);
    expect(result.totalPointsUsed + result.remainingPoints).toBe(200);

    for (const alloc of result.allocations) {
      expect(alloc.rank).toBeGreaterThanOrEqual(1);
      expect(alloc.rank).toBeLessThanOrEqual(12);
    }
  });

  it('allocates classic 12/10/8 spread when one attribute dominates', () => {
    const skills: Gw1Skill[] = [
      makeMockSkill(20),
      makeMockSkill(20),
      makeMockSkill(20),
      makeMockSkill(20),
      makeMockSkill(20),
      makeMockSkill(17),
      makeMockSkill(17),
      makeMockSkill(21),
    ];

    const result = allocateAttributePoints({
      primaryProfession: 1,
      secondaryProfession: 0,
      skills,
    });

    expect(result.totalPointsUsed).toBeLessThanOrEqual(200);

    const ranks = result.allocations.map(a => a.rank);
    expect(ranks).toContain(12);
    expect(ranks).toContain(10);
    expect(ranks).toContain(8);
  });

  it('strictly excludes secondary profession primary attribute from allocation', () => {
    // Warrior primary with Monk secondary (Divine Favor is attribute 16)
    const divineFavorSkill = makeMockSkill(16, 'Divine Favor Skill');
    divineFavorSkill.profession = 3;

    const skills: Gw1Skill[] = [
      makeMockSkill(17), // Strength
      makeMockSkill(17),
      makeMockSkill(17),
      makeMockSkill(20), // Swordsmanship
      makeMockSkill(20),
      makeMockSkill(20),
      divineFavorSkill,
      divineFavorSkill,
    ];

    const result = allocateAttributePoints({
      primaryProfession: 1, // Warrior
      secondaryProfession: 3, // Monk
      skills,
    });

    const divineFavorAlloc = result.allocations.find(a => a.attributeId === 16);
    expect(divineFavorAlloc).toBeUndefined(); // Must NEVER receive points!
  });

  it('handles edge case of 0 attribute skills gracefully with primary and utility fallback', () => {
    // 8 Signets / Title skills with attribute null
    const skills: Gw1Skill[] = Array.from({ length: 8 }, () => makeMockSkill(null));

    const result = allocateAttributePoints({
      primaryProfession: 5, // Mesmer
      secondaryProfession: 1, // Warrior
      skills,
    });

    expect(result.totalPointsUsed).toBeLessThanOrEqual(200);
    expect(result.allocations.length).toBeGreaterThan(0);

    // Mesmer primary attribute is Fast Casting (0)
    const fastCasting = result.allocations.find(a => a.attributeId === 0);
    expect(fastCasting).toBeDefined();
    expect(fastCasting?.rank).toBeGreaterThanOrEqual(10);
  });

  it('handles mono-attribute bars by filling primary attribute and utility to 200 pts', () => {
    // 8 Fire Magic (10) skills on an Elementalist
    const skills: Gw1Skill[] = Array.from({ length: 8 }, () => makeMockSkill(10));

    const result = allocateAttributePoints({
      primaryProfession: 6, // Elementalist
      secondaryProfession: 0,
      skills,
    });

    expect(result.totalPointsUsed).toBeLessThanOrEqual(200);

    const fireMagic = result.allocations.find(a => a.attributeId === 10);
    expect(fireMagic?.rank).toBe(12);

    // Energy Storage (12) is Elementalist primary attribute
    const energyStorage = result.allocations.find(a => a.attributeId === 12);
    expect(energyStorage?.rank).toBe(12);
  });
});
