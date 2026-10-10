import { useState, useRef } from 'react';
import { Lock, Unlock, RefreshCw, Sparkles } from 'lucide-react';
import { Gw1Skill } from '../data/types';
import { SkillIcon } from './SkillIcon';
import { SkillTooltip } from './SkillTooltip';

interface SkillSlotProps {
  slotIndex: number; // 0..7
  skill: Gw1Skill | null;
  isLocked: boolean;
  isRolling?: boolean;
  onToggleLock: (index: number) => void;
  onRerollSlot: (index: number) => void;
}

export function SkillSlot({
  slotIndex,
  skill,
  isLocked,
  isRolling = false,
  onToggleLock,
  onRerollSlot,
}: SkillSlotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isElite = skill?.isElite ?? false;
  const shouldAnimate = isRolling && !isLocked;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="relative flex flex-col items-center group"
    >
      {/* Skill Card Frame - Matte Obsidian / Gold Frame */}
      <div
        onClick={() => setIsHovered(prev => !prev)}
        style={{
          animationDelay: shouldAnimate ? `${slotIndex * 30}ms` : undefined,
        }}
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg p-0.5 transition-all select-none cursor-pointer ${
          shouldAnimate ? 'animate-slot-roll' : ''
        } ${
          isElite
            ? 'bg-[#221c10] border-2 border-amber-500'
            : 'bg-[#181a20] border border-stone-700 hover:border-stone-500'
        } ${
          isLocked
            ? 'ring-2 ring-sky-500 border-sky-500'
            : 'hover:scale-[1.02]'
        }`}
      >
        <SkillIcon skill={skill} size={60} className="w-full h-full rounded-[5px]" />

        {/* Elite Crown Indicator */}
        {isElite && (
          <div className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-amber-500 text-stone-950">
            <Sparkles className="w-2.5 h-2.5 fill-stone-950" />
          </div>
        )}

        {/* Slot Number Badge */}
        <span className="absolute bottom-0.5 right-1 text-[10px] font-mono font-bold text-stone-300 drop-shadow-[0_1px_2px_rgba(0,0,0,1)] select-none">
          {slotIndex + 1}
        </span>

        {/* Lock Overlay Badge if locked */}
        {isLocked && (
          <div className="absolute top-0.5 left-0.5 p-1 rounded-md bg-sky-600 text-white select-none">
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
          className={`p-1 rounded text-xs transition-colors cursor-pointer ${
            isLocked
              ? 'bg-sky-600 hover:bg-sky-500 text-white'
              : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
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
          className={`p-1 rounded text-xs transition-colors cursor-pointer ${
            isLocked
              ? 'opacity-25 cursor-not-allowed text-stone-600 bg-stone-900 border border-stone-800'
              : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-400 border border-stone-800 active:scale-95'
          }`}
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Hover/Tap Tooltip Popup */}
      {isHovered && skill && (
        <div
          className={`absolute bottom-full mb-2.5 z-50 pointer-events-none ${
            slotIndex <= 1
              ? 'left-0 translate-x-0'
              : slotIndex >= 6
              ? 'right-0 translate-x-0'
              : 'left-1/2 -translate-x-1/2'
          }`}
        >
          <SkillTooltip skill={skill} />
        </div>
      )}
    </div>
  );
}
