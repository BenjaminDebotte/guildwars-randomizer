import { Lock, Unlock } from 'lucide-react';
import { Gw1Skill, Profession } from '../data/types';
import { getProfession } from '../data/professions';
import { SkillSlot } from './SkillSlot';
import { ProfessionBadge } from './ProfessionBadge';

interface SkillBarProps {
  skills: [Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill];
  lockedSlots: Set<number>;
  primaryProfession: Profession;
  secondaryProfession: Profession;
  isRolling?: boolean;
  onToggleLock: (index: number) => void;
  onRerollSlot: (index: number) => void;
  onLockAll: () => void;
  onUnlockAll: () => void;
}

export function SkillBar({
  skills,
  lockedSlots,
  primaryProfession,
  secondaryProfession,
  isRolling = false,
  onToggleLock,
  onRerollSlot,
  onLockAll,
  onUnlockAll,
}: SkillBarProps) {
  const secInfo = getProfession(secondaryProfession);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Profession Header & Quick Batch Controls */}
      <div className="flex flex-wrap items-center justify-between w-full px-1 mb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Profession:
          </span>
          <div className="flex items-center gap-1.5">
            <ProfessionBadge
              profession={primaryProfession}
              size="sm"
              showName={true}
              showCode={false}
              interactive={false}
            />
            <span className="text-stone-500 font-mono font-bold text-sm">/</span>
            {secondaryProfession !== Profession.None && secInfo.name !== 'None' ? (
              <ProfessionBadge
                profession={secondaryProfession}
                size="sm"
                showName={true}
                showCode={false}
                interactive={false}
              />
            ) : (
              <span className="text-stone-400 font-medium text-xs px-2 py-1 bg-[#13141a] border border-stone-800 rounded-lg">
                None
              </span>
            )}
          </div>
        </div>

        {/* Lock All / Unlock All batch buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onLockAll}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#14151b] hover:bg-[#1a1c24] border border-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <Lock className="w-3 h-3 text-stone-400" />
            <span>Lock All</span>
          </button>
          <button
            type="button"
            onClick={onUnlockAll}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#14151b] hover:bg-[#1a1c24] border border-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <Unlock className="w-3 h-3 text-stone-400" />
            <span>Unlock All</span>
          </button>
        </div>
      </div>

      {/* The 8-Slot Visual Tray - Matte Charcoal Slate */}
      <div className="w-full bg-[#14151b] border border-stone-800 rounded-xl p-3 sm:p-4">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 sm:gap-3 justify-items-center">
          {skills.map((skill, idx) => (
            <SkillSlot
              key={`slot-${idx}`}
              slotIndex={idx}
              skill={skill}
              isLocked={lockedSlots.has(idx)}
              isRolling={isRolling}
              onToggleLock={onToggleLock}
              onRerollSlot={onRerollSlot}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
