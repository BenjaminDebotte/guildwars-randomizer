import { AttributeAllocation } from '../core/allocator/attributeAllocator';
import { getAttribute, getCumulativeCost, MAX_ATTRIBUTE_POINTS, MAX_ATTRIBUTE_RANK } from '../data/attributes';
import { Plus, Minus } from 'lucide-react';
import { AttributeId } from '../data/types';

interface AttributePanelProps {
  allocations: AttributeAllocation[];
  totalPointsUsed: number;
  remainingPoints: number;
  onUpdateRank: (attributeId: AttributeId, newRank: number) => void;
}

export function AttributePanel({
  allocations,
  totalPointsUsed,
  remainingPoints,
  onUpdateRank,
}: AttributePanelProps) {
  const percentUsed = Math.min(100, Math.round((totalPointsUsed / MAX_ATTRIBUTE_POINTS) * 100));

  return (
    <div className="w-full bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-lg text-stone-200">
      {/* Header and Budget Progress Bar */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm tracking-wide text-amber-500 uppercase">
          Attributes & Points
        </h3>
        <span className="font-mono text-xs font-semibold">
          <span className={totalPointsUsed === MAX_ATTRIBUTE_POINTS ? 'text-amber-400' : 'text-stone-300'}>
            {totalPointsUsed}
          </span>
          <span className="text-stone-500"> / {MAX_ATTRIBUTE_POINTS} AP</span>
          {remainingPoints > 0 && (
            <span className="text-xs text-stone-400 ml-1.5 font-normal">
              ({remainingPoints} unspent)
            </span>
          )}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-300 ${
            totalPointsUsed === MAX_ATTRIBUTE_POINTS
              ? 'bg-amber-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {/* Attribute Rows */}
      {allocations.length === 0 ? (
        <p className="text-xs text-stone-500 italic text-center py-2">
          No attributes currently allocated.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {allocations.map(alloc => {
            const attr = getAttribute(alloc.attributeId);
            const attrName = attr?.name ?? `Attribute ${alloc.attributeId}`;
            const cost = alloc.cost;

            // Calculate cost to increment by 1
            const nextCost = alloc.rank < MAX_ATTRIBUTE_RANK
              ? getCumulativeCost(alloc.rank + 1) - getCumulativeCost(alloc.rank)
              : 999;
            const canIncrement = alloc.rank < MAX_ATTRIBUTE_RANK && remainingPoints >= nextCost;
            const canDecrement = alloc.rank > 0;

            return (
              <div
                key={alloc.attributeId}
                className="flex items-center justify-between bg-stone-950/80 border border-stone-800/80 rounded-lg p-2.5"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-stone-200">
                      {attrName}
                    </span>
                    {attr?.isPrimary && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/50 uppercase font-bold">
                        Pri
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {cost} pts
                  </span>
                </div>

                {/* Rank display and +/- buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!canDecrement}
                    onClick={() => onUpdateRank(alloc.attributeId, alloc.rank - 1)}
                    className="p-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-300 transition-colors"
                    title="Decrease rank"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <span className="w-6 text-center font-mono font-bold text-sm text-amber-400">
                    {alloc.rank}
                  </span>

                  <button
                    type="button"
                    disabled={!canIncrement}
                    onClick={() => onUpdateRank(alloc.attributeId, alloc.rank + 1)}
                    className="p-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-300 transition-colors"
                    title={canIncrement ? `Increase rank (costs ${nextCost} AP)` : 'Cannot afford or max rank'}
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
