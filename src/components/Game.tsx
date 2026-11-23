import React, { useEffect, useRef, useState } from 'react';
import type { Direction, ItemType, Room } from '../types/index';
import { useGameState } from '../hooks/useGameState';
import { FLOOR_NAMES } from '../data/gameData';
import { monsterById } from '../data/monsters';
import { makeBattleLog } from '../game/log';
import { resolveBattle, fleeBattle } from '../game/battle';
import { applyItem, canAfford, purchasePrice } from '../game/items';
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
  const { gameState, setGameState, resetGame, toast, notify, dismissToast, appendLog } = useGameState();
  const [shopOpen, setShopOpen] = useState(false);
  const [bestiaryOpen, setBestiaryOpen] = useState(false);

  const currentRoom: Room = gameState.rooms[gameState.currentRoomId];
  const floorRooms = Object.values(gameState.rooms).filter(room => room.floor === currentRoom.floor);

  const explore = (ids: string[], roomId: string) => ids.includes(roomId) ? ids : [...ids, roomId];

  const handleMove = (direction: Direction) => {
    if (gameState.gameOver) return;
    if (currentRoom.monsters.length > 0) {
      notify('击败当前房间的所有怪物后才能离开。', 'danger');
      return;
    }
    const nextId = currentRoom.exits[direction];
    if (!nextId) return;
    const nextRoom = gameState.rooms[nextId];
    if (nextRoom.requiresKey && gameState.player.keys <= 0) {
      notify('这扇门需要一把钥匙。', 'danger');
      return;
    }
    setGameState(prev => ({
      ...prev,
      currentRoomId: nextId,
      exploredRoomIds: explore(prev.exploredRoomIds, nextId),
      player: { ...prev.player, keys: nextRoom.requiresKey ? prev.player.keys - 1 : prev.player.keys }
    }));
    notify(`进入 ${nextRoom.name}`);
  };

  const handleFight = (monsterId: string) => {
    if (gameState.gameOver) return;
    const monster = currentRoom.monsters.find(item => item.id === monsterId);
    if (!monster) return;
    const outcome = resolveBattle(gameState.player, monster);
    const remaining = currentRoom.monsters.filter(item => item.id !== monsterId).concat(outcome.splitSpawn);
    const unlocked = outcome.defeated && monsterById[monster.id]
      ? Array.from(new Set([...gameState.bestiary, monster.id]))
      : gameState.bestiary;
    const won = outcome.defeated && currentRoom.kind === 'victory' && remaining.length === 0;

    appendLog(outcome.log);
    setGameState(prev => ({
      ...prev,
      rooms: { ...prev.rooms, [prev.currentRoomId]: { ...currentRoom, monsters: remaining } },
      player: outcome.player,
      bestiary: unlocked,
      gameOver: outcome.player.hp <= 0 || won,
      victory: won
    }));
    notify(outcome.defeated ? `击败 ${monster.name}！` : '你受伤了，先撤退补给吧。', outcome.defeated ? 'success' : 'danger');
  };

  const handleFlee = (monsterId: string) => {
    const monster = currentRoom.monsters.find(item => item.id === monsterId);
    if (!monster) return;
    const outcome = fleeBattle(gameState.player, monster);
    appendLog(outcome.log);
    setGameState(prev => ({ ...prev, player: outcome.player }));
    notify('成功脱离战斗。');
  };

  const handlePickup = (itemId: string) => {
    const item = currentRoom.items.find(entry => entry.id === itemId);
    if (!item) return;
    const result = applyItem(gameState.player, item.type);
    let monsters = currentRoom.monsters;
    let bestiary = gameState.bestiary;
    let currentRoomId = gameState.currentRoomId;
    let exploredRoomIds = gameState.exploredRoomIds;

    if (result.bombDamage > 0) {
      monsters = monsters
        .map(monster => ({ ...monster, hp: Math.max(0, monster.hp - result.bombDamage) }))
        .filter(monster => {
          if (monster.hp > 0) return true;
          if (monsterById[monster.id]) bestiary = Array.from(new Set([...bestiary, monster.id]));
          return false;
        });
      appendLog([makeBattleLog(0, result.message, 'loot')]);
    } else {
      appendLog([makeBattleLog(0, `拾取 ${item.name}：${result.message}`, 'loot')]);
    }

    if (result.teleport) {
      const entrance = floorRooms.find(room => room.kind === 'start');
      if (entrance) {
        currentRoomId = entrance.id;
        exploredRoomIds = explore(exploredRoomIds, entrance.id);
      }
    }

    setGameState(prev => ({
      ...prev,
      currentRoomId,
      exploredRoomIds,
      bestiary,
      player: result.player,
      rooms: {
        ...prev.rooms,
        [gameState.currentRoomId]: {
          ...prev.rooms[gameState.currentRoomId],
          items: prev.rooms[gameState.currentRoomId].items.filter(entry => entry.id !== itemId),
          monsters
        }
      }
    }));
    notify(result.message, item.type === 'cursedPotion' ? 'danger' : 'success');
  };

  const handleBuy = (type: ItemType) => {
    if (!canAfford(gameState.player, type)) {
      notify('金币不足。', 'danger');
      return;
    }
    const result = applyItem(gameState.player, type);
    const stock = [...(currentRoom.shopStock ?? [])];
    const index = stock.indexOf(type);
    if (index >= 0) stock.splice(index, 1);
    setGameState(prev => ({
      ...prev,
      player: { ...result.player, gold: result.player.gold - purchasePrice(type) },
      rooms: {
        ...prev.rooms,
        [prev.currentRoomId]: { ...prev.rooms[prev.currentRoomId], shopStock: stock }
      }
    }));
    notify(`购买成功：${result.message}`, 'success');
  };

  const handlersRef = useRef({ handleMove, handleFight, handlePickup });
  useEffect(() => {
    handlersRef.current = { handleMove, handleFight, handlePickup };
  });

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
        handlersRef.current.handleMove(direction);
        return;
      }
      if (event.key === 'f' || event.key === 'F') {
        if (currentRoom.monsters[0]) handlersRef.current.handleFight(currentRoom.monsters[0].id);
      }
      if (event.key === 'r' || event.key === 'R') {
        if (currentRoom.items[0]) handlersRef.current.handlePickup(currentRoom.items[0].id);
      }
      if (event.key === 'b' || event.key === 'B') setShopOpen(value => !value);
      if (event.key === 'c' || event.key === 'C') setBestiaryOpen(value => !value);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shopOpen, bestiaryOpen, gameState.gameOver, currentRoom]);

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
            <ItemList items={currentRoom.items} onPickup={handlePickup} />
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
