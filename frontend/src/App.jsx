import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateGoal from './pages/CreateGoal';
import ReviewPlan from './pages/ReviewPlan';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-goal" element={<CreateGoal />} />
        <Route path="/review-plan" element={<ReviewPlan />} />
      </Routes>
    </Router>
  );
}

export default App;
