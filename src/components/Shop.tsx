import React from 'react';
import type { ItemType, Player } from '../types/index';
import { itemDefinitions } from '../data/items';
import { purchasePrice } from '../game/items';

interface ShopProps {
  stock: ItemType[];
  player: Player;
  onBuy: (type: ItemType) => void;
  onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ stock, player, onBuy, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm animate-[fadeIn_250ms_ease-out]">
      <div className="modal-sheet w-full max-w-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300/70">流动商队</p>
            <h2 className="font-serif text-2xl font-bold text-white">补给与遗物</h2>
            <p className="mt-1 text-xs text-slate-400">当前金币 <span className="font-mono text-amber-300">{player.gold}</span> · 商品有限，售完即止</p>
          </div>
          <button onClick={onClose} aria-label="关闭商店"
            className="touch-manipulation grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/10">✕</button>
        </div>

        <div className="mt-4 grid max-h-[60vh] gap-2 overflow-x-hidden overflow-y-auto pr-1 scroll-thin sm:grid-cols-2">
          {stock.length === 0 && <p className="py-8 text-center text-sm text-slate-500">货架空了，商人摊了摊手。</p>}
          {stock.map((type, index) => {
            const def = itemDefinitions[type];
            const price = purchasePrice(type);
            const affordable = player.gold >= price;
            return (
              <div key={`${type}-${index}`} className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950/60 text-xl">{def.icon}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-100">{def.name}</h3>
                  <p className="truncate text-[11px] text-slate-400">{def.description}</p>
                </div>
                <button
                  disabled={!affordable}
                  onClick={() => onBuy(type)}
                  className={`touch-manipulation min-h-[44px] rounded-lg px-3 text-xs font-semibold transition-all active:scale-95 ${
                    affordable
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110'
                      : 'cursor-not-allowed bg-white/5 text-slate-600'}`}
                >
                  {price} 金币
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Shop;
