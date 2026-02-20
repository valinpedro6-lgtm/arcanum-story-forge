import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface TimerState {
  realMinutesPerGameHour: number;
  isRunning: boolean;
  gameMinutesElapsed: number;
  lastTickTimestamp: number;
}

const GameTimer = () => {
  const [timer, setTimer] = useLocalStorage<TimerState>('arcanum-timer', {
    realMinutesPerGameHour: 1,
    isRunning: false,
    gameMinutesElapsed: 0,
    lastTickTimestamp: 0,
  });

  // Catch up on mount if timer was running
  useEffect(() => {
    if (timer.isRunning && timer.lastTickTimestamp > 0) {
      const realMsElapsed = Date.now() - timer.lastTickTimestamp;
      const realMinutesElapsed = realMsElapsed / 60000;
      const gameMinutesGained = (realMinutesElapsed / timer.realMinutesPerGameHour) * 60;
      setTimer(prev => ({
        ...prev,
        gameMinutesElapsed: prev.gameMinutesElapsed + gameMinutesGained,
        lastTickTimestamp: Date.now(),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick every second
  useEffect(() => {
    if (!timer.isRunning) return;
    const interval = setInterval(() => {
      const gameMinutesPerRealSecond = 60 / (timer.realMinutesPerGameHour * 60);
      setTimer(prev => ({
        ...prev,
        gameMinutesElapsed: prev.gameMinutesElapsed + gameMinutesPerRealSecond,
        lastTickTimestamp: Date.now(),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer.isRunning, timer.realMinutesPerGameHour, setTimer]);

  const totalMinutes = Math.floor(timer.gameMinutesElapsed);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const toggle = () => setTimer(prev => ({ ...prev, isRunning: !prev.isRunning, lastTickTimestamp: Date.now() }));
  const reset = () => setTimer(prev => ({ ...prev, isRunning: false, gameMinutesElapsed: 0, lastTickTimestamp: 0 }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Timer do Jogo</h1>
      <div className="max-w-lg mx-auto">
        <Card className="card-hover">
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Minutos reais = 1 hora no jogo
              </label>
              <Input
                type="number"
                min={0.1}
                step={0.1}
                value={timer.realMinutesPerGameHour}
                onChange={e => setTimer(prev => ({ ...prev, realMinutesPerGameHour: Math.max(0.1, parseFloat(e.target.value) || 1) }))}
                disabled={timer.isRunning}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {timer.realMinutesPerGameHour} min real = 1h no jogo
              </p>
            </div>

            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-primary mx-auto mb-4 opacity-50" />
              <div className="text-5xl font-display font-bold text-primary dice-glow">
                {days > 0 && <span>{days}d </span>}
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
              </div>
              <p className="text-muted-foreground mt-2">Tempo no jogo</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={toggle} className="flex-1" size="lg">
                {timer.isRunning ? <><Pause className="w-4 h-4 mr-2" />Pausar</> : <><Play className="w-4 h-4 mr-2" />Iniciar</>}
              </Button>
              <Button onClick={reset} variant="outline" size="lg">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameTimer;
