import Phaser from "phaser";
import { EventBus } from "../EventBus";
import { audioManager } from "../AudioManager";
import gameState from "../GameState";
import rankData from "../../data/rank.json";

export class DeliveryRun extends Phaser.Scene {
    constructor() {
        super("DeliveryRun");
        this.activeRestaurants = [];
        this.playerSprites = {};
        this.events = {};
        this.finished = false;
        this.started = false;
        this.activeBuffs = [];
        this.deliveryFlowBuff = null;
        this.particles = null;
    }

    init(data) {
        console.log("DeliveryRun: Initializing with data:", data);

        // Store the initial data for later use
        this.initialData = data;

        // Process restaurant data to get complete info
        this.activeRestaurants = data.restaurants.map((restaurant) => {
            // Calculate staff cost from actual employee data
            const staffCost = restaurant.staff.reduce((total, staffId) => {
                const employee = data.employees.find(
                    (emp) => emp.id === staffId
                );
                return total + (employee?.salary || 0);
            }, 0);

            // Calculate average employee morale for this restaurant
            let totalMorale = 0;
            let staffCount = 0;
            let averageMorale = 0;

            if (restaurant.staff && restaurant.staff.length > 0) {
                restaurant.staff.forEach((staffId) => {
                    const employee = data.employees.find(
                        (emp) => emp.id === staffId
                    );
                    if (employee && typeof employee.morale === "number") {
                        totalMorale += employee.morale;
                        staffCount++;
                    }
                });

                if (staffCount > 0) {
                    averageMorale = Math.round(totalMorale / staffCount);
                }
            }

            // Calculate sales volume adjustment based on morale
            let moraleAdjustment = 0;
            if (averageMorale >= 80) {
                moraleAdjustment = 0.05; // +5% for high morale
            } else if (averageMorale <= 30) {
                moraleAdjustment = -0.05; // -5% for low morale
            }

            // Apply morale adjustment to sales volume
            const baseVolume = restaurant.salesVolume || 600;
            const adjustedSalesVolume = Math.round(
                baseVolume * (1 + moraleAdjustment)
            );

            // Calculate forecasted profit using actual values with morale adjustment
            const maintenance = restaurant.maintenance || 100;
            const forecastedProfit = Math.round(
                adjustedSalesVolume - maintenance - staffCost
            );

            console.log(`DeliveryRun: Restaurant ${restaurant.name} (ID: ${
                restaurant.id
            }):
                - Base Sales Volume: ${baseVolume}
                - Average Morale: ${averageMorale}%
                - Morale Adjustment: ${moraleAdjustment >= 0 ? "+" : ""}${(
                moraleAdjustment * 100
            ).toFixed(0)}%
                - Adjusted Sales Volume: ${adjustedSalesVolume}
                - Maintenance: ${maintenance}
                - Staff Cost: ${staffCost}
                - Forecasted Profit: ${forecastedProfit}`);

            return {
                ...restaurant,
                forecastedProfit,
                staffCost,
                maintenance,
                staff: restaurant.staff || [],
                averageMorale,
                baseVolume,
                adjustedSalesVolume,
                moraleAdjustment,
            };
        });

        // Store player stats
        this.playerStats = data.playerStats;
        this.funds = data.finances.funds;
        this.currentPeriod = data.currentPeriod;
        this.totalBalance = data.finances.totalBalance;
        this.currentRank = data.playerStats.currentRank;

        // Initialize game progress data object
        this.gameProgressData = {};

        // Get active buffs from GameState
        this.activeBuffs = gameState.getActiveBuffs() || [];

        // Check specifically for delivery flow buff
        this.deliveryFlowBuff = this.activeBuffs.find(
            (buff) => buff.type === "deliveryFlow"
        );

        console.log("DeliveryRun: Initialized with", {
            restaurants: this.activeRestaurants.length,
            playerStats: this.playerStats,
            funds: this.funds,
            currentPeriod: this.currentPeriod,
            buffs: this.activeBuffs.length,
        });
    }

