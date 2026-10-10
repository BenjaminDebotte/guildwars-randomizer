import { AttributeAllocation } from '../core/allocator/attributeAllocator';
import { getAttribute, getCumulativeCost, MAX_ATTRIBUTE_POINTS, MAX_ATTRIBUTE_RANK } from '../data/attributes';
import { Plus, Minus, Sparkles } from 'lucide-react';
import { Attribute } from '../data/types';

interface AttributePanelProps {
  allocations: AttributeAllocation[];
  totalPointsUsed: number;
  remainingPoints: number;
  onUpdateRank: (attributeId: Attribute, newRank: number) => void;
}

export function AttributePanel({
  allocations,
  totalPointsUsed,
  remainingPoints,
  onUpdateRank,
}: AttributePanelProps) {
  const percentUsed = Math.min(100, Math.round((totalPointsUsed / MAX_ATTRIBUTE_POINTS) * 100));

  return (
    <div className="w-full bg-[#14151b] border border-stone-800 rounded-xl p-4 sm:p-5 text-stone-200">
      {/* Header and Budget Progress Bar */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-xs sm:text-sm tracking-wider text-amber-500 uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Attributes & Points
        </h3>
        <div className="font-mono text-xs font-semibold">
          <span className={totalPointsUsed === MAX_ATTRIBUTE_POINTS ? 'text-amber-400 font-bold' : 'text-stone-200'}>
            {totalPointsUsed}
          </span>
          <span className="text-stone-500"> / {MAX_ATTRIBUTE_POINTS} AP</span>
          {remainingPoints > 0 && (
            <span className="text-xs text-amber-400/90 ml-1.5 font-normal">
              ({remainingPoints} unspent)
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar - Matte Bar */}
      <div className="w-full h-1.5 bg-[#0f1014] border border-stone-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-200 ${
            totalPointsUsed === MAX_ATTRIBUTE_POINTS
              ? 'bg-amber-500'
              : 'bg-sky-600'
          }`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {/* Attribute Rows */}
      {allocations.length === 0 ? (
        <p className="text-xs text-stone-500 italic text-center py-4">
          No attributes currently allocated.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {allocations.map(alloc => {
            const attr = getAttribute(alloc.attributeId);
            const attrName = attr?.name ?? `Attribute ${alloc.attributeId}`;
            const cost = alloc.cost;

            // Calculate cost to increment by 1
            const nextCost =
              alloc.rank < MAX_ATTRIBUTE_RANK
                ? getCumulativeCost(alloc.rank + 1) - getCumulativeCost(alloc.rank)
                : 999;
            const canIncrement = alloc.rank < MAX_ATTRIBUTE_RANK && remainingPoints >= nextCost;
            const canDecrement = alloc.rank > 0;

            return (
              <div
                key={alloc.attributeId}
                className="flex items-center justify-between bg-[#181a22] border border-stone-800 rounded-lg p-2 sm:px-3"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-200 truncate">
                      {attrName}
                    </span>
                    {attr?.isPrimary && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 uppercase font-bold tracking-wider">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-stone-400 font-mono">
                      {cost} AP
                    </span>
                    {/* Visual Rank Mini-Bar */}
                    <div className="hidden sm:flex items-center gap-0.5">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={`pip-${alloc.attributeId}-${i}`}
                          className={`w-1.5 h-1.5 rounded-[1px] ${
                            i < alloc.rank
                              ? attr?.isPrimary
                                ? 'bg-amber-400'
                                : 'bg-stone-300'
                              : 'bg-stone-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rank display and +/- buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={!canDecrement}
                    onClick={() => onUpdateRank(alloc.attributeId, alloc.rank - 1)}
                    aria-label={`Decrease ${attrName} rank`}
                    className="p-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 disabled:opacity-25 disabled:cursor-not-allowed text-stone-300 hover:text-white transition-colors cursor-pointer"
                    title="Decrease rank"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <span className="w-7 text-center font-mono font-bold text-sm text-amber-400 select-none">
                    {alloc.rank}
                  </span>

                  <button
                    type="button"
                    disabled={!canIncrement}
                    onClick={() => onUpdateRank(alloc.attributeId, alloc.rank + 1)}
                    aria-label={`Increase ${attrName} rank`}
                    className="p-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 disabled:opacity-25 disabled:cursor-not-allowed text-stone-300 hover:text-white transition-colors cursor-pointer"
                    title={canIncrement ? `Increase rank (costs ${nextCost} AP)` : 'Cannot afford or max rank (12)'}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
