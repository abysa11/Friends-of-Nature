import { useState } from 'react';
import GameShell from '../../components/GameShell';
import { useAwardPoints } from '../../hooks/useAwardPoints';

const DEVICES = [
  { id: 'light', emoji: '💡', label: 'Свет в комнате', onEmoji: '💡', offEmoji: '🌙' },
  { id: 'tap', emoji: '🚰', label: 'Кран на кухне', onEmoji: '💧💧', offEmoji: '🚰✅' },
  { id: 'tv', emoji: '📺', label: 'Телевизор', onEmoji: '📺', offEmoji: '⬛' },
  { id: 'pc', emoji: '💻', label: 'Компьютер', onEmoji: '💻', offEmoji: '😴' },
];

export default function SaveEnergy({ onDone, solo, code, mode }) {
  const award = useAwardPoints('save-energy', solo ? null : code, solo ? 'board' : mode);
  const [state, setState] = useState(() => Object.fromEntries(DEVICES.map((d) => [d.id, true])));
  const [finished, setFinished] = useState(false);

  const offCount = DEVICES.filter((d) => !state[d.id]).length;
  const score = Math.round((offCount / DEVICES.length) * 40);

  const toggle = (id) => {
    setState((s) => ({ ...s, [id]: !s[id] }));
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
      gameId="save-energy"
      score={score}
      hint="Семья ушла гулять! Выключи всё, что жрёт энергию и воду — нажми на приборы."
      onComplete={offCount === DEVICES.length ? complete : undefined}
    >
      <div className="house">
        {DEVICES.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`device ${state[d.id] ? 'device--on' : 'device--off'}`}
            onClick={() => toggle(d.id)}
          >
            <span className="device__icon">{state[d.id] ? d.onEmoji : d.offEmoji}</span>
            <span>{d.label}</span>
            <small>{state[d.id] ? 'Включено — нажми!' : 'Экономим ✅'}</small>
          </button>
        ))}
      </div>
      <style>{`
        .house {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .device {
          padding: 1.25rem;
          border-radius: 16px;
          border: 4px solid #ffc107;
          background: #fff8e1;
          text-align: center;
          font-weight: 700;
        }
        .device--off {
          border-color: var(--accent);
          background: #e8f5e9;
        }
        .device__icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 0.5rem;
        }
        .device small {
          display: block;
          margin-top: 0.35rem;
          opacity: 0.85;
        }
      `}</style>
    </GameShell>
  );
}
