/* eslint-disable max-len */
import { Game } from 'phaser';
import React from 'react';
import styles from '../../../css/ui.module.css';
import Title from '../scenes/Title';

function playButtonClick(name: string) {
  const game = (window as any).game as Game;
  const scene = game.scene.keys.title as Title;
  scene.events.emit('playButtonClicked', name);
}

export default function TitleUI() {
  // check if localStorage is available
  let available = true;
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    available = false;
  }
  const [name, setName] = React.useState(available ? (window.localStorage.getItem('name') || '') : '');
  return (
    <div className={styles.homebackground}>
      <h1 className={styles.titletext}>Swordbattle.io</h1>
      <input type="text" maxLength={12} value={name} className={styles.namebox} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <button className={styles.playbtn} type="button" onClick={() => playButtonClick(name)}>Play</button>
    </div>
  );
}
