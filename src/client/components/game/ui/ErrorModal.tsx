import { Game } from "phaser";
import React from "react";
import styles from "../../../css/ui.module.css";
import Title from "../scenes/Title";

function ok() {
  // go to title screen
  const game = (window as any).game as Game;
  console.log("Dgfdg")
  const currentScene = game.scene.getScenes(true)[0];

  currentScene.scene.start("title");
  currentScene.events.emit("crash", null);
  
}

export default function ErrorModal(props: {message: string} ) {
return (
  <div className={styles.errorbackground}>
    <h1 className={styles.titletext}>Error</h1>
    <p className={styles.namebox} > {props.message} </p>
    <button className={styles.errorbtn} onClick={()=>ok()}>Ok</button>
  </div>
)
}