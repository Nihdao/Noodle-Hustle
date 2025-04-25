/**
 * GameState.js
 * Centralizes game state management and provides an API for game components
 */

import { EventBus } from "./EventBus";
import {
    createNewGameSave,
    loadGame,
    saveGame,
    hasSaveGame,
    createBackup,
} from "../localStorage/storageManager";
import confidantsData from "../data/confidants.json";
import buffsData from "../data/buffs.json";
import employeesData from "../data/employees.json";
import rankData from "../data/rank.json";

class GameState {
    constructor() {
        this.events = EventBus;
        this.state = null;
        this.settings = null;
        this.initialized = false;
        this.consecutiveNegativePeriods = 0;
        this.gameOverStats = null;

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
        // Load or create game state
        if (!forceNew && hasSaveGame()) {
            this.state = loadGame();
            // Les paramètres sont maintenant dans state.settings
            this.settings = this.state.settings;
        } else {
            // Retrieve playerName from localStorage if available
            const playerName = localStorage.getItem("playerName") || "";
            console.log("playerName", playerName);
            this.state = createNewGameSave(playerName);
            this.settings = this.state.settings;
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

        // Check for game over conditions after state update
        this.checkGameOver();
    }

    /**
     * Start a new game period
     */
    startPeriod() {
        if (!this.initialized) {
            this.initialize();
        }

        // Check for game over conditions before starting new period
        if (this.checkGameOver()) {
            return false;
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

            return {
                ...state,
                gameProgress: {
                    ...state.gameProgress,
                    currentPeriod: newPeriod,
                },
                // Reset employee recruitment state for new period
                employeeRecruitment: {
                    ...state.employeeRecruitment,
                    searchActionDoneInPeriod: false, // Reset to allow recruitment in new period
                    candidates: [], // Clear previous candidates
                },
                social: {
                    ...state.social,
                    socialActionDoneInPeriod: false,
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

            // Update totalBalance with ALL profit/loss changes
            const totalBalance = state.finances.totalBalance || 0;
            const updatedTotalBalance = totalBalance + totalProfit;

            // Check for rank change based on totalBalance
            const currentRank = state.gameProgress.businessRank || 200;

            // Find the appropriate rank based on totalBalance
            const rankDetails = [...rankData.rankDetails].sort(
                (a, b) => a.rank - b.rank
            );
            let newRank = currentRank;

            // If balance has increased, check if we qualify for a higher rank
            if (updatedTotalBalance > totalBalance) {
                for (const rankDetail of rankDetails) {
                    if (
                        updatedTotalBalance >= rankDetail.balanceRequired &&
                        rankDetail.rank < currentRank
                    ) {
                        newRank = rankDetail.rank;
                        break;
                    }
                }
            }

            // Get current business category
            const currentCategory = this.getBusinessCategoryFromRank(newRank);

            // Calculate new debt amount based on rank's balanceThreshold
            let newDebtAmount = 150000; // Initial debt amount
            if (state.gameProgress.currentPeriod > 1) {
                // Only update debt after first period
                // Find the current rank range
                const currentRankRange = rankData.ranks.find(
                    (r) =>
                        r.rankRange.min <= newRank && r.rankRange.max >= newRank
                );

                if (currentRankRange) {
                    // Calculate new debt as balanceThreshold / 10
                    newDebtAmount = Math.floor(
                        currentRankRange.balanceThreshold / 10
                    );
                    // Ensure minimum debt amount
                    newDebtAmount = Math.max(150000, newDebtAmount);
                }
            }

            // Update burnout based on results
            const currentBurnout = state.playerStats?.burnout || 0;
            const burnoutChange = results.burnoutChange || 0;
            const updatedBurnout = Math.min(
                100,
                Math.max(0, currentBurnout + burnoutChange)
            );

            return {
                ...state,
                finances: {
                    ...state.finances,
                    funds: updatedFunds,
                    totalBalance: updatedTotalBalance,
                    debt: {
                        ...state.finances.debt,
                        amount: newDebtAmount,
                    },
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
                    businessCategory: currentCategory,
                    rankHistory: [
                        ...(state.gameProgress.rankHistory || []),
                        {
                            period: state.gameProgress.currentPeriod,
                            rank: newRank,
                            totalBalance: updatedTotalBalance,
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
            totalBalance: this.state.finances.totalBalance,
            businessRank: this.state.gameProgress.businessRank,
            businessCategory: this.state.gameProgress.businessCategory,
        });

        return this.state;
    }

    /**
     * Get business category based on current rank
     * @param {number} rank - Current business rank
     * @returns {string} Business category
     */
    getBusinessCategoryFromRank(rank) {
        for (const rankInfo of rankData.ranks) {
            if (
                rank >= rankInfo.rankRange.min &&
                rank <= rankInfo.rankRange.max
            ) {
                return rankInfo.category;
            }
        }
        return "Unknown";
    }

    /**
     * Get rank details based on current rank
     * @param {number} rank - Current business rank
     * @returns {Object} Rank details including title
     */
    getRankDetails(rank) {
        const details = rankData.rankDetails.find((r) => r.rank === rank);
        if (!details) {
            return {
                rank,
                title: "Unknown",
                balanceRequired: 0,
            };
        }
        return details;
    }

    /**
     * Get next rank threshold
     * @returns {Object} Next rank details including required balance
     */
    getNextRankThreshold() {
        const currentRank = this.state.gameProgress.businessRank || 200;
        const nextRanks = rankData.rankDetails
            .filter((r) => r.rank < currentRank)
            .sort((a, b) => b.rank - a.rank);

        if (nextRanks.length === 0) {
            return null; // Already at highest rank
        }

        return nextRanks[0];
    }

    /**
     * Update game state when funds are added or removed
     * @param {number} amount - Amount to add (positive) or remove (negative)
     * @param {string} source - Source of the transaction
     * @param {string} category - Category for expenses (optional)
     * @returns {boolean} Success status
     */
    updateFunds(amount, source, category = "") {
        if (!this.initialized) {
            this.initialize();
        }

        this.updateGameState((state) => {
            const currentFunds = state.finances.funds || 0;
            const updatedFunds = currentFunds + amount;

            // Only increase totalBalance if it's income
            let totalBalance = state.finances.totalBalance || 0;
            if (amount > 0) {
                totalBalance += amount;
            }

            // Create transaction record
            const transaction = {
                amount: Math.abs(amount),
                source,
                period: state.gameProgress.currentPeriod,
            };

            if (category) {
                transaction.category = category;
            }

            return {
                ...state,
                finances: {
                    ...state.finances,
                    funds: updatedFunds,
                    totalBalance,
                    incomeHistory:
                        amount > 0
                            ? [...state.finances.incomeHistory, transaction]
                            : state.finances.incomeHistory,
                    expensesHistory:
                        amount < 0
                            ? [...state.finances.expensesHistory, transaction]
                            : state.finances.expensesHistory,
                },
            };
        });

        return true;
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
        // Mettre à jour les paramètres dans state.settings
        if (!this.state || !this.state.settings) {
            if (!this.initialized) {
                this.initialize();
            }
        }

        // Mise à jour des paramètres internes
        this.settings = {
            ...this.settings,
            ...newSettings,
        };

        // Mise à jour dans l'état du jeu
        this.updateGameState((state) => ({
            ...state,
            settings: this.settings,
        }));

        // Enregistrement automatique après mise à jour des paramètres
        this.saveGameState();

        // Notification aux composants
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
     * Get employee data by ID
     * @param {number} employeeId - ID of the employee from employees.json
     * @returns {Object} Complete employee data
     */
    getEmployeeData(employeeId) {
        return employeesData.find((emp) => emp.id === employeeId);
    }

    /**
     * Get confidant data by ID
     * @param {string} confidantId - ID of the confidant
     * @returns {Object} Complete confidant data
     */
    getConfidantData(confidantId) {
        return confidantsData.confidants.find(
            (conf) => conf.id === confidantId
        );
    }

    /**
     * Get buff data by ID
     * @param {string} buffId - ID of the buff
     * @returns {Object} Complete buff data
     */
    getBuffData(buffId) {
        if (!this.initialized) {
            this.initialize();
        }

        // Retrieve buff data from buffs.json or from state
        if (buffId) {
            return this.state.buffs.active.find((buff) => buff.id === buffId);
        }
        return null;
    }

    /**
     * Get restaurant data by ID
     * @param {string} restaurantId - Restaurant ID
     * @returns {Object} Restaurant data object
     */
    getRestaurantData(restaurantId) {
        if (!this.initialized) {
            this.initialize();
        }

        return this.state.restaurants.bars.find(
            (bar) => bar.id === restaurantId
        );
    }

    /**
     * Updates the game progress object
     * @param {Object} gameProgress - New game progress data
     */
    updateGameProgress(gameProgress) {
        if (!this.initialized) {
            this.initialize();
        }

        this.updateGameState((state) => {
            return {
                ...state,
                gameProgress: {
                    ...state.gameProgress,
                    ...gameProgress,
                },
            };
        });
    }

    /**
     * Set funds to a specific value
     * @param {number} amount - The amount to set funds to
     */
    setFunds(amount) {
        if (!this.initialized) {
            this.initialize();
        }

        this.updateGameState((state) => {
            return {
                ...state,
                finances: {
                    ...state.finances,
                    funds: amount,
                },
            };
        });
    }

    /**
     * Set total balance to a specific value
     * @param {number} amount - The amount to set total balance to
     */
    setTotalBalance(amount) {
        if (!this.initialized) {
            this.initialize();
        }

        this.updateGameState((state) => {
            return {
                ...state,
                finances: {
                    ...state.finances,
                    totalBalance: amount,
                },
            };
        });
    }

    /**
     * Get the current total balance
     * @returns {number} The current total balance
     */
    getTotalBalance() {
        if (!this.initialized) {
            this.initialize();
        }

        return this.state.finances.totalBalance || 0;
    }

    /**
     * Set burnout to a specific value
     * @param {number} amount - The amount to set burnout to (0-100)
     */
    setBurnout(amount) {
        if (!this.initialized) {
            this.initialize();
        }

        const boundedAmount = Math.min(100, Math.max(0, amount));

        this.updateGameState((state) => {
            return {
                ...state,
                playerStats: {
                    ...state.playerStats,
                    burnout: boundedAmount,
                    burnoutHistory: [
                        ...(state.playerStats.burnoutHistory || []),
                        {
                            period: state.gameProgress.currentPeriod,
                            burnout: boundedAmount,
                        },
                    ],
                },
            };
        });
    }

    /**
     * Get the current burnout level
     * @returns {number} The current burnout level (0-100)
     */
    getBurnout() {
        if (!this.initialized) {
            this.initialize();
        }

        return this.state.playerStats.burnout || 0;
    }

    /**
     * Get employee by ID
     * @param {string} employeeId - The employee ID
     * @returns {Object} The employee object
     */
    getEmployeeById(employeeId) {
        if (!this.initialized) {
            this.initialize();
        }

        return this.state.employees.roster.find((emp) => emp.id === employeeId);
    }

    /**
     * Update employee morale
     * @param {string} employeeId - The employee ID
     * @param {number} newMorale - The new morale value (0-100)
     */
    updateEmployeeMorale(employeeId, newMorale) {
        if (!this.initialized) {
            this.initialize();
        }

        const boundedMorale = Math.min(100, Math.max(0, newMorale));

        this.updateGameState((state) => {
            return {
                ...state,
                employees: {
                    ...state.employees,
                    roster: state.employees.roster.map((emp) => {
                        if (emp.id === employeeId) {
                            return {
                                ...emp,
                                morale: boundedMorale,
                            };
                        }
                        return emp;
                    }),
                },
            };
        });
    }

    /**
     * Update restaurant data
     * @param {string} restaurantId - The restaurant ID
     * @param {Object} updates - Object containing properties to update
     */
    updateRestaurant(restaurantId, updates) {
        if (!this.initialized) {
            this.initialize();
        }

        this.updateGameState((state) => {
            return {
                ...state,
                restaurants: {
                    ...state.restaurants,
                    bars: state.restaurants.bars.map((restaurant) => {
                        if (restaurant.id === restaurantId) {
                            return {
                                ...restaurant,
                                ...updates,
                                history: [
                                    ...(restaurant.history || []),
                                    {
                                        period: state.gameProgress
                                            .currentPeriod,
                                        ...updates,
                                    },
                                ],
                            };
                        }
                        return restaurant;
                    }),
                },
            };
        });
    }

    /**
     * Add a new employee to the roster
     * @param {Object} employee - Employee data object
     */
    hireEmployee(employee) {
        this.updateGameState((state) => {
            // Ajouter uniquement l'ID et les données spécifiques à l'instance
            const newEmployeeEntry = {
                id: `e${Date.now()}`, // ID unique pour cette instance d'employé
                employeeId: employee.id, // ID qui référence employees.json
                level: 1,
                salary: employee.salary,
                morale: 100,
                assigned: null,
            };

            const newRoster = [...state.employees.roster, newEmployeeEntry];
            const newLaborCost = newRoster.reduce(
                (total, emp) => total + (emp.salary || 0),
                0
            );

            // Calculate contract fee (50% of salary)
            const contractFee = Math.floor(employee.salary * 0.5);
            const totalCost = employee.salary + contractFee;

            // Ensure statistics object exists with proper initialization
            const statistics = state.statistics || {};
            const employeesHired = statistics.employeesHired || 0;

            return {
                ...state,
                employees: {
                    ...state.employees,
                    roster: newRoster,
                    laborCost: newLaborCost,
                },
                finances: {
                    ...state.finances,
                    funds: state.finances.funds - totalCost, // Deduct salary + contract fee
                    expensesHistory: [
                        ...state.finances.expensesHistory,
                        {
                            amount: totalCost,
                            source: "Employee Hiring",
                            period: state.gameProgress.currentPeriod,
                        },
                    ],
                },
                statistics: {
                    ...statistics,
                    employeesHired: employeesHired + 1,
                },
            };
        });
    }

    /**
     * Remove an employee from the roster
     * @param {string} employeeId - ID of the employee to fire
     */
    fireEmployee(employeeId) {
        // Prevent firing the two initial employees (IDs 74 and 75)
        if (
            employeeId === "74" ||
            employeeId === "75" ||
            employeeId === 74 ||
            employeeId === 75
        ) {
            console.warn("Cannot fire initial employees (IDs 74 and 75)");
            return false;
        }

        this.updateGameState((state) => {
            // Find the employee to fire
            const employee = state.employees.roster.find(
                (emp) => emp.id === employeeId
            );
            if (!employee) return state;

            // Create updated roster without the fired employee
            const updatedRoster = state.employees.roster.filter(
                (emp) => emp.id !== employeeId
            );

            // Recalculate labor cost
            const newLaborCost = updatedRoster.reduce(
                (total, emp) => total + (emp.salary || 0),
                0
            );

            // Remove from restaurant if assigned
            const updatedRestaurants = state.restaurants.bars.map(
                (restaurant) => {
                    if (
                        restaurant.staff &&
                        restaurant.staff.includes(employeeId)
                    ) {
                        return {
                            ...restaurant,
                            staff: restaurant.staff.filter(
                                (staffId) => staffId !== employeeId
                            ),
                        };
                    }
                    return restaurant;
                }
            );

            // Ensure severance pay is at least 50 (minimum firing cost)
            const severancePay = Math.max(
                50,
                Math.floor(employee.salary * 0.5)
            );

            return {
                ...state,
                employees: {
                    ...state.employees,
                    roster: updatedRoster,
                    laborCost: newLaborCost,
                },
                finances: {
                    ...state.finances,
                    funds: state.finances.funds - severancePay,
                    expensesHistory: [
                        ...state.finances.expensesHistory,
                        {
                            amount: severancePay,
                            source: "Severance pay",
                            period: state.gameProgress.currentPeriod,
                            category: "firing",
                        },
                    ],
                },
                restaurants: {
                    ...state.restaurants,
                    bars: updatedRestaurants,
                },
            };
        });
    }

    /**
     * Train an employee to increase their skill level
     * @param {string} employeeId - ID of the employee to train
     * @param {number} cost - Cost of the training
     */
    trainEmployee(employeeId, cost) {
        this.updateGameState((state) => {
            const statistics = state.statistics || {};
            const trainingsSessions = statistics.trainingsSessions || 0;

            const updatedRoster = state.employees.roster.map((emp) => {
                if (emp.id === employeeId) {
                    return {
                        ...emp,
                        level: emp.level + 1,
                        management: {
                            ...emp.management,
                            trainedThisPeriod: true,
                        },
                    };
                }
                return emp;
            });

            return {
                ...state,
                employees: {
                    ...state.employees,
                    roster: updatedRoster,
                },
                finances: {
                    ...state.finances,
                    funds: state.finances.funds - cost,
                    expensesHistory: [
                        ...state.finances.expensesHistory,
                        {
                            period: state.gameProgress.currentPeriod,
                            amount: cost,
                            description: `Training employee ${employeeId}`,
                            category: "training",
                        },
                    ],
                },
                statistics: {
                    ...statistics,
                    trainingsSessions: trainingsSessions + 1,
                },
            };
        });
    }

    /**
     * Give a gift to an employee to boost their morale
     * @param {string} employeeId - ID of the employee to gift
     * @param {number} cost - Cost of the gift
     */
    giftEmployee(employeeId, cost) {
        this.updateGameState((state) => {
            const statistics = state.statistics || {};
            const giftsGiven = statistics.giftsGiven || 0;

            const updatedRoster = state.employees.roster.map((emp) => {
                if (emp.id === employeeId) {
                    const moraleBoost = 30;
                    return {
                        ...emp,
                        morale: Math.min(100, emp.morale + moraleBoost),
                        management: {
                            ...emp.management,
                            giftedThisPeriod: true,
                        },
                    };
                }
                return emp;
            });

            return {
                ...state,
                employees: {
                    ...state.employees,
                    roster: updatedRoster,
                },
                finances: {
                    ...state.finances,
                    funds: state.finances.funds - cost,
                    expensesHistory: [
                        ...state.finances.expensesHistory,
                        {
                            period: state.gameProgress.currentPeriod,
                            amount: cost,
                            description: `Gift for employee ${employeeId}`,
                            category: "gift",
                        },
                    ],
                },
                statistics: {
                    ...statistics,
                    giftsGiven: giftsGiven + 1,
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

    /**
     * Mark employee recruitment action as done for the current period
     */
    markEmployeeRecruitmentDone() {
        this.updateGameState((state) => {
            return {
                ...state,
                employeeRecruitment: {
                    ...state.employeeRecruitment,
                    searchActionDoneInPeriod: state.gameProgress.currentPeriod,
                    candidates: state.employeeRecruitment?.candidates || [],
                },
            };
        });
    }

    /**
     * Save recruitment candidates for the current period
     * @param {Array} candidates - Array of employee candidates
     */
    saveRecruitmentCandidates(candidates) {
        this.updateGameState((state) => {
            return {
                ...state,
                employeeRecruitment: {
                    ...state.employeeRecruitment,
                    candidates: candidates,
                },
            };
        });
    }

    /**
     * Check if recruitment has been done in the current period
     * @returns {boolean} - Whether recruitment has been done in current period
     */
    isRecruitmentDoneInCurrentPeriod() {
        if (!this.initialized) {
            this.initialize();
        }

        const currentPeriod = this.state.gameProgress.currentPeriod;
        const lastRecruitmentPeriod =
            this.state.employeeRecruitment?.searchActionDoneInPeriod || 0;

        return currentPeriod === lastRecruitmentPeriod;
    }

    /**
     * Get current recruitment candidates
     * @returns {Array} - Current recruitment candidates
     */
    getRecruitmentCandidates() {
        if (!this.initialized) {
            this.initialize();
        }

        return this.state.employeeRecruitment?.candidates || [];
    }

    /**
     * Upgrades a restaurant property
     * @param {string} restaurantId - The ID of the restaurant to upgrade
     * @param {string} propertyId - The property to upgrade (cuisine, service, ambiance)
     * @param {number} newLevel - The new level to set
     * @param {number} cost - The cost of the upgrade
     * @param {number} newCap - The new cap value for the stat
     * @param {number} salesVolumeBonus - The sales volume bonus to add
     */
    upgradeRestaurant(
        restaurantId,
        propertyId,
        newLevel,
        cost,
        newCap,
        salesVolumeBonus
    ) {
        // Find the restaurant in our state
        const restaurant = this.state.restaurants.bars.find(
            (r) => r.id === restaurantId
        );
        if (!restaurant) {
            console.error(`Restaurant with ID ${restaurantId} not found`);
            return false;
        }

        // Update the upgrade level
        if (!restaurant.upgrades) {
            restaurant.upgrades = {};
        }
        restaurant.upgrades[propertyId] = newLevel;

        // Update the corresponding cap based on the property
        if (propertyId === "product") {
            restaurant.productCap = newCap;
        } else if (propertyId === "service") {
            restaurant.serviceCap = newCap;
        } else if (propertyId === "ambiance") {
            restaurant.ambianceCap = newCap;
        }

        // Update the sales volume
        restaurant.salesVolume += salesVolumeBonus;

        // Deduct the cost
        this.updateFunds(-cost, "Restaurant Upgrade", "upgrade");

        // Log the upgrade
        console.log(
            `Upgraded ${restaurant.name}'s ${propertyId} to level ${newLevel}`
        );
        console.log(`New ${propertyId} cap: ${newCap}`);
        console.log(`New sales volume: ${restaurant.salesVolume}`);
        console.log(`Remaining funds: ${this.state.finances.funds}`);

        // Notify listeners
        this.events.emit("restaurantUpgraded", {
            restaurantId,
            propertyId,
            newLevel,
            cost,
            newCap,
            salesVolumeBonus,
        });

        return true;
    }

    /**
     * Purchase a restaurant for a slot
     * @param {number|string} slotId - ID of the slot to purchase for
     * @param {Object} restaurant - Restaurant to add
     */
    purchaseRestaurant(slotId, restaurant) {
        if (!this.initialized) {
            this.initialize();
        }

        // Validate funds - if they are insufficient, don't purchase
        if (this.state.finances.funds < restaurant.purchasePrice) {
            console.error("Insufficient funds for purchase");
            return false;
        }

        // S'assurer que le restaurant a toutes les propriétés nécessaires
        const completeRestaurant = {
            ...restaurant,
            staff: restaurant.staff || [],
            maintenance: restaurant.maintenance || 0,
            upgrades: restaurant.upgrades || {
                cuisine: 1,
                service: 1,
                ambiance: 1,
                salesVolume: 1,
            },
            staffCost: restaurant.staffCost || 0,
            maxSales: restaurant.maxSales || 1000,
            maxProduct: restaurant.maxProduct || 100,
            maxService: restaurant.maxService || 100,
            maxAmbiance: restaurant.maxAmbiance || 100,
            serviceCap: restaurant.serviceCap || 100,
            productCap: restaurant.productCap || 100,
            ambianceCap: restaurant.ambianceCap || 100,
            salesVolume: restaurant.salesVolume || restaurant.baseProfit || 0,
        };

        // Update game state
        this.updateGameState((state) => {
            // Update slots
            const updatedSlots = state.restaurants.slots.map((slot) => {
                if (slot.id === slotId) {
                    return {
                        ...slot,
                        purchased: true,
                        barId: completeRestaurant.id,
                    };
                }
                return slot;
            });

            // Add restaurant to bars array
            const updatedBars = [...state.restaurants.bars, completeRestaurant];

            return {
                ...state,
                restaurants: {
                    ...state.restaurants,
                    slots: updatedSlots,
                    bars: updatedBars,
                },
            };
        });

        // Deduct funds
        this.updateFunds(
            -restaurant.purchasePrice,
            `Purchase: ${restaurant.name}`,
            "purchase"
        );

        console.log(`Purchased ${restaurant.name} for slot ${slotId}`);
        console.log(`Remaining funds: ${this.state.finances.funds}`);

        // Notify listeners
        this.events.emit("restaurantPurchased", {
            slotId,
            restaurantId: completeRestaurant.id,
            cost: restaurant.purchasePrice,
        });

        return true;
    }

    // Add this method to check for game over conditions
    checkGameOver() {
        const currentState = this.getGameState();
        let isGameOver = false;
        let reason = null;

        // Check burnout
        if (currentState.playerStats?.burnout >= 100) {
            isGameOver = true;
            reason = "burnout";
        }

        // Check funds
        if (currentState.finances?.funds <= 0) {
            this.consecutiveNegativePeriods++;
            if (this.consecutiveNegativePeriods >= 2) {
                isGameOver = true;
                reason = reason === "burnout" ? "both" : "financial";
            }
        } else {
            this.consecutiveNegativePeriods = 0;
        }

        if (isGameOver) {
            // Ensure employees array exists and is valid
            const employees = Array.isArray(currentState.employees)
                ? currentState.employees
                : [];
            const restaurants = Array.isArray(currentState.restaurants)
                ? currentState.restaurants
                : [];

            // Calculate game over stats with safe defaults
            const stats = {
                periods: currentState.gameProgress?.currentPeriod || 0,
                totalRevenue: currentState.finances?.totalBalance || 0,
                peakRank:
                    currentState.playerStats?.peakRank ||
                    currentState.playerStats?.currentRank ||
                    0,
                restaurantsOwned: restaurants.length,
                totalEmployees: employees.length,
                highestSalary:
                    employees.length > 0
                        ? Math.max(
                              ...employees.map((emp) => emp?.salary || 0),
                              0
                          )
                        : 0,
                totalTraining: employees.reduce(
                    (total, emp) => total + (emp?.training || 0),
                    0
                ),
                peakMorale:
                    employees.length > 0
                        ? Math.max(
                              ...employees.map((emp) => emp?.morale || 0),
                              0
                          )
                        : 0,
            };

            this.gameOverStats = {
                isGameOver: true,
                reason,
                stats,
            };

            // Emit game over event
            EventBus.emit("gameOver", this.gameOverStats);
        }

        return isGameOver;
    }

    // Add this method to get game over stats
    getGameOverStats() {
        return this.gameOverStats;
    }
}

// Create a singleton instance
const gameState = new GameState();

export default gameState;

