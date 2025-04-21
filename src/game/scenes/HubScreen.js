import Phaser from "phaser";
import { EventBus } from "../EventBus";
import { audioManager } from "../AudioManager";

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

        // Fairy dialogue system
        this.fairyMessages = [
            "Welcome to Noodle Balance! I'm Miso, your fairy helper!",
            "Remember to keep your burnout level low. Take breaks!",
            "Assign your employees wisely to maximize profits!",
            "Investors want to see growth. Prepare for the meetings!",
            "Balancing profits and quality is key to success!",
            "Upgrade your noodle bars to attract more customers!",
            "You can check your current profit forecast at any time.",
            "Need help? Click on me for some tips!",
            "Managing your personal time is important for success!",
            "Your rank increases as your business grows. Aim high!",
        ];

        // Menu-specific fairy messages
        this.menuMessages = {
            NoodleBars: [
                "Your noodle bars are the heart of your business!",
                "Assign skilled employees to boost sales!",
                "Consider upgrades to increase profit margins.",
                "Location matters! Premium spots mean more customers.",
            ],
            Employees: [
                "Happy employees are productive employees!",
                "Look for skilled candidates to join your team.",
                "Balance salary costs with employee skills.",
                "Training can improve your staff's performance!",
            ],
            Debts: [
                "Managing debts is crucial for long-term success.",
                "Loans can help expand, but watch the interest!",
                "Pay off high-interest debts first when possible.",
                "Your credit rating affects future loan options.",
            ],
            PersonalTime: [
                "Don't forget to take care of yourself!",
                "Balance work and personal time to reduce burnout.",
                "Different activities provide different benefits.",
                "Your wellbeing affects your business decisions!",
            ],
        };

        // Recruitment fairy messages
        this.recruitmentMessages = [
            "Let's find some talented employees for your noodle bars!",
            "I'll help you find the best staff for your business!",
            "Hmm, who should join our noodle empire today?",
            "Searching for culinary talent in Tokyo!",
            "Let's see who's looking for work in the restaurant business...",
        ];

        this.currentMessageIndex = 0;
        this.messageTimer = null;
        this.speechBubble = null;
        this.speechText = null;
        this.isShowingMessage = false;
        this.isPerformingRecruitment = false;
    }

    preload() {
        // Load hub assets
        this.load.image("fairy", "assets/hub/fairynoddle.png");
        this.load.image("noodles", "noodles.png");
        this.load.image("bgtest", "assets/hub/bgtest.png");
        this.load.image("particle", "assets/hub/particle.png");
        this.load.image("star", "assets/hub/star.png");
    }

    create() {
        // Get dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // // Add orange background (same as MainMenu for consistency)
        // this.add.rectangle(0, 0, width, height, 0xe67e22).setOrigin(0);

        // // Add repeating noodles pattern with diagonal scrolling (same as MainMenu)
        // this.noodlesPattern = this.add
        //     .tileSprite(0, 0, width, height, "noodles")
        //     .setOrigin(0)
        //     .setAlpha(0.3); // Add some transparency

        // Add background image
        this.background = this.add
            .image(width * 0.25, 0, "bgtest")
            .setOrigin(0);
        this.background.setDisplaySize(width * 0.8, height);
        this.add
            .rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setAlpha(0.5);

        // Get player name from localStorage
        this.gameState.playerName =
            localStorage.getItem("playerName") || "Player";

        // Create the fairy sprite (just for Phaser side visuals in the game area)
        if (this.textures.exists("fairy")) {
            this.fairy = this.add
                .sprite(width * 0.75, height * 0.5, "fairy")
                .setScale(0.2)
                .setInteractive({ useHandCursor: true });

            // Simple animation to make the fairy float
            this.tweens.add({
                targets: this.fairy,
                y: this.fairy.y - 20,
                duration: 2000,
                ease: "Sine.easeInOut",
                yoyo: true,
                repeat: -1,
            });

            // Add subtle rotation animation
            this.tweens.add({
                targets: this.fairy,
                angle: { from: -5, to: 5 },
                duration: 5000,
                ease: "Sine.easeInOut",
                yoyo: true,
                repeat: -1,
            });

            // Create speech bubble (initially hidden)
            this.createSpeechBubble();

            // Setup fairy click interaction
            this.fairy.on("pointerdown", () => {
                if (!this.isPerformingRecruitment) {
                    this.showRandomMessage();
                }
            });

            // Setup random message timer (every 10 seconds)
            this.messageTimer = this.time.addEvent({
                delay: 10000,
                callback: () => {
                    if (!this.isPerformingRecruitment) {
                        this.showRandomMessage();
                    }
                },
                callbackScope: this,
                loop: true,
            });

            // Show initial welcome message
            this.time.delayedCall(1000, () => {
                this.showMessage(this.fairyMessages[0]);
            });
        }

        // Register this scene with the event bus for React components to access
        console.log("HubScreen: Registering scene with EventBus");
        EventBus.registerScene(this);

        // Initialize audio manager and play music based on current period
        audioManager.init(this.sound);
        audioManager.playHubMusic(this.gameState.period);

        // Listen for menu changes from React
        EventBus.on("menuChanged", this.handleMenuChange, this);

        // Listen for recruitment start
        EventBus.on("startRecruitment", this.handleStartRecruitment, this);

        // Listen for audio events
        this.setupAudioEventListeners();

        // Set up methods for React to call
        this.setupReactInteractions();
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

        // Listen for volume changes
        EventBus.on("setMasterVolume", (volume) => {
            audioManager.setMasterVolume(volume);
        });

        EventBus.on("setMusicVolume", (volume) => {
            audioManager.setMusicVolume(volume);
        });

        EventBus.on("setSfxVolume", (volume) => {
            audioManager.setSfxVolume(volume);
        });
    }

    createSpeechBubble() {
        // Create text object for fairy dialogue with better visibility
        this.speechText = this.add
            .text(this.fairy.x - 180, this.fairy.y, "", {
                fontFamily: "Arial",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#000000",
                align: "center",
                wordWrap: { width: 240 },
                padding: {
                    left: 15,
                    right: 15,
                    top: 10,
                    bottom: 10,
                },
            })
            .setOrigin(1, 0.5)
            .setDepth(100)
            .setAlpha(0);

        // Create decorative background for text with rounded corners
        this.speechBackground = this.add.graphics();
        this.speechBackground.setDepth(99);
        this.speechBackground.setAlpha(0);

        // Add small triangle pointer towards fairy (now pointing right)
        this.speechPointer = this.add.graphics();
        this.speechPointer.setDepth(99);
        this.speechPointer.setAlpha(0);
    }

    showMessage(message) {
        // If already showing a message, hide it first
        if (this.isShowingMessage) {
            this.hideSpeechBubble(() => {
                this.displayNewMessage(message);
            });
        } else {
            this.displayNewMessage(message);
        }
    }

    displayNewMessage(message) {
        // Update text
        this.speechText.setText(message);

        // Show speech text with animation
        this.isShowingMessage = true;

        // Calculate background size based on text bounds
        const bounds = this.speechText.getBounds();

        // Draw white background
        this.speechBackground.clear();
        this.speechBackground.fillStyle(0xffffff, 0.9);
        this.speechBackground.fillRoundedRect(
            bounds.x - 15,
            bounds.y - 10,
            bounds.width + 30,
            bounds.height + 20,
            16
        );

        // Draw pointer triangle towards fairy (pointing right)
        this.speechPointer.clear();
        this.speechPointer.fillStyle(0xffffff, 0.9);
        this.speechPointer.beginPath();
        this.speechPointer.moveTo(
            bounds.x + bounds.width + 15,
            bounds.y + bounds.height / 2 - 10
        );
        this.speechPointer.lineTo(
            bounds.x + bounds.width + 35,
            bounds.y + bounds.height / 2
        );
        this.speechPointer.lineTo(
            bounds.x + bounds.width + 15,
            bounds.y + bounds.height / 2 + 10
        );
        this.speechPointer.closePath();
        this.speechPointer.fillPath();

        // Fade in animation
        this.tweens.add({
            targets: [
                this.speechText,
                this.speechBackground,
                this.speechPointer,
            ],
            alpha: { from: 0, to: 1 },
            duration: 400,
            ease: "Sine.easeOut",
            onComplete: () => {
                // Hide after 5 seconds
                this.time.delayedCall(5000, () => {
                    this.hideSpeechBubble();
                });
            },
        });

        // Add slight bounce animation to fairy
        this.tweens.add({
            targets: this.fairy,
            y: this.fairy.y - 15,
            duration: 300,
            yoyo: true,
            ease: "Bounce.easeOut",
        });
    }

    hideSpeechBubble(callback) {
        // Hide with fade animation
        this.tweens.add({
            targets: [
                this.speechText,
                this.speechBackground,
                this.speechPointer,
            ],
            alpha: { from: 1, to: 0 },
            duration: 300,
            ease: "Sine.easeIn",
            onComplete: () => {
                this.isShowingMessage = false;
                if (callback) callback();
            },
        });
    }

    showRandomMessage() {
        if (!this.isShowingMessage && !this.isPerformingRecruitment) {
            const randomIndex = Phaser.Math.Between(
                0,
                this.fairyMessages.length - 1
            );
            this.showMessage(this.fairyMessages[randomIndex]);
        }
    }

    handleMenuChange(menuName) {
        // Show menu-specific message when user changes menus
        if (this.menuMessages[menuName] && !this.isPerformingRecruitment) {
            const messages = this.menuMessages[menuName];
            const randomIndex = Phaser.Math.Between(0, messages.length - 1);
            this.showMessage(messages[randomIndex]);
        }
    }

    handleStartRecruitment() {
        // Set flag to prevent random messages
        this.isPerformingRecruitment = true;

        // Get random recruitment message
        const randomIndex = Phaser.Math.Between(
            0,
            this.recruitmentMessages.length - 1
        );
        const message = this.recruitmentMessages[randomIndex];

        // Show the message with fairy animation
        this.showRecruitmentAnimation(message);
    }

    showRecruitmentAnimation(message) {
        // Hide any existing message
        this.hideSpeechBubble(() => {
            // Show the recruitment message
            this.showMessage(message);

            // Add fairy animation - a more dramatic bounce and spin
            this.tweens.add({
                targets: this.fairy,
                y: this.fairy.y - 50,
                angle: { from: -15, to: 15 },
                duration: 800,
                yoyo: true,
                repeat: 1,
                ease: "Sine.easeInOut",
                onComplete: () => {
                    // Create particle effects
                    this.createRecruitmentParticles();

                    // Add a sparkle effect (simple scale pulse)
                    this.tweens.add({
                        targets: this.fairy,
                        scaleX: { from: 0.2, to: 0.26 },
                        scaleY: { from: 0.2, to: 0.26 },
                        duration: 300,
                        yoyo: true,
                        repeat: 2,
                        ease: "Sine.easeInOut",
                        onComplete: () => {
                            // Reset fairy scale
                            this.fairy.setScale(0.2);

                            // Delay then complete the recruitment process
                            this.time.delayedCall(1000, () => {
                                // Reset the flag
                                this.isPerformingRecruitment = false;

                                // Fire the completion event to show candidates
                                EventBus.emit("recruitmentAnimationComplete");

                                // Show completion message
                                this.showMessage(
                                    "I found some potential employees! Take a look!"
                                );
                            });
                        },
                    });
                },
            });
        });
    }

    createRecruitmentParticles() {
        // Clean up any existing particles first
        if (this.circleParticles) {
            this.circleParticles.destroy();
        }
        if (this.starParticles) {
            this.starParticles.destroy();
        }
        if (this.glowParticles) {
            this.glowParticles.destroy();
        }

        // Create particles with the new Phaser 3.60+ syntax
        // Each particle emitter is now its own Game Object

        // Circle particles emitter
        this.circleParticles = this.add.particles(
            this.fairy.x,
            this.fairy.y,
            "particle",
            {
                speed: { min: 50, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.6, end: 0 },
                blendMode: "ADD",
                lifespan: 1000,
                gravityY: 0,
                quantity: 1,
                tint: [0xff9ff5, 0x96f7d2, 0xf9f871],
            }
        );

        // Stars particles emitter
        this.starParticles = this.add.particles(
            this.fairy.x,
            this.fairy.y,
            "star",
            {
                speed: { min: 100, max: 300 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.4, end: 0 },
                blendMode: "NORMAL",
                lifespan: 2000,
                gravityY: 200,
                frequency: 200,
                quantity: 3,
            }
        );

        // Magic circle particles
        this.glowParticles = this.add.particles(
            this.fairy.x,
            this.fairy.y,
            "particle",
            {
                speed: 0,
                scale: { start: 0.4, end: 0 },
                blendMode: "ADD",
                lifespan: 1500,
                emitting: false,
                tint: [0xffbe0b, 0xfb5607, 0x3a86ff, 0x8338ec],
            }
        );

        // Manually emit particles in a circle pattern
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 50;
            const x = this.fairy.x + radius * Math.cos(angle);
            const y = this.fairy.y + radius * Math.sin(angle);

            this.glowParticles.emitParticleAt(x, y);
        }

        // Flash effect
        this.cameras.main.flash(500, 255, 255, 255, 0.5);

        // Stop particles after a delay
        this.time.delayedCall(2500, () => {
            this.circleParticles.stop();
            this.starParticles.stop();

            // Clean up particles after they finish
            this.time.delayedCall(2000, () => {
                if (this.circleParticles) {
                    this.circleParticles.destroy();
                    this.circleParticles = null;
                }
                if (this.starParticles) {
                    this.starParticles.destroy();
                    this.starParticles = null;
                }
                if (this.glowParticles) {
                    this.glowParticles.destroy();
                    this.glowParticles = null;
                }
            });
        });
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
                this.showMessage(
                    "Investor meeting coming up! Make sure your business is looking profitable!"
                );
            } else {
                this.showMessage(
                    `Starting Period ${this.gameState.period}! Let's make this a profitable one!`
                );
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

            // Show burnout warning if too high
            if (this.gameState.burnout > 70) {
                this.time.delayedCall(1500, () => {
                    this.showMessage(
                        "Your burnout is too high! Take some personal time to recover."
                    );
                });
            }

            // Recalculate profits
            this.recalculateProfits();

            // La musique sera mise à jour via l'événement updatePeriodMusic

            // Dispatch event so React UI can update
            this.events.emit("gameStateUpdated", this.gameState);

            // Reset the recruitment flag for new period
            const currentRecruitmentPeriod = localStorage.getItem(
                "recruitmentDoneInPeriod"
            );
            if (
                currentRecruitmentPeriod &&
                parseInt(currentRecruitmentPeriod) < this.gameState.period
            ) {
                // We don't need to set the item to the current period, just ensure it's not equal
                // This allows the recruitment component to reset its state naturally
                console.log("Recruitment flag should reset for new period");

                // Clean up recruitment candidates from localStorage
                localStorage.removeItem("periodRecruitmentCandidates");
            }
        };

        // Method to open buffs panel
        this.openBuffsPanel = () => {
            console.log("Opening buffs panel in Phaser scene");
            this.showMessage(
                "Buffs can give you temporary advantages. Choose wisely!"
            );
        };

        // Method to open options panel
        this.openOptionsPanel = () => {
            console.log("Opening options panel in Phaser scene");
            this.showMessage("You can adjust your game settings here!");
        };

        // Method for React to make fairy speak
        this.fairySpeak = (message) => {
            if (message && typeof message === "string") {
                this.showMessage(message);
                return true;
            }
            return false;
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
        // if (this.noodlesPattern) {
        //     this.noodlesPattern.tilePositionX += 0.5;
        //     this.noodlesPattern.tilePositionY += 0.5;
        // }

        // Update speech text position to follow fairy
        if (this.speechText && this.fairy) {
            const bounds = this.speechText.getBounds();
            // Position to the left of the fairy
            this.speechText.x = this.fairy.x - 100;
            this.speechText.y = this.fairy.y - 50;

            // Update background position
            if (this.speechBackground && this.speechBackground.clear) {
                this.speechBackground.clear();
                this.speechBackground.fillStyle(0xffffff, 0.9);
                this.speechBackground.fillRoundedRect(
                    this.speechText.x - bounds.width - 15,
                    this.speechText.y - bounds.height / 2 - 10,
                    bounds.width + 30,
                    bounds.height + 20,
                    16
                );
            }

            // Update pointer position (pointing right)
            if (this.speechPointer && this.speechPointer.clear) {
                this.speechPointer.clear();
                this.speechPointer.fillStyle(0xffffff, 0.9);
                this.speechPointer.beginPath();
                this.speechPointer.moveTo(
                    this.speechText.x + 15,
                    this.speechText.y - 10
                );
                this.speechPointer.lineTo(
                    this.speechText.x + 35,
                    this.speechText.y
                );
                this.speechPointer.lineTo(
                    this.speechText.x + 15,
                    this.speechText.y + 10
                );
                this.speechPointer.closePath();
                this.speechPointer.fillPath();
            }
        }
    }
}

