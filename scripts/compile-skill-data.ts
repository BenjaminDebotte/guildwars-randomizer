import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import type {
  Gw1Skill,
  SkillType,
  WeaponRequirement,
  ComboChainStep,
  TitleAttributeId,
} from '../src/data/types.js';

const require = createRequire(import.meta.url);
const { SkillLangEnglish, Type } = require('@buildwars/gw-skilldata');

const lang = new SkillLangEnglish();

function mapSkillType(typeId: number): SkillType {
  switch (typeId) {
    case Type.BOW_ATTACK:
    case Type.MELEE_ATTACK:
    case Type.AXE_ATTACK:
    case Type.LEAD_ATTACK:
    case Type.OFF_HAND_ATTACK:
    case Type.DUAL_ATTACK:
    case Type.HAMMER_ATTACK:
    case Type.SCYTHE_ATTACK:
    case Type.SWORD_ATTACK:
    case Type.PET_ATTACK:
    case Type.SPEAR_ATTACK:
    case Type.DAGGER_ATTACK:
    case Type.RANGED_ATTACK:
    case Type.ATTACK_SKILL:
      return 'Attack';
    case Type.CHANT:
      return 'Chant';
    case Type.ECHO:
      return 'Echo';
    case Type.FORM:
      return 'Form';
    case Type.PREPARATION:
      return 'Preparation';
    case Type.BINDING_RITUAL:
    case Type.NATURE_RITUAL:
    case Type.EBON_VANGUARD_RITUAL:
    case Type.RITUAL:
      return 'Ritual';
    case Type.SHOUT:
      return 'Shout';
    case Type.SIGNET:
    case Type.TOUCH_SIGNET:
      return 'Signet';
    case Type.SPELL:
    case Type.GLYPH:
    case Type.TOUCH_SPELL:
      return 'Spell';
    case Type.ENCHANTMENT_SPELL:
    case Type.FLASH_ENCHANTMENT_SPELL:
    case Type.DOUBLE_ENCHANTMENT:
    case Type.TOUCH_ENCHANTMENT_SPELL:
      return 'Enchantment';
    case Type.HEX_SPELL:
    case Type.TOUCH_HEX_SPELL:
      return 'Hex';
    case Type.ITEM_SPELL:
      return 'ItemSpell';
    case Type.WARD_SPELL:
      return 'Ward';
    case Type.WEAPON_SPELL:
      return 'WeaponSpell';
    case Type.WELL_SPELL:
      return 'Well';
    case Type.STANCE:
      return 'Stance';
    case Type.TRAP:
      return 'Trap';
    case Type.TOUCH_SKILL:
    case Type.SKILL:
    default:
      return 'Skill';
  }
}

function isAttackType(typeId: number): boolean {
  return (
    typeId === Type.BOW_ATTACK ||
    typeId === Type.MELEE_ATTACK ||
    typeId === Type.AXE_ATTACK ||
    typeId === Type.LEAD_ATTACK ||
    typeId === Type.OFF_HAND_ATTACK ||
    typeId === Type.DUAL_ATTACK ||
    typeId === Type.HAMMER_ATTACK ||
    typeId === Type.SCYTHE_ATTACK ||
    typeId === Type.SWORD_ATTACK ||
    typeId === Type.PET_ATTACK ||
    typeId === Type.SPEAR_ATTACK ||
    typeId === Type.DAGGER_ATTACK ||
    typeId === Type.RANGED_ATTACK ||
    typeId === Type.ATTACK_SKILL
  );
}

function detectWeaponRequirement(typeId: number, attributeId: number, desc: string): WeaponRequirement | undefined {
  if (typeId === Type.BOW_ATTACK || (attributeId === 25 && isAttackType(typeId))) return 'Bow';
  if (typeId === Type.AXE_ATTACK || (attributeId === 18 && isAttackType(typeId))) return 'Axe';
  if (typeId === Type.HAMMER_ATTACK || (attributeId === 19 && isAttackType(typeId))) return 'Hammer';
  if (typeId === Type.SCYTHE_ATTACK || (attributeId === 41 && isAttackType(typeId))) return 'Scythe';
  if (typeId === Type.SWORD_ATTACK || (attributeId === 20 && isAttackType(typeId))) return 'Sword';
  if (typeId === Type.SPEAR_ATTACK || (attributeId === 37 && isAttackType(typeId))) return 'Spear';
  if (
    typeId === Type.DAGGER_ATTACK ||
    typeId === Type.LEAD_ATTACK ||
    typeId === Type.OFF_HAND_ATTACK ||
    typeId === Type.DUAL_ATTACK ||
    (attributeId === 29 && isAttackType(typeId))
  ) {
    return 'Dagger';
  }
  if (/requires a bow|while wielding a bow/i.test(desc)) return 'Bow';
  if (/requires an axe|while wielding an axe/i.test(desc)) return 'Axe';
  if (/requires a hammer|while wielding a hammer/i.test(desc)) return 'Hammer';
  if (/requires a scythe|while wielding a scythe/i.test(desc)) return 'Scythe';
  if (/requires a sword|while wielding a sword/i.test(desc)) return 'Sword';
  if (/requires a spear|while wielding a spear/i.test(desc)) return 'Spear';
  if (/requires daggers|while wielding daggers/i.test(desc)) return 'Dagger';
  return undefined;
}

