import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Enemy } from '@/lib/types';
import GlossaryEditorModal from '@/components/GlossaryEditorModal';

interface GlossaryPanelProps {
  entries: Enemy[];
  addEntry: (entry: Omit<Enemy, 'id'>) => Enemy;
  updateEntry: (id: string, updates: Partial<Enemy>) => void;
  removeEntry: (id: string) => void;
  addEnemy: (enemy: any) => void;
}

export default function GlossaryPanel({ entries, addEntry, updateEntry, removeEntry, addEnemy }: GlossaryPanelProps) {
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

  const handleAddAllPlayers = () => {
    const players = entries.filter(e => e.isPlayer);
    if (players.length === 0) {
      toast.info('No player characters found.');
      return;
    }
    let addedCount = 0;
    for (const player of players) {
      const initiativeStr = prompt(`${player.name} Initiative:`);
      const initiative = initiativeStr ? parseInt(initiativeStr) : null;
      addEnemy({
        name: player.name,
        maxHp: player.maxHp,
        currentHp: player.currentHp ?? player.maxHp,
        ac: player.ac,
        initiative: initiative,
        isPlayer: player.isPlayer,
        imageBase64: player.imageBase64,
        deathSaves: player.deathSaves ?? null,
        glossaryId: player.id
      } as any);
      addedCount++;
    }
    toast.success(`Added ${addedCount} player(s) to encounter.`);
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

  const [tab, setTab] = useState<'all' | 'players' | 'enemies'>('all');
  const filteredEntries = entries.filter(e => {
    if (tab === 'all') return true;
    if (tab === 'players') return e.isPlayer;
    return !e.isPlayer;
  });

  return (
    <div className="bg-card p-3 rounded-xl border border-border/50 space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Glossary</h3>
          <div className="flex items-center ml-2 space-x-1">
            <Button type="button" size="sm" variant={tab === 'all' ? 'default' : 'ghost'} onClick={() => setTab('all')} className="h-6 text-xs px-2">All ({entries.length})</Button>
            <Button type="button" size="sm" variant={tab === 'players' ? 'default' : 'ghost'} onClick={() => setTab('players')} className="h-6 text-xs px-2">Players ({entries.filter(e => e.isPlayer).length})</Button>
            <Button type="button" size="sm" variant={tab === 'enemies' ? 'default' : 'ghost'} onClick={() => setTab('enemies')} className="h-6 text-xs px-2">Enemies ({entries.filter(e => !e.isPlayer).length})</Button>
          </div>
        </div>
        <div className="flex gap-1">
          {tab === 'players' && (
            <Button type="button" size="sm" onClick={handleAddAllPlayers} className="h-6 text-xs px-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30">Add All</Button>
          )}
          <Button type="button" size="sm" onClick={() => startNewEntry(true)} className="h-6 text-xs px-2">Player</Button>
          <Button type="button" size="sm" onClick={() => startNewEntry(false)} className="h-6 text-xs px-2">New</Button>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
        {filteredEntries.length === 0 && (
          <div className="text-xs text-muted-foreground">No entries.</div>
        )}

        {filteredEntries.map(entry => (
          <div key={entry.id} className="rounded-lg border border-border/50 p-2 space-y-2 hover:bg-muted/5 transition-colors">
            <div className="flex items-start gap-2">
              {entry.imageBase64 && (
                <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                  <img src={entry.imageBase64} alt={entry.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate font-medium text-xs">{entry.name}</div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{entry.isPlayer ? 'P' : 'E'}</div>
                </div>
                <div className="text-xs text-muted-foreground leading-tight">HP {entry.currentHp ?? entry.maxHp}/{entry.maxHp} · AC {entry.ac}</div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button type="button" size="sm" className="h-5 text-xs px-2 flex-1" onClick={() => openEditorFor(entry)}>Edit</Button>
              <Button type="button" size="sm" className="h-5 text-xs px-2 flex-1" onClick={() => handleAddToEncounter(entry)}>Add</Button>
              <Button type="button" variant="destructive" size="sm" className="h-5 text-xs px-2 flex-1" onClick={() => {
                if (confirm(`Delete ${entry.name}?`)) {
                  removeEntry(entry.id);
                  toast.success('Removed');
                }
              }}>Del</Button>
            </div>
          </div>
        ))}
      </div>

      <GlossaryEditorModal open={modalOpen} onOpenChange={setModalOpen} initial={draft} onSave={handleSaveFromModal} />
    </div>
  );
}
