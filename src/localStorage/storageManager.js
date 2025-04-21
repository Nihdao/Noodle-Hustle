/**
 * storageManager.js
 * Manages all localStorage operations for Noodle Balance game
 * Centralizes storage structure definitions and provides utility functions
 */

// Constants for storage keys
export const STORAGE_KEYS = {
    GAME_SAVE: "noodleBalanceSave",
    SETTINGS: "noodleBalanceSettings",
    PLAYER_NAME: "playerName",
};

/**
 * Game save data structure
 * Contains all persistent gameplay data
 */
export const createNewGameSave = (playerName = "Player") => {
    return {
        // Basic info
        playerName,
        createdAt: new Date().toISOString(),
        lastSaved: new Date().toISOString(),

        // Game progression
        gameProgress: {
            currentPeriod: 10,
            completedIntro: true,
            investorClashIn: 10, // Countdown to next investor meeting
            businessRank: 200, // Lower is better (1 is highest)
        },

        // Financial data
        finances: {
            funds: 5000000, // Current available money
            debt: {
                loans: [
                    // Example loan structure
                    {
                        id: "initial-loan",
                        amount: 500000,
                        interestRate: 0.05,
                        term: 20, // periods
                        remainingPeriods: 20,
                        periodPayment: 25000,
                    },
                ],
                totalDebt: 500000,
                periodRepayment: 25000,
            },
            expensesHistory: [],
            incomeHistory: [],
        },

        // Player condition
        playerStats: {
            burnout: 33, // 0-100
            burnoutHistory: [],
        },

        // Restaurant data
        restaurants: {
            slots: [
                { id: 1, purchased: true, barId: 1 }, // First slot with original restaurant
                { id: 2, purchased: false, barId: null },
                { id: 3, purchased: false, barId: null },
                { id: 4, purchased: false, barId: null },
                { id: 5, purchased: false, barId: null },
            ],
            bars: [
                {
                    id: 1,
                    name: "Noodles Original",
                    description: "Where it all began.",
                    sellable: false,
                    maxSales: 5,
                    maxProduct: 5,
                    maxService: 5,
                    maxAmbiance: 5,
                    maintenance: 100,
                    baseProfit: 10000,
                    forecastedProfit: 12657,
                    staffCost: 8985,
                    staffSlots: 3,
                    unlocked: true,
                    upgrades: {
                        cuisine: 1,
                        service: 1,
                        ambiance: 1,
                        salesVolume: 1,
                    },
                },
            ],
        },

        // Employee management
        employees: {
            roster: [
                {
                    id: "e1",
                    name: "Carl Ramen",
                    type: "C",
                    level: 3,
                    service: 38,
                    cuisine: 53,
                    ambiance: 53,
                    salary: 4500,
                    morale: 85,
                    assigned: 1, // restaurant ID
                },
                {
                    id: "e2",
                    name: "Lucie Pho",
                    type: "D",
                    level: 3,
                    service: 30,
                    cuisine: 31,
                    ambiance: 34,
                    salary: 4485,
                    morale: 78,
                    assigned: 1, // restaurant ID
                },
            ],
            laborCost: 8985,
        },

        // Social relationships
        social: {
            relationships: [
                {
                    npcId: "mentor",
                    name: "Master Umami",
                    level: 1, // 1-5
                    interactions: [],
                    buffs: ["Reduces burnout by 5%"],
                    nextMeetingScheduled: false,
                },
                {
                    npcId: "rival",
                    name: "Chef Kompetitor",
                    level: 1,
                    interactions: [],
                    buffs: [],
                    nextMeetingScheduled: false,
                },
                {
                    npcId: "supplier",
                    name: "Nori Wholesaler",
                    level: 1,
                    interactions: [],
                    buffs: [],
                    nextMeetingScheduled: false,
                },
                {
                    npcId: "critic",
                    name: "Food Blogger",
                    level: 1,
                    interactions: [],
                    buffs: [],
                    nextMeetingScheduled: false,
                },
                {
                    npcId: "friend",
                    name: "Old Colleague",
                    level: 1,
                    interactions: [],
                    buffs: [],
                    nextMeetingScheduled: false,
                },
            ],
            personalTime: {
                planned: "Home",
                history: [],
            },
        },

        // Investor meetings
        meetings: {
            supportGauge: 50,
            history: [],
            nextMeeting: {
                period: 10,
                prepared: false,
            },
        },

        // Event history
        events: {
            completedEvents: [],
            activeEvents: [],
        },

        // Active gameplay buffs
        buffs: {
            active: [],
        },

        // Game stats and achievements
        statistics: {
            periodsPlayed: 1,
            totalCustomersServed: 0,
            totalRevenue: 0,
            totalExpenses: 0,
            highestProfit: 0,
            worstLoss: 0,
            investorMeetingsWon: 0,
            investorMeetingsLost: 0,
            restaurantsPurchased: 1,
            employeesHired: 2,
        },
    };
};

