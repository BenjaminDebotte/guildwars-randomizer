import { Gw1Skill, ProfessionId, WeaponRequirement } from '../../data/types';
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

/**
 * Checks if a candidate skill can be legally and constructively added to the current bar.
 */
export function canAddSkill(
  currentSkills: Gw1Skill[],
  candidate: Gw1Skill,
  config: SanityConfig,
  primaryProf: ProfessionId,
  secProf: ProfessionId
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
  if (candidate.type === 'Stance') {
    const stances = currentSkills.filter(s => s.type === 'Stance').length;
    if (stances >= (config.maxStances ?? 2)) return false;
  }

  if (candidate.type === 'Preparation') {
    const preps = currentSkills.filter(s => s.type === 'Preparation').length;
    if (preps >= (config.maxPreparations ?? 1)) return false;
  }

  if (candidate.isForm || candidate.type === 'Form') {
    const forms = currentSkills.filter(s => s.isForm || s.type === 'Form').length;
    if (forms >= (config.maxForms ?? 1)) return false;
  }

  if (candidate.type === 'WeaponSpell') {
    const wSpells = currentSkills.filter(s => s.type === 'WeaponSpell').length;
    if (wSpells >= (config.maxWeaponSpells ?? 2)) return false;
  }

  // 7. Weapon Coherence
  if (config.enforceWeaponCoherence) {
    const existingWeapons = Array.from(
      new Set(currentSkills.map(s => s.weaponRequirement).filter(Boolean))
    ) as WeaponRequirement[];

    // If candidate has a specific weapon requirement
    if (candidate.weaponRequirement) {
      if (existingWeapons.length > 0 && !existingWeapons.includes(candidate.weaponRequirement)) {
        return false;
      }
      if (TWO_HANDED_WEAPONS.has(candidate.weaponRequirement)) {
        if (currentSkills.some(s => s.isShieldSkill)) return false;
      }
    }

    // If candidate requires a shield
    if (candidate.isShieldSkill) {
      if (existingWeapons.some(w => TWO_HANDED_WEAPONS.has(w))) {
        return false;
      }
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
    if (primaryProf === 1) { // Warrior (20 max energy, 2 pips)
      if (candidate.energy >= 20) return false;
      if (candidate.energy >= 15) {
        const heavyCount = currentSkills.filter(s => s.energy >= 15).length;
        if (heavyCount >= 1) return false;
      }
      if (candidate.upkeep && candidate.upkeep >= 2) return false;
    } else if (primaryProf === 2 || primaryProf === 9) { // Ranger or Paragon
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
  primaryProf?: ProfessionId,
  secProf?: ProfessionId
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

  // Stances, preparations, forms
  const stances = skills.filter(s => s.type === 'Stance').length;
  if (stances > (config.maxStances ?? 2)) {
    errors.push(`Maximum ${config.maxStances ?? 2} stances exceeded (found ${stances}).`);
  }

  const preps = skills.filter(s => s.type === 'Preparation').length;
  if (preps > (config.maxPreparations ?? 1)) {
    errors.push(`Maximum ${config.maxPreparations ?? 1} preparations exceeded (found ${preps}).`);
  }

  const forms = skills.filter(s => s.isForm || s.type === 'Form').length;
  if (forms > (config.maxForms ?? 1)) {
    errors.push(`Maximum ${config.maxForms ?? 1} transformation forms exceeded (found ${forms}).`);
  }

  const weaponSpells = skills.filter(s => s.type === 'WeaponSpell').length;
  if (weaponSpells > (config.maxWeaponSpells ?? 2)) {
    errors.push(`Maximum ${config.maxWeaponSpells ?? 2} weapon spells exceeded (found ${weaponSpells}).`);
  }

  // Secondary primary attribute check
  if (secProf && primaryProf && secProf !== primaryProf) {
    const secPrimaryAttr = PROFESSIONS[secProf]?.primaryAttributeId;
    if (secPrimaryAttr !== null && skills.some(s => s.profession === secProf && s.attribute === secPrimaryAttr)) {
      errors.push(`Cannot equip skills scaling with secondary profession's primary attribute.`);
    }
  }

  // Energy sanity check
  if (config.enforceEnergySanity && primaryProf === 1) {
    if (skills.some(s => s.energy >= 20)) {
      errors.push(`Warrior primary cannot sustain skills costing 20 or more energy.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
