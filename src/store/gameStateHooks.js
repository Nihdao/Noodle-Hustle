/**
 * gameStateHooks.js
 * Custom React hooks for interacting with the game state
 */
import { useState, useEffect, useCallback } from "react";
import gameState from "../game/GameState";

/**
 * Hook to subscribe to game state changes
 * @returns {Object} The current game state
 */
export const useGameState = () => {
    const [state, setState] = useState(null);

    useEffect(() => {
        // Make sure gameState is initialized
        if (!gameState.initialized) {
            gameState.initialize();
        }

        // Set initial state
        setState(gameState.getGameState());

        const handleStateUpdate = (newState) => {
            if (newState) {
                setState(newState);
            }
        };

        // Subscribe to state changes
        gameState.events.on("gameStateUpdated", handleStateUpdate);

        // Cleanup
        return () => {
            gameState.events.off("gameStateUpdated", handleStateUpdate);
        };
    }, []);

    return state || {}; // Ensure we always return at least an empty object
};

/**
 * Hook to get and update settings
 * @returns {Object} Settings object and update function
 */
export const useGameSettings = () => {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        // Initialize gameState if not done already
        if (!gameState.initialized) {
            gameState.initialize();
        }

        // S'assurer que settings est non-null avant de le mettre à jour
        if (gameState.settings) {
            setSettings(gameState.settings);
        }

        const handleSettingsUpdate = (newSettings) => {
            if (newSettings) {
                setSettings(newSettings);
            }
        };

        gameState.events.on("settingsUpdated", handleSettingsUpdate);

        return () => {
            gameState.events.off("settingsUpdated", handleSettingsUpdate);
        };
    }, []);

    const updateSettings = useCallback((newSettings) => {
        if (gameState.settings) {
            gameState.updateSettings(newSettings);
        }
    }, []);

    return { settings, updateSettings };
};

/**
 * Hook for game period-related functionality
 * @returns {Object} Period-related data and functions
 */
export const useGamePeriod = () => {
    const state = useGameState();

    const [isStartingPeriod, setIsStartingPeriod] = useState(false);

    // Get current period from game state
    const currentPeriod = state?.gameProgress?.currentPeriod || 1;
    const investorClashIn = state?.gameProgress?.investorClashIn || 10;

    // Function to start a new period
    const startPeriod = useCallback(() => {
        if (!gameState.initialized) {
            gameState.initialize();
        }

        setIsStartingPeriod(true);

        // Small delay to allow for animations or state updates
        setTimeout(() => {
            gameState.startPeriod();
            setIsStartingPeriod(false);
        }, 500);
    }, []);

    return {
        currentPeriod,
        investorClashIn,
        startPeriod,
        isStartingPeriod,
    };
};

/**
 * Hook for managing restaurant-related functionality
 * @returns {Object} Restaurant-related data and functions
 */
export const useRestaurants = () => {
    const state = useGameState();

    const restaurants = state?.restaurants || { slots: [], bars: [] };

    const purchaseRestaurant = useCallback((slotId, restaurant) => {
        if (!gameState.initialized) {
            gameState.initialize();
        }
        gameState.purchaseRestaurant(slotId, restaurant);
    }, []);

    const getRestaurantById = useCallback(
        (id) => {
            return restaurants.bars.find((bar) => bar.id === id);
        },
        [restaurants.bars]
    );

    return {
        slots: restaurants.slots || [],
        bars: restaurants.bars || [],
        purchaseRestaurant,
        getRestaurantById,
    };
};

/**
 * Hook for managing employee-related functionality
 * @returns {Object} Employee-related data and functions
 */
export const useEmployees = () => {
    const state = useGameState();

    const employees = state?.employees || { roster: [], laborCost: 0 };

    const hireEmployee = useCallback((employee) => {
        if (!gameState.initialized) {
            gameState.initialize();
        }
        gameState.hireEmployee(employee);
    }, []);

    const getEmployeeById = useCallback(
        (id) => {
            return employees.roster.find((emp) => emp.id === id);
        },
        [employees.roster]
    );

    return {
        roster: employees.roster || [],
        laborCost: employees.laborCost || 0,
        hireEmployee,
        getEmployeeById,
    };
};

/**
 * Hook for managing social relationships and personal time
 * @returns {Object} Social-related data and functions
 */
export const useSocial = () => {
    const state = useGameState();

    const defaultSocial = {
        relationships: [],
        personalTime: { planned: "Home", history: [] },
    };

    const social = state?.social || defaultSocial;

    const schedulePesonalTime = useCallback((activity) => {
        if (!gameState.initialized) {
            gameState.initialize();
        }
        gameState.schedulePesonalTime(activity);
    }, []);

    return {
        relationships: social.relationships || [],
        personalTime: social.personalTime || { planned: "Home", history: [] },
        schedulePesonalTime,
    };
};

/**
 * Hook for financial management
 * @returns {Object} Financial data and functions
 */
export const useFinances = () => {
    const state = useGameState();

    const defaultFinances = {
        funds: 0,
        debt: { loans: [], totalDebt: 0, periodRepayment: 0 },
        expensesHistory: [],
        incomeHistory: [],
    };

    const finances = state?.finances || defaultFinances;

    // Format currency helper function
    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat("en-US").format(amount || 0) + " ¥";
    }, []);

    return {
        funds: finances.funds || 0,
        debt: finances.debt || { loans: [], totalDebt: 0, periodRepayment: 0 },
        expensesHistory: finances.expensesHistory || [],
        incomeHistory: finances.incomeHistory || [],
        formatCurrency,
    };
};

/**
 * Hook for player stats like burnout
 * @returns {Object} Player stats and related functions
 */
export const usePlayerStats = () => {
    const state = useGameState();

    const playerStats = state?.playerStats || {
        burnout: 0,
        burnoutHistory: [],
    };

    // Determine burnout severity
    const getBurnoutSeverity = useCallback(() => {
        const burnout = playerStats.burnout || 0;

        if (burnout >= 80) return "critical";
        if (burnout >= 60) return "high";
        if (burnout >= 40) return "medium";
        if (burnout >= 20) return "low";
        return "minimal";
    }, [playerStats.burnout]);

    return {
        burnout: playerStats.burnout || 0,
        burnoutHistory: playerStats.burnoutHistory || [],
        burnoutSeverity: getBurnoutSeverity(),
    };
};

/**
 * Hook for game buffs
 * @returns {Object} Active buffs and related functions
 */
export const useGameBuffs = () => {
    const state = useGameState();

    const buffs = state?.buffs?.active || [];

    const showBuffsPanel = useCallback(() => {
        if (!gameState.initialized) {
            gameState.initialize();
        }
        gameState.openBuffsPanel();
    }, []);

    return {
        activeBuffs: buffs,
        showBuffsPanel,
    };
};

