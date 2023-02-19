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
  scene.events.emit('signupBtnClicked');
  }, 500);
}
let recaptcha = ((window as any).grecaptcha as any);
function signup(setTransition, setSigningUp) {
  // Recaptcha test
  setSigningUp(true);
  recaptcha.ready(function() {
    fetch('/api/recaptchaSiteKey').then(res => res.json()).then(data => {
      if(!data.success) attemptSignup(undefined, setSigningUp);
      recaptcha.execute(data.siteKey, {action: 'login'}).then(token => {
        attemptSignup(token, setSigningUp);
      });
    }).catch(err => {
      console.error(err);
      attemptSignup(undefined, setSigningUp);
    });
  });

  function attemptSignup(token=undefined, setSigningUp) {
    const username = document.getElementById("username") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const email = document.getElementById("email") as HTMLInputElement;
    if(!email.value) {
      setSigningUp(false);
      return alert("Please enter an email address.");
    }
    if(!username.value) {
      setSigningUp(false);
      return alert("Please enter a username.");
    }
    if(!password.value) {
      setSigningUp(false);
      return alert("Please enter a password.");
    }
    const game = (window as any).game as Game;
    const scene = game.scene.keys.title as Title;
    fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
        captcha: token
      })
    }).then(res => res.json()).then(data => {
      if(data.success) {
        scene.events.emit('signupSuccess', data);
        console.log("Logged in successfully!");
        setSigningUp(false);
        close(setTransition);
      } else {
        setSigningUp(false);
        alert(data.message);
      }
    }).catch(err => {
      setSigningUp(false);
      console.error(err);
      alert("An error occurred while logging in. Please try again later.");
    });
  }
}

export default function SignupUI(props) {
  // check if localStorage is available
  const [transition, setTransition] = React.useState("animate__backInLeft");
  const [signingUp, setSigningUp] = React.useState(false);

  React.useEffect(() => {
    function handleKeyDown(e) {
      if(e.key === "Enter") {
        signup(setTransition, setSigningUp);
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
    <h1 className={styles.modalTitle}>Sign Up</h1>
    <p className={styles.modalText}>Save your progress and unlock cosmetics!</p>
    <input type="text" style={{marginTop: "5px"}} id="username" placeholder="Username" className={styles.textbox}/>
    <input type="password" id="password" placeholder="Password" className={styles.textbox}/>
    <input type="text" id="email" placeholder="Email" className={styles.textbox}/>
    <button className={styles.playbtn} type="button" onClick={() => close(setTransition)} disabled={signingUp}>{signingUp ? "Signing up..." : "Sign up"}</button>
    </div>
    </div>
  );
}