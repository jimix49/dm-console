export type Condition = 'Concentrating' | 'Stunned' | 'Poisoned' | 'Prone' | 'Burning';

export const STANDARD_CONDITIONS: Condition[] = ['Concentrating', 'Stunned', 'Poisoned', 'Prone', 'Burning'];

export interface Enemy {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  ac: number;
  initiative: number | null;
  conditions: string[];
  tags: string[];
}

export interface Encounter {
  id: string;
  name: string;
  enemies: Enemy[];
  activeTurnId: string | null;
}

export interface RollResult {
  id: string;
  timestamp: number;
  expression: string;
  total: number;
  breakdown: string;
}
