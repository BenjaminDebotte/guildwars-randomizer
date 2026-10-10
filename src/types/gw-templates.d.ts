declare module '@buildwars/gw-templates' {
  export class SkillTemplate {
    decode(code: string): {
      code: string;
      prof_pri: number;
      prof_sec: number;
      attributes: Record<string, number>;
      skills: number[];
    };
    encode(
      profPri: number,
      profSec: number,
      attributes: Record<string, number>,
      skills: number[]
    ): string;
  }
}
