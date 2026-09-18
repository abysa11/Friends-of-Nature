import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell from '../../components/GameShell';
import { useAwardPoints } from '../../hooks/useAwardPoints';

const FALLING = ['🥤', '🛍️', '🍬', '🧴'];
const MAX_ROUNDS = 12;

export default function CatchTrash({ onDone, solo, code, mode }) {
  const award = useAwardPoints('catch-trash', solo ? null : code, solo ? 'board' : mode);
  const [items, setItems] = useState([]);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const idRef = useRef(0);
  const spawnedRef = useRef(0);

  const resolved = caught + missed;
  const score = Math.max(0, Math.round((caught / MAX_ROUNDS) * 45 - missed * 2));

  const spawn = useCallback(() => {
    if (spawnedRef.current >= MAX_ROUNDS) return;
    spawnedRef.current += 1;
    const id = idRef.current++;
    setItems((prev) => [
      ...prev,
      {
        id,
        emoji: FALLING[Math.floor(Math.random() * FALLING.length)],
        x: 10 + Math.random() * 80,
        duration: 2.8 + Math.random() * 1.2,
      },
    ]);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (resolved >= MAX_ROUNDS && items.length === 0) {
      setRunning(false);
      return;
    }
    const t = setInterval(spawn, 950);
    return () => clearInterval(t);
  }, [running, spawn, resolved, items.length]);

  const catchItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setCaught((c) => c + 1);
  };

  const onMiss = () => {
    setMissed((m) => m + 1);
  };

  const start = () => {
    setCaught(0);
    setMissed(0);
    setItems([]);
    idRef.current = 0;
    spawnedRef.current = 0;
    setRunning(true);
  };

  const complete = async () => {
    if (!finished) {
      await award(score);
      setFinished(true);
    }
    onDone();
  };

  const gameOver = !running && resolved >= MAX_ROUNDS;

  return (
    <GameShell gameId="catch-trash" score={score} hint="Нажми на мусор, пока он летит! Не дай ему упасть в воду.">
      {!running && !gameOver && (
        <button type="button" className="btn-primary" onClick={start}>
          ▶️ Начать ловлю!
        </button>
      )}
      {(running || items.length > 0) && (
        <div className="catch-area">
          <div className="catch-water">🌊 водоём</div>
          {items.map((it) => (
            <FallingItem key={it.id} item={it} onCatch={() => catchItem(it.id)} onLand={onMiss} />
          ))}
          <p className="catch-hud">
            Поймано: {caught} · Мимо: {missed} · Всего: {resolved}/{MAX_ROUNDS}
          </p>
        </div>
      )}
      {gameOver && (
        <button type="button" className="btn-primary" onClick={complete}>
          Готово — забрать очки в лес 🌲
        </button>
      )}
      <style>{`
        .catch-area {
          position: relative;
          height: 320px;
          background: linear-gradient(180deg, #b3e5fc 0%, #81d4fa 70%, #0288d1 70%);
          border-radius: var(--radius);
          overflow: hidden;
          border: 4px solid #01579b;
        }
        .catch-water {
          position: absolute;
          bottom: 0;
          width: 100%;
          text-align: center;
          color: white;
          font-weight: 800;
          padding: 1rem;
        }
        .catch-hud {
          position: absolute;
          top: 8px;
          left: 8px;
          margin: 0;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
        }
      `}</style>
    </GameShell>
  );
}

function FallingItem({ item, onCatch, onLand }) {
  const [y, setY] = useState(0);
  const landed = useRef(false);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / (item.duration * 1000));
      setY(p * 85);
      if (p >= 1 && !landed.current) {
        landed.current = true;
        onLand();
      } else if (p < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [item, onLand]);

  return (
    <button
      type="button"
      className="falling"
      style={{ left: `${item.x}%`, top: `${y}%` }}
      onClick={onCatch}
    >
      {item.emoji}
      <style>{`
        .falling {
          position: absolute;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          background: rgba(255, 255, 255, 0.8);
          border: none;
          border-radius: 12px;
          padding: 0.25rem;
          z-index: 2;
        }
      `}</style>
    </button>
  );
}
