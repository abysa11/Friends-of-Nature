import { useState } from 'react';
import GameShell from '../../components/GameShell';
import { useAwardPoints } from '../../hooks/useAwardPoints';

const STEPS = [
  {
    scene: 'Речка стала мутной и пахнет плохо. Что могло случиться?',
    options: [
      { text: 'Кто-то вылил мусор и моющее средство', correct: true },
      { text: 'Рыбы слишком много плавали', correct: false },
      { text: 'Дождь всегда портит воду', correct: false },
    ],
  },
  {
    scene: 'Что нужно сделать, чтобы помочь речке?',
    options: [
      { text: 'Собрать мусор на берегу и не сливать химию', correct: true },
      { text: 'Налить больше пены', correct: false },
      { text: 'Ничего — само пройдёт', correct: false },
    ],
  },
  {
    scene: 'Как предотвратить загрязнение в будущем?',
    options: [
      { text: 'Сдавать отходы и беречь воду', correct: true },
      { text: 'Строить дом прямо в русле реки', correct: false },
      { text: 'Жечь пластик у воды', correct: false },
    ],
  },
];

export default function FixPollution({ onDone, solo, code, mode }) {
  const award = useAwardPoints('fix-pollution', solo ? null : code, solo ? 'board' : mode);
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [finished, setFinished] = useState(false);
  const [readyToFinish, setReadyToFinish] = useState(false);

  const score = Math.round((correct / STEPS.length) * 50);

  const choose = (opt) => {
    if (feedback) return;
    if (opt.correct) {
      setCorrect((c) => c + 1);
      setFeedback('Верно! 👏');
    } else {
      setFeedback('Подумай ещё — природа страдает от мусора и химии.');
    }
    setTimeout(() => {
      setFeedback('');
      if (step < STEPS.length - 1) {
        setStep((s) => s + 1);
      } else {
        setReadyToFinish(true);
      }
    }, 1500);
  };

  const complete = async () => {
    if (!finished) {
      await award(score);
      setFinished(true);
    }
    onDone();
  };

  const current = STEPS[step];
  const done = step === STEPS.length - 1 && feedback === '' && correct >= step;

  return (
    <GameShell
      gameId="fix-pollution"
      score={score}
      hint="Помоги детективу природы: выбери правильные ответы."
      onComplete={readyToFinish ? complete : undefined}
    >
      <div className="river-scene">🏞️ 💧🐟</div>
      <p className="pollution-q">{current.scene}</p>
      <div className="pollution-opts">
        {current.options.map((o) => (
          <button key={o.text} type="button" className="btn-secondary pollution-btn" onClick={() => choose(o)}>
            {o.text}
          </button>
        ))}
      </div>
      {feedback && <p className="pollution-fb">{feedback}</p>}
      <p>
        Шаг {step + 1} из {STEPS.length} · Верных: {correct}
      </p>
      <style>{`
        .river-scene {
          font-size: 3rem;
          text-align: center;
          margin-bottom: 1rem;
        }
        .pollution-q {
          font-weight: 700;
          font-size: 1.1rem;
        }
        .pollution-opts {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .pollution-btn {
          width: 100%;
          text-align: left;
        }
        .pollution-fb {
          font-weight: 800;
          color: var(--accent-hover);
          text-align: center;
        }
      `}</style>
    </GameShell>
  );
}
