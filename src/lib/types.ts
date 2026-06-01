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
  // Optional fields for player characters stored alongside enemies
  isPlayer?: boolean;
  imageBase64?: string | null;
  deathSaves?: {
    successes: number;
    failures: number;
  } | null;
  // If the combatant is stable at 0 HP (no longer making death saves)
  stabilized?: boolean;
  // If this combatant was created from a glossary entry, store its glossary id
  glossaryId?: string | null;
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
