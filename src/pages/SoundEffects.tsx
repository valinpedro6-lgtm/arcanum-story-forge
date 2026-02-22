import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  CloudRain, Trees, Swords, AlertTriangle, Skull,
  Guitar, Beer, Play, Pause, Volume2, VolumeX, StopCircle
} from 'lucide-react';

interface SoundChannel {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  createSound: (ctx: AudioContext) => { nodes: AudioNode[]; stop: () => void };
}

function createWhiteNoise(ctx: AudioContext, duration = 2): AudioBuffer {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createRain(ctx: AudioContext) {
  const noise = ctx.createBufferSource();
  noise.buffer = createWhiteNoise(ctx);
  noise.loop = true;

  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 800;

  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = 200;

  const gain = ctx.createGain();
  gain.gain.value = 0.4;

  noise.connect(lpf).connect(hpf).connect(gain).connect(ctx.destination);
  noise.start();

  return { nodes: [gain], stop: () => noise.stop() };
}

function createForest(ctx: AudioContext) {
  const nodes: AudioNode[] = [];
  const stopFns: (() => void)[] = [];

  // Wind-like noise
  const wind = ctx.createBufferSource();
  wind.buffer = createWhiteNoise(ctx);
  wind.loop = true;
  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = 300;
  bpf.Q.value = 0.5;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.15;
  wind.connect(bpf).connect(windGain).connect(ctx.destination);
  wind.start();
  stopFns.push(() => wind.stop());

  // Bird-like chirps via oscillator modulation
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 3;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 800;
  lfo.connect(lfoGain);

  const bird = ctx.createOscillator();
  bird.type = 'sine';
  bird.frequency.value = 2000;
  lfoGain.connect(bird.frequency);
  const birdGain = ctx.createGain();
  birdGain.gain.value = 0.03;
  bird.connect(birdGain).connect(ctx.destination);
  bird.start();
  lfo.start();
  stopFns.push(() => { bird.stop(); lfo.stop(); });

  nodes.push(windGain, birdGain);
  return { nodes, stop: () => stopFns.forEach(fn => fn()) };
}

function createTavern(ctx: AudioContext) {
  const nodes: AudioNode[] = [];
  const stopFns: (() => void)[] = [];

  // Crowd murmur
  const noise = ctx.createBufferSource();
  noise.buffer = createWhiteNoise(ctx);
  noise.loop = true;
  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 500;
  const murmurGain = ctx.createGain();
  murmurGain.gain.value = 0.2;
  noise.connect(lpf).connect(murmurGain).connect(ctx.destination);
  noise.start();
  stopFns.push(() => noise.stop());

  // Crackling fire effect
  const fire = ctx.createBufferSource();
  const fireBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const fireData = fireBuffer.getChannelData(0);
  for (let i = 0; i < fireData.length; i++) {
    fireData[i] = (Math.random() > 0.97 ? Math.random() : 0) * 0.5;
  }
  fire.buffer = fireBuffer;
  fire.loop = true;
  const fireGain = ctx.createGain();
  fireGain.gain.value = 0.3;
  fire.connect(fireGain).connect(ctx.destination);
  fire.start();
  stopFns.push(() => fire.stop());

  nodes.push(murmurGain, fireGain);
  return { nodes, stop: () => stopFns.forEach(fn => fn()) };
}

function createBattle(ctx: AudioContext) {
  const nodes: AudioNode[] = [];
  const stopFns: (() => void)[] = [];

  // Aggressive drums
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 80;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 4;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 30;
  lfo.connect(lfoGain).connect(osc.frequency);
  const distortion = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = (Math.PI + 20) * x / (Math.PI + 20 * Math.abs(x));
  }
  distortion.curve = curve;
  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  osc.connect(distortion).connect(gain).connect(ctx.destination);
  osc.start();
  lfo.start();
  stopFns.push(() => { osc.stop(); lfo.stop(); });

  // Clash noise
  const clash = ctx.createBufferSource();
  clash.buffer = createWhiteNoise(ctx);
  clash.loop = true;
  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = 3000;
  bpf.Q.value = 2;
  const clashGain = ctx.createGain();
  clashGain.gain.value = 0.08;
  const clashLfo = ctx.createOscillator();
  clashLfo.frequency.value = 6;
  const clashLfoGain = ctx.createGain();
  clashLfoGain.gain.value = 0.08;
  clashLfo.connect(clashLfoGain).connect(clashGain.gain);
  clash.connect(bpf).connect(clashGain).connect(ctx.destination);
  clash.start();
  clashLfo.start();
  stopFns.push(() => { clash.stop(); clashLfo.stop(); });

  nodes.push(gain, clashGain);
  return { nodes, stop: () => stopFns.forEach(fn => fn()) };
}

