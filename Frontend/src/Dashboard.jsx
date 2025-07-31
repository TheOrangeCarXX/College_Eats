import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Button from './Button.jsx';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  if (!user) {
    return <div>Loading...</div>;
  }
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome, {user.username}! 🍔</h1>
      <p>You have successfully logged in.</p>
      <p>Your registered email is: {user.email}</p>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}

export default Dashboard;