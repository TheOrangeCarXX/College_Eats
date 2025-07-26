import './App.css'
import Modal from "react-modal";
import Logo from './Logo.jsx';
import Button from './Button.jsx';
import { useState } from 'react';
import './Modal.css';

Modal.setAppElement('#root');
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        alert('Sign up successful!');
        setIsModalOpen(false);
      } else {
        alert(`Error: ${data.error}`);
      }
    } 
    
    catch (error) {
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
      <Button onClick= {() => setIsModalOpen(true)}>Sign In</Button>
      <Button> Login In</Button>
      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} className="modal-content" overlayClassName="modal-overlay">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required placeholder='Enter Email' onChange={e => setEmail(e.target.value)}/>
          <label htmlFor="username">Username</label>
          <input type="username" id="username" name="username" required placeholder='Enter Username' onChange={e => setUsername(e.target.value)}/>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required placeholder="Enter Password" onChange={e => setPassword(e.target.value)}/>
          <Button type="submit">Submit</Button>
        </form>
        <Button onClick={() => setIsModalOpen(false)}>Close</Button>
      </Modal>
      <footer>
        <p>© 2023 College Eats</p>
        <p>All rights reserved</p>
      </footer>
    </>
  )
}

export default App
