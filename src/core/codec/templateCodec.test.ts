import { describe, it, expect } from 'vitest';
import { encodeSkillTemplate, decodeSkillTemplate } from './templateCodec';
import { TemplateData } from '../../data/types';
import { SkillTemplate } from '@buildwars/gw-templates';

describe('Skill Template Codec', () => {
  it('decodes the official wiki Assassin template accurately', () => {
    // Official wiki sample code
    const code = 'OwFj0xfzITOMMMHMie4O0kxZ6PA';
    const decoded = decodeSkillTemplate(code);

    expect(decoded.primaryProfession).toBe(7);   // Assassin
    expect(decoded.secondaryProfession).toBe(1); // Warrior
    expect(decoded.skills).toEqual([782, 780, 775, 1954, 952, 2356, 1649, 1018]);

    // Check attributes: Dagger Mastery 12 (id 29), Shadow Arts 3 (id 31), Critical Strikes 12 (id 35)
    const attrMap = Object.fromEntries(decoded.attributes.map(a => [a.attributeId, a.rank]));
    expect(attrMap[29]).toBe(12);
    expect(attrMap[31]).toBe(3);
    expect(attrMap[35]).toBe(12);
  });

  it('performs flawless round-trip encoding and decoding', () => {
    const original: TemplateData = {
      primaryProfession: 1, // Warrior
      secondaryProfession: 6, // Elementalist
      attributes: [
        { attributeId: 17, rank: 12 }, // Strength
        { attributeId: 20, rank: 10 }, // Swordsmanship
        { attributeId: 21, rank: 8 },  // Tactics
      ],
      skills: [378, 381, 382, 383, 384, 385, 386, 387],
    };

    const encoded = encodeSkillTemplate(original);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeSkillTemplate(encoded);
    expect(decoded.primaryProfession).toBe(original.primaryProfession);
    expect(decoded.secondaryProfession).toBe(original.secondaryProfession);
    expect(decoded.skills).toEqual(original.skills);

    const decodedAttrMap = Object.fromEntries(decoded.attributes.map(a => [a.attributeId, a.rank]));
    expect(decodedAttrMap[17]).toBe(12);
    expect(decodedAttrMap[20]).toBe(10);
    expect(decodedAttrMap[21]).toBe(8);
  });

  it('handles mono-profession and empty skill slots', () => {
    const data: TemplateData = {
      primaryProfession: 4, // Necromancer
      secondaryProfession: 0, // None
      attributes: [
        { attributeId: 6, rank: 12 }, // Soul Reaping
        { attributeId: 5, rank: 12 }, // Death Magic
      ],
      skills: [100, 101, 102, 0, 0, 0, 0, 0], // Partial skill bar
    };

    const encoded = encodeSkillTemplate(data);
    const decoded = decodeSkillTemplate(encoded);

    expect(decoded.primaryProfession).toBe(4);
    expect(decoded.secondaryProfession).toBe(0);
    expect(decoded.skills).toEqual(data.skills);
  });

  it('matches @buildwars/gw-templates decoding across multiple builds', () => {
    const bw = new SkillTemplate();
    const codes = [
      'OwFj0xfzITOMMMHMie4O0kxZ6PA',
      'OAhjYgH4ITOPWT5m8qX48A',
      'OQcUEd3n56K42j+0a0z04A',
    ];

    for (const code of codes) {
      const ourDecoded = decodeSkillTemplate(code);
      const bwDecoded = bw.decode(code);

      expect(ourDecoded.primaryProfession).toBe(bwDecoded.prof_pri);
      expect(ourDecoded.secondaryProfession).toBe(bwDecoded.prof_sec);
      expect(ourDecoded.skills).toEqual(bwDecoded.skills);

      const ourAttrMap = Object.fromEntries(ourDecoded.attributes.map(a => [a.attributeId, a.rank]));
      for (const [attrId, rank] of Object.entries(bwDecoded.attributes)) {
        expect(ourAttrMap[Number(attrId)]).toBe(rank);
      }
    }
  });

  it('omits rank 0 attributes from serialized bitstream', () => {
    const dataWithZeros: TemplateData = {
      primaryProfession: 2,
      secondaryProfession: 3,
      attributes: [
        { attributeId: 23, rank: 12 },
        { attributeId: 24, rank: 0 }, // Should be omitted
        { attributeId: 25, rank: 10 },
      ],
      skills: [411, 412, 413, 414, 415, 416, 417, 418],
    };

    const encoded = encodeSkillTemplate(dataWithZeros);
    const decoded = decodeSkillTemplate(encoded);

    expect(decoded.attributes.length).toBe(2);
    expect(decoded.attributes.find(a => a.attributeId === 24)).toBeUndefined();
  });
});
