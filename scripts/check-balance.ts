import { buildInitialRooms, initialPlayer } from '../src/data/gameData';
import { resolveBattle } from '../src/game/battle';
import { applyItem, purchasePrice } from '../src/game/items';
import { expToNext } from '../src/game/progression';
import type { ItemType, Player, Room } from '../src/types/index';

const assert = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(message);
};

const rooms: Record<string, Room> = buildInitialRooms();
let player: Player = { ...initialPlayer, relics: [], keys: 0 };
const unlockedRoomIds: string[] = [];

const enter = (roomId: string): void => {
  const room = rooms[roomId];
  if (room.requiresKey && !unlockedRoomIds.includes(roomId)) {
    assert(player.keys > 0, `进入 ${roomId} 时钥匙不足`);
    player = { ...player, keys: player.keys - 1 };
    unlockedRoomIds.push(roomId);
  }
};

const pickup = (roomId: string, type: ItemType): void => {
  const room = rooms[roomId];
  const item = room.items.find(entry => entry.type === type);
  assert(Boolean(item), `${roomId} 缺少可拾取的 ${type}`);
  if (!item) return;
  const result = applyItem(player, item.type);
  player = result.player;
  room.items = room.items.filter(entry => entry.id !== item.id);
  if (result.bombDamage > 0) {
    room.monsters = room.monsters
      .map(monster => ({ ...monster, hp: Math.max(0, monster.hp - result.bombDamage) }))
      .filter(monster => monster.hp > 0);
  }
};

const buy = (roomId: string, type: ItemType): void => {
  const room = rooms[roomId];
  const price = purchasePrice(type);
  assert(Boolean(room.shopStock?.includes(type)), `${roomId} 未上架 ${type}`);
  assert(player.gold >= price, `${roomId} 金币不足以购买 ${type}（需要 ${price}，现有 ${player.gold}）`);
  const result = applyItem(player, type);
  player = { ...result.player, gold: result.player.gold - price };
  room.shopStock = room.shopStock?.filter(entry => entry !== type);
};

const fightAll = (roomId: string): void => {
  const room = rooms[roomId];
  let guard = 0;
  while (room.monsters.length > 0) {
    assert(guard < 20, `${roomId} 怪物分裂次数异常`);
    guard += 1;
    const monster = room.monsters[0];
    const outcome = resolveBattle(player, monster);
    const rounds = Math.max(0, ...outcome.log.map(entry => entry.round));
    assert(outcome.defeated, `${roomId} 无法击败 ${monster.name}`);
    assert(outcome.player.hp > 0, `${roomId} 击败 ${monster.name} 后生命耗尽`);
    assert(rounds < 50, `${roomId} 与 ${monster.name} 的战斗触发 50 回合上限`);
    player = outcome.player;
    room.monsters = room.monsters.slice(1).concat(outcome.splitSpawn);
  }
};

const checkpoint = (label: string, minLevel: number): void => {
  assert(player.level >= minLevel, `${label} 等级不足：当前 ${player.level}，需要 ${minLevel}`);
  assert(player.hp > 0, `${label} 生命值异常`);
  console.log(`${label}：Lv.${player.level} 生命 ${player.hp}/${player.maxHp} 攻 ${player.attack} 防 ${player.defense} 金币 ${player.gold} 钥匙 ${player.keys}（升级需 ${expToNext(player.level)}）`);
};

const run = (): void => {
  pickup('f1r1', 'potion');
  pickup('f1r1', 'key');
  pickup('f1r2', 'sword');
  pickup('f1r2', 'shield');
  fightAll('f1r3');
  pickup('f1r3', 'potion');
  buy('f1r4', 'sword');
  fightAll('f1r5');
  pickup('f1r5', 'bomb');
  pickup('f1r5', 'hiPotion');
  buy('f1r4', 'shield');
  checkpoint('第一层 Boss 前', 2);

  const keysBeforeBoss = player.keys;
  enter('f1r6');
  assert(player.keys === keysBeforeBoss - 1, '首次进入石像鬼房间未正确扣除钥匙');
  const keysAfterUnlock = player.keys;
  enter('f1r6');
  assert(player.keys === keysAfterUnlock, '重复进入已解锁房间不应再次扣钥匙');
  fightAll('f1r6');
  checkpoint('第一层通关后', 2);

  fightAll('f2r1');
  pickup('f2r1', 'potion');
  fightAll('f2r2');
  pickup('f2r2', 'defenseGem');
  fightAll('f2r3');
  pickup('f2r3', 'critRing');
  buy('f2r4', 'key');
  buy('f2r4', 'hpGem');
  fightAll('f2r5');
  pickup('f2r5', 'boots');
  pickup('f2r5', 'hiPotion');
  checkpoint('第二层 Boss 前', 4);
  enter('f2r6');
  fightAll('f2r6');
  checkpoint('第二层通关后', 4);

  fightAll('f3r1');
  pickup('f3r1', 'hiPotion');
  pickup('f3r2', 'expScroll');
  pickup('f3r2', 'teleportScroll');
  pickup('f3r2', 'hpGem');
  fightAll('f3r3');
  buy('f3r4', 'key');
  buy('f3r4', 'steelSword');
  buy('f3r4', 'armor');
  buy('f3r4', 'vampireRing');
  fightAll('f3r5');
  pickup('f3r5', 'masterKey');
  enter('f3r6');
  fightAll('f3r6');
  checkpoint('第三层通关后', 6);

  assert(player.hp > 0, '击败暗影幼龙后生命值异常');
  console.log('平衡自检通过：三层均可通关，钥匙与回合数检查正常。');
};

run();
