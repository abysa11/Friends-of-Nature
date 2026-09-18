import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GAMES } from '../../data/games';
import { useSocket } from '../../context/SocketContext';

export default function TeacherHub() {
  const { socket, connected } = useSocket();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(() => GAMES.map((g) => g.id));
  const [mode, setMode] = useState('phones');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleGame = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const createRoom = () => {
    if (selected.length === 0) {
      setError('Выберите хотя бы одну игру');
      return;
    }
    setLoading(true);
    setError('');
    socket.emit(
      'teacher:createRoom',
      { games: selected, mode, teacherName: name || 'Учитель' },
      (res) => {
        setLoading(false);
        if (res?.ok) {
          sessionStorage.setItem(
            'fon-teacher',
            JSON.stringify({ code: res.code, mode, games: selected, name: name || 'Учитель' })
          );
          navigate(`/teacher/room/${res.code}`);
        } else {
          setError('Не удалось создать комнату. Проверьте, запущен ли сервер.');
        }
      }
    );
  };

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← На главную
      </Link>
      <div className="card">
        <h1>👩‍🏫 Панель учителя</h1>
        {!connected && (
          <p style={{ background: '#ffecb3', padding: '0.75rem', borderRadius: 12 }}>
            ⚠️ Нет связи с сервером. Запустите проект командой <code>npm run dev</code> в папке проекта.
          </p>
        )}
        <Link to="/teacher/lesson" style={{ fontWeight: 700 }}>
          📖 Инструкция к уроку (прочитать перед стартом)
        </Link>

        <label style={{ display: 'block', marginTop: '1.5rem', fontWeight: 700 }}>
          Ваше имя (необязательно)
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Учитель Анна"
            style={{ display: 'block', width: '100%', marginTop: 8, padding: 12, borderRadius: 12, border: '2px solid #ccc', fontSize: '1rem' }}
          />
        </label>

        <h2 style={{ marginTop: '1.5rem' }}>Как играем?</h2>
        <div className="mode-picker">
          <button
            type="button"
            className={`mode-picker__opt ${mode === 'board' ? 'active' : ''}`}
            onClick={() => setMode('board')}
          >
            🖥️ Интерактивная доска
            <small>Один экран, класс отвечает вслух</small>
          </button>
          <button
            type="button"
            className={`mode-picker__opt ${mode === 'phones' ? 'active' : ''}`}
            onClick={() => setMode('phones')}
          >
            📱 Телефоны учеников
            <small>Каждый заходит по коду комнаты</small>
          </button>
        </div>

        <h2>Выберите игры для урока</h2>
        <div className="game-grid">
          {GAMES.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`game-tile ${selected.includes(g.id) ? 'selected' : ''}`}
              onClick={() => toggleGame(g.id)}
            >
              <span style={{ fontSize: '2rem' }}>{g.emoji}</span>
              <h3 style={{ margin: '0.5rem 0' }}>{g.title}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{g.short}</p>
            </button>
          ))}
        </div>

        {error && <p style={{ color: '#c62828', fontWeight: 700 }}>{error}</p>}

        <button
          type="button"
          className="btn-teacher"
          style={{ marginTop: '1.5rem', width: '100%' }}
          onClick={createRoom}
          disabled={loading || !connected}
        >
          {loading ? 'Создаём…' : '🚪 Открыть комнату урока'}
        </button>
      </div>
      <style>{`
        .mode-picker {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 600px) {
          .mode-picker {
            grid-template-columns: 1fr;
          }
        }
        .mode-picker__opt {
          text-align: left;
          padding: 1rem;
          border-radius: var(--radius);
          border: 3px solid #e0e0e0;
          background: white;
          font-weight: 700;
        }
        .mode-picker__opt small {
          display: block;
          font-weight: 600;
          opacity: 0.75;
          margin-top: 0.35rem;
        }
        .mode-picker__opt.active {
          border-color: var(--teacher);
          background: #e8eaf6;
        }
      `}</style>
    </div>
  );
}
