import { Lock, Unlock } from 'lucide-react';
import { Gw1Skill, ProfessionId } from '../data/types';
import { getProfession } from '../data/professions';
import { SkillSlot } from './SkillSlot';

interface SkillBarProps {
  skills: [Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill, Gw1Skill];
  lockedSlots: Set<number>;
  primaryProfession: ProfessionId;
  secondaryProfession: ProfessionId;
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
  onToggleLock,
  onRerollSlot,
  onLockAll,
  onUnlockAll,
}: SkillBarProps) {
  const priInfo = getProfession(primaryProfession);
  const secInfo = getProfession(secondaryProfession);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Profession Header Badges */}
      <div className="flex items-center justify-between w-full px-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Profession:
          </span>
          <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-2.5 py-1 rounded">
            <span className="font-bold text-amber-400">{priInfo.name}</span>
            <span className="text-stone-500 font-mono">/</span>
            <span className="font-semibold text-stone-300">
              {secInfo.name !== 'None' ? secInfo.name : 'None'}
            </span>
          </div>
        </div>

        {/* Lock All / Unlock All batch buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onLockAll}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <Lock className="w-3 h-3" />
            Lock All
          </button>
          <button
            type="button"
            onClick={onUnlockAll}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <Unlock className="w-3 h-3" />
            Unlock All
          </button>
        </div>
      </div>

      {/* The 8-Slot Visual Tray */}
      <div className="w-full bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-700/80 rounded-xl p-3 sm:p-4 shadow-xl shadow-black/80">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3 justify-items-center">
          {skills.map((skill, idx) => (
            <SkillSlot
              key={`slot-${idx}`}
              slotIndex={idx}
              skill={skill}
              isLocked={lockedSlots.has(idx)}
              onToggleLock={onToggleLock}
              onRerollSlot={onRerollSlot}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
