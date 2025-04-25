import Phaser from "phaser";
import { EventBus } from "../EventBus";
import { audioManager } from "../AudioManager";
import gameState from "../GameState";

export class HubScreen extends Phaser.Scene {
    constructor() {
        super("HubScreen");

        // Fairy dialogue system
        this.fairyMessages = [
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
                "Your credit rating affects future loan options.",
                "You can check your credit rating at any time.",
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
        this.lastMessage = null;
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

        // Add background image
        this.background = this.add
            .image(width * 0.1, 0, "bgtest")
            .setOrigin(0)
            .setDepth(0);
        this.background.setDisplaySize(width * 0.9, height);

        // Add dark background overlay
        this.backgroundOverlay = this.add
            .rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setAlpha(0.3)
            .setDepth(1);

        // Initialize or get singleton GameState
        if (!gameState.initialized) {
            console.log(
                "HubScreen: GameState not initialized, initializing now"
            );
            gameState.initialize();
        }

        // Get the current game state from singleton
        const currentGameState = gameState.getGameState();
        console.log(
            "HubScreen: Retrieved current game state:",
            currentGameState
        );

        // Create the fairy sprite with higher depth
        if (this.textures.exists("fairy")) {
            this.fairy = this.add
                .sprite(width * 0.77, height * 0.5, "fairy")
                .setScale(0.2)
                .setInteractive({ useHandCursor: true })
                .setDepth(100);

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
                    const messages = [...this.fairyMessages];
                    let randomIndex;
                    do {
                        randomIndex = Phaser.Math.Between(
                            0,
                            messages.length - 1
                        );
                    } while (
                        messages[randomIndex] === this.lastMessage &&
                        messages.length > 1
                    );

                    const message = messages[randomIndex];
                    this.lastMessage = message;
                    this.showMessage(message);
                }
            });

            // Setup random message timer (every 10 seconds)
            this.messageTimer = this.time.addEvent({
                delay: 10000,
                callback: () => {
                    if (
                        !this.isPerformingRecruitment &&
                        !this.isShowingMessage
                    ) {
                        this.showRandomMessage();
                    }
                },
                callbackScope: this,
                loop: true,
            });

