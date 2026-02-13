import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Goals from './pages/Goals';
import CreateGoal from './pages/CreateGoal';
import GoalAddDate from './pages/GoalAddDate';
import ReviewPlan from './pages/ReviewPlan';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import GoalDetail from './pages/GoalDetail';
import Feedback from './pages/Feedback';
import Loading from './components/Loading';
import './index.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/goal/:id" element={<GoalDetail />} /> {/* Add dynamic route */}
        <Route path="/create-goal" element={<CreateGoal />} />
        <Route path="/goal-add-date" element={<GoalAddDate />} />
        <Route path="/review-plan" element={<ReviewPlan />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </Router>
  );
}

export default App;
