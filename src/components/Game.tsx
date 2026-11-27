import React, { useEffect, useState } from 'react';
import type { Direction, ItemType, Room } from '../types/index';
import { useGameState } from '../hooks/useGameState';
import { FLOOR_NAMES } from '../data/gameData';
import PlayerStats from './PlayerStats';
import RoomDescription from './RoomDescription';
import MonsterList from './MonsterList';
import ItemList from './ItemList';
import Controls from './Controls';
import MiniMap from './MiniMap';
import BattleLog from './BattleLog';
import Shop from './Shop';
import Bestiary from './Bestiary';
import Toast from './Toast';

const Game: React.FC = () => {
  const { gameState, dispatch, resetGame, toast, dismissToast } = useGameState();
  const [shopOpen, setShopOpen] = useState(false);
  const [bestiaryOpen, setBestiaryOpen] = useState(false);

  const currentRoom: Room = gameState.rooms[gameState.currentRoomId];
  const floorRooms = Object.values(gameState.rooms).filter(room => room.floor === currentRoom.floor);

  const handleMove = (direction: Direction) => dispatch({ type: 'move', direction });
  const handleFight = (monsterId: string) => dispatch({ type: 'fight', monsterId });
  const handleFlee = (monsterId: string) => dispatch({ type: 'flee', monsterId });
  const handlePickup = (itemId: string) => dispatch({ type: 'pickup', itemId });
  const handleBuy = (type: ItemType) => dispatch({ type: 'buy', itemType: type });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (shopOpen || bestiaryOpen || gameState.gameOver) return;
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'north', w: 'north', W: 'north', ArrowDown: 'south', s: 'south', S: 'south',
        ArrowLeft: 'west', a: 'west', A: 'west', ArrowRight: 'east', d: 'east', D: 'east',
        q: 'up', Q: 'up', e: 'down', E: 'down'
      };
      const direction = keyMap[event.key];
      if (direction) {
        event.preventDefault();
        dispatch({ type: 'move', direction });
        return;
      }
      if (event.key === 'f' || event.key === 'F') {
        if (currentRoom.monsters[0]) dispatch({ type: 'fight', monsterId: currentRoom.monsters[0].id });
      }
      if (event.key === 'r' || event.key === 'R') {
        if (currentRoom.items[0]) dispatch({ type: 'pickup', itemId: currentRoom.items[0].id });
      }
      if (event.key === 'b' || event.key === 'B') setShopOpen(value => !value);
      if (event.key === 'c' || event.key === 'C') setBestiaryOpen(value => !value);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shopOpen, bestiaryOpen, gameState.gameOver, currentRoom, dispatch]);

  const blocked = currentRoom.monsters.length > 0;

  return (
    <div className="app-shell min-h-dvh text-slate-100">
      <header className="sticky top-0 z-20 border-b border-violet-400/15 bg-[#0B0E1A]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-700 text-lg shadow-lg shadow-violet-900/40">♜</span>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-200 to-indigo-300 sm:text-2xl">
                暗影之塔<span className="hidden sm:inline"> · 魔塔远征</span>
              </h1>
              <p className="hidden text-[10px] uppercase tracking-[0.3em] text-slate-500 sm:block">Shadow Tower Chronicle</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-violet-400/30 px-3 py-1 text-xs text-violet-200 sm:inline">
              {currentRoom.floor} 层 · {FLOOR_NAMES[currentRoom.floor]}
            </span>
            <button onClick={() => setBestiaryOpen(true)} className="header-button">图鉴 <kbd>C</kbd></button>
            <button onClick={resetGame} className="header-button">重开</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-3 pb-28 pt-4 md:px-5 md:pb-8">
        <div className="grid gap-4 lg:grid-cols-[270px_minmax(0,1fr)_250px] md:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="glass-panel h-fit p-4 md:sticky md:top-20">
            <PlayerStats player={gameState.player} />
          </aside>

          <section className="min-w-0 space-y-4">
            <RoomDescription room={currentRoom} canLeave={!blocked} />
            <MonsterList monsters={currentRoom.monsters} player={gameState.player} onFight={handleFight} onFlee={handleFlee} />
            <ItemList
              items={currentRoom.items}
              player={gameState.player}
              hasMonsters={blocked}
              onPickup={handlePickup}
            />
            <div className="hidden md:block">
              <Controls exits={currentRoom.exits} onMove={handleMove} blocked={blocked} />
            </div>
            <BattleLog entries={gameState.battleLog} />
          </section>

          <aside className="hidden space-y-4 lg:block">
            <MiniMap rooms={floorRooms} currentRoomId={currentRoom.id} explored={gameState.exploredRoomIds} />
            <div className="glass-panel space-y-2 p-4">
              <button onClick={() => setShopOpen(true)} disabled={!currentRoom.shopStock} className="action-button w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
                打开商店 <kbd>B</kbd>
              </button>
              <p className="text-[11px] leading-relaxed text-slate-500">战斗快捷键 F · 拾取快捷键 R · 移动方向键或 WASD</p>
            </div>
          </aside>
        </div>

        <div className="mt-4 lg:hidden">
          <MiniMap rooms={floorRooms} currentRoomId={currentRoom.id} explored={gameState.exploredRoomIds} />
          {currentRoom.shopStock && (
            <button onClick={() => setShopOpen(true)} className="action-button mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-500">打开商店</button>
          )}
        </div>
      </main>

      <Controls exits={currentRoom.exits} onMove={handleMove} blocked={blocked} dock />

      {shopOpen && currentRoom.shopStock && (
        <Shop stock={currentRoom.shopStock} player={gameState.player} onBuy={handleBuy} onClose={() => setShopOpen(false)} />
      )}
      {bestiaryOpen && <Bestiary unlocked={gameState.bestiary} onClose={() => setBestiaryOpen(false)} />}
      <Toast toast={toast} onDismiss={dismissToast} />

      {gameState.gameOver && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-md animate-[fadeIn_300ms_ease-out]">
          <div className="modal-sheet w-full max-w-md p-8 text-center">
            <p className="text-5xl">{gameState.victory ? '🏆' : '💀'}</p>
            <h2 className={`mt-4 font-serif text-3xl font-bold ${gameState.victory ? 'text-amber-300' : 'text-red-400'}`}>
              {gameState.victory ? '暗影之塔重归寂静' : '远征在此终结'}
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              {gameState.victory ? '你击败了塔顶守卫，带着传说归来。' : '塔中的黑暗吞噬了你的火把，但故事仍可重来。'}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white/5 p-2"><p className="font-mono text-lg text-violet-200">{gameState.player.level}</p><p className="text-[11px] text-slate-500">等级</p></div>
              <div className="rounded-lg bg-white/5 p-2"><p className="font-mono text-lg text-cyan-200">{gameState.bestiary.length}</p><p className="text-[11px] text-slate-500">图鉴</p></div>
              <div className="rounded-lg bg-white/5 p-2"><p className="font-mono text-lg text-amber-200">{gameState.player.gold}</p><p className="text-[11px] text-slate-500">金币</p></div>
            </div>
            <button onClick={resetGame} className="action-button mt-6 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110">再次远征</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
