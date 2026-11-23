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

export const previewBattle = (player: Player, monster: Monster): BattlePreview => {
  const playerDamage = Math.max(1, player.attack - monster.defense - armoredReduction(monster));
  const critBonus = hasRelic(player, 'critRing') ? playerDamage * 0.2 : 0;
  const effectiveDamage = playerDamage + critBonus;
  const monsterDamage = Math.max(1, monsterAttackPower(monster) - player.defense) *
    (monster.traits.includes('doubleStrike') ? 2 : 1);
  const rounds = Math.max(1, Math.ceil(monster.hp / effectiveDamage));
  const hpLoss = Math.max(0, (rounds - 1) * monsterDamage);
  return {
    playerDamage: Math.round(effectiveDamage),
    monsterDamage,
    rounds,
    hpLoss,
    willWin: player.hp > hpLoss
  };
};

export const resolveBattle = (player: Player, monster: Monster, limit = 50): BattleOutcome => {
  const log: BattleLogEntry[] = [makeLog(0, `与 ${monster.name} 展开战斗！`, 'system')];
  let hp = player.hp;
  let monsterHp = monster.hp;
  let phase = monster.phase;
  let cursePenalty = 0;
  let defeated = false;
  let round = 0;

  const currentMonster = (): Monster => ({ ...monster, hp: monsterHp, phase });

  while (round < limit && hp > 0 && monsterHp > 0) {
    round += 1;
    const activeMonster = currentMonster();
    const crit = hasRelic(player, 'critRing') && round % 5 === 0;
    const baseDamage = Math.max(1, player.attack - cursePenalty - activeMonster.defense - armoredReduction(activeMonster));
    const playerDamage = crit ? Math.ceil(baseDamage * 1.8) : baseDamage;
    monsterHp -= playerDamage;
    log.push(makeLog(round, crit
      ? `暴击！你对 ${monster.name} 造成 ${playerDamage} 点伤害。`
      : `你对 ${monster.name} 造成 ${playerDamage} 点伤害。`, crit ? 'critical' : 'player'));

    if (hasRelic(player, 'vampireRing')) {
      const healed = Math.min(player.maxHp - hp, Math.floor(playerDamage * 0.25));
      if (healed > 0) {
        hp += healed;
        log.push(makeLog(round, `血契戒指汲取 ${healed} 点生命。`, 'heal'));
      }
    }

    if (monsterHp <= 0) {
      defeated = true;
      break;
    }

    if (monster.traits.includes('bossPhase') && phase === 1 && monsterHp <= monster.maxHp / 2) {
      phase = 2;
      log.push(makeLog(round, `${monster.name} 进入第二阶段，攻击与防御提升！`, 'system'));
    }

    const strikes = monster.traits.includes('doubleStrike') ? 2 : 1;
    for (let strike = 1; strike <= strikes && hp > 0; strike += 1) {
      const attacking = currentMonster();
      let damage = Math.max(1, monsterAttackPower(attacking) - player.defense);
      const monsterCrit = monster.traits.includes('critical') && round % 3 === 0;
      if (monsterCrit) damage = Math.ceil(damage * 1.6);
      hp -= damage;
      log.push(makeLog(round, `${monster.name}${strikes > 1 ? ` 第 ${strike} 击` : ''}造成 ${damage} 点伤害${monsterCrit ? '（爆发）' : ''}。`, 'monster'));

      if (monster.traits.includes('poison') && round % 2 === 0) {
        hp -= 3;
        log.push(makeLog(round, '毒素侵蚀，额外损失 3 点生命。', 'monster'));
      }
      if (monster.traits.includes('lifesteal')) {
        const healed = Math.min(monster.maxHp - monsterHp, Math.floor(damage * 0.3));
        if (healed > 0) {
          monsterHp += healed;
          log.push(makeLog(round, `${monster.name} 吸取 ${healed} 点生命。`, 'system'));
        }
      }
      if (monster.traits.includes('curse') && cursePenalty < 5) {
        cursePenalty += 1;
        log.push(makeLog(round, '诅咒缠身，本场战斗中攻击力下降。', 'monster'));
      }
    }
  }

  if (hp <= 0) {
    hp = 0;
    log.push(makeLog(round, '你倒在了血泊之中……', 'system'));
  }
  if (round >= limit && monsterHp > 0) {
    log.push(makeLog(round, '战斗过于胶着，你被迫撤退。', 'system'));
  }

  const expResult = defeated ? applyExp(player, monster.exp) : { player, levelsGained: 0, messages: [] as string[] };
  expResult.messages.forEach(message => log.push(makeLog(round, message, 'loot')));

  const finalPlayer: Player = {
    ...expResult.player,
    hp,
    gold: defeated ? expResult.player.gold + monster.gold : expResult.player.gold
  };

  if (defeated) {
    log.push(makeLog(round, `击败 ${monster.name}，获得 ${monster.exp} 经验与 ${monster.gold} 金币。`, 'loot'));
  }

  const splitSpawn: Monster[] = [];
  if (defeated && monster.traits.includes('split')) {
    for (let index = 0; index < 2; index += 1) {
      splitSpawn.push({
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
      });
    }
    log.push(makeLog(round, `${monster.name} 分裂出两个残影！`, 'system'));
  }

  return {
    player: finalPlayer,
    monster: defeated ? null : { ...monster, hp: Math.max(0, monsterHp), phase },
    log,
    escaped: false,
    defeated,
    splitSpawn
  };
};

export const fleeBattle = (player: Player, monster: Monster): BattleOutcome => {
  const damage = Math.max(1, Math.ceil(player.maxHp * 0.1));
  const nextPlayer: Player = { ...player, hp: Math.max(1, player.hp - damage) };
  return {
    player: nextPlayer,
    monster: { ...monster },
    log: [makeLog(0, `你挣脱了 ${monster.name}，逃跑时损失 ${damage} 点生命。`, 'system')],
    escaped: true,
    defeated: false,
    splitSpawn: []
  };
};
