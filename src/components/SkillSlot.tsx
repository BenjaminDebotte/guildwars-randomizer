import { useState, useRef } from 'react';
import { Lock, Unlock, RefreshCw } from 'lucide-react';
import { Gw1Skill } from '../data/types';
import { SkillIcon } from './SkillIcon';
import { SkillTooltip } from './SkillTooltip';

interface SkillSlotProps {
  slotIndex: number; // 0..7
  skill: Gw1Skill | null;
  isLocked: boolean;
  onToggleLock: (index: number) => void;
  onRerollSlot: (index: number) => void;
}

export function SkillSlot({
  slotIndex,
  skill,
  isLocked,
  onToggleLock,
  onRerollSlot,
}: SkillSlotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isElite = skill?.isElite ?? false;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="relative flex flex-col items-center group"
    >
      {/* Skill Card Frame */}
      <div
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-md p-0.5 transition-all duration-150 shadow-md ${
          isElite
            ? 'bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 ring-2 ring-amber-400/90 shadow-amber-900/50'
            : 'bg-stone-800 border border-stone-600/80 hover:border-stone-400'
        } ${isLocked ? 'ring-2 ring-blue-500/80' : ''}`}
      >
        <SkillIcon skill={skill} size={60} className="w-full h-full" />

        {/* Slot Number Badge */}
        <span className="absolute bottom-0.5 right-1 text-[10px] font-mono font-bold text-stone-300 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.9)] select-none">
          {slotIndex + 1}
        </span>

        {/* Lock Overlay Badge if locked */}
        {isLocked && (
          <div className="absolute top-0.5 left-0.5 p-0.5 rounded bg-blue-600/90 text-white shadow">
            <Lock className="w-2.5 h-2.5" />
          </div>
        )}
      </div>

      {/* Action Controls underneath */}
      <div className="flex items-center gap-1 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
        {/* Lock Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleLock(slotIndex)}
          title={isLocked ? 'Unlock slot' : 'Lock slot'}
          aria-label={isLocked ? `Unlock slot ${slotIndex + 1}` : `Lock slot ${slotIndex + 1}`}
          className={`p-1 rounded text-xs transition-colors ${
            isLocked
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200'
          }`}
        >
          {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>

        {/* Reroll Individual Slot Button */}
        <button
          type="button"
          onClick={() => onRerollSlot(slotIndex)}
          disabled={isLocked}
          title={isLocked ? 'Slot is locked' : 'Reroll this slot'}
          aria-label={`Reroll slot ${slotIndex + 1}`}
          className={`p-1 rounded text-xs transition-colors ${
            isLocked
              ? 'opacity-30 cursor-not-allowed text-stone-500'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-amber-400'
          }`}
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Hover Tooltip Popup */}
      {isHovered && skill && (
        <div className="absolute bottom-full mb-2 z-50 pointer-events-none transform -translate-x-1/2 left-1/2">
          <SkillTooltip skill={skill} />
        </div>
      )}
    </div>
  );
}
