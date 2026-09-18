import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function StudentJoin() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const trimmed = code.replace(/\D/g, '').slice(0, 6);
    if (trimmed.length < 6) return;
    sessionStorage.setItem('fon-pending-code', trimmed);
    navigate('/student/profile');
  };

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← На главную
      </Link>
      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1>🎒 Вход ученика</h1>
        <p>Введи код комнаты, который сказал учитель:</p>
        <form onSubmit={submit}>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            style={{
              width: '100%',
              fontSize: '2rem',
              textAlign: 'center',
              letterSpacing: '0.3em',
              padding: '1rem',
              borderRadius: 16,
              border: '3px solid var(--student)',
              marginBottom: '1rem',
            }}
          />
          <button type="submit" className="btn-student" style={{ width: '100%' }} disabled={code.length < 6}>
            Дальше →
          </button>
        </form>
      </div>
    </div>
  );
}
