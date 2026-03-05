import React from 'react';
import type { Player, Room } from '../types/index';
import { useGameState } from '../hooks/useGameState';
import PlayerStats from './PlayerStats';
import RoomDescription from './RoomDescription';
import MonsterList from './MonsterList';
import ItemList from './ItemList';
import Controls from './Controls';

const Game: React.FC = () => {
  // 使用自定义hook管理游戏状态
  const { gameState, setGameState, resetGame } = useGameState();

  // 获取当前房间
  const currentRoom: Room = gameState.rooms[gameState.currentRoomId];

  // 处理玩家移动
  const handleMove = (direction: 'north' | 'south' | 'east' | 'west') => {
    if (gameState.gameOver) return;

    const nextRoomId = currentRoom.exits[direction];
    if (nextRoomId) {
      // 检查当前房间是否还有怪物
      if (currentRoom.monsters.length > 0) {
        alert('你需要击败当前房间的所有怪物才能离开！');
        return;
      }

      const nextRoom = gameState.rooms[nextRoomId];
      
      // 检查是否需要钥匙
      if (nextRoom.requiresKey) {
        // 检查玩家是否有钥匙
        if (gameState.player.keys > 0) {
          // 消耗一把钥匙并进入房间
          setGameState(prev => ({
            ...prev,
            currentRoomId: nextRoomId,
            player: {
              ...prev.player,
              keys: prev.player.keys - 1, // 消耗一把钥匙
              position: { x: 1, y: 1 } // 重置玩家位置到新房间的起点
            }
          }));
        } else {
          // 没有钥匙，不允许进入
          alert('你需要一把钥匙才能进入这个房间！');
          return;
        }
      } else {
        // 不需要钥匙，直接进入
        setGameState(prev => ({
          ...prev,
          currentRoomId: nextRoomId,
          player: {
            ...prev.player,
            position: { x: 1, y: 1 } // 重置玩家位置到新房间的起点
          }
        }));
      }
    }
  };

  // 处理战斗
  const handleFight = (monsterId: string) => {
    if (gameState.gameOver) return;

    const monster = currentRoom.monsters.find(m => m.id === monsterId);
    if (!monster) return;

    // 战斗逻辑
    let playerHp = gameState.player.hp;
    let monsterHp = monster.hp;

    // 计算伤害
    const playerDamage = Math.max(1, gameState.player.attack - monster.defense);
    const monsterDamage = Math.max(1, monster.attack - gameState.player.defense);

    // 战斗循环
    while (playerHp > 0 && monsterHp > 0) {
      // 玩家攻击
      monsterHp -= playerDamage;
      if (monsterHp <= 0) break;

      // 怪物攻击
      playerHp -= monsterDamage;
    }

    if (playerHp <= 0) {
      // 玩家死亡
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        victory: false
      }));
    } else {
      // 怪物死亡，更新游戏状态
      const updatedRooms = {
        ...gameState.rooms,
        [gameState.currentRoomId]: {
          ...currentRoom,
          monsters: currentRoom.monsters.filter(m => m.id !== monsterId)
        }
      };

      const updatedPlayer = {
        ...gameState.player,
        hp: playerHp,
        exp: gameState.player.exp + monster.exp,
        gold: gameState.player.gold + monster.gold
      };

      // 检查是否升级
      const updatedPlayerAfterLevelUp = checkLevelUp(updatedPlayer);

      setGameState(prev => ({
        ...prev,
        rooms: updatedRooms,
        player: updatedPlayerAfterLevelUp
      }));
    }
  };

  // 检查升级
  const checkLevelUp = (player: Player): Player => {
    const expNeeded = player.level * 100;
    if (player.exp >= expNeeded) {
      return {
        ...player,
        level: player.level + 1,
        exp: player.exp - expNeeded,
        maxHp: player.maxHp + 10,
        hp: player.maxHp + 10,
        attack: player.attack + 2,
        defense: player.defense + 1
      };
    }
    return player;
  };

  // 处理拾取物品
  const handlePickup = (itemId: string) => {
    if (gameState.gameOver) return;

    const item = currentRoom.items.find(i => i.id === itemId);
    if (!item) return;

    const updatedPlayer = { ...gameState.player };

    // 处理不同类型的物品
    switch (item.type) {
      case 'potion':
        updatedPlayer.hp = Math.min(updatedPlayer.maxHp, updatedPlayer.hp + item.effect);
        break;
      case 'key':
        updatedPlayer.keys += item.effect;
        break;
      case 'sword':
        updatedPlayer.attack += item.effect;
        break;
      case 'shield':
      case 'armor':
        updatedPlayer.defense += item.effect;
        break;
    }

    // 更新房间物品
    const updatedRooms = {
      ...gameState.rooms,
      [gameState.currentRoomId]: {
        ...currentRoom,
        items: currentRoom.items.filter(i => i.id !== itemId)
      }
    };

    setGameState(prev => ({
      ...prev,
      rooms: updatedRooms,
      player: updatedPlayer
    }));
  };

  // 检查是否到达终点
  if (gameState.currentRoomId === 'room6' && !gameState.gameOver) {
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      victory: true
    }));
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400 drop-shadow-lg">文字版魔塔游戏</h1>

      {/* 游戏结束或胜利 */}
      {gameState.gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50 p-4 animate-fade-in">
          <h2 className={`text-4xl font-bold mb-4 ${gameState.victory ? 'text-green-400' : 'text-red-400'} animate-pulse`}>
            {gameState.victory ? '恭喜你获胜了！' : '游戏结束'}
          </h2>
          <button 
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            onClick={resetGame}
          >
            重新开始
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl animate-slide-up">
        {/* 左侧：玩家状态 */}
        <div className="w-full md:w-1/4 bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-blue-500/20">
          <PlayerStats player={gameState.player} />
        </div>

        {/* 右侧：游戏主区域 */}
        <div className="w-full md:w-3/4 space-y-4">
          <RoomDescription room={currentRoom} />
          <MonsterList 
            monsters={currentRoom.monsters} 
            onFight={handleFight} 
          />
          <ItemList 
            items={currentRoom.items} 
            onPickup={handlePickup} 
          />
          <Controls 
            exits={currentRoom.exits} 
            onMove={handleMove} 
          />
        </div>
      </div>
    </div>
  );
};

export default Game;