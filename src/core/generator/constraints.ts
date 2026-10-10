import { Gw1Skill, Profession, WeaponRequirement } from '../../data/types';
import { PROFESSIONS } from '../../data/professions';

export interface SanityConfig {
  maxPvESkills?: number;            // default 3 (hard client limit)
  maxElites?: number;               // default 1 (hard client limit)
  enforceWeaponCoherence?: boolean; // default true
  enforceAssassinCombos?: boolean;  // default true
  enforcePetSanity?: boolean;       // default true
  enforceTeardownSanity?: boolean;  // default true
  enforceEnergySanity?: boolean;    // default true
  maxStances?: number;              // default 2
  maxPreparations?: number;         // default 1
  maxForms?: number;                // default 1
  maxWeaponSpells?: number;         // default 2
  maxAttributes?: number | null;    // default 3 (null = unrestricted)
}

export const DEFAULT_SANITY_CONFIG: SanityConfig = {
  maxPvESkills: 3,
  maxElites: 1,
  enforceWeaponCoherence: true,
  enforceAssassinCombos: true,
  enforcePetSanity: true,
  enforceTeardownSanity: true,
  enforceEnergySanity: true,
  maxStances: 2,
  maxPreparations: 1,
  maxForms: 1,
  maxWeaponSpells: 2,
  maxAttributes: 3,
};

export const CHAOS_SANITY_CONFIG: SanityConfig = {
  maxPvESkills: 3, // Still 3 so template imports work in-game
  maxElites: 1,    // Still 1 so template imports work in-game
  enforceWeaponCoherence: false,
  enforceAssassinCombos: false,
  enforcePetSanity: false,
  enforceTeardownSanity: false,
  enforceEnergySanity: false,
  maxStances: 8,
  maxPreparations: 8,
  maxForms: 8,
  maxWeaponSpells: 8,
  maxAttributes: null,
};

const TWO_HANDED_WEAPONS: Set<WeaponRequirement> = new Set(['Hammer', 'Scythe', 'Bow', 'Staff', 'Dagger']);

function countTypeSkills(skills: Gw1Skill[], type: string): number {
  if (type === 'Form') {
    return skills.filter(s => s.isForm || s.type === 'Form').length;
  }
  return skills.filter(s => s.type === type).length;
}

/**
 * Checks if a candidate skill can be legally and constructively added to the current bar.
 */