    preload() {
        // Load delivery run assets if not already loaded
        if (!this.textures.exists("player_sprite")) {
            this.load.image(
                "player_sprite",
                "assets/deliveryrun/player_sprite.png"
            );
        }

        this.load.image(
            "background_run",
            "assets/deliveryrun/background_run.png"
        );

        this.load.image(
            "event_positive",
            "assets/deliveryrun/event_positive.png"
        );
        this.load.image(
            "event_negative",
            "assets/deliveryrun/event_negative.png"
        );

        // Load particle texture
        this.load.image("particle", "assets/hub/particle.png");

        // Add Google Roboto Condensed font
        if (document.fonts) {
            const fontLink = document.createElement("link");
            fontLink.href =
                "https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap";
            fontLink.rel = "stylesheet";
            document.head.appendChild(fontLink);
        }
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

        // Add repeating noodles pattern with diagonal scrolling (more subtle)
        this.backgroundRun = this.add
            .tileSprite(0, 0, width, height, "background_run")
            .setOrigin(0)
            .setAlpha(0.9); // More transparent than MainMenu for subtlety

        // Create particle manager - using the correct API
        this.particles = this.add.particles();

        // Set up layout for restaurant tracks
        this.setupLayout();

        // Create fade-in effect
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // After a brief delay, show "Business Open" text
        this.time.delayedCall(500, () => {
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

            // Restaurant info panel (left side) - nicer background with gradient
            const infoPanelWidth = width * 0.2;

            // Check if gradient texture already exists and destroy it if needed
            const gradientKey = "gradient" + i;
            if (this.textures.exists(gradientKey)) {
                this.textures.remove(gradientKey);
            }

            // Create a gradient info panel background using principalRed colors
            const gradientTexture = this.textures.createCanvas(
                gradientKey,
                infoPanelWidth,
                trackHeight
            );

            // Check if canvas was created successfully before using getContext
            if (gradientTexture && gradientTexture.getContext) {
                const context = gradientTexture.getContext();
                const grd = context.createLinearGradient(
                    0,
                    0,
                    infoPanelWidth,
                    0
                );

                grd.addColorStop(0, "#312218"); // principalBrown
                grd.addColorStop(1, "#a02515"); // principalRed

                context.fillStyle = grd;
                context.fillRect(0, 0, infoPanelWidth, trackHeight);

                gradientTexture.refresh();
            } else {
                console.error(`Failed to create canvas for gradient${i}`);
                continue; // Skip to next restaurant if canvas creation failed
            }

            const infoPanel = this.add.image(0, y, gradientKey).setOrigin(0, 0);

            this.trackGroups[i].add(infoPanel);

            // Add a subtle header/border at the top of the panel
            const panelHeader = this.add
                .rectangle(0, y, infoPanelWidth, 6, 0x312218)
                .setOrigin(0);
            this.trackGroups[i].add(panelHeader);

            // Restaurant name - using Roboto Condensed
            const restaurantName = this.add.text(16, y + 16, restaurant.name, {
                fontFamily: "'Roboto Condensed', Arial, sans-serif",
                fontSize: "20px",
                fontWeight: "bold",
                fill: "#ffffff",
                stroke: "#000000",
                strokeThickness: 2,
            });
            this.trackGroups[i].add(restaurantName);

            // Staff icons - aligned with the restaurant name
            if (restaurant.staff && restaurant.staff.length > 0) {
                const staffIconX = 24; // Aligned better with title
                const staffIconY = y + 52; // Positioned below the title with spacing

                restaurant.staff.forEach((staffId, index) => {
                    // Create staff icon with better visuals
                    const staffIcon = this.add.circle(
                        staffIconX + index * 19,
                        staffIconY,
                        6,
                        0x10b981
                    );

                    // Add stroke to staff icon
                    staffIcon.setStrokeStyle(1, 0xffffff);

                    this.trackGroups[i].add(staffIcon);
                });

                // Add morale indicator next to staff icons
                let moraleColor = 0x10b981; // Default green
                if (restaurant.averageMorale <= 30) {
                    moraleColor = 0xef4444; // Red for low morale
                } else if (restaurant.averageMorale < 70) {
                    moraleColor = 0xf59e0b; // Amber for medium morale
                }

                // Create morale display background
                const moraleX = staffIconX + restaurant.staff.length * 19 + 15;
                const moraleY = staffIconY;

                const moraleBg = this.add
                    .rectangle(moraleX, moraleY, 40, 16, 0x000000)
                    .setAlpha(0.3);

                moraleBg.setStrokeStyle(1, moraleColor, 0.8);
                this.trackGroups[i].add(moraleBg);

                // Add morale text
                const moraleText = this.add
                    .text(moraleX, moraleY, `${restaurant.averageMorale}%`, {
                        fontFamily: "'Roboto Condensed', Arial, sans-serif",
                        fontSize: "13px",
                        fontWeight: "bold",
                        fill: "#ffffff",
                    })
                    .setOrigin(0.5);

                this.trackGroups[i].add(moraleText);

                // Add small icon to indicate morale effect
                if (restaurant.moraleAdjustment !== 0) {
                    const effectIcon = this.add
                        .text(
                            moraleX + 25,
                            moraleY,
                            restaurant.moraleAdjustment > 0 ? "↑" : "↓",
                            {
                                fontSize: "12px",
                                fontWeight: "bold",
                                fill:
                                    restaurant.moraleAdjustment > 0
                                        ? "#10b981"
                                        : "#ef4444",
                            }
                        )
                        .setOrigin(0.5);
                    this.trackGroups[i].add(effectIcon);
                }
            }

            // Forecasted profit label
            const forecastedLabel = this.add.text(
                16,
                y + trackHeight - 48,
                "Forecasted profit:",
                {
                    fontFamily: "'Roboto Condensed', Arial, sans-serif",
                    fontSize: "12px",
                    fill: "#cbd5e1",
                }
            );
            this.trackGroups[i].add(forecastedLabel);

            // Restaurant profit/loss with smaller font
            const profitText = this.add.text(
                16,
                y + trackHeight - 30,
                `¥${restaurant.forecastedProfit.toLocaleString()}`,
                {
                    fontFamily: "'Roboto Condensed', Arial, sans-serif",
                    fontSize: "14px",
                    fontWeight: "bold",
                    fill:
                        restaurant.forecastedProfit >= 0
                            ? "#4ade80"
                            : "#ef4444",
                    stroke: "#000000",
                    strokeThickness: 1,
                }
            );
            this.trackGroups[i].add(profitText);

            // Progress bar track - improved style with rounded corners
            const trackBarBg = this.add
                .rectangle(
                    infoPanelWidth,
                    y + trackHeight - 20,
                    width - infoPanelWidth,
                    trackHeight * 0.35,
                    0x333333
                )
                .setAlpha(0.8)
                .setOrigin(0, 0.5);

            this.trackGroups[i].add(trackBarBg);

            // Progress bar (will be animated) - improved appearance with rounded ends
            const progressBar = this.add
                .rectangle(
                    infoPanelWidth + 10,
                    y + trackHeight / 2,
                    0, // Initial width is 0
                    trackHeight * 0.35,
                    0x10b981
                )
                .setOrigin(0, 0.5);

            progressBar.displayWidth = 0;
            this.trackGroups[i].add(progressBar);

            // Player sprite with particle effects
            const playerSprite = this.add.sprite(
                infoPanelWidth + 30,
                y + trackHeight / 2,
                "player_sprite"
            );
            playerSprite.setScale(1.5);
            this.trackGroups[i].add(playerSprite);

            // Create smoke-like particle trail behind the scooter
            const particleTrail = this.add
                .particles(
                    playerSprite.x,
                    playerSprite.y + 10, // Start from lower position (exhaust position)
                    "particle",
                    {
                        speed: { min: 30, max: 80 },
                        scale: { start: 0.2, end: 0.05 },
                        alpha: { start: 0.7, end: 0 },
                        lifespan: 800,
                        blendMode: "ADD",
                        frequency: 30,
                        tint: [0xcccccc, 0xaaaaaa, 0x999999], // Gray smoke colors
                        angle: { min: 160, max: 200 }, // Emit mostly leftward
                        quantity: 2,
                    }
                )
                .setDepth(9); // Set below sprite

            // Make particles follow the sprite
            this.tweens.add({
                targets: particleTrail,
                x: function () {
                    return playerSprite.x - 35;
                },
                y: function () {
                    return playerSprite.y + 30;
                }, // Keep at exhaust level
                duration: 0,
                ease: "Linear",
                repeat: -1,
            });

            // Add subtle pulsing animation to player sprite (less bouncy)
            this.tweens.add({
                targets: playerSprite,
                scaleX: 1.55, // Less extreme scale
                scaleY: 1.55, // Less extreme scale
                duration: 1200, // Slower pulsing
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut",
            });

            // Store references for animations
            this.playerSprites[restaurant.id] = {
                sprite: playerSprite,
                progressBar: progressBar,
                particleTrail: particleTrail,
                maxX: width - 50,
                restaurant: restaurant,
                events: [],
                active: true,
            };
        }

        // Setup inactive restaurant tracks (greyed out)
        for (let i = this.activeRestaurants.length; i < 5; i++) {
            const y = this.tracksArea.y + i * trackHeight;

            // Inactive restaurant placeholder with improved styling
            const inactiveText = this.add
                .text(
                    width / 2,
                    y + trackHeight / 2,
                    "Restaurant slot not purchased",
                    {
                        fontFamily: "'Roboto Condensed', Arial, sans-serif",
                        fontSize: "16px",
                        fill: "#94a3b8",
                        stroke: "#0f172a",
                        strokeThickness: 2,
                    }
                )
                .setOrigin(0.5);

            this.trackGroups[i].add(inactiveText);
        }
    }

    showBusinessOpen() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create arcade-style container to hold the text
        const container = this.add.container(width * 1.5, height / 2); // Start further off-screen

        // Add a shadow to the text
        const shadow = this.add
            .text(4, 4, "Business OPEN", {
                fontFamily: "'Roboto Condensed', Arial, sans-serif",
                fontSize: "64px",
                fontWeight: "bold",
                fill: "#000000",
                alpha: 0.3,
            })
            .setOrigin(0.5);

        // Add outer glow text (larger version with principalRed color)
        const glowText = this.add
            .text(0, 0, "Business OPEN", {
                fontFamily: "'Roboto Condensed', Arial, sans-serif",
                fontSize: "67px",
                fontWeight: "bold",
                fill: "#cf3e41", // principalRed-light
                alpha: 0.6,
                stroke: "#a02515", // principalRed
                strokeThickness: 12,
            })
            .setOrigin(0.5);

        // Show "Business Open" text with arcade-style animation
        const businessOpenText = this.add
            .text(0, 0, "Business OPEN", {
                fontFamily: "'Roboto Condensed', Arial, sans-serif",
                fontSize: "64px",
                fontWeight: "bold",
                fill: "#ffffff",
                stroke: "#a02515", // principalRed
                strokeThickness: 8,
            })
            .setOrigin(0.5);

        // Add all to the container
        container.add(shadow);
        container.add(glowText);
        container.add(businessOpenText);

        // Text animation - faster, more dynamic arcade style
        this.tweens.add({
            targets: container,
            x: width / 2,
            duration: 600, // Faster (was 1000)
            ease: "Back.easeOut", // More "springy" effect
            onComplete: () => {
                // More aggressive pulse effect
                this.tweens.add({
                    targets: [businessOpenText, glowText],
                    scaleX: 1.2, // Slightly larger pulse
                    scaleY: 1.2,
                    yoyo: true,
                    repeat: 1,
                    duration: 150, // Faster pulse (was 200)
                    ease: "Sine.easeInOut",
                });

                // After a shorter delay, zoom out with rotation
                this.time.delayedCall(1000, () => {
                    // Shorter delay (was 1500)
                    this.tweens.add({
                        targets: container,
                        x: -width / 2, // Exit further left
                        scale: 0.8, // Add scale reduction
                        angle: -5, // Add slight rotation for more dynamic exit
                        duration: 500, // Faster exit (was 800)
                        ease: "Power2",
                        onComplete: () => {
                            container.destroy();
                            this.startDeliveryRun();
                        },
                    });
                });
            },
        });
    }

