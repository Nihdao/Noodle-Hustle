/**
 * storageManager.js
 * Manages all localStorage operations for Noodle Balance game
 * Centralizes storage structure definitions and provides utility functions
 */

import confidantsData from "../data/confidants.json";
import employeesData from "../data/employees.json";
import restaurantsData from "../data/restaurants.json";
import rankData from "../data/rank.json";

// Constants for storage keys
export const STORAGE_KEYS = {
    GAME_SAVE: "noodleBalanceSave",
    // Nous supprimons ces clés séparées car elles seront intégrées dans GAME_SAVE
    // SETTINGS: "noodleBalanceSettings",
    // SOCIAL_ACTION_DONE_IN_PERIOD: "socialActionDoneInPeriod",
    // PLAYER_NAME: "playerName",
    // STORAGE_KEY_CANDIDATES: "noodleBalanceCandidates",
};

/**
 * Game save data structure
 * Contains all persistent gameplay data
 */
export const createNewGameSave = (playerName) => {
    // Sélectionner les employés avec id 75 et 74
    const starterEmployees = employeesData.filter(
        (e) => e.id === 75 || e.id === 74
    );
    // Starter bar : id 1
    const starterBar = restaurantsData.find((r) => r.id === 1);

    // Get initial category based on starting rank
    const initialRank = 200;
    const initialCategory = getBusinessCategoryFromRank(initialRank);

    return {
        // Basic info
        createdAt: new Date().toISOString(),
        lastSaved: new Date().toISOString(),

        // Game progression
        gameProgress: {
            currentPeriod: 1,
            completedIntro: true,
            investorClashIn: 5, // Countdown to next investor meeting
            businessRank: initialRank, // Lower is better (1 is highest)
            businessCategory: initialCategory,
            rankHistory: [
                {
                    period: 1,
                    rank: initialRank,
                    totalBalance: 0,
                },
            ],
        },

        // Financial data
        finances: {
            funds: 1000, // Current available money
            totalBalance: 0, // Cumulative income over time
            debt: {
                amount: 500,
            },
            expensesHistory: [],
            incomeHistory: [],
        },

        // Player condition
        playerStats: {
            playerName,
            burnout: 50, // 0-100
            burnoutHistory: [],
        },

        // Restaurant data - optimisé pour utiliser des IDs plutôt que des objets complets
        restaurants: {
            slots: [
                { id: 1, purchased: true, barId: 1 },
                { id: 2, purchased: false, barId: null },
                { id: 3, purchased: false, barId: null },
                { id: 4, purchased: false, barId: null },
                { id: 5, purchased: false, barId: null },
            ],
            bars: [
                {
                    id: 1,
                    restaurantId: 1, // référence à restaurants.json
                    name: starterBar ? starterBar.name : "Noodles Original",
                    description: starterBar
                        ? starterBar.description
                        : "Where it all began.",
                    sellable: starterBar ? starterBar.sellable : false,
                    maxSales: starterBar ? starterBar.maxSales : 5,
                    maxProduct: starterBar ? starterBar.maxProduct : 5,
                    maxService: starterBar ? starterBar.maxService : 5,
                    maxAmbiance: starterBar ? starterBar.maxAmbiance : 5,
                    maintenance: starterBar ? starterBar.maintenance : 100,
                    basePrice: starterBar ? starterBar.basePrice : 0,
                    salesVolume: starterBar ? starterBar.salesVolume : 120,
                    serviceCap: starterBar ? starterBar.serviceCap : 70,
                    productCap: starterBar ? starterBar.productCap : 100,
                    ambianceCap: starterBar ? starterBar.ambianceCap : 100,
                    staff: starterEmployees
                        .filter((emp) => emp.id === 75 || emp.id === 74)
                        .map((emp) => emp.id),
                    staffCost: starterEmployees
                        .filter((emp) => emp.id === 75 || emp.id === 74)
                        .reduce((sum, emp) => sum + emp.salary, 0),
                    staffSlots: starterBar ? starterBar.staffSlots : 3,
                    unlocked: true,
                    upgrades: {
                        product: 1,
                        service: 1,
                        ambiance: 1,
                        salesVolume: 1,
                    },
                },
            ],
        },

        // Employee management - enrichi avec tous les champs de employees.json et dynamique d'action par période
        employees: {
            roster: starterEmployees.map((employee) => ({
                id: employee.id,
                name: employee.name,
                rarity: employee.rarity,
                levelCap: employee.levelCap,
                service: employee.service,
                cuisine: employee.cuisine,
                ambiance: employee.ambiance,
                salary: employee.salary,
                morale: employee.morale,
                debateTrait: employee.debateTrait,
                interventionCost: employee.interventionCost,
                relevance: employee.relevance,
                repartee: employee.repartee,
                level: 1,
                assigned: 1, // restaurant id 1
                management: false,
            })),
            laborCost: starterEmployees.reduce(
                (sum, emp) => sum + emp.salary,
                0
            ),
            // Historique des actions collectives par période, ex: { period: 1, actions: [{employeeId: 1, type: 'service', value: +2}] }
            periodActions: [],
        },

        // Gestion du recrutement des salariés - stocke les tentatives et résultats par période
        employeeRecruitment: {
            searchHistory: [
                // Exemple : { period: 1, searchResults:[1, 2, 3] }
            ],
            searchActionDoneInPeriod: false,
        },

        // Social relationships - optimisé avec des IDs
        social: {
            relationships: confidantsData.confidants.map((confidant) => ({
                npcId: confidant.id,
                level: 0,
            })),
            socialActionDoneInPeriod: false,
        },

        // Investor meetings
        meetings: {
            supportGauge: 50,
            history: [],
            nextMeeting: {
                period: 5,
                prepared: false,
            },
        },

        // Active gameplay buffs - optimisé avec des IDs
        buffs: {
            active: [], // Sera rempli avec des références aux buffs par ID
        },

        // Game stats and achievements
        // statistics: {
        //     periodsPlayed: 1,
        //     totalCustomersServed: 0,
        //     totalRevenue: 0,
        //     totalExpenses: 0,
        //     highestProfit: 0,
        //     worstLoss: 0,
        //     investorMeetingsWon: 0,
        //     investorMeetingsLost: 0,
        //     restaurantsPurchased: 1,
        //     employeesHired: 2,
        // },

        // Intégration des autres clés de stockage
        settings: {
            audio: {
                masterVolume: 100,
                musicVolume: 100,
                sfxVolume: 100,
                isMuted: false,
            },
            gameplay: {
                tutorialEnabled: true,
                autosaveEnabled: true,
                autosaveInterval: 1,
            },
        },

        // Candidats disponibles pour embauche
        candidates: [], // Sera rempli avec des ID d'employés plutôt que des objets complets
    };
};