export function canAddSkill(
  currentSkills: Gw1Skill[],
  candidate: Gw1Skill,
  config: SanityConfig,
  primaryProf: Profession,
  secProf: Profession
): boolean {
  // 1. Cannot add duplicates
  if (currentSkills.some(s => s.id === candidate.id)) {
    return false;
  }

  // 2. Bar size check
  if (currentSkills.length >= 8) {
    return false;
  }

  const remainingSlots = 8 - currentSkills.length - 1; // slots left AFTER adding candidate

  // 3. PvE Skill Limit
  const maxPvE = config.maxPvESkills ?? 3;
  if (candidate.isPvEOnly) {
    const currentPvE = currentSkills.filter(s => s.isPvEOnly).length;
    if (currentPvE >= maxPvE) return false;
  }

  // 4. Elite Skill Limit
  const maxElites = config.maxElites ?? 1;
  if (candidate.isElite) {
    const currentElites = currentSkills.filter(s => s.isElite).length;
    if (currentElites >= maxElites) return false;
  }

  // 5. Exclude skills scaling with secondary profession's primary attribute
  if (candidate.profession === secProf && secProf !== primaryProf) {
    const secPrimaryAttr = PROFESSIONS[secProf]?.primaryAttributeId;
    if (secPrimaryAttr !== null && candidate.attribute === secPrimaryAttr) {
      return false;
    }
  }

  // 6. Caps on Overwriting Mechanics
  const typeLimits: Array<[boolean, number, string]> = [
    [candidate.type === 'Stance', config.maxStances ?? 2, 'Stance'],
    [candidate.type === 'Preparation', config.maxPreparations ?? 1, 'Preparation'],
    [Boolean(candidate.isForm || candidate.type === 'Form'), config.maxForms ?? 1, 'Form'],
    [candidate.type === 'WeaponSpell', config.maxWeaponSpells ?? 2, 'WeaponSpell'],
  ];
  for (const [matches, limit, typeName] of typeLimits) {
    if (matches && countTypeSkills(currentSkills, typeName) >= limit) {
      return false;
    }
  }

  // 7. Weapon Coherence
  if (config.enforceWeaponCoherence) {
    if (candidate.weaponRequirement) {
      if (currentSkills.some(s => s.weaponRequirement && s.weaponRequirement !== candidate.weaponRequirement)) {
        return false;
      }
      if (TWO_HANDED_WEAPONS.has(candidate.weaponRequirement) && currentSkills.some(s => s.isShieldSkill)) {
        return false;
      }
    }

    if (
      candidate.isShieldSkill &&
      currentSkills.some(s => s.weaponRequirement && TWO_HANDED_WEAPONS.has(s.weaponRequirement))
    ) {
      return false;
    }
  }

  // 8. Pet Sanity
  if (config.enforcePetSanity) {
    if (candidate.isPetEnabler) {
      const enablers = currentSkills.filter(s => s.isPetEnabler).length;
      if (enablers >= 1) return false;
    }

    if (candidate.requiresPet) {
      const hasEnabler = currentSkills.some(s => s.isPetEnabler);
      // If we don't have an enabler, we must have at least 1 remaining slot to pick one
      if (!hasEnabler && remainingSlots < 1) {
        return false;
      }
    }
  }

  // 9. Assassin Combo Chains
  if (config.enforceAssassinCombos) {
    const hasLead = currentSkills.some(s => s.comboChainStep === 'Lead');
    const hasOffhand = currentSkills.some(s => s.comboChainStep === 'Offhand');

    if (candidate.comboChainStep === 'Offhand') {
      if (!hasLead && remainingSlots < 1) return false;
    }

    if (candidate.comboChainStep === 'Dual') {
      const needed = (!hasLead ? 1 : 0) + (!hasOffhand ? 1 : 0);
      if (needed > remainingSlots) return false;
    }
  }

  // 10. Dervish Teardowns
  if (config.enforceTeardownSanity && candidate.isTeardown) {
    const hasEnchantment = currentSkills.some(s => s.isFlashEnchantment || s.type === 'Enchantment');
    if (!hasEnchantment && remainingSlots < 1) return false;
  }

  // 11. Energy Sanity
  if (config.enforceEnergySanity) {
    if (primaryProf === Profession.Warrior) { // Warrior (20 max energy, 2 pips)
      if (candidate.energy >= 20) return false;
      if (candidate.energy >= 15) {
        const heavyCount = currentSkills.filter(s => s.energy >= 15).length;
        if (heavyCount >= 1) return false;
      }
      if (candidate.upkeep && candidate.upkeep >= 2) return false;
    } else if (primaryProf === Profession.Ranger || primaryProf === Profession.Paragon) {
      if (candidate.energy >= 15) {
        const heavyCount = currentSkills.filter(s => s.energy >= 15).length;
        if (heavyCount >= 2) return false;
      }
    }
  }

  // 12. Attribute Concentration
  if (config.maxAttributes && config.maxAttributes > 0 && candidate.attribute !== null) {
    const currentAttrs = new Set(
      currentSkills.map(s => s.attribute).filter(a => a !== null)
    );
    if (!currentAttrs.has(candidate.attribute) && currentAttrs.size >= config.maxAttributes) {
      return false;
    }
  }

  return true;
}

/**
 * Validates a completed 8-skill bar against all sanity rules.
 */
