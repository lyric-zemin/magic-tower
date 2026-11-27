import type { ItemType, Player } from '../types/index';
import { itemDefinitions } from '../data/items';
import { applyExp } from './progression';

export interface ItemApplication {
  player: Player;
  message: string;
  bombDamage: number;
  teleport: boolean;
}

const addRelic = (player: Player, relic: string): Player =>
  player.relics.includes(relic) ? player : { ...player, relics: [...player.relics, relic] };

export const applyItem = (player: Player, type: ItemType): ItemApplication => {
  const def = itemDefinitions[type];
  const base = { bombDamage: 0, teleport: false };

  switch (type) {
    case 'potion':
    case 'hiPotion': {
      const healed = Math.min(player.maxHp - player.hp, def.effect);
      return { ...base, player: { ...player, hp: player.hp + healed }, message: `恢复 ${healed} 点生命值。` };
    }
    case 'key':
    case 'masterKey':
      return { ...base, player: { ...player, keys: player.keys + def.effect }, message: `获得 ${def.effect} 把钥匙。` };
    case 'sword':
    case 'steelSword':
      return { ...base, player: { ...player, attack: player.attack + def.effect }, message: `攻击力提升 ${def.effect} 点。` };
    case 'shield':
    case 'armor':
      return { ...base, player: { ...player, defense: player.defense + def.effect }, message: `防御力提升 ${def.effect} 点。` };
    case 'attackGem':
      return { ...base, player: { ...player, attack: player.attack + def.effect }, message: `攻击力提升 ${def.effect} 点。` };
    case 'defenseGem':
      return { ...base, player: { ...player, defense: player.defense + def.effect }, message: `防御力提升 ${def.effect} 点。` };
    case 'hpGem':
      return { ...base, player: { ...player, maxHp: player.maxHp + def.effect, hp: player.maxHp + def.effect }, message: `生命上限提升 ${def.effect} 点并回满。` };
    case 'bomb':
      return { ...base, bombDamage: def.effect, player, message: `对房内所有怪物造成 ${def.effect} 点真实伤害。` };
    case 'critRing':
      return { ...base, player: addRelic(player, 'critRing'), message: '装备鹰眼戒指，攻击有几率暴击。' };
    case 'vampireRing':
      return { ...base, player: addRelic(player, 'vampireRing'), message: '装备血契戒指，攻击可汲取生命。' };
    case 'boots':
      return { ...base, player: addRelic(player, 'boots'), message: '装备疾风之靴，战斗中可以逃跑。' };
    case 'teleportScroll':
      return { ...base, teleport: true, player, message: '回城卷轴生效，返回本层入口。' };
    case 'goldBag':
      return { ...base, player: { ...player, gold: player.gold + def.effect }, message: `获得 ${def.effect} 金币。` };
    case 'expScroll': {
      const result = applyExp(player, def.effect);
      return { ...base, player: result.player, message: `获得 ${def.effect} 经验值。` };
    }
    case 'cursedPotion':
      return { ...base, player: { ...player, hp: Math.max(1, player.hp - def.effect) }, message: `诅咒发作，损失 ${def.effect} 点生命值。` };
    default:
      return { ...base, player, message: `${def.name} 无法使用。` };
  }
};

export interface ItemAvailability {
  allowed: boolean;
  reason?: string;
}

const healingTypes: ItemType[] = ['potion', 'hiPotion'];
const relicTypes: ItemType[] = ['critRing', 'vampireRing', 'boots'];

export const canPickupItem = (player: Player, type: ItemType, hasMonsters = false): ItemAvailability => {
  if (healingTypes.includes(type) && player.hp >= player.maxHp) {
    return { allowed: false, reason: '生命已满' };
  }
  if (relicTypes.includes(type) && player.relics.includes(type)) {
    return { allowed: false, reason: '遗物已装备' };
  }
  if (type === 'bomb' && !hasMonsters) {
    return { allowed: false, reason: '当前房间没有怪物' };
  }
  return { allowed: true };
};

export const purchasePrice = (type: ItemType): number => itemDefinitions[type].price;

export const canBuyItem = (player: Player, type: ItemType): ItemAvailability => {
  const price = purchasePrice(type);
  if (price <= 0) return { allowed: false, reason: '此物无法购买' };
  if (player.gold < price) return { allowed: false, reason: '金币不足' };
  if (type === 'bomb') return { allowed: false, reason: '炸弹只对房间怪物生效' };
  const pickup = canPickupItem(player, type, true);
  if (!pickup.allowed) return pickup;
  return { allowed: true };
};

export const canAfford = (player: Player, type: ItemType): boolean => {
  const price = purchasePrice(type);
  return price > 0 && player.gold >= price;
};
