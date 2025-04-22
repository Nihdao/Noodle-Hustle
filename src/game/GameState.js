/**
 * GameState.js
 * Centralizes game state management and provides an API for game components
 */

import { EventBus } from "./EventBus";
import {
    createNewGameSave,
    loadGame,
    saveGame,
    loadSettings,
    saveSettings,
    hasSaveGame,
    createBackup,
    STORAGE_KEYS,
} from "../localStorage/storageManager";
import confidantsData from "../data/confidants.json";
import buffsData from "../data/buffs.json";

class GameState {
    constructor() {
        this.events = EventBus;
        this.state = null;
        this.settings = null;
        this.initialized = false;

        // Listen for return to hub event to increment period
        this.events.on("returnToHub", () => {
            if (this.initialized) {
                this.startPeriod();
            }
        });
    }

    /**
     * Initialize game state - either load from localStorage or create new
     * @param {boolean} forceNew - Force new game creation even if save exists
     * @returns {Object} Current game state
     */
    initialize(forceNew = false) {
        // Load settings first
        this.settings = loadSettings();

        // Load or create game state
        if (!forceNew && hasSaveGame()) {
            this.state = loadGame();
        } else {
            const playerName =
                localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || "Player";
            this.state = createNewGameSave(playerName);
        }

        this.initialized = true;
        this.events.emit("gameStateUpdated", this.getGameState());
        return this.state;
    }

    /**
     * Get current game state (public method)
     * @returns {Object} Current game state
     */
    getGameState() {
        if (!this.initialized) {
            this.initialize();
        }
        return this.state;
    }

    /**
     * Save current game state to localStorage
     * @param {boolean} createBackupCopy - Whether to create a backup
     * @returns {boolean} Success status
     */
    saveGameState(createBackupCopy = false) {
        if (!this.initialized) return false;

        if (createBackupCopy) {
            createBackup();
        }

        const success = saveGame(this.state);
        return success;
    }

    /**
     * Update game state and notify listeners
     * @param {Object|Function} updater - Object to merge or function to transform state
     */
    updateGameState(updater) {
        if (!this.initialized) {
            this.initialize();
        }

        if (typeof updater === "function") {
            this.state = updater(this.state);
        } else {
            this.state = {
                ...this.state,
                ...updater,
            };
        }

        // Notify listeners that state has changed
        this.events.emit("gameStateUpdated", this.state);
    }

    /**
     * Start a new game period
     */
    startPeriod() {
        if (!this.initialized) {
            this.initialize();
        }

        // Create a backup before period starts
        if (this.settings.gameplay.autosaveEnabled) {
            const currentPeriod = this.state.gameProgress.currentPeriod;
            if (currentPeriod % this.settings.gameplay.autosaveInterval === 0) {
                this.saveGameState(true);
            }
        }

        // TODO: Implement period calculations, profit calculations, and events
        // This is a placeholder to be expanded with actual gameplay logic

        this.updateGameState((state) => {
            // Increment period
            const newPeriod = state.gameProgress.currentPeriod + 1;

            // Decrease investor clash countdown
            let investorClashIn = state.gameProgress.investorClashIn - 1;

            // Handle investor meeting when countdown reaches zero
            if (investorClashIn <= 0) {
                // Reset countdown
                investorClashIn = 10;

                // Trigger investor meeting (to be implemented)
                // For now, just setting a flag
                this.events.emit("investorMeeting", newPeriod);
            }

            return {
                ...state,
                gameProgress: {
                    ...state.gameProgress,
                    currentPeriod: newPeriod,
                    investorClashIn,
                },
                // Update other state properties as needed
            };
        });

        // Notify that period has started
        const currentPeriod = this.state.gameProgress.currentPeriod;
        this.events.emit("periodStarted", currentPeriod);

        // Emit an event to update music based on period number
        this.events.emit("updatePeriodMusic", currentPeriod);
    }

