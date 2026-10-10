import { useState } from 'react';
import { Gw1Skill, Profession } from '../data/types';
import { getProfession } from '../data/professions';

interface SkillIconProps {
  skill: Gw1Skill | null;
  className?: string;
  size?: number;
}

// Colors representing GW1 professions
const PROFESSION_COLORS: Record<Profession, { bg: string; text: string; border: string }> = {
  [Profession.None]: { bg: 'bg-stone-800', text: 'text-stone-300', border: 'border-stone-600' }, // Common
  [Profession.Warrior]: { bg: 'bg-amber-900/60', text: 'text-amber-300', border: 'border-amber-600' }, // Warrior
  [Profession.Ranger]: { bg: 'bg-emerald-950/70', text: 'text-emerald-300', border: 'border-emerald-600' }, // Ranger
  [Profession.Monk]: { bg: 'bg-sky-950/70', text: 'text-sky-300', border: 'border-sky-500' }, // Monk
  [Profession.Necromancer]: { bg: 'bg-lime-950/70', text: 'text-lime-300', border: 'border-lime-600' }, // Necro
  [Profession.Mesmer]: { bg: 'bg-purple-950/70', text: 'text-purple-300', border: 'border-purple-500' }, // Mesmer
  [Profession.Elementalist]: { bg: 'bg-red-950/70', text: 'text-red-300', border: 'border-red-600' }, // Ele
  [Profession.Assassin]: { bg: 'bg-stone-900', text: 'text-stone-200', border: 'border-stone-400' }, // Assassin
  [Profession.Ritualist]: { bg: 'bg-cyan-950/70', text: 'text-cyan-300', border: 'border-cyan-600' }, // Rit
  [Profession.Paragon]: { bg: 'bg-yellow-950/70', text: 'text-yellow-300', border: 'border-yellow-500' }, // Paragon
  [Profession.Dervish]: { bg: 'bg-indigo-950/70', text: 'text-indigo-300', border: 'border-indigo-500' }, // Dervish
};

export function SkillIcon({ skill, className = '', size = 56 }: SkillIconProps) {
  const [imgError, setImgError] = useState(false);

  if (!skill) {
    return (
      <div
        className={`flex items-center justify-center bg-stone-900/90 border border-stone-800 rounded text-stone-600 select-none ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs">Empty</span>
      </div>
    );
  }

  // Format wiki image URL: replace spaces with underscores and encodeURI
  const encodedName = encodeURIComponent(skill.name.replace(/ /g, '_'));
  const wikiUrl = `https://wiki.guildwars.com/wiki/Special:Filepath/${encodedName}.jpg`;
  const profInfo = getProfession(skill.profession);
  const colorTheme = PROFESSION_COLORS[skill.profession] ?? PROFESSION_COLORS[0];

  // If image loaded successfully and no error
  if (!imgError) {
    return (
      <img
        src={wikiUrl}
        alt={skill.name}
        loading="lazy"
        onError={() => setImgError(true)}
        className={`rounded object-cover select-none pointer-events-none ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback SVG representation
  const initials = skill.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('');

  return (
    <div
      className={`flex flex-col items-center justify-center rounded border ${colorTheme.bg} ${colorTheme.border} ${colorTheme.text} select-none font-semibold ${className}`}
      style={{ width: size, height: size }}
      title={skill.name}
    >
      <span className="text-xs font-bold tracking-wider leading-none">{initials}</span>
      <span className="text-[9px] opacity-70 leading-none mt-0.5">{profInfo.code}</span>
    </div>
  );
}
