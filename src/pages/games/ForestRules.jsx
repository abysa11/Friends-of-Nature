import { useState } from 'react';
import GameShell from '../../components/GameShell';
import { useAwardPoints } from '../../hooks/useAwardPoints';

const SCENES = [
  {
    text: 'Ты нашёл красивую птичью гнездо на низкой ветке.',
    good: 'Посмотреть издалека и уйти тихо',
    bad: 'Потрогать яйца и сорвать ветку',
  },
  {
    text: 'Вы пришли в лес перекусить.',
    good: 'Забрать обёртки домой в сумку',
    bad: 'Оставить пакеты под кустом',
  },
  {
    text: 'Хочется развести костёр.',
    good: 'Развести только со взрослыми в специальном месте',
    bad: 'Жечь сухие ветки где попало',
  },
  {
    text: 'Встретил зайца.',
    good: 'Стоять тихо и наблюдать',
    bad: 'Гнаться и кричать',
  },
  {
    text: 'Видишь цветы под охраной — редкие.',
    good: 'Не срывать, сфотографировать',
    bad: 'Сорвать букет',
  },
];

export default function ForestRules({ onDone, solo, code, mode }) {
  const award = useAwardPoints('forest-rules', solo ? null : code, solo ? 'board' : mode);
  const [index, setIndex] = useState(0);
  const [right, setRight] = useState(0);
  const [msg, setMsg] = useState('');
  const [finished, setFinished] = useState(false);
  const [readyToFinish, setReadyToFinish] = useState(false);

  const score = Math.round((right / SCENES.length) * 45);

  const answer = (isGood) => {
    if (msg) return;
    if (isGood) {
      setRight((r) => r + 1);
      setMsg('Молодец! Так друзья леса будут в безопасности 🦊');
    } else {
      setMsg('Так нельзя — это вредит лесу и зверям.');
    }
    setTimeout(() => {
      setMsg('');
      if (index < SCENES.length - 1) setIndex((i) => i + 1);
      else setReadyToFinish(true);
    }, 1400);
  };

  const complete = async () => {
    if (!finished) {
      await award(score);
      setFinished(true);
    }
    onDone();
  };

  const scene = SCENES[index];

  return (
    <GameShell
      gameId="forest-rules"
      score={score}
      hint="Выбери правильное поведение в лесу — как настоящий друг природы!"
      onComplete={readyToFinish ? complete : undefined}
    >
      <div className="forest-path">🌲🛤️🌲</div>
      <p className="forest-scene">{scene.text}</p>
      <div className="forest-btns">
        <button type="button" className="btn-primary" onClick={() => answer(true)}>
          ✅ {scene.good}
        </button>
        <button type="button" className="btn-secondary" onClick={() => answer(false)}>
          ❌ {scene.bad}
        </button>
      </div>
      {msg && <p className="forest-msg">{msg}</p>}
      <p>
        Ситуация {index + 1}/{SCENES.length} · Верно: {right}
      </p>
      <style>{`
        .forest-path {
          text-align: center;
          font-size: 2rem;
        }
        .forest-scene {
          font-weight: 800;
          font-size: 1.1rem;
        }
        .forest-btns {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .forest-btns button {
          width: 100%;
          text-align: left;
          white-space: normal;
        }
        .forest-msg {
          text-align: center;
          font-weight: 800;
          color: var(--accent-hover);
        }
      `}</style>
    </GameShell>
  );
}
