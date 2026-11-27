import type { ActionFeedback, BattleLogEntry, Direction, FeedbackTone, GameAction, GameState, ItemType, Monster, Player } from '../types/index';
import { monsterById } from '../data/monsters';
import { fleeBattle, grantKillRewards, resolveBattle } from './battle';
import { applyItem, canBuyItem, canPickupItem, purchasePrice } from './items';
import { makeBattleLog } from './log';
import { createInitialState } from './save';

export interface ReducerResult {
  state: GameState;
  feedback: ActionFeedback | null;
}

export interface GameStore {
  state: GameState;
  feedback: ActionFeedback | null;
}

let feedbackSeq = 0;

const makeFeedback = (text: string, tone: FeedbackTone = 'info'): ActionFeedback => ({
  id: ++feedbackSeq,
  text,
  tone
});

const unchanged = (state: GameState): ReducerResult => ({ state, feedback: null });

const explore = (ids: string[], roomId: string): string[] =>
  ids.includes(roomId) ? ids : [...ids, roomId];

const unlockBestiary = (ids: string[], monster: Monster): string[] =>
  monsterById[monster.id] ? Array.from(new Set([...ids, monster.id])) : ids;

const appendEntries = (state: GameState, entries: BattleLogEntry[]): GameState => ({
  ...state,
  battleLog: [...state.battleLog, ...entries].slice(-60)
});

const simpleLogs = (texts: string[]): BattleLogEntry[] =>
  texts.map(text => makeBattleLog(0, text, 'loot'));

const applyBombDamage = (
  player: Player,
  monsters: Monster[],
  damage: number,
  bestiary: string[]
): { player: Player; monsters: Monster[]; bestiary: string[]; logs: string[] } => {
  let nextPlayer = player;
  let nextBestiary = bestiary;
  const logs: string[] = [];
  const survivors: Monster[] = [];

  monsters.forEach(monster => {
    const hp = Math.max(0, monster.hp - damage);
    if (hp > 0) {
      survivors.push({ ...monster, hp });
      return;
    }
    const reward = grantKillRewards(nextPlayer, monster);
    nextPlayer = reward.player;
    nextBestiary = unlockBestiary(nextBestiary, monster);
    logs.push(`炸弹击败 ${monster.name}，获得 ${monster.exp} 经验与 ${monster.gold} 金币。`);
  });

  return { player: nextPlayer, monsters: survivors, bestiary: nextBestiary, logs };
};

const handleMove = (state: GameState, direction: Direction): ReducerResult => {
  if (state.gameOver) return unchanged(state);
  const current = state.rooms[state.currentRoomId];
  if (current.monsters.length > 0) {
    return { state, feedback: makeFeedback('击败当前房间的所有怪物后才能离开。', 'danger') };
  }
  const nextId = current.exits[direction];
  if (!nextId) return unchanged(state);
  const nextRoom = state.rooms[nextId];
  const needsUnlock = Boolean(nextRoom.requiresKey) && !state.unlockedRoomIds.includes(nextId);
  if (needsUnlock && state.player.keys <= 0) {
    return { state, feedback: makeFeedback('这扇门需要一把钥匙。', 'danger') };
  }
  return {
    state: {
      ...state,
      currentRoomId: nextId,
      exploredRoomIds: explore(state.exploredRoomIds, nextId),
      unlockedRoomIds: needsUnlock ? explore(state.unlockedRoomIds, nextId) : state.unlockedRoomIds,
      player: { ...state.player, keys: needsUnlock ? state.player.keys - 1 : state.player.keys }
    },
    feedback: makeFeedback(`进入 ${nextRoom.name}`)
  };
};

const handleFight = (state: GameState, monsterId: string): ReducerResult => {
  if (state.gameOver) return unchanged(state);
  const current = state.rooms[state.currentRoomId];
  const monster = current.monsters.find(entry => entry.id === monsterId);
  if (!monster) return unchanged(state);

  const outcome = resolveBattle(state.player, monster);
  const remaining = current.monsters.filter(entry => entry.id !== monsterId).concat(outcome.splitSpawn);
  const won = outcome.defeated && current.kind === 'victory' && remaining.length === 0;
  let next: GameState = {
    ...state,
    rooms: { ...state.rooms, [state.currentRoomId]: { ...current, monsters: remaining } },
    player: outcome.player,
    bestiary: outcome.defeated ? unlockBestiary(state.bestiary, monster) : state.bestiary,
    gameOver: outcome.player.hp <= 0 || won,
    victory: won
  };
  next = appendEntries(next, outcome.log);
  return {
    state: next,
    feedback: makeFeedback(
      outcome.defeated ? `击败 ${monster.name}！` : '你受伤了，先撤退补给吧。',
      outcome.defeated ? 'success' : 'danger'
    )
  };
};

const handleFlee = (state: GameState, monsterId: string): ReducerResult => {
  if (state.gameOver) return unchanged(state);
  const current = state.rooms[state.currentRoomId];
  const monster = current.monsters.find(entry => entry.id === monsterId);
  if (!monster) return unchanged(state);
  if (!state.player.relics.includes('boots')) {
    return { state, feedback: makeFeedback('需要疾风之靴才能逃跑。', 'danger') };
  }

  const outcome = fleeBattle(state.player, monster);
  let next: GameState = {
    ...state,
    player: outcome.player,
    gameOver: outcome.player.hp <= 0,
    victory: false
  };
  next = appendEntries(next, outcome.log);
  return {
    state: next,
    feedback: makeFeedback(
      outcome.player.hp <= 0 ? '逃跑失败，你倒在了塔中。' : '成功脱离战斗。',
      outcome.player.hp <= 0 ? 'danger' : 'success'
    )
  };
};

const handlePickup = (state: GameState, itemId: string): ReducerResult => {
  if (state.gameOver) return unchanged(state);
  const current = state.rooms[state.currentRoomId];
  const item = current.items.find(entry => entry.id === itemId);
  if (!item) return unchanged(state);

  const availability = canPickupItem(state.player, item.type, current.monsters.length > 0);
  if (!availability.allowed) {
    return { state, feedback: makeFeedback(availability.reason ?? '当前无法拾取。', 'danger') };
  }

  const result = applyItem(state.player, item.type);
  let player = result.player;
  let monsters = current.monsters;
  let bestiary = state.bestiary;
  let currentRoomId = state.currentRoomId;
  let exploredRoomIds = state.exploredRoomIds;
  let messages = [`拾取 ${item.name}：${result.message}`];

  if (result.bombDamage > 0) {
    const bomb = applyBombDamage(player, monsters, result.bombDamage, bestiary);
    player = bomb.player;
    monsters = bomb.monsters;
    bestiary = bomb.bestiary;
    messages = [result.message, ...bomb.logs];
  }

  if (result.teleport) {
    const entrance = Object.values(state.rooms).find(room => room.floor === current.floor && room.kind === 'start');
    if (entrance) {
      currentRoomId = entrance.id;
      exploredRoomIds = explore(exploredRoomIds, entrance.id);
    }
  }

  let next: GameState = {
    ...state,
    currentRoomId,
    exploredRoomIds,
    bestiary,
    player,
    rooms: {
      ...state.rooms,
      [state.currentRoomId]: {
        ...state.rooms[state.currentRoomId],
        items: current.items.filter(entry => entry.id !== itemId),
        monsters
      }
    }
  };
  next = appendEntries(next, simpleLogs(messages));
  return {
    state: next,
    feedback: makeFeedback(result.message, item.type === 'cursedPotion' ? 'danger' : 'success')
  };
};

const handleBuy = (state: GameState, type: ItemType): ReducerResult => {
  if (state.gameOver) return unchanged(state);
  const current = state.rooms[state.currentRoomId];
  if (!current.shopStock?.includes(type)) {
    return { state, feedback: makeFeedback('这件商品已售罄。', 'danger') };
  }
  const availability = canBuyItem(state.player, type);
  if (!availability.allowed) {
    return { state, feedback: makeFeedback(availability.reason ?? '当前无法购买。', 'danger') };
  }

  const result = applyItem(state.player, type);
  const price = purchasePrice(type);
  const player = { ...result.player, gold: result.player.gold - price };
  const stock = current.shopStock.filter(entry => entry !== type);
  let next: GameState = {
    ...state,
    player,
    rooms: { ...state.rooms, [state.currentRoomId]: { ...current, shopStock: stock } }
  };
  next = appendEntries(next, simpleLogs([`购买道具：${result.message}`]));
  return { state: next, feedback: makeFeedback(`购买成功：${result.message}`, 'success') };
};

export const gameReducer = (state: GameState, action: GameAction): ReducerResult => {
  switch (action.type) {
    case 'move': return handleMove(state, action.direction);
    case 'fight': return handleFight(state, action.monsterId);
    case 'flee': return handleFlee(state, action.monsterId);
    case 'pickup': return handlePickup(state, action.itemId);
    case 'buy': return handleBuy(state, action.itemType);
    case 'reset': return {
      state: createInitialState(),
      feedback: makeFeedback('新的冒险开始了。', 'success')
    };
    default: return unchanged(state);
  }
};

export const storeReducer = (store: GameStore, action: GameAction): GameStore => {
  const result = gameReducer(store.state, action);
  return { state: result.state, feedback: result.feedback };
};
