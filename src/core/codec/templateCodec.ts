import { BitStreamWriter, BitStreamReader } from './bitstream';
import { ProfessionId, AttributeId, TemplateData } from '../../data/types';

/**
 * Encodes TemplateData into an official Guild Wars 1 Base64 skill template string.
 */
export function encodeSkillTemplate(data: TemplateData): string {
  const writer = new BitStreamWriter();

  // 1. Header: 4 bits template type (14 = 0xE), 4 bits version (0)
  writer.writeBits(14, 4);
  writer.writeBits(0, 4);

  // 2. Professions
  // 2 bits pCode controlling bits_per_prof = 2 * pCode + 4
  const maxProf = Math.max(data.primaryProfession, data.secondaryProfession);
  let pCode = 0;
  if (maxProf >= 16) {
    pCode = Math.ceil((Math.ceil(Math.log2(maxProf + 1)) - 4) / 2);
  }
  const bitsPerProf = 2 * pCode + 4;
  writer.writeBits(pCode, 2);
  writer.writeBits(data.primaryProfession, bitsPerProf);
  writer.writeBits(data.secondaryProfession, bitsPerProf);

  // 3. Attributes
  // Only non-zero attributes are encoded to save bits and adhere to the spec
  const activeAttributes = data.attributes.filter(a => a.rank > 0);
  const maxAttrId = activeAttributes.length > 0
    ? Math.max(...activeAttributes.map(a => a.attributeId))
    : 0;

  // 4 bits attribute count
  writer.writeBits(activeAttributes.length, 4);

  // 4 bits aCode controlling bits_per_attr = aCode + 4
  const bitsPerAttrNeeded = maxAttrId > 0 ? Math.ceil(Math.log2(maxAttrId + 1)) : 4;
  const aCode = Math.max(0, Math.max(4, bitsPerAttrNeeded) - 4);
  const bitsPerAttr = aCode + 4;
  writer.writeBits(aCode, 4);

  for (const attr of activeAttributes) {
    writer.writeBits(attr.attributeId, bitsPerAttr);
    writer.writeBits(attr.rank, 4);
  }

  // 4. Skills (8 skills)
  const maxSkillId = Math.max(...data.skills, 0);
  const bitsPerSkillNeeded = maxSkillId > 0 ? Math.ceil(Math.log2(maxSkillId + 1)) : 8;
  const sCode = Math.max(0, Math.max(8, bitsPerSkillNeeded) - 8);
  const bitsPerSkill = sCode + 8;
  writer.writeBits(sCode, 4);

  for (let i = 0; i < 8; i++) {
    const skillId = data.skills[i] ?? 0;
    writer.writeBits(skillId, bitsPerSkill);
  }

  // 5. Tail: 1 bit 0
  writer.writeBits(0, 1);

  return writer.toBase64();
}

/**
 * Decodes an official Guild Wars 1 Base64 skill template string into TemplateData.
 */
export function decodeSkillTemplate(code: string): TemplateData {
  const reader = new BitStreamReader(code);

  // 1. Header
  const templateType = reader.readBits(4);
  if (templateType !== 14) {
    throw new Error(`Unsupported template type: ${templateType}. Expected 14 (0xE).`);
  }
  const version = reader.readBits(4);
  if (version !== 0) {
    throw new Error(`Unsupported template version: ${version}. Expected 0.`);
  }

  // 2. Professions
  const pCode = reader.readBits(2);
  const bitsPerProf = 2 * pCode + 4;
  const primaryProfession = reader.readBits(bitsPerProf) as ProfessionId;
  const secondaryProfession = reader.readBits(bitsPerProf) as ProfessionId;

  // 3. Attributes
  const attributeCount = reader.readBits(4);
  const aCode = reader.readBits(4);
  const bitsPerAttr = aCode + 4;

  const attributes: Array<{ attributeId: AttributeId; rank: number }> = [];
  for (let i = 0; i < attributeCount; i++) {
    const attributeId = reader.readBits(bitsPerAttr) as AttributeId;
    const rank = reader.readBits(4);
    attributes.push({ attributeId, rank });
  }

  // 4. Skills
  const sCode = reader.readBits(4);
  const bitsPerSkill = sCode + 8;

  const skills: [number, number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 8; i++) {
    skills[i] = reader.readBits(bitsPerSkill);
  }

  return {
    primaryProfession,
    secondaryProfession,
    attributes,
    skills,
  };
}
