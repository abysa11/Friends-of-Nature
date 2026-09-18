import { Link } from 'react-router-dom';

const STEPS = [
  {
    title: '1. Поговорите о природе',
    text: 'Спросите детей: «Что для вас значит чистая природа?» Покажите картинки леса, реки, поля.',
  },
  {
    title: '2. Объясните «Лес очков»',
    text: 'За каждую игру класс (или каждый ученик) получает очки. Очки «посадят» деревья в общий или личный лес.',
  },
  {
    title: '3. Правила игр',
    text: 'Можно играть на интерактивной доске всем классом или на телефонах/планшетах с кодом комнаты.',
  },
  {
    title: '4. После игры',
    text: 'Обсудите 1–2 вопроса: что запомнили? что будут делать дома? (сортировать мусор, экономить воду)',
  },
];

const TOPICS = [
  '♻️ Сортировка отходов',
  '🧹 Уборка мусора в парке',
  '🌱 Посадка деревьев',
  '💧 Чистая вода',
  '💡 Экономия энергии',
  '🚲 Экологичный транспорт',
  '🦊 Безопасность в лесу',
];

export default function TeacherLesson() {
  return (
    <div className="page">
      <Link to="/teacher" className="back-link">
        ← К панели учителя
      </Link>
      <div className="card">
        <h1>📖 Как провести урок</h1>
        <p>Рекомендуем 30–45 минут: введение → 2–3 игры → обсуждение.</p>
        <ul className="lesson-list">
          {STEPS.map((s) => (
            <li key={s.title}>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </li>
          ))}
        </ul>
        <h2>Темы игр</h2>
        <div className="lesson-tags">
          {TOPICS.map((t) => (
            <span key={t} className="badge">
              {t}
            </span>
          ))}
        </div>
        <h2>Режим «Интерактивная доска»</h2>
        <p>
          Откройте игру на проекторе. Дети поднимают руки и подсказывают ответ. Вы нажимаете за класс —
          очки идут в <strong>общий лес класса</strong>. Кнопка «+ очки классу» есть в панели комнаты.
        </p>
        <h2>Режим «Телефоны учеников»</h2>
        <p>
          Создайте комнату, дайте детям 6-значный код. Каждый вводит имя и аватар — играет сам, очки
          в личный лес и в общий счёт класса.
        </p>
        <Link to="/teacher" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
          Создать комнату →
        </Link>
      </div>
      <style>{`
        .lesson-list {
          padding-left: 1.25rem;
        }
        .lesson-list p {
          margin: 0.25rem 0 1rem;
        }
        .lesson-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