    /**
     * Process delivery run results and update game state
     * @param {Object} results - Results from the delivery run
     * @returns {Object} Updated game state
     */
    processDeliveryResults(results) {
        if (!this.initialized) {
            this.initialize();
        }

        // Extract relevant data from results
        const { totalProfit = 0, rankChange = 0 } = results;

        this.updateGameState((state) => {
            // Update finances
            const updatedFunds = state.finances.funds + totalProfit;

            // Update business rank
            const currentRank = state.gameProgress.businessRank || 200;
            const newRank = Math.max(
                1,
                Math.min(200, currentRank + rankChange)
            );

            // Update burnout based on rank change and profit
            let burnoutChange = 0;
            if (rankChange < 0) {
                // Rank improved (lower number is better)
                burnoutChange = -10; // Reduce burnout when rank improves
            } else if (rankChange > 0 || totalProfit < 0) {
                burnoutChange = 30; // Increase burnout if rank worsens or losing money
            } else {
                burnoutChange = 5; // Small burnout increase for maintaining rank
            }

            // Apply burnout modifiers from buffs
            const mentalClarityBuff = this.getBuffLevel("mentalClarity");
            if (mentalClarityBuff > 0) {
                const reductionPercent =
                    mentalClarityBuff === 5 ? 25 : mentalClarityBuff * 5;
                burnoutChange = Math.floor(
                    burnoutChange * (1 - reductionPercent / 100)
                );
            }

            // Ensure burnout stays within 0-100 range
            const updatedBurnout = Math.max(
                0,
                Math.min(100, state.playerStats.burnout + burnoutChange)
            );

            return {
                ...state,
                finances: {
                    ...state.finances,
                    funds: updatedFunds,
                    // Add to income history if positive, expense history if negative
                    incomeHistory:
                        totalProfit > 0
                            ? [
                                  ...state.finances.incomeHistory,
                                  {
                                      amount: totalProfit,
                                      source: "Restaurant Profits",
                                      period: state.gameProgress.currentPeriod,
                                  },
                              ]
                            : state.finances.incomeHistory,
                    expensesHistory:
                        totalProfit < 0
                            ? [
                                  ...state.finances.expensesHistory,
                                  {
                                      amount: -totalProfit,
                                      source: "Restaurant Losses",
                                      period: state.gameProgress.currentPeriod,
                                  },
                              ]
                            : state.finances.expensesHistory,
                },
                gameProgress: {
                    ...state.gameProgress,
                    businessRank: newRank,
                    // Store rank history
                    rankHistory: [
                        ...(state.gameProgress.rankHistory || []),
                        {
                            period: state.gameProgress.currentPeriod,
                            rank: newRank,
                        },
                    ],
                },
                playerStats: {
                    ...state.playerStats,
                    burnout: updatedBurnout,
                    burnoutHistory: [
                        ...(state.playerStats.burnoutHistory || []),
                        {
                            period: state.gameProgress.currentPeriod,
                            burnout: updatedBurnout,
                        },
                    ],
                },
            };
        });

        // Emit event for delivery results processed
        this.events.emit("deliveryResultsProcessed", {
            profit: totalProfit,
            rankChange,
            burnout: this.state.playerStats.burnout,
        });

        return this.state;
    }

    /**
     * Resolve personal time and check for confidant encounters
     * @returns {Object} Encounter result or null if no encounter
     */
    resolvePersonalTime() {
        if (!this.initialized) {
            this.initialize();
        }

        const { personalTime } = this.state.social;
        const currentPeriod = this.state.gameProgress.currentPeriod;

        let encounterResult = null;

        // Update state based on personal time location
        this.updateGameState((state) => {
            // Add to history regardless of location
            const updatedHistory = [
                ...(state.social.personalTime.history || []),
                {
                    period: currentPeriod,
                    location: personalTime.planned,
                },
            ];

            // If Home was chosen, reduce burnout by 10%
            let burnoutUpdate = state.playerStats.burnout;
            if (personalTime.planned === "Home") {
                burnoutUpdate = Math.max(0, burnoutUpdate - 10);
            }

            return {
                ...state,
                social: {
                    ...state.social,
                    personalTime: {
                        ...state.social.personalTime,
                        history: updatedHistory,
                        // Reset to Home as default for next period
                        planned: "Home",
                    },
                },
                playerStats: {
                    ...state.playerStats,
                    burnout: burnoutUpdate,
                },
            };
        });

        // Handle confidant encounters if not at Home
        if (personalTime.planned !== "Home") {
            encounterResult = this.checkConfidantEncounter(
                personalTime.planned,
                currentPeriod
            );
        }

        return {
            location: personalTime.planned,
            encounter: encounterResult,
        };
    }

