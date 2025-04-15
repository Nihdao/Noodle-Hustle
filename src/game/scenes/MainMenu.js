import Phaser from "phaser";
import { EventBus } from "../EventBus";

export class MainMenu extends Phaser.Scene {
    constructor() {
        super("MainMenu");
    }

    preload() {
        // TODO: Load background image, logo, and button assets based on 2-HomePage.mdc
        // Example placeholders:
        this.load.setPath("assets");
        this.load.image("background", "bg.png");
        // this.load.image('logo', 'assets/logo.png');
    }

    create() {
        // TODO: Display background image and logo based on 2-HomePage.mdc
        // Example placeholders:
        this.add
            .image(
                this.cameras.main.centerX,
                this.cameras.main.centerY * 0.8, // Dezooming the image by adjusting the Y position
                "background"
            )
            .setScale(0.9); // Optionally scale down the image for a zoom-out effect
        // this.add.image(this.cameras.main.centerX, this.cameras.main.centerY / 2, 'logo');

        EventBus.emit("current-scene-ready", this);
    }

    // Placeholder for scene change logic, can be triggered by React component
    changeScene() {
        // Example: Transition to the main game hub scene
        // this.scene.start('HubScreen');
        console.log("Change scene requested from MainMenu");
    }
}

