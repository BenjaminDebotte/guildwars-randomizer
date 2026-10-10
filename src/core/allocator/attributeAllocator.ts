import { AttributeId, ProfessionId, Gw1Skill } from '../../data/types';
import {
  MAX_ATTRIBUTE_POINTS,
  MAX_ATTRIBUTE_RANK,
  getCumulativeCost,
  getIncrementalCost,
  ATTRIBUTES,
} from '../../data/attributes';
import { PROFESSIONS } from '../../data/professions';

export interface AttributeAllocation {
  attributeId: AttributeId;
  rank: number;
  cost: number;
}

export interface AllocationResult {
  allocations: AttributeAllocation[];
  totalPointsUsed: number;
  remainingPoints: number;
}

export interface AllocateOptions {
  primaryProfession: ProfessionId;
  secondaryProfession?: ProfessionId;
  skills: Gw1Skill[];
}

const DEFAULT_UTILITY_ATTRIBUTES: Record<ProfessionId, AttributeId> = {
  0: 0,
  1: 21,  // Warrior -> Tactics
  2: 24,  // Ranger -> Wilderness Survival
  3: 15,  // Monk -> Protection Prayers
  4: 7,   // Necromancer -> Curses
  5: 3,   // Mesmer -> Inspiration Magic
  6: 8,   // Elementalist -> Air Magic (distinct from primary Energy Storage 12)
  7: 31,  // Assassin -> Shadow Arts
  8: 32,  // Ritualist -> Communing
  9: 38,  // Paragon -> Command
  10: 43, // Dervish -> Earth Prayers
};

/**
 * Optimizes the 200 Attribute Point budget based on the 8 slotted skills.
 */
