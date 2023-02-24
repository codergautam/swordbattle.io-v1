/* eslint-disable max-len */
import { Game } from 'phaser';
import React from 'react';
import styles from '../../../css/ui.module.css';
import Title from '../scenes/Title';
import 'animate.css';

function close(setTransition) {
  const game = (window as any).game as Game;
  const scene = game.scene.keys.title as Title;
  setTransition("animate__backOutRight");
  setTimeout(() => {
  scene.events.emit('loginBtnClicked');
  }, 500);
}
let recaptcha = ((window as any).grecaptcha as any);
function login(setTransition, setLoggingIn) {
  // Recaptcha test
  setLoggingIn(true);
  recaptcha.ready(function() {
    fetch('/api/recaptchaSiteKey').then(res => res.json()).then(data => {
      if(!data.success) attemptLogin(undefined, setLoggingIn);
      recaptcha.execute(data.siteKey, {action: 'login'}).then(token => {
        attemptLogin(token, setLoggingIn);
      });
    }).catch(err => {
      console.error(err);
      attemptLogin(undefined, setLoggingIn);
    });
  });

  function attemptLogin(token=undefined, setLoggingIn) {
    const username = document.getElementById("username") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const game = (window as any).game as Game;
    const scene = game.scene.keys.title as Title;
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: username.value,
        password: password.value,
        captcha: token
      })
    }).then(res => res.json()).then(data => {
      if(data.success) {
        scene.events.emit('loginSuccess', data);
        console.log("Logged in successfully!");
        setLoggingIn(false);
        close(setTransition);
      } else {
        setLoggingIn(false);
        alert(data.message);
      }
    }).catch(err => {
      setLoggingIn(false);
      console.error(err);
      alert("An error occurred while logging in. Please try again later.");
    });
  }
}

export default function LoginUI(props) {
  // check if localStorage is available
  const [transition, setTransition] = React.useState("animate__backInLeft");
  const [loggingIn, setLoggingIn] = React.useState(false);
  // enter key
  React.useEffect(() => {
    function handleKeyDown(e) {
      if(e.key === "Enter") {
        login(setTransition, setLoggingIn);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, []);
  let available = true;
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    available = false;
  }


  return (
    <div className={"animate__animated "+transition}>
    <div className={styles.settingsbackground}>
    <button className={styles.modalCloseBtn} onClick={()=>close(setTransition)}>X</button>
    <h1 className={styles.modalTitle}>Login</h1>
    <p className={styles.modalText}>Welcome back, warrior!</p>
    <input type="text" style={{marginTop: "5px"}} id="username" placeholder="Username / Email" className={styles.textbox}/>
    <input type="password" id="password" placeholder="Password" className={styles.textbox}/>
    <button className={styles.playbtn} type="button" onClick={() => login(setTransition, setLoggingIn)} disabled={loggingIn}>{loggingIn ? "Logging in..." : "Login"}</button>
    </div>
    </div>
  );
}
