import { useState, useEffect, useCallback } from 'react';
import { Encounter, Enemy } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'dm-console-encounters';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encounter));
  }, [encounter]);

  const addEnemy = useCallback((enemy: Omit<Enemy, 'id' | 'conditions' | 'tags'>) => {
    setEncounter(prev => ({
      ...prev,
      enemies: [...prev.enemies, { ...enemy, id: uuidv4(), conditions: [], tags: [] }]
    }));
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
      const newEnemy = { ...enemy, id: uuidv4() };
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

  return {
    encounter,
    addEnemy,
    updateEnemy,
    removeEnemy,
    duplicateEnemy,
    setEncounterName,
    clearEncounter,
    nextTurn,
    setActiveTurnId
  };
}
