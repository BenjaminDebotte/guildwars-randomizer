import { describe, it, expect } from 'vitest';
import { SKILLS, SKILL_BY_ID, getSkillById, getAvailableSkills, resolveTemplateSkills } from './skills';

describe('Skill Database Integrity', () => {
  it('loads valid canonical skill records with unique IDs', () => {
    expect(SKILLS.length).toBe(1329);
    expect(SKILL_BY_ID.size).toBe(1329);

    const ids = new Set<number>();
    for (const skill of SKILLS) {
      expect(skill.id).toBeGreaterThan(0);
      expect(ids.has(skill.id)).toBe(false);
      ids.add(skill.id);

      expect(skill.profession).toBeGreaterThanOrEqual(0);
      expect(skill.profession).toBeLessThanOrEqual(10);

      if (skill.attribute !== null) {
        expect(skill.attribute).toBeGreaterThanOrEqual(0);
        expect(skill.attribute).toBeLessThanOrEqual(44);
      }
    }
  });

  it('validates canonical skill details and sanity flags on iconic skills', () => {
    // Healing Signet
    const healSig = getSkillById(1);
    expect(healSig).toBeDefined();
    expect(healSig?.name).toBe('Healing Signet');
    expect(healSig?.profession).toBe(1);
    expect(healSig?.type).toBe('Signet');
    expect(healSig?.energy).toBe(0);
    expect(healSig?.activation).toBe(2);
    expect(healSig?.recharge).toBe(4);

    // Resurrection Signet
    const resSig = getSkillById(2);
    expect(resSig).toBeDefined();
    expect(resSig?.name).toBe('Resurrection Signet');
    expect(resSig?.profession).toBe(0);
    expect(resSig?.attribute).toBeNull();

    // Twin Moon Sweep (Dervish Teardown)
    const twinMoon = getSkillById(1487);
    expect(twinMoon).toBeDefined();
    expect(twinMoon?.name).toBe('Twin Moon Sweep');
    expect(twinMoon?.profession).toBe(10);
    expect(twinMoon?.weaponRequirement).toBe('Scythe');
    expect(twinMoon?.isTeardown).toBe(true);

    // Charm Animal (Pet Enabler)
    const charm = getSkillById(411);
    expect(charm).toBeDefined();
    expect(charm?.name).toBe('Charm Animal');
    expect(charm?.profession).toBe(2);
    expect(charm?.isPetEnabler).toBe(true);

    // Assassin Combo Sequence
    const leadAttack = getSkillById(779); // Black Lotus Strike
    expect(leadAttack).toBeDefined();
    expect(leadAttack?.comboChainStep).toBe('Lead');
    expect(leadAttack?.weaponRequirement).toBe('Dagger');

    const offhandAttack = getSkillById(1022); // Wild Strike
    expect(offhandAttack).toBeDefined();
    expect(offhandAttack?.comboChainStep).toBe('Offhand');
    expect(offhandAttack?.weaponRequirement).toBe('Dagger');

    const dualAttack = getSkillById(776); // Twisting Fangs
    expect(dualAttack).toBeDefined();
    expect(dualAttack?.comboChainStep).toBe('Dual');
    expect(dualAttack?.weaponRequirement).toBe('Dagger');

    // Shield skill
    const shieldStance = getSkillById(378);
    expect(shieldStance).toBeDefined();
    expect(shieldStance?.name).toBe('Shield Stance');
    expect(shieldStance?.isShieldSkill).toBe(true);
  });

  it('filters available skills correctly by profession and PvE flag', () => {
    // Warrior / Monk
    const warriorMonkSkills = getAvailableSkills({
      primaryProfession: 1,
      secondaryProfession: 3,
      includePvE: false,
    });

    for (const skill of warriorMonkSkills) {
      expect([0, 1, 3]).toContain(skill.profession);
      expect(skill.isPvEOnly).toBe(false);
    }

    // Including PvE allows Common skills
    const withPvE = getAvailableSkills({
      primaryProfession: 1,
      secondaryProfession: 3,
      includePvE: true,
    });

    const hasCommon = withPvE.some(s => s.profession === 0);
    expect(hasCommon).toBe(true);

    // Resurrection Signet is PvP legal (common skill available even with includePvE: false)
    const withoutPvE = getAvailableSkills({
      primaryProfession: 1,
      secondaryProfession: 3,
      includePvE: false,
    });
    expect(withoutPvE.some(s => s.id === 2)).toBe(true);
  });

  it('correctly tags specific mechanics without false positives', () => {
    // Vital Blessing (Monk, ID 289) must NOT be a Form
    const vitalBlessing = getSkillById(289);
    expect(vitalBlessing).toBeDefined();
    expect(vitalBlessing?.isForm).toBeUndefined();

    // Rend Enchantments (Necro, ID 141) must NOT be a Teardown
    const rendEnch = getSkillById(141);
    expect(rendEnch).toBeDefined();
    expect(rendEnch?.isTeardown).toBeUndefined();

    // Luxon vs Kurzick title mapping
    const saveYourselvesLuxon = getSkillById(1954);
    expect(saveYourselvesLuxon?.titleTrack).toBe('luxon');

    const etherNightmareKurzick = getSkillById(2092);
    expect(etherNightmareKurzick?.titleTrack).toBe('kurzick');
  });

  it('resolves template skill IDs with fallback objects for empty or unknown skills', () => {
    // 1 is Healing Signet, 0 is empty slot, 999999 is unknown
    const resolved = resolveTemplateSkills([1, 0, 999999]);
    expect(resolved.length).toBe(3);

    // Known skill
    expect(resolved[0].id).toBe(1);
    expect(resolved[0].name).toBe('Healing Signet');

    // Empty slot
    expect(resolved[1].id).toBe(0);
    expect(resolved[1].name).toBe('Empty Slot');
    expect(resolved[1].profession).toBe(0);

    // Unknown skill
    expect(resolved[2].id).toBe(999999);
    expect(resolved[2].name).toBe('Unknown Skill (999999)');
    expect(resolved[2].profession).toBe(0);
  });
});
