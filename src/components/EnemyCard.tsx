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
      {/* Defeated Overlay */}
      <AnimatePresence>
        {isDefeated && !collapsed && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-destructive/10 pointer-events-none flex items-center justify-center backdrop-blur-[1px]"
          >
            <div className="border-4 border-destructive/50 text-destructive/70 font-black text-4xl tracking-widest uppercase rotate-[-15deg] p-4 rounded-lg mix-blend-overlay">
              Defeated
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-border/30 bg-card/20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0" onClick={() => setCollapsed(!collapsed)} data-testid={`button-collapse-${enemy.id}`}>
            {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
          {isEditing ? (
            <Input 
              value={editName} 
              onChange={e => setEditName(e.target.value)}
              className="h-6 text-xs font-bold bg-card/60 border-primary/50 w-24"
              autoFocus
            />
          ) : (
            <h3 className={cn("font-bold tracking-wide flex items-center gap-2 text-sm", isDefeated ? "text-destructive" : "text-foreground")}>
              {isDefeated && <Skull className="h-3 w-3" />}
              {enemy.name}
            </h3>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {enemy.initiative !== null && (
            <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary/80 bg-primary/5 px-1.5 py-0.5">
              INIT {enemy.initiative}
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0" data-testid={`button-options-${enemy.id}`}>
                <Edit2 className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-card border-border">
              <DropdownMenuItem onClick={() => setIsEditing(!isEditing)} className="cursor-pointer font-mono text-xs">
                <Edit2 className="mr-2 h-3 w-3" /> Edit Stats
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate} className="cursor-pointer font-mono text-xs">
                <Copy className="mr-2 h-3 w-3" /> Clone Unit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRemove} className="cursor-pointer font-mono text-xs text-destructive">
                <Trash2 className="mr-2 h-3 w-3" /> Terminate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <div className="p-3 space-y-3">
              
              {/* Stats Row */}
              <div className="flex justify-between items-end gap-2">
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-mono mb-1 uppercase tracking-wider text-muted-foreground">
                    <span>Vitality</span>
                    <span className={cn(hpPercent < 30 ? "text-destructive font-bold" : "text-primary")}>
                      {enemy.currentHp} / {enemy.maxHp}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-card/60 rounded-full overflow-hidden border border-border/30">
                    <motion.div 
                      className={cn("h-full transition-all duration-500", getHpColor())}
                      initial={{ width: 0 }}
                      animate={{ width: `${hpPercent}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-card/30 border border-primary/20 rounded-lg p-1.5 min-w-[50px] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                  {isEditing ? (
                    <Input value={editAc} onChange={e => setEditAc(e.target.value)} className="h-5 w-9 text-center p-0 text-sm font-mono border-primary/50" />
                  ) : (
                    <span className="text-lg font-black font-mono text-primary group-hover:scale-110 transition-transform">{enemy.ac}</span>
                  )}
                  <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground mt-0.5">
                    <Shield className="w-2.5 h-2.5" /> AC
                  </div>
                </div>
              </div>

              {/* HP Controls */}
              {!isEditing && (
                <div className="space-y-2 p-2 bg-card/20 rounded-lg border border-border/30">
                  <div className="flex flex-wrap gap-1">
                    {[-10, -5, -1].map(val => (
                      <Button key={val} variant="outline" size="sm" onClick={() => handleModifyHp(val)} className="flex-1 min-w-[40px] h-6 text-xs font-mono border-destructive/20 text-destructive px-1" data-testid={`btn-dmg-${val}-${enemy.id}`}>
                        {val}
                      </Button>
                    ))}
                    <div className="w-full h-px bg-border my-0.5" />
                    {[+1, +5, +10].map(val => (
                      <Button key={val} variant="outline" size="sm" onClick={() => handleModifyHp(val)} className="flex-1 min-w-[40px] h-6 text-xs font-mono border-healing/20 text-healing px-1" data-testid={`btn-heal-${val}-${enemy.id}`}>
                        +{val}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Input 
                      type="number" 
                      placeholder="Amt" 
                      value={damageInput} 
                      onChange={e => setDamageInput(e.target.value)}
                      className="h-6 font-mono text-center bg-card/60 border-primary/20 w-12 text-xs"
                      data-testid={`input-manual-dmg-${enemy.id}`}
                    />
                    <Button onClick={() => applyDamageInput(false)} className="flex-1 h-6 bg-destructive/10 text-destructive border border-destructive/30 text-xs uppercase tracking-widest px-2" data-testid={`btn-apply-dmg-${enemy.id}`}>
                      Dmg
                    </Button>
                    <Button onClick={() => applyDamageInput(true)} className="flex-1 h-6 bg-healing/10 text-healing border border-healing/30 text-xs uppercase tracking-widest px-2" data-testid={`btn-apply-heal-${enemy.id}`}>
                      Heal
                    </Button>
                  </div>
                </div>
              )}

              {/* Editing Extra Fields */}
              {isEditing && (
                <div className="grid grid-cols-2 gap-1.5 p-2 bg-card/30 rounded-lg border border-primary/20">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase text-muted-foreground font-mono">Max HP</span>
                    <Input value={editHp} onChange={e => setEditHp(e.target.value)} className="h-6 text-xs font-mono border-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase text-muted-foreground font-mono">Initiative</span>
                    <Input value={editInit} onChange={e => setEditInit(e.target.value)} className="h-6 text-xs font-mono border-primary/50" placeholder="Null" />
                  </div>
                  <div className="col-span-2 flex justify-end gap-1 mt-1">
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-6 text-xs px-2">Cancel</Button>
                    <Button size="sm" onClick={saveEdits} className="h-6 text-xs px-2 bg-primary/20 text-primary border border-primary/50">Save</Button>
                  </div>
                </div>
              )}

              {/* Tags & Conditions */}
              {!isEditing && (
                <div className="space-y-1.5">
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