function createTension(ctx: AudioContext) {
  const nodes: AudioNode[] = [];
  const stopFns: (() => void)[] = [];

  // Deep drone
  const drone = ctx.createOscillator();
  drone.type = 'sine';
  drone.frequency.value = 55;
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.2;
  drone.connect(droneGain).connect(ctx.destination);
  drone.start();

  // Dissonant overtone
  const overtone = ctx.createOscillator();
  overtone.type = 'sine';
  overtone.frequency.value = 58;
  const overtoneGain = ctx.createGain();
  overtoneGain.gain.value = 0.12;
  overtone.connect(overtoneGain).connect(ctx.destination);
  overtone.start();

  // Slow pulse LFO on volume
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.3;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.1;
  lfo.connect(lfoGain).connect(droneGain.gain);
  lfo.start();

  stopFns.push(() => { drone.stop(); overtone.stop(); lfo.stop(); });
  nodes.push(droneGain, overtoneGain);
  return { nodes, stop: () => stopFns.forEach(fn => fn()) };
}

function createBoss(ctx: AudioContext) {
  const nodes: AudioNode[] = [];
  const stopFns: (() => void)[] = [];

  // Menacing bass
  const bass = ctx.createOscillator();
  bass.type = 'sawtooth';
  bass.frequency.value = 40;
  const bassGain = ctx.createGain();
  bassGain.gain.value = 0.2;
  const bassFilter = ctx.createBiquadFilter();
  bassFilter.type = 'lowpass';
  bassFilter.frequency.value = 200;
  bass.connect(bassFilter).connect(bassGain).connect(ctx.destination);
  bass.start();

  // Rhythmic pulse
  const pulse = ctx.createOscillator();
  pulse.type = 'square';
  pulse.frequency.value = 2;
  const pulseGain = ctx.createGain();
  pulseGain.gain.value = 0.15;
  pulse.connect(pulseGain).connect(bassGain.gain);
  pulse.start();

  // High eerie tone
  const eerie = ctx.createOscillator();
  eerie.type = 'sine';
  eerie.frequency.value = 660;
  const eerieGain = ctx.createGain();
  eerieGain.gain.value = 0.04;
  const eerieVibrato = ctx.createOscillator();
  eerieVibrato.frequency.value = 5;
  const vibratoGain = ctx.createGain();
  vibratoGain.gain.value = 20;
  eerieVibrato.connect(vibratoGain).connect(eerie.frequency);
  eerie.connect(eerieGain).connect(ctx.destination);
  eerie.start();
  eerieVibrato.start();

  stopFns.push(() => { bass.stop(); pulse.stop(); eerie.stop(); eerieVibrato.stop(); });
  nodes.push(bassGain, eerieGain);
  return { nodes, stop: () => stopFns.forEach(fn => fn()) };
}

function createHeavyRock(ctx: AudioContext) {
  const nodes: AudioNode[] = [];
  const stopFns: (() => void)[] = [];

  // Power chord (root + fifth)
  const root = ctx.createOscillator();
  root.type = 'sawtooth';
  root.frequency.value = 82.41; // E2
  const fifth = ctx.createOscillator();
  fifth.type = 'sawtooth';
  fifth.frequency.value = 123.47; // B2

  const distortion = ctx.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = Math.tanh(x * 4);
  }
  distortion.curve = curve;

  const chordGain = ctx.createGain();
  chordGain.gain.value = 0.12;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 2.5;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 10;
  lfo.connect(lfoGain).connect(root.frequency);

  root.connect(distortion);
  fifth.connect(distortion);
  distortion.connect(chordGain).connect(ctx.destination);
  root.start();
  fifth.start();
  lfo.start();

  // Kick pattern
  const kick = ctx.createOscillator();
  kick.type = 'sine';
  kick.frequency.value = 60;
  const kickLfo = ctx.createOscillator();
  kickLfo.frequency.value = 4;
  const kickLfoGain = ctx.createGain();
  kickLfoGain.gain.value = 0.15;
  kickLfo.connect(kickLfoGain);
  const kickGain = ctx.createGain();
  kickGain.gain.value = 0;
  kickLfoGain.connect(kickGain.gain);
  kick.connect(kickGain).connect(ctx.destination);
  kick.start();
  kickLfo.start();

  stopFns.push(() => { root.stop(); fifth.stop(); lfo.stop(); kick.stop(); kickLfo.stop(); });
  nodes.push(chordGain, kickGain);
  return { nodes, stop: () => stopFns.forEach(fn => fn()) };
}

