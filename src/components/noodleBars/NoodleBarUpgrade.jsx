import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import MenuContainer from "../common/MenuContainer";
import {
    UPGRADE_CATEGORIES,
    UPGRADE_COST_BY_LEVEL,
    CAP_INCREASE_PER_LEVEL,
} from "./constants/noodleBarConstants";
import gameState from "../../game/GameState";
import { useRestaurants, useFinances } from "../../store/gameStateHooks";
import ConfirmationModal from "./components/ConfirmationModal";

const NoodleBarUpgrade = ({ onBack }) => {
    const { slots: restaurantSlots, bars: noodleBars } = useRestaurants();
    const { funds, formatCurrency } = useFinances();

    const [selectedBar, setSelectedBar] = useState(null);
    const [showUpgradeDetails, setShowUpgradeDetails] = useState(false);
    const [upgradeDetailsPosition, setUpgradeDetailsPosition] = useState({
        x: 0,
        y: 0,
    });
    const [confirmationModal, setConfirmationModal] = useState({
        show: false,
        upgrade: null,
    });
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [hoveredUpgrade, setHoveredUpgrade] = useState(null);
    const [localFunds, setLocalFunds] = useState(funds);

    // Keep localFunds in sync with funds from hooks
    useEffect(() => {
        setLocalFunds(funds);
    }, [funds]);

    // Listen for restaurantUpgraded events to update UI immediately
    useEffect(() => {
        const handleRestaurantUpgraded = (data) => {
            if (selectedBar && selectedBar.id === data.restaurantId) {
                setSelectedBar((prevBar) => ({
                    ...prevBar,
                    salesVolume: prevBar.salesVolume + data.salesVolumeBonus,
                    upgrades: {
                        ...prevBar.upgrades,
                        [data.propertyId]: data.newLevel,
                    },
                    [data.propertyId === "product"
                        ? "productCap"
                        : data.propertyId === "service"
                        ? "serviceCap"
                        : "ambianceCap"]: data.newCap,
                }));

                // Update local funds
                setLocalFunds((prevFunds) => prevFunds - data.cost);
            }
        };

        gameState.events.on("restaurantUpgraded", handleRestaurantUpgraded);

        return () => {
            gameState.events.off(
                "restaurantUpgraded",
                handleRestaurantUpgraded
            );
        };
    }, [selectedBar]);

    // Set the first available restaurant as selected by default
    useEffect(() => {
        if (noodleBars.length > 0 && !selectedBar) {
            setSelectedBar(noodleBars[0]);
        }
    }, [noodleBars, selectedBar]);

    // Styles for consistency
    const styles = {
        container: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
        },
        header: {
            padding: "1rem",
            borderBottom: "1px solid rgba(49, 34, 24, 0.2)",
        },
        headerTitle: {
            fontSize: "2rem",
            fontWeight: "bold",
            color: "var(--color-principalBrown)",
        },
        headerSubtitle: {
            color: "var(--color-principalBrown)",
            opacity: 0.8,
        },
        backButton: (isHovered) => ({
            padding: "0.75rem 1.5rem",
            backgroundColor: isHovered
                ? "var(--color-principalBrown)"
                : "var(--color-yellowWhite)",
            color: isHovered
                ? "var(--color-whiteCream)"
                : "var(--color-principalBrown)",
            borderRadius: "0.375rem",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
        }),
        upgradeButton: (enabled, isHovered) => ({
            padding: "0.5rem 1rem",
            backgroundColor: enabled
                ? isHovered
                    ? "var(--color-principalRed-light)"
                    : "var(--color-principalRed)"
                : "#9CA3AF",
            color: "var(--color-whiteCream)",
            borderRadius: "0.375rem",
            fontWeight: "bold",
            border: "none",
            cursor: enabled ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
            opacity: enabled ? 1 : 0.7,
        }),
    };

    // Calculate upgrade cost based on the current level
    const calculateUpgradeCost = (currentLevel) => {
        return UPGRADE_COST_BY_LEVEL(currentLevel);
    };

    // Check if player can afford the upgrade
    const canAffordUpgrade = (cost) => {
        return localFunds >= cost;
    };

    // Handle restaurant selection
    const handleSelectBar = (bar) => {
        setSelectedBar(bar);
        setShowUpgradeDetails(true);

        // Calculate the position for the modal to appear in the right side
        const sidebarWidth = window.innerWidth * 0.333; // 33.333% of the window width
        const mainAreaWidth = window.innerWidth * 0.667; // 66.667% of the window width

        setUpgradeDetailsPosition({
            x: sidebarWidth + mainAreaWidth / 2,
            y: window.innerHeight / 2,
        });
    };

    // Handle close upgrade details
    const handleCloseUpgradeDetails = () => {
        setShowUpgradeDetails(false);
    };

    // Add event listener for window resize
    useEffect(() => {
        const handleResize = () => {
            if (showUpgradeDetails) {
                const sidebarWidth = window.innerWidth * 0.333;
                const mainAreaWidth = window.innerWidth * 0.667;

                setUpgradeDetailsPosition({
                    x: sidebarWidth + mainAreaWidth / 2,
                    y: window.innerHeight / 2,
                });
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [showUpgradeDetails]);

    // Get current level of an upgrade
    const getCurrentUpgradeLevel = useCallback((bar, categoryId) => {
        return bar?.upgrades?.[categoryId] || 1;
    }, []);

    // Get max level for a category (from restaurant's max values)
    const getMaxLevel = useCallback((bar, category) => {
        if (!bar) return 20; // Default fallback
        return bar[category.statMax] || 20; // maxProduct, maxService, or maxAmbiance
    }, []);

    // Get current stat cap value
    const getCurrentStatCap = useCallback((bar, category) => {
        if (!bar) return 100; // Default fallback
        return bar[category.statCap] || 100; // productCap, serviceCap, or ambianceCap
    }, []);

    // Handle upgrade click
    const handleUpgradeClick = (category) => {
        if (!selectedBar) return;

        const currentLevel = getCurrentUpgradeLevel(selectedBar, category.id);
        const maxLevel = getMaxLevel(selectedBar, category);

        // Check if already at max level
        if (currentLevel >= maxLevel) {
            return;
        }

        // Calculate cost
        const cost = calculateUpgradeCost(currentLevel);

        // Check if player can afford it
        if (!canAffordUpgrade(cost)) {
            return;
        }

        // Show confirmation modal
        setConfirmationModal({
            show: true,
            upgrade: {
                categoryId: category.id,
                categoryName: category.name,
                currentLevel,
                newLevel: currentLevel + 1,
                maxLevel: maxLevel,
                currentCap: getCurrentStatCap(selectedBar, category),
                newCap:
                    getCurrentStatCap(selectedBar, category) +
                    CAP_INCREASE_PER_LEVEL,
                salesVolumeBonus: Math.round(
                    selectedBar.salesVolume * category.salesVolumeBonus
                ),
                cost,
                barId: selectedBar.id,
            },
        });
    };

    // Handle confirmation
    const handleConfirmUpgrade = () => {
        const { upgrade } = confirmationModal;
        if (!upgrade) return;

        // Initialize gameState if needed
        if (!gameState.initialized) {
            gameState.initialize();
        }

        // Use gameState to upgrade restaurant - this will need to be updated in GameState.js to handle the new upgrade logic
        gameState.upgradeRestaurant(
            upgrade.barId,
            upgrade.categoryId,
            upgrade.newLevel,
            upgrade.cost,
            upgrade.newCap,
            upgrade.salesVolumeBonus
        );

        // Close the confirmation modal
        setConfirmationModal({ show: false, upgrade: null });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>Upgrade Noodle Bar</h2>
                <p style={styles.headerSubtitle}>
                    Improve your restaurants to increase profits and efficiency
                </p>
            </div>

            {/* Restaurant Selector */}
            <div className="p-4 flex-1 overflow-auto">
                <h3
                    className="text-lg font-semibold mb-3"
                    style={{ color: "var(--color-principalBrown)" }}
                >
                    Select Restaurant
                </h3>

                <div className="flex flex-col gap-3">
                    {restaurantSlots
                        .filter((slot) => slot.purchased && slot.barId)
                        .map((slot) => {
                            const bar = noodleBars.find(
                                (b) => b.id === slot.barId
                            );
                            if (!bar) return null;

                            // If this is the currently selected bar, use the selectedBar state
                            // which has the most up-to-date information
                            const displayBar =
                                selectedBar && selectedBar.id === bar.id
                                    ? selectedBar
                                    : bar;

                            return (
                                <div
                                    key={slot.id}
                                    className={`
                                        p-3 rounded-lg cursor-pointer transition-all duration-200 border
                                        ${
                                            selectedBar &&
                                            selectedBar.id === displayBar.id
                                                ? "bg-[color:var(--color-principalRed)] text-white border-[color:var(--color-principalRed-light)]"
                                                : "bg-[color:var(--color-whiteCream)] hover:bg-[color:var(--color-principalRed-light)] hover:text-white border-[color:var(--color-principalBrown)] border-opacity-20"
                                        }
                                    `}
                                    onClick={() => handleSelectBar(displayBar)}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex justify-between">
                                            <h4 className="font-bold text-lg">
                                                {displayBar.name}
                                            </h4>
                                            <div className="font-semibold">
                                                {formatCurrency(
                                                    displayBar.salesVolume || 0
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm opacity-80 mt-1">
                                            {displayBar.description}
                                        </p>
                                        <div className="mt-2 flex justify-between items-center">
                                            <div className="flex gap-2 text-xs">
                                                {UPGRADE_CATEGORIES.map(
                                                    (category) => (
                                                        <span key={category.id}>
                                                            {category.icon}{" "}
                                                            {getCurrentUpgradeLevel(
                                                                displayBar,
                                                                category.id
                                                            )}
                                                            /
                                                            {getMaxLevel(
                                                                displayBar,
                                                                category
                                                            )}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                            <div className="text-xs">
                                                Staff:{" "}
                                                {displayBar.staff.length || 0}/3
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* Upgrade details modal */}
            {showUpgradeDetails && selectedBar && (
                <div
                    className="fixed z-50 transition-all duration-500"
                    style={{
                        left: `${upgradeDetailsPosition.x}px`,
                        top: `${upgradeDetailsPosition.y}px`,
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <MenuContainer
                        animationState={
                            showUpgradeDetails ? "visible" : "hidden"
                        }
                        className="w-[750px] max-h-[80vh]"
                        scrollable={true}
                        maxHeight="80vh"
                        title={`Upgrade ${selectedBar.name}`}
                    >
                        <div className="p-4">
                            <div className="flex justify-between mb-4 items-center">
                                <div>
                                    <p className="italic text-[color:var(--color-principalBrown)] opacity-70">
                                        {selectedBar.description}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <span className="font-semibold text-[color:var(--color-principalBrown)] mr-2">
                                            Sales Volume:
                                        </span>
                                        <span className="text-emerald-600 font-bold">
                                            {formatCurrency(
                                                selectedBar.salesVolume || 0
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCloseUpgradeDetails}
                                    className="text-[color:var(--color-principalRed)] hover:text-[color:var(--color-principalRed-light)] transition-colors p-1"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line
                                            x1="18"
                                            y1="6"
                                            x2="6"
                                            y2="18"
                                        ></line>
                                        <line
                                            x1="6"
                                            y1="6"
                                            x2="18"
                                            y2="18"
                                        ></line>
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {UPGRADE_CATEGORIES.map((category) => {
                                    const currentLevel = getCurrentUpgradeLevel(
                                        selectedBar,
                                        category.id
                                    );
                                    const maxLevel = getMaxLevel(
                                        selectedBar,
                                        category
                                    );
                                    const currentCap = getCurrentStatCap(
                                        selectedBar,
                                        category
                                    );
                                    const isMaxLevel = currentLevel >= maxLevel;
                                    const upgradeCost =
                                        calculateUpgradeCost(currentLevel);
                                    const canAfford =
                                        canAffordUpgrade(upgradeCost);
                                    const isEnabled = !isMaxLevel && canAfford;
                                    const isHovered =
                                        hoveredUpgrade === category.id;

                                    // Calculate sales volume bonus (10% of current sales volume)
                                    const salesVolumeBonus = Math.round(
                                        selectedBar.salesVolume *
                                            category.salesVolumeBonus
                                    );

                                    return (
                                        <div
                                            key={category.id}
                                            className={`
                                                bg-[color:var(--color-yellowWhite)] 
                                                p-4 rounded-lg transition-all duration-200
                                                ${
                                                    isEnabled
                                                        ? "hover:shadow-md"
                                                        : "opacity-90"
                                                }
                                                border border-[color:var(--color-yellowWhite-dark)]
                                            `}
                                            onMouseEnter={() =>
                                                setHoveredUpgrade(category.id)
                                            }
                                            onMouseLeave={() =>
                                                setHoveredUpgrade(null)
                                            }
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-3xl">
                                                            {category.icon}
                                                        </span>
                                                        <div>
                                                            <h4
                                                                className="font-bold text-lg"
                                                                style={{
                                                                    color: "var(--color-principalBrown)",
                                                                }}
                                                            >
                                                                {category.name}
                                                            </h4>
                                                            <p
                                                                className="text-sm opacity-80"
                                                                style={{
                                                                    color: "var(--color-principalBrown)",
                                                                }}
                                                            >
                                                                {
                                                                    category.description
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Level indicator */}
                                                    <div className="mt-3 flex items-center">
                                                        <div
                                                            className="text-sm font-semibold mr-2"
                                                            style={{
                                                                color: "var(--color-principalBrown)",
                                                            }}
                                                        >
                                                            Level:{" "}
                                                            {currentLevel}/
                                                            {maxLevel}
                                                        </div>
                                                        <div className="flex-1 bg-[color:var(--color-whiteCream)] h-2 rounded-full">
                                                            <div
                                                                className="bg-[color:var(--color-principalRed)] h-2 rounded-full"
                                                                style={{
                                                                    width: `${
                                                                        (currentLevel /
                                                                            maxLevel) *
                                                                        100
                                                                    }%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* Current Cap */}
                                                    <div className="mt-2 text-sm text-[color:var(--color-principalBrown)]">
                                                        Current{" "}
                                                        {category.statCap.replace(
                                                            "Cap",
                                                            ""
                                                        )}
                                                        : {currentCap}
                                                        {!isMaxLevel && (
                                                            <span className="text-emerald-600 ml-2">
                                                                (+
                                                                {
                                                                    CAP_INCREASE_PER_LEVEL
                                                                }{" "}
                                                                per upgrade)
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Sales Volume Bonus */}
                                                    {!isMaxLevel && (
                                                        <div className="mt-1 text-sm text-emerald-600">
                                                            +
                                                            {formatCurrency(
                                                                salesVolumeBonus
                                                            )}{" "}
                                                            sales volume (+10%)
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="ml-4 flex flex-col items-end">
                                                    {!isMaxLevel ? (
                                                        <>
                                                            <div
                                                                className={`text-sm font-bold mb-2 ${
                                                                    canAfford
                                                                        ? "text-emerald-600"
                                                                        : "text-red-500"
                                                                }`}
                                                            >
                                                                {formatCurrency(
                                                                    upgradeCost
                                                                )}
                                                            </div>
                                                            <button
                                                                style={styles.upgradeButton(
                                                                    isEnabled,
                                                                    isHovered
                                                                )}
                                                                onClick={() =>
                                                                    isEnabled &&
                                                                    handleUpgradeClick(
                                                                        category
                                                                    )
                                                                }
                                                                disabled={
                                                                    !isEnabled
                                                                }
                                                                className="px-6 py-2"
                                                            >
                                                                Upgrade
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="text-sm font-bold text-emerald-600 bg-emerald-100 px-4 py-2 rounded">
                                                            MAX LEVEL
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleCloseUpgradeDetails}
                                    className="px-6 py-2 bg-[color:var(--color-principalRed)] text-[color:var(--color-whiteCream)] font-bold rounded-md hover:bg-[color:var(--color-principalRed-light)] transition-all duration-300 transform hover:scale-105"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </MenuContainer>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                show={confirmationModal.show}
                onCancel={() =>
                    setConfirmationModal({ show: false, upgrade: null })
                }
                onConfirm={handleConfirmUpgrade}
                upgradeDetails={
                    confirmationModal.upgrade
                        ? {
                              ...confirmationModal.upgrade,
                              currentFunds: localFunds,
                              capIncrease: CAP_INCREASE_PER_LEVEL,
                          }
                        : null
                }
                title="Confirm Upgrade"
            />

            {/* Back Button */}
            <div className="fixed bottom-0 left-0 w-1/3 p-4 border-t border-[color:var(--color-principalBrown)] border-opacity-20 bg-[color:var(--color-yellowWhite)] flex justify-between z-10">
                <button
                    onClick={onBack}
                    onMouseEnter={() => setHoveredMenuItem("Back")}
                    onMouseLeave={() => setHoveredMenuItem(null)}
                    style={styles.backButton(hoveredMenuItem === "Back")}
                >
                    Back
                </button>
            </div>
        </div>
    );
};

NoodleBarUpgrade.propTypes = {
    onBack: PropTypes.func.isRequired,
};

export default NoodleBarUpgrade;