    /**
     * Check if a confidant is encountered at the specified location
     * @param {string} location - The location visited
     * @param {number} period - Current game period
     * @returns {Object|null} Encounter information or null if no encounter
     */
    checkConfidantEncounter(location, period) {
        // Find confidants who can appear at this location
        const possibleConfidants = confidantsData.confidants.filter(
            (confidant) =>
                confidant.location === location &&
                period >= confidant.firstAppearance &&
                (period - confidant.firstAppearance) % confidant.frequency === 0
        );

        if (possibleConfidants.length === 0) {
            return null;
        }

        // 50% chance of meeting someone if conditions are met
        const encounterRoll = Math.random();
        if (encounterRoll > 0.5) {
            return null;
        }

        // Select a random confidant from the possible ones
        const selectedConfidant =
            possibleConfidants[
                Math.floor(Math.random() * possibleConfidants.length)
            ];

        // Get current confidant relationship level from state
        const confidantInState = this.state.social.relationships.find(
            (rel) => rel.id === selectedConfidant.id
        );

        // If this is a new confidant, add them to relationships
        if (!confidantInState) {
            this.addNewConfidant(selectedConfidant.id);
            return {
                confidant: selectedConfidant,
                currentLevel: 0,
                newLevel: 1,
                isNew: true,
            };
        }

        // If confidant already at max level, still meet but no level up
        if (confidantInState.level >= selectedConfidant.maxLevel) {
            return {
                confidant: selectedConfidant,
                currentLevel: confidantInState.level,
                newLevel: confidantInState.level,
                isMaxed: true,
            };
        }

        // Level up the relationship
        const newLevel = confidantInState.level + 1;
        this.updateConfidantLevel(selectedConfidant.id, newLevel);

        return {
            confidant: selectedConfidant,
            currentLevel: confidantInState.level,
            newLevel: newLevel,
        };
    }

    /**
     * Add a new confidant to relationships
     * @param {string} confidantId - ID of the confidant
     */
    addNewConfidant(confidantId) {
        this.updateGameState((state) => {
            const relationships = [...state.social.relationships];
            relationships.push({
                id: confidantId,
                level: 1,
                discoveredAt: state.gameProgress.currentPeriod,
            });

            return {
                ...state,
                social: {
                    ...state.social,
                    relationships,
                },
            };
        });

        // Apply level 1 buff effect
        this.applyConfidantBuff(confidantId, 1);
    }

    /**
     * Update a confidant's relationship level
     * @param {string} confidantId - ID of the confidant
     * @param {number} newLevel - New relationship level
     */
    updateConfidantLevel(confidantId, newLevel) {
        this.updateGameState((state) => {
            const relationships = state.social.relationships.map((rel) =>
                rel.id === confidantId ? { ...rel, level: newLevel } : rel
            );

            return {
                ...state,
                social: {
                    ...state.social,
                    relationships,
                },
            };
        });

        // Apply buff for the new level
        this.applyConfidantBuff(confidantId, newLevel);
    }

