import { motion } from 'framer-motion';
import { forestLevel, forestTitle, FOREST_MAX_DISPLAY } from '../utils/forest';

export default function ForestVisualizer({ points = 0, compact = false }) {
  const level = forestLevel(points);
  const pct = Math.min(100, Math.round((points / FOREST_MAX_DISPLAY) * 100));
  const trees = ['', '🌱', '🌿', '🌳', '🌲', '🌲🦋🐿️'];

  return (
    <div className={`forest-viz ${compact ? 'forest-viz--compact' : ''}`}>
      <div className="forest-viz__sky">
        <span className="forest-viz__sun">☀️</span>
        {level >= 3 && <span className="forest-viz__cloud">☁️</span>}
      </div>
      <div className="forest-viz__ground">
        <motion.div
          className="forest-viz__emoji"
          key={level}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          {trees[level] || '🏕️'}
        </motion.div>
      </div>
      {!compact && (
        <>
          <p className="forest-viz__title">{forestTitle(level)}</p>
          <div className="forest-viz__bar">
            <motion.div
              className="forest-viz__fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <p className="forest-viz__points">
            🌳 Лес: <strong>{points}</strong> очков
          </p>
        </>
      )}
      <style>{`
        .forest-viz {
          text-align: center;
          padding: 1rem;
          background: linear-gradient(180deg, #87ceeb 0%, #a5d6a7 70%);
          border-radius: var(--radius);
          border: 4px solid var(--grass-dark);
        }
        .forest-viz--compact {
          padding: 0.5rem;
        }
        .forest-viz--compact .forest-viz__emoji {
          font-size: 2rem;
        }
        .forest-viz__sky {
          position: relative;
          height: 2.5rem;
        }
        .forest-viz__sun {
          font-size: 1.75rem;
        }
        .forest-viz__cloud {
          position: absolute;
          right: 20%;
          font-size: 1.25rem;
        }
        .forest-viz__ground {
          min-height: 4rem;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .forest-viz__emoji {
          font-size: 3.5rem;
          line-height: 1;
        }
        .forest-viz__title {
          font-weight: 800;
          margin: 0.5rem 0 0.25rem;
        }
        .forest-viz__bar {
          height: 14px;
          background: #c8e6c9;
          border-radius: 999px;
          overflow: hidden;
          margin: 0.5rem auto;
          max-width: 280px;
          border: 2px solid var(--grass-dark);
        }
        .forest-viz__fill {
          height: 100%;
          background: linear-gradient(90deg, #66bb6a, #2e7d32);
          border-radius: 999px;
        }
        .forest-viz__points {
          margin: 0;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}
