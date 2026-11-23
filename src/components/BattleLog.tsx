import React, { useState } from 'react';
import type { BattleLogEntry } from '../types/index';

interface BattleLogProps {
  entries: BattleLogEntry[];
}

const toneClass: Record<BattleLogEntry['kind'], string> = {
  system: 'text-violet-300',
  player: 'text-rose-200',
  monster: 'text-red-300',
  critical: 'text-amber-300 font-semibold',
  heal: 'text-emerald-300',
  loot: 'text-cyan-300'
};

const BattleLog: React.FC<BattleLogProps> = ({ entries }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass-panel overflow-hidden">
      <button
        onClick={() => setOpen(value => !value)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/5"
      >
        <span className="panel-title">战斗记录 · {entries.length}</span>
        <span className="text-xs text-slate-500">{open ? '收起 ▲' : '展开 ▼'}</span>
      </button>
      {open && (
        <div className="max-h-52 overflow-y-auto border-t border-white/5 bg-slate-950/40 px-4 py-3 scroll-thin">
          {entries.length === 0 ? (
            <p className="text-xs text-slate-600">还没有战斗记录。遭遇怪物后，每一回合都会记录在这里。</p>
          ) : (
            <ol className="space-y-1.5">
              {entries.slice().reverse().map(entry => (
                <li key={entry.id} className="flex gap-2 text-xs leading-relaxed">
                  <span className="shrink-0 font-mono text-slate-600">{entry.round > 0 ? `R${entry.round}` : '—'}</span>
                  <span className={toneClass[entry.kind]}>{entry.text}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
};

export default BattleLog;
