import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { getGameById } from '../../data/games';
import ForestVisualizer from '../../components/ForestVisualizer';
import { AVATARS } from '../../data/games';

export default function StudentLobby() {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [profile] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('fon-student') || 'null');
    } catch {
      return null;
    }
  });
  const [room, setRoom] = useState(null);
  const [forestPoints, setForestPoints] = useState(profile?.forestPoints ?? 0);

  useEffect(() => {
    if (!profile?.code) {
      navigate('/student');
      return;
    }
    socket.emit('teacher:getRoom', { code: profile.code }, (res) => {
      if (res?.ok) setRoom(res.room);
    });
    const onUpdate = (r) => {
      if (r.code === profile.code) {
        setRoom(r);
        const me = r.students.find((s) => s.name === profile.name && s.avatarId === profile.avatarId);
        if (me) setForestPoints(me.forestPoints);
      }
    };
    const onForest = ({ forestPoints: fp }) => setForestPoints(fp);
    socket.on('room:updated', onUpdate);
    socket.on('student:forest', onForest);
    socket.on('game:started', ({ gameId }) => {
      navigate(`/student/game/${gameId}`);
    });
    return () => {
      socket.off('room:updated', onUpdate);
      socket.off('student:forest', onForest);
      socket.off('game:started');
    };
  }, [socket, profile, navigate]);

  const avatar = AVATARS.find((a) => a.id === profile?.avatarId);

  if (!profile) return null;

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← На главную
      </Link>
      <div className="card">
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '3rem' }}>{avatar?.emoji}</span>
          <div>
            <h1>Привет, {profile.name}!</h1>
            <p style={{ margin: 0 }}>Комната {profile.code}</p>
          </div>
        </header>
        <ForestVisualizer points={forestPoints} />
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          {room?.currentGame
            ? 'Учитель запускает игру…'
            : 'Жди, когда учитель выберет игру, или выбери сам:'}
        </p>
        <div className="game-grid">
          {(room?.games || []).map((id) => {
            const g = getGameById(id);
            if (!g) return null;
            return (
              <Link
                key={id}
                to={`/student/game/${id}`}
                className="game-tile"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <span style={{ fontSize: '2rem' }}>{g.emoji}</span>
                <h3>{g.title}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{g.short}</p>
              </Link>
            );
          })}
        </div>
        {!room && <p>Загрузка списка игр…</p>}
      </div>
    </div>
  );
}
