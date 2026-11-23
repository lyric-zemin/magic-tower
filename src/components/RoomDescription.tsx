import React from 'react';
import type { Room } from '../types/index';
import { FLOOR_NAMES } from '../data/gameData';

interface RoomDescriptionProps {
  room: Room;
  canLeave: boolean;
}

const kindLabels: Record<Room['kind'], string> = {
  start: '入口', normal: '战斗', treasure: '宝藏', shop: '商人',
  elite: '精英', boss: '首领', stairs: '阶梯', victory: '终点'
};

const RoomDescription: React.FC<RoomDescriptionProps> = ({ room, canLeave }) => {
  return (
    <div className="glass-panel relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-[11px] text-violet-200">
          {room.floor} 层 · {FLOOR_NAMES[room.floor]}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400">
          {kindLabels[room.kind]}
        </span>
        {room.requiresKey && <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-300">需要钥匙</span>}
      </div>
      <h2 className="relative mt-3 font-serif text-2xl font-bold tracking-wide text-white sm:text-[32px]">{room.name}</h2>
      <p className="relative mt-2 text-sm leading-relaxed text-slate-300">{room.description}</p>
      <div className="relative mt-3 flex flex-wrap items-center gap-3 text-[11px]">
        <span className={canLeave ? 'text-emerald-400' : 'text-red-400'}>
          {canLeave ? '道路畅通，可自由移动' : '击败所有怪物后才能离开'}
        </span>
        {room.shopStock && <span className="text-amber-300">商店已开放</span>}
      </div>
    </div>
  );
};

export default RoomDescription;
