import React from 'react';
import type { Player } from '../types/index';

interface PlayerStatsProps {
  player: Player;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player }) => {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold border-b border-gray-700 pb-2 text-center text-blue-300">玩家状态</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">等级:</span>
          <span className="font-bold text-yellow-400">{player.level}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">生命值:</span>
          <span className="font-bold text-red-400">{player.hp}/{player.maxHp}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-red-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">攻击力:</span>
          <span className="font-bold text-green-400">{player.attack}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">防御力:</span>
          <span className="font-bold text-blue-400">{player.defense}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">金币:</span>
          <span className="font-bold text-yellow-300">{player.gold}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">钥匙:</span>
          <span className="font-bold text-purple-400">{player.keys}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">经验值:</span>
          <span className="font-bold text-cyan-400">{player.exp}/{player.level * 100}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${(player.exp / (player.level * 100)) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;