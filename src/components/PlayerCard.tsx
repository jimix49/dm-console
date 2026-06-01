import React, { useState } from 'react';
import { Enemy } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Trash2, Copy, Edit2, ChevronDown, ChevronUp, Skull } from 'lucide-react';
import { toast } from 'sonner';

interface PlayerCardProps {
  enemy: Enemy;
  onUpdate: (updates: Partial<Enemy>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  isActiveTurn: boolean;
}

export default function PlayerCard({ enemy, onUpdate, onRemove, onDuplicate, isActiveTurn }: PlayerCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [damageInput, setDamageInput] = useState('');

  const isDefeated = enemy.currentHp <= 0;

  const hpPercent = Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100));

  const handleModifyHp = (amount: number) => {
    const newHp = enemy.currentHp + amount;
    onUpdate({ currentHp: newHp });
  };

  const applyDamageInput = (isHealing: boolean = false) => {
    const amount = parseInt(damageInput);
    if (!isNaN(amount) && amount > 0) {
      handleModifyHp(isHealing ? amount : -amount);
    }
    setDamageInput('');
  };

  const incrementSuccess = () => {
    const current = enemy.deathSaves ?? { successes: 0, failures: 0 };
    const next = { ...current, successes: Math.min(3, current.successes + 1) };
    if (next.successes >= 3) {
      // stabilized
      onUpdate({ deathSaves: null, currentHp: Math.max(1, enemy.currentHp) });
      toast.success(`${enemy.name} stabilized (3 successes).`);
    } else {
      onUpdate({ deathSaves: next });
    }
  };

  const incrementFailure = () => {
    const current = enemy.deathSaves ?? { successes: 0, failures: 0 };
    const next = { ...current, failures: Math.min(3, current.failures + 1) };
    if (next.failures >= 3) {
      // death
      onUpdate({ deathSaves: next, currentHp: 0 });
      toast.error(`${enemy.name} has died (3 failures).`);
    } else {
      onUpdate({ deathSaves: next });
    }
  };

  const resetDeathSaves = () => {
    onUpdate({ deathSaves: { successes: 0, failures: 0 } });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative rounded-xl border bg-card/80 overflow-hidden transition-all',
        isActiveTurn ? 'border-primary shadow-[0_0_15px_rgba(218,165,32,0.18)]' : 'border-border/50',
        isDefeated ? 'opacity-70 grayscale-[0.5]' : ''
      )}
      data-testid={`card-player-${enemy.id}`}
    >
      <div className="flex items-center justify-between p-3 border-b border-border/30 bg-card/20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-3">
            {enemy.imageBase64 && (
              <div className="w-12 h-12 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                <img src={enemy.imageBase64} alt={enemy.name} className="w-full h-full object-cover" />
              </div>
            )}
            <h3 className="font-bold tracking-wide flex items-center gap-2">{enemy.name}{isDefeated && <Skull className="h-4 w-4 text-destructive" />}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {enemy.initiative !== null && (<div className="text-xs font-mono text-primary">INIT {enemy.initiative}</div>)}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onDuplicate}><Copy className="w-3 h-3" /></Button>
            <Button variant="ghost" size="icon" onClick={onRemove}><Trash2 className="w-3 h-3" /></Button>
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <div className="flex justify-between text-xs font-mono mb-1 uppercase tracking-wider text-muted-foreground">
                <span>HP</span>
                <span className={cn(hpPercent < 30 ? 'text-destructive font-bold' : hpPercent < 70 ? 'text-amber-500 font-semibold' : 'text-emerald-500 font-semibold')}>
                  {enemy.currentHp} / {enemy.maxHp}
                </span>
              </div>
              <div className="h-2 w-full bg-card/60 rounded-full overflow-hidden border border-border/30">
                <motion.div
                  className={cn('h-full rounded-full', hpPercent < 30 ? 'bg-destructive' : hpPercent < 70 ? 'bg-amber-500' : 'bg-emerald-500')}
                  animate={{ width: `${hpPercent}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-card/30 border border-primary/20 rounded-lg p-2 min-w-[60px]">
              <div className="text-xl font-black font-mono text-primary">{enemy.ac}</div>
              <div className="text-[10px] uppercase text-muted-foreground mt-1">AC</div>
            </div>
          </div>

          <div className="space-y-2 p-2 bg-card/20 rounded-lg border border-border/20">
            <div className="flex gap-2">
              {[-10, -5, -1].map(val => (
                <Button key={val} variant="outline" size="sm" onClick={() => handleModifyHp(val)} className="flex-1 min-w-[48px] h-8 text-xs">{val}</Button>
              ))}
              {[+1, +5, +10].map(val => (
                <Button key={val} variant="outline" size="sm" onClick={() => handleModifyHp(val)} className="flex-1 min-w-[48px] h-8 text-xs">+{val}</Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input type="number" placeholder="Amt" value={damageInput} onChange={e => setDamageInput(e.target.value)} className="h-8 w-16 font-mono text-center" />
              <Button onClick={() => applyDamageInput(false)} className="flex-1 h-8">Damage</Button>
              <Button onClick={() => applyDamageInput(true)} className="flex-1 h-8">Heal</Button>
            </div>
          </div>

          {enemy.currentHp <= 0 && (
            <div className="p-3 bg-card/10 rounded-lg border border-border/20">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Death Saves</div>
                <div className="text-xs text-muted-foreground">Manual counters</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="text-xs uppercase text-muted-foreground mr-2">Successes</div>
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={cn('w-6 h-6 rounded-sm border flex items-center justify-center text-xs', (enemy.deathSaves?.successes ?? 0) > i ? 'bg-success text-success-foreground border-success' : 'bg-card/10 border-border')}>{(enemy.deathSaves?.successes ?? 0) > i ? '✓' : ''}</div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <div className="text-xs uppercase text-muted-foreground mr-2">Failures</div>
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={cn('w-6 h-6 rounded-sm border flex items-center justify-center text-xs', (enemy.deathSaves?.failures ?? 0) > i ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-card/10 border-border')}>{(enemy.deathSaves?.failures ?? 0) > i ? '✕' : ''}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button onClick={incrementSuccess} className="flex-1">Add Success</Button>
                <Button onClick={incrementFailure} className="flex-1">Add Failure</Button>
                <Button variant="ghost" onClick={resetDeathSaves} className="flex-1">Reset</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
