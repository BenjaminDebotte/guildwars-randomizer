import { useState } from 'react';
import { Settings, Dices, ChevronDown, ChevronUp, Sliders } from 'lucide-react';
import { Profession, Campaign } from '../data/types';
import { SanityConfig } from '../core/generator/constraints';
import { ProfessionSelector } from './ProfessionSelector';

export type SanityPreset = 'recommended' | 'chaos' | 'custom';

interface FilterPanelProps {
  primaryProfession: Profession | 'random';
  secondaryProfession: Profession | 'random' | 'none';
  selectedCampaigns: Campaign[];
  includePvE: boolean;
  lockedElite: 'any' | 'none';
  sanityPreset: SanityPreset;
  sanityConfig: SanityConfig;
  isRolling?: boolean;
  onPrimaryChange: (prof: Profession | 'random') => void;
  onSecondaryChange: (prof: Profession | 'random' | 'none') => void;
  onToggleCampaign: (campaign: Campaign) => void;
  onTogglePvE: () => void;
  onLockedEliteChange: (elite: 'any' | 'none') => void;
  onSanityPresetChange: (preset: SanityPreset) => void;
  onUpdateCustomSanity: (config: Partial<SanityConfig>) => void;
  onRollBuild: () => void;
}

const CAMPAIGNS = [
  { id: Campaign.Core, name: 'Core', accent: 'border-amber-600 text-amber-300 bg-[#201c14]' },
  { id: Campaign.Prophecies, name: 'Prophecies', accent: 'border-red-600 text-red-300 bg-[#221414]' },
  { id: Campaign.Factions, name: 'Factions', accent: 'border-emerald-600 text-emerald-300 bg-[#142218]' },
  { id: Campaign.Nightfall, name: 'Nightfall', accent: 'border-purple-600 text-purple-300 bg-[#1e1526]' },
  { id: Campaign.EyeOfTheNorth, name: 'Eye of the North', accent: 'border-cyan-600 text-cyan-300 bg-[#132024]' },
];

