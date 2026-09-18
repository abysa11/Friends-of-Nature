import { useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useGameSession } from '../context/GameSessionContext';
import { getGameById } from '../data/games';

export function useAwardPoints(gameId, roomCode, mode) {
  const { socket } = useSocket();
  const { role, solo } = useGameSession();

  return useCallback(
    (score) => {
      const game = getGameById(gameId);
      const max = game?.maxPoints ?? 50;
      const points = Math.min(max, Math.max(0, Math.round(score)));

      if (role === 'teacher' && roomCode) {
        return new Promise((resolve) => {
          socket.emit('teacher:addClassPoints', { code: roomCode, points }, (res) => {
            resolve(res?.ok ? points : 0);
          });
        });
      }

      if (solo || !roomCode || mode === 'board') {
        const key = 'fon-solo-forest';
        const prev = Number(localStorage.getItem(key) || 0);
        localStorage.setItem(key, String(prev + points));
        return Promise.resolve(points);
      }

      return new Promise((resolve) => {
        socket.emit('student:points', { points, gameId }, (res) => {
          resolve(res?.ok ? points : 0);
        });
      });
    },
    [socket, gameId, roomCode, mode, role, solo]
  );
}
