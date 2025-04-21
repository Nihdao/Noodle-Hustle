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

class GameState {
    constructor() {
        this.events = EventBus;
        this.state = null;
        this.settings = null;
        this.initialized = false;
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
        this.events.emit(
            "periodStarted",
            this.state.gameProgress.currentPeriod
        );
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

