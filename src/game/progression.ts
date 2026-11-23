import type { Player } from '../types/index';

export const expToNext = (level: number): number => Math.floor(100 * Math.pow(1.25, level - 1));

export interface ExpResult {
  player: Player;
  levelsGained: number;
  messages: string[];
}

export const applyExp = (player: Player, amount: number): ExpResult => {
  const messages: string[] = [];
  let next: Player = { ...player, exp: player.exp + amount };
  let levelsGained = 0;

  while (next.exp >= expToNext(next.level) && next.level < 99) {
    const needed = expToNext(next.level);
    next = {
      ...next,
      level: next.level + 1,
      exp: next.exp - needed,
      maxHp: next.maxHp + 12,
      hp: next.maxHp + 12,
      attack: next.attack + 3,
      defense: next.defense + 2
    };
    levelsGained += 1;
    messages.push(`升级！达到 ${next.level} 级，生命、攻击与防御大幅提升。`);
  }

  return { player: next, levelsGained, messages };
};
