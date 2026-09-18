import { Link } from 'react-router-dom';
import { GAMES } from '../data/games';
import ForestVisualizer from '../components/ForestVisualizer';

export default function SoloPlay() {
  const points = Number(localStorage.getItem('fon-solo-forest') || 0);

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← На главную
      </Link>
      <h1>Играю сам 🌈</h1>
      <p>Все очки идут в твой личный лес на этом устройстве.</p>
      <ForestVisualizer points={points} />
      <div className="game-grid" style={{ marginTop: '1.5rem' }}>
        {GAMES.map((g) => (
          <Link
            key={g.id}
            to={`/student/game/${g.id}?solo=1`}
            className="game-tile"
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <span style={{ fontSize: '2rem' }}>{g.emoji}</span>
            <h3>{g.title}</h3>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>{g.short}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
