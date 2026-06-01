import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Enemy } from '@/lib/types';
import useGlossary from '@/hooks/use-glossary';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

export default function AddEnemyForm({ onAdd }: { onAdd: (enemy: Omit<Enemy, 'id' | 'conditions' | 'tags'> & { glossaryId?: string | null }) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [hp, setHp] = useState('');
  const [ac, setAc] = useState('');
  const [init, setInit] = useState('');
  const [saveToGlossary, setSaveToGlossary] = useState(false);
  const { addEntry } = useGlossary();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !hp || !ac) return;
    const payload: any = {
      name,
      maxHp: parseInt(hp),
      currentHp: parseInt(hp),
      ac: parseInt(ac),
      initiative: init ? parseInt(init) : null,
    };

    if (saveToGlossary) {
      const created = addEntry({
        name: payload.name,
        maxHp: payload.maxHp,
        currentHp: payload.currentHp,
        ac: payload.ac,
        initiative: payload.initiative,
        conditions: [],
        tags: [],
        isPlayer: false,
        imageBase64: null,
        deathSaves: null
      } as Enemy);
      payload.glossaryId = created.id;
    }

    onAdd(payload);
    
    setOpen(false);
    setName('');
    setHp('');
    setAc('');
    setInit('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary/20 text-primary border border-primary/50 font-mono uppercase tracking-wider text-xs" data-testid="button-new-target">
          <Plus className="w-4 h-4 mr-2" /> New Foe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border medieval-panel text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-primary font-mono uppercase tracking-widest text-sm border-b border-border pb-2">Summon Foe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs text-muted-foreground uppercase font-mono">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required className="bg-card/60 border-secondary/30 font-mono focus-visible:ring-primary" placeholder="Goblin" data-testid="input-enemy-name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hp" className="text-xs text-muted-foreground uppercase font-mono">Health</Label>
              <Input id="hp" type="number" min="1" value={hp} onChange={e => setHp(e.target.value)} required className="bg-card/60 border-primary/30 font-mono text-center" placeholder="15" data-testid="input-enemy-hp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ac" className="text-xs text-muted-foreground uppercase font-mono">Armor Class</Label>
              <Input id="ac" type="number" min="1" value={ac} onChange={e => setAc(e.target.value)} required className="bg-card/60 border-primary/30 font-mono text-center" placeholder="12" data-testid="input-enemy-ac" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="init" className="text-xs text-muted-foreground uppercase font-mono">Initiative (Optional)</Label>
            <Input id="init" type="number" value={init} onChange={e => setInit(e.target.value)} className="bg-card/60 border-primary/30 font-mono text-center" placeholder="18" data-testid="input-enemy-init" />
          </div>
          <div className="flex items-center gap-2">
            <input id="saveGlossary" type="checkbox" checked={saveToGlossary} onChange={e => setSaveToGlossary(e.target.checked)} />
            <Label htmlFor="saveGlossary" className="text-xs text-muted-foreground">Save to Glossary</Label>
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground font-mono uppercase tracking-widest mt-4" data-testid="button-submit-target">Enlist</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
