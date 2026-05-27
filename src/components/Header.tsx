import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dices, Save, RotateCcw, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HeaderProps {
  encounterName: string;
  setEncounterName: (name: string) => void;
  clearEncounter: () => void;
  diceOpen: boolean;
  setDiceOpen: (open: boolean) => void;
}

export default function Header({ encounterName, setEncounterName, clearEncounter, diceOpen, setDiceOpen }: HeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(encounterName);

  const handleSaveName = () => {
    if (tempName.trim()) setEncounterName(tempName.trim());
    else setTempName(encounterName);
    setIsEditingName(false);
  };

  const handleSaveSnapshot = () => {
    // Already auto-saving, just visual feedback
    toast.success('Combat state snapshot secured.', {
      style: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--primary))', color: 'hsl(var(--primary))' }
    });
  };

  const handleReset = () => {
    if (confirm('Purge the current encounter? This cannot be undone.')) {
      clearEncounter();
      toast('Encounter cleared. Ready for a new crusade.', {
        style: { background: 'hsl(var(--destructive)/0.18)', border: '1px solid hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }
      });
    }
  };

  return (
    <header className="h-14 border-b border-border/50 bg-card/90 backdrop-blur-md flex items-center justify-between px-4 z-20 shrink-0 sticky top-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest">
          <ShieldAlert className="w-5 h-5" />
          <span className="hidden sm:inline">Battle Ledger</span>
        </div>
        
        <div className="w-[1px] h-6 bg-border mx-2" />
        
        <div className="flex items-center gap-2 group">
          {isEditingName ? (
            <Input 
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              className="h-7 w-48 bg-card/70 border-secondary font-mono text-sm uppercase"
              autoFocus
            />
          ) : (
            <h1 
              className="font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-primary cursor-pointer transition-colors"
              onClick={() => { setTempName(encounterName); setIsEditingName(true); }}
            >
              {encounterName} <span className="opacity-0 group-hover:opacity-100 text-[10px] ml-2">✎</span>
            </h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono uppercase text-primary/50 mr-4">
          <Cpu className="w-3 h-3 animate-pulse" /> Quill ready
        </div>
        
        <Button variant="ghost" size="sm" onClick={handleSaveSnapshot} className="h-8 font-mono text-xs text-muted-foreground" data-testid="button-save-encounter">
          <Save className="w-3.5 h-3.5 mr-2" /> <span className="hidden sm:inline">Record</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 font-mono text-xs text-muted-foreground" data-testid="button-reset-encounter">
          <RotateCcw className="w-3.5 h-3.5 mr-2" /> <span className="hidden sm:inline">Purge</span>
        </Button>
        
        <div className="w-[1px] h-6 bg-border mx-1" />
        
        <Button 
          variant={diceOpen ? "default" : "outline"} 
          size="sm"
          onClick={() => setDiceOpen(!diceOpen)}
          className={cn(
            "h-8 font-mono text-xs tracking-wider transition-all",
            diceOpen ? "bg-primary text-primary-foreground" : "border-primary/30 text-primary"
          )}
          data-testid="button-toggle-dice"
        >
          <Dices className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Dice Hall</span>
        </Button>
      </div>
    </header>
  );
}
