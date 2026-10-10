import { describe, it, expect } from 'vitest';
import { allocateAttributePoints } from './attributeAllocator';
import { Attribute, Profession, Gw1Skill } from '../../data/types';

function makeMockSkill(attribute: Attribute | null, name = 'Mock Skill'): Gw1Skill {
  return {
    id: 9999,
    name,
    profession: Profession.Warrior,
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
    // 4 Swordsmanship, 2 Strength, 2 Tactics
    const skills: Gw1Skill[] = [
      makeMockSkill(Attribute.Swordsmanship),
      makeMockSkill(Attribute.Swordsmanship),
      makeMockSkill(Attribute.Swordsmanship),
      makeMockSkill(Attribute.Swordsmanship),
      makeMockSkill(Attribute.Strength),
      makeMockSkill(Attribute.Strength),
      makeMockSkill(Attribute.Tactics),
      makeMockSkill(Attribute.Tactics),
    ];

    const result = allocateAttributePoints({
      primaryProfession: Profession.Warrior,
      secondaryProfession: Profession.Monk,
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
      makeMockSkill(Attribute.Swordsmanship),
      makeMockSkill(Attribute.Swordsmanship),
      makeMockSkill(Attribute.Swordsmanship),
      makeMockSkill(Attribute.Swordsmanship),
      makeMockSkill(Attribute.Swordsmanship),
      makeMockSkill(Attribute.Strength),
      makeMockSkill(Attribute.Strength),
      makeMockSkill(Attribute.Tactics),
    ];

    const result = allocateAttributePoints({
      primaryProfession: Profession.Warrior,
      secondaryProfession: Profession.None,
      skills,
    });

    expect(result.totalPointsUsed).toBeLessThanOrEqual(200);

    const ranks = result.allocations.map(a => a.rank);
    expect(ranks).toContain(12);
    expect(ranks).toContain(10);
    expect(ranks).toContain(8);
  });

  it('strictly excludes secondary profession primary attribute from allocation', () => {
    // Warrior primary with Monk secondary (Divine Favor)
    const divineFavorSkill = makeMockSkill(Attribute.DivineFavor, 'Divine Favor Skill');
    divineFavorSkill.profession = Profession.Monk;

    const skills: Gw1Skill[] = [
      makeMockSkill(Attribute.Strength),
      makeMockSkill(Attribute.Strength),
      makeMockSkill(Attribute.Strength),
      makeMockSkill(Attribute.Swordsmanship),
      makeMockSkill(Attribute.Swordsmanship),
      makeMockSkill(Attribute.Swordsmanship),
      divineFavorSkill,
      divineFavorSkill,
    ];

    const result = allocateAttributePoints({
      primaryProfession: Profession.Warrior,
      secondaryProfession: Profession.Monk,
      skills,
    });

    const divineFavorAlloc = result.allocations.find(a => a.attributeId === Attribute.DivineFavor);
    expect(divineFavorAlloc).toBeUndefined(); // Must NEVER receive points!
  });

  it('handles edge case of 0 attribute skills gracefully with primary and utility fallback', () => {
    // 8 Signets / Title skills with attribute null
    const skills: Gw1Skill[] = Array.from({ length: 8 }, () => makeMockSkill(null));

    const result = allocateAttributePoints({
      primaryProfession: Profession.Mesmer,
      secondaryProfession: Profession.Warrior,
      skills,
    });

    expect(result.totalPointsUsed).toBeLessThanOrEqual(200);
    expect(result.allocations.length).toBeGreaterThan(0);

    // Mesmer primary attribute is Fast Casting
    const fastCasting = result.allocations.find(a => a.attributeId === Attribute.FastCasting);
    expect(fastCasting).toBeDefined();
    expect(fastCasting?.rank).toBeGreaterThanOrEqual(10);
  });

  it('handles mono-attribute bars by filling primary attribute and utility to 200 pts', () => {
    // 8 Fire Magic skills on an Elementalist
    const skills: Gw1Skill[] = Array.from({ length: 8 }, () => makeMockSkill(Attribute.FireMagic));

    const result = allocateAttributePoints({
      primaryProfession: Profession.Elementalist,
      secondaryProfession: Profession.None,
      skills,
    });

    expect(result.totalPointsUsed).toBeLessThanOrEqual(200);

    const fireMagic = result.allocations.find(a => a.attributeId === Attribute.FireMagic);
    expect(fireMagic?.rank).toBe(12);

    // Energy Storage is Elementalist primary attribute
    const energyStorage = result.allocations.find(a => a.attributeId === Attribute.EnergyStorage);
    expect(energyStorage?.rank).toBe(12);
  });
});
