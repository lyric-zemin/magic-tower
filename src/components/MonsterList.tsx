import React from 'react';
import type { BattlePreview, Monster, Player } from '../types/index';
import { monsterElementLabels, monsterTraitNames } from '../data/monsters';
import { previewBattle } from '../game/battle';

interface MonsterListProps {
  monsters: Monster[];
  player: Player;
  onFight: (monsterId: string) => void;
  onFlee: (monsterId: string) => void;
}

const elementColors: Record<string, string> = {
  none: '#94A3B8', fire: '#FB923C', ice: '#7DD3FC', thunder: '#FACC15', poison: '#4ADE80', dark: '#C084FC'
};

const Preview: React.FC<{ preview: BattlePreview; compact: boolean }> = ({ preview, compact }) => (
  <div className={`mt-2 rounded-lg border border-white/5 bg-slate-950/40 text-[11px] ${compact ? 'p-2' : 'p-3'}`}>
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-400">
      <span>每击 <b className="font-mono text-rose-300">{preview.playerDamage}</b></span>
      <span>预计 <b className="font-mono text-amber-300">{preview.rounds}</b> 回合</span>
      <span>损失 <b className="font-mono text-red-300">{preview.hpLoss}</b> 生命</span>
    </div>
    <p className={`mt-1 font-semibold ${preview.willWin ? 'text-emerald-400' : 'text-red-400'}`}>
      {preview.willWin ? '可击败，做好补给准备' : '危险！当前生命不足以支撑'}
    </p>
  </div>
);

const MonsterList: React.FC<MonsterListProps> = ({ monsters, player, onFight, onFlee }) => {
  if (monsters.length === 0) {
    return (
      <div className="glass-panel p-4">
        <h2 className="panel-title">遭遇</h2>
        <p className="mt-2 text-sm text-slate-500">此处暂时安全，继续探索吧。</p>
      </div>
    );
  }

  return (
    <div className="glass-panel space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="panel-title text-rose-300">遭遇 · {monsters.length}</h2>
        <span className="text-[11px] text-slate-500">点击战斗查看逐回合记录</span>
      </div>
      {monsters.map(monster => {
        const preview = previewBattle(player, monster);
        const isBoss = monster.traits.includes('bossPhase') || monster.threat >= 5;
        return (
          <div key={monster.id}
            className={`rounded-xl p-3 ring-1 transition-all duration-300 ${isBoss
              ? 'border border-amber-400/40 bg-amber-500/5 shadow-[0_0_24px_rgba(251,191,36,0.12)]'
              : 'bg-white/[0.04] ring-white/5 hover:ring-rose-400/30'}`}>
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl"
                style={{ backgroundColor: `${elementColors[monster.element]}1f`, border: `1px solid ${elementColors[monster.element]}55` }}>
                {monster.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-serif text-lg font-semibold text-slate-100">{monster.name}</h3>
                  {isBoss && <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-300">首领</span>}
                  <span className="text-[10px] text-slate-500" style={{ color: elementColors[monster.element] }}>
                    {monsterElementLabels[monster.element]}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {monster.traits.map(trait => (
                    <span key={trait} className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-300/90">{monsterTraitNames[trait]}</span>
                  ))}
                  {monster.phase >= 2 && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">狂暴</span>}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-900">
                    <div className="h-full rounded-full bg-gradient-to-r from-rose-700 to-rose-400 transition-all duration-500"
                      style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }} />
                  </div>
                  <span className="font-mono text-[11px] text-rose-300">{monster.hp}/{monster.maxHp}</span>
                </div>
                <div className="mt-1 flex gap-3 text-[11px] text-slate-400">
                  <span>攻 <b className="font-mono text-orange-300">{monster.attack}</b></span>
                  <span>防 <b className="font-mono text-sky-300">{monster.defense}</b></span>
                  <span>经验 <b className="font-mono text-cyan-300">{monster.exp}</b></span>
                  <span>金币 <b className="font-mono text-amber-300">{monster.gold}</b></span>
                </div>
              </div>
            </div>
            <Preview preview={preview} compact />
            {monster.traits.includes('split') && (
              <p className="mt-1 text-[10px] text-slate-500">预览已包含分裂后的残影</p>
            )}
            <div className="mt-2 flex gap-2">
              <button className="action-button flex-1 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400"
                onClick={() => onFight(monster.id)}>
                交战
              </button>
              {player.relics.includes('boots') && (
                <button
                  title="损失当前生命的 10%，可能导致失败"
                  className="action-button bg-slate-700/70 hover:bg-slate-600"
                  onClick={() => onFlee(monster.id)}>
                  逃跑
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonsterList;
