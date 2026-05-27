import React from 'react';
import { useDice } from '@/hooks/use-dice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Dices, RotateCcw, Clock, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiceRollerProps {
  isOpen: boolean;
  onClose: () => void;
  dice: ReturnType<typeof useDice>;
}

const DIE_TYPES = [4, 6, 8, 10, 12, 20, 100];

export default function DiceRoller({ isOpen, onClose, dice }: DiceRollerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 flex flex-col bg-card border-l border-border sci-fi-panel shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
        >
          <div className="p-4 border-b border-border bg-black/40 flex justify-between items-center">
            <div className="flex items-center gap-2 text-primary font-mono uppercase tracking-widest text-sm">
              <Dices className="w-4 h-4" /> Probability Matrix
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-white/5" data-testid="button-close-dice">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="p-4 space-y-6">
              {/* Quick Dice */}
              <div>
                <h3 className="text-[10px] uppercase font-mono text-muted-foreground mb-3 tracking-wider">Quick Inputs</h3>
                <div className="grid grid-cols-4 gap-2">
                  {DIE_TYPES.map(d => (
                    <Button 
                      key={d} 
                      variant="outline" 
                      className="font-mono text-xs h-10 border-primary/20 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
                      onClick={() => dice.addDie(d)}
                      data-testid={`btn-die-${d}`}
                    >
                      d{d}
                    </Button>
                  ))}
                  <div className="flex items-center gap-1 border border-border rounded-md px-2 bg-black/20">
                    <span className="text-[10px] text-muted-foreground font-mono">+/-</span>
                    <Input 
                      type="number" 
                      value={dice.modifier || ''} 
                      onChange={e => dice.setModifier(parseInt(e.target.value) || 0)}
                      className="h-6 w-full p-0 border-0 bg-transparent text-center font-mono text-xs focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              {/* Pending Roll */}
              <div className="bg-black/30 border border-primary/30 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <h3 className="text-[10px] uppercase font-mono text-primary/70 mb-2 tracking-wider">Queued Sequence</h3>
                
                <div className="min-h-[40px] flex items-center justify-center font-mono text-lg tracking-widest">
                  {dice.pendingDice.length > 0 || dice.modifier !== 0 ? (
                    <span className="text-foreground">
                      {dice.pendingDice.length > 0 && dice.pendingDice.reduce((acc, curr) => {
                        const existing = acc.find(x => x.sides === curr);
                        if (existing) existing.count++;
                        else acc.push({ sides: curr, count: 1 });
                        return acc;
                      }, [] as {sides: number, count: number}[]).map(x => `${x.count}d${x.sides}`).join(' + ')}
                      
                      {dice.modifier !== 0 && (
                        <span>{dice.pendingDice.length > 0 ? ' ' : ''}{dice.modifier > 0 ? '+' : '-'}{Math.abs(dice.modifier)}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/30">AWAITING INPUT</span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={dice.clearPending} className="flex-1 font-mono text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    Clear
                  </Button>
                  <Button 
                    onClick={dice.executeRoll} 
                    disabled={dice.pendingDice.length === 0 && dice.modifier === 0 || dice.isRolling}
                    className="flex-2 bg-primary text-primary-foreground font-mono uppercase tracking-widest hover:bg-primary/80 disabled:opacity-50"
                    data-testid="btn-execute-roll"
                  >
                    {dice.isRolling ? <RotateCcw className="w-4 h-4 animate-spin" /> : 'Execute'}
                  </Button>
                </div>
              </div>

              {/* Manual Expression */}
              <div>
                <h3 className="text-[10px] uppercase font-mono text-muted-foreground mb-3 tracking-wider">Manual Override</h3>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input 
                      placeholder="e.g. 4d6 + 2" 
                      value={dice.manualExpression}
                      onChange={e => dice.setManualExpression(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && dice.rollManual()}
                      className="pl-7 bg-black/40 border-border font-mono text-xs focus-visible:border-primary"
                    />
                  </div>
                  <Button variant="secondary" onClick={dice.rollManual} disabled={!dice.manualExpression || dice.isRolling} className="font-mono text-xs">
                    Run
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-black/50 border-t border-border overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border/50 flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Telemetry Log
                </span>
                {dice.history.length > 0 && (
                  <button onClick={dice.clearHistory} className="text-[10px] uppercase font-mono text-destructive/70 hover:text-destructive transition-colors">Clear</button>
                )}
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  <AnimatePresence>
                    {dice.history.map((result, idx) => (
                      <motion.div 
                        key={result.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded border font-mono ${idx === 0 ? 'bg-primary/10 border-primary/40 shadow-[0_0_10px_rgba(0,255,255,0.05)]' : 'bg-card/50 border-border/50'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">{result.expression}</span>
                          <span className="text-[10px] text-muted-foreground/50">{new Date(result.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                        </div>
                        <div className="flex items-end justify-between gap-4">
                          <div className="text-[10px] text-muted-foreground/70 break-all leading-tight">
                            {result.breakdown}
                          </div>
                          <div className={`text-2xl font-black ${idx === 0 ? 'text-primary drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]' : 'text-foreground'}`}>
                            {result.total}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {dice.history.length === 0 && (
                    <div className="text-center text-muted-foreground/50 text-xs font-mono py-8">
                      No telemetry data.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
