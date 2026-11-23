import type { Item, ItemType, Monster, Player, Position, Room, RoomKind, RoomExits } from '../types/index';
import { itemDefinitions, shopStock } from './items';
import { monsterById } from './monsters';

let itemSeq = 0;

const makeItem = (type: ItemType, x: number, y: number): Item => {
  const def = itemDefinitions[type];
  itemSeq += 1;
  return { id: `item${itemSeq}`, name: def.name, type, effect: def.effect, position: { x, y } };
};

const makeMonster = (templateId: string, x: number, y: number): Monster => {
  const template = monsterById[templateId];
  return { ...template, hp: template.hp, maxHp: template.hp, position: { x, y }, phase: 1 };
};

interface RoomConfig {
  id: string;
  floor: number;
  name: string;
  kind: RoomKind;
  description: string;
  mapX: number;
  mapY: number;
  monsters?: [string, number, number][];
  items?: [ItemType, number, number][];
  exits: RoomExits;
  requiresKey?: boolean;
  shop?: boolean;
}

const roomConfigs: RoomConfig[] = [
  {
    id: 'f1r1', floor: 1, name: '塔基入口', kind: 'start',
    description: '潮湿的石阶通向黑暗深处。墙角的火把摇曳，照出一地散落的补给。',
    mapX: 0, mapY: 0,
    monsters: [], items: [['potion', 3, 2], ['key', 2, 4]],
    exits: { east: 'f1r2', south: 'f1r3' }
  },
  {
    id: 'f1r2', floor: 1, name: '遗落军械库', kind: 'treasure',
    description: '锈蚀的武器架倒在一旁，一件仍泛着寒光的铁剑躺在残破的木箱上。',
    mapX: 1, mapY: 0,
    monsters: [], items: [['sword', 2, 2], ['shield', 4, 3]],
    exits: { west: 'f1r1', south: 'f1r4' }
  },
  {
    id: 'f1r3', floor: 1, name: '毒蛛巢穴', kind: 'normal',
    description: '蛛网密布的通道里传来细碎的爬行声，绿色毒液顺着墙壁滴落。',
    mapX: 0, mapY: 1,
    monsters: [['goblin', 2, 2], ['spider', 4, 3]], items: [['potion', 1, 4]],
    exits: { north: 'f1r1', east: 'f1r4' }
  },
  {
    id: 'f1r4', floor: 1, name: '流浪商人营地', kind: 'shop',
    description: '一名披着斗篷的商人守着铺满杂物的摊位：“金币？在这里能买到活下去的机会。”',
    mapX: 1, mapY: 1, monsters: [], items: [],
    exits: { north: 'f1r2', west: 'f1r3', east: 'f1r5' }, shop: true
  },
  {
    id: 'f1r5', floor: 1, name: '精英岗哨', kind: 'elite',
    description: '两名重甲守卫把守着通往上层的阶梯，幽魂在他们身侧低语。',
    mapX: 2, mapY: 1,
    monsters: [['goblinBrute', 2, 2], ['wraith', 4, 3]], items: [['bomb', 1, 4], ['hiPotion', 4, 1]],
    exits: { west: 'f1r4', north: 'f1r6' }
  },
  {
    id: 'f1r6', floor: 1, name: '石像鬼大厅', kind: 'boss',
    description: '巨大的石像从穹顶垂下双眼，沉睡千年的守卫因你的到来而睁开。',
    mapX: 2, mapY: 0,
    monsters: [['gargoyle', 3, 3]], items: [],
    exits: { south: 'f1r5', up: 'f2r1' }, requiresKey: true
  },
  {
    id: 'f2r1', floor: 2, name: '熔岩入口', kind: 'start',
    description: '空气灼热，脚下岩浆沟渠发出低沉的轰鸣。第一层的阶梯在身后闭合。',
    mapX: 0, mapY: 0,
    monsters: [['flameImp', 3, 3]], items: [['potion', 1, 2]],
    exits: { east: 'f2r2', south: 'f2r3', down: 'f1r6' }
  },
  {
    id: 'f2r2', floor: 2, name: '冰封回廊', kind: 'normal',
    description: '与熔岩仅一墙之隔，这里却凝结着永不消融的寒霜。',
    mapX: 1, mapY: 0,
    monsters: [['iceElemental', 3, 2]], items: [['defenseGem', 4, 4]],
    exits: { west: 'f2r1', south: 'f2r4' }
  },
  {
    id: 'f2r3', floor: 2, name: '血蝠洞窟', kind: 'normal',
    description: '倒挂的蝠群在黑暗中闪烁着猩红的眼睛，一只戒指落在石台上。',
    mapX: 0, mapY: 1,
    monsters: [['vampireBat', 2, 2], ['bat', 4, 3]], items: [['critRing', 1, 4]],
    exits: { north: 'f2r1', east: 'f2r4' }
  },
  {
    id: 'f2r4', floor: 2, name: '熔岩集市', kind: 'shop',
    description: '岩浆映红了摊位上的商品，商人对你咧嘴一笑：“向着更深处去？”',
    mapX: 1, mapY: 1, monsters: [], items: [],
    exits: { north: 'f2r2', west: 'f2r3', east: 'f2r5' }, shop: true
  },
  {
    id: 'f2r5', floor: 2, name: '雷鸣之庭', kind: 'elite',
    description: '闪电在金属庭院里来回跳跃，骑士的铠甲折射出刺眼的光。',
    mapX: 2, mapY: 1,
    monsters: [['thunderHound', 2, 2], ['cursedKnight', 4, 3]], items: [['boots', 1, 4], ['hiPotion', 4, 1]],
    exits: { west: 'f2r4', north: 'f2r6' }
  },
  {
    id: 'f2r6', floor: 2, name: '熔火王座', kind: 'boss',
    description: '岩浆凝结成王座，熔火领主缓缓站起，整座塔都在震颤。',
    mapX: 2, mapY: 0,
    monsters: [['flameLord', 3, 3]], items: [],
    exits: { south: 'f2r5', up: 'f3r1' }, requiresKey: true
  },
  {
    id: 'f3r1', floor: 3, name: '星界阶梯', kind: 'start',
    description: '墙壁化为深邃的星空，漂浮的星屑在指尖流转。',
    mapX: 0, mapY: 0,
    monsters: [['starWisp', 3, 3]], items: [['hiPotion', 1, 2]],
    exits: { east: 'f3r2', south: 'f3r3', down: 'f2r6' }
  },
  {
    id: 'f3r2', floor: 3, name: '秘法书房', kind: 'treasure',
    description: '无数卷轴悬浮在半空，知识与力量的代价在此变得模糊。',
    mapX: 1, mapY: 0,
    monsters: [], items: [['expScroll', 2, 2], ['teleportScroll', 4, 3], ['hpGem', 3, 4]],
    exits: { west: 'f3r1', south: 'f3r4' }
  },
  {
    id: 'f3r3', floor: 3, name: '虚空回响', kind: 'normal',
    description: '虚空祭司的吟唱在走廊里回荡，每一次低语都像在剥蚀意志。',
    mapX: 0, mapY: 1,
    monsters: [['voidPriest', 2, 2], ['wraith', 4, 3]], items: [],
    exits: { north: 'f3r1', east: 'f3r4' }
  },
  {
    id: 'f3r4', floor: 3, name: '星尘商栈', kind: 'shop',
    description: '商人悬浮在星尘之上：“最后的补给，愿你用得上。”',
    mapX: 1, mapY: 1, monsters: [], items: [],
    exits: { north: 'f3r2', west: 'f3r3', east: 'f3r5' }, shop: true
  },
  {
    id: 'f3r5', floor: 3, name: '镜厅', kind: 'elite',
    description: '无数面镜子映出你的身影，其中一些并不与你同步。',
    mapX: 2, mapY: 1,
    monsters: [['mirrorClone', 2, 2], ['cursedKnight', 4, 3]], items: [['masterKey', 1, 4]],
    exits: { west: 'f3r4', north: 'f3r6' }
  },
  {
    id: 'f3r6', floor: 3, name: '暗影王座', kind: 'victory',
    description: '幼龙盘踞在王座之上，塔顶的风声如同远古的咆哮。击败它，暗影之塔便重归寂静。',
    mapX: 2, mapY: 0,
    monsters: [['shadowDragon', 3, 3]], items: [],
    exits: { south: 'f3r5' }, requiresKey: true
  }
];

const buildRooms = (): Record<string, Room> => {
  const result: Record<string, Room> = {};
  roomConfigs.forEach(config => {
    result[config.id] = {
      id: config.id,
      floor: config.floor,
      name: config.name,
      kind: config.kind,
      description: config.description,
      mapX: config.mapX,
      mapY: config.mapY,
      monsters: (config.monsters ?? []).map(([id, x, y]) => makeMonster(id, x, y)),
      items: (config.items ?? []).map(([type, x, y]) => makeItem(type, x, y)),
      exits: config.exits,
      requiresKey: config.requiresKey,
      shopStock: config.shop ? [...shopStock] : undefined
    };
  });
  return result;
};

export const buildInitialRooms = buildRooms;

export const initialPlayer: Player = {
  hp: 60,
  maxHp: 60,
  attack: 12,
  defense: 6,
  gold: 15,
  keys: 0,
  level: 1,
  exp: 0,
  position: { x: 1, y: 1 } as Position,
  relics: []
};

export const FLOOR_NAMES: Record<number, string> = {
  1: '暗影地牢',
  2: '熔岩深渊',
  3: '星空之塔'
};
