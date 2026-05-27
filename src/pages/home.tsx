import React, { useState } from 'react';
import { useEncounter } from '@/hooks/use-encounter';
import { useDice } from '@/hooks/use-dice';
import Header from '@/components/Header';
import AddEnemyForm from '@/components/AddEnemyForm';
import EnemyCard from '@/components/EnemyCard';
import InitiativeTracker from '@/components/InitiativeTracker';
import DiceRoller from '@/components/DiceRoller';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    setActiveTurnId
  } = useEncounter();

  const dice = useDice();
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [diceOpen, setDiceOpen] = useState(false);

  const filteredEnemies = encounter.enemies.filter(e => {
    if (activeOnly && e.currentHp <= 0) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      <Header 
        encounterName={encounter.name} 
        setEncounterName={setEncounterName}
        clearEncounter={clearEncounter}
        diceOpen={diceOpen}
        setDiceOpen={setDiceOpen}
      />
      
      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col relative z-10 p-4 lg:p-6 overflow-hidden max-w-7xl mx-auto w-full gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sci-fi-panel p-4 rounded-xl border border-border">
                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search enemies..." 
                      className="pl-9 bg-black/40 border-primary/20 focus-visible:ring-primary font-mono text-sm"
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
                    <Label htmlFor="active-only" className="text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">Active Only</Label>
                  </div>
                </div>
                <AddEnemyForm onAdd={addEnemy} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max overflow-y-auto pb-24 h-[calc(100vh-200px)] custom-scrollbar pr-2">
                <AnimatePresence>
                  {filteredEnemies.map(enemy => (
                    <EnemyCard 
                      key={enemy.id} 
                      enemy={enemy} 
                      onUpdate={(updates) => updateEnemy(enemy.id, updates)}
                      onRemove={() => removeEnemy(enemy.id)}
                      onDuplicate={() => duplicateEnemy(enemy.id)}
                      isActiveTurn={encounter.activeTurnId === enemy.id}
                    />
                  ))}
                </AnimatePresence>
                {filteredEnemies.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl bg-card/20 backdrop-blur-sm">
                    <p className="font-mono text-sm uppercase tracking-widest opacity-50">No targets found on sensors.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden xl:block w-80 flex-shrink-0">
               <InitiativeTracker 
                 encounter={encounter} 
                 nextTurn={nextTurn}
                 setActiveTurnId={setActiveTurnId}
               />
            </div>
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
