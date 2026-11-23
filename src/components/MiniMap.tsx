import React from 'react';
import type { Room } from '../types/index';
import { FLOOR_NAMES } from '../data/gameData';

interface MiniMapProps {
  rooms: Room[];
  currentRoomId: string;
  explored: string[];
  onSelect?: (roomId: string) => void;
}

const kindIcon: Record<Room['kind'], string> = {
  start: '⌂', normal: '⚔', treasure: '◆', shop: '⚖', elite: '★', boss: '♛', stairs: '⇧', victory: '✦'
};

const MiniMap: React.FC<MiniMapProps> = ({ rooms, currentRoomId, explored, onSelect }) => {
  const maxX = Math.max(...rooms.map(room => room.mapX)) + 1;
  const maxY = Math.max(...rooms.map(room => room.mapY)) + 1;

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between">
        <h2 className="panel-title">塔层切片</h2>
        <span className="text-[11px] text-violet-300">{FLOOR_NAMES[rooms[0]?.floor ?? 1]}</span>
      </div>
      <div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${maxX}, minmax(0, 1fr))` }}>
        {Array.from({ length: maxY * maxX }, (_, index) => {
          const x = index % maxX;
          const y = Math.floor(index / maxX);
          const room = rooms.find(item => item.mapX === x && item.mapY === y);
          if (!room) return <div key={`empty-${index}`} className="aspect-square" />;
          const visited = explored.includes(room.id);
          const current = room.id === currentRoomId;
          const locked = room.requiresKey;
          return (
            <button
              key={room.id}
              type="button"
              disabled={!visited || !onSelect}
              onClick={() => onSelect?.(room.id)}
              title={visited ? room.name : '未探索区域'}
              className={`touch-manipulation grid aspect-square min-h-[38px] place-items-center rounded-lg border text-base transition-all duration-300 ${current
                ? 'animate-[mapPulse_2s_ease-in-out_infinite] border-violet-300 bg-violet-500/30 text-white shadow-[0_0_16px_rgba(139,92,246,0.45)]'
                : visited
                  ? 'border-violet-400/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20'
                  : 'border-white/5 bg-slate-900/60 text-slate-700'}`}
            >
              {visited ? kindIcon[room.kind] : '·'}
              {locked && visited && <span className="absolute translate-x-3 -translate-y-3 text-[8px] text-amber-300">🔒</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        已探索 {explored.length} / {rooms.length} 间 · 高亮处为当前位置
      </p>
    </div>
  );
};

export default MiniMap;
