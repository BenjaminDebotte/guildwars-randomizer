import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ArrowDownToLine } from 'lucide-react';
import { Profession, Attribute, Campaign, TemplateData, Gw1Skill } from './data/types';
import { generateBuild } from './core/generator/randomizer';
import { GeneratedBuild } from './core/generator/types';
import { SanityConfig, DEFAULT_SANITY_CONFIG, CHAOS_SANITY_CONFIG } from './core/generator/constraints';
import { encodeSkillTemplate } from './core/codec/templateCodec';
import { getCumulativeCost, MAX_ATTRIBUTE_POINTS } from './data/attributes';
import { SkillBar } from './components/SkillBar';
import { AttributePanel } from './components/AttributePanel';
import { FilterPanel, SanityPreset } from './components/FilterPanel';
import { CodeExportModal } from './components/CodeExportModal';

export default function App() {
  // Filter & Configuration State
  const [primaryProfession, setPrimaryProfession] = useState<Profession | 'random'>('random');
  const [secondaryProfession, setSecondaryProfession] = useState<Profession | 'random' | 'none'>('random');
  const [selectedCampaigns, setSelectedCampaigns] = useState<Campaign[]>([
    Campaign.Core,
    Campaign.Prophecies,
    Campaign.Factions,
    Campaign.Nightfall,
    Campaign.EyeOfTheNorth,
  ]);
  const [includePvE, setIncludePvE] = useState(true);
  const [lockedElite, setLockedElite] = useState<'any' | 'none'>('any');
  const [sanityPreset, setSanityPreset] = useState<SanityPreset>('recommended');
  const [customSanity, setCustomSanity] = useState<SanityConfig>(DEFAULT_SANITY_CONFIG);

  // Slot Lock State
  const [lockedSlots, setLockedSlots] = useState<Set<number>>(new Set());

  // Modal State
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [copiedQuick, setCopiedQuick] = useState(false);

  // Current Active Sanity Config
  const activeSanityConfig: SanityConfig =
    sanityPreset === 'recommended'
      ? DEFAULT_SANITY_CONFIG
      : sanityPreset === 'chaos'
      ? CHAOS_SANITY_CONFIG
      : customSanity;

  // Build State
  const [build, setBuild] = useState<GeneratedBuild>(() =>
    generateBuild({
      primaryProfession: 'random',
      secondaryProfession: 'random',
      campaigns: [
        Campaign.Core,
        Campaign.Prophecies,
        Campaign.Factions,
        Campaign.Nightfall,
        Campaign.EyeOfTheNorth,
      ],
      includePvE: true,
      sanityConfig: DEFAULT_SANITY_CONFIG,
    })
  );

  // Roll Build Action
  const rollBuild = useCallback(() => {
    const lockedList: Array<{ index: number; skillId: number }> = [];
    lockedSlots.forEach(idx => {
      const skill = build.skills[idx];
      if (skill) {
        lockedList.push({ index: idx, skillId: skill.id });
      }
    });

    const newBuild = generateBuild({
      primaryProfession,
      secondaryProfession,
      lockedSlots: lockedList,
      lockedEliteId: lockedElite === 'none' ? 'none' : undefined,
      campaigns: selectedCampaigns,
      includePvE,
      sanityConfig: activeSanityConfig,
    });

    setBuild(newBuild);
  }, [
    build.skills,
    lockedSlots,
    primaryProfession,
    secondaryProfession,
    lockedElite,
    selectedCampaigns,
    includePvE,
    activeSanityConfig,
  ]);

  // Reroll single slot action
  const rerollSlot = (slotIdx: number) => {
    // Lock all slots EXCEPT slotIdx, then roll
    const lockedList: Array<{ index: number; skillId: number }> = [];
    for (let i = 0; i < 8; i++) {
      if (i !== slotIdx) {
        lockedList.push({ index: i, skillId: build.skills[i].id });
      }
    }

    const newBuild = generateBuild({
      primaryProfession: build.primaryProfession,
      secondaryProfession: build.secondaryProfession,
      lockedSlots: lockedList,
      lockedEliteId: lockedElite === 'none' ? 'none' : undefined,
      campaigns: selectedCampaigns,
      includePvE,
      sanityConfig: activeSanityConfig,
    });

    setBuild(newBuild);
  };

  // Keyboard shortcut listener (Space or 'R' to roll)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, select, or focused on a button
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'BUTTON'
      ) {
        return;
      }

      if (e.code === 'Space' || e.code === 'KeyR') {
        e.preventDefault();
        rollBuild();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rollBuild]);

  // Slot Lock Toggles
  const toggleLock = (idx: number) => {
    setLockedSlots(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const lockAll = () => setLockedSlots(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
  const unlockAll = () => setLockedSlots(new Set());

  // Campaign Toggles
  const toggleCampaign = (id: Campaign) => {
    setSelectedCampaigns(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(c => c !== id);
      }
      return [...prev, id];
    });
  };

  // Manual Attribute Rank Modification
  const handleUpdateRank = (attributeId: Attribute, newRank: number) => {
    const updatedAllocations = build.attributeAllocations.map(a =>
      a.attributeId === attributeId
        ? { ...a, rank: newRank, cost: getCumulativeCost(newRank) }
        : a
    );

    const totalUsed = updatedAllocations.reduce((sum, a) => sum + a.cost, 0);
    if (totalUsed > MAX_ATTRIBUTE_POINTS) return; // Prevent exceeding budget

    const updatedTemplateData: TemplateData = {
      ...build.templateData,
      attributes: updatedAllocations
        .filter(a => a.rank > 0)
        .map(a => ({ attributeId: a.attributeId, rank: a.rank })),
    };

    const newCode = encodeSkillTemplate(updatedTemplateData);

    setBuild(prev => ({
      ...prev,
      attributeAllocations: updatedAllocations,
      totalPointsUsed: totalUsed,
      remainingPoints: MAX_ATTRIBUTE_POINTS - totalUsed,
      templateData: updatedTemplateData,
      templateCode: newCode,
    }));
  };

  // Quick Copy to Clipboard
  const handleQuickCopy = async () => {
    try {
      await navigator.clipboard.writeText(build.templateCode);
      setCopiedQuick(true);
      setTimeout(() => setCopiedQuick(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Import build
  const handleImportBuild = (data: {
    templateData: TemplateData;
    skills: [Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill];
  }) => {
    const attributeAllocations = data.templateData.attributes.map(a => ({
      attributeId: a.attributeId,
      rank: a.rank,
      cost: getCumulativeCost(a.rank),
    }));
    const totalUsed = attributeAllocations.reduce((sum, a) => sum + a.cost, 0);

    const importedBuild: GeneratedBuild = {
      primaryProfession: data.templateData.primaryProfession,
      secondaryProfession: data.templateData.secondaryProfession,
      skills: data.skills,
      attributeAllocations,
      totalPointsUsed: totalUsed,
      remainingPoints: MAX_ATTRIBUTE_POINTS - totalUsed,
      templateData: data.templateData,
      templateCode: encodeSkillTemplate(data.templateData),
    };

    setBuild(importedBuild);
    setPrimaryProfession(data.templateData.primaryProfession);
    setSecondaryProfession(data.templateData.secondaryProfession);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950">
      {/* Top Navbar */}
      <header className="border-b border-stone-800/80 bg-stone-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg shadow-sm">
              ⚔
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-amber-500 tracking-tight leading-none">
                GW1 Skill Randomizer
              </h1>
              <p className="text-[11px] text-stone-400 mt-0.5 hidden sm:block">
                Guild Wars 1 Challenge Bar Generator & Template Codes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Copy Code Button */}
            <button
              type="button"
              onClick={handleQuickCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                copiedQuick
                  ? 'bg-emerald-600/90 border-emerald-500 text-white'
                  : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-amber-400 hover:text-amber-300'
              }`}
            >
              {copiedQuick ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="font-mono">{build.templateCode.slice(0, 8)}...</span>
              <span className="hidden md:inline font-sans text-stone-400 text-[10px]">
                {copiedQuick ? 'Copied!' : 'Copy Code'}
              </span>
            </button>

            {/* Template Dialog Button */}
            <button
              type="button"
              onClick={() => setIsCodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-stone-100 transition-colors"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Import / Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1 flex flex-col gap-6">
        {/* Skill Bar Section */}
        <section aria-label="Visual Skill Bar">
          <SkillBar
            skills={build.skills}
            lockedSlots={lockedSlots}
            primaryProfession={build.primaryProfession}
            secondaryProfession={build.secondaryProfession}
            onToggleLock={toggleLock}
            onRerollSlot={rerollSlot}
            onLockAll={lockAll}
            onUnlockAll={unlockAll}
          />
        </section>

        {/* Lower Grid: Attributes & Generator Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Attributes Panel (5 cols) */}
          <section className="lg:col-span-5" aria-label="Attributes">
            <AttributePanel
              allocations={build.attributeAllocations}
              totalPointsUsed={build.totalPointsUsed}
              remainingPoints={build.remainingPoints}
              onUpdateRank={handleUpdateRank}
            />
          </section>

          {/* Configuration & Filter Panel (7 cols) */}
          <section className="lg:col-span-7" aria-label="Generator Filters">
            <FilterPanel
              primaryProfession={primaryProfession}
              secondaryProfession={secondaryProfession}
              selectedCampaigns={selectedCampaigns}
              includePvE={includePvE}
              lockedElite={lockedElite}
              sanityPreset={sanityPreset}
              sanityConfig={activeSanityConfig}
              onPrimaryChange={setPrimaryProfession}
              onSecondaryChange={setSecondaryProfession}
              onToggleCampaign={toggleCampaign}
              onTogglePvE={() => setIncludePvE(!includePvE)}
              onLockedEliteChange={setLockedElite}
              onSanityPresetChange={setSanityPreset}
              onUpdateCustomSanity={cfg => setCustomSanity(prev => ({ ...prev, ...cfg }))}
              onRollBuild={rollBuild}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-4 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2025 GW1 Skill Bar Randomizer. Free and open source fan project.</p>
          <p className="text-[11px] text-stone-600">
            Guild Wars is a registered trademark of NCSoft Corporation.
          </p>
        </div>
      </footer>

      {/* Code Modal */}
      <CodeExportModal
        isOpen={isCodeModalOpen}
        templateCode={build.templateCode}
        onClose={() => setIsCodeModalOpen(false)}
        onImportBuild={handleImportBuild}
      />
    </div>
  );
}
