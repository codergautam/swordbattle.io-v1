import Phaser from 'phaser';
import React from 'react';
import Preload from './scenes/Preload';
import MainGame from './scenes/MainGame';
import Title from './scenes/Title';
import TitleUI from './ui/TitleUI';
import '../../css/index.css';
import ErrorModal from './ui/ErrorModal';

export default class Game extends React.Component {
  game: Phaser.Game;
  state: {
    crashMessage: null | string;activeScene: string, gameState: null | string
};

  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.state = {
      activeScene: '',
      crashMessage: null,
      gameState: null,
    };
  }

  componentDidMount() {
    // Create a simple configuation for the Phaser game
    const config = {
      type: Phaser.AUTO,
      parent: 'swordbattle',
      scene: [Preload, Title, MainGame],
      dom: {
        createContainer: true,
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      width: 1280,
      height: 720,
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
    this.game = new Phaser.Game(config);
    (window as any).game = this.game;

    // Scene change handler
    // This is to handle the change of scenes and set state accordingly
    // We loop through the scenes once the game is ready
    // And create handlers when the scene is started
    this.game.events.once(Phaser.Core.Events.READY, () => {
      this.game.scene.scenes.forEach((scene: Phaser.Scene) => {
        scene.events.on(Phaser.Scenes.Events.START, () => {
          this.setState({ activeScene: scene.sys.settings.key });
        });
        if (scene.sys.settings.key == 'maingame') {
          scene.events.on('gameStateChange', (gameState: any) => {
            this.setState({ gameState });
          });
        }
        scene.events.on('crash', (message: string) => {
          this.setState(Object.assign(this.state, { crashMessage: message }));
        });
      });
    });
  }

  render() {
    return (
      <div style={{
        position: 'fixed', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1, width: '100%', height: '100%',
      }}
      >
        {this.state.activeScene === 'title' ? <TitleUI /> : null}
        {this.state.crashMessage ? <ErrorModal message={this.state.crashMessage} /> : null}
      </div>
    );
  }
}
