import { useState } from 'react';
import { Settings, Dices, ChevronDown, ChevronUp } from 'lucide-react';
import { ProfessionId } from '../data/types';
import { PROFESSIONS, PLAYABLE_PROFESSION_IDS } from '../data/professions';
import { SanityConfig } from '../core/generator/constraints';

export type SanityPreset = 'recommended' | 'chaos' | 'custom';

interface FilterPanelProps {
  primaryProfession: ProfessionId | 'random';
  secondaryProfession: ProfessionId | 'random' | 'none';
  selectedCampaigns: number[];
  includePvE: boolean;
  lockedElite: 'any' | 'none';
  sanityPreset: SanityPreset;
  sanityConfig: SanityConfig;
  onPrimaryChange: (prof: ProfessionId | 'random') => void;
  onSecondaryChange: (prof: ProfessionId | 'random' | 'none') => void;
  onToggleCampaign: (campaignId: number) => void;
  onTogglePvE: () => void;
  onLockedEliteChange: (elite: 'any' | 'none') => void;
  onSanityPresetChange: (preset: SanityPreset) => void;
  onUpdateCustomSanity: (config: Partial<SanityConfig>) => void;
  onRollBuild: () => void;
}

const CAMPAIGNS = [
  { id: 0, name: 'Core' },
  { id: 1, name: 'Prophecies' },
  { id: 2, name: 'Factions' },
  { id: 3, name: 'Nightfall' },
  { id: 4, name: 'Eye of the North' },
];

