import { useState } from 'react';
import { motion } from 'framer-motion';
import GameShell from '../../components/GameShell';
import { useAwardPoints } from '../../hooks/useAwardPoints';

const SPOTS = [
  { id: 0, x: 15, y: 55 },
  { id: 1, x: 35, y: 62 },
  { id: 2, x: 55, y: 58 },
  { id: 3, x: 75, y: 65 },
  { id: 4, x: 25, y: 72 },
  { id: 5, x: 65, y: 75 },
];

export default function PlantTrees({ onDone, solo, code, mode }) {
  const award = useAwardPoints('plant-trees', solo ? null : code, solo ? 'board' : mode);
  const [planted, setPlanted] = useState(new Set());
  const [finished, setFinished] = useState(false);

  const score = Math.round((planted.size / SPOTS.length) * 45);

  const plant = (id) => {
    setPlanted((s) => new Set(s).add(id));
  };

  const complete = async () => {
    if (!finished) {
      await award(score);
      setFinished(true);
    }
    onDone();
  };

  return (
    <GameShell
      gameId="plant-trees"
      score={score}
      hint="Нажми на пустые ямки с 🕳️ — посади дерево! Деревья дают кислород и уют зверятам."
      onComplete={planted.size === SPOTS.length ? complete : undefined}
    >
      <div className="plant-field">
        {SPOTS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="plant-spot"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            onClick={() => !planted.has(s.id) && plant(s.id)}
            disabled={planted.has(s.id)}
          >
            {planted.has(s.id) ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="tree">
                🌳
              </motion.span>
            ) : (
              '🕳️'
            )}
          </button>
        ))}
        <p className="plant-count">Посажено: {planted.size} / {SPOTS.length}</p>
      </div>
      <style>{`
        .plant-field {
          position: relative;
          height: 280px;
          background: linear-gradient(180deg, #87ceeb 30%, #8bc34a 30%);
          border-radius: var(--radius);
          border: 4px solid var(--grass-dark);
        }
        .plant-spot {
          position: absolute;
          transform: translate(-50%, -50%);
          font-size: 2.5rem;
          background: transparent;
          border: none;
          padding: 0;
        }
        .plant-spot:disabled {
          cursor: default;
        }
        .tree {
          display: inline-block;
        }
        .plant-count {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          margin: 0;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.35rem 1rem;
          border-radius: 999px;
        }
      `}</style>
    </GameShell>
  );
}
