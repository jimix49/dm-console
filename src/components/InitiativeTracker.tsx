import React from 'react';
import { Encounter } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Play, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InitiativeTrackerProps {
  encounter: Encounter;
  nextTurn: () => void;
  setActiveTurnId: (id: string | null) => void;
}

export default function InitiativeTracker({ encounter, nextTurn, setActiveTurnId }: InitiativeTrackerProps) {
  const initList = [...encounter.enemies]
    .filter(e => e.initiative !== null)
    .sort((a, b) => (b.initiative || 0) - (a.initiative || 0));

  if (initList.length === 0) {
    return (
      <div className="medieval-panel border border-border rounded-xl p-3 h-full flex flex-col">
        <h2 className="font-mono uppercase tracking-widest text-xs text-primary mb-2 border-b border-border pb-2">Combat Order</h2>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs font-mono text-center p-2 opacity-50 border border-dashed border-border/50 rounded-lg bg-card/20">
          No combatants have initiative.
        </div>
      </div>
    );
  }

  return (
    <div className="medieval-panel border border-border rounded-xl flex flex-col h-full">
      <div className="p-2 border-b border-border bg-card/60 flex justify-between items-center shrink-0 gap-1">
        <h2 className="font-mono uppercase tracking-widest text-xs text-primary">Turn Order</h2>
        <Button 
          size="sm" 
          onClick={nextTurn}
          className="h-6 text-xs font-mono uppercase bg-primary text-primary-foreground tracking-wider px-2"
          data-testid="button-next-turn"
        >
          Advance <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {initList.map((enemy, index) => {
            const isActive = encounter.activeTurnId === enemy.id;
            const isDefeated = enemy.currentHp <= 0;
            
            return (
              <motion.div
                key={enemy.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setActiveTurnId(enemy.id)}
                className={cn(
                  "p-1.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all relative overflow-hidden group",
                  isActive 
                    ? "bg-primary/10 border-primary shadow-[0_0_10px_rgba(220,150,20,0.12)]" 
                    : "bg-card/20 border-border/40 hover:border-primary/50",
                  isDefeated && !isActive ? "opacity-40" : ""
                )}
                data-testid={`init-item-${enemy.id}`}
              >
                {isActive && (
                  <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                )}
                
                <div className="w-7 h-7 rounded bg-card/40 border border-border/40 flex items-center justify-center font-mono font-bold text-xs text-primary group-hover:border-primary/50 transition-colors shrink-0">
                  {enemy.initiative}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={cn("font-bold truncate text-xs", isActive ? "text-primary" : "text-foreground", isDefeated ? "line-through text-destructive" : "")}>
                    {enemy.name}
                  </div>
                  <div className="text-[9px] uppercase font-mono text-muted-foreground flex gap-1">
                    <span>HP: {enemy.currentHp}/{enemy.maxHp}</span>
                    {enemy.conditions.length > 0 && (
                      <span className="text-warning truncate">{enemy.conditions.length} C</span>
                    )}
                  </div>
                </div>
                
                {isActive && (
                  <div className="shrink-0 text-primary animate-pulse">
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