function detectComboStep(typeId: number): ComboChainStep | undefined {
  if (typeId === Type.LEAD_ATTACK) return 'Lead';
  if (typeId === Type.OFF_HAND_ATTACK) return 'Offhand';
  if (typeId === Type.DUAL_ATTACK) return 'Dual';
  return undefined;
}

function mapTitleTrack(attributeId: number): TitleAttributeId | undefined {
  switch (attributeId) {
    case 102: return 'sunspear';
    case 103: return 'lightbringer';
    case 104: return 'luxon';
    case 105: return 'kurzick';
    case 106: return 'asura';
    case 107: return 'deldrimor';
    case 108: return 'ebon_vanguard';
    case 109: return 'norn';
    default: return undefined;
  }
}

const NORN_BLESSINGS = new Set(['Ursan Blessing', 'Volfen Blessing', 'Raven Blessing']);

const PET_COMMAND_NAMES = new Set([
  'Revive Animal',
  'Call of Haste',
  'Feral Aggression',
  'Predatory Bond',
  'Enrage',
]);

const PET_ENABLER_NAMES = new Set([
  'Charm Animal',
  'Comfort Animal',
  'Heal as One',
]);

const skills: Gw1Skill[] = [];

for (let i = 1; i <= 4000; i++) {
  try {
    const raw = lang.get(i, false);
    if (!raw || !raw.id) continue;
    const a = raw.toArray();
    if (a.id !== i) continue; // Ensure canonical ID

    const typeId: number = a.type;
    const desc: string = a.description || '';
    const name: string = a.name;

    const isForm =
      typeId === Type.FORM ||
      name.startsWith('Avatar of ') ||
      NORN_BLESSINGS.has(name) ||
      /transformed into/i.test(desc);

    const isTeardown =
      a.profession === 10 &&
      !isForm &&
      !/from target foe|from foes|from knocked-down foes|whenever you lose/i.test(desc) &&
      /(lose|remove|removes)\s+(1\s+|a\s+|one\s+of\s+your\s+)?(Dervish\s+)?enchantment/i.test(desc);

    const isFlashEnchantment =
      typeId === Type.FLASH_ENCHANTMENT_SPELL ||
      (a.activation === 0 && a.recharge <= 10 && mapSkillType(typeId) === 'Enchantment');

    const isShieldSkill =
      /while wielding a shield|requires a shield/i.test(desc) ||
      name === 'Shield Stance';

    const requiresPet =
      typeId === Type.PET_ATTACK ||
      PET_COMMAND_NAMES.has(name) ||
      /commands your pet|your animal companion attacks/i.test(desc);

    const isPetEnabler = PET_ENABLER_NAMES.has(name);

    const isPvEOnly = Boolean(
      a.is_rp ||
      (a.attribute >= 102 && a.attribute <= 109) ||
      a.profession === 0 && a.id !== 2 // Resurrection Signet is PvP legal
    );

    const skill: Gw1Skill = {
      id: a.id,
      name: a.name,
      profession: a.profession,
      attribute: a.attribute <= 44 ? a.attribute : null,
      campaign: a.campaign,
      isElite: Boolean(a.is_elite),
      isPvEOnly,
      type: mapSkillType(typeId),
      energy: a.energy || 0,
      activation: a.activation || 0,
      recharge: a.recharge || 0,
      description: a.description || '',
    };

    const titleTrack = mapTitleTrack(a.attribute);
    if (titleTrack) skill.titleTrack = titleTrack;

    if (a.adrenaline > 0) skill.adrenaline = a.adrenaline;
    if (a.sacrifice > 0) skill.sacrifice = a.sacrifice;
    if (a.overcast > 0) skill.overcast = a.overcast;
    if (a.upkeep !== 0) skill.upkeep = a.upkeep;

    const weapon = detectWeaponRequirement(typeId, a.attribute, desc);
    if (weapon) skill.weaponRequirement = weapon;

    const combo = detectComboStep(typeId);
    if (combo) skill.comboChainStep = combo;

    if (isPetEnabler) skill.isPetEnabler = true;
    if (requiresPet) skill.requiresPet = true;
    if (isTeardown) skill.isTeardown = true;
    if (isFlashEnchantment) skill.isFlashEnchantment = true;
    if (isForm) skill.isForm = true;
    if (isShieldSkill) skill.isShieldSkill = true;

    if (a.concise) skill.conciseDescription = a.concise;

    skills.push(skill);
  } catch (_e) {
    // ID does not exist in dataset
  }
}

// Sort deterministically by ID
skills.sort((a, b) => a.id - b.id);

const outputPath = path.resolve('src/data/skills.json');
fs.writeFileSync(outputPath, JSON.stringify(skills, null, 2), 'utf-8');

console.log(`Successfully compiled ${skills.length} skills to ${outputPath}`);
