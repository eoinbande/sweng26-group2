import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateGoal from './pages/CreateGoal';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
                <Route path="/create-goal" element={<CreateGoal />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
