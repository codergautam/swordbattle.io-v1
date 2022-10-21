import Phaser from 'phaser';
import React from 'react';
import Preload from './scenes/Preload';
import MainMap from './scenes/mainMap';
import Title from './scenes/Title';

export default class Game extends React.Component {
  componentDidMount() {
    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-example',
      width: window.innerWidth,
      height: window.innerHeight,
      scene: [Preload, Title],
      scale: {
        mode: Phaser.Scale.RESIZE,
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
      audio: {
        disableWebAudio: false,
      },
    };
    // eslint-disable-next-line no-new
    new Phaser.Game(config);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div id="phaser-game" />;
  }
}
