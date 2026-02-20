import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Save, Trash2, Sparkles } from 'lucide-react';

interface NPC {
  id: string;
  name: string;
  race: string;
  npcClass: string;
  personality: string;
  quirk: string;
  occupation: string;
  secret: string;
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const NAMES = ['Alaric', 'Bruna', 'Cedric', 'Dahlia', 'Eldric', 'Fiona', 'Gareth', 'Helena', 'Igor', 'Jasmine', 'Kael', 'Luna', 'Magnus', 'Nadia', 'Orin', 'Petra', 'Quentin', 'Rosa', 'Silas', 'Thalia', 'Ulric', 'Viviane', 'Wren', 'Xander', 'Yara', 'Zephyr', 'Amon', 'Beatriz', 'Cyrus', 'Dara'];
const RACES = ['Humano', 'Elfo', 'Anão', 'Halfling', 'Meio-Orc', 'Tiefling', 'Gnomo', 'Draconato', 'Meio-Elfo', 'Goliath'];
const CLASSES = ['Guerreiro', 'Mago', 'Ladino', 'Clérigo', 'Bardo', 'Ranger', 'Paladino', 'Bárbaro', 'Druida', 'Feiticeiro', 'Bruxo', 'Monge', 'Plebeu'];
const PERSONALITIES = ['Corajoso e destemido', 'Tímido e reservado', 'Arrogante e vaidoso', 'Gentil e prestativo', 'Misterioso e enigmático', 'Brincalhão e sarcástico', 'Sério e focado', 'Paranoico e desconfiado', 'Otimista e alegre', 'Melancólico e filosófico', 'Impaciente e explosivo', 'Calmo e sábio'];
const QUIRKS = ['Fala sozinho constantemente', 'Coleciona ossos de criaturas', 'Tem medo irracional de gatos', 'Ri em momentos inapropriados', 'Sempre come algo', 'Faz rimas sem querer', 'Coça o nariz quando mente', 'Tem um tique no olho', 'Fala em terceira pessoa', 'Carrega um objeto de estimação estranho', 'Assobia melodias desconhecidas', 'Nunca faz contato visual'];
const OCCUPATIONS = ['Ferreiro', 'Taberneiro', 'Mercador ambulante', 'Curandeiro', 'Guarda da cidade', 'Ladrão aposentado', 'Pescador', 'Fazendeiro', 'Alquimista', 'Escriba', 'Caçador de recompensas', 'Artista de rua', 'Minerador', 'Navegador', 'Cozinheiro'];
const SECRETS = ['É um espião de outro reino', 'Possui uma dívida impagável', 'É secretamente um lobisomem', 'Matou alguém por acidente', 'Possui um mapa de um tesouro lendário', 'É herdeiro de um trono perdido', 'Fez um pacto com um demônio', 'Está fugindo de uma guilda de assassinos', 'Guarda um artefato perigoso', 'É na verdade um polimorfado', 'Traiu seus antigos companheiros', 'Conhece a localização de uma masmorra antiga'];

const generateNPC = (): NPC => ({
  id: crypto.randomUUID(),
  name: pick(NAMES),
  race: pick(RACES),
  npcClass: pick(CLASSES),
  personality: pick(PERSONALITIES),
  quirk: pick(QUIRKS),
  occupation: pick(OCCUPATIONS),
  secret: pick(SECRETS),
});

const NPCGenerator = () => {
  const [current, setCurrent] = useState<NPC | null>(null);
  const [saved, setSaved] = useLocalStorage<NPC[]>('arcanum-npcs', []);

  const generate = () => setCurrent(generateNPC());
  const saveNPC = () => { if (current) { setSaved(prev => [current, ...prev]); setCurrent(null); } };
  const remove = (id: string) => setSaved(prev => prev.filter(n => n.id !== id));

  const NPCCard = ({ npc, actions }: { npc: NPC; actions: React.ReactNode }) => (
    <Card className="card-hover">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-bold">{npc.name}</h3>
          {actions}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Raça:</span> {npc.race}</div>
          <div><span className="text-muted-foreground">Classe:</span> {npc.npcClass}</div>
          <div><span className="text-muted-foreground">Ocupação:</span> {npc.occupation}</div>
        </div>
        <div className="text-sm"><span className="text-muted-foreground">Personalidade:</span> {npc.personality}</div>
        <div className="text-sm"><span className="text-muted-foreground">Peculiaridade:</span> {npc.quirk}</div>
        <div className="text-sm text-accent"><span className="text-muted-foreground">Segredo:</span> {npc.secret}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Gerador de NPC</h1>
        <Button onClick={generate}><Sparkles className="w-4 h-4 mr-2" />Gerar NPC</Button>
      </div>

      {current && (
        <NPCCard npc={current} actions={
          <Button size="sm" onClick={saveNPC}><Save className="w-3 h-3 mr-1" />Salvar</Button>
        } />
      )}

      {saved.length > 0 && (
        <>
          <h2 className="text-xl font-display font-semibold mt-8">NPCs Salvos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saved.map(npc => (
              <NPCCard key={npc.id} npc={npc} actions={
                <Button variant="ghost" size="icon" onClick={() => remove(npc.id)}><Trash2 className="w-4 h-4" /></Button>
              } />
            ))}
          </div>
        </>
      )}

      {!current && saved.length === 0 && (
        <Card className="card-hover"><CardContent className="p-12 text-center">
          <UserPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Clique em "Gerar NPC" para criar um personagem aleatório</p>
        </CardContent></Card>
      )}
    </div>
  );
};

export default NPCGenerator;
