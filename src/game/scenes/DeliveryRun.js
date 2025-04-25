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

            // Calculate forecasted profit using actual values
            const salesVolume = restaurant.salesVolume || 600;
            const maintenance = restaurant.maintenance || 100;

            const forecastedProfit = Math.round(
                salesVolume - maintenance - staffCost
            );

            console.log(`DeliveryRun: Restaurant ${restaurant.name} (ID: ${restaurant.id}):
                - Sales Volume: ${salesVolume}
                - Maintenance: ${maintenance}
                - Staff Cost: ${staffCost}
                - Forecasted Profit: ${forecastedProfit}`);

            return {
                ...restaurant,
                forecastedProfit,
                staffCost,
                maintenance,
                staff: restaurant.staff || [],
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

            // Staff icons
            if (restaurant.staff && restaurant.staff.length > 0) {
                let staffIconX = 10;
                const staffIconY = y + 50;

                restaurant.staff.forEach((staffId, index) => {
                    // Create staff icon (simple colored circle for now)
                    const staffIcon = this.add.circle(
                        staffIconX + index * 25,
                        staffIconY,
                        10,
                        0x10b981
                    );
                    this.trackGroups[i].add(staffIcon);
                });
            }

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

            // Animate player sprite moving across the track
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

                    // Check if all restaurants are done
                    this.checkRunCompletion();
                },
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

        console.log("DeliveryRun: Processing final results");

        // Get mental clarity buff for burnout calculation if it exists
        const mentalClarityBuff = this.activeBuffs.find(
            (buff) => buff.type === "mentalClarity"
        );
        let burnoutChange = 0;

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

        // Base burnout change based on overall performance
        console.log(
            `DeliveryRun: Total profit across all restaurants: ${totalProfit}`
        );

        if (totalProfit < 0) {
            burnoutChange += 10; // Large burnout increase for overall loss
            console.log("DeliveryRun: Overall loss, adding 10 to burnout");
        } else if (totalProfit > 0) {
            burnoutChange -= 5; // Small burnout decrease for overall profit
            console.log("DeliveryRun: Overall profit, reducing burnout by 5");
        }

        // Apply mental clarity buff if it exists
        if (mentalClarityBuff) {
            const reductionPercent = mentalClarityBuff.value || 0;
            const oldBurnoutChange = burnoutChange;
            burnoutChange = Math.floor(
                burnoutChange * (1 - reductionPercent / 100)
            );
            console.log(
                `DeliveryRun: Mental Clarity buff applied - Burnout change reduced from ${oldBurnoutChange} to ${burnoutChange} (${reductionPercent}% reduction)`
            );
        }

        // Calculate new total balance
        const newTotalBalance =
            this.totalBalance + (totalProfit > 0 ? totalProfit : 0);

        // Calculate new rank based on total balance
        const rankDetails = rankData.rankDetails;
        let newRank = 200; // Default rank (lowest)
        for (const detail of rankDetails) {
            if (newTotalBalance >= detail.balanceRequired) {
                newRank = detail.rank;
                break;
            }
        }

        // Calculate rank change
        const rankChange = Math.max(
            -199,
            Math.min(199, newRank - this.currentRank)
        );
        const finalRank = Math.max(
            1,
            Math.min(200, this.currentRank + rankChange)
        );

        console.log(`DeliveryRun: Final calculations:
            - Current Rank: ${this.currentRank}
            - Total Balance: ${this.totalBalance}
            - New Total Balance: ${newTotalBalance}
            - New Rank: ${newRank}
            - Rank Change: ${rankChange}
            - Final Rank: ${finalRank}
            - Burnout Change: ${burnoutChange}`);

        // Store complete results for React component
        this.gameProgressData = {
            restaurants: this.activeRestaurants,
            totalProfit,
            burnoutChange,
            rankChange: finalRank - this.currentRank,
            activeBuffs: this.activeBuffs,
            newTotalBalance,
            finalRank,
            initialFunds: this.funds,
        };

        // Emit event to signal results are ready
        EventBus.emit("deliveryResultsReady", this.gameProgressData);

        // Wait for the React component to signal when to return to hub
        this.setupReturnToHubListener();
    }

    setupReturnToHubListener() {
        // Listen for return to hub event from React
        EventBus.once("returnToHub", (results) => {
            console.log("DeliveryRun: Returning to hub");

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
            };

            console.log(
                "DeliveryRun: Preparing to transition to HubScreen with results:",
                finalResults
            );

            // Stop music
            audioManager.stopMusic();

            // Reset important variables
            this.activeRestaurants = [];
            this.playerSprites = {};
            this.events = {};
            this.finished = false;
            this.started = false;

            // Fade out and transition to HubScreen
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                // Make sure we're still in this scene before transitioning
                if (this.scene.isActive()) {
                    this.scene.stop();
                    this.scene.start("HubScreen");
                }
            });
        });
    }

    update() {}
}

