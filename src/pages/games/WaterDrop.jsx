import { useState } from 'react';
import GameShell from '../../components/GameShell';
import { useAwardPoints } from '../../hooks/useAwardPoints';

const PATH = [
  { id: 'tap-on', label: 'Кран открыт на полную', lose: 15, ok: false },
  { id: 'brush', label: 'Чистим зубы — кран всё ещё льётся', lose: 20, ok: false },
  { id: 'close', label: 'Закрыли кран!', lose: 0, ok: true },
  { id: 'water', label: 'Капля идёт к цветку', lose: 0, ok: true },
  { id: 'flower', label: 'Цветок напоен 💐', lose: 0, ok: true },
];

export default function WaterDrop({ onDone, solo, code, mode }) {
  const award = useAwardPoints('water-drop', solo ? null : code, solo ? 'board' : mode);
  const [step, setStep] = useState(0);
  const [water, setWater] = useState(100);
  const [finished, setFinished] = useState(false);

  const score = Math.max(0, Math.round((water / 100) * 40));

  const next = (choiceOk, lose) => {
    setWater((w) => Math.max(0, w - lose));
    if (step < PATH.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const complete = async () => {
    if (!finished) {
      await award(score);
      setFinished(true);
    }
    onDone();
  };

  const current = PATH[step];
  const atEnd = step === PATH.length - 1;

  return (
    <GameShell
      gameId="water-drop"
      score={score}
      hint="Помоги капле: закрывай кран вовремя, чтобы не терять воду!"
    >
      <div className="water-bar">
        <div className="water-bar__fill" style={{ width: `${water}%` }} />
        <span>💧 {water}% воды</span>
      </div>
      <p className="water-step">{current.label}</p>
      {!atEnd && (
        <div className="water-actions">
          {step === 0 && (
            <>
              <button type="button" className="btn-secondary" onClick={() => next(false, PATH[0].lose)}>
                Оставить кран открытым
              </button>
              <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                Сразу закрыть кран ✅
              </button>
            </>
          )}
          {step === 1 && (
            <button type="button" className="btn-primary" onClick={() => next(true, 0)}>
              Закрыть кран!
            </button>
          )}
          {step >= 2 && step < PATH.length - 1 && (
            <button type="button" className="btn-primary" onClick={() => next(true, 0)}>
              Дальше →
            </button>
          )}
        </div>
      )}
      {atEnd && (
        <button type="button" className="btn-primary" onClick={complete}>
          Готово — забрать очки в лес 🌲
        </button>
      )}
      <style>{`
        .water-bar {
          position: relative;
          height: 36px;
          background: #e1f5fe;
          border-radius: 999px;
          border: 3px solid #0288d1;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .water-bar__fill {
          height: 100%;
          background: linear-gradient(90deg, #4fc3f7, #0288d1);
        }
        .water-bar span {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }
        .water-step {
          font-weight: 800;
          font-size: 1.15rem;
        }
        .water-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
      `}</style>
    </GameShell>
  );
}
