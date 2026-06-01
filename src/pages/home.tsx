import React, { useState, useCallback } from 'react';
import { useEncounter } from '@/hooks/use-encounter';
import { useDice } from '@/hooks/use-dice';
import Header from '@/components/Header';
import AddEnemyForm from '@/components/AddEnemyForm';
import EnemyCard from '@/components/EnemyCard';
import PlayerCard from '@/components/PlayerCard';
import InitiativeTracker from '@/components/InitiativeTracker';
import GlossaryPanel from '@/components/GlossaryPanel';
import DiceRoller from '@/components/DiceRoller';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import useGlossary from '@/hooks/use-glossary';

export default function Home() {
  const { 
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
  } = useEncounter();

  const {
    entries: glossaryEntries,
    addEntry: addGlossaryEntry,
    updateEntry: updateGlossaryEntry,
    removeEntry: removeGlossaryEntry,
    importFromObject: importGlossary,
    clear: clearGlossary
  } = useGlossary();

  const dice = useDice();
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [diceOpen, setDiceOpen] = useState(false);

  const handleExportEncounter = useCallback(() => {
    const payload = JSON.stringify({ encounter, glossary: glossaryEntries });
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const safeName = encounter.name.trim() ? encounter.name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() : 'battle-state';

    anchor.href = url;
    anchor.download = `${safeName}-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success('Battle and glossary exported as JSON.');
  }, [encounter, glossaryEntries]);

  const handleImportEncounter = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (parsed && typeof parsed === 'object' && 'encounter' in parsed && 'glossary' in parsed) {
        loadEncounter((parsed as any).encounter);
        importGlossary((parsed as any).glossary);
        toast.success('Encounter and glossary imported successfully.');
        return;
      }

      if (parsed && typeof parsed === 'object' && 'enemies' in parsed) {
        loadEncounter(parsed);
        toast.success('Encounter imported successfully.');
        return;
      }

      if (Array.isArray(parsed)) {
        importGlossary(parsed);
        toast.success('Glossary imported successfully.');
        return;
      }

      toast.error('Unable to import this file.');
    } catch (error) {
      console.error('Encounter import failed', error);
      toast.error('Unable to import this battle state.');
    }
  }, [loadEncounter, importGlossary]);

  const filteredEnemies = encounter.enemies.filter(e => {
    if (activeOnly && e.currentHp <= 0) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Wrapped addEnemy: accept optional glossaryId passed from AddEnemyForm or GlossaryPanel
  const handleAddEnemy = (enemy: any) => {
    addEnemy(enemy);
  };

  const handleCreateGlossaryEntry = (entry: Omit<Enemy, 'id' | 'conditions' | 'tags'>) => {
    const created = addGlossaryEntry({
      ...entry,
      conditions: [],
      tags: [],
    } as Enemy);
    return created.id;
  };

  // Wrapped update: update encounter then sync back to glossary if linked
  const handleUpdateEnemy = (id: string, updates: Partial<any>) => {
    const existing = encounter.enemies.find(e => e.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    updateEnemy(id, updates);
    if (existing.glossaryId) {
      updateGlossaryEntry(existing.glossaryId, {
        name: merged.name,
        maxHp: merged.maxHp,
        currentHp: merged.currentHp,
        ac: merged.ac,
        initiative: merged.initiative,
        conditions: merged.conditions,
        tags: merged.tags,
        isPlayer: merged.isPlayer,
        imageBase64: merged.imageBase64,
        deathSaves: merged.deathSaves
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      <Header 
        encounterName={encounter.name} 
        setEncounterName={setEncounterName}
        clearEncounter={() => {
          if (confirm('Purge encounter and glossary? This cannot be undone.')) {
            clearEncounter();
            clearGlossary();
            toast('Encounter and glossary cleared.', {
              style: { background: 'hsl(var(--destructive)/0.18)', border: '1px solid hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }
            });
          }
        }}
        onExport={handleExportEncounter}
        onImport={handleImportEncounter}
        diceOpen={diceOpen}
        setDiceOpen={setDiceOpen}
      />
      
      <main className="flex-1 overflow-hidden relative">
        <div className="max-w-7xl mx-auto w-full p-4 lg:p-6 h-full">
          <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6 h-full">
            <aside className="space-y-6">
              <GlossaryPanel
                entries={glossaryEntries}
                addEntry={addGlossaryEntry}
                updateEntry={updateGlossaryEntry}
                removeEntry={removeGlossaryEntry}
                addEnemy={handleAddEnemy}
              />
            </aside>

            <section className="flex flex-col gap-6 h-full">
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 medieval-panel p-4 rounded-xl">
                <div className="flex items-center gap-4 flex-1 w-full xl:w-auto">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search foes..." 
                      className="pl-9 bg-card/60 border-secondary/30 focus-visible:ring-primary font-mono text-sm"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      data-testid="input-search-enemies"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="active-only" 
                      checked={activeOnly}
                      onCheckedChange={setActiveOnly}
                      data-testid="switch-active-only"
                    />
                    <Label htmlFor="active-only" className="text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">Living Only</Label>
                  </div>
                </div>
                <div className="w-full xl:w-auto">
                  <AddEnemyForm onAdd={handleAddEnemy} onCreateGlossaryEntry={handleCreateGlossaryEntry} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 auto-rows-max overflow-y-auto pb-24 h-[calc(100vh-260px)] custom-scrollbar pr-2">
                <AnimatePresence>
                  {filteredEnemies.map(enemy => (
                    enemy.isPlayer ? (
                      <PlayerCard
                        key={enemy.id}
                        enemy={enemy}
                        onUpdate={(updates) => handleUpdateEnemy(enemy.id, updates)}
                        onRemove={() => removeEnemy(enemy.id)}
                        onDuplicate={() => duplicateEnemy(enemy.id)}
                        isActiveTurn={encounter.activeTurnId === enemy.id}
                      />
                    ) : (
                      <EnemyCard 
                        key={enemy.id} 
                        enemy={enemy} 
                        onUpdate={(updates) => handleUpdateEnemy(enemy.id, updates)}
                        onRemove={() => removeEnemy(enemy.id)}
                        onDuplicate={() => duplicateEnemy(enemy.id)}
                        isActiveTurn={encounter.activeTurnId === enemy.id}
                      />
                    )
                  ))}
                </AnimatePresence>
                {filteredEnemies.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl bg-card/20">
                    <p className="font-mono text-sm uppercase tracking-widest opacity-50">No foes remain in sight.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        <DiceRoller 
          isOpen={diceOpen} 
          onClose={() => setDiceOpen(false)} 
          dice={dice}
        />
      </main>
    </div>
  );
}
