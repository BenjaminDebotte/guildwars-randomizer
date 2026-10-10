import { Profession, Gw1Skill, TemplateData } from '../../data/types';
import { AttributeAllocation } from '../allocator/attributeAllocator';
import { SanityConfig } from './constraints';

export interface RandomizerOptions {
  primaryProfession?: Profession | 'random';
  secondaryProfession?: Profession | 'random' | 'none';
  lockedSlots?: Array<{ index: number; skillId: number }>;
  lockedEliteId?: number | 'none';
  campaigns?: number[];
  includePvE?: boolean;
  sanityConfig?: SanityConfig;
}

export interface GeneratedBuild {
  primaryProfession: Profession;
  secondaryProfession: Profession;
  skills: [Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill];
  attributeAllocations: AttributeAllocation[];
  totalPointsUsed: number;
  remainingPoints: number;
  templateData: TemplateData;
  templateCode: string;
}
