import { useState } from 'react';
import { Dices, Ban } from 'lucide-react';
import { Profession } from '../data/types';
import { getProfession } from '../data/professions';

export interface ProfessionTheme {
  name: string;
  code: string;
  accent: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
}

export const PROFESSION_THEMES: Record<Profession, ProfessionTheme> = {
  [Profession.None]: {
    name: 'None',
    code: 'None',
    accent: '#78716c',
    borderClass: 'border-stone-600',
    bgClass: 'bg-[#181a20]',
    textClass: 'text-stone-400',
  },
  [Profession.Warrior]: {
    name: 'Warrior',
    code: 'W',
    accent: '#d97706',
    borderClass: 'border-amber-600',
    bgClass: 'bg-[#221c15]',
    textClass: 'text-amber-400',
  },
  [Profession.Ranger]: {
    name: 'Ranger',
    code: 'R',
    accent: '#16a34a',
    borderClass: 'border-emerald-600',
    bgClass: 'bg-[#142018]',
    textClass: 'text-emerald-400',
  },
  [Profession.Monk]: {
    name: 'Monk',
    code: 'Mo',
    accent: '#0ea5e9',
    borderClass: 'border-sky-500',
    bgClass: 'bg-[#141d24]',
    textClass: 'text-sky-300',
  },
  [Profession.Necromancer]: {
    name: 'Necromancer',
    code: 'N',
    accent: '#65a30d',
    borderClass: 'border-lime-600',
    bgClass: 'bg-[#182012]',
    textClass: 'text-lime-400',
  },
  [Profession.Mesmer]: {
    name: 'Mesmer',
    code: 'Me',
    accent: '#9333ea',
    borderClass: 'border-purple-500',
    bgClass: 'bg-[#1e1526]',
    textClass: 'text-purple-300',
  },
  [Profession.Elementalist]: {
    name: 'Elementalist',
    code: 'E',
    accent: '#ef4444',
    borderClass: 'border-red-500',
    bgClass: 'bg-[#241515]',
    textClass: 'text-red-400',
  },
  [Profession.Assassin]: {
    name: 'Assassin',
    code: 'A',
    accent: '#94a3b8',
    borderClass: 'border-slate-500',
    bgClass: 'bg-[#1a1d24]',
    textClass: 'text-slate-200',
  },
  [Profession.Ritualist]: {
    name: 'Ritualist',
    code: 'Rt',
    accent: '#14b8a6',
    borderClass: 'border-teal-500',
    bgClass: 'bg-[#13201f]',
    textClass: 'text-teal-300',
  },
  [Profession.Paragon]: {
    name: 'Paragon',
    code: 'P',
    accent: '#eab308',
    borderClass: 'border-yellow-500',
    bgClass: 'bg-[#222013]',
    textClass: 'text-yellow-400',
  },
  [Profession.Dervish]: {
    name: 'Dervish',
    code: 'D',
    accent: '#6366f1',
    borderClass: 'border-indigo-500',
    bgClass: 'bg-[#171626]',
    textClass: 'text-indigo-300',
  },
};

export function getProfessionIconUrl(profName: string): string {
  return `https://wiki.guildwars.com/wiki/Special:Filepath/${encodeURIComponent(profName)}-icon.png`;
}

