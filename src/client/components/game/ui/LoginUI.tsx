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

export default function LoginUI(props) {
  // check if localStorage is available
  const [transition, setTransition] = React.useState("animate__backInLeft");
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
      hello
    </div>
    </div>
  );
}
