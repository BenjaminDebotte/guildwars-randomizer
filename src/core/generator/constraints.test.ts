import { describe, it, expect } from 'vitest';
import { canAddSkill, validateSkillBar, DEFAULT_SANITY_CONFIG } from './constraints';
import { Gw1Skill } from '../../data/types';

function createSkill(partial: Partial<Gw1Skill>): Gw1Skill {
  return {
    id: Math.floor(Math.random() * 100000) + 1,
    name: 'Test Skill',
    profession: 1,
    attribute: 17,
    campaign: 0,
    isElite: false,
    isPvEOnly: false,
    type: 'Skill',
    energy: 5,
    activation: 1,
    recharge: 5,
    description: '',
    ...partial,
  };
}

describe('Mechanical Sanity Constraints', () => {
  it('enforces maximum 3 PvE-only skills', () => {
    const pve1 = createSkill({ isPvEOnly: true });
    const pve2 = createSkill({ isPvEOnly: true });
    const pve3 = createSkill({ isPvEOnly: true });
    const pve4 = createSkill({ isPvEOnly: true });

    const current = [pve1, pve2, pve3];
    expect(canAddSkill(current, pve4, DEFAULT_SANITY_CONFIG, 1, 0)).toBe(false);

    // Non-PvE skill can still be added
    const nonPvE = createSkill({ isPvEOnly: false });
    expect(canAddSkill(current, nonPvE, DEFAULT_SANITY_CONFIG, 1, 0)).toBe(true);
  });

  it('enforces maximum 1 Elite skill', () => {
    const elite1 = createSkill({ isElite: true });
    const elite2 = createSkill({ isElite: true });

    expect(canAddSkill([elite1], elite2, DEFAULT_SANITY_CONFIG, 1, 0)).toBe(false);
  });

  it('enforces weapon coherence across attack skills', () => {
    const swordAttack = createSkill({ weaponRequirement: 'Sword', type: 'Attack' });
    const axeAttack = createSkill({ weaponRequirement: 'Axe', type: 'Attack' });
    const genericMelee = createSkill({ weaponRequirement: undefined, type: 'Attack' });

    // Cannot add Axe attack to a Sword build
    expect(canAddSkill([swordAttack], axeAttack, DEFAULT_SANITY_CONFIG, 1, 0)).toBe(false);

    // Generic melee attack can be added
    expect(canAddSkill([swordAttack], genericMelee, DEFAULT_SANITY_CONFIG, 1, 0)).toBe(true);
  });

  it('prevents pairing shield skills with two-handed weapons', () => {
    const hammerAttack = createSkill({ weaponRequirement: 'Hammer', type: 'Attack' });
    const shieldStance = createSkill({ isShieldSkill: true, type: 'Stance' });

    expect(canAddSkill([hammerAttack], shieldStance, DEFAULT_SANITY_CONFIG, 1, 0)).toBe(false);
    expect(canAddSkill([shieldStance], hammerAttack, DEFAULT_SANITY_CONFIG, 1, 0)).toBe(false);
  });

  it('enforces Assassin combo sequences', () => {
    const lead = createSkill({ comboChainStep: 'Lead' });
    const offhand = createSkill({ comboChainStep: 'Offhand' });
    const dual = createSkill({ comboChainStep: 'Dual' });

    // With 7 skills and no Lead, cannot add Offhand (needs 1 slot for Lead)
    const filler = Array.from({ length: 7 }, () => createSkill({}));
    expect(canAddSkill(filler, offhand, DEFAULT_SANITY_CONFIG, 7, 0)).toBe(false);

    // With Lead present, Offhand can be added
    const withLead = [lead, ...filler.slice(0, 6)];
    expect(canAddSkill(withLead, offhand, DEFAULT_SANITY_CONFIG, 7, 0)).toBe(true);

    // validateSkillBar catches missing predecessors in completed bar
    const incompleteBar = [dual, ...Array.from({ length: 7 }, () => createSkill({}))];
    const validation = validateSkillBar(incompleteBar, DEFAULT_SANITY_CONFIG, 7, 0);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some(e => e.includes('Dual attack requires'))).toBe(true);
  });

  it('enforces pet dependency for pet attack skills', () => {
    const petAttack = createSkill({ requiresPet: true });
    const petEnabler = createSkill({ isPetEnabler: true });

    // With 7 slots filled and no enabler, cannot pick pet attack
    const filler = Array.from({ length: 7 }, () => createSkill({}));
    expect(canAddSkill(filler, petAttack, DEFAULT_SANITY_CONFIG, 2, 0)).toBe(false);

    // Completed bar without enabler fails validation
    const barWithoutEnabler = [petAttack, ...filler];
    const validation = validateSkillBar(barWithoutEnabler, DEFAULT_SANITY_CONFIG, 2, 0);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some(e => e.includes('pet enabler'))).toBe(true);

    // With enabler, passes
    const barWithEnabler = [petAttack, petEnabler, ...Array.from({ length: 6 }, () => createSkill({}))];
    expect(validateSkillBar(barWithEnabler, DEFAULT_SANITY_CONFIG, 2, 0).valid).toBe(true);
  });

  it('enforces low-energy primary energy restrictions on Warrior', () => {
    const highEnergy = createSkill({ energy: 25, type: 'Spell' });
    const medEnergy1 = createSkill({ energy: 15, type: 'Spell' });
    const medEnergy2 = createSkill({ energy: 15, type: 'Spell' });

    // 25 energy spell banned on Warrior primary
    expect(canAddSkill([], highEnergy, DEFAULT_SANITY_CONFIG, 1, 6)).toBe(false);

    // Cap >= 15 energy skills to at most 1 on Warrior
    expect(canAddSkill([medEnergy1], medEnergy2, DEFAULT_SANITY_CONFIG, 1, 6)).toBe(false);
  });
});
