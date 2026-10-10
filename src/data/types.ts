export enum Profession {
  None = 0,
  Warrior = 1,
  Ranger = 2,
  Monk = 3,
  Necromancer = 4,
  Mesmer = 5,
  Elementalist = 6,
  Assassin = 7,
  Ritualist = 8,
  Paragon = 9,
  Dervish = 10,
}

export type ProfessionId = Profession;

export enum Campaign {
  Core = 0,
  Prophecies = 1,
  Factions = 2,
  Nightfall = 3,
  EyeOfTheNorth = 4,
}

export type CampaignId = Campaign;

export enum Attribute {
  FastCasting = 0,
  IllusionMagic = 1,
  DominationMagic = 2,
  InspirationMagic = 3,
  BloodMagic = 4,
  DeathMagic = 5,
  SoulReaping = 6,
  Curses = 7,
  AirMagic = 8,
  EarthMagic = 9,
  FireMagic = 10,
  WaterMagic = 11,
  EnergyStorage = 12,
  HealingPrayers = 13,
  SmitingPrayers = 14,
  ProtectionPrayers = 15,
  DivineFavor = 16,
  Strength = 17,
  AxeMastery = 18,
  HammerMastery = 19,
  Swordsmanship = 20,
  Tactics = 21,
  BeastMastery = 22,
  Expertise = 23,
  WildernessSurvival = 24,
  Marksmanship = 25,
  DaggerMastery = 29,
  DeadlyArts = 30,
  ShadowArts = 31,
  Communing = 32,
  RestorationMagic = 33,
  ChannelingMagic = 34,
  CriticalStrikes = 35,
  SpawningPower = 36,
  SpearMastery = 37,
  Command = 38,
  Motivation = 39,
  Leadership = 40,
  ScytheMastery = 41,
  WindPrayers = 42,
  EarthPrayers = 43,
  Mysticism = 44,
}

export type AttributeId = Attribute;

export enum TemplateType {
  Skill = 14, // 0xE
}

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
  profession: Profession;
  attribute: Attribute | null; // null for Common or PvE Title skills
  titleTrack?: TitleAttributeId; // non-null for PvE Title skills
  campaign: Campaign;
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
  primaryProfession: Profession;
  secondaryProfession: Profession;
  attributes: Array<{ attributeId: Attribute; rank: number }>;
  skills: [number, number, number, number, number, number, number, number];
}
