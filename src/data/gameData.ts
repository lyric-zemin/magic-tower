import type { Room } from '../types/index';

// 游戏房间数据
export const rooms: Record<string, Room> = {
  'room1': {
    id: 'room1',
    monsters: [
      {
        id: 'monster1',
        name: '哥布林',
        hp: 20,
        maxHp: 20,
        attack: 5,
        defense: 2,
        exp: 10,
        gold: 5,
        position: { x: 2, y: 2 }
      }
    ],
    items: [
      {
        id: 'item1',
        name: '治疗药水',
        type: 'potion',
        effect: 10,
        position: { x: 4, y: 2 }
      },
      {
        id: 'item2',
        name: '钥匙',
        type: 'key',
        effect: 1,
        position: { x: 2, y: 4 }
      }
    ],
    exits: {
      east: 'room2',
      south: 'room3'
    },
    description: '你进入了一个昏暗的房间，角落里有一个哥布林在游荡。'
  },
  'room2': {
    id: 'room2',
    monsters: [
      {
        id: 'monster2',
        name: '骷髅兵',
        hp: 30,
        maxHp: 30,
        attack: 7,
        defense: 3,
        exp: 15,
        gold: 8,
        position: { x: 3, y: 3 }
      }
    ],
    items: [
      {
        id: 'item3',
        name: '剑',
        type: 'sword',
        effect: 3,
        position: { x: 1, y: 2 }
      }
    ],
    exits: {
      west: 'room1',
      north: 'room4'
    },
    description: '这是一个布满灰尘的房间，中央站着一个骷髅兵。'
  },
  'room3': {
    id: 'room3',
    monsters: [],
    items: [
      {
        id: 'item4',
        name: '盾牌',
        type: 'shield',
        effect: 2,
        position: { x: 2, y: 2 }
      }
    ],
    exits: {
      north: 'room1',
      east: 'room5'
    },
    description: '这是一个空房间，地上有一个盾牌。'
  },
  'room4': {
    id: 'room4',
    monsters: [
      {
        id: 'monster3',
        name: '食人魔',
        hp: 50,
        maxHp: 50,
        attack: 10,
        defense: 5,
        exp: 25,
        gold: 15,
        position: { x: 2, y: 2 }
      }
    ],
    items: [],
    exits: {
      south: 'room2',
      east: 'room6'
    },
    description: '你进入了一个大型房间，里面有一个巨大的食人魔。'
  },
  'room5': {
    id: 'room5',
    monsters: [],
    items: [
      {
        id: 'item5',
        name: '盔甲',
        type: 'armor',
        effect: 3,
        position: { x: 3, y: 3 }
      }
    ],
    exits: {
      west: 'room3',
      north: 'room6'
    },
    description: '这是一个宝库，里面有一件盔甲。'
  },
  'room6': {
    id: 'room6',
    monsters: [],
    items: [],
    exits: {
      west: 'room4',
      south: 'room5'
    },
    description: '恭喜！你找到了游戏的终点。',
    requiresKey: true // 需要钥匙才能进入
  }
};

// 初始玩家数据
export const initialPlayer = {
  hp: 50,
  maxHp: 50,
  attack: 10,
  defense: 5,
  gold: 0,
  keys: 0,
  level: 1,
  exp: 0,
  position: { x: 1, y: 1 }
};
