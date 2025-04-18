import Phaser from "phaser";
import { EventBus } from "../EventBus";

export class HubScreen extends Phaser.Scene {
    constructor() {
        super("HubScreen");

        // Initialize game state
        this.gameState = {
            playerName: "",
            rank: 200,
            funds: 500000,
            burnout: 33,
            period: 1,
            investorClashIn: 3,
            noddleBars: {
                forecastedProfit: 12657,
            },
            employees: {
                laborCost: 8985,
            },
            debts: {
                repayment: 1500,
            },
            personalTime: {
                planned: "Home",
            },
            forecastProfit: 2172,
        };
    }

    preload() {
        // Load hub assets
        this.load.image("fairy", "assets/hub/fairynoddle.png");
        this.load.image("noodles", "noodles.png");
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

        // Get player name from localStorage
        this.gameState.playerName =
            localStorage.getItem("playerName") || "Player";

        // Create the fairy sprite (just for Phaser side visuals in the game area)
        if (this.textures.exists("fairy")) {
            this.fairy = this.add
                .sprite(width * 0.65, height * 0.5, "fairy")
                .setScale(0.2);

            // Simple animation to make the fairy float
            this.tweens.add({
                targets: this.fairy,
                y: this.fairy.y - 20,
                duration: 2000,
                ease: "Sine.easeInOut",
                yoyo: true,
                repeat: -1,
            });
        }

        // Register this scene with the event bus for React components to access
        console.log("HubScreen: Registering scene with EventBus");
        EventBus.registerScene(this);

        // Set up methods for React to call
        this.setupReactInteractions();
    }

    setupReactInteractions() {
        // Method to start a new period
        this.startPeriod = () => {
            console.log("Starting new period in Phaser scene");
            this.gameState.period += 1;
            this.gameState.investorClashIn -= 1;

            if (this.gameState.investorClashIn <= 0) {
                // Handle investor clash event
                console.log("Investor clash triggered!");
                this.gameState.investorClashIn = 3;
            }

            // Update funds
            this.gameState.funds += this.gameState.forecastProfit;

            // Random chance to change burnout
            const burnoutChange = Phaser.Math.Between(-5, 10);
            this.gameState.burnout = Phaser.Math.Clamp(
                this.gameState.burnout + burnoutChange,
                0,
                100
            );

            // Recalculate profits
            this.recalculateProfits();

            // Dispatch event so React UI can update
            this.events.emit("gameStateUpdated", this.gameState);
        };

        // Method to open buffs panel
        this.openBuffsPanel = () => {
            console.log("Opening buffs panel in Phaser scene");
            // Implement buffs logic
        };

        // Method to open options panel
        this.openOptionsPanel = () => {
            console.log("Opening options panel in Phaser scene");
            // Implement options logic
        };
    }

    recalculateProfits() {
        // Simple algorithm to calculate profits
        this.gameState.noddleBars.forecastedProfit = Phaser.Math.Between(
            10000,
            15000
        );
        this.gameState.employees.laborCost = Phaser.Math.Between(8000, 9500);
        this.gameState.debts.repayment = 1500;

        // Calculate total forecast profit
        this.gameState.forecastProfit =
            this.gameState.noddleBars.forecastedProfit -
            this.gameState.employees.laborCost -
            this.gameState.debts.repayment;
    }

    getGameState() {
        return this.gameState;
    }

    update() {
        // Hub scene update logic goes here
        if (this.noodlesPattern) {
            this.noodlesPattern.tilePositionX += 0.5;
            this.noodlesPattern.tilePositionY += 0.5;
        }
    }
}

