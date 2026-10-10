import { describe, it, expect } from 'vitest';
import { generateBuild } from './randomizer';
import { decodeSkillTemplate } from '../codec/templateCodec';
import { validateSkillBar, DEFAULT_SANITY_CONFIG } from './constraints';
import { getSkillById } from '../../data/skills';
import { Profession } from '../../data/types';

describe('Randomizer Engine', () => {
  it('generates a complete valid build with attributes and template code', () => {
    const build = generateBuild({
      primaryProfession: Profession.Warrior,
      secondaryProfession: Profession.Ranger,
    });

    expect(build.primaryProfession).toBe(Profession.Warrior);
    expect(build.secondaryProfession).toBe(Profession.Ranger);
    expect(build.skills.length).toBe(8);
    expect(build.totalPointsUsed).toBeLessThanOrEqual(200);
    expect(typeof build.templateCode).toBe('string');
    expect(build.templateCode.length).toBeGreaterThan(10);

    // Verify template code round-trips through codec
    const decoded = decodeSkillTemplate(build.templateCode);
    expect(decoded.primaryProfession).toBe(build.primaryProfession);
    expect(decoded.secondaryProfession).toBe(build.secondaryProfession);
    expect(decoded.skills).toEqual(build.skills.map(s => s.id));
  });

  it('respects locked slots at their exact positions', () => {
    const healingSig = getSkillById(1)!; // Healing Signet
    const shieldStance = getSkillById(378)!; // Shield Stance

    const build = generateBuild({
      primaryProfession: Profession.Warrior,
      secondaryProfession: Profession.None,
      lockedSlots: [
        { index: 0, skillId: healingSig.id },
        { index: 7, skillId: shieldStance.id },
      ],
    });

    expect(build.skills[0].id).toBe(healingSig.id);
    expect(build.skills[7].id).toBe(shieldStance.id);
  });

  it('respects lockedEliteId: none to produce 0 elites', () => {
    const build = generateBuild({
      lockedEliteId: 'none',
    });

    const eliteCount = build.skills.filter(s => s.isElite).length;
    expect(eliteCount).toBe(0);
  });

  it('stress test: generates 1,000 builds with zero constraint violations and < 5ms avg execution', () => {
    const startTime = performance.now();
    const ITERATIONS = 1000;

    for (let i = 0; i < ITERATIONS; i++) {
      const build = generateBuild();

      // Invariants
      expect(build.skills.length).toBe(8);
      expect(build.totalPointsUsed).toBeLessThanOrEqual(200);

      // Sanity checks
      const validation = validateSkillBar(
        build.skills,
        DEFAULT_SANITY_CONFIG,
        build.primaryProfession,
        build.secondaryProfession
      );
      expect(validation.valid).toBe(true);

      // Elite cap
      const elites = build.skills.filter(s => s.isElite).length;
      expect(elites).toBeLessThanOrEqual(1);

      // PvE cap
      const pve = build.skills.filter(s => s.isPvEOnly).length;
      expect(pve).toBeLessThanOrEqual(3);

      // Template code valid
      const decoded = decodeSkillTemplate(build.templateCode);
      expect(decoded.skills.length).toBe(8);
    }

    const duration = performance.now() - startTime;
    const avgPerBuild = duration / ITERATIONS;

    // Must be fast (< 5ms per build)
    expect(avgPerBuild).toBeLessThan(5);
  });
});
