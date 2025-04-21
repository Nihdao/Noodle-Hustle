import Phaser from "phaser";
import { EventBus } from "../EventBus";
import { audioManager } from "../AudioManager";

export class DeliveryRun extends Phaser.Scene {
    constructor() {
        super("DeliveryRun");
        this.activeRestaurants = [];
        this.playerSprites = {};
        this.events = {};
        this.finished = false;
        this.started = false;
    }

    init(data) {
        // Get data passed from the HubScreen
        this.activeRestaurants = data.restaurants || [];
        this.playerStats = data.playerStats || {};
        this.funds = data.funds || 0;
        this.currentPeriod = data.currentPeriod || 1;
        this.gameProgressData = {};
    }

    preload() {
        // Load delivery run assets if not already loaded
        if (!this.textures.exists("player_sprite")) {
            this.load.spritesheet(
                "player_sprite",
                "assets/deliveryrun/player_sprite.png",
                {
                    frameWidth: 32,
                    frameHeight: 32,
                }
            );
        }

        // Load noodles background pattern if not already loaded
        if (!this.textures.exists("noodles")) {
            this.load.image("noodles", "noodles.png");
        }

        this.load.image("money_icon", "assets/deliveryrun/money_icon.png");
        this.load.image("delivery_bg", "assets/deliveryrun/delivery_bg.jpg");
        this.load.image(
            "restaurant_slot",
            "assets/deliveryrun/restaurant_slot.png"
        );
        this.load.image(
            "event_positive",
            "assets/deliveryrun/event_positive.png"
        );
        this.load.image(
            "event_negative",
            "assets/deliveryrun/event_negative.png"
        );
    }

    create() {
        // Register this scene with the event bus
        console.log("DeliveryRun: Registering scene with EventBus");
        EventBus.registerScene(this);

        // Initialize audio manager and play business music
        audioManager.init(this.sound);
        audioManager.playMusic("business");

        // Create background - using a darker version of the MainMenu background
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Dark orange/brown background (darker than MainMenu)
        this.add.rectangle(0, 0, width, height, 0xa02515).setOrigin(0);

        // Add repeating noodles pattern with diagonal scrolling (more subtle)
        this.noodlesPattern = this.add
            .tileSprite(0, 0, width, height, "noodles")
            .setOrigin(0)
            .setAlpha(0.15); // More transparent than MainMenu for subtlety

        // Set up layout for restaurant tracks
        this.setupLayout();

        // Create fade-in effect
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // After a brief delay, show "Business Open" text
        this.time.delayedCall(1500, () => {
            this.showBusinessOpen();
        });
    }

    setupLayout() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Header area (top 15% of screen)
        this.headerArea = {
            x: 0,
            y: 0,
            width: width,
            height: height * 0.15,
        };

        // Restaurant tracks area (middle 70% of screen)
        this.tracksArea = {
            x: 0,
            y: this.headerArea.height,
            width: width,
            height: height * 0.7,
        };

        // Footer area (bottom 15% of screen)
        this.footerArea = {
            x: 0,
            y: this.headerArea.height + this.tracksArea.height,
            width: width,
            height: height * 0.15,
        };

        // Create a group for each track
        this.trackGroups = [];

        // Calculate track height
        const trackHeight = this.tracksArea.height / 5; // 5 tracks max

        // Create restaurant tracks (active and inactive)
        for (let i = 0; i < 5; i++) {
            const trackGroup = this.add.group();
            const y = this.tracksArea.y + i * trackHeight;

            // Track background
            const trackBg = this.add
                .rectangle(0, y, width, trackHeight, 0x444444)
                .setOrigin(0);
            trackBg.setAlpha(0.3);

            // Track separator
            const separator = this.add
                .line(0, y + trackHeight, 0, 0, width, 0, 0xaaaaaa)
                .setOrigin(0);
            separator.setAlpha(0.5);

            trackGroup.add(trackBg);
            trackGroup.add(separator);

            this.trackGroups.push(trackGroup);
        }

