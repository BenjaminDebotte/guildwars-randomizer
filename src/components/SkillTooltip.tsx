import { Gw1Skill, Campaign } from '../data/types';
import { getAttribute } from '../data/attributes';
import { getProfession } from '../data/professions';

interface SkillTooltipProps {
  skill: Gw1Skill | null;
}

const CAMPAIGN_NAMES: Record<Campaign, string> = {
  [Campaign.Core]: 'Core',
  [Campaign.Prophecies]: 'Prophecies',
  [Campaign.Factions]: 'Factions',
  [Campaign.Nightfall]: 'Nightfall',
  [Campaign.EyeOfTheNorth]: 'Eye of the North',
};

export function SkillTooltip({ skill }: SkillTooltipProps) {
  if (!skill) return null;

  const prof = getProfession(skill.profession);
  const attributeInfo = skill.attribute !== null ? getAttribute(skill.attribute) : undefined;
  const attributeName = attributeInfo ? attributeInfo.name : (skill.titleTrack ? `Title: ${skill.titleTrack}` : 'No Attribute');

  return (
    <div
      className={`w-72 sm:w-80 rounded-md p-3.5 shadow-2xl border text-xs z-50 pointer-events-none transition-opacity duration-150 ${
        skill.isElite
          ? 'bg-stone-900/98 border-amber-500/80 shadow-amber-950/40'
          : 'bg-stone-900/98 border-stone-700 shadow-black/60'
      }`}
    >
      {/* Title Header */}
      <div className="flex items-start justify-between gap-2 border-b border-stone-800 pb-2">
        <div>
          <h4
            className={`font-bold text-sm sm:text-base leading-tight ${
              skill.isElite ? 'text-amber-400' : 'text-stone-100'
            }`}
          >
            {skill.name}
          </h4>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {prof.name !== 'None' ? `${prof.name} • ` : ''}
            {attributeName}
          </p>
        </div>
        {skill.isElite && (
          <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Elite
          </span>
        )}
      </div>

      {/* Resource & Timing Strip */}
      <div className="flex flex-wrap items-center gap-2 py-2 border-b border-stone-800/80 text-[11px]">
        {skill.energy > 0 && (
          <span className="flex items-center gap-1 font-semibold text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
            {skill.energy} Energy
          </span>
        )}

        {skill.adrenaline && skill.adrenaline > 0 && (
          <span className="flex items-center gap-1 font-semibold text-amber-500 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
            ⚔ {skill.adrenaline} Adrenaline
          </span>
        )}

        <span className="text-stone-300 bg-stone-800/70 px-1.5 py-0.5 rounded">
          {skill.activation === 0
            ? 'Instant'
            : skill.activation === 0.25
            ? '¼s cast'
            : skill.activation === 0.75
            ? '¾s cast'
            : `${skill.activation}s cast`}
        </span>

        {skill.recharge > 0 && (
          <span className="text-stone-300 bg-stone-800/70 px-1.5 py-0.5 rounded">
            {skill.recharge}s recharge
          </span>
        )}

        {skill.sacrifice && skill.sacrifice > 0 && (
          <span className="text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/40">
            {skill.sacrifice}% HP Sac
          </span>
        )}

        {skill.overcast && skill.overcast > 0 && (
          <span className="text-yellow-400 bg-yellow-950/60 px-1.5 py-0.5 rounded">
            {skill.overcast} Overcast
          </span>
        )}

        {skill.upkeep && (
          <span className="text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded">
            {skill.upkeep} Upkeep
          </span>
        )}
      </div>

      {/* Type & Tags */}
      <div className="flex items-center justify-between text-[11px] text-stone-400 py-1.5">
        <span className="italic">
          {skill.isElite ? 'Elite ' : ''}
          {skill.type}
          {skill.weaponRequirement ? ` (${skill.weaponRequirement})` : ''}
          {skill.comboChainStep ? ` [${skill.comboChainStep} Attack]` : ''}
        </span>
        <div className="flex items-center gap-1">
          {skill.isPvEOnly && (
            <span className="text-[10px] text-teal-400 bg-teal-950/60 border border-teal-800/40 px-1 rounded">
              PvE Only
            </span>
          )}
          <span className="text-[10px] text-stone-500">
            {CAMPAIGN_NAMES[skill.campaign] ?? 'Core'}
          </span>
        </div>
      </div>

      {/* Description Body */}
      <div className="pt-2 text-stone-200 leading-relaxed text-[11px] font-sans">
        <p>{skill.description}</p>
      </div>
    </div>
  );
}
