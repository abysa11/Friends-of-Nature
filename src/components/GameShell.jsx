import { Link } from 'react-router-dom';
import { getGameById } from '../data/games';

export default function GameShell({ gameId, children, onComplete, score, maxScore, hint }) {
  const game = getGameById(gameId);

  return (
    <div className="page">
      <Link to=".." className="back-link">
        ← Назад к играм
      </Link>
      <div className="card game-shell">
        <header className="game-shell__head">
          <span className="game-shell__emoji">{game?.emoji}</span>
          <div>
            <h1>{game?.title}</h1>
            <p className="game-shell__sub">{game?.short}</p>
          </div>
          {score != null && (
            <span className="badge">
              {score} / {maxScore ?? game?.maxPoints}
            </span>
          )}
        </header>
        {hint && <p className="game-shell__hint">{hint}</p>}
        <div className="game-shell__body">{children}</div>
        {onComplete && (
          <footer className="game-shell__foot">
            <button type="button" className="btn-primary" onClick={onComplete}>
              Готово — забрать очки в лес 🌲
            </button>
          </footer>
        )}
      </div>
      <style>{`
        .game-shell__head {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .game-shell__emoji {
          font-size: 3rem;
        }
        .game-shell__sub {
          margin: 0;
          opacity: 0.85;
        }
        .game-shell__hint {
          background: #e3f2fd;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          margin: 0 0 1rem;
        }
        .game-shell__body {
          min-height: 200px;
        }
        .game-shell__foot {
          margin-top: 1.5rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