export function allocateAttributePoints(options: AllocateOptions): AllocationResult {
  const { primaryProfession, secondaryProfession = 0, skills } = options;

  const primaryProfInfo = PROFESSIONS[primaryProfession];
  const secondaryProfInfo = PROFESSIONS[secondaryProfession];
  const primaryAttributeId = primaryProfInfo?.primaryAttributeId ?? null;
  const secondaryPrimaryAttrId = secondaryProfInfo?.primaryAttributeId ?? null;

  // 1. Count skill frequency per attribute (ignoring null or title tracks or secondary primary)
  const attributeCounts = new Map<AttributeId, number>();

  for (const skill of skills) {
    if (skill.attribute === null || skill.attribute === undefined) continue;
    const attrId = skill.attribute;

    // Hard engine rule: secondary profession's primary attribute cannot receive points
    if (attrId === secondaryPrimaryAttrId && secondaryProfession !== primaryProfession) {
      continue;
    }

    // Must be a valid profession attribute
    if (ATTRIBUTES[attrId]) {
      attributeCounts.set(attrId, (attributeCounts.get(attrId) || 0) + 1);
    }
  }

  // 2. Select attributes that will receive investment
  const activeEntries = Array.from(attributeCounts.entries()).sort((a, b) => {
    // Sort by: skill count DESC, is primary attribute DESC, attributeId ASC
    if (b[1] !== a[1]) return b[1] - a[1];
    if (a[0] === primaryAttributeId) return -1;
    if (b[0] === primaryAttributeId) return 1;
    return a[0] - b[0];
  });

  const activeAttrIds = activeEntries.map(e => e[0]);

  // Ensure fallback attributes if fewer than 2 active attributes
  if (!activeAttrIds.includes(primaryAttributeId as AttributeId) && primaryAttributeId !== null) {
    activeAttrIds.push(primaryAttributeId);
  }

  const defaultUtility = DEFAULT_UTILITY_ATTRIBUTES[primaryProfession];
  if (activeAttrIds.length < 2 && defaultUtility && !activeAttrIds.includes(defaultUtility)) {
    activeAttrIds.push(defaultUtility);
  }

  // 3. Determine rank allocation strategy
  const ranks = new Map<AttributeId, number>();
  for (const id of activeAttrIds) {
    ranks.set(id, 0);
  }

  let remainingBudget = MAX_ATTRIBUTE_POINTS;

  // Standard GW1 discrete profile matching for N <= 3 attributes:
  const attr1 = activeAttrIds[0];
  const attr2 = activeAttrIds[1];
  const attr3 = activeAttrIds[2];

  const count1 = attributeCounts.get(attr1 ?? -1 as AttributeId) || 0;
  const count2 = attributeCounts.get(attr2 ?? -1 as AttributeId) || 0;
  const count3 = attributeCounts.get(attr3 ?? -1 as AttributeId) || 0;

  if (activeAttrIds.length === 2 && attr1 !== undefined && attr2 !== undefined) {
    // 12 / 12 spread (97 + 97 = 194 pts, leaves 6 pts)
    ranks.set(attr1, 12);
    ranks.set(attr2, 12);
    remainingBudget -= (97 + 97);

    // If 6 points remain, buy rank 3 (costs 6 pts) on a 3rd utility attribute
    const fallback3rd = Object.values(ATTRIBUTES).find(
      a => a.professionId === primaryProfession && !ranks.has(a.id)
    )?.id;
    if (fallback3rd !== undefined) {
      ranks.set(fallback3rd, 3);
      remainingBudget -= 6;
    }
  } else if (activeAttrIds.length === 3 && attr1 !== undefined && attr2 !== undefined && attr3 !== undefined) {
    // Choose between 12/10/8 (195 pts) and 12/9/9 (193 pts)
    if (count1 >= 4 && count2 >= 2 && count3 <= 1) {
      // 12 / 10 / 8 spread: 97 + 61 + 37 = 195 pts (leaves 5 pts)
      ranks.set(attr1, 12);
      ranks.set(attr2, 10);
      ranks.set(attr3, 8);
      remainingBudget -= 195;

      // Residual 5 points: can afford rank 2 (3 pts) on 4th attribute if available
      const attr4 = activeAttrIds[3] ?? (primaryAttributeId && !ranks.has(primaryAttributeId) ? primaryAttributeId : undefined);
      if (attr4 && remainingBudget >= 3) {
        ranks.set(attr4, 2);
        remainingBudget -= 3;
      }
    } else {
      // 12 / 9 / 9 spread: 97 + 48 + 48 = 193 pts (leaves 7 pts)
      ranks.set(attr1, 12);
      ranks.set(attr2, 9);
      ranks.set(attr3, 9);
      remainingBudget -= 193;

      // Residual 7 points: can afford rank 3 (6 pts) on 4th attribute if available
      const attr4 = activeAttrIds[3] ?? (primaryAttributeId && !ranks.has(primaryAttributeId) ? primaryAttributeId : undefined);
      if (attr4 && remainingBudget >= 6) {
        ranks.set(attr4, 3);
        remainingBudget -= 6;
      }
    }
  } else {
    // General greedy fallback for 1 or 4+ attributes
    // Start with rank 0 on all, greedily increment highest priority attribute that can be afforded
    let improved = true;
    while (improved && remainingBudget > 0) {
      improved = false;
      for (const id of activeAttrIds) {
        const currentRank = ranks.get(id) || 0;
        if (currentRank < MAX_ATTRIBUTE_RANK) {
          const nextCost = getIncrementalCost(currentRank + 1);
          if (nextCost <= remainingBudget) {
            ranks.set(id, currentRank + 1);
            remainingBudget -= nextCost;
            improved = true;
          }
        }
      }
    }
  }

  // 4. Build result
  const allocations: AttributeAllocation[] = [];
  let totalPointsUsed = 0;

  for (const [attributeId, rank] of ranks.entries()) {
    if (rank > 0) {
      const cost = getCumulativeCost(rank);
      totalPointsUsed += cost;
      allocations.push({ attributeId, rank, cost });
    }
  }

  // Sort allocations descending by rank
  allocations.sort((a, b) => b.rank - a.rank);

  return {
    allocations,
    totalPointsUsed,
    remainingPoints: MAX_ATTRIBUTE_POINTS - totalPointsUsed,
  };
}
