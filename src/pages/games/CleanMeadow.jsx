import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell from '../../components/GameShell';
import { useAwardPoints } from '../../hooks/useAwardPoints';

const TRASH = ['🥤', '🧴', '🍬', '🚬', '🛍️', '🥫', '🧃', '📎'];

export default function CleanMeadow({ onDone, solo, code, mode }) {
  const award = useAwardPoints('clean-meadow', solo ? null : code, solo ? 'board' : mode);
  const items = useMemo(
    () =>
      TRASH.map((emoji, i) => ({
        id: i,
        emoji,
        left: 10 + (i * 11) % 80,
        top: 15 + (i * 17) % 55,
      })),
    []
  );
  const [left, setLeft] = useState(() => new Set());
  const [finished, setFinished] = useState(false);

  const collected = left.size;
  const score = Math.round((collected / items.length) * 40);

  const pick = (id) => {
    setLeft((s) => new Set(s).add(id));
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
      gameId="clean-meadow"
      score={score}
      hint="Нажми на весь мусор на полянке и у пруда. Чистая природа — дом для животных!"
      onComplete={collected === items.length ? complete : undefined}
    >
      <div className="meadow">
        <div className="meadow__pond">💧 водоём</div>
        <AnimatePresence>
          {items.map(
            (it) =>
              !left.has(it.id) && (
                <motion.button
                  key={it.id}
                  type="button"
                  className="meadow__trash"
                  style={{ left: `${it.left}%`, top: `${it.top}%` }}
                  onClick={() => pick(it.id)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.2 }}
                >
                  {it.emoji}
                </motion.button>
              )
          )}
        </AnimatePresence>
        <p className="meadow__stat">
          Собрано: {collected} / {items.length} 🧺
        </p>
      </div>
      <style>{`
        .meadow {
          position: relative;
          height: 320px;
          background: linear-gradient(180deg, #81c784 0%, #aed581 60%, #4fc3f7 60%, #29b6f6 100%);
          border-radius: var(--radius);
          border: 4px solid var(--grass-dark);
          overflow: hidden;
        }
        .meadow__pond {
          position: absolute;
          bottom: 0;
          right: 0;
          left: 0;
          height: 40%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 1.1rem;
        }
        .meadow__trash {
          position: absolute;
          font-size: 2rem;
          background: rgba(255, 255, 255, 0.7);
          border: none;
          border-radius: 12px;
          padding: 0.25rem;
          cursor: pointer;
        }
        .meadow__stat {
          position: absolute;
          top: 8px;
          left: 12px;
          margin: 0;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.85);
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
        }
      `}</style>
    </GameShell>
  );
}
