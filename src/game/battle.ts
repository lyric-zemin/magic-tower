import type { BattleLogEntry, BattleOutcome, BattlePreview, LogKind, Monster, Player } from '../types/index';
import { applyExp } from './progression';

let logSeq = 0;

const makeLog = (round: number, text: string, kind: LogKind): BattleLogEntry => {
  logSeq += 1;
  return { id: `log-${Date.now()}-${logSeq}`, round, text, kind };
};

const hasRelic = (player: Player, relic: string): boolean => player.relics.includes(relic);

const armoredReduction = (monster: Monster): number => monster.traits.includes('armored') ? 2 : 0;

const isBerserk = (monster: Monster): boolean =>
  monster.traits.includes('berserk') || (monster.traits.includes('bossPhase') && monster.phase >= 2);

const monsterAttackPower = (monster: Monster): number => {
  const base = monster.attack + (monster.traits.includes('bossPhase') && monster.phase >= 2 ? 3 : 0);
  return isBerserk(monster) ? Math.ceil(base * 1.4) : base;
};

export const grantKillRewards = (player: Player, monster: Monster): { player: Player; messages: string[] } => {
  const result = applyExp(player, monster.exp);
  return {
    player: { ...result.player, gold: result.player.gold + monster.gold },
    messages: result.messages
  };
};

export const createSplitSpawns = (monster: Monster): Monster[] => {
  if (!monster.traits.includes('split')) return [];
  return [0, 1].map(index => ({
    ...monster,
    id: `${monster.id}-echo-${index}-${Date.now()}`,
    name: `${monster.name}残影`,
    hp: Math.ceil(monster.maxHp * 0.25),
    maxHp: Math.ceil(monster.maxHp * 0.25),
    attack: Math.ceil(monster.attack * 0.6),
    defense: Math.max(1, Math.floor(monster.defense * 0.5)),
    exp: Math.ceil(monster.exp * 0.3),
    gold: Math.ceil(monster.gold * 0.3),
    traits: monster.traits.filter(trait => trait !== 'split' && trait !== 'bossPhase'),
    phase: 1,
    position: { x: monster.position.x + index, y: monster.position.y }
  }));
};

export type BattleEvent =
  | { type: 'playerHit'; round: number; damage: number; critical: boolean }
  | { type: 'heal'; round: number; amount: number }
  | { type: 'phase'; round: number }
  | { type: 'monsterHit'; round: number; strike: number; strikes: number; damage: number; critical: boolean }
  | { type: 'poison'; round: number; amount: number }
  | { type: 'lifesteal'; round: number; amount: number }
  | { type: 'curse'; round: number }
  | { type: 'death'; round: number }
  | { type: 'retreat'; round: number };

export interface BattleCoreResult {
  hp: number;
  monsterHp: number;
  phase: number;
  round: number;
  defeated: boolean;
  totalPlayerDamage: number;
  totalMonsterDamage: number;
  events: BattleEvent[];
}

export const simulateBattleCore = (player: Player, monster: Monster, limit = 50): BattleCoreResult => {
  let hp = player.hp;
  let monsterHp = monster.hp;
  let phase = monster.phase;
  let cursePenalty = 0;
  let round = 0;
  let totalPlayerDamage = 0;
  let totalMonsterDamage = 0;
  const events: BattleEvent[] = [];

  const currentMonster = (): Monster => ({ ...monster, hp: monsterHp, phase });

  while (round < limit && hp > 0 && monsterHp > 0) {
    round += 1;
    const activeMonster = currentMonster();
    const crit = hasRelic(player, 'critRing') && round % 5 === 0;
    const baseDamage = Math.max(1, player.attack - cursePenalty - activeMonster.defense - armoredReduction(activeMonster));
    const playerDamage = crit ? Math.ceil(baseDamage * 1.8) : baseDamage;
    monsterHp -= playerDamage;
    totalPlayerDamage += playerDamage;
    events.push({ type: 'playerHit', round, damage: playerDamage, critical: crit });

    if (hasRelic(player, 'vampireRing')) {
      const healed = Math.min(player.maxHp - hp, Math.floor(playerDamage * 0.25));
      if (healed > 0) {
        hp += healed;
        events.push({ type: 'heal', round, amount: healed });
      }
    }

    if (monsterHp <= 0) break;

    if (monster.traits.includes('bossPhase') && phase === 1 && monsterHp <= monster.maxHp / 2) {
      phase = 2;
      events.push({ type: 'phase', round });
    }

    const strikes = monster.traits.includes('doubleStrike') ? 2 : 1;
    for (let strike = 1; strike <= strikes && hp > 0; strike += 1) {
      const attacking = currentMonster();
      let damage = Math.max(1, monsterAttackPower(attacking) - player.defense);
      const monsterCrit = monster.traits.includes('critical') && round % 3 === 0;
      if (monsterCrit) damage = Math.ceil(damage * 1.6);
      hp -= damage;
      totalMonsterDamage += damage;
      events.push({ type: 'monsterHit', round, strike, strikes, damage, critical: monsterCrit });

      if (monster.traits.includes('poison') && round % 2 === 0) {
        hp -= 3;
        totalMonsterDamage += 3;
        events.push({ type: 'poison', round, amount: 3 });
      }
      if (monster.traits.includes('lifesteal')) {
        const healed = Math.min(monster.maxHp - monsterHp, Math.floor(damage * 0.3));
        if (healed > 0) {
          monsterHp += healed;
          events.push({ type: 'lifesteal', round, amount: healed });
        }
      }
      if (monster.traits.includes('curse') && cursePenalty < 5) {
        cursePenalty += 1;
        events.push({ type: 'curse', round });
      }
    }
  }

  const defeated = monsterHp <= 0;
  if (hp <= 0) {
    hp = 0;
    events.push({ type: 'death', round });
  }
  if (round >= limit && monsterHp > 0) {
    events.push({ type: 'retreat', round });
  }

  return {
    hp,
    monsterHp,
    phase,
    round,
    defeated,
    totalPlayerDamage,
    totalMonsterDamage,
    events
  };
};

