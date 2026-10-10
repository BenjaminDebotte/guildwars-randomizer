import { ArrowLeftRight } from 'lucide-react';
import { Profession } from '../data/types';
import { PLAYABLE_PROFESSION_IDS, PROFESSIONS } from '../data/professions';
import { ProfessionBadge } from './ProfessionBadge';

interface ProfessionSelectorProps {
  primaryProfession: Profession | 'random';
  secondaryProfession: Profession | 'random' | 'none';
  onPrimaryChange: (prof: Profession | 'random') => void;
  onSecondaryChange: (prof: Profession | 'random' | 'none') => void;
}

export function ProfessionSelector({
  primaryProfession,
  secondaryProfession,
  onPrimaryChange,
  onSecondaryChange,
}: ProfessionSelectorProps) {
  // Can swap if both are chosen and different
  const canSwap =
    primaryProfession !== 'random' &&
    secondaryProfession !== 'random' &&
    secondaryProfession !== 'none' &&
    primaryProfession !== secondaryProfession;

  const handleSwap = () => {
    if (canSwap) {
      const oldPri = primaryProfession;
      const oldSec = secondaryProfession;
      onPrimaryChange(oldSec as Profession);
      onSecondaryChange(oldPri as Profession);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden Accessible Form Controls for Full A11y & Test Compatibility */}
      <div className="sr-only">
        <label htmlFor="primary-prof-select">Primary Profession</label>
        <select
          id="primary-prof-select"
          value={primaryProfession}
          onChange={e => {
            const val = e.target.value === 'random' ? 'random' : (Number(e.target.value) as Profession);
            onPrimaryChange(val);
          }}
        >
          <option value="random">Random Primary</option>
          {PLAYABLE_PROFESSION_IDS.map(id => (
            <option key={`pri-opt-${id}`} value={id}>
              {PROFESSIONS[id].name}
            </option>
          ))}
        </select>

        <label htmlFor="secondary-prof-select">Secondary Profession</label>
        <select
          id="secondary-prof-select"
          value={secondaryProfession}
          onChange={e => {
            const val =
              e.target.value === 'random'
                ? 'random'
                : e.target.value === 'none'
                ? 'none'
                : (Number(e.target.value) as Profession);
            onSecondaryChange(val);
          }}
        >
          <option value="random">Random Secondary</option>
          <option value="none">Mono-Profession (None)</option>
          {PLAYABLE_PROFESSION_IDS.map(id => (
            <option key={`sec-opt-${id}`} value={id}>
              {PROFESSIONS[id].name}
            </option>
          ))}
        </select>
      </div>

      {/* Primary Profession Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold tracking-wide uppercase text-amber-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Primary Profession
          </label>
          <div className="flex items-center gap-1.5">
            <ProfessionBadge
              profession="random"
              size="sm"
              selected={primaryProfession === 'random'}
              onClick={() => onPrimaryChange('random')}
            />
          </div>
        </div>

        {/* 10 Playable Professions in a Balanced 5x2 (Desktop) / 2x5 (Mobile) Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {PLAYABLE_PROFESSION_IDS.map(profId => (
            <ProfessionBadge
              key={`pri-badge-${profId}`}
              profession={profId}
              size="sm"
              selected={primaryProfession === profId}
              onClick={() => onPrimaryChange(profId)}
              className="w-full justify-start"
            />
          ))}
        </div>
      </div>

      {/* Swap Button Divider */}
      <div className="flex items-center justify-center my-0.5">
        <button
          type="button"
          onClick={handleSwap}
          disabled={!canSwap}
          title={canSwap ? 'Swap Primary & Secondary professions' : 'Choose two professions to swap'}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
            canSwap
              ? 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-amber-400 hover:text-amber-300 shadow-sm cursor-pointer active:scale-95'
              : 'bg-stone-950/60 border-stone-800 text-stone-600 cursor-not-allowed opacity-40'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Swap Professions</span>
        </button>
      </div>

      {/* Secondary Profession Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold tracking-wide uppercase text-stone-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
            Secondary Profession
          </label>
          <div className="flex items-center gap-1.5">
            <ProfessionBadge
              profession="random"
              size="sm"
              selected={secondaryProfession === 'random'}
              onClick={() => onSecondaryChange('random')}
            />
            <ProfessionBadge
              profession="none"
              size="sm"
              selected={secondaryProfession === 'none'}
              onClick={() => onSecondaryChange('none')}
            />
          </div>
        </div>

        {/* 10 Playable Professions in the Exact Same Balanced 5x2 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {PLAYABLE_PROFESSION_IDS.map(profId => {
            const isSameAsPrimary = primaryProfession === profId;
            return (
              <ProfessionBadge
                key={`sec-badge-${profId}`}
                profession={profId}
                size="sm"
                selected={secondaryProfession === profId}
                disabled={isSameAsPrimary}
                onClick={() => onSecondaryChange(profId)}
                className="w-full justify-start"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