interface ProfessionBadgeProps {
  profession: Profession | 'random' | 'none';
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showCode?: boolean;
  selected?: boolean;
  disabled?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ProfessionBadge({
  profession,
  size = 'md',
  showName = true,
  showCode = true,
  selected = false,
  disabled = false,
  interactive,
  onClick,
  className = '',
}: ProfessionBadgeProps) {
  const [imgError, setImgError] = useState(false);

  // By default interactive unless explicitly disabled (e.g. in display headers)
  const isInteractive = interactive !== false;

  const sizeConfig = {
    sm: { img: 16, iconBox: 'w-4 h-4', text: 'text-xs font-semibold', box: 'px-2.5 py-1.5 gap-2' },
    md: { img: 18, iconBox: 'w-4 h-4', text: 'text-xs font-semibold', box: 'px-2.5 py-1.5 gap-2' },
    lg: { img: 20, iconBox: 'w-5 h-5', text: 'text-sm font-semibold', box: 'px-3 py-2 gap-2.5' },
  }[size];

  // Base styling for all variants
  const commonClasses = `flex items-center rounded-lg border transition-colors select-none ${
    sizeConfig.box
  } ${sizeConfig.text} ${
    disabled ? 'opacity-25 cursor-not-allowed' : isInteractive ? 'cursor-pointer' : ''
  } ${className}`;

  // 1. Special case: Random
  if (profession === 'random') {
    const activeClasses = selected
      ? 'bg-[#1e2029] border-amber-500 text-amber-300'
      : 'bg-[#13141a] hover:bg-[#1a1c24] border-stone-800 text-stone-300 hover:text-white';

    const content = (
      <>
        <Dices className={`${sizeConfig.iconBox} text-amber-400 shrink-0`} />
        {showName && <span>Random</span>}
      </>
    );

    if (!isInteractive) {
      return <div className={`${commonClasses} ${activeClasses}`}>{content}</div>;
    }

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-pressed={selected}
        className={`${commonClasses} ${activeClasses}`}
      >
        {content}
      </button>
    );
  }

  // 2. Special case: None / Mono-Profession
  if (profession === 'none' || profession === Profession.None) {
    const activeClasses = selected
      ? 'bg-[#1e2029] border-stone-500 text-stone-200'
      : 'bg-[#13141a] hover:bg-[#1a1c24] border-stone-800 text-stone-400 hover:text-stone-300';

    const content = (
      <>
        <Ban className={`${sizeConfig.iconBox} text-stone-400 shrink-0`} />
        {showName && <span>None (Mono)</span>}
      </>
    );

    if (!isInteractive) {
      return <div className={`${commonClasses} ${activeClasses}`}>{content}</div>;
    }

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-pressed={selected}
        className={`${commonClasses} ${activeClasses}`}
      >
        {content}
      </button>
    );
  }

  // 3. Playable Professions
  const profInfo = getProfession(profession);
  const theme = PROFESSION_THEMES[profession] ?? PROFESSION_THEMES[Profession.None];
  const iconUrl = getProfessionIconUrl(profInfo.name);

  const activeClasses = selected
    ? `${theme.bgClass} ${theme.borderClass} ${theme.textClass} font-bold`
    : `bg-[#13141a] hover:bg-[#1a1c24] border-stone-800 text-stone-300 hover:border-stone-700 hover:text-stone-100`;

  const content = (
    <>
      <div className={`relative flex items-center justify-center shrink-0 ${sizeConfig.iconBox}`}>
        {!imgError ? (
          <img
            src={iconUrl}
            alt={profInfo.name}
            width={sizeConfig.img}
            height={sizeConfig.img}
            loading="lazy"
            onError={() => setImgError(true)}
            className="object-contain"
          />
        ) : (
          <span
            className={`font-mono font-bold leading-none ${theme.textClass}`}
            style={{ fontSize: sizeConfig.img * 0.75 }}
          >
            {profInfo.code}
          </span>
        )}
      </div>

      {showName && (
        <span className="truncate tracking-tight">
          {profInfo.name}
        </span>
      )}

      {showCode && !showName && (
        <span className="font-mono text-xs font-bold opacity-80">
          {profInfo.code}
        </span>
      )}
    </>
  );

  if (!isInteractive) {
    return (
      <div
        title={`${profInfo.name} (${profInfo.code})`}
        className={`${commonClasses} ${activeClasses}`}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      title={`${profInfo.name} (${profInfo.code})`}
      className={`${commonClasses} ${activeClasses}`}
    >
      {content}
    </button>
  );
}
