import rawSkills from './skills.json';
import { Campaign, Gw1Skill, Profession } from './types';

export const SKILLS: Gw1Skill[] = rawSkills as Gw1Skill[];

export const SKILL_BY_ID = new Map<number, Gw1Skill>(
  SKILLS.map(skill => [skill.id, skill])
);

export function getSkillById(id: number): Gw1Skill | undefined {
  return SKILL_BY_ID.get(id);
}

export function createFallbackSkill(id: number): Gw1Skill {
  return {
    id,
    name: id === 0 ? 'Empty Slot' : `Unknown Skill (${id})`,
    profession: Profession.None,
    attribute: null,
    campaign: Campaign.Core,
    isElite: false,
    isPvEOnly: false,
    type: 'Skill',
    energy: 0,
    activation: 0,
    recharge: 0,
    description: '',
  };
}

export function resolveTemplateSkills(skillIds: number[]): Gw1Skill[] {
  return skillIds.map(id => getSkillById(id) ?? createFallbackSkill(id));
}

export function getAvailableSkills(options: {
  primaryProfession: Profession;
  secondaryProfession?: Profession;
  campaigns?: number[];
  includePvE?: boolean;
}): Gw1Skill[] {
  const { primaryProfession, secondaryProfession = Profession.None, campaigns, includePvE = true } = options;

  return SKILLS.filter(skill => {
    // Campaign filtering
    if (campaigns && campaigns.length > 0 && !campaigns.includes(skill.campaign)) {
      return false;
    }

    // PvE skill filtering
    if (!includePvE && skill.isPvEOnly) {
      return false;
    }

    // Profession eligibility:
    // Can equip Primary profession skills, Secondary profession skills, or Common skills
    if (skill.profession === primaryProfession) return true;
    if (secondaryProfession !== Profession.None && skill.profession === secondaryProfession) return true;
    if (skill.profession === Profession.None) return true;

    return false;
  });
}
