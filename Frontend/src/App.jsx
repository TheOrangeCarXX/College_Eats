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
  const [password, setPassword] = useState();
  function handleSubmit(event) {
    event.preventDefault();

  }
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
