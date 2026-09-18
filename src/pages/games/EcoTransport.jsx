import { useState } from 'react';
import GameShell from '../../components/GameShell';
import { useAwardPoints } from '../../hooks/useAwardPoints';

const ROUTES = [
  {
    q: 'До школы рядом — 1 км. Как лучше?',
    choices: [
      { emoji: '🚶', text: 'Пешком', eco: 10 },
      { emoji: '🚗', text: 'Одна машина на одного', eco: 2 },
      { emoji: '🛴', text: 'Самокат', eco: 9 },
    ],
  },
  {
    q: 'Едешь через весь город на экскурсию.',
    choices: [
      { emoji: '🚌', text: 'Автобус — много людей в одной машине', eco: 8 },
      { emoji: '🚙', text: 'Каждый на своей машине', eco: 3 },
      { emoji: '🚲', text: 'Велосипед (если далеко — автобус)', eco: 9 },
    ],
  },
  {
    q: 'Какой транспорт меньше всего вредит воздуху?',
    choices: [
      { emoji: '🚶', text: 'Пешком и велосипед', eco: 10 },
      { emoji: '✈️', text: 'Самолёт на короткое расстояние', eco: 1 },
      { emoji: '🚌', text: 'Электробус или метро', eco: 8 },
    ],
  },
];

export default function EcoTransport({ onDone, solo, code, mode }) {
  const award = useAwardPoints('eco-transport', solo ? null : code, solo ? 'board' : mode);
  const [step, setStep] = useState(0);
  const [points, setPoints] = useState(0);
  const [picked, setPicked] = useState(null);
  const [finished, setFinished] = useState(false);
  const [readyToFinish, setReadyToFinish] = useState(false);

  const score = Math.min(35, Math.round((points / 30) * 35));

  const choose = (c) => {
    if (picked) return;
    setPicked(c);
    setPoints((p) => p + c.eco);
    setTimeout(() => {
      setPicked(null);
      if (step < ROUTES.length - 1) setStep((s) => s + 1);
      else setReadyToFinish(true);
    }, 1200);
  };

  const complete = async () => {
    if (!finished) {
      await award(score);
      setFinished(true);
    }
    onDone();
  };

  const route = ROUTES[step];
  const allDone = step === ROUTES.length - 1 && picked !== null;

  return (
    <GameShell
      gameId="eco-transport"
      score={score}
      hint="Выбирай самый «зелёный» способ — меньше дыма в небе!"
      onComplete={readyToFinish ? complete : undefined}
    >
      <p className="eco-q">{route.q}</p>
      <div className="eco-grid">
        {route.choices.map((c) => (
          <button
            key={c.text}
            type="button"
            className={`eco-choice ${picked === c ? 'picked' : ''}`}
            onClick={() => choose(c)}
          >
            <span>{c.emoji}</span>
            {c.text}
          </button>
        ))}
      </div>
      <p>
        Вопрос {step + 1}/{ROUTES.length}
      </p>
      <style>{`
        .eco-q {
          font-weight: 800;
          font-size: 1.15rem;
        }
        .eco-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .eco-choice {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 16px;
          border: 3px solid #ccc;
          background: white;
          font-weight: 700;
          text-align: left;
        }
        .eco-choice span {
          font-size: 2rem;
        }
        .eco-choice.picked {
          border-color: var(--accent);
          background: #e8f5e9;
        }
      `}</style>
    </GameShell>
  );
}
