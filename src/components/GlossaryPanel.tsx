import React, { useState } from 'react';
import useGlossary from '@/hooks/use-glossary';
import { useEncounter } from '@/hooks/use-encounter';
import { toast } from 'sonner';
import { Enemy } from '@/lib/types';
import GlossaryEditorModal from '@/components/GlossaryEditorModal';

export default function GlossaryPanel() {
  const { entries, addEntry, updateEntry, removeEntry, importFromObject, exportToJson } = useGlossary();
  const { addEnemy } = useEncounter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<Enemy> | null>(null);

  const startNewEntry = (asPlayer = false) => {
    setDraft({ name: asPlayer ? 'New Player' : 'New Entry', maxHp: 10, currentHp: 10, ac: 10, initiative: null, conditions: [], tags: [], isPlayer: asPlayer, imageBase64: null, deathSaves: { successes: 0, failures: 0 } });
    setEditingId(null);
    setModalOpen(true);
  };

  const handleAddToEncounter = (entry: Enemy) => {
    addEnemy({
      name: entry.name,
      maxHp: entry.maxHp,
      currentHp: entry.currentHp ?? entry.maxHp,
      ac: entry.ac,
      initiative: entry.initiative ?? null,
      isPlayer: entry.isPlayer,
      imageBase64: entry.imageBase64,
      deathSaves: entry.deathSaves ?? null,
      glossaryId: entry.id
    } as any);
    toast.success(`${entry.name} added to encounter.`);
  };

  const handleFileImport = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      importFromObject(parsed);
      toast.success('Glossary imported.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to import glossary.');
    }
  };

  const openEditorFor = (entry: Enemy) => {
    setDraft(entry);
    setEditingId(entry.id);
    setModalOpen(true);
  };

  const handleSaveFromModal = (entryPartial: Partial<Enemy>) => {
    if (editingId) {
      updateEntry(editingId, entryPartial as Partial<Enemy>);
      toast.success('Saved');
    } else {
      const created = addEntry(entryPartial as Enemy);
      toast.success('Created');
    }
    setModalOpen(false);
    setDraft(null);
    setEditingId(null);
  };

  return (
    <div className="bg-card p-4 rounded-xl border border-border/50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-wider text-muted-foreground">Glossary</h3>
        <div className="flex items-center gap-2">
          <button className="btn" onClick={() => startNewEntry(true)}>New Player</button>
          <button className="btn" onClick={() => startNewEntry(false)}>New Entry</button>
          <button className="btn" onClick={() => exportToJson()}>Export</button>
          <label className="btn cursor-pointer">
            Import
            <input type="file" accept="application/json" className="hidden" onChange={e => handleFileImport(e.target.files?.[0])} />
          </label>
        </div>
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
        {entries.length === 0 && (
          <div className="text-xs text-muted-foreground">No glossary entries yet.</div>
        )}

        {entries.map(entry => (
          <div key={entry.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/5">
            <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
              {entry.imageBase64 ? <img src={entry.imageBase64} alt={entry.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="truncate font-medium">{entry.name}</div>
                <div className="text-xs text-muted-foreground">{entry.isPlayer ? 'Player' : 'Enemy'}</div>
              </div>
              <div className="text-xs text-muted-foreground">HP: {entry.currentHp ?? entry.maxHp} / {entry.maxHp} · AC: {entry.ac}</div>
            </div>

            <div className="flex items-center gap-2">
              <button className="btn" onClick={() => openEditorFor(entry)}>Edit</button>
              <button className="btn" onClick={() => handleAddToEncounter(entry)}>Add</button>
              <button className="btn-destructive" onClick={() => { removeEntry(entry.id); toast.success('Removed'); }}>Del</button>
            </div>
          </div>
        ))}
      </div>

      <GlossaryEditorModal open={modalOpen} onOpenChange={setModalOpen} initial={draft} onSave={handleSaveFromModal} />
    </div>
  );
}
