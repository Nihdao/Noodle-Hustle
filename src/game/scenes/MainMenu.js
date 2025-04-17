import Phaser from "phaser";
import { EventBus } from "../EventBus";

export class MainMenu extends Phaser.Scene {
    constructor() {
        super("MainMenu");
    }

    preload() {
        this.load.image("noodles", "noodles.png");
    }

    create() {
        // Create an orange background
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add orange background
        this.add.rectangle(0, 0, width, height, 0xe67e22).setOrigin(0);

        // Add repeating noodles pattern with diagonal scrolling
        this.noodlesPattern = this.add
            .tileSprite(0, 0, width, height, "noodles")
            .setOrigin(0)
            .setAlpha(0.3); // Add some transparency

        EventBus.emit("current-scene-ready", this);
    }

    update() {
        // Make the pattern scroll diagonally (top-left to bottom-right)
        if (this.noodlesPattern) {
            this.noodlesPattern.tilePositionX += 0.5;
            this.noodlesPattern.tilePositionY += 0.5;
        }
    }

    // Placeholder for scene change logic, can be triggered by React component
    changeScene() {
        console.log("Change scene requested from MainMenu");
    }
}

