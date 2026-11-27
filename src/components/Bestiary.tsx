import React from 'react';
import { monsterElementLabels, monsterTemplates, monsterTraitNames } from '../data/monsters';

interface BestiaryProps {
  unlocked: string[];
  onClose: () => void;
}

const Bestiary: React.FC<BestiaryProps> = ({ unlocked, onClose }) => {
  const unlockedSet = new Set(unlocked);
  const known = monsterTemplates.filter(monster => unlockedSet.has(monster.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm animate-[fadeIn_250ms_ease-out]">
      <div className="modal-sheet w-full max-w-3xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-violet-300/70">塔中见闻</p>
            <h2 className="font-serif text-2xl font-bold text-white">怪物图鉴</h2>
            <p className="mt-1 text-xs text-slate-400">已记录 {known.length} / {monsterTemplates.length} 种</p>
          </div>
          <button onClick={onClose} aria-label="关闭图鉴"
            className="touch-manipulation grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/10">✕</button>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-900">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-400 transition-all duration-500"
            style={{ width: `${(known.length / monsterTemplates.length) * 100}%` }} />
        </div>

        <div className="mt-4 grid max-h-[60vh] gap-2 overflow-y-auto pr-1 scroll-thin sm:grid-cols-2 lg:grid-cols-3">
          {monsterTemplates.map(monster => {
            const isKnown = unlockedSet.has(monster.id);
            return (
              <div key={monster.id} className={`rounded-xl border p-3 ${isKnown ? 'border-violet-400/25 bg-violet-500/[0.07]' : 'border-white/5 bg-white/[0.02] opacity-50'}`}>
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950/60 text-xl">{isKnown ? monster.icon : '❔'}</span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-100">{isKnown ? monster.name : '未发现'}</h3>
                    <p className="text-[10px] text-slate-500">威胁 {monster.threat} / 7</p>
                  </div>
                </div>
                {isKnown && (
                  <>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{monster.description}</p>
                    <p className="mt-1 text-[10px] text-slate-500">元素：{monsterElementLabels[monster.element]}（仅作主题标识，不参与伤害结算）</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {monster.traits.length === 0 && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">普通</span>}
                      {monster.traits.map(trait => (
                        <span key={trait} className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-300">{monsterTraitNames[trait]}</span>
                      ))}
                    </div>
                    <p className="mt-2 font-mono text-[10px] text-slate-500">HP {monster.hp} · 攻 {monster.attack} · 防 {monster.defense}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Bestiary;
