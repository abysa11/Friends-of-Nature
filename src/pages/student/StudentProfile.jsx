import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AVATARS } from '../../data/games';
import { useSocket } from '../../context/SocketContext';

export default function StudentProfile() {
  const { socket, connected } = useSocket();
  const navigate = useNavigate();
  const code = sessionStorage.getItem('fon-pending-code') || '';
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState('bunny');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Напиши своё имя');
      return;
    }
    setLoading(true);
    socket.emit('student:join', { code, name: name.trim(), avatarId }, (res) => {
      setLoading(false);
      if (res?.ok) {
        sessionStorage.setItem(
          'fon-student',
          JSON.stringify({
            code,
            name: name.trim(),
            avatarId,
            forestPoints: res.student?.forestPoints ?? 0,
          })
        );
        navigate('/student/lobby');
      } else {
        setError(res?.error || 'Не удалось войти');
      }
    });
  };

  return (
    <div className="page">
      <Link to="/student" className="back-link">
        ← Код комнаты
      </Link>
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h1>Привет! 👋</h1>
        <p>
          Комната: <strong>{code || '—'}</strong>
        </p>
        {!connected && <p style={{ color: '#c62828' }}>Нет связи с сервером — запустите npm run dev</p>}
        <form onSubmit={submit}>
          <label style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>
            Как тебя зовут?
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Саша"
              maxLength={24}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 8,
                padding: 12,
                borderRadius: 12,
                border: '2px solid #ccc',
                fontSize: '1.1rem',
              }}
            />
          </label>
          <p style={{ fontWeight: 700, marginTop: '1.25rem' }}>Выбери друга-зверя:</p>
          <div className="avatar-grid">
            {AVATARS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`avatar-btn ${avatarId === a.id ? 'selected' : ''}`}
                onClick={() => setAvatarId(a.id)}
              >
                <span>{a.emoji}</span>
                <small>{a.name}</small>
              </button>
            ))}
          </div>
          {error && <p style={{ color: '#c62828', fontWeight: 700 }}>{error}</p>}
          <button type="submit" className="btn-student" style={{ width: '100%', marginTop: '1rem' }} disabled={loading || !connected}>
            {loading ? 'Заходим…' : 'Войти в лес 🌲'}
          </button>
        </form>
      </div>
      <style>{`
        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        .avatar-btn {
          background: var(--cream);
          border: 3px solid transparent;
          border-radius: 16px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-weight: 700;
        }
        .avatar-btn span {
          font-size: 2.25rem;
        }
        .avatar-btn.selected {
          border-color: var(--student);
          background: #e0f2f1;
        }
      `}</style>
    </div>
  );
}
