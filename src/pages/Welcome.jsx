import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ForestVisualizer from '../components/ForestVisualizer';

export default function Welcome() {
  return (
    <div className="welcome">
      <div className="welcome__decor welcome__decor--left">🦋</div>
      <div className="welcome__decor welcome__decor--right">🐝</div>
      <motion.div
        className="welcome__hero page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="welcome__tag">Для детского сада и начальной школы</p>
        <h1 className="welcome__title">
          <span>Friends of Nature</span>
          <small>Друзья природы</small>
        </h1>
        <p className="welcome__lead">
          Играй в экологические квесты, зарабатывай очки и выращивай свой волшебный лес! 🌲
        </p>
        <div className="welcome__forest">
          <ForestVisualizer points={42} />
        </div>
        <div className="welcome__choices">
          <Link to="/student" className="welcome__btn welcome__btn--student">
            <span>🎒</span> Я ученик
          </Link>
          <Link to="/teacher" className="welcome__btn welcome__btn--teacher">
            <span>📚</span> Я учитель
          </Link>
        </div>
        <p className="welcome__solo">
          Хочешь попробовать один?{' '}
          <Link to="/solo">Играть без комнаты</Link>
        </p>
      </motion.div>
      <style>{`
        .welcome {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }
        .welcome__decor {
          position: fixed;
          font-size: 2.5rem;
          opacity: 0.6;
          animation: float 4s ease-in-out infinite;
        }
        .welcome__decor--left {
          top: 15%;
          left: 5%;
        }
        .welcome__decor--right {
          top: 25%;
          right: 8%;
          animation-delay: 1s;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        .welcome__tag {
          text-align: center;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.7);
          display: inline-block;
          padding: 0.35rem 1rem;
          border-radius: 999px;
          margin: 0 auto 1rem;
          display: block;
          width: fit-content;
        }
        .welcome__title {
          text-align: center;
          font-size: clamp(2rem, 6vw, 3rem);
          color: #1b5e20;
          text-shadow: 2px 2px 0 rgba(255, 255, 255, 0.5);
        }
        .welcome__title small {
          display: block;
          font-size: 0.45em;
          font-weight: 700;
          opacity: 0.9;
        }
        .welcome__lead {
          text-align: center;
          font-size: 1.15rem;
          max-width: 520px;
          margin: 0 auto 1.5rem;
        }
        .welcome__forest {
          max-width: 360px;
          margin: 0 auto 2rem;
        }
        .welcome__choices {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
        }
        .welcome__btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: white;
          font-weight: 800;
          font-size: 1.2rem;
          padding: 1.1rem 2rem;
          border-radius: 999px;
          min-width: 220px;
          justify-content: center;
          box-shadow: 0 6px 0 rgba(0, 0, 0, 0.15);
        }
        .welcome__btn span {
          font-size: 1.5rem;
        }
        .welcome__btn--student {
          background: linear-gradient(180deg, #4db6ac, #00897b);
        }
        .welcome__btn--teacher {
          background: linear-gradient(180deg, #7986cb, #3949ab);
        }
        .welcome__btn:hover {
          filter: brightness(1.06);
          transform: translateY(-2px);
        }
        .welcome__solo {
          text-align: center;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}
