import Phaser from 'phaser';
import React from 'react';
import Preload from './scenes/Preload';
import MainMap from './scenes/mainMap';
import Title from './scenes/Title';
import TitleUI from './ui/TitleUI';
import '../../css/index.css'
import MyScene from './helpers/MyScene';

export default class Game extends React.Component {
  game: Phaser.Game;
  state: {activeScene: string};

  constructor(props) {
    super(props);
    this.state = {
      activeScene: '',
    };
  }

  componentDidMount() {
    // Create a simple configuation for the Phaser game
    const config = {
      type: Phaser.AUTO,
      parent: 'swordbattle',
      scene: [Preload, Title, MainMap],
      dom: {
        createContainer: true,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scale: {
        mode:Phaser.Scale.RESIZE,
    },
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
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

    // resize handler, this is called when the window is resized. 
    // sends a resize event to the active scene
    // the timeout is to prevent the resize event from being sent too often
    var timeout: string | number | NodeJS.Timeout | undefined;

    this.game.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      clearTimeout(timeout);
      timeout = setTimeout(()=>{resize(gameSize)}, 100);
    });

    const resize = (gameSize: Phaser.Structs.Size) => {
      this.game.scene.getScenes(true).forEach((scene: Phaser.Scene) => {
        (scene as MyScene).resize(gameSize);
      });
    };


    // Scene change handler
    // This is to handle the change of scenes and set state accordingly
    // We loop through the scenes once the game is ready
    // And create handlers when the scene is started
    this.game.events.once(Phaser.Core.Events.READY, () => {
      this.game.scene.scenes.forEach((scene: Phaser.Scene) => {
        scene.events.on(Phaser.Scenes.Events.START, () => {
          this.setState({activeScene: scene.sys.settings.key});
        });
      });
    });
    

  }

  render() {
    return <div style={{position:"fixed",display:"flex",justifyContent:"center",alignItems:"center",zIndex:1,width:"100%",height:"100%"}}>
      {this.state.activeScene === 'title' ? <TitleUI /> : null}
    </div>;
  }
}