/**
 * Helper function to get business category from rank
 */
function getBusinessCategoryFromRank(rank) {
    for (const rankInfo of rankData.ranks) {
        if (rank >= rankInfo.rankRange.min && rank <= rankInfo.rankRange.max) {
            return rankInfo.category;
        }
    }
    return "Unknown";
}

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
    gameplay: {
        tutorialEnabled: true,
        autosaveEnabled: true,
        autosaveInterval: 1,
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
        // Charger la sauvegarde actuelle
        const savedGame = loadGame();
        if (savedGame) {
            // Mettre à jour les paramètres dans la sauvegarde
            savedGame.settings = settings;
            // Sauvegarder la sauvegarde mise à jour
            return saveGame(savedGame);
        } else {
            // Pas de sauvegarde existante, créer une nouvelle avec les paramètres
            const newSave = createNewGameSave();
            newSave.settings = settings;
            return saveGame(newSave);
        }
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
        const savedGame = loadGame();
        // Si une sauvegarde existe et contient des paramètres, les renvoyer
        if (savedGame && savedGame.settings) {
            return savedGame.settings;
        }
        // Sinon, utiliser les paramètres par défaut
        const defaultSettings = {
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
        return defaultSettings;
    } catch (error) {
        console.error("Failed to load settings:", error);
        const defaultSettings = {
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
        return defaultSettings;
    }
};

/**
 * Clear all game data from localStorage
 */
export const clearAllData = () => {
    try {
        // Nous n'avons plus besoin de supprimer plusieurs clés, juste la principale
        localStorage.removeItem(STORAGE_KEYS.GAME_SAVE);
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

