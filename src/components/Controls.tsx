import React from 'react';
import type { Direction, RoomExits } from '../types/index';

interface ControlsProps {
  exits: RoomExits;
  onMove: (direction: Direction) => void;
  blocked: boolean;
  dock?: boolean;
}

const directionInfo: Record<Direction, { label: string; key: string; icon: string }> = {
  north: { label: '北', key: 'W', icon: '↑' },
  south: { label: '南', key: 'S', icon: '↓' },
  west: { label: '西', key: 'A', icon: '←' },
  east: { label: '东', key: 'D', icon: '→' },
  up: { label: '上楼', key: 'Q', icon: ' ⇧' },
  down: { label: '下楼', key: 'E', icon: '⇩' }
};

const Controls: React.FC<ControlsProps> = ({ exits, onMove, blocked, dock = false }) => {
  const button = (direction: Direction) => {
    const info = directionInfo[direction];
    const available = Boolean(exits[direction]) && !blocked;
    return (
      <button
        key={direction}
        disabled={!available}
        onClick={() => onMove(direction)}
        title={`${info.label}（${info.key}）${blocked ? ' · 先击败怪物' : ''}`}
        className={`touch-manipulation flex min-h-[44px] min-w-[44px] select-none flex-col items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-95 ${dock ? 'px-2 py-1.5' : 'px-3 py-2'} ${
          available
            ? 'border-violet-400/40 bg-gradient-to-br from-violet-600/80 to-indigo-700/80 text-white shadow-lg shadow-violet-950/40 hover:-translate-y-0.5 hover:shadow-violet-500/30'
            : 'cursor-not-allowed border-white/5 bg-white/[0.03] text-slate-600'
        }`}
      >
        <span className="text-lg leading-none">{info.icon}</span>
        <span className="text-[11px]">{info.label}</span>
        <span className="text-[9px] opacity-60">{info.key}</span>
      </button>
    );
  };

  const stairs = (exits.up ? [button('up')] : []).concat(exits.down ? [button('down')] : []);

  return (
    <div className={dock
      ? 'fixed inset-x-0 bottom-0 z-30 border-t border-violet-400/20 bg-[#0B0E1A]/95 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden'
      : 'glass-panel p-4'}>
      {!dock && <h2 className="panel-title mb-3">移动</h2>}
      <div className={`mx-auto flex max-w-md items-center justify-center ${dock ? 'gap-2' : 'gap-3'}`}>
        <div className="grid grid-cols-3 gap-1.5">
          <span />
          {button('north')}
          <span />
          {button('west')}
          <span className="grid place-items-center text-[10px] text-slate-600">塔</span>
          {button('east')}
          <span />
          {button('south')}
          <span />
        </div>
        {stairs.length > 0 && <div className="ml-2 flex flex-col gap-1.5 border-l border-white/10 pl-2">{stairs}</div>}
      </div>
      <p className={`mt-2 text-center text-[10px] text-slate-600 ${dock ? '' : 'hidden'}`}>方向键 / WASD 移动 · Q 上楼 · E 下楼</p>
    </div>
  );
};

export default Controls;
