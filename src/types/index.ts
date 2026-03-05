// 玩家类型
export interface Player {
  hp: number;        // 生命值
  maxHp: number;     // 最大生命值
  attack: number;    // 攻击力
  defense: number;   // 防御力
  gold: number;      // 金币
  keys: number;      // 钥匙数量
  level: number;     // 等级
  exp: number;       // 经验值
  position: Position; // 位置
}

// 位置类型
export interface Position {
  x: number;
  y: number;
}

// 怪物类型
export interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
  gold: number;
  position: Position;
}

// 物品类型
export type ItemType = 'potion' | 'key' | 'sword' | 'shield' | 'armor';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  effect: number;     // 物品效果值
  position: Position;
}

// 房间类型
export interface Room {
  id: string;
  monsters: Monster[];
  items: Item[];
  exits: {
    north?: string;
    south?: string;
    east?: string;
    west?: string;
  };
  description: string;
  requiresKey?: boolean; // 是否需要钥匙才能进入
}

// 游戏状态类型
export interface GameState {
  player: Player;
  currentRoomId: string;
  rooms: Record<string, Room>;
  gameOver: boolean;
  victory: boolean;
}
