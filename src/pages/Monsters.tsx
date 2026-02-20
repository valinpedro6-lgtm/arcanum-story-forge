import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Skull, Shield, Heart } from 'lucide-react';

interface Monster {
  id: string;
  name: string;
  image: string;
  hp: number;
  ca: number;
  attacks: string;
  abilities: string;
  notes: string;
}

const emptyMonster = (): Monster => ({
  id: crypto.randomUUID(), name: '', image: '', hp: 10, ca: 10, attacks: '', abilities: '', notes: '',
});

const Monsters = () => {
  const [monsters, setMonsters] = useLocalStorage<Monster[]>('arcanum-monsters', []);
  const [editing, setEditing] = useState<Monster | null>(null);
  const [open, setOpen] = useState(false);

  const save = () => {
    if (!editing?.name.trim()) return;
    setMonsters(prev => {
      const exists = prev.find(m => m.id === editing.id);
      return exists ? prev.map(m => m.id === editing.id ? editing : m) : [...prev, editing];
    });
    setOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => setMonsters(prev => prev.filter(m => m.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Monstros</h1>
        <Button onClick={() => { setEditing(emptyMonster()); setOpen(true); }}><Plus className="w-4 h-4 mr-2" />Adicionar</Button>
      </div>

      {monsters.length === 0 && (
        <Card className="card-hover"><CardContent className="p-8 text-center text-muted-foreground">Nenhum monstro cadastrado</CardContent></Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {monsters.map(m => (
          <Card key={m.id} className="card-hover overflow-hidden">
            <CardContent className="p-0">
              {m.image ? (
                <div className="h-40 bg-secondary overflow-hidden"><img src={m.image} alt={m.name} className="w-full h-full object-cover" /></div>
              ) : (
                <div className="h-40 bg-secondary flex items-center justify-center"><Skull className="w-16 h-16 text-muted-foreground/30" /></div>
              )}
              <div className="p-4 space-y-3">
                <h3 className="text-xl font-display font-bold">{m.name}</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-accent" /><span className="font-semibold">{m.hp}</span></div>
                  <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /><span className="font-semibold">{m.ca}</span></div>
                </div>
                {m.attacks && <div><p className="text-xs text-muted-foreground">Ataques</p><p className="text-sm">{m.attacks}</p></div>}
                {m.abilities && <div><p className="text-xs text-muted-foreground">Habilidades</p><p className="text-sm">{m.abilities}</p></div>}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditing({ ...m }); setOpen(true); }} className="flex-1"><Edit className="w-3 h-3 mr-1" />Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => remove(m.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">{editing && monsters.find(m => m.id === editing.id) ? 'Editar' : 'Novo'} Monstro</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Input placeholder="Nome" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              <Input placeholder="URL da Imagem" value={editing.image} onChange={e => setEditing({ ...editing, image: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">HP</label><Input type="number" value={editing.hp} onChange={e => setEditing({ ...editing, hp: parseInt(e.target.value) || 0 })} /></div>
                <div><label className="text-xs text-muted-foreground">CA</label><Input type="number" value={editing.ca} onChange={e => setEditing({ ...editing, ca: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <Textarea placeholder="Ataques (ex: Mordida +5, 2d6+3)" value={editing.attacks} onChange={e => setEditing({ ...editing, attacks: e.target.value })} />
              <Textarea placeholder="Habilidades especiais" value={editing.abilities} onChange={e => setEditing({ ...editing, abilities: e.target.value })} />
              <Input placeholder="Notas" value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
              <Button onClick={save} className="w-full">Salvar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Monsters;