export function FilterPanel({
  primaryProfession,
  secondaryProfession,
  selectedCampaigns,
  includePvE,
  lockedElite,
  sanityPreset,
  sanityConfig,
  isRolling = false,
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
    <div className="w-full bg-[#14151b] border border-stone-800 rounded-xl p-4 sm:p-5 text-stone-200 flex flex-col gap-4">
      {/* Header and Roll CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div>
          <h3 className="font-bold text-xs sm:text-sm tracking-wider text-amber-500 uppercase flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            Build Generator Filters
          </h3>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Configure professions, campaign pools, and build sanity heuristics.
          </p>
        </div>

        {/* Primary Action Button (Roll Build) - Solid Matte */}
        <button
          type="button"
          onClick={onRollBuild}
          aria-label="Roll Build"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm transition-colors cursor-pointer select-none active:scale-95"
        >
          <Dices className={`w-5 h-5 ${isRolling ? 'animate-dice-roll' : ''}`} />
          <span>Roll Build</span>
          <span className="opacity-75 text-[11px] font-mono ml-1 font-semibold bg-stone-950/20 px-1.5 py-0.5 rounded">
            Space / R
          </span>
        </button>
      </div>

      {/* Visual Profession Selection - Flattened directly on panel */}
      <div>
        <ProfessionSelector
          primaryProfession={primaryProfession}
          secondaryProfession={secondaryProfession}
          onPrimaryChange={onPrimaryChange}
          onSecondaryChange={onSecondaryChange}
        />
      </div>

      {/* Generator Controls Grid: Elite & Sanity Presets */}
      <div className="pt-3 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Elite Skill Preference */}
        <div>
          <label htmlFor="elite-preference-select" className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wide">
            Elite Skill Rule
          </label>
          <select
            id="elite-preference-select"
            value={lockedElite}
            onChange={e => onLockedEliteChange(e.target.value as 'any' | 'none')}
            className="w-full bg-[#111216] border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
          >
            <option value="any">✨ Allow & Roll Elite Skill</option>
            <option value="none">🚫 No Elite Skill</option>
          </select>
        </div>

        {/* Sanity Mode Presets */}
        <div>
          <label htmlFor="sanity-preset-select" className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wide">
            Sanity & Coherence Mode
          </label>
          <select
            id="sanity-preset-select"
            value={sanityPreset}
            onChange={e => onSanityPresetChange(e.target.value as SanityPreset)}
            className="w-full bg-[#111216] border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
          >
            <option value="recommended">🛡️ Playable (Recommended Sanity)</option>
            <option value="chaos">⚡ Chaos Mode (Pure Random)</option>
            <option value="custom">⚙️ Custom Rules...</option>
          </select>
        </div>
      </div>

      {/* Campaign Badges and PvE Option - Balanced Flex Layout */}
      <div className="pt-3 border-t border-stone-800/80 flex flex-col gap-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Campaign Skill Pool:
          </span>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={includePvE}
              onChange={onTogglePvE}
              className="w-3.5 h-3.5 rounded bg-stone-900 border-stone-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <span>Include PvE-only Skills (Max 3)</span>
          </label>
        </div>

        {/* Campaign Pills - Flex Wrap (No Orphaned Grid Cells) */}
        <div className="flex flex-wrap gap-2">
          {CAMPAIGNS.map(camp => {
            const isSelected = selectedCampaigns.includes(camp.id);
            return (
              <button
                key={camp.id}
                type="button"
                onClick={() => onToggleCampaign(camp.id)}
                aria-pressed={isSelected}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer select-none ${
                  isSelected
                    ? `${camp.accent}`
                    : 'bg-[#111216] border-stone-800 text-stone-500 hover:text-stone-300'
                }`}
              >
                <span>{camp.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Sanity Rules Accordion */}
      {sanityPreset === 'custom' && (
        <div className="pt-3 border-t border-stone-800/80">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Fine-Tune Sanity Rules
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 pt-3 border-t border-stone-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
              <label className="flex items-center gap-2 cursor-pointer bg-[#111216] hover:bg-stone-900 p-2 rounded-lg border border-stone-800">
                <input
                  type="checkbox"
                  checked={sanityConfig.enforceWeaponCoherence ?? true}
                  onChange={e => onUpdateCustomSanity({ enforceWeaponCoherence: e.target.checked })}
                  className="rounded bg-stone-950 border-stone-700 text-amber-500"
                />
                <span>Weapon Type Coherence</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-[#111216] hover:bg-stone-900 p-2 rounded-lg border border-stone-800">
                <input
                  type="checkbox"
                  checked={sanityConfig.enforceAssassinCombos ?? true}
                  onChange={e => onUpdateCustomSanity({ enforceAssassinCombos: e.target.checked })}
                  className="rounded bg-stone-950 border-stone-700 text-amber-500"
                />
                <span>Assassin Combo Sequence (1-2-3)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-[#111216] hover:bg-stone-900 p-2 rounded-lg border border-stone-800">
                <input
                  type="checkbox"
                  checked={sanityConfig.enforcePetSanity ?? true}
                  onChange={e => onUpdateCustomSanity({ enforcePetSanity: e.target.checked })}
                  className="rounded bg-stone-950 border-stone-700 text-amber-500"
                />
                <span>Ranger Pet Enabler Requirement</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-[#111216] hover:bg-stone-900 p-2 rounded-lg border border-stone-800">
                <input
                  type="checkbox"
                  checked={sanityConfig.enforceTeardownSanity ?? true}
                  onChange={e => onUpdateCustomSanity({ enforceTeardownSanity: e.target.checked })}
                  className="rounded bg-stone-950 border-stone-700 text-amber-500"
                />
                <span>Dervish Teardown Enchantment Pairing</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-[#111216] hover:bg-stone-900 p-2 rounded-lg border border-stone-800">
                <input
                  type="checkbox"
                  checked={sanityConfig.enforceEnergySanity ?? true}
                  onChange={e => onUpdateCustomSanity({ enforceEnergySanity: e.target.checked })}
                  className="rounded bg-stone-950 border-stone-700 text-amber-500"
                />
                <span>Low-Energy Primary Sanity</span>
              </label>

              <div className="flex items-center justify-between bg-[#111216] p-2 rounded-lg border border-stone-800">
                <span className="text-stone-300">Max Attributes:</span>
                <select
                  value={sanityConfig.maxAttributes ?? 'all'}
                  onChange={e =>
                    onUpdateCustomSanity({
                      maxAttributes: e.target.value === 'all' ? null : Number(e.target.value),
                    })
                  }
                  className="bg-stone-950 border border-stone-700 rounded px-2 py-0.5 text-xs text-stone-200"
                >
                  <option value="2">2 Attributes</option>
                  <option value="3">3 Attributes</option>
                  <option value="all">Unrestricted</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
