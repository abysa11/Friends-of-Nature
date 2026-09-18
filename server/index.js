import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const rooms = new Map();

function generateCode() {
  let code;
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (rooms.has(code));
  return code;
}

function getRoom(code) {
  return rooms.get(code?.toUpperCase?.() || code);
}

io.on('connection', (socket) => {
  socket.on('teacher:createRoom', ({ games, mode, teacherName }, cb) => {
    const code = generateCode();
    const room = {
      code,
      teacherName: teacherName || 'Учитель',
      games: games || [],
      mode: mode || 'phones',
      students: new Map(),
      classForestPoints: 0,
      currentGame: null,
      teacherSocketId: socket.id,
    };
    rooms.set(code, room);
    socket.join(code);
    socket.data.role = 'teacher';
    socket.data.roomCode = code;
    cb?.({ ok: true, code });
  });

  socket.on('teacher:updateRoom', ({ code, games, mode, currentGame }, cb) => {
    const room = getRoom(code);
    if (!room || room.teacherSocketId !== socket.id) {
      cb?.({ ok: false, error: 'Нет доступа' });
      return;
    }
    if (games) room.games = games;
    if (mode) room.mode = mode;
    if (currentGame !== undefined) room.currentGame = currentGame;
    io.to(code).emit('room:updated', serializeRoom(room));
    cb?.({ ok: true });
  });

  socket.on('teacher:startGame', ({ code, gameId }, cb) => {
    const room = getRoom(code);
    if (!room || room.teacherSocketId !== socket.id) {
      cb?.({ ok: false });
      return;
    }
    room.currentGame = gameId;
    io.to(code).emit('game:started', { gameId });
    io.to(code).emit('room:updated', serializeRoom(room));
    cb?.({ ok: true });
  });

  socket.on('teacher:addClassPoints', ({ code, points }, cb) => {
    const room = getRoom(code);
    if (!room || room.teacherSocketId !== socket.id) {
      cb?.({ ok: false });
      return;
    }
    room.classForestPoints += points;
    io.to(code).emit('room:updated', serializeRoom(room));
    cb?.({ ok: true, classForestPoints: room.classForestPoints });
  });

  socket.on('student:join', ({ code, name, avatarId }, cb) => {
    const room = getRoom(code);
    if (!room) {
      cb?.({ ok: false, error: 'Комната не найдена. Проверь код!' });
      return;
    }
    const student = {
      id: socket.id,
      name: name?.trim() || 'Ученик',
      avatarId: avatarId || 'bunny',
      forestPoints: 0,
    };
    room.students.set(socket.id, student);
    socket.join(code);
    socket.data.role = 'student';
    socket.data.roomCode = code;
    io.to(room.teacherSocketId).emit('room:updated', serializeRoom(room));
    cb?.({ ok: true, room: serializeRoom(room), student });
  });

  socket.on('student:points', ({ points, gameId }, cb) => {
    const code = socket.data.roomCode;
    const room = getRoom(code);
    if (!room || socket.data.role !== 'student') {
      cb?.({ ok: false });
      return;
    }
    const student = room.students.get(socket.id);
    if (!student) {
      cb?.({ ok: false });
      return;
    }
    student.forestPoints += points;
    room.classForestPoints += points;
    io.to(code).emit('room:updated', serializeRoom(room));
    io.to(socket.id).emit('student:forest', { forestPoints: student.forestPoints });
    cb?.({ ok: true, forestPoints: student.forestPoints });
  });

  socket.on('teacher:getRoom', ({ code }, cb) => {
    const room = getRoom(code);
    if (!room) {
      cb?.({ ok: false });
      return;
    }
    socket.join(code);
    socket.data.roomCode = code;
    if (room.teacherSocketId === socket.id || !room.teacherSocketId) {
      room.teacherSocketId = socket.id;
      socket.data.role = 'teacher';
    }
    cb?.({ ok: true, room: serializeRoom(room) });
  });

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    const room = getRoom(code);
    if (!room) return;
    if (socket.data.role === 'student') {
      room.students.delete(socket.id);
      io.to(code).emit('room:updated', serializeRoom(room));
    }
    if (socket.data.role === 'teacher' && room.teacherSocketId === socket.id) {
      room.teacherSocketId = null;
    }
  });
});

function serializeRoom(room) {
  return {
    code: room.code,
    teacherName: room.teacherName,
    games: room.games,
    mode: room.mode,
    classForestPoints: room.classForestPoints,
    currentGame: room.currentGame,
    students: Array.from(room.students.values()).map((s) => ({
      id: s.id,
      name: s.name,
      avatarId: s.avatarId,
      forestPoints: s.forestPoints,
    })),
  };
}

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Friends of Nature server on http://localhost:${PORT}`);
});
