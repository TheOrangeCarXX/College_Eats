import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button.jsx';

function Dashboard() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to College Eats! 🍔</h1>
      <p>You have successfully logged in.</p>
      <Button onClick = {() => navigate("/")}>Back</Button>
    </div>
  );
}

export default Dashboard;