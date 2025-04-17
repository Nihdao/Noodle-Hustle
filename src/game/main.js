import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import Phaser from "phaser";
import { Preloader } from "./scenes/Preloader";
import { GameIntro } from "./scenes/GameIntro";
import { HubScreen } from "./scenes/HubScreen";

// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: "game-container",
    backgroundColor: "#028af8",
    pixelArt: true,
    scene: [Boot, Preloader, MainMenu, GameIntro, HubScreen, Game, GameOver],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centrage automatique du canvas
    },
    fps: {
        target: 60,
        forceSetTimeOut: true, // Améliore la compatibilité sur certains navigateurs mobiles
    },
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;