            // Show initial welcome message
            this.time.delayedCall(1000, () => {
                const playerName = currentGameState.playerName || "Player";
                this.showMessage(
                    `Welcome back, ${playerName}! Ready for another day of noodle business?`
                );
            });
        }

        // Register this scene with the event bus for React components to access
        console.log("HubScreen: Registering scene with EventBus");
        EventBus.registerScene(this);

        // Listen for menu changes from React
        EventBus.on("menuChanged", this.handleMenuChange, this);

        // Listen for recruitment start
        EventBus.on("startRecruitment", this.handleStartRecruitment, this);

        // Listen for audio events
        this.setupAudioEventListeners();

        // Set up methods for React to call
        this.setupReactInteractions();

        // Initialize audio manager and play music based on current period from GameState
        audioManager.init(this.sound);
        const currentPeriod = currentGameState.gameProgress?.currentPeriod || 1;
        audioManager.playHubMusic(currentPeriod);

        // Listen for game state updates
        EventBus.on("gameStateUpdated", this.handleGameStateUpdate, this);

        // Listen for return from delivery run to process results
        EventBus.on("returnToHub", this.handleReturnFromDelivery, this);
    }

    handleGameStateUpdate(updatedState) {
        console.log("HubScreen: Game state updated", updatedState);
        // We don't need to store the state here since we'll get it from the singleton when needed
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
            .setDepth(150)
            .setAlpha(0);

        // Create decorative background for text with rounded corners
        this.speechBackground = this.add.graphics();
        this.speechBackground.setDepth(149);
        this.speechBackground.setAlpha(0);

        // Add small triangle pointer towards fairy (now pointing right)
        this.speechPointer = this.add.graphics();
        this.speechPointer.setDepth(149);
        this.speechPointer.setAlpha(0);
    }

    showMessage(message) {
        // Cancel any existing hide timer
        if (this.hideMessageTimer) {
            this.hideMessageTimer.remove();
            this.hideMessageTimer = null;
        }

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
                this.hideMessageTimer = this.time.delayedCall(5000, () => {
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
        // Create a dark overlay
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Nettoyer l'ancien overlay s'il existe
        if (this.darkOverlay) {
            this.darkOverlay.destroy();
        }

        this.darkOverlay = this.add
            .rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setAlpha(0)
            .setDepth(50);

        // Hide any existing message
        this.hideSpeechBubble(() => {
            // Darken the background and zoom camera
            this.tweens.add({
                targets: this.darkOverlay,
                alpha: 0.7,
                duration: 500,
                ease: "Sine.easeOut",
            });

            this.tweens.add({
                targets: this.cameras.main,
                zoom: 1.1,
                duration: 500,
                ease: "Sine.easeOut",
                onComplete: () => {
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

                                    // Return camera and background to normal
                                    this.tweens.add({
                                        targets: this.cameras.main,
                                        zoom: 1,
                                        duration: 500,
                                        ease: "Sine.easeIn",
                                    });

                                    this.tweens.add({
                                        targets: this.darkOverlay,
                                        alpha: 0,
                                        duration: 500,
                                        ease: "Sine.easeIn",
                                        onComplete: () => {
                                            if (this.darkOverlay) {
                                                this.darkOverlay.destroy();
                                                this.darkOverlay = null;
                                            }

                                            // Delay then complete the recruitment process
                                            this.time.delayedCall(500, () => {
                                                // Reset the flag
                                                this.isPerformingRecruitment = false;

                                                // Fire the completion event to show candidates
                                                EventBus.emit(
                                                    "recruitmentAnimationComplete"
                                                );

                                                // Show completion message
                                                this.showMessage(
                                                    "I found some potential employees! Take a look!"
                                                );
                                            });
                                        },
                                    });
                                },
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

        // Create particles with high depth to be above the overlay
        this.circleParticles = this.add
            .particles(this.fairy.x, this.fairy.y, "particle", {
                speed: { min: 50, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.6, end: 0 },
                blendMode: "ADD",
                lifespan: 1000,
                gravityY: 0,
                quantity: 1,
                tint: [0xff9ff5, 0x96f7d2, 0xf9f871],
            })
            .setDepth(101);

        this.starParticles = this.add
            .particles(this.fairy.x, this.fairy.y, "star", {
                speed: { min: 100, max: 300 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.4, end: 0 },
                blendMode: "NORMAL",
                lifespan: 2000,
                gravityY: 200,
                frequency: 200,
                quantity: 3,
            })
            .setDepth(101);

        this.glowParticles = this.add
            .particles(this.fairy.x, this.fairy.y, "particle", {
                speed: 0,
                scale: { start: 0.4, end: 0 },
                blendMode: "ADD",
                lifespan: 1500,
                emitting: false,
                tint: [0xffbe0b, 0xfb5607, 0x3a86ff, 0x8338ec],
            })
            .setDepth(101);

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

            // Use GameState to handle period advancement logic
            gameState.startPeriod();

            // Get updated state after period change
            const updatedState = gameState.getGameState();

            // Display fairy message based on updated state
            const currentPeriod = updatedState.gameProgress?.currentPeriod || 1;
            const investorClashIn =
                updatedState.gameProgress?.investorClashIn || 0;
            const burnout = updatedState.playerStats?.burnout || 0;

            if (investorClashIn === 1) {
                // Investor meeting is next period
                this.showMessage(
                    "Investor meeting coming up next period! Make sure your business is looking profitable!"
                );
            } else {
                this.showMessage(
                    `Starting Period ${currentPeriod}! Let's make this a profitable one!`
                );
            }

            // Show burnout warning if too high
            if (burnout > 70) {
                this.time.delayedCall(1500, () => {
                    this.showMessage(
                        "Your burnout is too high! Take some personal time to recover."
                    );
                });
            }

            // Update audio based on period
            audioManager.playHubMusic(currentPeriod);
        };

        // Method to open buffs panel
        this.openBuffsPanel = () => {
            console.log("Opening buffs panel in Phaser scene");

            // Use GameState's method to open buffs panel
            gameState.openBuffsPanel();

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

    getGameState() {
        // Instead of returning the internal state, get the state from the singleton
        return gameState.getGameState();
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

    // Display message with type (success, warning, info)
    displayMessage(text, type = "info") {
        console.log(`HubScreen: Displaying message: ${text} (${type})`);

        // Use the fairy speech bubble for messages
        this.showMessage(text);

        // Can also emit an event for React to display in UI
        EventBus.emit("displayMessage", { text, type });
    }

    // Check conditions for game over
    checkGameOverConditions() {
        const state = gameState.getGameState();

        // Check for bankruptcy (negative funds beyond a threshold)
        if (state.finances?.funds < -10000) {
            console.log("HubScreen: GAME OVER - Bankruptcy detected");
            EventBus.emit("gameOver", { reason: "bankruptcy" });
        }

        // Check for burnout level too high
        if (state.playerStats?.burnout >= 100) {
            console.log("HubScreen: GAME OVER - Burnout level critical");
            EventBus.emit("gameOver", { reason: "burnout" });
        }
    }

    // Add the new method to handle return from delivery run
    handleReturnFromDelivery(results) {
        console.log("HubScreen: Processing delivery results:", results);

        if (!results) {
            console.warn("No results provided to handleReturnFromDelivery");
            return;
        }

        // Ensure the scene is properly initialized before proceeding
        if (!this.scene.isActive()) {
            console.log("HubScreen: Scene not active, starting scene first");
            this.scene.start("HubScreen");

            // Add a delay to ensure scene is fully initialized before processing results
            this.time.delayedCall(500, () => {
                this.processDeliveryResults(results);
            });
            return;
        }

        this.processDeliveryResults(results);
    }

    processDeliveryResults(results) {
        console.log("HubScreen: Processing results with GameState:", results);

        // Use GameState's method to process all delivery results
        gameState.processDeliveryResults(results);

        // Save game state to localStorage after all updates
        gameState.saveGameState(true); // true to create a backup copy

        // Ensure the fairy and text objects are created before displaying messages
        if (!this.fairy || !this.speechText) {
            console.log("HubScreen: Recreating fairy and speech objects");
            this.createSpeechBubble();
        }

        // Display result message
        if (results.message) {
            // Add a small delay to ensure everything is ready
            this.time.delayedCall(100, () => {
                this.displayMessage(results.message.text, results.message.type);
            });
        } else {
            // Fallback message based on financial result
            const balanceChange =
                results.balanceChange || results.totalProfit || 0;
            const messageText =
                balanceChange >= 0
                    ? `Period complete! Profit: $${balanceChange.toLocaleString()}`
                    : `Period complete. Loss: $${Math.abs(
                          balanceChange
                      ).toLocaleString()}`;

            // Add a small delay to ensure everything is ready
            this.time.delayedCall(100, () => {
                this.displayMessage(
                    messageText,
                    balanceChange >= 0 ? "success" : "warning"
                );
            });
        }

        // Check for game over conditions
        this.checkGameOverConditions();
    }
}

