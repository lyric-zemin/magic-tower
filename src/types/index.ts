export interface Position {
  x: number;
  y: number;
}

export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export type ItemType =
  | 'potion'
  | 'hiPotion'
  | 'key'
  | 'masterKey'
  | 'sword'
  | 'steelSword'
  | 'shield'
  | 'armor'
  | 'attackGem'
  | 'defenseGem'
  | 'hpGem'
  | 'bomb'
  | 'critRing'
  | 'vampireRing'
  | 'boots'
  | 'teleportScroll'
  | 'goldBag'
  | 'expScroll'
  | 'cursedPotion';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'cursed';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  effect: number;
  position: Position;
}

export interface ItemDefinition {
  type: ItemType;
  name: string;
  icon: string;
  rarity: ItemRarity;
  effect: number;
  price: number;
  description: string;
  accent: string;
}

export type MonsterElement = 'none' | 'fire' | 'ice' | 'thunder' | 'poison' | 'dark';

export type MonsterTrait =
  | 'poison'
  | 'doubleStrike'
  | 'lifesteal'
  | 'armored'
  | 'berserk'
  | 'curse'
  | 'split'
  | 'critical'
  | 'bossPhase';

export interface MonsterTemplate {
  id: string;
  name: string;
  icon: string;
  element: MonsterElement;
  traits: MonsterTrait[];
  hp: number;
  attack: number;
  defense: number;
  exp: number;
  gold: number;
  threat: number;
  description: string;
  drops: ItemType[];
}

export interface Monster extends MonsterTemplate {
  hp: number;
  maxHp: number;
  position: Position;
  phase: number;
}

export type RoomKind = 'start' | 'normal' | 'treasure' | 'shop' | 'elite' | 'boss' | 'stairs' | 'victory';

export interface RoomExits {
  north?: string;
  south?: string;
  east?: string;
  west?: string;
  up?: string;
  down?: string;
}

export interface Room {
  id: string;
  floor: number;
  name: string;
  kind: RoomKind;
  description: string;
  mapX: number;
  mapY: number;
  monsters: Monster[];
  items: Item[];
  exits: RoomExits;
  requiresKey?: boolean;
  shopStock?: ItemType[];
}

export interface Player {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  gold: number;
  keys: number;
  level: number;
  exp: number;
  position: Position;
  relics: string[];
}

export type LogKind = 'system' | 'player' | 'monster' | 'critical' | 'heal' | 'loot';

export interface BattleLogEntry {
  id: string;
  round: number;
  text: string;
  kind: LogKind;
}

export interface GameState {
  player: Player;
  currentRoomId: string;
  rooms: Record<string, Room>;
  gameOver: boolean;
  victory: boolean;
  exploredRoomIds: string[];
  bestiary: string[];
  battleLog: BattleLogEntry[];
}

export interface BattlePreview {
  playerDamage: number;
  monsterDamage: number;
  rounds: number;
  hpLoss: number;
  willWin: boolean;
}

export interface BattleOutcome {
  player: Player;
  monster: Monster | null;
  log: BattleLogEntry[];
  escaped: boolean;
  defeated: boolean;
  splitSpawn: Monster[];
}
