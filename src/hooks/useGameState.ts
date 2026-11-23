import { useCallback, useEffect, useRef, useState } from 'react';
import type { BattleLogEntry, GameState } from '../types/index';
import { clearSave, createInitialState, loadGame, saveGame } from '../game/save';

export interface ToastMessage {
  id: number;
  text: string;
  tone: 'info' | 'success' | 'danger';
}

let toastSeq = 0;

export const useGameState = () => {
  const initialRef = useRef(loadGame());
  const [gameState, setGameState] = useState<GameState>(initialRef.current.state ?? createInitialState());
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (initialRef.current.notice) {
      setToast({ id: ++toastSeq, text: initialRef.current.notice, tone: 'info' });
      initialRef.current.notice = null;
    }
  }, []);

  useEffect(() => {
    saveGame(gameState);
  }, [gameState]);

  const notify = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    setToast({ id: ++toastSeq, text, tone });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const appendLog = useCallback((entries: BattleLogEntry[]) => {
    if (entries.length === 0) return;
    setGameState(prev => ({ ...prev, battleLog: [...prev.battleLog, ...entries].slice(-60) }));
  }, []);

  const resetGame = useCallback(() => {
    clearSave();
    setGameState(createInitialState());
    setToast({ id: ++toastSeq, text: '新的冒险开始了。', tone: 'success' });
  }, []);

  return { gameState, setGameState, resetGame, toast, notify, dismissToast, appendLog };
};
