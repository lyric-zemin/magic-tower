import type { GameState } from '../types/index';
import { buildInitialRooms, initialPlayer } from '../data/gameData';

const SAVE_KEY = 'shadow-tower-save-v2';
const SAVE_VERSION = 2;

export interface LoadResult {
  state: GameState | null;
  notice: string | null;
}

export const createInitialState = (): GameState => ({
  player: { ...initialPlayer, position: { ...initialPlayer.position }, relics: [] },
  currentRoomId: 'f1r1',
  rooms: buildInitialRooms(),
  gameOver: false,
  victory: false,
  exploredRoomIds: ['f1r1'],
  bestiary: [],
  battleLog: []
});

const isValidState = (value: unknown): value is GameState => {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Partial<GameState>;
  if (!state.player || !state.rooms || typeof state.currentRoomId !== 'string') return false;
  const freshRooms = buildInitialRooms();
  const roomIds = Object.keys(freshRooms);
  if (roomIds.some(id => !state.rooms?.[id])) return false;
  if (!state.rooms[state.currentRoomId]) return false;
  if (!Array.isArray(state.exploredRoomIds) || !Array.isArray(state.bestiary) || !Array.isArray(state.battleLog)) return false;
  return true;
};

export const loadGame = (): LoadResult => {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return { state: createInitialState(), notice: null };

  try {
    const parsed = JSON.parse(raw) as { version?: number; state?: unknown };
    if (parsed.version === SAVE_VERSION && isValidState(parsed.state)) {
      return { state: parsed.state as GameState, notice: null };
    }
  } catch (error) {
    console.error('存档解析失败', error);
  }

  localStorage.removeItem(SAVE_KEY);
  return { state: createInitialState(), notice: '存档版本已更新，游戏已重新开始。' };
};

export const saveGame = (state: GameState): void => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, state }));
  } catch (error) {
    console.error('存档保存失败', error);
  }
};

export const clearSave = (): void => localStorage.removeItem(SAVE_KEY);
