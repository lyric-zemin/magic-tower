import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { storeReducer, type GameStore } from '../game/reducer';
import { createInitialState, loadGame, saveGame } from '../game/save';

export interface ToastMessage {
  id: number;
  text: string;
  tone: 'info' | 'success' | 'danger';
}

let toastSeq = 0;

export const useGameState = () => {
  const initialRef = useRef(loadGame());
  const [store, dispatch] = useReducer(storeReducer, {
    state: initialRef.current.state ?? createInitialState(),
    feedback: null
  } as GameStore);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const lastFeedbackId = useRef(0);

  const notify = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    setToast({ id: ++toastSeq, text, tone });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

  useEffect(() => {
    if (initialRef.current.notice) {
      notify(initialRef.current.notice, 'info');
      initialRef.current.notice = null;
    }
  }, [notify]);

  useEffect(() => {
    const feedback = store.feedback;
    if (feedback && feedback.id !== lastFeedbackId.current) {
      lastFeedbackId.current = feedback.id;
      notify(feedback.text, feedback.tone);
    }
  }, [store.feedback, notify]);

  useEffect(() => {
    saveGame(store.state);
  }, [store.state]);

  return { gameState: store.state, dispatch, resetGame, toast, notify, dismissToast };
};
