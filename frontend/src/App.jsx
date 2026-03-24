import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { GoalsProvider } from './contexts/GoalsContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import Home from './pages/Home';
import Goals from './pages/Goals';
import CreateGoal from './pages/CreateGoal';
import GoalAddDate from './pages/GoalAddDate';
import ReviewPlan from './pages/ReviewPlan';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import GoalDetail from './pages/GoalDetail';
import Feedback from './pages/Feedback';
import ScheduledTasks from './pages/ScheduledTasks';
import Profile from './pages/Profile';
import GreenPage from './pages/GreenPage'
import './index.css';

function App() {
  return (
    <Router>
      <UserProvider>
      <GoalsProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/goal/:id" element={<GoalDetail />} /> {/* Add dynamic route */}
        <Route path="/create-goal" element={<CreateGoal />} />
        <Route path="/goal-add-date" element={<GoalAddDate />} />
        <Route path="/review-plan" element={<ReviewPlan />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/schedule" element={<ScheduledTasks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/greenpage" element={<GreenPage />} />
      </Routes>
      </GoalsProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
