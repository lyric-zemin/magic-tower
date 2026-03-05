import React from 'react';
import type { Item } from '../types/index';

interface ItemListProps {
  items: Item[];
  onPickup: (itemId: string) => void;
}

const ItemList: React.FC<ItemListProps> = ({ items, onPickup }) => {
  if (items.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-blue-500/20">
        <h2 className="text-xl font-bold mb-2 text-green-400">物品</h2>
        <p className="text-gray-400">当前房间没有物品</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-blue-500/20">
      <h2 className="text-xl font-bold mb-3 text-green-400">物品</h2>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600 transition-all duration-300 hover:border-green-500/50 hover:shadow-green-500/10">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-green-300">{item.name}</h3>
              <button
                className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                onClick={() => onPickup(item.id)}
              >
                拾取
              </button>
            </div>
            <div className="mt-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">类型:</span>
                <span className="text-green-400">
                  {item.type === 'potion' && '治疗药水'}
                  {item.type === 'key' && '钥匙'}
                  {item.type === 'sword' && '剑'}
                  {item.type === 'shield' && '盾牌'}
                  {item.type === 'armor' && '盔甲'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">效果:</span>
                <span className="text-green-400 font-medium">
                  {item.type === 'potion' && `+${item.effect} 生命值`}
                  {item.type === 'key' && `+${item.effect} 钥匙`}
                  {item.type === 'sword' && `+${item.effect} 攻击力`}
                  {item.type === 'shield' && `+${item.effect} 防御力`}
                  {item.type === 'armor' && `+${item.effect} 防御力`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemList;