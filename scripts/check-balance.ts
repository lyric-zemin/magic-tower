import { itemTypes } from '../src/data/items';
import { monsterTemplates } from '../src/data/monsters';
import { gameReducer } from '../src/game/reducer';
import { createInitialState } from '../src/game/save';
import type { Direction, GameAction, GameState, ItemType } from '../src/types/index';

const assert = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(message);
};

let store: GameState = createInitialState();

const act = (action: GameAction) => {
  const result = gameReducer(store, action);
  store = result.state;
  return result.feedback;
};

const currentRoom = () => store.rooms[store.currentRoomId];

const move = (direction: Direction, expectedRoomId: string): void => {
  act({ type: 'move', direction });
  assert(store.currentRoomId === expectedRoomId, `移动 ${direction} 后应到达 ${expectedRoomId}，实际为 ${store.currentRoomId}`);
};

const pickup = (type: ItemType): void => {
  const item = currentRoom().items.find(entry => entry.type === type);
  assert(Boolean(item), `${store.currentRoomId} 缺少可拾取的 ${type}`);
  if (!item) return;
  const roomId = store.currentRoomId;
  const feedback = act({ type: 'pickup', itemId: item.id });
  assert(!feedback || feedback.tone !== 'danger', `拾取 ${type} 被拒绝：${feedback?.text}`);
  assert(!store.rooms[roomId].items.some(entry => entry.id === item.id), `${type} 未被拾取`);
};

const buy = (type: ItemType): void => {
  const stockBefore = currentRoom().shopStock?.filter(entry => entry === type).length ?? 0;
  assert(stockBefore > 0, `${store.currentRoomId} 未上架 ${type}`);
  const goldBefore = store.player.gold;
  const feedback = act({ type: 'buy', itemType: type });
  assert(!feedback || feedback.tone !== 'danger', `购买 ${type} 被拒绝：${feedback?.text}`);
  assert(store.player.gold < goldBefore, `购买 ${type} 未扣除金币`);
  assert((currentRoom().shopStock?.filter(entry => entry === type).length ?? 0) === stockBefore - 1, `${type} 未从库存移除`);
};

const fightAll = (label: string): void => {
  let guard = 0;
  while (currentRoom().monsters.length > 0) {
    assert(guard < 20, `${label} 怪物分裂次数异常`);
    guard += 1;
    const monster = currentRoom().monsters[0];
    act({ type: 'fight', monsterId: monster.id });
    assert(store.player.hp > 0, `${label} 击败 ${monster.name} 后生命耗尽`);
    const entries = store.battleLog.slice(-20);
    const maxRound = Math.max(0, ...entries.map(entry => entry.round));
    assert(maxRound < 50, `${label} 与 ${monster.name} 的战斗触发 50 回合上限`);
    assert(entries.some(entry => entry.text.includes(`击败 ${monster.name}`)), `${label} 未记录击败 ${monster.name}`);
  }
};

const checkpoint = (label: string, minLevel: number): void => {
  assert(store.player.level >= minLevel, `${label} 等级不足：当前 ${store.player.level}，需要 ${minLevel}`);
  assert(store.player.hp > 0, `${label} 生命值异常`);
  console.log(`${label}：Lv.${store.player.level} 生命 ${store.player.hp}/${store.player.maxHp} 攻 ${store.player.attack} 防 ${store.player.defense} 金币 ${store.player.gold} 钥匙 ${store.player.keys}`);
};

const assertContentIsReachable = (): void => {
  const fresh = createInitialState();
  const obtainableItems = new Set<ItemType>();
  const usedMonsters = new Set<string>();
  Object.values(fresh.rooms).forEach(room => {
    room.items.forEach(item => obtainableItems.add(item.type));
    room.shopStock?.forEach(type => obtainableItems.add(type));
    room.monsters.forEach(monster => usedMonsters.add(monster.id));
  });
  itemTypes.forEach(type => assert(obtainableItems.has(type), `道具 ${type} 没有获取途径`));
  monsterTemplates.forEach(monster => assert(usedMonsters.has(monster.id), `怪物 ${monster.id} 未出现在关卡中`));
};

