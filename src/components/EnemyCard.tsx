import React, { useState } from 'react';
import { Enemy, STANDARD_CONDITIONS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Swords, Copy, Trash2, Edit2, ChevronDown, ChevronUp, Check, X, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnemyCardProps {
  enemy: Enemy;
  onUpdate: (updates: Partial<Enemy>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  isActiveTurn: boolean;
}

export default function EnemyCard({ enemy, onUpdate, onRemove, onDuplicate, isActiveTurn }: EnemyCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [damageInput, setDamageInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Editing state
  const [editName, setEditName] = useState(enemy.name);
  const [editHp, setEditHp] = useState(enemy.maxHp.toString());
  const [editAc, setEditAc] = useState(enemy.ac.toString());
  const [editInit, setEditInit] = useState(enemy.initiative?.toString() || '');

  const isDefeated = enemy.currentHp <= 0;
  const hpPercent = Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100));
  
  const getHpColor = () => {
    if (isDefeated) return 'bg-muted-foreground/30';
    if (hpPercent > 60) return 'bg-primary shadow-[0_0_10px_rgba(220,150,20,0.18)]';
    if (hpPercent > 30) return 'bg-warning shadow-[0_0_10px_rgba(220,150,20,0.2)]';
    return 'bg-destructive shadow-[0_0_10px_rgba(180,30,30,0.3)] animate-pulse';
  };

  const handleModifyHp = (amount: number) => {
    const newHp = Math.max(0, enemy.currentHp + amount);
    onUpdate({ currentHp: newHp });
  };

  const applyDamageInput = (isHealing: boolean = false) => {
    const amount = parseInt(damageInput);
    if (!isNaN(amount) && amount > 0) {
      handleModifyHp(isHealing ? amount : -amount);
    }
    setDamageInput('');
  };

  const toggleCondition = (cond: string) => {
    if (enemy.conditions.includes(cond)) {
      onUpdate({ conditions: enemy.conditions.filter(c => c !== cond) });
    } else {
      onUpdate({ conditions: [...enemy.conditions, cond] });
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!enemy.tags.includes(tagInput.trim())) {
        onUpdate({ tags: [...enemy.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    onUpdate({ tags: enemy.tags.filter(t => t !== tag) });
  };

  const saveEdits = () => {
    onUpdate({
      name: editName,
      maxHp: parseInt(editHp) || enemy.maxHp,
      ac: parseInt(editAc) || enemy.ac,
      initiative: editInit ? parseInt(editInit) : null,
      currentHp: Math.min(enemy.currentHp, parseInt(editHp) || enemy.maxHp) // Cap current HP if max drops
    });
    setIsEditing(false);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-xl border bg-card/80 overflow-hidden transition-all",
        isActiveTurn ? "border-primary shadow-[0_0_15px_rgba(218,165,32,0.18)]" : "border-border/50",
        isDefeated ? "opacity-70 grayscale-[0.5]" : ""
      )}
      data-testid={`card-enemy-${enemy.id}`}
    >
      {/* Header */
      <div className="flex items-center justify-between p-2 border-b border-border/30 bg-card/20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0" onClick={() => setCollapsed(!collapsed)} data-testid={`button-collapse-${enemy.id}`}>
            {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
          <div className="flex items-center gap-2">
            {enemy.imageBase64 && (
              <div className="w-8 h-8 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                <img src={enemy.imageBase64} alt={enemy.name} className="w-full h-full object-cover" />
              </div>
            )}
            <h3 className="font-bold tracking-wide flex items-center gap-1 text-sm">
              {enemy.name}
              {isDefeated && <Skull className="h-3 w-3 text-destructive" />}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {enemy.initiative !== null && (<div className="text-xs font-mono text-primary">INIT {enemy.initiative}</div>)}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsEditing(!isEditing)}><Edit2 className="w-2.5 h-2.5" /></Button>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onDuplicate}><Copy className="w-2.5 h-2.5" /></Button>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onRemove}><Trash2 className="w-2.5 h-2.5" /></Button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
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
                <div className="flex flex-col items-center justify-center bg-card/30 border border-primary/20 rounded-lg p-2 min-w-[54px]">
                  <span className="text-lg font-black font-mono text-primary">{enemy.ac}</span>
                  <span className="text-[10px] uppercase text-muted-foreground mt-0.5">AC</span>
                </div>
              </div>

              <div className="space-y-2 p-2 bg-card/20 rounded-lg border border-border/20">
                <div className="grid grid-cols-3 gap-1">
                  {[-10, -5, -1].map(val => (
                    <Button key={val} variant="outline" size="sm" onClick={() => handleModifyHp(val)} className="h-8 text-xs">{val}</Button>
                  ))}
                  {null}
                  {[+1, +5, +10].map(val => (
                    <Button key={val} variant="outline" size="sm" onClick={() => handleModifyHp(val)} className="h-8 text-xs">+{val}</Button>
                  ))}
                </div>
                <div className="flex gap-1">
                  <Input type="number" placeholder="Amt" value={damageInput} onChange={e => setDamageInput(e.target.value)} className="h-8 w-14 text-xs font-mono text-center" />
                  <Button onClick={() => applyDamageInput(false)} className="flex-1 h-8 text-xs">Dmg</Button>
                  <Button onClick={() => applyDamageInput(true)} className="flex-1 h-8 text-xs">Heal</Button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2 p-2 bg-card/30 rounded-lg border border-border/20">
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-9 text-xs font-mono" placeholder="Name" />
                    <Input value={editHp} onChange={e => setEditHp(e.target.value)} className="h-9 text-xs font-mono" placeholder="Max HP" />
                    <Input value={editAc} onChange={e => setEditAc(e.target.value)} className="h-9 text-xs font-mono" placeholder="AC" />
                    <Input value={editInit} onChange={e => setEditInit(e.target.value)} className="h-9 text-xs font-mono" placeholder="Initiative" />
                  </div>
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-8 text-xs px-2" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button size="sm" className="h-8 text-xs px-2" onClick={saveEdits}>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {STANDARD_CONDITIONS.map(cond => (
                      <Badge 
                        key={cond} 
                        variant="outline" 
                        className={cn(
                          "cursor-pointer text-[9px] uppercase font-mono transition-colors px-1.5 py-0.5",
                          enemy.conditions.includes(cond) 
                            ? "bg-warning/20 text-warning border-warning" 
                            : "bg-card/30 border-border/40 text-muted-foreground hover:border-border"
                        )}
                        onClick={() => toggleCondition(cond)}
                        data-testid={`badge-cond-${cond}-${enemy.id}`}
                      >
                        {cond}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 items-center">
                    {enemy.tags.map(tag => (
                      <Badge key={tag} className="bg-secondary text-secondary-foreground text-[9px] uppercase font-mono pr-0.5 border border-border group" data-testid={`badge-tag-${tag}-${enemy.id}`}>
                        {tag}
                        <span className="ml-0.5 cursor-pointer opacity-50 group-hover:opacity-100" onClick={() => removeTag(tag)}>
                          <X className="w-2.5 h-2.5" />
                        </span>
                      </Badge>
                    ))}
                    <Input 
                      placeholder="+ tag" 
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                      className="h-5 w-16 text-[9px] px-1 py-0 bg-transparent border-dashed border-border/20 focus-visible:ring-0 focus-visible:border-primary font-mono"
                      data-testid={`input-add-tag-${enemy.id}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact View Summary */}
      {collapsed && (
        <div className="px-3 pb-2 pt-1">
          <div className="h-1 w-full bg-card/60 rounded-full overflow-hidden">
            <div className={cn("h-full transition-all", getHpColor())} style={{ width: `${hpPercent}%` }} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