const soundChannels: SoundChannel[] = [
  { id: 'rain', label: 'Chuva', icon: CloudRain, description: 'Chuva constante e relaxante', color: 'from-blue-500/20 to-blue-600/10', createSound: createRain },
  { id: 'tavern', label: 'Taverna', icon: Beer, description: 'Murmúrios, lareira crepitando', color: 'from-amber-500/20 to-amber-600/10', createSound: createTavern },
  { id: 'forest', label: 'Floresta', icon: Trees, description: 'Vento entre árvores e pássaros', color: 'from-green-500/20 to-green-600/10', createSound: createForest },
  { id: 'battle', label: 'Batalha', icon: Swords, description: 'Ritmo agressivo de combate', color: 'from-red-500/20 to-red-600/10', createSound: createBattle },
  { id: 'tension', label: 'Tensão', icon: AlertTriangle, description: 'Drone sombrio e pulsante', color: 'from-purple-500/20 to-purple-600/10', createSound: createTension },
  { id: 'boss', label: 'Boss', icon: Skull, description: 'Tema ameaçador de chefe final', color: 'from-rose-500/20 to-rose-600/10', createSound: createBoss },
  { id: 'rock', label: 'Rock Pesado', icon: Guitar, description: 'Riffs distorcidos para combate épico', color: 'from-orange-500/20 to-orange-600/10', createSound: createHeavyRock },
];

interface ActiveSound {
  gainNodes: GainNode[];
  stopFn: () => void;
  volume: number;
}

const SoundEffects = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [activeSounds, setActiveSounds] = useState<Record<string, ActiveSound>>({});
  const [masterVolume, setMasterVolume] = useState(0.7);
  const masterGainRef = useRef<GainNode | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = masterVolume;
      master.connect(ctx.destination);
      audioCtxRef.current = ctx;
      masterGainRef.current = master;
    }
    return audioCtxRef.current;
  }, []);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = masterVolume;
    }
  }, [masterVolume]);

  useEffect(() => {
    return () => {
      Object.values(activeSounds).forEach(s => s.stopFn());
      audioCtxRef.current?.close();
    };
  }, []);

  const toggleSound = useCallback((channel: SoundChannel) => {
    setActiveSounds(prev => {
      if (prev[channel.id]) {
        prev[channel.id].stopFn();
        const next = { ...prev };
        delete next[channel.id];
        return next;
      }

      const ctx = getAudioContext();
      // Rewire destination through master gain
      const origDest = ctx.destination;
      const masterGain = masterGainRef.current!;

      const result = channel.createSound(ctx);

      // Reconnect through master: disconnect from destination, connect to masterGain
      result.nodes.forEach(node => {
        try {
          node.disconnect(origDest);
          node.connect(masterGain);
        } catch {
          // already connected or different routing
        }
      });

      return {
        ...prev,
        [channel.id]: {
          gainNodes: result.nodes as GainNode[],
          stopFn: result.stop,
          volume: 0.7,
        },
      };
    });
  }, [getAudioContext]);

  const setChannelVolume = useCallback((id: string, vol: number) => {
    setActiveSounds(prev => {
      const sound = prev[id];
      if (!sound) return prev;
      sound.gainNodes.forEach(g => {
        if (g instanceof GainNode) {
          g.gain.value = g.gain.value * (vol / (sound.volume || 0.7));
        }
      });
      return { ...prev, [id]: { ...sound, volume: vol } };
    });
  }, []);

  const stopAll = useCallback(() => {
    Object.values(activeSounds).forEach(s => s.stopFn());
    setActiveSounds({});
  }, [activeSounds]);

  const activeCount = Object.keys(activeSounds).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Efeitos Sonoros</h1>
          <p className="text-muted-foreground mt-1">Mixer de sons ambiente para imersão na sessão</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            {masterVolume > 0 ? (
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
            <Slider
              value={[masterVolume * 100]}
              onValueChange={([v]) => setMasterVolume(v / 100)}
              max={100}
              step={1}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          {activeCount > 0 && (
            <Button variant="destructive" size="sm" onClick={stopAll} className="gap-1.5">
              <StopCircle className="w-4 h-4" />
              Parar Tudo
            </Button>
          )}
        </div>
      </div>

      {activeCount > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 text-sm text-primary">
          🎵 {activeCount} {activeCount === 1 ? 'canal ativo' : 'canais ativos'} — misture sons para criar a atmosfera perfeita
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {soundChannels.map(channel => {
          const isActive = !!activeSounds[channel.id];
          const Icon = channel.icon;

          return (
            <Card
              key={channel.id}
              className={`relative overflow-hidden transition-all duration-300 ${
                isActive
                  ? 'ring-2 ring-primary shadow-lg shadow-primary/10'
                  : 'hover:shadow-md'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${channel.color} transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
              <CardContent className="relative p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{channel.label}</h3>
                      <p className="text-xs text-muted-foreground">{channel.description}</p>
                    </div>
                  </div>

                  <Button
                    variant={isActive ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => toggleSound(channel)}
                  >
                    {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </Button>
                </div>

                {isActive && (
                  <div className="flex items-center gap-2 pt-1">
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <Slider
                      value={[activeSounds[channel.id].volume * 100]}
                      onValueChange={([v]) => setChannelVolume(channel.id, v / 100)}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {Math.round(activeSounds[channel.id].volume * 100)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SoundEffects;
