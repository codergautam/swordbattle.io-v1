/* eslint-disable max-len */
import { Game } from 'phaser';
import React from 'react';
import styles from '../../../css/ui.module.css';
import Title from '../scenes/Title';

function close() {
  const game = (window as any).game as Game;
  const scene = game.scene.keys.title as Title;
  scene.events.emit('settingsBtnClicked');
}

export default function SettingsPage(props) {
  // check if localStorage is available
  let available = true;
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    available = false;
  }
  const defaultSettings = {
    movementMode: "mouse",
    sound: "normal",
    server: "auto"
  }

  let [settings, setSettings] = React.useState(available ? (window.localStorage.getItem('settings') || '') : props.settings ?? '');
  React.useEffect(() => {
  if(settings.length > 0) {
    settings = JSON.parse(settings);
    // Add any missing settings
    for(const key in defaultSettings) {
      if(!settings.hasOwnProperty(key)) {
        settings[key] = defaultSettings[key];
      }
    }
    setSettings(settings);
  } else {
    setSettings(defaultSettings);
  }
  }, []);

  React.useEffect(() => {
    try {
    window.localStorage.setItem('settings', JSON.stringify(settings));
    } catch (e) {
      console.log("Error saving settings to localStorage", e);
    }

    const game = (window as any).game as Game;
    const scene = game.scene.keys.title as Title;
    scene.events.emit('settingsChanged', settings);
  }, [settings]);



  return (
    <div className={styles.settingsbackground}>
      <button className={styles.modalCloseBtn} onClick={()=>close()}>X</button>
      <h1 className={styles.titletext} style={{color: "white", marginBottom: 0, marginTop: "10px"}}>Settings</h1>
      <label htmlFor="movement" style={{color: "white"}}>Movement mode:</label>&nbsp;
  <select name="movement" id="movement" value={settings.movementMode} onChange={(e) => setSettings({...settings, movementMode: e.target.value})}>
    <option value="mouse">Mouse Only</option>
    <option value="keys">Mouse + Keys</option>
  </select>
  <br/>

  <label htmlFor="sound" style={{color: "white"}}>Sound:</label>&nbsp;
  <select name="sound" id="sound" value={settings.sound} onChange={(e) => setSettings({...settings, sound: e.target.value})}>
    <option value="high">High Volume</option>
    <option value="normal">Normal</option>
    <option value="low">Low Volume</option>
    <option value="off">Off</option>
  </select>
  <br/>

  <label htmlFor="sound" style={{color: "white"}}>Server:</label>&nbsp;
  <select name="server" id="server" value={settings.server} onChange={(e) => setSettings({...settings, server: e.target.value})}>
    <option value="auto" id="auto">Auto</option>
    <option value="us1" id="us1">USA</option>
    <option value="us2" id="us2">USA 2</option>
    <option value="eu1" id="eu1">Europe</option>
  </select>
    </div>
  );
}