    startDeliveryRun() {
        this.started = true;

        // Start animations for each restaurant
        Object.keys(this.playerSprites).forEach((restaurantId) => {
            const restaurantData = this.playerSprites[restaurantId];

            // Animate player sprite moving across the track with enhanced movement
            this.tweens.add({
                targets: restaurantData.sprite,
                x: restaurantData.maxX,
                duration: Phaser.Math.Between(5000, 8000), // Random duration between 5 and 8 seconds
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

                    // Stop the particle trail
                    if (restaurantData.particleTrail) {
                        restaurantData.particleTrail.stop();
                        restaurantData.particleTrail.destroy();
                    }

                    // Check if all restaurants are done
                    this.checkRunCompletion();
                },
            });

            // Add bouncy Y movement to make the sprite more alive (less bouncy)
            this.tweens.add({
                targets: restaurantData.sprite,
                y: restaurantData.sprite.y - 2, // Smaller bounce (was -5)
                duration: 500, // Slightly slower
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut",
            });
        });

        // Set a backup timer in case there are no active restaurants
        if (Object.keys(this.playerSprites).length === 0) {
            this.time.delayedCall(2000, () => {
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
        const checkpoints = [0.2, 0.4, 0.6];

        checkpoints.forEach((checkpoint) => {
            // Check if we're close to a checkpoint and haven't triggered an event there yet
            if (
                Math.abs(progress - checkpoint) < 0.01 &&
                !restaurantData.events.some(
                    (e) => Math.abs(e.progress - checkpoint) < 0.05
                )
            ) {
                // Apply Delivery Flow buff if it exists
                let positiveChance = 0.6; // Base 60% chance for positive event

                if (this.deliveryFlowBuff) {
                    // Reduce chance of negative events based on buff level
                    const reductionPercent = this.deliveryFlowBuff.value || 0;
                    positiveChance = Math.min(
                        0.95,
                        positiveChance + reductionPercent / 100
                    );
                    console.log(
                        `DeliveryRun: DeliveryFlow buff applied - Positive event chance increased to ${positiveChance.toFixed(
                            2
                        )} (${reductionPercent}% reduction in negative events)`
                    );
                }

                // Determine if the event is positive or negative
                const isPositive = Math.random() < positiveChance;

                // Create event data
                let impactValue;
                if (isPositive) {
                    // Positive impacts range from +5% to +20%
                    impactValue = 0.05 + Math.random() * 0.15;
                } else {
                    // Negative impacts range from -5% to -15%
                    impactValue = -(0.05 + Math.random() * 0.1);

                    // Apply penalty reduction if buff has special ability
                    if (
                        this.deliveryFlowBuff &&
                        this.deliveryFlowBuff.special === "penaltyReduction"
                    ) {
                        const oldImpact = impactValue;
                        impactValue *= 1 - this.deliveryFlowBuff.value / 100;
                        console.log(
                            `DeliveryRun: Penalty reduction applied - Impact reduced from ${oldImpact.toFixed(
                                2
                            )} to ${impactValue.toFixed(2)} (${
                                this.deliveryFlowBuff.value
                            }% reduction)`
                        );
                    }
                }

                const eventMessage = this.getRandomEventMessage(isPositive);

                const eventData = {
                    progress: checkpoint,
                    positive: isPositive,
                    message: eventMessage,
                    impact: impactValue,
                };

                console.log(`DeliveryRun: Event generated for restaurant ${
                    restaurantData.restaurant.name
                } at ${(checkpoint * 100).toFixed(0)}%:
                    - Type: ${isPositive ? "Positive" : "Negative"}
                    - Message: ${eventMessage}
                    - Impact: ${(impactValue * 100).toFixed(2)}%
                    - Forecasted Effect: ${Math.round(
                        restaurantData.restaurant.forecastedProfit * impactValue
                    )}`);

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
            "Food critic gave a thumbs up!",
            "Staff working efficiently!",
            "Extended hours going well!",
            "Delivery service is popular!",
            "Customer shared on social media!",
        ];

        const negativeMessages = [
            "A power outage hit the region!",
            "Kitchen mishap!",
            "Delivery delayed!",
            "Supplier sent wrong ingredients!",
            "Staff called in sick!",
            "Refrigerator malfunction!",
            "Plumbing issue in kitchen!",
            "Bad weather reduced customers!",
            "Competing restaurant opened nearby!",
            "Price of ingredients increased!",
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
                fontFamily: "'Roboto Condensed', Arial, sans-serif",
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
                    fontFamily: "'Roboto Condensed', Arial, sans-serif",
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

        // Create arcade-style container to hold the text
        const container = this.add.container(width * 1.5, height / 2); // Start further off-screen

        // Add a shadow to the text
        const shadow = this.add
            .text(4, 4, "Business Concluded", {
                fontFamily: "'Roboto Condensed', Arial, sans-serif",
                fontSize: "64px",
                fontWeight: "bold",
                fill: "#000000",
                alpha: 0.3,
            })
            .setOrigin(0.5);

        // Add outer glow text (larger version with principalRed color)
        const glowText = this.add
            .text(0, 0, "Business Concluded", {
                fontFamily: "'Roboto Condensed', Arial, sans-serif",
                fontSize: "67px",
                fontWeight: "bold",
                fill: "#cf3e41", // principalRed-light
                alpha: 0.6,
                stroke: "#a02515", // principalRed
                strokeThickness: 12,
            })
            .setOrigin(0.5);

        // Show "Business Concluded" text with arcade-style animation
        const businessConcludedText = this.add
            .text(0, 0, "Business Concluded", {
                fontFamily: "'Roboto Condensed', Arial, sans-serif",
                fontSize: "64px",
                fontWeight: "bold",
                fill: "#ffffff",
                stroke: "#a02515", // principalRed
                strokeThickness: 8,
            })
            .setOrigin(0.5);

        // Add all to the container
        container.add(shadow);
        container.add(glowText);
        container.add(businessConcludedText);

        // Text animation - faster, more dynamic arcade style
        this.tweens.add({
            targets: container,
            x: width / 2,
            duration: 600, // Faster (was 1000)
            ease: "Back.easeOut", // More "springy" effect
            onComplete: () => {
                // More aggressive pulse effect
                this.tweens.add({
                    targets: [businessConcludedText, glowText],
                    scaleX: 1.2, // Slightly larger pulse
                    scaleY: 1.2,
                    yoyo: true,
                    repeat: 2,
                    duration: 150, // Faster pulse (was 200)
                    ease: "Sine.easeInOut",
                });

                // After a shorter delay, zoom out with rotation
                this.time.delayedCall(1500, () => {
                    // Shorter delay (was 2000)
                    this.tweens.add({
                        targets: container,
                        x: -width / 2, // Exit further left
                        scale: 0.8, // Add scale reduction
                        angle: -5, // Add slight rotation for more dynamic exit
                        duration: 500, // Faster exit (was 800)
                        ease: "Power2",
                        onComplete: () => {
                            container.destroy();
                            this.processResults();
                        },
                    });
                });
            },
        });
    }

    processResults() {
        // Calculate final results for each restaurant
        let totalProfit = 0;

        console.log("DeliveryRun: Processing final results");

        // Get mental clarity buff for burnout calculation if it exists
        const mentalClarityBuff = this.activeBuffs.find(
            (buff) => buff.type === "mentalClarity"
        );
        let burnoutChange = 0; // Initialize burnout change

        Object.keys(this.playerSprites).forEach((restaurantId) => {
            const restaurantData = this.playerSprites[restaurantId];
            const restaurant = restaurantData.restaurant;

            // Calculate total impact from events
            const totalImpact = restaurantData.events.reduce(
                (sum, event) => sum + event.impact,
                0
            );

            // Apply impact to forecasted profit
            const rawProfit = restaurant.forecastedProfit;
            const impactAmount = Math.round(rawProfit * totalImpact);
            const adjustedProfit = rawProfit + impactAmount;

            console.log(`DeliveryRun: Final profit calculation for ${
                restaurant.name
            }:
                - Base forecasted profit: ${rawProfit}
                - Total event impact: ${(totalImpact * 100).toFixed(2)}%
                - Impact amount: ${impactAmount}
                - Final adjusted profit: ${adjustedProfit}`);

            // Update restaurant data
            restaurant.actualProfit = adjustedProfit;
            restaurant.events = restaurantData.events;
            totalProfit += adjustedProfit;
        });

        // --- New Burnout Logic ---
        console.log(
            `DeliveryRun: Total profit across all restaurants: ${totalProfit}`
        );

        // Apply burnout: +10 for profit, +30 for loss
        burnoutChange = totalProfit > 0 ? 10 : 30;
        console.log(
            `DeliveryRun: Base burnout change based on profit: ${burnoutChange}`
        );

        // Apply mental clarity buff if it exists
        if (mentalClarityBuff) {
            const reductionPercent = mentalClarityBuff.value || 0;
            const oldBurnoutChange = burnoutChange;
            // Apply reduction - ensuring it doesn't make burnout negative
            burnoutChange = Math.max(
                0,
                Math.floor(burnoutChange * (1 - reductionPercent / 100))
            );
            console.log(
                `DeliveryRun: Mental Clarity buff applied - Burnout change reduced from ${oldBurnoutChange} to ${burnoutChange} (${reductionPercent}% reduction)`
            );
        }

        // Calculate new total balance
        // Use totalBalance from init data, not recalculated here
        const currentTotalBalance = this.totalBalance || 0;
        const newTotalBalance = currentTotalBalance + totalProfit; // Add the net profit/loss to the balance

        // Calculate new rank based on total balance
        const rankDetails = rankData.rankDetails;
        let newRank = 200; // Default rank (lowest)
        for (const detail of rankDetails) {
            // Find the highest rank threshold the new balance meets
            if (newTotalBalance >= detail.balanceRequired) {
                newRank = detail.rank;
            } else {
                // Stop checking once a threshold isn't met (ranks are sorted)
                break;
            }
        }

        // Calculate the final rank ensuring it's within bounds [1, 200]
        const finalRank = Math.max(1, Math.min(200, newRank));

        console.log(`DeliveryRun: Final calculations:
            - Current Rank (Start of Run): ${this.currentRank}
            - Current Total Balance (Start of Run): ${currentTotalBalance}
            - Total Profit/Loss This Run: ${totalProfit}
            - New Total Balance (End of Run): ${newTotalBalance}
            - Calculated New Rank: ${finalRank}
            - Final Burnout Change This Run: ${burnoutChange}`);

        // Store complete results for React component
        this.gameProgressData = {
            restaurants: this.activeRestaurants,
            totalProfit,
            burnoutChange, // Use the final calculated burnout change
            rankChange: finalRank - this.currentRank, // Calculate rank change based on finalRank
            activeBuffs: this.activeBuffs,
            newTotalBalance, // Pass the calculated new total balance
            finalRank, // Pass the final calculated rank
            initialFunds: this.funds, // Pass initial funds for reference
        };

        // Emit event to signal results are ready
        EventBus.emit("deliveryResultsReady", this.gameProgressData);

        // Wait for the React component to signal when to return to hub
        this.setupReturnToHubListener();
    }

    setupReturnToHubListener() {
        // Listen for return to hub event from React
        EventBus.once("returnToHub", (results) => {
            console.log(
                "DeliveryRun: Returning to hub event received with results:",
                results
            );

            // Store the final results in a variable for logging only
            const finalResults = {
                totalProfit:
                    results.totalProfit || this.gameProgressData.totalProfit,
                rankChange:
                    results.rankChange || this.gameProgressData.rankChange || 0,
                burnoutChange:
                    results.burnoutChange ||
                    this.gameProgressData.burnoutChange,
                restaurants: results.restaurants || this.activeRestaurants,
                // Ensure message is included if present
                message: results.message || null,
            };

            console.log(
                "DeliveryRun: Preparing to transition to HubScreen with results:",
                finalResults
            );

            // Stop music
            audioManager.stopMusic();

            // Destroy all particle emitters
            if (this.particles) {
                this.particles.destroy();
                this.particles = null;
            }

            // Clean up all restaurant track data and destroy sprites
            Object.keys(this.playerSprites).forEach((restaurantId) => {
                const restaurantData = this.playerSprites[restaurantId];
                if (restaurantData.particleTrail) {
                    restaurantData.particleTrail.destroy();
                }
                if (restaurantData.sprite) {
                    restaurantData.sprite.destroy();
                }
                if (restaurantData.progressBar) {
                    restaurantData.progressBar.destroy();
                }
            });

            // Clear all track groups
            if (this.trackGroups) {
                this.trackGroups.forEach((group) => {
                    group.clear(true, true); // Destroy children
                });
            }

            // Clean up all canvas textures
            for (let i = 0; i < 5; i++) {
                const gradientKey = "gradient" + i;
                if (this.textures.exists(gradientKey)) {
                    this.textures.remove(gradientKey);
                }
            }

            // Reset important variables
            this.activeRestaurants = [];
            this.playerSprites = {};
            this.events = {};
            this.finished = false;
            this.started = false;

            // Fade out and transition to HubScreen, passing results
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                // Make sure we're still in this scene before transitioning
                if (this.scene.isActive()) {
                    this.scene.stop();
                    // Ensure proper cleanup happens by removing event listeners
                    EventBus.removeAllListeners("deliveryResultsReady");
                    // Pass the finalResults object to HubScreen's init method
                    this.scene.start("HubScreen", { results: finalResults });
                }
            });
        });
    }

    update() {}
}