export function validateSkillBar(
  skills: Gw1Skill[],
  config: SanityConfig = DEFAULT_SANITY_CONFIG,
  primaryProf?: Profession,
  secProf?: Profession
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (skills.length !== 8) {
    errors.push(`Skill bar must contain exactly 8 skills (currently ${skills.length}).`);
  }

  // Elite check
  const elites = skills.filter(s => s.isElite).length;
  if (elites > (config.maxElites ?? 1)) {
    errors.push(`Maximum ${config.maxElites ?? 1} elite skill allowed (found ${elites}).`);
  }

  // PvE check
  const pveCount = skills.filter(s => s.isPvEOnly).length;
  if (pveCount > (config.maxPvESkills ?? 3)) {
    errors.push(`Maximum ${config.maxPvESkills ?? 3} PvE-only skills allowed (found ${pveCount}).`);
  }

  // Weapon coherence
  if (config.enforceWeaponCoherence) {
    const weapons = Array.from(
      new Set(skills.map(s => s.weaponRequirement).filter(Boolean))
    ) as WeaponRequirement[];
    if (weapons.length > 1) {
      errors.push(`Conflicting weapon requirements found: ${weapons.join(', ')}.`);
    }
    const hasTwoHanded = weapons.some(w => TWO_HANDED_WEAPONS.has(w));
    if (hasTwoHanded && skills.some(s => s.isShieldSkill)) {
      errors.push(`Cannot equip shield skills with two-handed weapons.`);
    }
  }

  // Assassin combos
  if (config.enforceAssassinCombos) {
    const hasLead = skills.some(s => s.comboChainStep === 'Lead');
    const hasOffhand = skills.some(s => s.comboChainStep === 'Offhand');
    const hasDual = skills.some(s => s.comboChainStep === 'Dual');

    if (hasDual && (!hasOffhand || !hasLead)) {
      errors.push(`Dual attack requires both an Offhand attack and a Lead attack.`);
    }
    if (hasOffhand && !hasLead) {
      errors.push(`Offhand attack requires a Lead attack.`);
    }
  }

  // Pet sanity
  if (config.enforcePetSanity) {
    const hasPetAttack = skills.some(s => s.requiresPet);
    const hasPetEnabler = skills.some(s => s.isPetEnabler);
    if (hasPetAttack && !hasPetEnabler) {
      errors.push(`Pet attacks require a pet enabler (Charm Animal, Comfort Animal, or Heal as One).`);
    }
  }

  // Teardown sanity
  if (config.enforceTeardownSanity) {
    const hasTeardown = skills.some(s => s.isTeardown);
    const hasEnchantment = skills.some(s => s.isFlashEnchantment || s.type === 'Enchantment');
    if (hasTeardown && !hasEnchantment) {
      errors.push(`Dervish enchantment teardowns require at least one enchantment.`);
    }
  }

  // Stances, preparations, forms, weapon spells
  const mechanicsCaps: Array<[string, number, string]> = [
    ['Stance', config.maxStances ?? 2, 'stances'],
    ['Preparation', config.maxPreparations ?? 1, 'preparations'],
    ['Form', config.maxForms ?? 1, 'transformation forms'],
    ['WeaponSpell', config.maxWeaponSpells ?? 2, 'weapon spells'],
  ];
  for (const [typeName, limit, label] of mechanicsCaps) {
    const count = countTypeSkills(skills, typeName);
    if (count > limit) {
      errors.push(`Maximum ${limit} ${label} exceeded (found ${count}).`);
    }
  }

  // Secondary primary attribute check
  if (secProf && primaryProf && secProf !== primaryProf) {
    const secPrimaryAttr = PROFESSIONS[secProf]?.primaryAttributeId;
    if (secPrimaryAttr !== null && skills.some(s => s.profession === secProf && s.attribute === secPrimaryAttr)) {
      errors.push(`Cannot equip skills scaling with secondary profession's primary attribute.`);
    }
  }

  // Energy sanity check
  if (config.enforceEnergySanity && primaryProf === Profession.Warrior) {
    if (skills.some(s => s.energy >= 20)) {
      errors.push(`Warrior primary cannot sustain skills costing 20 or more energy.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
