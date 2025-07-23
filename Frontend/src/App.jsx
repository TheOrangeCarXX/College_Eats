import { useState } from 'react'
import './App.css'
import Modal from "react-modal";
import logo from "./assets/college_eat.svg";

Modal.setAppElement('#root');
function App() {
  const [signinModalIsOpen, setSigninModalIsOpen] = useState(false);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  return (
    <>
    <img src={logo} alt="College Eats Logo" className="college-eats-logo"/>
      <h3>College Eats</h3>
      <p className="slogan">
        Together Tastes Better
      </p>
      <h1>Order Food Together, Save Together</h1>
      <button className="sign-in-button" onClick={()=>setSigninModalIsOpen(true)}>Get Started</button>
      <button className="login-button" onClick={()=>setLoginModalIsOpen(true)}>Login</button>
    </>
  )
}

export default App
