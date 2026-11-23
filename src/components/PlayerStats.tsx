import React from 'react';
import type { Player } from '../types/index';
import { expToNext } from '../game/progression';

interface PlayerStatsProps {
  player: Player;
}

const Stat: React.FC<{ label: string; value: string | number; accent: string; icon: string }> = ({ label, value, accent, icon }) => (
  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/5">
    <span className="flex items-center gap-2 text-xs text-slate-400">
      <span aria-hidden>{icon}</span>{label}
    </span>
    <span className="font-mono text-sm font-semibold" style={{ color: accent }}>{value}</span>
  </div>
);

const PlayerStats: React.FC<PlayerStatsProps> = ({ player }) => {
  const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
  const expNeeded = expToNext(player.level);
  const expPercent = Math.min(100, (player.exp / expNeeded) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-violet-300/70">冒险者</p>
          <h2 className="font-serif text-2xl font-bold text-white">旅人档案</h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 font-serif text-xl font-bold shadow-lg shadow-violet-900/40">
          {player.level}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">生命</span>
          <span className="font-mono text-rose-300">{player.hp} / {player.maxHp}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-900/80 ring-1 ring-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-400 to-red-300 transition-all duration-500"
            style={{ width: `${hpPercent}%` }} />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">经验</span>
          <span className="font-mono text-cyan-300">{player.exp} / {expNeeded}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-900/80 ring-1 ring-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-sky-300 transition-all duration-500"
            style={{ width: `${expPercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="攻击" value={player.attack} accent="#FCA5A5" icon="⚔️" />
        <Stat label="防御" value={player.defense} accent="#93C5FD" icon="🛡️" />
        <Stat label="金币" value={player.gold} accent="#FCD34D" icon="💰" />
        <Stat label="钥匙" value={player.keys} accent="#D8B4FE" icon="🗝️" />
      </div>

      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">已装备遗物</p>
        <div className="flex flex-wrap gap-2">
          {player.relics.length === 0 && <span className="text-xs text-slate-600">暂无遗物</span>}
          {player.relics.map(relic => (
            <span key={relic} className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-[11px] text-violet-200">
              {{ critRing: '鹰眼戒指', vampireRing: '血契戒指', boots: '疾风之靴' }[relic] ?? relic}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
