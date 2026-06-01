import { useCallback, useEffect, useState } from 'react';
import { Enemy } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'dm-console-glossary';

export function useGlossary() {
  const [entries, setEntries] = useState<Enemy[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as Enemy[];
    } catch (e) {
      console.error('Failed to load glossary', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const addEntry = useCallback((entry: Omit<Enemy, 'id'>) => {
    const withId: Enemy = { ...entry, id: uuidv4() } as Enemy;
    setEntries(prev => [...prev, withId]);
    return withId;
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<Enemy>) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  const importFromObject = useCallback((incoming: unknown) => {
    if (!Array.isArray(incoming)) throw new Error('Import must be an array');
    const validated = incoming.map((item: any) => ({
      id: item.id || uuidv4(),
      name: String(item.name || 'Unnamed'),
      maxHp: Number(item.maxHp || 0),
      currentHp: Number(item.currentHp ?? item.maxHp ?? 0),
      ac: Number(item.ac || 10),
      initiative: item.initiative ?? null,
      conditions: Array.isArray(item.conditions) ? item.conditions : [],
      tags: Array.isArray(item.tags) ? item.tags : [],
      isPlayer: Boolean(item.isPlayer || false),
      imageBase64: item.imageBase64 ?? null,
      deathSaves: item.deathSaves ?? null
    } as Enemy));
    setEntries(validated);
  }, []);

  const exportToJson = useCallback(() => {
    const payload = JSON.stringify(entries);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `glossary-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [entries]);

  return {
    entries,
    addEntry,
    updateEntry,
    removeEntry,
    clear,
    importFromObject,
    exportToJson
  } as const;
}

export default useGlossary;
