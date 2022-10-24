import Phaser from 'phaser';
import React from 'react';
import Preload from './scenes/Preload';
import MainGame from './scenes/MainGame';
import Title from './scenes/Title';
import TitleUI from './ui/TitleUI';
import '../../css/index.css'

export default class Game extends React.Component {
  game: Phaser.Game;
  state: {activeScene: string, gameState: null | string};

  constructor(props) {
    super(props);
    this.state = {
      activeScene: '',
      gameState: null
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
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scale: {
        mode:Phaser.Scale.FIT,
    },
    width: 1920,
    height: 1080,
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
          this.setState({activeScene: scene.sys.settings.key});
        });
        if(scene.sys.settings.key == 'maingame') {
          scene.events.on('gameStateChange', (gameState) => {
            this.setState({gameState});
          });
        }
      });
    });
    

  }

  render() {
    return <div style={{position:"fixed",display:"flex",justifyContent:"center",alignItems:"center",zIndex:1,width:"100%",height:"100%"}}>
      {this.state.activeScene === 'title' ? <TitleUI/> : null}
    </div>;
  }
}
