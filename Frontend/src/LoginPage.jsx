import './App.css'
import Modal from "react-modal";
import Logo from './Logo.jsx';
import Button from './Button.jsx';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Modal.css';

Modal.setAppElement('#root');
function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const [email, setEmail] = useState();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowVerification(true);
      } else {
        alert(`Error: ${data.error}`);
      }
    }
    
    catch (error) {
      console.error('Signup step 1 failed:', error);
      alert('Failed to connect to the server.');
    }
  };

    /**
   * Step 2 of Signup: Send the verification code to finalize account creation.
   */
  const handleVerifySubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, code: verificationCode }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Sign up successful! You can now log in.');
        // Reset and close the modal
        setIsSignupOpen(false);
        setShowVerification(false);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Failed to connect to the server.');
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Login successful!');
        login(data.user); 
        navigate('/dashboard');
        setIsLoginOpen(false);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to send data to the server:', error);
      alert('Failed to connect to the server.');
    }
  };
  return (
    <>
      <Logo/>
      <h3>College Eats</h3>
      <p className="slogan">
        Together Tastes Better
      </p>
      <h1>Order Food Together, Save Together</h1>
      <Button onClick= {() => setIsSignupOpen(true)}>Sign In</Button>
      <Button onClick= {() => setIsLoginOpen(true)}> Login In</Button>
      <Modal isOpen={isSignupOpen} onRequestClose={() => {setIsSignupOpen(false); setShowVerification(false);}} className="modal-content" overlayClassName="modal-overlay">
        <h2>Sign In</h2>
        {!showVerification ? (
          <form onSubmit={handleSubmit}>
            <label htmlFor="signup-email">College Email</label>
            <input type="email" id="signup-email" required placeholder='Enter @iiitb.ac.in email' onChange={e => setEmail(e.target.value)}/>
            <label htmlFor="signup-username">Username</label>
            <input type="text" id="signup-username" required placeholder='Enter Username' onChange={e => setUsername(e.target.value)}/>
            <label htmlFor="signup-password">Password</label>
            <input type="password" id="signup-password" required placeholder="Enter Password" onChange={e => setPassword(e.target.value)}/>
            <Button type="submit">Get Verification Code</Button>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit}>
            <p>A verification code has been sent to {email}.</p>
            <label htmlFor="verify-code">Verification Code</label>
            <input type="text" id="verify-code" required placeholder='Enter 6-digit code' onChange={e => setVerificationCode(e.target.value)}/>
            <Button type="submit">Verify and Sign Up</Button>
          </form>
        )}
        <Button onClick={() => {
            setIsSignupOpen(false);
            setShowVerification(false);
        }}>Close</Button>
      </Modal>
      <Modal isOpen={isLoginOpen} onRequestClose={() => setIsLoginOpen(false)} className="modal-content" overlayClassName="modal-overlay">
        <h2>Login In</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="username">Username</label>
          <input type="username" id="username" name="username" required placeholder='Enter Username' onChange={e => setUsername(e.target.value)}/>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required placeholder="Enter Password" onChange={e => setPassword(e.target.value)}/>
          <Button type="submit">Submit</Button>
        </form>
        <Button onClick={() => setIsLoginOpen(false)}>Close</Button>
      </Modal>
      <footer>
        <p>© 2023 College Eats</p>
        <p>All rights reserved</p>
      </footer>
    </>
  )
}

export default LoginPage;
