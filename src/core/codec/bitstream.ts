const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const BASE64_LOOKUP: Record<string, number> = {};
for (let i = 0; i < BASE64_ALPHABET.length; i++) {
  BASE64_LOOKUP[BASE64_ALPHABET[i]] = i;
}

/**
 * BitStreamWriter writes arbitrary bit-width integers in lowest-bit-first (LSB) order
 * and encodes the resulting bits into standard RFC 4648 Base64.
 */
export class BitStreamWriter {
  private bits: number[] = [];

  /**
   * Write an integer value using the specified number of bits (LSB first).
   */
  writeBits(value: number, bitCount: number): void {
    for (let i = 0; i < bitCount; i++) {
      this.bits.push((value >> i) & 1);
    }
  }

  /**
   * Convert the accumulated bits into a Base64 string.
   * If the bit count is not a multiple of 6, trailing bits in the last character are 0.
   */
  toBase64(): string {
    let result = '';
    const totalBits = this.bits.length;

    for (let i = 0; i < totalBits; i += 6) {
      let charVal = 0;
      for (let b = 0; b < 6; b++) {
        const bit = this.bits[i + b] ?? 0;
        charVal |= bit << b;
      }
      result += BASE64_ALPHABET[charVal];
    }

    return result;
  }

  get length(): number {
    return this.bits.length;
  }
}

/**
 * BitStreamReader decodes a Base64 string into bits and reads arbitrary bit-width
 * integers in lowest-bit-first (LSB) order.
 */
export class BitStreamReader {
  private bits: number[] = [];
  private position = 0;

  constructor(base64Str: string) {
    let candidate = base64Str.trim();
    // If enclosed in brackets like [Skill template code: XYZ], extract the template code
    const bracketMatch = candidate.match(/\[.*?(?:code:\s*)?([A-Za-z0-9+/=]{10,})\s*\]/is);
    if (bracketMatch && bracketMatch[1]) {
      candidate = bracketMatch[1];
    }
    const cleanStr = candidate.replace(/[^A-Za-z0-9+/]/g, '');

    for (let i = 0; i < cleanStr.length; i++) {
      const char = cleanStr[i];
      const charVal = BASE64_LOOKUP[char];
      if (charVal === undefined) {
        throw new Error(`Invalid Base64 character in template: '${char}'`);
      }
      for (let b = 0; b < 6; b++) {
        this.bits.push((charVal >> b) & 1);
      }
    }
  }

  /**
   * Read an integer value of bitCount bits (LSB first).
   * If the stream is exhausted (e.g. trailing zero-padded skills), returns 0 for missing bits.
   */
  readBits(bitCount: number): number {
    let value = 0;
    for (let i = 0; i < bitCount; i++) {
      const bit = this.position < this.bits.length ? this.bits[this.position++] : 0;
      value |= bit << i;
    }
    return value;
  }

  /**
   * Peek remaining bits count.
   */
  remainingBits(): number {
    return Math.max(0, this.bits.length - this.position);
  }

  get bitPosition(): number {
    return this.position;
  }
}
