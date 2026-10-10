import { ProfessionId, Gw1Skill, TemplateData } from '../../data/types';
import { AttributeAllocation } from '../allocator/attributeAllocator';
import { SanityConfig } from './constraints';

export interface RandomizerOptions {
  primaryProfession?: ProfessionId | 'random';
  secondaryProfession?: ProfessionId | 'random' | 'none';
  lockedSlots?: Array<{ index: number; skillId: number }>;
  lockedEliteId?: number | 'none';
  campaigns?: number[];
  includePvE?: boolean;
  sanityConfig?: SanityConfig;
}

export interface GeneratedBuild {
  primaryProfession: ProfessionId;
  secondaryProfession: ProfessionId;
  skills: [Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill];
  attributeAllocations: AttributeAllocation[];
  totalPointsUsed: number;
  remainingPoints: number;
  templateData: TemplateData;
  templateCode: string;
}
