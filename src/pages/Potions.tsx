import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FlaskConical, Plus, Dices, Trash2 } from 'lucide-react';

interface Potion {
  id: string;
  name: string;
  description: string;
  diceCount: number;
  diceSides: number;
  modifier: number;
  custom?: boolean;
}

const DEFAULT_POTIONS: Potion[] = [
  { id: '1', name: 'Poção de Vida', description: 'Recupera pontos de vida', diceCount: 2, diceSides: 4, modifier: 2 },
  { id: '2', name: 'Poção de Vida Maior', description: 'Recupera mais pontos de vida', diceCount: 4, diceSides: 4, modifier: 4 },
  { id: '3', name: 'Poção de Vida Superior', description: 'Recupera muitos pontos de vida', diceCount: 8, diceSides: 4, modifier: 8 },
  { id: '4', name: 'Poção de Vida Suprema', description: 'Recuperação máxima de vida', diceCount: 10, diceSides: 4, modifier: 20 },
  { id: '5', name: 'Poção de Força do Gigante', description: 'Força sobre-humana temporária', diceCount: 2, diceSides: 6, modifier: 4 },
  { id: '6', name: 'Poção de Velocidade', description: 'Ação extra por 1 minuto', diceCount: 1, diceSides: 4, modifier: 0 },
  { id: '7', name: 'Poção de Invisibilidade', description: 'Invisível por 1 hora', diceCount: 0, diceSides: 0, modifier: 0 },
  { id: '8', name: 'Poção de Resistência ao Fogo', description: 'Resistência a dano de fogo', diceCount: 0, diceSides: 0, modifier: 0 },
  { id: '9', name: 'Poção de Voo', description: 'Pode voar por 1 hora', diceCount: 0, diceSides: 0, modifier: 0 },
  { id: '10', name: 'Antídoto', description: 'Cura todos os venenos', diceCount: 0, diceSides: 0, modifier: 0 },
  { id: '11', name: 'Poção de Heroísmo', description: 'Ganha HP temporário', diceCount: 2, diceSides: 10, modifier: 5 },
  { id: '12', name: 'Poção de Respirar na Água', description: 'Respira embaixo d\'água por 1h', diceCount: 0, diceSides: 0, modifier: 0 },
  { id: '13', name: 'Elixir da Sorte', description: 'Vantagem na próxima rolagem', diceCount: 1, diceSides: 20, modifier: 0 },
  { id: '14', name: 'Poção de Regeneração', description: 'Cura ao longo do tempo', diceCount: 1, diceSides: 6, modifier: 1 },
  { id: '15', name: 'Poção de Escuridão', description: 'Visão no escuro por 8h', diceCount: 0, diceSides: 0, modifier: 0 },
];

const Potions = () => {
  const [customPotions, setCustomPotions] = useLocalStorage<Potion[]>('arcanum-potions', []);
  const [results, setResults] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [newPotion, setNewPotion] = useState<Potion>({ id: '', name: '', description: '', diceCount: 1, diceSides: 4, modifier: 0, custom: true });

  const allPotions = [...DEFAULT_POTIONS, ...customPotions];

  const rollPotion = (p: Potion) => {
    if (p.diceCount === 0) return;
    const rolls = Array.from({ length: p.diceCount }, () => Math.floor(Math.random() * p.diceSides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0) + p.modifier;
    setResults(prev => ({ ...prev, [p.id]: total }));
  };

  const addCustom = () => {
    if (!newPotion.name.trim()) return;
    setCustomPotions(prev => [...prev, { ...newPotion, id: crypto.randomUUID() }]);
    setNewPotion({ id: '', name: '', description: '', diceCount: 1, diceSides: 4, modifier: 0, custom: true });
    setOpen(false);
  };

  const formula = (p: Potion) => p.diceCount > 0 ? `${p.diceCount}d${p.diceSides}${p.modifier ? (p.modifier > 0 ? '+' : '') + p.modifier : ''}` : 'Efeito fixo';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Poções</h1>
        <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" />Nova Poção</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allPotions.map(p => (
          <Card key={p.id} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-display font-semibold">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                </div>
                {p.custom && <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setCustomPotions(prev => prev.filter(cp => cp.id !== p.id))}><Trash2 className="w-3 h-3" /></Button>}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-muted-foreground">{formula(p)}</span>
                <div className="flex items-center gap-2">
                  {results[p.id] !== undefined && <span className="text-lg font-display font-bold text-primary">{results[p.id]}</span>}
                  {p.diceCount > 0 && <Button size="sm" variant="outline" onClick={() => rollPotion(p)}><Dices className="w-3 h-3 mr-1" />Rolar</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Nova Poção</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome" value={newPotion.name} onChange={e => setNewPotion(p => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Descrição" value={newPotion.description} onChange={e => setNewPotion(p => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-muted-foreground">Dados</label><Input type="number" min={0} value={newPotion.diceCount} onChange={e => setNewPotion(p => ({ ...p, diceCount: parseInt(e.target.value) || 0 }))} /></div>
              <div><label className="text-xs text-muted-foreground">Lados</label><Input type="number" min={2} value={newPotion.diceSides} onChange={e => setNewPotion(p => ({ ...p, diceSides: parseInt(e.target.value) || 4 }))} /></div>
              <div><label className="text-xs text-muted-foreground">Mod</label><Input type="number" value={newPotion.modifier} onChange={e => setNewPotion(p => ({ ...p, modifier: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <Button onClick={addCustom} className="w-full">Adicionar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Potions;
