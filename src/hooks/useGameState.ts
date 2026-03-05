import { useState, useEffect } from 'react';
import type { GameState } from '../types/index';
import { rooms, initialPlayer } from '../data/gameData';

const GAME_STORAGE_KEY = 'text-based-tower-game';

export const useGameState = () => {
  // 初始化游戏状态，优先从本地存储加载
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const savedState = localStorage.getItem(GAME_STORAGE_KEY);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
    // 初始状态
    return {
      player: initialPlayer,
      currentRoomId: 'room1',
      rooms: rooms,
      gameOver: false,
      victory: false
    };
  });

  // 监听游戏状态变化，自动保存到本地存储
  useEffect(() => {
    try {
      localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameState));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [gameState]);

  // 重置游戏
  const resetGame = () => {
    setGameState({
      player: initialPlayer,
      currentRoomId: 'room1',
      rooms: rooms,
      gameOver: false,
      victory: false
    });
  };

  return { gameState, setGameState, resetGame };
};