        // Set up tracks based on active restaurants
        this.setupRestaurantTracks();
    }

    setupRestaurantTracks() {
        const width = this.cameras.main.width;
        const trackHeight = this.tracksArea.height / 5;

        // Setup each active restaurant track
        for (let i = 0; i < this.activeRestaurants.length; i++) {
            const restaurant = this.activeRestaurants[i];
            const y = this.tracksArea.y + i * trackHeight;

            // Restaurant info panel (left side)
            const infoPanelWidth = width * 0.2;
            const infoPanel = this.add
                .rectangle(0, y, infoPanelWidth, trackHeight, 0x222222)
                .setOrigin(0);
            this.trackGroups[i].add(infoPanel);

            // Restaurant name
            const restaurantName = this.add.text(10, y + 20, restaurant.name, {
                fontFamily: "Arial",
                fontSize: "18px",
                fill: "#ffffff",
            });
            this.trackGroups[i].add(restaurantName);

            // Restaurant profit/loss
            const profitText = this.add.text(
                10,
                y + trackHeight - 30,
                `¥${restaurant.forecastedProfit.toLocaleString()}`,
                {
                    fontFamily: "Arial",
                    fontSize: "16px",
                    fill:
                        restaurant.forecastedProfit >= 0
                            ? "#4ade80"
                            : "#ef4444",
                }
            );
            this.trackGroups[i].add(profitText);

            // Progress bar track
            const trackBarBg = this.add
                .rectangle(
                    infoPanelWidth,
                    y + trackHeight / 2,
                    width - infoPanelWidth,
                    trackHeight * 0.5,
                    0x333333
                )
                .setOrigin(0, 0.5);
            this.trackGroups[i].add(trackBarBg);

            // Progress bar (will be animated during the delivery run)
            const progressBar = this.add
                .rectangle(
                    infoPanelWidth,
                    y + trackHeight / 2,
                    0, // Initial width is 0
                    trackHeight * 0.5,
                    0x10b981
                )
                .setOrigin(0, 0.5);
            progressBar.displayWidth = 0;
            this.trackGroups[i].add(progressBar);

            // Player sprite
            const playerSprite = this.add.sprite(
                infoPanelWidth + 20,
                y + trackHeight / 2,
                "player_sprite"
            );
            playerSprite.setScale(1.5);
            this.trackGroups[i].add(playerSprite);

            // Store references for animations
            this.playerSprites[restaurant.id] = {
                sprite: playerSprite,
                progressBar: progressBar,
                maxX: width - 50,
                restaurant: restaurant,
                events: [],
                active: true,
            };
        }

        // Setup inactive restaurant tracks (greyed out)
        for (let i = this.activeRestaurants.length; i < 5; i++) {
            const y = this.tracksArea.y + i * trackHeight;

            // Inactive restaurant placeholder
            const inactiveText = this.add
                .text(
                    width / 2,
                    y + trackHeight / 2,
                    "Restaurant slot not purchased",
                    {
                        fontFamily: "Arial",
                        fontSize: "16px",
                        fill: "#888888",
                    }
                )
                .setOrigin(0.5);

            this.trackGroups[i].add(inactiveText);
        }
    }

    createHeader() {
        const width = this.cameras.main.width;

        // Header background
        const headerBg = this.add
            .rectangle(0, 0, width, this.headerArea.height, 0x660000)
            .setOrigin(0);
        this.headerElements = this.add.group();
        this.headerElements.add(headerBg);

        // Business Performance Report title
        const title = this.add
            .text(
                20,
                this.headerArea.height / 2,
                "Business Performance Report",
                {
                    fontFamily: "Arial",
                    fontSize: "32px",
                    fontWeight: "bold",
                    fill: "#ffffff",
                }
            )
            .setOrigin(0, 0.5);
        this.headerElements.add(title);

        // Period and funds display
        const periodText = this.add
            .text(width - 20, 20, `Period: ${this.currentPeriod}`, {
                fontFamily: "Arial",
                fontSize: "18px",
                fill: "#ffffff",
            })
            .setOrigin(1, 0);
        this.headerElements.add(periodText);

        const fundsText = this.add
            .text(
                width - 20,
                this.headerArea.height - 20,
                `Funds: ¥${this.funds.toLocaleString()}`,
                {
                    fontFamily: "Arial",
                    fontSize: "24px",
                    fill: "#ffffff",
                }
            )
            .setOrigin(1, 1);
        this.headerElements.add(fundsText);
    }

    showBusinessOpen() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Show "Business Open" text with animation
        const businessOpenText = this.add
            .text(width / 2, height / 2, "Business OPEN", {
                fontFamily: "Arial",
                fontSize: "64px",
                fontWeight: "bold",
                fill: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
            })
            .setOrigin(0.5)
            .setAlpha(0);

        // Text animation
        this.tweens.add({
            targets: businessOpenText,
            alpha: 1,
            duration: 800,
            ease: "Power2",
            onComplete: () => {
                this.tweens.add({
                    targets: businessOpenText,
                    alpha: 0,
                    delay: 1000,
                    duration: 800,
                    ease: "Power2",
                    onComplete: () => {
                        businessOpenText.destroy();
                        this.startDeliveryRun();
                    },
                });
            },
        });
    }

    startDeliveryRun() {
        this.started = true;

        // Start animations for each restaurant
        Object.keys(this.playerSprites).forEach((restaurantId) => {
            const restaurantData = this.playerSprites[restaurantId];

            // Create animation for player running
            if (!this.anims.exists("run")) {
                this.anims.create({
                    key: "run",
                    frames: this.anims.generateFrameNumbers("player_sprite", {
                        start: 0,
                        end: 3,
                    }),
                    frameRate: 10,
                    repeat: -1,
                });
            }

            restaurantData.sprite.play("run");

            // Animate player sprite moving across the track
            this.tweens.add({
                targets: restaurantData.sprite,
                x: restaurantData.maxX,
                duration: 15000, // 15 seconds to complete the run
                ease: "Power1",
                onUpdate: (tween) => {
                    // Update progress bar width
                    const progress = tween.progress;
                    const barWidth =
                        restaurantData.maxX -
                        restaurantData.sprite.x +
                        (restaurantData.maxX - restaurantData.progressBar.x) *
                            progress;
                    restaurantData.progressBar.displayWidth = barWidth;

                    // Generate random events during the run
                    this.generateEvents(restaurantId, progress);
                },
                onComplete: () => {
                    // Mark this restaurant's run as complete
                    restaurantData.active = false;

                    // Check if all restaurants are done
                    this.checkRunCompletion();
                },
            });
        });

        // Set a backup timer in case there are no active restaurants
        if (Object.keys(this.playerSprites).length === 0) {
            this.time.delayedCall(5000, () => {
                this.showBusinessConcluded();
            });
        }
    }

    generateEvents(restaurantId, progress) {
        const restaurantData = this.playerSprites[restaurantId];

        // Only generate events at certain progress points
        // and limit the number of events per restaurant
        if (restaurantData.events.length >= 3) return;

        // These are checkpoints where events might trigger (30%, 50%, 70%)
        const checkpoints = [0.3, 0.5, 0.7];

        checkpoints.forEach((checkpoint) => {
            // Check if we're close to a checkpoint and haven't triggered an event there yet
            if (
                Math.abs(progress - checkpoint) < 0.01 &&
                !restaurantData.events.some(
                    (e) => Math.abs(e.progress - checkpoint) < 0.05
                )
            ) {
                // 70% chance for positive event, 30% for negative
                const isPositive = Math.random() < 0.7;

                // Create event data
                const eventData = {
                    progress: checkpoint,
                    positive: isPositive,
                    message: this.getRandomEventMessage(isPositive),
                    impact: isPositive
                        ? Math.random() * 0.2
                        : -Math.random() * 0.15, // +20% max or -15% max
                };

                // Store the event
                restaurantData.events.push(eventData);

                // Show the event message
                this.showEventMessage(restaurantId, eventData);
            }
        });
    }

    getRandomEventMessage(isPositive) {
        const positiveMessages = [
            "A customer loved the noodles!",
            "Positive review online!",
            "Perfect broth today!",
            "Influencer visited!",
            "New menu item is a hit!",
            "Extended hours is going well!",
        ];

        const negativeMessages = [
            "A power outage hit the region!",
            "Kitchen mishap!",
            "Delivery delayed!",
            "Supplier sent wrong ingredients!",
            "Staff called in sick!",
        ];

        const messages = isPositive ? positiveMessages : negativeMessages;
        return messages[Math.floor(Math.random() * messages.length)];
    }

    showEventMessage(restaurantId, eventData) {
        const restaurantData = this.playerSprites[restaurantId];
        const x = restaurantData.sprite.x + 50;
        const y = restaurantData.sprite.y - 40;

        // Create event bubble
        const bubble = this.add.image(
            x,
            y,
            eventData.positive ? "event_positive" : "event_negative"
        );
        bubble.setScale(0);

        // Event message
        const textColor = eventData.positive ? "#10B981" : "#ef4444";
        const message = this.add
            .text(x, y, eventData.message, {
                fontFamily: "Arial",
                fontSize: "14px",
                fill: textColor,
                stroke: "#000000",
                strokeThickness: 4,
                align: "center",
            })
            .setOrigin(0.5)
            .setAlpha(0);

        // Impact text (e.g., +10%, -5%)
        const impactText = this.add
            .text(
                x,
                y + 20,
                `${eventData.impact >= 0 ? "+" : ""}${Math.round(
                    eventData.impact * 100
                )}%`,
                {
                    fontFamily: "Arial",
                    fontSize: "16px",
                    fontWeight: "bold",
                    fill: eventData.positive ? "#10B981" : "#ef4444",
                    stroke: "#000000",
                    strokeThickness: 3,
                }
            )
            .setOrigin(0.5)
            .setAlpha(0);

        // Animate bubble and text
        this.tweens.add({
            targets: [bubble],
            scale: 1,
            duration: 400,
            ease: "Back.easeOut",
            onComplete: () => {
                this.tweens.add({
                    targets: [message, impactText],
                    alpha: 1,
                    duration: 300,
                    onComplete: () => {
                        // After 2 seconds, fade out the event
                        this.tweens.add({
                            targets: [bubble, message, impactText],
                            alpha: 0,
                            delay: 2000,
                            duration: 500,
                            onComplete: () => {
                                bubble.destroy();
                                message.destroy();
                                impactText.destroy();
                            },
                        });
                    },
                });
            },
        });

        // Update restaurant performance based on event impact
        if (eventData.impact !== 0) {
            // Change the progress bar color based on accumulated performance
            const totalImpact = restaurantData.events.reduce(
                (sum, event) => sum + event.impact,
                0
            );

            if (totalImpact > 0) {
                restaurantData.progressBar.fillColor = 0x10b981; // Green for positive
            } else if (totalImpact < 0) {
                restaurantData.progressBar.fillColor = 0xef4444; // Red for negative
            }
        }
    }

    checkRunCompletion() {
        // Check if all restaurants have completed their runs
        const allComplete = Object.values(this.playerSprites).every(
            (data) => !data.active
        );

        if (allComplete && !this.finished) {
            this.finished = true;
            this.showBusinessConcluded();
        }
    }

    showBusinessConcluded() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Show "Business Concluded" text with animation
        const businessConcludedText = this.add
            .text(width / 2, height / 2, "Business Concluded", {
                fontFamily: "Arial",
                fontSize: "64px",
                fontWeight: "bold",
                fill: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
            })
            .setOrigin(0.5)
            .setAlpha(0);

        // Text animation
        this.tweens.add({
            targets: businessConcludedText,
            alpha: 1,
            duration: 800,
            ease: "Power2",
            onComplete: () => {
                this.tweens.add({
                    targets: businessConcludedText,
                    alpha: 0,
                    delay: 1500,
                    duration: 800,
                    ease: "Power2",
                    onComplete: () => {
                        businessConcludedText.destroy();
                        this.processResults();
                    },
                });
            },
        });
    }

    processResults() {
        // Calculate final results for each restaurant
        let totalProfit = 0;

        Object.keys(this.playerSprites).forEach((restaurantId) => {
            const restaurantData = this.playerSprites[restaurantId];
            const restaurant = restaurantData.restaurant;

            // Calculate total impact from events
            const totalImpact = restaurantData.events.reduce(
                (sum, event) => sum + event.impact,
                0
            );

            // Apply impact to forecasted profit
            const adjustedProfit = Math.round(
                restaurant.forecastedProfit * (1 + totalImpact)
            );

            // Update restaurant data
            restaurant.actualProfit = adjustedProfit;
            totalProfit += adjustedProfit;
        });

        // Store results for React component to display
        this.gameProgressData = {
            restaurants: this.activeRestaurants,
            totalProfit: totalProfit,
            burnoutChange: Math.floor(Math.random() * 5) - 2, // Random burnout change for demo
            rankChange: Math.random() > 0.6 ? -1 : 0, // 40% chance to improve rank
        };

        // Emit event to signal results are ready
        EventBus.emit("deliveryResultsReady", this.gameProgressData);

        // Wait for the React component to signal when to return to hub
        // Do not automatically proceed to HubScreen
        this.setupReturnToHubListener();
    }

    setupReturnToHubListener() {
        // Listen for return to hub event from React
        EventBus.once("returnToHub", () => {
            console.log("Returning to hub");
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                audioManager.stopMusic();
                this.scene.start("HubScreen");
            });
        });
    }

    update() {
        // Make the pattern scroll diagonally (top-left to bottom-right) but slower than MainMenu
        if (this.noodlesPattern) {
            this.noodlesPattern.tilePositionX += 0.2;
            this.noodlesPattern.tilePositionY += 0.2;
        }

        // Update logic if needed
    }
}

