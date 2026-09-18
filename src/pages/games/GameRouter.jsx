import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { GameSessionContext } from '../../context/GameSessionContext';
import SortTrash from './SortTrash';
import CleanMeadow from './CleanMeadow';
import PlantTrees from './PlantTrees';
import FixPollution from './FixPollution';
import SaveEnergy from './SaveEnergy';
import CatchTrash from './CatchTrash';
import EcoTransport from './EcoTransport';
import ForestRules from './ForestRules';
import WaterDrop from './WaterDrop';

const MAP = {
  'sort-trash': SortTrash,
  'clean-meadow': CleanMeadow,
  'plant-trees': PlantTrees,
  'fix-pollution': FixPollution,
  'save-energy': SaveEnergy,
  'catch-trash': CatchTrash,
  'eco-transport': EcoTransport,
  'forest-rules': ForestRules,
  'water-drop': WaterDrop,
};

export default function GameRouter({ role }) {
  const { gameId } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const Game = MAP[gameId];

  const context = {
    role,
    solo: search.get('solo') === '1',
    code: search.get('code') || JSON.parse(sessionStorage.getItem('fon-student') || '{}').code,
    mode: search.get('mode') || JSON.parse(sessionStorage.getItem('fon-teacher') || '{}').mode || 'phones',
    onDone: () => {
      if (role === 'teacher') {
        const c = search.get('code') || JSON.parse(sessionStorage.getItem('fon-teacher') || '{}').code;
        navigate(c ? `/teacher/room/${c}` : '/teacher');
      } else if (search.get('solo') === '1') {
        navigate('/solo');
      } else {
        navigate('/student/lobby');
      }
    },
  };

  if (!Game) {
    return (
      <div className="page">
        <p>Игра не найдена</p>
      </div>
    );
  }

  const session = {
    role,
    solo: context.solo,
    code: context.code,
    mode: context.mode,
  };

  return (
    <GameSessionContext.Provider value={session}>
      <Game {...context} />
    </GameSessionContext.Provider>
  );
}
