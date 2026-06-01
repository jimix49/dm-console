import React, { useEffect, useState } from 'react';
import { Enemy } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function resizeDataUrl(dataUrl: string, maxDim = 512): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png', 0.9));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function GlossaryEditorModal({
  open,
  onOpenChange,
  initial,
  onSave
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Enemy> | null;
  onSave: (entry: Partial<Enemy>) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [maxHp, setMaxHp] = useState(String(initial?.maxHp ?? 10));
  const [currentHp, setCurrentHp] = useState(String(initial?.currentHp ?? initial?.maxHp ?? 10));
  const [ac, setAc] = useState(String(initial?.ac ?? 10));
  const [initiative, setInitiative] = useState(initial?.initiative?.toString() ?? '');
  const [isPlayer, setIsPlayer] = useState(Boolean(initial?.isPlayer));
  const [imageBase64, setImageBase64] = useState<string | null>(initial?.imageBase64 ?? null);

  useEffect(() => {
    setName(initial?.name ?? '');
    setMaxHp(String(initial?.maxHp ?? 10));
    setCurrentHp(String(initial?.currentHp ?? initial?.maxHp ?? 10));
    setAc(String(initial?.ac ?? 10));
    setInitiative(initial?.initiative?.toString() ?? '');
    setIsPlayer(Boolean(initial?.isPlayer));
    setImageBase64(initial?.imageBase64 ?? null);
  }, [initial, open]);

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      const data = await readFileAsDataURL(file);
      const resized = await resizeDataUrl(data, 512);
      setImageBase64(resized);
    } catch (e) {
      console.error(e);
      toast.error('Unable to read image');
    }
  };

  const handleSave = () => {
    if (!name) return toast.error('Name required');
    const payload: Partial<Enemy> = {
      name,
      maxHp: Number(maxHp) || 0,
      currentHp: Number(currentHp) || Number(maxHp) || 0,
      ac: Number(ac) || 10,
      initiative: initiative ? Number(initiative) : null,
      isPlayer,
      imageBase64,
      deathSaves: initial?.deathSaves ?? null,
      conditions: initial?.conditions ?? [],
      tags: initial?.tags ?? []
    };
    onSave(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border medieval-panel text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-primary font-mono uppercase tracking-widest text-sm border-b border-border pb-2">Glossary Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="mt-1" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground uppercase">Max HP</Label>
              <Input type="number" value={maxHp} onChange={e => setMaxHp(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase">Current HP</Label>
              <Input type="number" value={currentHp} onChange={e => setCurrentHp(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase">AC</Label>
              <Input type="number" value={ac} onChange={e => setAc(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase">Initiative (optional)</Label>
            <Input value={initiative} onChange={e => setInitiative(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <input id="isPlayerToggle" type="checkbox" checked={isPlayer} onChange={e => setIsPlayer(e.target.checked)} />
            <Label htmlFor="isPlayerToggle" className="text-xs text-muted-foreground">Mark as Player</Label>
          </div>

          <div className="flex items-center gap-2">
            <label className="btn cursor-pointer">Upload Image<input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} /></label>
            {imageBase64 && <div className="w-16 h-16 rounded-sm overflow-hidden"><img src={imageBase64} alt="preview" className="w-full h-full object-cover" /></div>}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
