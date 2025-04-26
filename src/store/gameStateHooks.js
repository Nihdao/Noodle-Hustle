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

    // Récupère les données complètes d'un restaurant à partir de son ID
    const getRestaurantById = useCallback(
        (id) => {
            const restaurantInstance = restaurants.bars.find(
                (bar) => bar.id === id
            );
            if (!restaurantInstance) return null;

            // Si le restaurant est personnalisé (sans référence), retourner directement
            if (!restaurantInstance.restaurantId) return restaurantInstance;

            // Récupérer les données de base du restaurant depuis la référence
            const baseRestaurantData = gameState.getRestaurantData(
                restaurantInstance.restaurantId
            );

            if (!baseRestaurantData) return restaurantInstance; // Fallback

            // Combiner les données de base avec les données d'instance
            return {
                ...baseRestaurantData,
                ...restaurantInstance,
                // Garder les propriétés d'instance qui doivent remplacer celles de base
                id: restaurantInstance.id,
                maintenance: restaurantInstance.maintenance,
                upgrades: restaurantInstance.upgrades,
                staffCost: restaurantInstance.staffCost,
            };
        },
        [restaurants.bars]
    );

    // Renvoie la liste complète des restaurants avec données combinées
    const getBarsWithDetails = useCallback(() => {
        return restaurants.bars.map((bar) => {
            // Si le restaurant est personnalisé (sans référence), retourner directement
            if (!bar.restaurantId) {
                // S'assurer que certaines propriétés sont toujours présentes
                return {
                    ...bar,
                    staff: bar.staff || [],
                    maintenance: bar.maintenance || 0,
                    upgrades: bar.upgrades || {
                        cuisine: 1,
                        service: 1,
                        ambiance: 1,
                        salesVolume: 1,
                    },
                    staffCost: bar.staffCost || 0,
                    maxSales: bar.maxSales || 1000,
                    maxProduct: bar.maxProduct || 100,
                    maxService: bar.maxService || 100,
                    maxAmbiance: bar.maxAmbiance || 100,
                    serviceCap: bar.serviceCap || 100,
                    productCap: bar.productCap || 100,
                    ambianceCap: bar.ambianceCap || 100,
                    salesVolume: bar.salesVolume || bar.baseProfit || 0,
                };
            }

            const baseData = gameState.getRestaurantData(bar.restaurantId);
            if (!baseData) {
                // Si les données de base ne sont pas trouvées, s'assurer au moins des propriétés essentielles
                return {
                    ...bar,
                    staff: bar.staff || [],
                    maintenance: bar.maintenance || 0,
                    upgrades: bar.upgrades || {
                        cuisine: 1,
                        service: 1,
                        ambiance: 1,
                        salesVolume: 1,
                    },
                    staffCost: bar.staffCost || 0,
                    maxSales: bar.maxSales || 1000,
                    maxProduct: bar.maxProduct || 100,
                    maxService: bar.maxService || 100,
                    maxAmbiance: bar.maxAmbiance || 100,
                    serviceCap: bar.serviceCap || 100,
                    productCap: bar.productCap || 100,
                    ambianceCap: bar.ambianceCap || 100,
                    salesVolume: bar.salesVolume || bar.baseProfit || 0,
                };
            }

            return {
                ...baseData,
                ...bar,
                id: bar.id,
                staff: bar.staff || [],
                maintenance: bar.maintenance || baseData.maintenance || 0,
                upgrades: bar.upgrades ||
                    baseData.upgrades || {
                        cuisine: 1,
                        service: 1,
                        ambiance: 1,
                        salesVolume: 1,
                    },
                staffCost: bar.staffCost || baseData.staffCost || 0,
                serviceCap: bar.serviceCap || baseData.serviceCap || 100,
                productCap: bar.productCap || baseData.productCap || 100,
                ambianceCap: bar.ambianceCap || baseData.ambianceCap || 100,
                salesVolume:
                    bar.salesVolume ||
                    baseData.salesVolume ||
                    bar.baseProfit ||
                    0,
            };
        });
    }, [restaurants.bars]);

    return {
        slots: restaurants.slots || [],
        bars: getBarsWithDetails() || [],
        rawBars: restaurants.bars || [],
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

    // Récupère les données complètes d'un employé à partir de son ID d'instance
    const getEmployeeById = useCallback(
        (id) => {
            const employeeInstance = employees.roster.find(
                (emp) => emp.id === id
            );
            if (!employeeInstance) return null;

            // Récupérer les données de base de l'employé depuis la référence
            const baseEmployeeData = gameState.getEmployeeData(
                employeeInstance.employeeId
            );

            if (!baseEmployeeData) return employeeInstance; // Fallback

            // Combiner les données de base avec les données d'instance
            return {
                ...baseEmployeeData,
                ...employeeInstance,
                // Garder les propriétés d'instance qui doivent remplacer celles de base
                id: employeeInstance.id,
                salary: employeeInstance.salary,
                level: employeeInstance.level,
                morale: employeeInstance.morale,
                assigned: employeeInstance.assigned,
            };
        },
        [employees.roster]
    );

    // Renvoie la liste complète des employés avec données combinées
    const getRosterWithDetails = useCallback(() => {
        return employees.roster.map((emp) => {
            const baseData = gameState.getEmployeeData(emp.employeeId);
            if (!baseData) return emp;

            return {
                ...baseData,
                ...emp,
                id: emp.id,
                salary: emp.salary,
                level: emp.level,
                morale: emp.morale,
                assigned: emp.assigned,
            };
        });
    }, [employees.roster]);

    // Entraîner un employé (augmenter son niveau)
    const trainEmployee = useCallback((employeeId, trainingCost) => {
        if (!gameState.initialized) {
            gameState.initialize();
        }
        gameState.trainEmployee(employeeId, trainingCost);
    }, []);

    // Donner un cadeau à un employé (augmenter le moral)
    const giftEmployee = useCallback((employeeId, giftCost) => {
        if (!gameState.initialized) {
            gameState.initialize();
        }
        gameState.giftEmployee(employeeId, giftCost);
    }, []);

    // Licencier un employé
    const fireEmployee = useCallback((employeeId, severanceCost) => {
        if (!gameState.initialized) {
            gameState.initialize();
        }
        gameState.fireEmployee(employeeId, severanceCost);
    }, []);

    return {
        roster: employees.roster || [],
        rosterWithDetails: getRosterWithDetails(),
        laborCost: employees.laborCost || 0,
        hireEmployee,
        getEmployeeById,
        trainEmployee,
        giftEmployee,
        fireEmployee,
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

    // Récupère les données détaillées d'un confidant
    const getConfidantDetails = useCallback(
        (npcId) => {
            const relationship = social.relationships.find(
                (rel) => rel.npcId === npcId
            );
            if (!relationship) return null;

            // Récupérer les données de base du confidant
            const baseConfidantData = gameState.getConfidantData(npcId);
            if (!baseConfidantData) return relationship;

            // Combiner les données
            return {
                ...baseConfidantData,
                ...relationship,
                npcId: relationship.npcId,
                level: relationship.level,
                interactions: relationship.interactions,
                nextMeetingScheduled: relationship.nextMeetingScheduled,
            };
        },
        [social.relationships]
    );

    // Renvoie la liste complète des relations avec détails
    const getRelationshipsWithDetails = useCallback(() => {
        return social.relationships.map((rel) => {
            const baseData = gameState.getConfidantData(rel.npcId);
            if (!baseData) return rel;

            return {
                ...baseData,
                ...rel,
                npcId: rel.npcId,
                level: rel.level,
                interactions: rel.interactions,
                nextMeetingScheduled: rel.nextMeetingScheduled,
            };
        });
    }, [social.relationships]);

    return {
        relationships: getRelationshipsWithDetails() || [],
        rawRelationships: social.relationships || [],
        personalTime: social.personalTime || { planned: "Home", history: [] },
        socialActionDoneInPeriod: social.socialActionDoneInPeriod || false,
        schedulePesonalTime,
        getConfidantDetails,
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
        return "¥" + new Intl.NumberFormat("en-US").format(amount || 0);
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

    // Renvoie les buffs avec leurs détails complets
    const getBuffsWithDetails = useCallback(() => {
        return buffs.map((buff) => {
            // Si le buff contient déjà toutes les données nécessaires
            if (!buff.buffId) return buff;

            // Récupérer les données de base du buff
            const baseBuffData = gameState.getBuffData(buff.buffId);
            if (!baseBuffData) return buff;

            // Combiner les données
            return {
                ...baseBuffData,
                ...buff,
                id: buff.id, // Garder l'ID d'instance
                level: buff.level,
                source: buff.source,
            };
        });
    }, [buffs]);

    return {
        activeBuffs: getBuffsWithDetails(),
        rawBuffs: buffs,
        showBuffsPanel,
    };
};

/**
 * Hook for Noodle Bar operations that centralizes common functionalities
 * @returns {Object} Noodle Bar operations and related functions
 */
export const useNoodleBarOperations = () => {
    const { rosterWithDetails: allEmployees } = useEmployees();
    const { bars: noodleBars } = useRestaurants();
    const state = useGameState();

    // Get restaurant staff
    const getRestaurantStaff = useCallback(
        (restaurantId) => {
            return allEmployees.filter((emp) => emp.assigned === restaurantId);
        },
        [allEmployees]
    );

    // Get restaurant name by ID
    const getRestaurantNameById = useCallback(
        (restaurantId) => {
            const restaurant = noodleBars.find(
                (bar) => bar.id === restaurantId
            );
            return restaurant ? restaurant.name : `Restaurant ${restaurantId}`;
        },
        [noodleBars]
    );

    // Assign employee to restaurant
    const assignEmployee = useCallback(
        (employee, barId) => {
            if (!gameState.initialized) {
                gameState.initialize();
            }

            // Utiliser la méthode updateGameState pour mettre à jour l'état correctement
            gameState.updateGameState((state) => {
                // Récupérer le restaurant cible
                const targetRestaurant = state.restaurants.bars.find(
                    (bar) => bar.id === barId
                );

                if (!targetRestaurant) return state; // Si le restaurant n'existe pas, ne rien faire

                // Trouver l'ancien restaurant de l'employé (s'il existait)
                const oldRestaurantId = employee.assigned;

                // Mettre à jour l'employé dans le roster
                const updatedRoster = state.employees.roster.map((emp) =>
                    emp.id === employee.id
                        ? {
                              ...emp,
                              assigned: barId,
                              assignedName: getRestaurantNameById(barId),
                          }
                        : emp
                );

                // Mettre à jour les restaurants
                const updatedBars = state.restaurants.bars.map((bar) => {
                    // Cas 1: C'est le restaurant cible - ajouter l'employé
                    if (bar.id === barId) {
                        // Créer un tableau de staff s'il n'existe pas
                        const currentStaff = bar.staff || [];

                        // Vérifier si l'employé est déjà dans ce restaurant
                        if (!currentStaff.includes(employee.id)) {
                            // Calculer le nouveau coût total des salaires
                            const newStaffCost =
                                (bar.staffCost || 0) + (employee.salary || 0);

                            return {
                                ...bar,
                                staff: [...currentStaff, employee.id],
                                staffCost: newStaffCost,
                            };
                        }
                        return bar; // Déjà dans ce restaurant, ne rien faire
                    }

                    // Cas 2: C'est l'ancien restaurant de l'employé - le retirer
                    else if (bar.id === oldRestaurantId) {
                        const currentStaff = bar.staff || [];
                        const updatedStaff = currentStaff.filter(
                            (id) => id !== employee.id
                        );

                        // Calculer le nouveau coût total des salaires
                        const newStaffCost =
                            (bar.staffCost || 0) - (employee.salary || 0);

                        return {
                            ...bar,
                            staff: updatedStaff,
                            staffCost: Math.max(0, newStaffCost), // Éviter les valeurs négatives
                        };
                    }

                    // Cas 3: Autres restaurants - ne rien changer
                    return bar;
                });

                return {
                    ...state,
                    employees: {
                        ...state.employees,
                        roster: updatedRoster,
                    },
                    restaurants: {
                        ...state.restaurants,
                        bars: updatedBars,
                    },
                };
            });
        },
        [getRestaurantNameById]
    );

    // Remove employee from restaurant
    const removeEmployeeFromRestaurant = useCallback((employeeId) => {
        if (!gameState.initialized) {
            gameState.initialize();
        }

        // Utiliser la méthode updateGameState pour mettre à jour l'état correctement
        gameState.updateGameState((state) => {
            // Trouver l'employé
            const employee = state.employees.roster.find(
                (emp) => emp.id === employeeId
            );
            if (!employee) return state; // Si l'employé n'existe pas, ne rien faire

            // Trouver le restaurant associé
            const restaurantId = employee.assigned;
            if (!restaurantId) return state; // Si l'employé n'est pas assigné, ne rien faire

            // Mettre à jour l'employé dans le roster pour le désassigner
            const updatedRoster = state.employees.roster.map((emp) =>
                emp.id === employeeId
                    ? {
                          ...emp,
                          assigned: null,
                          assignedName: null,
                      }
                    : emp
            );

            // Mettre à jour le restaurant
            const updatedBars = state.restaurants.bars.map((bar) => {
                if (bar.id === restaurantId) {
                    const currentStaff = bar.staff || [];
                    const updatedStaff = currentStaff.filter(
                        (id) => id !== employeeId
                    );

                    // Calculer le nouveau coût total des salaires
                    const newStaffCost =
                        (bar.staffCost || 0) - (employee.salary || 0);

                    return {
                        ...bar,
                        staff: updatedStaff,
                        staffCost: Math.max(0, newStaffCost), // Éviter les valeurs négatives
                    };
                }
                return bar;
            });

            return {
                ...state,
                employees: {
                    ...state.employees,
                    roster: updatedRoster,
                },
                restaurants: {
                    ...state.restaurants,
                    bars: updatedBars,
                },
            };
        });
    }, []);

    // Handle UI for assigning employee
    const handleAssignEmployee = useCallback(
        (employee, targetBarId, targetBarName) => {
            // Check if restaurant staff is full
            const currentStaff = getRestaurantStaff(targetBarId);
            const targetBar = noodleBars.find((bar) => bar.id === targetBarId);
            const maxStaff = targetBar?.staffSlots || 3;

            if (currentStaff.length >= maxStaff) {
                return false; // Restaurant is full
            }

            // If employee is already assigned elsewhere, show confirmation
            if (employee.assigned && employee.assigned !== targetBarId) {
                return {
                    needsConfirmation: true,
                    employee,
                    targetBar:
                        targetBarName || getRestaurantNameById(targetBarId),
                    targetBarId,
                };
            }

            // If not assigned or already in this restaurant, proceed directly
            assignEmployee(employee, targetBarId);
            return true;
        },
        [assignEmployee, getRestaurantNameById, getRestaurantStaff, noodleBars]
    );

    // Upgrade restaurant
    const upgradeRestaurant = useCallback(
        (barId, categoryId, newLevel, cost) => {
            if (!gameState.initialized) {
                gameState.initialize();
            }

            // Utiliser la méthode updateGameState pour mettre à jour l'état correctement
            gameState.updateGameState((state) => {
                // Trouver le restaurant à mettre à jour
                const updatedBars = state.restaurants.bars.map((bar) => {
                    if (bar.id === barId) {
                        // Mettre à jour la catégorie spécifique du restaurant
                        const upgrades = {
                            ...(bar.upgrades || {}),
                            [categoryId]: newLevel,
                        };

                        return {
                            ...bar,
                            upgrades,
                        };
                    }
                    return bar;
                });

                // Déduire le coût des fonds
                return {
                    ...state,
                    restaurants: {
                        ...state.restaurants,
                        bars: updatedBars,
                    },
                    finances: {
                        ...state.finances,
                        funds: state.finances.funds - cost,
                        expensesHistory: [
                            ...state.finances.expensesHistory,
                            {
                                amount: cost,
                                source: `Upgraded ${categoryId} for restaurant ${barId}`,
                                period: state.gameProgress.currentPeriod,
                            },
                        ],
                    },
                };
            });
        },
        []
    );

    // Sell restaurant
    const sellRestaurant = useCallback((slotId, barId, sellPrice) => {
        if (!gameState.initialized) {
            gameState.initialize();
        }

        // Utiliser la méthode updateGameState pour mettre à jour l'état correctement
        gameState.updateGameState((state) => {
            // Find employees assigned to the bar being sold
            const employeesToUnassign = state.employees.roster.filter(
                (emp) => emp.assigned === barId
            );

            // Create an updated roster with unassigned employees
            let updatedRoster = state.employees.roster;
            if (employeesToUnassign.length > 0) {
                console.log(
                    `Unassigning ${employeesToUnassign.length} employees from bar ${barId}`
                );
                updatedRoster = state.employees.roster.map((emp) => {
                    if (emp.assigned === barId) {
                        return {
                            ...emp,
                            assigned: null,
                            assignedName: null, // Clear assigned name as well
                        };
                    }
                    return emp;
                });
            }

            // Marquer le slot comme non acheté
            const updatedSlots = state.restaurants.slots.map((slot) =>
                slot.id === slotId
                    ? { ...slot, purchased: false, barId: null }
                    : slot
            );

            // Retirer le restaurant de la liste
            const updatedBars = state.restaurants.bars.filter(
                (bar) => bar.id !== barId
            );

            // Ajouter le prix de vente aux fonds
            return {
                ...state,
                restaurants: {
                    ...state.restaurants,
                    slots: updatedSlots,
                    bars: updatedBars,
                },
                finances: {
                    ...state.finances,
                    funds: state.finances.funds + sellPrice,
                    incomeHistory: [
                        ...state.finances.incomeHistory,
                        {
                            amount: sellPrice,
                            source: `Sold restaurant ${barId}`,
                            period: state.gameProgress.currentPeriod,
                        },
                    ],
                },
                employees: {
                    // Update the employees state with the potentially modified roster
                    ...state.employees,
                    roster: updatedRoster,
                },
            };
        });
    }, []);

    // Calculate forecasted total profit including maluses
    const getForcastedTotalProfit = useCallback(() => {
        return noodleBars.reduce((total, bar) => {
            // Get base values or defaults
            const salesVolume =
                bar.salesVolume ||
                bar.forecastedProfit ||
                bar.baseProfit ||
                5000;
            const staffCost = bar.staffCost || 0;
            const maintenance = bar.maintenance || 100;

            // Get restaurant staff
            const staff = getRestaurantStaff(bar.id);

            // Get target caps from restaurant
            const cuisineTarget = bar.productCap || bar.maxProduct || 40;
            const serviceTarget = bar.serviceCap || bar.maxService || 20;
            const ambianceTarget = bar.ambianceCap || bar.maxAmbiance || 10;

            // Calculate total stats from staff
            const totalCuisine = staff.reduce(
                (sum, emp) => sum + (emp.cuisine || 0),
                0
            );
            const totalService = staff.reduce(
                (sum, emp) => sum + (emp.service || 0),
                0
            );
            const totalAmbiance = staff.reduce(
                (sum, emp) => sum + (emp.ambiance || 0),
                0
            );

            // Count unmet criteria
            let criteresNonRemplis = 0;
            if (totalCuisine < cuisineTarget) criteresNonRemplis++;
            if (totalService < serviceTarget) criteresNonRemplis++;
            if (totalAmbiance < ambianceTarget) criteresNonRemplis++;

            // Calculate malus
            let malusPercentage = 0;
            if (criteresNonRemplis === 1) malusPercentage = 30;
            else if (criteresNonRemplis === 2) malusPercentage = 60;
            else if (criteresNonRemplis === 3) malusPercentage = 100;

            // Apply malus to sales volume
            const malusAmount =
                criteresNonRemplis > 0
                    ? Math.round(salesVolume * (malusPercentage / 100))
                    : 0;

            // Calculate net profit for this restaurant
            const restaurantProfit =
                salesVolume - staffCost - maintenance - malusAmount;

            return total + restaurantProfit;
        }, 0);
    }, [noodleBars, getRestaurantStaff]);

    return {
        getRestaurantStaff,
        getRestaurantNameById,
        assignEmployee,
        removeEmployeeFromRestaurant,
        handleAssignEmployee,
        upgradeRestaurant,
        sellRestaurant,
        getForcastedTotalProfit,
        playerRank: state?.gameProgress?.businessRank || 200,
    };
};

