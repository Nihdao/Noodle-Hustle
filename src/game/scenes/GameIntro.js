import Phaser from "phaser";
import { EventBus } from "../EventBus";
import { audioManager } from "../AudioManager";

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
        // this.add.rectangle(0, 0, width, height, 0xe67e22).setOrigin(0);

        // Add repeating noodles pattern with diagonal scrolling (same as MainMenu)
        this.noodlesPattern = this.add
            .tileSprite(0, 0, width, height, "noodles")
            .setOrigin(0)
            .setAlpha(0.05); // Add some transparency

        // Register this scene with the event bus for React components to access
        console.log("GameIntro: Registering scene with EventBus");
        EventBus.registerScene(this);

        // Initialize audio manager and play game intro music
        audioManager.init(this.sound);
        audioManager.playMusic("gameIntro");

        // Listen for audio events from UI
        this.setupAudioEventListeners();
    }

    setupAudioEventListeners() {
        // Listen for UI sound event
        EventBus.on("playSound", (key) => {
            audioManager.playSound(key);
        });

        // Listen for mute toggle
        EventBus.on("toggleMute", () => {
            audioManager.toggleMute();
        });
    }

    update() {
        // Make the pattern scroll diagonally (top-left to bottom-right)
        if (this.noodlesPattern) {
            this.noodlesPattern.tilePositionX += 0.2;
            this.noodlesPattern.tilePositionY += 0.2;
        }
    }

    onResize() {}

    // Method to proceed to the HubScreen
    goToHubScreen() {
        console.log("GameIntro: Transitioning to HubScreen");
        // Stop current music before changing scenes
        audioManager.stopMusic();
        this.scene.start("HubScreen");
    }
}