const assertBombRewards = (): void => {
  const bombState = createInitialState();
  bombState.currentRoomId = 'f1r3';
  const room = bombState.rooms.f1r3;
  room.items.push({ id: 'test-bomb', name: '爆裂炸弹', type: 'bomb', effect: 18, position: { x: 0, y: 0 } });
  room.monsters[0].hp = 10;
  const before = { exp: bombState.player.exp, gold: bombState.player.gold };
  const result = gameReducer(bombState, { type: 'pickup', itemId: 'test-bomb' });
  assert(result.state.player.exp > before.exp, '炸弹击杀未发放经验');
  assert(result.state.player.gold > before.gold, '炸弹击杀未发放金币');
  assert(result.state.bestiary.includes(room.monsters[0].id), '炸弹击杀未解锁图鉴');
};

const assertFleeCanFail = (): void => {
  const fleeState = createInitialState();
  fleeState.currentRoomId = 'f1r3';
  fleeState.player = { ...fleeState.player, hp: 5, relics: ['boots'] };
  const monsterId = fleeState.rooms.f1r3.monsters[0].id;
  let escapedState = fleeState;
  for (let index = 0; index < 10 && !escapedState.gameOver; index += 1) {
    escapedState = gameReducer(escapedState, { type: 'flee', monsterId }).state;
  }
  assert(escapedState.player.hp === 0, '连续逃跑应逐步扣除生命直至归零');
  assert(escapedState.gameOver, '逃跑导致生命归零时应结算失败');
};

const run = (): void => {
  assertContentIsReachable();
  assertBombRewards();
  assertFleeCanFail();
  store = createInitialState();

  pickup('key');
  move('east', 'f1r2');
  pickup('sword');
  pickup('shield');
  move('west', 'f1r1');
  move('south', 'f1r3');
  fightAll('毒蛛巢穴');
  pickup('potion');
  move('east', 'f1r4');
  buy('sword');
  move('east', 'f1r5');
  pickup('bomb');
  fightAll('精英岗哨');
  pickup('hiPotion');
  move('west', 'f1r4');
  buy('shield');
  move('east', 'f1r5');
  checkpoint('第一层 Boss 前', 2);

  const keysBeforeBoss = store.player.keys;
  move('north', 'f1r6');
  assert(store.player.keys === keysBeforeBoss - 1, '首次进入石像鬼房间未正确扣除钥匙');
  const keysAfterUnlock = store.player.keys;
  fightAll('石像鬼大厅');
  move('south', 'f1r5');
  move('north', 'f1r6');
  assert(store.player.keys === keysAfterUnlock, '重复进入已解锁房间不应再次扣钥匙');
  checkpoint('第一层通关后', 2);

  move('up', 'f2r1');
  fightAll('熔岩入口');
  pickup('potion');
  move('east', 'f2r2');
  fightAll('冰封回廊');
  pickup('defenseGem');
  move('west', 'f2r1');
  move('south', 'f2r3');
  fightAll('血蝠洞窟');
  pickup('critRing');
  move('east', 'f2r4');
  buy('key');
  buy('hpGem');
  move('east', 'f2r5');
  fightAll('雷鸣之庭');
  pickup('boots');
  pickup('hiPotion');
  move('north', 'f2r6');
  fightAll('熔火王座');
  checkpoint('第二层通关后', 4);

  move('up', 'f3r1');
  fightAll('星界阶梯');
  pickup('hiPotion');
  move('east', 'f3r2');
  pickup('expScroll');
  pickup('hpGem');
  pickup('goldBag');
  pickup('teleportScroll');
  assert(store.currentRoomId === 'f3r1', '回城卷轴未返回本层入口');
  move('south', 'f3r3');
  fightAll('虚空回响');
  move('east', 'f3r4');
  buy('key');
  buy('steelSword');
  buy('armor');
  buy('vampireRing');
  move('east', 'f3r5');
  fightAll('镜厅');
  pickup('masterKey');
  move('north', 'f3r6');
  fightAll('暗影王座');
  checkpoint('第三层通关后', 6);
  assert(store.victory && store.gameOver, '击败暗影幼龙后未触发胜利结算');

  console.log('平衡自检通过：三层可通关，内容可达、奖励、逃跑与钥匙边界均正常。');
};

run();
