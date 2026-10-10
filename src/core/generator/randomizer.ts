import { ProfessionId, Gw1Skill, TemplateData } from '../../data/types';
import { PLAYABLE_PROFESSION_IDS } from '../../data/professions';
import { getAvailableSkills, getSkillById } from '../../data/skills';
import { canAddSkill, validateSkillBar, DEFAULT_SANITY_CONFIG, SanityConfig } from './constraints';
import { allocateAttributePoints } from '../allocator/attributeAllocator';
import { encodeSkillTemplate } from '../codec/templateCodec';
import { RandomizerOptions, GeneratedBuild } from './types';

function pickRandom<T>(array: readonly T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index] as T;
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = temp;
  }
  return copy;
}

/**
 * Generates a playable, mechanically sane randomized Guild Wars 1 build.
 */
export function generateBuild(options: RandomizerOptions = {}): GeneratedBuild {
  const sanityConfig: SanityConfig = {
    ...DEFAULT_SANITY_CONFIG,
    ...options.sanityConfig,
  };

  // 1. Resolve Primary Profession
  let primaryProf: ProfessionId;
  if (options.primaryProfession && options.primaryProfession !== 'random') {
    primaryProf = options.primaryProfession;
  } else {
    primaryProf = pickRandom(PLAYABLE_PROFESSION_IDS);
  }

  // 2. Resolve Secondary Profession
  let secProf: ProfessionId;
  if (options.secondaryProfession === 'none') {
    secProf = 0;
  } else if (
    options.secondaryProfession &&
    options.secondaryProfession !== 'random' &&
    options.secondaryProfession !== primaryProf
  ) {
    secProf = options.secondaryProfession;
  } else {
    // Pick random secondary from remaining professions, or occasionally 0 (mono-prof)
    const validSecondaries = PLAYABLE_PROFESSION_IDS.filter(id => id !== primaryProf);
    secProf = pickRandom(validSecondaries);
  }

  // 3. Obtain skill pool
  const rawPool = getAvailableSkills({
    primaryProfession: primaryProf,
    secondaryProfession: secProf,
    campaigns: options.campaigns,
    includePvE: options.includePvE ?? true,
  });

  // 4. Handle locked skills and locked slots
  const slots: Array<Gw1Skill | null> = [null, null, null, null, null, null, null, null];

  if (options.lockedSlots) {
    for (const lock of options.lockedSlots) {
      if (lock.index >= 0 && lock.index < 8) {
        const skill = getSkillById(lock.skillId);
        if (skill) {
          slots[lock.index] = skill;
        }
      }
    }
  }

  // Handle locked elite
  if (options.lockedEliteId && options.lockedEliteId !== 'none') {
    const eliteSkill = getSkillById(options.lockedEliteId);
    if (eliteSkill && !slots.some(s => s?.id === eliteSkill.id)) {
      // Find first empty slot
      const emptyIdx = slots.findIndex(s => s === null);
      if (emptyIdx !== -1) {
        slots[emptyIdx] = eliteSkill;
      }
    }
  }

  // 5. Fill remaining empty slots constructively
  const MAX_ATTEMPTS = 20;
  let attempt = 0;
  let finalSkills: Gw1Skill[] | null = null;

  while (attempt < MAX_ATTEMPTS && !finalSkills) {
    attempt++;
    const currentBar: Gw1Skill[] = [];
    const pool = shuffle(rawPool);

    // Seed with locked skills
    for (let i = 0; i < 8; i++) {
      if (slots[i] !== null) {
        currentBar.push(slots[i] as Gw1Skill);
      }
    }

    let success = true;

    // Constructively fill remaining slots
    while (currentBar.length < 8) {
      // If we need an elite and don't have one yet, bias towards picking an elite
      const hasElite = currentBar.some(s => s.isElite);
      const remainingSlots = 8 - currentBar.length;

      // Filter candidates
      const candidates = pool.filter(candidate => {
        // If locked elite is 'none', forbid elites
        if (options.lockedEliteId === 'none' && candidate.isElite) return false;
        // If we are on the last few slots and still need an elite (and not 'none'), check
        return canAddSkill(currentBar, candidate, sanityConfig, primaryProf, secProf);
      });

      if (candidates.length === 0) {
        success = false;
        break; // Retry attempt
      }

      // Prioritize filling dependencies if needed
      // (e.g. if we have a pet attack, try to pick pet enabler if present in candidates)
      const needsPetEnabler = currentBar.some(s => s.requiresPet) && !currentBar.some(s => s.isPetEnabler);
      const needsLead = currentBar.some(s => s.comboChainStep === 'Offhand' || s.comboChainStep === 'Dual') &&
        !currentBar.some(s => s.comboChainStep === 'Lead');
      const needsOffhand = currentBar.some(s => s.comboChainStep === 'Dual') &&
        !currentBar.some(s => s.comboChainStep === 'Offhand');
      const needsEnchantment = currentBar.some(s => s.isTeardown) &&
        !currentBar.some(s => s.isFlashEnchantment || s.type === 'Enchantment');

      let picked: Gw1Skill;

      if (needsPetEnabler) {
        const enablerCandidate = candidates.find(c => c.isPetEnabler);
        picked = enablerCandidate ?? pickRandom(candidates);
      } else if (needsOffhand) {
        const offhandCandidate = candidates.find(c => c.comboChainStep === 'Offhand');
        picked = offhandCandidate ?? pickRandom(candidates);
      } else if (needsLead) {
        const leadCandidate = candidates.find(c => c.comboChainStep === 'Lead');
        picked = leadCandidate ?? pickRandom(candidates);
      } else if (needsEnchantment) {
        const enchCandidate = candidates.find(c => c.isFlashEnchantment || c.type === 'Enchantment');
        picked = enchCandidate ?? pickRandom(candidates);
      } else if (!hasElite && options.lockedEliteId !== 'none' && remainingSlots <= 2) {
        // Encourage picking an elite before running out of slots
        const eliteCandidate = candidates.find(c => c.isElite);
        picked = eliteCandidate ?? pickRandom(candidates);
      } else {
        picked = pickRandom(candidates);
      }

      currentBar.push(picked);
    }

    if (success && currentBar.length === 8) {
      const validation = validateSkillBar(currentBar, sanityConfig, primaryProf, secProf);
      if (validation.valid) {
        finalSkills = currentBar;
      }
    }
  }

  // Fallback if max attempts exhausted under extreme constraints: fill safely from valid candidates
  if (!finalSkills) {
    const fallbackBar: Gw1Skill[] = slots.filter((s): s is Gw1Skill => s !== null);
    for (const skill of rawPool) {
      if (fallbackBar.length >= 8) break;
      if (!fallbackBar.some(s => s.id === skill.id) && (!skill.isElite || !fallbackBar.some(s => s.isElite))) {
        fallbackBar.push(skill);
      }
    }
    finalSkills = fallbackBar;
  }

  // Ensure exactly 8 skills (pad with first available skills if needed)
  while (finalSkills.length < 8) {
    const filler = rawPool.find(s => !finalSkills!.some(f => f.id === s.id));
    if (filler) finalSkills.push(filler);
    else break;
  }

  // Arrange into slots respecting locked positions
  const finalTuple: [Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill] = [
    finalSkills[0] as Gw1Skill,
    finalSkills[1] as Gw1Skill,
    finalSkills[2] as Gw1Skill,
    finalSkills[3] as Gw1Skill,
    finalSkills[4] as Gw1Skill,
    finalSkills[5] as Gw1Skill,
    finalSkills[6] as Gw1Skill,
    finalSkills[7] as Gw1Skill,
  ];

  // If specific slots were locked, ensure those skills stay in their locked slot index
  if (options.lockedSlots) {
    for (const lock of options.lockedSlots) {
      const lockedSkill = getSkillById(lock.skillId);
      if (lockedSkill && lock.index >= 0 && lock.index < 8) {
        // Find where lockedSkill is in finalTuple and swap
        const currIdx = finalTuple.findIndex(s => s.id === lockedSkill.id);
        if (currIdx !== -1 && currIdx !== lock.index) {
          const temp = finalTuple[lock.index] as Gw1Skill;
          finalTuple[lock.index] = finalTuple[currIdx] as Gw1Skill;
          finalTuple[currIdx] = temp;
        } else if (currIdx === -1) {
          finalTuple[lock.index] = lockedSkill;
        }
      }
    }
  }

  // 6. Allocate Attribute Points
  const allocationResult = allocateAttributePoints({
    primaryProfession: primaryProf,
    secondaryProfession: secProf,
    skills: finalTuple,
  });

  // 7. Format Template Data & Encode
  const skillIds: [number, number, number, number, number, number, number, number] = [
    finalTuple[0].id,
    finalTuple[1].id,
    finalTuple[2].id,
    finalTuple[3].id,
    finalTuple[4].id,
    finalTuple[5].id,
    finalTuple[6].id,
    finalTuple[7].id,
  ];

  const templateData: TemplateData = {
    primaryProfession: primaryProf,
    secondaryProfession: secProf,
    attributes: allocationResult.allocations.map(a => ({
      attributeId: a.attributeId,
      rank: a.rank,
    })),
    skills: skillIds,
  };

  const templateCode = encodeSkillTemplate(templateData);

  return {
    primaryProfession: primaryProf,
    secondaryProfession: secProf,
    skills: finalTuple,
    attributeAllocations: allocationResult.allocations,
    totalPointsUsed: allocationResult.totalPointsUsed,
    remainingPoints: allocationResult.remainingPoints,
    templateData,
    templateCode,
  };
}
