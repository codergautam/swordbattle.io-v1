import { Game } from 'phaser';
import React from 'react';
import styles from '../../../css/ui.module.css';
import Title from '../scenes/Title';

function ok() {
  // go to title screen
  const game = (window as any).game as Game;
  const currentScene = game.scene.getScenes(true)[0];

  currentScene.scene.start('title');
  currentScene.events.emit('death', null);
}

export default function DeathBox(props: {killer:string, kills:number, coins:number}) {
  const {killer,kills,coins} = props;
  return (
    <div className={styles.deathbox}>
      <h1 className={styles.titletext}>YOU DIED</h1>
      <p className={styles.namebox}>
        {"Killer: "+kills[1]}
        {<br />}
        {"Kills: "+kills[0]}
        {<br />}
        {"Coins: "+coins}
        
        
      </p>
      <button type="button" className={styles.dedbtn} onClick={() => ok()}>Play again</button>
    </div>
  );
}