export function FilterPanel({
  primaryProfession,
  secondaryProfession,
  selectedCampaigns,
  includePvE,
  lockedElite,
  sanityPreset,
  sanityConfig,
  onPrimaryChange,
  onSecondaryChange,
  onToggleCampaign,
  onTogglePvE,
  onLockedEliteChange,
  onSanityPresetChange,
  onUpdateCustomSanity,
  onRollBuild,
}: FilterPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="w-full bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-lg text-stone-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="font-bold text-sm tracking-wide text-amber-500 uppercase flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Build Generator Filters
        </h3>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onRollBuild}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm shadow-lg shadow-amber-950/50 hover:shadow-amber-900/80 transition-all cursor-pointer select-none active:scale-95"
        >
          <Dices className="w-5 h-5" />
          Roll Build <span className="opacity-70 text-xs font-mono">(Space / R)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mb-4">
        {/* Primary Profession Dropdown */}
        <div>
          <label htmlFor="primary-prof-select" className="block text-xs font-semibold text-stone-400 mb-1">
            Primary Profession
          </label>
          <select
            id="primary-prof-select"
            value={primaryProfession}
            onChange={e => {
              const val = e.target.value === 'random' ? 'random' : (Number(e.target.value) as ProfessionId);
              onPrimaryChange(val);
            }}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
          >
            <option value="random">🎲 Random Primary</option>
            {PLAYABLE_PROFESSION_IDS.map(id => (
              <option key={`pri-${id}`} value={id}>
                {PROFESSIONS[id].name} ({PROFESSIONS[id].code})
              </option>
            ))}
          </select>
        </div>

        {/* Secondary Profession Dropdown */}
        <div>
          <label htmlFor="secondary-prof-select" className="block text-xs font-semibold text-stone-400 mb-1">
            Secondary Profession
          </label>
          <select
            id="secondary-prof-select"
            value={secondaryProfession}
            onChange={e => {
              const val = e.target.value === 'random'
                ? 'random'
                : e.target.value === 'none'
                ? 'none'
                : (Number(e.target.value) as ProfessionId);
              onSecondaryChange(val);
            }}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
          >
            <option value="random">🎲 Random Secondary</option>
            <option value="none">Mono-Profession (None)</option>
            {PLAYABLE_PROFESSION_IDS.map(id => (
              <option
                key={`sec-${id}`}
                value={id}
                disabled={primaryProfession === id}
              >
                {PROFESSIONS[id].name} ({PROFESSIONS[id].code})
              </option>
            ))}
          </select>
        </div>

        {/* Elite Skill Preference */}
        <div>
          <label htmlFor="elite-preference-select" className="block text-xs font-semibold text-stone-400 mb-1">
            Elite Skill
          </label>
          <select
            id="elite-preference-select"
            value={lockedElite}
            onChange={e => onLockedEliteChange(e.target.value as 'any' | 'none')}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
          >
            <option value="any">✨ Allow / Roll Elite</option>
            <option value="none">No Elite Skill</option>
          </select>
        </div>

        {/* Sanity Preset */}
        <div>
          <label htmlFor="sanity-preset-select" className="block text-xs font-semibold text-stone-400 mb-1">
            Sanity Mode
          </label>
          <select
            id="sanity-preset-select"
            value={sanityPreset}
            onChange={e => onSanityPresetChange(e.target.value as SanityPreset)}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="recommended">🛡️ Mechanic Sanity (Playable)</option>
            <option value="chaos">⚡ Chaos Mode (Pure Random)</option>
            <option value="custom">⚙️ Custom Rules...</option>
          </select>
        </div>
      </div>

      {/* Campaigns and PvE Checkboxes */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-stone-400">Campaigns:</span>
          {CAMPAIGNS.map(camp => (
            <label key={camp.id} className="flex items-center gap-1.5 cursor-pointer text-stone-300 hover:text-stone-100">
              <input
                type="checkbox"
                checked={selectedCampaigns.includes(camp.id)}
                onChange={() => onToggleCampaign(camp.id)}
                className="rounded bg-stone-950 border-stone-700 text-amber-500 focus:ring-0"
              />
              {camp.name}
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 hover:text-stone-100">
            <input
              type="checkbox"
              checked={includePvE}
              onChange={onTogglePvE}
              className="rounded bg-stone-950 border-stone-700 text-amber-500 focus:ring-0"
            />
            Include PvE-only Skills (Max 3)
          </label>

          {/* Toggle Advanced / Custom Options */}
          {sanityPreset === 'custom' && (
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Custom Rules
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Custom Sanity Rules Checklist */}
      {sanityPreset === 'custom' && showAdvanced && (
        <div className="mt-3 pt-3 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-stone-300 bg-stone-950/40 p-3 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sanityConfig.enforceWeaponCoherence ?? true}
              onChange={e => onUpdateCustomSanity({ enforceWeaponCoherence: e.target.checked })}
              className="rounded bg-stone-900 border-stone-700 text-amber-500"
            />
            Weapon Type Coherence
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sanityConfig.enforceAssassinCombos ?? true}
              onChange={e => onUpdateCustomSanity({ enforceAssassinCombos: e.target.checked })}
              className="rounded bg-stone-900 border-stone-700 text-amber-500"
            />
            Assassin Combo Sequence (1-2-3)
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sanityConfig.enforcePetSanity ?? true}
              onChange={e => onUpdateCustomSanity({ enforcePetSanity: e.target.checked })}
              className="rounded bg-stone-900 border-stone-700 text-amber-500"
            />
            Ranger Pet Enabler Requirement
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sanityConfig.enforceTeardownSanity ?? true}
              onChange={e => onUpdateCustomSanity({ enforceTeardownSanity: e.target.checked })}
              className="rounded bg-stone-900 border-stone-700 text-amber-500"
            />
            Dervish Teardown Enchantment Pairing
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sanityConfig.enforceEnergySanity ?? true}
              onChange={e => onUpdateCustomSanity({ enforceEnergySanity: e.target.checked })}
              className="rounded bg-stone-900 border-stone-700 text-amber-500"
            />
            Low-Energy Primary Sanity
          </label>

          <div className="flex items-center gap-2">
            <span className="text-stone-400">Max Attributes:</span>
            <select
              value={sanityConfig.maxAttributes ?? 'all'}
              onChange={e =>
                onUpdateCustomSanity({
                  maxAttributes: e.target.value === 'all' ? null : Number(e.target.value),
                })
              }
              className="bg-stone-900 border border-stone-700 rounded px-1.5 py-0.5 text-xs text-stone-200"
            >
              <option value="2">2 Attributes</option>
              <option value="3">3 Attributes</option>
              <option value="all">Unrestricted</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
