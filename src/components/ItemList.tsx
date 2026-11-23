import React from 'react';
import type { Item, ItemRarity } from '../types/index';
import { itemDefinitions } from '../data/items';

interface ItemListProps {
  items: Item[];
  onPickup: (itemId: string) => void;
}

const rarityStyle: Record<ItemRarity, string> = {
  common: 'border-white/10 bg-white/[0.04]',
  rare: 'border-sky-400/40 bg-sky-500/10 shadow-[0_0_18px_rgba(56,189,248,0.12)]',
  epic: 'border-violet-400/40 bg-violet-500/10 shadow-[0_0_18px_rgba(139,92,246,0.18)]',
  cursed: 'border-red-500/40 bg-red-500/10'
};

const rarityLabel: Record<ItemRarity, string> = {
  common: '普通', rare: '稀有', epic: '史诗', cursed: '诅咒'
};

const ItemList: React.FC<ItemListProps> = ({ items, onPickup }) => {
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between">
        <h2 className="panel-title text-emerald-300">战利品 · {items.length}</h2>
        <span className="text-[11px] text-slate-500">拾取后立即生效</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">此处没有可拾取的物品。</p>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {items.map(item => {
            const def = itemDefinitions[item.type];
            return (
              <div key={item.id} className={`flex items-center gap-3 rounded-xl border p-3 ${rarityStyle[def.rarity]}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950/60 text-xl">{def.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-slate-100">{item.name}</h3>
                    <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ color: def.accent, border: `1px solid ${def.accent}55` }}>
                      {rarityLabel[def.rarity]}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">{def.description}</p>
                </div>
                <button className="action-button shrink-0 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400"
                  onClick={() => onPickup(item.id)}>
                  拾取
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ItemList;
