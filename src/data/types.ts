export type ProfessionId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
// 0: None, 1: Warrior, 2: Ranger, 3: Monk, 4: Necromancer, 5: Mesmer,
// 6: Elementalist, 7: Assassin, 8: Ritualist, 9: Paragon, 10: Dervish

export type CampaignId = 0 | 1 | 2 | 3 | 4;
// 0: Core, 1: Prophecies, 2: Factions, 3: Nightfall, 4: Eye of the North

export type AttributeId =
  | 0  // Fast Casting (Me)
  | 1  // Illusion Magic (Me)
  | 2  // Domination Magic (Me)
  | 3  // Inspiration Magic (Me)
  | 4  // Blood Magic (N)
  | 5  // Death Magic (N)
  | 6  // Soul Reaping (N)
  | 7  // Curses (N)
  | 8  // Air Magic (E)
  | 9  // Earth Magic (E)
  | 10 // Fire Magic (E)
  | 11 // Water Magic (E)
  | 12 // Energy Storage (E)
  | 13 // Healing Prayers (Mo)
  | 14 // Smiting Prayers (Mo)
  | 15 // Protection Prayers (Mo)
  | 16 // Divine Favor (Mo)
  | 17 // Strength (W)
  | 18 // Axe Mastery (W)
  | 19 // Hammer Mastery (W)
  | 20 // Swordsmanship (W)
  | 21 // Tactics (W)
  | 22 // Beast Mastery (R)
  | 23 // Expertise (R)
  | 24 // Wilderness Survival (R)
  | 25 // Marksmanship (R)
  | 29 // Dagger Mastery (A)
  | 30 // Deadly Arts (A)
  | 31 // Shadow Arts (A)
  | 32 // Communing (Rt)
  | 33 // Restoration Magic (Rt)
  | 34 // Channeling Magic (Rt)
  | 35 // Critical Strikes (A)
  | 36 // Spawning Power (Rt)
  | 37 // Spear Mastery (P)
  | 38 // Command (P)
  | 39 // Motivation (P)
  | 40 // Leadership (P)
  | 41 // Scythe Mastery (D)
  | 42 // Wind Prayers (D)
  | 43 // Earth Prayers (D)
  | 44; // Mysticism (D)

export type TitleAttributeId =
  | 'sunspear'
  | 'lightbringer'
  | 'kurzick'
  | 'luxon'
  | 'asura'
  | 'deldrimor'
  | 'ebon_vanguard'
  | 'norn';

export type WeaponRequirement =
  | 'Sword'
  | 'Axe'
  | 'Hammer'
  | 'Bow'
  | 'Spear'
  | 'Scythe'
  | 'Dagger'
  | 'Staff'
  | 'Wand';

export type ComboChainStep = 'Lead' | 'Offhand' | 'Dual';

export type SkillType =
  | 'Attack'
  | 'Spell'
  | 'Enchantment'
  | 'Hex'
  | 'Ward'
  | 'Well'
  | 'Stance'
  | 'Preparation'
  | 'Signet'
  | 'Shout'
  | 'Chant'
  | 'Echo'
  | 'Ritual'
  | 'ItemSpell'
  | 'WeaponSpell'
  | 'Trap'
  | 'Form'
  | 'Skill';

export type SkillTarget = 'Self' | 'Ally' | 'Enemy' | 'Touched' | 'Corpse' | 'Spirit' | 'Pet';

export interface Gw1Skill {
  id: number;
  name: string;
  profession: ProfessionId;
  attribute: AttributeId | null; // null for Common or PvE Title skills
  titleTrack?: TitleAttributeId;  // non-null for PvE Title skills
  campaign: CampaignId;
  isElite: boolean;
  isPvEOnly: boolean;
  type: SkillType;
  target?: SkillTarget;

  // Resource Costs & Timing
  energy: number;
  adrenaline?: number;    // 1-10 strikes
  activation: number;     // seconds (0 = instant / flash)
  recharge: number;       // seconds
  sacrifice?: number;     // % max health
  overcast?: number;      // energy exhaustion
  upkeep?: number;        // energy degeneration

  // Mechanical Sanity Flags
  weaponRequirement?: WeaponRequirement;
  comboChainStep?: 'Lead' | 'Offhand' | 'Dual';
  isPetEnabler?: boolean; // Charm Animal, Comfort Animal, Heal as One
  requiresPet?: boolean;  // Specific pet attacks/commands
  isTeardown?: boolean;   // Removes active enchantment
  isFlashEnchantment?: boolean; // Fast recharge <= 10s & self-targeted
  isForm?: boolean;       // Avatars / Transformations (max 1)
  isShieldSkill?: boolean;// Requires shield
  description: string;
  conciseDescription?: string;
  icon?: string;
}

export interface TemplateData {
  primaryProfession: ProfessionId;
  secondaryProfession: ProfessionId;
  attributes: Array<{ attributeId: AttributeId; rank: number }>;
  skills: [number, number, number, number, number, number, number, number];
}
