import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { getGameById } from '../../data/games';
import ForestVisualizer from '../../components/ForestVisualizer';

export default function TeacherRoom() {
  const { code } = useParams();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    socket.emit('teacher:getRoom', { code }, (res) => {
      if (res?.ok) setRoom(res.room);
    });
    const onUpdate = (r) => {
      if (r.code === code) setRoom(r);
    };
    socket.on('room:updated', onUpdate);
    return () => socket.off('room:updated', onUpdate);
  }, [socket, code]);

  const startGame = (gameId) => {
    socket.emit('teacher:startGame', { code, gameId }, (res) => {
      if (res?.ok) navigate(`/teacher/game/${gameId}?code=${code}&mode=${room?.mode || 'board'}`);
    });
  };

  const addClassPoints = (n) => {
    socket.emit('teacher:addClassPoints', { code, points: n });
  };

  if (!room) {
    return (
      <div className="page">
        <p>Загрузка комнаты…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/teacher" className="back-link">
        ← Новая комната
      </Link>
      <div className="card">
        <h1>Комната урока</h1>
        <div className="room-code">
          <span>Код для учеников:</span>
          <strong>{room.code}</strong>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigator.clipboard?.writeText(room.code)}
          >
            Копировать
          </button>
        </div>
        <p>
          Режим: <strong>{room.mode === 'board' ? '🖥️ Доска' : '📱 Телефоны'}</strong>
        </p>

        <ForestVisualizer points={room.classForestPoints} />

        {room.mode === 'board' && (
          <div className="board-help">
            <p>На доске: запустите игру ниже и управляйте с большого экрана. После раунда нажмите «+10 очков классу».</p>
            <button type="button" className="btn-primary" onClick={() => addClassPoints(10)}>
              +10 очков классу 🌲
            </button>
          </div>
        )}

        <h2>Ученики в комнате ({room.students.length})</h2>
        {room.students.length === 0 ? (
          <p>Пока никого — попросите ввести код на «Я ученик».</p>
        ) : (
          <ul className="student-list">
            {room.students.map((s) => (
              <li key={s.id}>
                {AVATAR_EMOJI[s.avatarId]} {s.name} — {s.forestPoints} 🌳
              </li>
            ))}
          </ul>
        )}

        <h2>Игры урока</h2>
        <div className="game-grid">
          {room.games.map((id) => {
            const g = getGameById(id);
            if (!g) return null;
            return (
              <button key={id} type="button" className="game-tile" onClick={() => startGame(id)}>
                <span style={{ fontSize: '2rem' }}>{g.emoji}</span>
                <h3>{g.title}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{g.lesson}</p>
                <span className="badge" style={{ marginTop: 8 }}>
                  Запустить →
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`
        .room-code {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          background: #e8f5e9;
          padding: 1rem;
          border-radius: 12px;
          margin: 1rem 0;
        }
        .room-code strong {
          font-size: 2rem;
          letter-spacing: 0.2em;
          color: #1b5e20;
        }
        .board-help {
          background: #fff3e0;
          padding: 1rem;
          border-radius: 12px;
          margin: 1rem 0;
        }
        .student-list {
          list-style: none;
          padding: 0;
        }
        .student-list li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }
      `}</style>
    </div>
  );
}

const AVATAR_EMOJI = {
  bunny: '🐰',
  bear: '🐻',
  fox: '🦊',
  owl: '🦉',
  frog: '🐸',
  deer: '🦌',
};
