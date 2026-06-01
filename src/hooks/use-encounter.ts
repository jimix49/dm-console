import { useState, useEffect, useCallback } from 'react';
import { Encounter, Enemy } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'dm-console-encounters';

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');

const isEnemy = (value: unknown): value is Enemy => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;

  return typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.maxHp === 'number'
    && typeof candidate.currentHp === 'number'
    && typeof candidate.ac === 'number'
    && (typeof candidate.initiative === 'number' || candidate.initiative === null)
    && isStringArray(candidate.conditions)
    && isStringArray(candidate.tags);
};

const isEncounter = (value: unknown): value is Encounter => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;

  return typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && (candidate.activeTurnId === null || typeof candidate.activeTurnId === 'string')
    && Array.isArray(candidate.enemies)
    && candidate.enemies.every(isEnemy);
};

export function useEncounter() {
  const [encounter, setEncounter] = useState<Encounter>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load encounter', e);
    }
    return { id: uuidv4(), name: 'New Encounter', enemies: [], activeTurnId: null };
  });

  useEffect(() => {
    try {
      // Don't persist imageBase64 to avoid exceeding localStorage quota
      const toStore = {
        ...encounter,
        enemies: encounter.enemies.map(e => {
          const { imageBase64, ...rest } = e;
          return rest;
        })
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      // If quota exceeded, clear old encounters and retry
      if (e instanceof DOMException && e.code === 22) {
        console.warn('localStorage quota exceeded, clearing old data');
        localStorage.removeItem(STORAGE_KEY);
      } else {
        console.error('Failed to save encounter', e);
      }
    }
  }, [encounter]);

  const addEnemy = useCallback((enemy: Omit<Enemy, 'id' | 'conditions' | 'tags'>) => {
    setEncounter(prev => {
      // Extract base name (remove trailing number if present)
      const baseName = enemy.name.replace(/\s+\d+$/, '');
      
      // Find all enemies with the same base name (with or without numbers)
      const sameNameEnemies = prev.enemies.filter(e => {
        const existingBaseName = e.name.replace(/\s+\d+$/, '');
        return existingBaseName === baseName;
      });

      // Determine the next number
      let nextNumber = 1;
      if (sameNameEnemies.length > 0) {
        // Extract numbers from existing names
        const numbers = sameNameEnemies
          .map(e => {
            const match = e.name.match(/\s+(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(n => n > 0);
        
        // Get the highest number and add 1
        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1;
        } else {
          // If no numbers found, this is the second instance
          nextNumber = 2;
        }
      }

      // Create the numbered name
      const numberedName = `${baseName} ${nextNumber}`;

      return {
        ...prev,
        enemies: [...prev.enemies, { ...enemy, name: numberedName, id: uuidv4(), conditions: [], tags: [] }]
      };
    });
  }, []);

  const updateEnemy = useCallback((id: string, updates: Partial<Enemy>) => {
    setEncounter(prev => ({
      ...prev,
      enemies: prev.enemies.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  }, []);

  const removeEnemy = useCallback((id: string) => {
    setEncounter(prev => ({
      ...prev,
      enemies: prev.enemies.filter(e => e.id !== id),
      activeTurnId: prev.activeTurnId === id ? null : prev.activeTurnId
    }));
  }, []);

  const duplicateEnemy = useCallback((id: string) => {
    setEncounter(prev => {
      const enemy = prev.enemies.find(e => e.id === id);
      if (!enemy) return prev;

      // Extract base name (remove trailing number if present)
      const baseName = enemy.name.replace(/\s+\d+$/, '');
      
      // Find all enemies with the same base name
      const sameNameEnemies = prev.enemies.filter(e => {
        const existingBaseName = e.name.replace(/\s+\d+$/, '');
        return existingBaseName === baseName;
      });

      // Determine the next number
      let nextNumber = 1;
      if (sameNameEnemies.length > 0) {
        const numbers = sameNameEnemies
          .map(e => {
            const match = e.name.match(/\s+(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(n => n > 0);
        
        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1;
        } else {
          nextNumber = 2;
        }
      }

      const numberedName = `${baseName} ${nextNumber}`;
      const newEnemy = { ...enemy, id: uuidv4(), name: numberedName };
      return { ...prev, enemies: [...prev.enemies, newEnemy] };
    });
  }, []);

  const setEncounterName = useCallback((name: string) => {
    setEncounter(prev => ({ ...prev, name }));
  }, []);

  const clearEncounter = useCallback(() => {
    setEncounter({ id: uuidv4(), name: 'New Encounter', enemies: [], activeTurnId: null });
  }, []);

  const nextTurn = useCallback(() => {
    setEncounter(prev => {
      const withInit = prev.enemies.filter(e => e.initiative !== null).sort((a, b) => (b.initiative || 0) - (a.initiative || 0));
      if (withInit.length === 0) return prev;
      
      if (!prev.activeTurnId) {
        return { ...prev, activeTurnId: withInit[0].id };
      }
      const currentIndex = withInit.findIndex(e => e.id === prev.activeTurnId);
      const nextIndex = (currentIndex + 1) % withInit.length;
      return { ...prev, activeTurnId: withInit[nextIndex].id };
    });
  }, []);
  
  const setActiveTurnId = useCallback((id: string | null) => {
    setEncounter(prev => ({ ...prev, activeTurnId: id }));
  }, []);

  const loadEncounter = useCallback((incoming: unknown) => {
    if (!isEncounter(incoming)) {
      throw new Error('Invalid battle file.');
    }
    setEncounter(incoming);
  }, []);

  return {
    encounter,
    addEnemy,
    updateEnemy,
    removeEnemy,
    duplicateEnemy,
    setEncounterName,
    clearEncounter,
    nextTurn,
    setActiveTurnId,
    loadEncounter
  };
}
