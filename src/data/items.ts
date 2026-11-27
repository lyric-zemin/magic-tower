import type { ItemDefinition, ItemType } from '../types/index';

export const itemDefinitions: Record<ItemType, ItemDefinition> = {
  potion: {
    type: 'potion', name: '治疗药水', icon: '🧪', rarity: 'common', effect: 12, price: 12,
    description: '恢复 12 点生命值', accent: '#34D399'
  },
  hiPotion: {
    type: 'hiPotion', name: '强效治疗药水', icon: '⚗️', rarity: 'rare', effect: 35, price: 32,
    description: '恢复 35 点生命值', accent: '#10B981'
  },
  key: {
    type: 'key', name: '黄铜钥匙', icon: '🗝️', rarity: 'common', effect: 1, price: 18,
    description: '开启一扇上锁的门', accent: '#FBBF24'
  },
  masterKey: {
    type: 'masterKey', name: '秘银万能钥匙', icon: '🔑', rarity: 'epic', effect: 3, price: 60,
    description: '获得 3 把钥匙', accent: '#FCD34D'
  },
  sword: {
    type: 'sword', name: '铁剑', icon: '⚔️', rarity: 'common', effect: 3, price: 28,
    description: '永久提升 3 点攻击力', accent: '#94A3B8'
  },
  steelSword: {
    type: 'steelSword', name: '秘银长剑', icon: '🗡️', rarity: 'rare', effect: 8, price: 75,
    description: '永久提升 8 点攻击力', accent: '#7DD3FC'
  },
  shield: {
    type: 'shield', name: '橡木盾', icon: '🛡️', rarity: 'common', effect: 2, price: 24,
    description: '永久提升 2 点防御力', accent: '#A3A3A3'
  },
  armor: {
    type: 'armor', name: '龙鳞甲', icon: '🦾', rarity: 'rare', effect: 5, price: 70,
    description: '永久提升 5 点防御力', accent: '#60A5FA'
  },
  attackGem: {
    type: 'attackGem', name: '赤炎宝石', icon: '💎', rarity: 'epic', effect: 2, price: 90,
    description: '永久提升 2 点攻击力', accent: '#F87171'
  },
  defenseGem: {
    type: 'defenseGem', name: '霜蓝宝石', icon: '🔷', rarity: 'epic', effect: 2, price: 90,
    description: '永久提升 2 点防御力', accent: '#38BDF8'
  },
  hpGem: {
    type: 'hpGem', name: '生命晶核', icon: '❤️‍🔥', rarity: 'epic', effect: 20, price: 100,
    description: '生命上限提升 20 并回满', accent: '#FB7185'
  },
  bomb: {
    type: 'bomb', name: '爆裂炸弹', icon: '💣', rarity: 'common', effect: 18, price: 20,
    description: '拾取时立即对当前房间所有怪物造成 18 点真实伤害', accent: '#FB923C'
  },
  critRing: {
    type: 'critRing', name: '鹰眼戒指', icon: '💍', rarity: 'rare', effect: 20, price: 85,
    description: '装备后每回合有 20% 概率暴击', accent: '#C084FC'
  },
  vampireRing: {
    type: 'vampireRing', name: '血契戒指', icon: '🩸', rarity: 'epic', effect: 25, price: 120,
    description: '装备后将造成伤害的 25% 转化为治疗', accent: '#E879F9'
  },
  boots: {
    type: 'boots', name: '疾风之靴', icon: '🥾', rarity: 'rare', effect: 1, price: 55,
    description: '装备后可在战斗中逃跑', accent: '#4ADE80'
  },
  teleportScroll: {
    type: 'teleportScroll', name: '回城卷轴', icon: '📜', rarity: 'rare', effect: 1, price: 40,
    description: '拾取时立即返回本层入口', accent: '#A78BFA'
  },
  goldBag: {
    type: 'goldBag', name: '金币袋', icon: '💰', rarity: 'common', effect: 30, price: 20,
    description: '获得 30 金币', accent: '#FBBF24'
  },
  expScroll: {
    type: 'expScroll', name: '智慧卷轴', icon: '📖', rarity: 'rare', effect: 30, price: 45,
    description: '获得 30 点经验值', accent: '#22D3EE'
  },
  cursedPotion: {
    type: 'cursedPotion', name: '诅咒药剂', icon: '☠️', rarity: 'cursed', effect: 10, price: 0,
    description: '拾取后损失 10 点生命值，谨慎选择', accent: '#EF4444'
  }
};

export const itemTypes = Object.keys(itemDefinitions) as ItemType[];

export const shopStock: ItemType[] = [
  'potion', 'hiPotion', 'key', 'sword', 'steelSword', 'shield', 'armor',
  'attackGem', 'defenseGem', 'hpGem', 'critRing', 'vampireRing', 'boots', 'expScroll'
];
