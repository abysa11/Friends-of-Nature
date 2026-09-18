import { createContext, useContext } from 'react';

export const GameSessionContext = createContext({
  role: 'student',
  solo: false,
  code: null,
  mode: 'phones',
});

export function useGameSession() {
  return useContext(GameSessionContext);
}
