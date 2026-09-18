import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import TeacherHub from './pages/teacher/TeacherHub';
import TeacherRoom from './pages/teacher/TeacherRoom';
import TeacherLesson from './pages/teacher/TeacherLesson';
import StudentJoin from './pages/student/StudentJoin';
import StudentProfile from './pages/student/StudentProfile';
import StudentLobby from './pages/student/StudentLobby';
import GameRouter from './pages/games/GameRouter';
import SoloPlay from './pages/SoloPlay';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/solo" element={<SoloPlay />} />
      <Route path="/teacher" element={<TeacherHub />} />
      <Route path="/teacher/lesson" element={<TeacherLesson />} />
      <Route path="/teacher/room/:code" element={<TeacherRoom />} />
      <Route path="/student" element={<StudentJoin />} />
      <Route path="/student/profile" element={<StudentProfile />} />
      <Route path="/student/lobby" element={<StudentLobby />} />
      <Route path="/student/game/:gameId" element={<GameRouter role="student" />} />
      <Route path="/teacher/game/:gameId" element={<GameRouter role="teacher" />} />
    </Routes>
  );
}