    /**
     * Apply buff effects based on confidant relationship
     * @param {string} confidantId - ID of the confidant
     * @param {number} level - Relationship level
     */
    applyConfidantBuff(confidantId, level) {
        // Find the confidant
        const confidant = confidantsData.confidants.find(
            (c) => c.id === confidantId
        );
        if (!confidant) return;

        // Get the buff type
        const buffType = confidant.buff;
        const buff = buffsData.socialBuffs[buffType];
        if (!buff) return;

        // Get the buff effect for this level
        const buffEffect = buff.levels.find((b) => b.level === level);
        if (!buffEffect) return;

        // Update active buffs in state
        this.updateGameState((state) => {
            // Remove any existing buffs of this type
            const filteredBuffs = state.buffs.active.filter(
                (b) => b.type !== buffType
            );

            // Add the new buff
            const newBuff = {
                id: `${buffType}_${level}`,
                type: buffType,
                name: buff.name,
                description: buffEffect.effect,
                level: level,
                source: confidant.name,
                icon: buff.icon,
                value: buffEffect.value,
                special: buffEffect.special || null,
            };

            return {
                ...state,
                buffs: {
                    ...state.buffs,
                    active: [...filteredBuffs, newBuff],
                },
            };
        });

        // Notify that buffs have been updated
        this.events.emit("buffsUpdated", this.state.buffs.active);
    }

    /**
     * Get the current level of a specific buff type
     * @param {string} buffType - Type of buff to check
     * @returns {number} Current level of the buff or 0 if not active
     */
    getBuffLevel(buffType) {
        if (!this.initialized) {
            this.initialize();
        }

        const buff = this.state.buffs.active.find((b) => b.type === buffType);
        return buff ? buff.level : 0;
    }

    /**
     * Update settings and persist to localStorage
     * @param {Object} newSettings - New settings object or partial settings
     */
    updateSettings(newSettings) {
        this.settings = {
            ...this.settings,
            ...newSettings,
        };

        saveSettings(this.settings);
        this.events.emit("settingsUpdated", this.settings);
    }

    /**
     * Open the buffs panel
     */
    openBuffsPanel() {
        this.events.emit("showBuffsPanel", true);
    }

    /**
     * Get current active buffs
     * @returns {Array} List of active buffs
     */
    getActiveBuffs() {
        return this.state?.buffs?.active || [];
    }

    /**
     * Add a new employee to the roster
     * @param {Object} employee - Employee data object
     */
    hireEmployee(employee) {
        this.updateGameState((state) => {
            const newRoster = [...state.employees.roster, employee];
            const newLaborCost = newRoster.reduce(
                (total, emp) => total + emp.salary,
                0
            );

            return {
                ...state,
                employees: {
                    ...state.employees,
                    roster: newRoster,
                    laborCost: newLaborCost,
                },
                finances: {
                    ...state.finances,
                    funds: state.finances.funds - employee.salary, // Initial payment
                },
                statistics: {
                    ...state.statistics,
                    employeesHired: state.statistics.employeesHired + 1,
                },
            };
        });
    }

    /**
     * Purchase a new restaurant
     * @param {number} slotId - Restaurant slot ID
     * @param {Object} restaurant - Restaurant data
     */
    purchaseRestaurant(slotId, restaurant) {
        this.updateGameState((state) => {
            // Update slot to be purchased
            const updatedSlots = state.restaurants.slots.map((slot) =>
                slot.id === slotId
                    ? { ...slot, purchased: true, barId: restaurant.id }
                    : slot
            );

            // Add restaurant to bars list
            const updatedBars = [...state.restaurants.bars, restaurant];

            return {
                ...state,
                restaurants: {
                    ...state.restaurants,
                    slots: updatedSlots,
                    bars: updatedBars,
                },
                finances: {
                    ...state.finances,
                    funds: state.finances.funds - restaurant.purchasePrice,
                },
                statistics: {
                    ...state.statistics,
                    restaurantsPurchased:
                        state.statistics.restaurantsPurchased + 1,
                },
            };
        });
    }

    /**
     * Schedule personal time activity
     * @param {string} activity - Activity name
     */
    schedulePesonalTime(activity) {
        this.updateGameState((state) => {
            return {
                ...state,
                social: {
                    ...state.social,
                    personalTime: {
                        ...state.social.personalTime,
                        planned: activity,
                    },
                },
            };
        });
    }
}

// Create a singleton instance
const gameState = new GameState();

export default gameState;

