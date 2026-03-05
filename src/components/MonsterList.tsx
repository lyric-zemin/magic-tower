import React from 'react';
import type { Monster } from '../types/index';

interface MonsterListProps {
  monsters: Monster[];
  onFight: (monsterId: string) => void;
}

const MonsterList: React.FC<MonsterListProps> = ({ monsters, onFight }) => {
  if (monsters.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-blue-500/20">
        <h2 className="text-xl font-bold mb-2 text-red-400">怪物</h2>
        <p className="text-gray-400">当前房间没有怪物</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-blue-500/20">
      <h2 className="text-xl font-bold mb-3 text-red-400">怪物</h2>
      <div className="space-y-3">
        {monsters.map(monster => (
          <div key={monster.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600 transition-all duration-300 hover:border-red-500/50 hover:shadow-red-500/10">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-red-300">{monster.name}</h3>
              <button
                className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                onClick={() => onFight(monster.id)}
              >
                战斗
              </button>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">生命值:</span>
                <span className="text-red-400 font-medium">{monster.hp}/{monster.maxHp}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">攻击力:</span>
                <span className="text-orange-400 font-medium">{monster.attack}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">防御力:</span>
                <span className="text-blue-400 font-medium">{monster.defense}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">经验值:</span>
                <span className="text-cyan-400 font-medium">{monster.exp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">金币:</span>
                <span className="text-yellow-400 font-medium">{monster.gold}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonsterList;