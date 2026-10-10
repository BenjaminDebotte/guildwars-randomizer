import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowDownToLine, Swords } from 'lucide-react';
import { Profession, Attribute, Campaign, TemplateData, Gw1Skill } from './data/types';
import { generateBuild } from './core/generator/randomizer';
import { GeneratedBuild } from './core/generator/types';
import { SanityConfig, DEFAULT_SANITY_CONFIG, CHAOS_SANITY_CONFIG } from './core/generator/constraints';
import { encodeSkillTemplate, decodeSkillTemplate } from './core/codec/templateCodec';
import { getCumulativeCost, MAX_ATTRIBUTE_POINTS } from './data/attributes';
import { resolveTemplateSkills } from './data/skills';
import { SkillBar } from './components/SkillBar';
import { AttributePanel } from './components/AttributePanel';
import { FilterPanel, SanityPreset } from './components/FilterPanel';
import { TemplateCodeBar } from './components/TemplateCodeBar';
import { CodeExportModal } from './components/CodeExportModal';

const DEFAULT_CAMPAIGNS: Campaign[] = [
  Campaign.Core,
  Campaign.Prophecies,
  Campaign.Factions,
  Campaign.Nightfall,
  Campaign.EyeOfTheNorth,
];

function parseTemplateFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '').trim();
  if (hash) {
    const match = hash.match(/(?:template=)?([A-Za-z0-9+/=]+)/);
    if (match) return match[1];
  }
  const searchParams = new URLSearchParams(window.location.search);
  const templateParam = searchParams.get('template') || searchParams.get('code');
  if (templateParam) return templateParam.trim();
  return null;
}

function createBuildFromTemplate(
  templateData: TemplateData,
  skills: [Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill]
): GeneratedBuild {
  const attributeAllocations = templateData.attributes.map(a => ({
    attributeId: a.attributeId,
    rank: a.rank,
    cost: getCumulativeCost(a.rank),
  }));
  const totalPointsUsed = attributeAllocations.reduce((sum, a) => sum + a.cost, 0);

  return {
    primaryProfession: templateData.primaryProfession,
    secondaryProfession: templateData.secondaryProfession,
    skills,
    attributeAllocations,
    totalPointsUsed,
    remainingPoints: MAX_ATTRIBUTE_POINTS - totalPointsUsed,
    templateData,
    templateCode: encodeSkillTemplate(templateData),
  };
}

function buildFromTemplateCode(code: string): GeneratedBuild | null {
  try {
    const decoded = decodeSkillTemplate(code);
    const resolvedSkills = resolveTemplateSkills(decoded.skills) as [
      Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill
    ];
    return createBuildFromTemplate(decoded, resolvedSkills);
  } catch {
    return null;
  }
}

export default function App() {
  const initialUrlCode = parseTemplateFromUrl();
  const initialBuildFromUrl = initialUrlCode ? buildFromTemplateCode(initialUrlCode) : null;

  // Filter & Configuration State
  const [primaryProfession, setPrimaryProfession] = useState<Profession | 'random'>(() =>
    initialBuildFromUrl ? initialBuildFromUrl.primaryProfession : 'random'
  );
  const [secondaryProfession, setSecondaryProfession] = useState<Profession | 'random' | 'none'>(() =>
    initialBuildFromUrl ? initialBuildFromUrl.secondaryProfession : 'random'
  );
  const [selectedCampaigns, setSelectedCampaigns] = useState<Campaign[]>(DEFAULT_CAMPAIGNS);
  const [includePvE, setIncludePvE] = useState(true);
  const [lockedElite, setLockedElite] = useState<'any' | 'none'>('any');
  const [sanityPreset, setSanityPreset] = useState<SanityPreset>('recommended');
  const [customSanity, setCustomSanity] = useState<SanityConfig>(DEFAULT_SANITY_CONFIG);

  // Slot Lock State
  const [lockedSlots, setLockedSlots] = useState<Set<number>>(new Set());

  // Roll Animation State
  const [isRolling, setIsRolling] = useState(false);
  const rollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modal State
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Current Active Sanity Config
  const activeSanityConfig: SanityConfig =
    sanityPreset === 'recommended'
      ? DEFAULT_SANITY_CONFIG
      : sanityPreset === 'chaos'
      ? CHAOS_SANITY_CONFIG
      : customSanity;

  // Build State
  const [build, setBuild] = useState<GeneratedBuild>(() =>
    initialBuildFromUrl ??
    generateBuild({
      primaryProfession: 'random',
      secondaryProfession: 'random',
      campaigns: DEFAULT_CAMPAIGNS,
      includePvE: true,
      sanityConfig: DEFAULT_SANITY_CONFIG,
    })
  );

  // Trigger Animation Helper
  const triggerRollAnimation = useCallback(() => {
    setIsRolling(true);
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
    rollTimeoutRef.current = setTimeout(() => {
      setIsRolling(false);
    }, 300);
  }, []);

  // Roll Build Action
  const rollBuild = useCallback(() => {
    triggerRollAnimation();

    const lockedList = Array.from(lockedSlots)
      .filter(idx => idx >= 0 && idx < 8 && build.skills[idx])
      .map(idx => ({ index: idx, skillId: build.skills[idx].id }));

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
    triggerRollAnimation,
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
    triggerRollAnimation();

    const lockedList = build.skills
      .map((skill, index) => ({ index, skillId: skill.id }))
      .filter(item => item.index !== slotIdx);

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

  // Clean up roll animation timeout
  useEffect(() => {
    return () => {
      if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
    };
  }, []);

  // Synchronize build template code with URL hash
  useEffect(() => {
    if (build.templateCode && typeof window !== 'undefined') {
      const currentHash = window.location.hash.replace(/^#/, '');
      if (currentHash !== build.templateCode) {
        window.history.replaceState(null, '', `#${build.templateCode}`);
      }
    }
  }, [build.templateCode]);

  // Listen to browser navigation / hash change
  useEffect(() => {
    const handleHashChange = () => {
      const code = parseTemplateFromUrl();
      if (code && code !== build.templateCode) {
        const parsed = buildFromTemplateCode(code);
        if (parsed) {
          setBuild(parsed);
          setPrimaryProfession(parsed.primaryProfession);
          setSecondaryProfession(parsed.secondaryProfession);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [build.templateCode]);

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
    if (totalUsed > MAX_ATTRIBUTE_POINTS) return;

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

  // Apply pasted / input code directly
  const handleApplyCode = (code: string): boolean => {
    const parsed = buildFromTemplateCode(code);
    if (parsed) {
      setBuild(parsed);
      setPrimaryProfession(parsed.primaryProfession);
      setSecondaryProfession(parsed.secondaryProfession);
      return true;
    }
    return false;
  };

  // Import build from modal
  const handleImportBuild = (data: {
    templateData: TemplateData;
    skills: [Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill];
  }) => {
    const importedBuild = createBuildFromTemplate(data.templateData, data.skills);
    setBuild(importedBuild);
    setPrimaryProfession(data.templateData.primaryProfession);
    setSecondaryProfession(data.templateData.secondaryProfession);
  };

  return (
    <div className="min-h-screen bg-[#0f1014] text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950">
      {/* Top Navigation Bar - Matte Dark Stone */}
      <header className="border-b border-stone-800 bg-[#14151b] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1c1e26] border border-stone-700 flex items-center justify-center text-amber-400 font-bold">
              <Swords className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-amber-400 tracking-tight leading-none">
                GW1 Skill Randomizer
              </h1>
              <p className="text-[11px] text-stone-400 mt-0.5 hidden sm:block">
                Guild Wars 1 Challenge Bar Generator & Template Codes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Template Dialog Button */}
            <button
              type="button"
              onClick={() => setIsCodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-stone-400" />
              <span>Import / Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 py-5 sm:py-6 flex-1 flex flex-col gap-5 sm:gap-6">
        {/* Visual Skill Bar Section */}
        <section aria-label="Visual Skill Bar">
          <SkillBar
            skills={build.skills}
            lockedSlots={lockedSlots}
            primaryProfession={build.primaryProfession}
            secondaryProfession={build.secondaryProfession}
            isRolling={isRolling}
            onToggleLock={toggleLock}
            onRerollSlot={rerollSlot}
            onLockAll={lockAll}
            onUnlockAll={unlockAll}
          />
        </section>

        {/* Prominent Build Code Asset Bar (Copy & Direct Paste / Edit) */}
        <section aria-label="Build Code Bar">
          <TemplateCodeBar
            templateCode={build.templateCode}
            onApplyCode={handleApplyCode}
            onOpenModal={() => setIsCodeModalOpen(true)}
          />
        </section>

        {/* Lower Grid: Attributes & Generator Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Attributes Panel (5 cols on desktop) */}
          <section className="lg:col-span-5" aria-label="Attributes">
            <AttributePanel
              allocations={build.attributeAllocations}
              totalPointsUsed={build.totalPointsUsed}
              remainingPoints={build.remainingPoints}
              onUpdateRank={handleUpdateRank}
            />
          </section>

          {/* Configuration & Filter Panel (7 cols on desktop) */}
          <section className="lg:col-span-7" aria-label="Generator Filters">
            <FilterPanel
              primaryProfession={primaryProfession}
              secondaryProfession={secondaryProfession}
              selectedCampaigns={selectedCampaigns}
              includePvE={includePvE}
              lockedElite={lockedElite}
              sanityPreset={sanityPreset}
              sanityConfig={activeSanityConfig}
              isRolling={isRolling}
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

      {/* Footer - Matte Dark Stone */}
      <footer className="border-t border-stone-800 bg-[#14151b] py-4 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2025 GW1 Skill Bar Randomizer. Free and open source fan project.</p>
          <p className="text-[11px] text-stone-500">
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
