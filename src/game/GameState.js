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
import restaurantsData from "../data/restaurants.json";
import rankData from "../data/rank.json";

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

            // Update totalBalance if profit is positive
            const totalBalance = state.finances.totalBalance || 0;
            const updatedTotalBalance =
                totalProfit > 0 ? totalBalance + totalProfit : totalBalance;

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

            // Check if we've reached a milestone
            const milestone = rankData.milestones.find((m) => m.at === newRank);
            if (milestone && newRank < currentRank) {
                // Emit milestone event
                this.events.emit("rankMilestoneReached", {
                    rank: newRank,
                    description: milestone.description,
                    reward: milestone.reward,
                });
            }

            // Update burnout based on rank change and profit
            let burnoutChange = 0;
            if (newRank < currentRank) {
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

            // Get current business category based on rank
            const currentCategory = this.getBusinessCategoryFromRank(newRank);

            return {
                ...state,
                finances: {
                    ...state.finances,
                    funds: updatedFunds,
                    totalBalance: updatedTotalBalance,
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
                    businessCategory: currentCategory,
                    // Store rank history
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
        // Recherche dans plusieurs catégories de buffs
        const categories = Object.keys(buffsData);
        for (const category of categories) {
            const buff = buffsData[category].find((b) => b.id === buffId);
            if (buff) return buff;
        }
        return null;
    }

    /**
     * Get restaurant data by ID
     * @param {number} restaurantId - ID of the restaurant
     * @returns {Object} Complete restaurant data
     */
    getRestaurantData(restaurantId) {
        return restaurantsData.find((rest) => rest.id === restaurantId);
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

        console.log("Firing employee:", employeeId);

        this.updateGameState((state) => {
            // Find the employee to fire
            const employeeIndex = state.employees.roster.findIndex(
                (emp) => emp.id === employeeId
            );
            if (employeeIndex === -1) return state;

            // Get the employee
            const employee = state.employees.roster[employeeIndex];

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
            let updatedRestaurants = [...state.restaurants];
            const restaurantIndex = updatedRestaurants.findIndex(
                (restaurant) =>
                    restaurant.staff &&
                    restaurant.staff.some((staffId) => staffId === employeeId)
            );

            if (restaurantIndex !== -1) {
                // Remove employee from restaurant staff
                updatedRestaurants[restaurantIndex] = {
                    ...updatedRestaurants[restaurantIndex],
                    staff: updatedRestaurants[restaurantIndex].staff.filter(
                        (staffId) => staffId !== employeeId
                    ),
                };
            }

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
                        },
                    ],
                },
                restaurants: updatedRestaurants,
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
            // Initialize statistics object if it doesn't exist
            if (!state.statistics) {
                state.statistics = {};
            }

            // Initialize trainingsSessions if it doesn't exist
            if (!state.statistics.trainingsSessions) {
                state.statistics.trainingsSessions = 0;
            }

            // Find the employee to train
            const employee = state.employees.roster.find(
                (e) => e.id === employeeId
            );

            if (!employee) {
                console.error(`Employee with ID ${employeeId} not found`);
                return false;
            }

            // 2. Check if employee is at max level
            if (employee.level >= employee.levelCap) {
                console.warn(
                    `Employee ${employee.name} is already at max level`
                );
                return false;
            }

            // 3. Check if we have enough money
            if (state.finances.funds < cost) {
                console.warn("Not enough funds to train employee");
                return false;
            }

            // 4. Update employee level and skills
            employee.level += 1;

            // 5. Update finances
            state.finances.funds -= cost;

            // Add to expenses history
            state.finances.expensesHistory.push({
                period: state.gameProgress.currentPeriod,
                amount: cost,
                description: `Formation de ${employee.name}`,
                category: "training",
            });

            // 6. Update statistics
            state.statistics.trainingsSessions += 1;

            // Update the state
            this.saveGameState();

            console.log(
                `Employee ${employee.name} successfully trained to level ${employee.level}`
            );
            return true;
        });
    }

    /**
     * Give a gift to an employee to boost their morale
     * @param {string} employeeId - ID of the employee to gift
     * @param {number} cost - Cost of the gift
     */
    giftEmployee(employeeId, cost) {
        this.updateGameState((state) => {
            // Initialize statistics object if it doesn't exist
            if (!state.statistics) {
                state.statistics = {};
            }

            // Initialize giftsGiven if it doesn't exist
            if (!state.statistics.giftsGiven) {
                state.statistics.giftsGiven = 0;
            }

            // Find the employee to gift
            const employee = state.employees.roster.find(
                (e) => e.id === employeeId
            );

            if (!employee) {
                console.error(`Employee with ID ${employeeId} not found`);
                return false;
            }

            // 2. Check if we have enough money
            if (state.finances.funds < cost) {
                console.warn("Not enough funds to gift employee");
                return false;
            }

            // 3. Update employee morale
            // Morale boost is based on cost: higher cost = higher boost
            const moraleBoost = Math.floor(cost / 10); // Simple formula, adjust as needed
            employee.morale = Math.min(100, employee.morale + moraleBoost);

            // 4. Update finances
            state.finances.funds -= cost;

            // Add to expenses history
            state.finances.expensesHistory.push({
                period: state.gameProgress.currentPeriod,
                amount: cost,
                description: `Cadeau pour ${employee.name}`,
                category: "gift",
            });

            // 5. Update statistics
            state.statistics.giftsGiven =
                (state.statistics.giftsGiven || 0) + 1;

            // Set a flag in employee.management to indicate this action was performed this period
            if (!employee.management) {
                employee.management = {};
            }
            employee.management.giftedThisPeriod = true;

            // Update the state
            this.saveGameState();

            console.log(
                `Successfully gave a gift to ${employee.name}, morale increased by ${moraleBoost} points`
            );
            return true;
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
}

// Create a singleton instance
const gameState = new GameState();

export default gameState;

