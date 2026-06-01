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
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import useGlossary from '@/hooks/use-glossary';
import { Enemy } from '@/lib/types';

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
    });
    return created.id;
  };

  // Wrapped update: update only the encounter state; glossary values remain fixed.
  const handleUpdateEnemy = (id: string, updates: Partial<any>) => {
    updateEnemy(id, updates);
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
        <div className="w-full h-full flex gap-3 p-3">
          <aside className="w-[25%] overflow-hidden flex-shrink-0">
            <GlossaryPanel
              entries={glossaryEntries}
              addEntry={addGlossaryEntry}
              updateEntry={updateGlossaryEntry}
              removeEntry={removeGlossaryEntry}
              addEnemy={handleAddEnemy}
            />
          </aside>

          <section className="w-[60%] flex flex-col gap-3 overflow-hidden">
            <div className="flex flex-col items-start justify-between gap-3 medieval-panel p-3 rounded-xl flex-shrink-0">
              <div className="flex items-center gap-3 flex-1 w-full">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search foes..." 
                    className="pl-9 bg-card/60 border-secondary/30 focus-visible:ring-primary font-mono text-xs"
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
              <div className="w-full">
                <AddEnemyForm onAdd={handleAddEnemy} onCreateGlossaryEntry={handleCreateGlossaryEntry} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 auto-rows-max overflow-y-auto custom-scrollbar pr-2 flex-1">
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
                  <p className="font-mono text-xs uppercase tracking-widest opacity-50">No foes remain in sight.</p>
                </div>
              )}
            </div>
          </section>

          <aside className="w-[15%] overflow-hidden flex-shrink-0">
            <InitiativeTracker 
              encounter={encounter} 
              nextTurn={nextTurn}
              setActiveTurnId={setActiveTurnId}
            />
          </aside>
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
