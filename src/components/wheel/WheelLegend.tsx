import { memo } from 'react';
import type { WheelPrize } from '../../api/wheel';

interface WheelLegendProps {
  prizes: WheelPrize[];
}

const WheelLegend = memo(function WheelLegend({ prizes }: WheelLegendProps) {
  const getSectorColor = (index: number, baseColor?: string) => {
    if (baseColor) return baseColor;
    const colors = [
      '#8B5CF6',
      '#EC4899',
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#6366F1',
      '#14B8A6',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-2">
      {prizes.map((prize, index) => {
        const color = getSectorColor(index, prize.color);
        const isLocked = prize.is_locked;
        const winCount = prize.win_count || 0;

        return (
          <div
            key={prize.id}
            className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors ${
              isLocked
                ? 'border-dark-700/20 bg-dark-900/50 opacity-50'
                : 'border-dark-700/30 bg-dark-800/50 hover:bg-dark-800'
            }`}
          >
            {/* Color indicator */}
            <div
              className="h-8 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: isLocked ? '#4B5563' : color }}
            />

            {/* Emoji */}
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center text-xl ${isLocked ? 'grayscale' : ''}`}>
              {prize.emoji}
            </div>

            {/* Prize name */}
            <div className="min-w-0 flex-1">
              <div className={`truncate text-sm font-medium ${isLocked ? 'text-dark-500 line-through' : 'text-dark-100'}`}>
                {prize.display_name}
              </div>
            </div>

            {/* Win count badge */}
            {winCount > 0 && (
              <div
                className={`flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                  isLocked
                    ? 'bg-dark-700 text-dark-400'
                    : 'bg-dark-700/80 text-dark-200'
                }`}
              >
                {winCount}
              </div>
            )}

            {/* Lock icon for locked prizes */}
            {isLocked && (
              <div className="text-dark-500 text-sm">🔒</div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default WheelLegend;
