import React from "react";
import styles from "../../../css/title.module.css";

export default function TitleUI() {
return (
  <div className={styles.background}>
    <h1 className={styles.titletext}>Swordbattle.io</h1>
    <input type="text" className={styles.namebox} placeholder="Name" />
    <button className={styles.playbtn}>Play</button>

  </div>
)
}