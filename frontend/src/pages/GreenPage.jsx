import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

function GreenPage() {
  return (
    <div className="container">
      <h1>Green Page</h1>
      <BottomNav />
    </div>
  )
}

export default GreenPage