export const previewBattle = (player: Player, monster: Monster): BattlePreview => {
  let simPlayer = player;
  const queue: Monster[] = [monster];
  let totalRounds = 0;
  let totalPlayerDamage = 0;
  let totalMonsterDamage = 0;
  let allDefeated = true;
  let guard = 0;

  while (queue.length > 0) {
    if (guard >= 10) {
      allDefeated = false;
      break;
    }
    guard += 1;
    const target = queue.shift() as Monster;
    const core = simulateBattleCore(simPlayer, target);
    totalRounds += core.round;
    totalPlayerDamage += core.totalPlayerDamage;
    totalMonsterDamage += core.totalMonsterDamage;
    simPlayer = { ...simPlayer, hp: core.hp };
    if (!core.defeated || core.hp <= 0) {
      allDefeated = false;
      break;
    }
    const reward = grantKillRewards(simPlayer, target);
    simPlayer = { ...reward.player, hp: core.hp };
    queue.unshift(...createSplitSpawns(target));
  }

  const rounds = Math.max(1, totalRounds);
  return {
    playerDamage: Math.max(1, Math.round(totalPlayerDamage / rounds)),
    monsterDamage: Math.round(totalMonsterDamage / rounds),
    rounds,
    hpLoss: Math.max(0, player.hp - simPlayer.hp),
    willWin: allDefeated && simPlayer.hp > 0
  };
};

const appendCoreLogs = (log: BattleLogEntry[], events: BattleEvent[], monsterName: string): void => {
  events.forEach(event => {
    switch (event.type) {
      case 'playerHit':
        log.push(makeLog(event.round, event.critical
          ? `暴击！你对 ${monsterName} 造成 ${event.damage} 点伤害。`
          : `你对 ${monsterName} 造成 ${event.damage} 点伤害。`, event.critical ? 'critical' : 'player'));
        break;
      case 'heal':
        log.push(makeLog(event.round, `血契戒指汲取 ${event.amount} 点生命。`, 'heal'));
        break;
      case 'phase':
        log.push(makeLog(event.round, `${monsterName} 进入第二阶段，攻击大幅提升！`, 'system'));
        break;
      case 'monsterHit':
        log.push(makeLog(event.round, `${monsterName}${event.strikes > 1 ? ` 第 ${event.strike} 击` : ''}造成 ${event.damage} 点伤害${event.critical ? '（爆发）' : ''}。`, 'monster'));
        break;
      case 'poison':
        log.push(makeLog(event.round, `毒素侵蚀，额外损失 ${event.amount} 点生命。`, 'monster'));
        break;
      case 'lifesteal':
        log.push(makeLog(event.round, `${monsterName} 吸取 ${event.amount} 点生命。`, 'system'));
        break;
      case 'curse':
        log.push(makeLog(event.round, '诅咒缠身，本场战斗中攻击力下降。', 'monster'));
        break;
      case 'death':
        log.push(makeLog(event.round, '你倒在了血泊之中……', 'system'));
        break;
      case 'retreat':
        log.push(makeLog(event.round, '战斗过于胶着，你被迫撤退。', 'system'));
        break;
    }
  });
};

export const resolveBattle = (player: Player, monster: Monster, limit = 50): BattleOutcome => {
  const core = simulateBattleCore(player, monster, limit);
  const log: BattleLogEntry[] = [makeLog(0, `与 ${monster.name} 展开战斗！`, 'system')];
  appendCoreLogs(log, core.events, monster.name);

  const reward = core.defeated
    ? grantKillRewards(player, monster)
    : { player, messages: [] as string[] };
  reward.messages.forEach(message => log.push(makeLog(core.round, message, 'loot')));

  const finalPlayer: Player = { ...reward.player, hp: core.hp };

  if (core.defeated) {
    log.push(makeLog(core.round, `击败 ${monster.name}，获得 ${monster.exp} 经验与 ${monster.gold} 金币。`, 'loot'));
  }

  const splitSpawn = core.defeated ? createSplitSpawns(monster) : [];
  if (splitSpawn.length > 0) {
    log.push(makeLog(core.round, `${monster.name} 分裂出两个残影！`, 'system'));
  }

  return {
    player: finalPlayer,
    monster: core.defeated ? null : { ...monster, hp: Math.max(0, core.monsterHp), phase: core.phase },
    log,
    escaped: false,
    defeated: core.defeated,
    splitSpawn
  };
};

export const fleeBattle = (player: Player, monster: Monster): BattleOutcome => {
  const damage = Math.max(1, Math.ceil(player.hp * 0.1));
  const nextPlayer: Player = { ...player, hp: Math.max(0, player.hp - damage) };
  return {
    player: nextPlayer,
    monster: { ...monster },
    log: [makeLog(0, `你挣脱了 ${monster.name}，逃跑时损失 ${damage} 点生命。`, 'system')],
    escaped: true,
    defeated: false,
    splitSpawn: []
  };
};
