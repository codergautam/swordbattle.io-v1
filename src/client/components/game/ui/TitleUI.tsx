import { Game } from "phaser";
import React from "react";
import styles from "../../../css/title.module.css";
import Title from "../scenes/Title";

function playButtonClick(name: string) {

  const game = (window as any).game as Game;
  const scene = game.scene.keys.title as Title;
  scene.events.emit("playButtonClicked", name);

}

export default function TitleUI() {
  const [name, setName] = React.useState(window.localStorage.getItem("name") || "");  
return (
  <div className={styles.background}>
    <h1 className={styles.titletext}>Swordbattle.io</h1>
    <input type="text" maxLength={12} value={name} className={styles.namebox} onChange={(e)=>setName(e.target.value)} placeholder="Name" />
    <button className={styles.playbtn} onClick={()=>playButtonClick(name)}>Play</button>
  </div>
)
}