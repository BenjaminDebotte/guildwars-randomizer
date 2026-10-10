import rawSkills from './skills.json';
import { Gw1Skill, ProfessionId } from './types';

export const SKILLS: Gw1Skill[] = rawSkills as Gw1Skill[];

export const SKILL_BY_ID = new Map<number, Gw1Skill>(
  SKILLS.map(skill => [skill.id, skill])
);

export function getSkillById(id: number): Gw1Skill | undefined {
  return SKILL_BY_ID.get(id);
}

export function getAvailableSkills(options: {
  primaryProfession: ProfessionId;
  secondaryProfession?: ProfessionId;
  campaigns?: number[];
  includePvE?: boolean;
}): Gw1Skill[] {
  const { primaryProfession, secondaryProfession = 0, campaigns, includePvE = true } = options;

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
    // Can equip Primary profession skills, Secondary profession skills, or Common (profession 0) skills
    if (skill.profession === primaryProfession) return true;
    if (secondaryProfession !== 0 && skill.profession === secondaryProfession) return true;
    if (skill.profession === 0) return true;

    return false;
  });
}