/**
 * Game settings structure
 * Contains user preferences and options
 */
export const defaultSettings = {
    audio: {
        masterVolume: 100,
        musicVolume: 100,
        sfxVolume: 100,
        isMuted: false,
    },
    display: {
        windowSize: "fit",
        isFullscreen: false,
    },
    gameplay: {
        tutorialEnabled: true,
        difficultyMultiplier: 1.0,
        autosaveEnabled: true,
        autosaveInterval: 5, // every 5 periods
    },
};

/**
 * Save game state to localStorage
 * @param {Object} gameState - Current game state
 */
export const saveGame = (gameState) => {
    const gameData = {
        ...gameState,
        lastSaved: new Date().toISOString(),
    };

    try {
        localStorage.setItem(STORAGE_KEYS.GAME_SAVE, JSON.stringify(gameData));
        return true;
    } catch (error) {
        console.error("Failed to save game:", error);
        return false;
    }
};

/**
 * Load game state from localStorage
 * @returns {Object|null} Game state or null if no save exists
 */
export const loadGame = () => {
    try {
        const savedGame = localStorage.getItem(STORAGE_KEYS.GAME_SAVE);
        return savedGame ? JSON.parse(savedGame) : null;
    } catch (error) {
        console.error("Failed to load game:", error);
        return null;
    }
};

/**
 * Save settings to localStorage
 * @param {Object} settings - User settings
 */
export const saveSettings = (settings) => {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error("Failed to save settings:", error);
        return false;
    }
};

/**
 * Load settings from localStorage
 * @returns {Object} User settings or default settings
 */
export const loadSettings = () => {
    try {
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
        console.error("Failed to load settings:", error);
        return defaultSettings;
    }
};

/**
 * Clear all game data from localStorage
 */
export const clearAllData = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.GAME_SAVE);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        return true;
    } catch (error) {
        console.error("Failed to clear data:", error);
        return false;
    }
};

/**
 * Check if a save game exists
 * @returns {boolean} True if save exists
 */
export const hasSaveGame = () => {
    return localStorage.getItem(STORAGE_KEYS.GAME_SAVE) !== null;
};

/**
 * Creates a backup of the current save
 * @returns {string} Backup ID
 */
export const createBackup = () => {
    const backupId = `backup_${Date.now()}`;
    const currentSave = localStorage.getItem(STORAGE_KEYS.GAME_SAVE);

    if (currentSave) {
        localStorage.setItem(backupId, currentSave);
        return backupId;
    }
    return null;
};

/**
 * Restores a game from backup
 * @param {string} backupId - ID of the backup to restore
 * @returns {boolean} Success status
 */
export const restoreBackup = (backupId) => {
    const backup = localStorage.getItem(backupId);

    if (backup) {
        localStorage.setItem(STORAGE_KEYS.GAME_SAVE, backup);
        return true;
    }
    return false;
};

