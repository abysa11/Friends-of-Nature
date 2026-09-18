import { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import GameShell from '../../components/GameShell';
import { useAwardPoints } from '../../hooks/useAwardPoints';

const ITEMS = [
  { id: 'bottle', emoji: '🍾', label: 'Пластик', bin: 'plastic' },
  { id: 'paper', emoji: '📰', label: 'Бумага', bin: 'paper' },
  { id: 'jar', emoji: '🫙', label: 'Стекло', bin: 'glass' },
  { id: 'apple', emoji: '🍎', label: 'Органика', bin: 'organic' },
  { id: 'bag', emoji: '🛍️', label: 'Пластик', bin: 'plastic' },
  { id: 'box', emoji: '📦', label: 'Бумага', bin: 'paper' },
];

const BINS = [
  { id: 'plastic', title: 'Пластик', color: '#ffca28', emoji: '♻️' },
  { id: 'paper', title: 'Бумага', color: '#42a5f5', emoji: '📄' },
  { id: 'glass', title: 'Стекло', color: '#66bb6a', emoji: '🫙' },
  { id: 'organic', title: 'Органика', color: '#8d6e63', emoji: '🍂' },
];

function DraggableItem({ id, emoji, done }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, disabled: done });
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, touchAction: 'none' }
    : { touchAction: 'none' };
  if (done) return null;
  return (
    <button type="button" ref={setNodeRef} className="trash-item" style={style} {...listeners} {...attributes}>
      {emoji}
    </button>
  );
}

function Bin({ id, title, color, emoji }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`bin ${isOver ? 'bin--over' : ''}`} style={{ borderColor: color }}>
      <span>{emoji}</span>
      <strong>{title}</strong>
    </div>
  );
}

export default function SortTrash({ onDone, solo, code, mode }) {
  const award = useAwardPoints('sort-trash', solo ? null : code, solo ? 'board' : mode);
  const [placed, setPlaced] = useState({});
  const [finished, setFinished] = useState(false);

  const correctCount = Object.values(placed).filter(Boolean).length;
  const score = Math.round((correctCount / ITEMS.length) * 50);

  const handleDragEnd = (event) => {
    const itemId = event.active.id;
    const binId = event.over?.id;
    if (!binId) return;
    const item = ITEMS.find((i) => i.id === itemId);
    const ok = item?.bin === binId;
    setPlaced((p) => ({ ...p, [itemId]: ok }));
  };

  const complete = async () => {
    if (!finished) {
      await award(score);
      setFinished(true);
    }
    onDone();
  };

  const allDone = ITEMS.every((i) => placed[i.id] === true);
  const wrong = Object.entries(placed).filter(([, v]) => v === false).length;

  return (
    <GameShell
      gameId="sort-trash"
      score={score}
      maxScore={50}
      hint="Перетащи каждый предмет в нужную мусорку. Пластик — в жёлтую, бумага — в синюю!"
      onComplete={allDone ? complete : undefined}
    >
      <DndContext onDragEnd={handleDragEnd}>
        <div className="sort-area">
          <div className="sort-items">
            {ITEMS.map((i) => (
              <DraggableItem key={i.id} id={i.id} emoji={i.emoji} done={placed[i.id] === true} />
            ))}
          </div>
          {wrong > 0 && <p className="sort-msg">Попробуй ещё раз с тем, что осталось! Ошибок: {wrong}</p>}
          <div className="sort-bins">
            {BINS.map((b) => (
              <Bin key={b.id} {...b} />
            ))}
          </div>
        </div>
      </DndContext>
      <style>{`
        .sort-area {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .sort-items {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          min-height: 4rem;
        }
        .trash-item {
          font-size: 2.5rem;
          background: white;
          border: 3px dashed var(--grass);
          border-radius: 16px;
          padding: 0.5rem 1rem;
          cursor: grab;
        }
        .sort-bins {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .bin {
          border: 4px solid;
          border-radius: 16px;
          padding: 1rem;
          text-align: center;
          background: #fafafa;
          min-height: 90px;
        }
        .bin--over {
          background: #e8f5e9;
          transform: scale(1.02);
        }
        .bin span {
          font-size: 2rem;
          display: block;
        }
        .sort-msg {
          text-align: center;
          color: #e65100;
          font-weight: 700;
        }
      `}</style>
    </GameShell>
  );
}
