import { describe, it, expect } from 'vitest';
import { BitStreamWriter, BitStreamReader } from './bitstream';

describe('BitStreamWriter and BitStreamReader', () => {
  it('encodes and decodes arbitrary bit widths with LSB-first ordering', () => {
    const writer = new BitStreamWriter();

    // Write header: 4 bits 14 (0b1110), 4 bits 0 (0b0000)
    writer.writeBits(14, 4);
    writer.writeBits(0, 4);

    // Write 2 bits: 0
    writer.writeBits(0, 2);

    // Write 4 bits: 1 (Warrior), 4 bits: 2 (Ranger)
    writer.writeBits(1, 4);
    writer.writeBits(2, 4);

    // Write 1 bit tail: 0
    writer.writeBits(0, 1);

    const b64 = writer.toBase64();
    expect(typeof b64).toBe('string');
    expect(b64.length).toBeGreaterThan(0);

    const reader = new BitStreamReader(b64);
    expect(reader.readBits(4)).toBe(14);
    expect(reader.readBits(4)).toBe(0);
    expect(reader.readBits(2)).toBe(0);
    expect(reader.readBits(4)).toBe(1);
    expect(reader.readBits(4)).toBe(2);
    expect(reader.readBits(1)).toBe(0);
  });

  it('correctly handles multi-byte numbers up to 16 bits', () => {
    const writer = new BitStreamWriter();
    writer.writeBits(1329, 11);
    writer.writeBits(3264, 12);
    writer.writeBits(45, 6);

    const b64 = writer.toBase64();
    const reader = new BitStreamReader(b64);

    expect(reader.readBits(11)).toBe(1329);
    expect(reader.readBits(12)).toBe(3264);
    expect(reader.readBits(6)).toBe(45);
  });

  it('ignores whitespace and surrounding characters when reading', () => {
    // Generate a valid template-length string
    const writer = new BitStreamWriter();
    writer.writeBits(14, 4);
    writer.writeBits(0, 4);
    writer.writeBits(0, 2);
    writer.writeBits(1, 4);
    writer.writeBits(2, 4);
    writer.writeBits(0, 4);
    writer.writeBits(0, 4);
    writer.writeBits(0, 4);
    for (let i = 0; i < 8; i++) writer.writeBits(100, 8);
    writer.writeBits(0, 1);
    const cleanB64 = writer.toBase64();

    const dirtyB64 = `  [Skill Template Code: ${cleanB64}\n]  `;
    const reader = new BitStreamReader(dirtyB64);

    expect(reader.readBits(4)).toBe(14);
    expect(reader.readBits(4)).toBe(0);
    expect(reader.readBits(2)).toBe(0);
    expect(reader.readBits(4)).toBe(1);
    expect(reader.readBits(4)).toBe(2);
  });
});
