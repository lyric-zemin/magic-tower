import type { MonsterTemplate } from '../types/index';

export const monsterTemplates: MonsterTemplate[] = [
  { id: 'goblin', name: '哥布林斥候', icon: '👺', element: 'poison', traits: [], hp: 22, attack: 6, defense: 2, exp: 12, gold: 6, threat: 1, description: '游荡在底层走廊的掠食者，行动敏捷但缺乏章法。', drops: ['potion', 'key'] },
  { id: 'skeleton', name: '骷髅兵', icon: '💀', element: 'none', traits: [], hp: 32, attack: 8, defense: 3, exp: 18, gold: 9, threat: 1, description: '被魔法唤醒的亡者，挥舞着锈蚀的短剑。', drops: ['sword', 'potion'] },
  { id: 'bat', name: '洞穴蝠群', icon: '🦇', element: 'dark', traits: ['doubleStrike'], hp: 26, attack: 6, defense: 1, exp: 16, gold: 7, threat: 2, description: '成群扑击，每回合连续攻击两次。', drops: ['potion'] },
  { id: 'spider', name: '毒牙蜘蛛', icon: '🕷️', element: 'poison', traits: ['poison'], hp: 30, attack: 7, defense: 2, exp: 20, gold: 10, threat: 2, description: '牙齿带有剧毒，每次命中都会留下持续性伤害。', drops: ['potion', 'bomb'] },
  { id: 'slime', name: '腐蚀史莱姆', icon: '🟢', element: 'poison', traits: ['split'], hp: 38, attack: 8, defense: 4, exp: 24, gold: 12, threat: 2, description: '被击碎后会分裂成两只小史莱姆。', drops: ['potion', 'hiPotion'] },
  { id: 'goblinBrute', name: '哥布林蛮兵', icon: '👹', element: 'none', traits: ['armored'], hp: 52, attack: 10, defense: 7, exp: 32, gold: 16, threat: 3, description: '披着厚甲的先锋，普通攻击很难破防。', drops: ['shield', 'key'] },
  { id: 'wraith', name: '墓穴幽魂', icon: '👻', element: 'dark', traits: ['curse'], hp: 46, attack: 11, defense: 3, exp: 34, gold: 18, threat: 3, description: '诅咒之力会削弱玩家的攻击。', drops: ['expScroll', 'potion'] },
  { id: 'gargoyle', name: '石像鬼守卫', icon: '🗿', element: 'none', traits: ['bossPhase', 'armored'], hp: 110, attack: 15, defense: 10, exp: 90, gold: 60, threat: 5, description: '第一层的守护者，重伤时会激活石肤进入狂暴。', drops: ['steelSword', 'masterKey'] },
  { id: 'flameImp', name: '火焰小鬼', icon: '🔥', element: 'fire', traits: ['critical'], hp: 58, attack: 13, defense: 5, exp: 40, gold: 20, threat: 3, description: '暴躁的火元素，每隔几回合会爆发重击。', drops: ['attackGem', 'bomb'] },
  { id: 'iceElemental', name: '寒霜元素', icon: '❄️', element: 'ice', traits: ['armored'], hp: 72, attack: 14, defense: 9, exp: 48, gold: 24, threat: 4, description: '凝结的寒冰外壳大幅削弱物理伤害。', drops: ['defenseGem', 'hiPotion'] },
  { id: 'vampireBat', name: '暗夜吸血蝠', icon: '🩸', element: 'dark', traits: ['lifesteal'], hp: 65, attack: 15, defense: 5, exp: 50, gold: 26, threat: 4, description: '攻击时汲取生命，拖延战斗只会让它更强。', drops: ['vampireRing', 'potion'] },
  { id: 'thunderHound', name: '雷鸣猎犬', icon: '⚡', element: 'thunder', traits: ['doubleStrike', 'critical'], hp: 70, attack: 16, defense: 6, exp: 55, gold: 28, threat: 4, description: '迅捷如电，连续攻击并伴随爆发伤害。', drops: ['boots', 'bomb'] },
  { id: 'cursedKnight', name: '诅咒骑士', icon: '🛡️', element: 'dark', traits: ['curse', 'armored'], hp: 95, attack: 17, defense: 11, exp: 70, gold: 36, threat: 5, description: '被黑暗侵蚀的骑士，诅咒与重甲兼备。', drops: ['armor', 'critRing'] },
  { id: 'flameLord', name: '熔火领主', icon: '🌋', element: 'fire', traits: ['bossPhase', 'lifesteal'], hp: 190, attack: 22, defense: 13, exp: 150, gold: 100, threat: 6, description: '第二层的霸主，濒死时喷涌岩浆并吞噬生命。', drops: ['attackGem', 'masterKey', 'hpGem'] },
  { id: 'starWisp', name: '星界精灵', icon: '✨', element: 'thunder', traits: ['critical'], hp: 105, attack: 21, defense: 9, exp: 88, gold: 44, threat: 5, description: '由纯粹星能构成，攻击中蕴含爆发的奥术力量。', drops: ['hpGem', 'expScroll'] },
  { id: 'voidPriest', name: '虚空祭司', icon: '🔮', element: 'dark', traits: ['curse', 'lifesteal'], hp: 120, attack: 23, defense: 10, exp: 100, gold: 50, threat: 6, description: '以虚空之力诅咒敌人，并从中汲取生命。', drops: ['vampireRing', 'teleportScroll'] },
  { id: 'mirrorClone', name: '镜像分身', icon: '🪞', element: 'none', traits: ['split', 'doubleStrike'], hp: 110, attack: 24, defense: 12, exp: 110, gold: 55, threat: 6, description: '被打碎后会化为两个残影继续战斗。', drops: ['steelSword', 'hpGem'] },
  { id: 'shadowDragon', name: '暗影幼龙', icon: '🐉', element: 'dark', traits: ['bossPhase', 'doubleStrike', 'armored'], hp: 230, attack: 28, defense: 16, exp: 180, gold: 120, threat: 7, description: '塔顶的终极守卫，双爪连击并能进入第二形态。', drops: ['masterKey', 'hpGem', 'vampireRing'] }
];

export const monsterById = Object.fromEntries(monsterTemplates.map(m => [m.id, m])) as Record<string, MonsterTemplate>;
