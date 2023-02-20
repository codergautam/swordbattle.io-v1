/* eslint-disable max-len */
import { Game } from 'phaser';
import React from 'react';
import styles from '../../../css/ui.module.css';
import Title from '../scenes/Title';
import 'animate.css';


function playButtonClick(name: string, props: any) {
  const game = (window as any).game as Game;
  const scene = game.scene.keys.title as Title;
  console.log(props.user);
  scene.events.emit('playButtonClicked', name, props.user?.secret);
}

export default function TitleUI(props: any) {
  // check if localStorage is available
  let available = true;
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    available = false;
  }

  React.useEffect(() => {
    if(props.user?.username) {
      setName(props.user.username);
    }
  }, [props.user]);

  const [name, setName] = React.useState(available ? (window.localStorage.getItem('name') || '') : '');
  return (
    <div className={"animate__animated animate__backInDown"}>
    <div className={styles.homebackground}>
      <h1 className={styles.titletext}>Swordbattle.io</h1>
      <input type="text" maxLength={12} value={props.user?.username ?? name} className={styles.namebox} onChange={(e) => setName(e.target.value)} disabled={props.user?.username} placeholder="Name" />
      <button className={styles.playbtn} type="button" onClick={() => playButtonClick(name, props)}>Play</button>
    </div>
    </div>
  );
}
