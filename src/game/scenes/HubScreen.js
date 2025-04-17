import Phaser from "phaser";
import { EventBus } from "../EventBus";

export class HubScreen extends Phaser.Scene {
    constructor() {
        super("HubScreen");
    }

    preload() {
        // Load hub assets
        this.load.image("hub-background", "assets/hub/background.png");
    }

    create() {
        // Get dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add background (placeholder until actual assets are available)
        this.add.rectangle(0, 0, width, height, 0x87ceeb).setOrigin(0); // Light blue background

        // Add placeholder for hub background image if it exists
        if (this.textures.exists("hub-background")) {
            this.add
                .image(width / 2, height / 2, "hub-background")
                .setDisplaySize(width, height)
                .setAlpha(0.5);
        } else {
            console.warn("HubScreen: hub-background image not found");
        }

        // Add text to indicate this is the hub
        this.add
            .text(width / 2, height / 2, "Hub Screen", {
                font: "32px Arial",
                fill: "#ffffff",
            })
            .setOrigin(0.5);

        // Get player name from localStorage
        const playerName = localStorage.getItem("playerName") || "Player";

        // Add welcome text
        this.add
            .text(width / 2, height / 2 + 50, `Welcome, ${playerName}!`, {
                font: "24px Arial",
                fill: "#ffffff",
            })
            .setOrigin(0.5);

        // Register this scene with the event bus for React components to access
        console.log("HubScreen: Registering scene with EventBus");
        EventBus.registerScene(this);
    }

    update() {
        // Hub scene update logic goes here
    }
}

