import type { BattleLogEntry, LogKind } from '../types/index';

let seq = 0;

export const makeBattleLog = (round: number, text: string, kind: LogKind): BattleLogEntry => {
  seq += 1;
  return { id: `entry-${Date.now()}-${seq}`, round, text, kind };
};
