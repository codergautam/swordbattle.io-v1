import React from 'react';
import styles from '../../../css/ui.module.css';

export default function Footer(props) {
  const { setTransition } = props;
  return (
    <div className={"animate__animated animate__backInUp"}>
    <div className={styles.footer}>
      <h1 className={styles.footerElem}>
        <a href="/leaderboard" target="_blank" className={styles.footerLink}>Leaderboard</a>
      </h1>
      <h1 className={styles.footerElem}>
        <a href="/about" target="_blank" className={styles.footerLink}>About</a>
      </h1>
      <h1 className={styles.footerElem}>
        <a href="https://forum.codergautam.dev" target="_blank" className={styles.footerLink}>Forum</a>
      </h1>
    </div>
    </div>
  )
};