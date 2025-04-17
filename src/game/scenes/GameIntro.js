import Phaser from "phaser";
import { EventBus } from "../EventBus";

export class GameIntro extends Phaser.Scene {
    constructor() {
        super("GameIntro");
    }

    preload() {
        // Load only background assets
        this.load.image("noodles", "noodles.png");
        // We don't need to load intro images here as they'll be handled by React
    }

    create() {
        // Get dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add orange background (same as MainMenu for consistency)
        this.add.rectangle(0, 0, width, height, 0xe67e22).setOrigin(0);

        // Add repeating noodles pattern with diagonal scrolling (same as MainMenu)
        this.noodlesPattern = this.add
            .tileSprite(0, 0, width, height, "noodles")
            .setOrigin(0)
            .setAlpha(0.3); // Add some transparency

        // Register this scene with the event bus for React components to access
        console.log("GameIntro: Registering scene with EventBus");
        EventBus.registerScene(this);
    }

    update() {
        // Make the pattern scroll diagonally (top-left to bottom-right)
        if (this.noodlesPattern) {
            this.noodlesPattern.tilePositionX += 0.5;
            this.noodlesPattern.tilePositionY += 0.5;
        }
    }

    onResize() {}

    // Method to proceed to the HubScreen
    goToHubScreen() {
        console.log("GameIntro: Transitioning to HubScreen");
        this.scene.start("HubScreen");
    }
}

