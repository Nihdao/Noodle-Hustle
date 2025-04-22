import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import RestaurantSlot from "./components/RestaurantSlot";
import ConfirmationModal from "./components/ConfirmationModal";
import MenuContainer from "../common/MenuContainer";
import {
    getAvailableSlots,
    getSlotStatus,
    getNextRankUnlock,
} from "./utils/restaurantUtils";
import {
    useRestaurants,
    useFinances,
    useNoodleBarOperations,
} from "../../store/gameStateHooks";
import restaurantsData from "../../data/restaurants.json";

const NoodleBarBuySell = ({ onBack, playerRank }) => {
    const {
        slots: restaurantSlots,
        bars: noodleBars,
        purchaseRestaurant,
    } = useRestaurants();
    const { funds, formatCurrency } = useFinances();
    const { playerRank: statePlayerRank, sellRestaurant } =
        useNoodleBarOperations();

    // Use player rank from props or state
    const actualPlayerRank = playerRank || statePlayerRank;

    const [hoveredBar, setHoveredBar] = useState(null);
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState({
        show: false,
        action: null, // "buy" or "sell"
        slot: null,
        bar: null,
        cost: 0,
        sellPrice: 0,
    });
    const [showRestaurantMenu, setShowRestaurantMenu] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [availableRestaurants, setAvailableRestaurants] = useState([]);

    // Get all available restaurants from data file
    useEffect(() => {
        // Map to actual restaurant data to display in list
        const ownedRestaurantIds = noodleBars
            .filter((bar) => bar.restaurantId)
            .map((bar) => bar.restaurantId);

        // Filter out restaurants that are already owned (by template ID)
        const restaurants = restaurantsData.filter(
            (bar) => !ownedRestaurantIds.includes(bar.id)
        );

        setAvailableRestaurants(restaurants);
    }, [restaurantSlots, noodleBars]);

    // Styles for consistency with other components
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
        actionButton: (isEnabled, isHovered) => ({
            padding: "0.5rem 1rem",
            backgroundColor: isEnabled
                ? isHovered
                    ? "var(--color-principalRed-light)"
                    : "var(--color-principalRed)"
                : "#9CA3AF",
            color: "var(--color-whiteCream)",
            borderRadius: "0.375rem",
            fontWeight: "bold",
            border: "none",
            cursor: isEnabled ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
            opacity: isEnabled ? 1 : 0.7,
        }),
    };

    // Calculate number of available slots based on player rank
    const availableSlots = getAvailableSlots(actualPlayerRank);
    const nextRankUnlock = getNextRankUnlock(actualPlayerRank);

    const handleMouseEnter = (bar) => {
        setHoveredBar(bar);
    };

    const handleMouseLeave = () => {
        setHoveredBar(null);
    };

    // Handle buy restaurant
    const handleBuyRestaurant = (slot, bar) => {
        // Check if player has enough funds
        if (funds < bar.basePrice) {
            return; // Not enough funds
        }

        setConfirmationModal({
            show: true,
            action: "buy",
            slot,
            bar,
            cost: bar.basePrice,
        });
        setShowRestaurantMenu(false);
    };

    // Handle sell restaurant
    const handleSellRestaurant = (slot, bar) => {
        // Prevent selling Noodles Original
        if (bar.name === "Noodles Original" || !bar.sellable) {
            return;
        }

        setConfirmationModal({
            show: true,
            action: "sell",
            slot,
            bar,
            sellPrice: Math.floor(bar.purchasePrice * 0.7), // 70% of purchase price
        });
    };

    // Handle showing the restaurant menu
    const handleShowRestaurantMenu = (slot) => {
        setSelectedSlot(slot);

        // Calculate position for the modal
        const sidebarWidth = window.innerWidth * 0.333; // 33.333% of the window width
        const mainAreaWidth = window.innerWidth * 0.667; // 66.667% of the window width

        setMenuPosition({
            x: sidebarWidth + mainAreaWidth / 2,
            y: window.innerHeight / 2,
        });

        setShowRestaurantMenu(true);
    };

    // Add event listener for window resize
    useEffect(() => {
        const handleResize = () => {
            if (showRestaurantMenu) {
                const sidebarWidth = window.innerWidth * 0.333;
                const mainAreaWidth = window.innerWidth * 0.667;

                setMenuPosition({
                    x: sidebarWidth + mainAreaWidth / 2,
                    y: window.innerHeight / 2,
                });
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [showRestaurantMenu]);

    // Handle confirmation actions
    const handleConfirmAction = () => {
        const { action, slot, bar } = confirmationModal;

        if (action === "buy") {
            // Use the gameState function to purchase restaurant
            const newRestaurant = {
                id: Date.now(), // Generate unique ID for instance
                restaurantId: bar.id, // Reference to template restaurant
                name: bar.name,
                description: bar.description,
                purchasePrice: bar.basePrice,
                baseProfit: bar.baseProfit || bar.salesVolume || 0,
                staffSlots: bar.staffSlots || 3,
                unlocked: true,
                sellable: bar.sellable !== false,
                upgrades: {
                    cuisine: 1,
                    service: 1,
                    ambiance: 1,
                    salesVolume: 1,
                },
            };

            purchaseRestaurant(slot.id, newRestaurant);
        } else if (action === "sell") {
            // Use the centralized sellRestaurant function
            sellRestaurant(
                slot.id,
                bar.id,
                Math.floor(bar.purchasePrice * 0.7)
            );
        }

        // Close confirmation modal
        setConfirmationModal({
            show: false,
            action: null,
            slot: null,
            bar: null,
            cost: 0,
            sellPrice: 0,
        });
    };

    // Prepare details object for the confirmation modal
    const getBuySellDetails = () => {
        if (!confirmationModal.show) return null;

        if (confirmationModal.action === "buy") {
            return {
                barName: confirmationModal.bar?.name || "",
                price: confirmationModal.cost || 0,
                action: "buy",
                currentFunds: funds,
            };
        } else if (confirmationModal.action === "sell") {
            return {
                barName: confirmationModal.bar?.name || "",
                price: confirmationModal.sellPrice || 0,
                action: "sell",
                currentFunds: funds,
            };
        }

        return null;
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>Buy & Sell Restaurants</h2>
                <p style={styles.headerSubtitle}>
                    Manage your restaurant portfolio
                </p>
                <div className="mt-2 flex items-center justify-between">
                    <div className="font-medium">
                        Available Funds:{" "}
                        <span className="text-emerald-600 font-bold">
                            {formatCurrency(funds)}
                        </span>
                    </div>
                    <div className="font-medium">
                        Slots Used:{" "}
                        <span className="font-bold">
                            {
                                restaurantSlots.filter((slot) => slot.purchased)
                                    .length
                            }
                            /{availableSlots}
                        </span>
                    </div>
                </div>
            </div>

            {/* Restaurant Slots Section */}
            <div className="border-b border-[color:var(--color-principalBrown)] border-opacity-20 p-4">
                <h3
                    className="text-lg font-semibold mb-3"
                    style={{ color: "var(--color-principalBrown)" }}
                >
                    Your Restaurants
                </h3>

                <div className="flex flex-col gap-3">
                    {restaurantSlots.map((slot, index) => {
                        const status = getSlotStatus(index, availableSlots);
                        const bar = slot.barId
                            ? noodleBars.find((b) => b.id === slot.barId)
                            : null;
                        const isHovered =
                            hoveredBar && bar && hoveredBar.id === bar.id;

                        return (
                            <div key={slot.id} className="relative">
                                <RestaurantSlot
                                    slot={slot}
                                    status={status}
                                    index={index}
                                    bar={bar}
                                    isHovered={isHovered}
                                    formatCurrency={formatCurrency}
                                    onMouseEnter={() =>
                                        bar && handleMouseEnter(bar)
                                    }
                                    onMouseLeave={handleMouseLeave}
                                    onSelect={() =>
                                        status === "available" &&
                                        handleShowRestaurantMenu(slot)
                                    }
                                />

                                {/* Add sell button - avoid overlapping with arrows by using flex-end alignment */}
                                {status === "purchased" && bar && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-row-reverse">
                                        <button
                                            className={`
                                                px-3 py-1 rounded text-sm font-medium ml-12
                                                ${
                                                    !bar.sellable ||
                                                    bar.name ===
                                                        "Noodles Original"
                                                        ? "bg-gray-300 cursor-not-allowed opacity-50"
                                                        : "bg-red-500 hover:bg-red-600 text-white"
                                                }
                                            `}
                                            onClick={() =>
                                                bar.sellable &&
                                                bar.name !==
                                                    "Noodles Original" &&
                                                handleSellRestaurant(slot, bar)
                                            }
                                            disabled={
                                                !bar.sellable ||
                                                bar.name === "Noodles Original"
                                            }
                                        >
                                            Sell
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {nextRankUnlock && (
                    <p
                        className="mt-3 text-sm italic"
                        style={{
                            color: "var(--color-principalBrown)",
                            opacity: 0.8,
                        }}
                    >
                        Reach rank {nextRankUnlock} to unlock your next
                        restaurant slot!
                    </p>
                )}
            </div>

            {/* Restaurant Menu Modal */}
            {showRestaurantMenu && selectedSlot && (
                <div
                    className="fixed z-50 transition-all duration-500"
                    style={{
                        left: `${menuPosition.x}px`,
                        top: `${menuPosition.y}px`,
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <MenuContainer
                        animationState={
                            showRestaurantMenu ? "visible" : "hidden"
                        }
                        className="w-[750px] max-h-[80vh]"
                        scrollable={true}
                        maxHeight="80vh"
                        title="Available Restaurants"
                    >
                        <div className="p-4">
                            <div className="flex justify-between mb-4 items-center">
                                <div>
                                    <p className="italic text-[color:var(--color-principalBrown)] opacity-70">
                                        Select a restaurant to purchase for slot
                                        #{selectedSlot.id}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="font-semibold text-[color:var(--color-principalBrown)] block mb-1">
                                        Available Funds:
                                    </span>
                                    <span className="text-emerald-600 font-bold text-lg">
                                        {formatCurrency(funds)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowRestaurantMenu(false)}
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

                            <div className="space-y-4">
                                {availableRestaurants.length === 0 ? (
                                    <p className="text-center text-[color:var(--color-principalBrown)] py-8">
                                        You already own all available
                                        restaurants!
                                    </p>
                                ) : (
                                    availableRestaurants.map((bar) => (
                                        <div
                                            key={bar.id}
                                            className="bg-[color:var(--color-yellowWhite)] p-4 rounded-lg border border-[color:var(--color-yellowWhite-dark)] transition-all duration-200 hover:shadow-md"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4
                                                        className="font-bold text-lg"
                                                        style={{
                                                            color: "var(--color-principalBrown)",
                                                        }}
                                                    >
                                                        {bar.name}
                                                    </h4>
                                                    <p
                                                        className="text-sm opacity-80 mt-1"
                                                        style={{
                                                            color: "var(--color-principalBrown)",
                                                        }}
                                                    >
                                                        {bar.description}
                                                    </p>
                                                    <div className="mt-2 flex items-center">
                                                        <span className="font-semibold text-[color:var(--color-principalBrown)] mr-2">
                                                            Base Profit:
                                                        </span>
                                                        <span className="text-emerald-600 font-bold">
                                                            {formatCurrency(
                                                                bar.baseProfit ||
                                                                    bar.salesVolume ||
                                                                    0
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="text-2xl font-bold text-[color:var(--color-principalBrown)] mb-2">
                                                        {formatCurrency(
                                                            bar.basePrice
                                                        )}
                                                    </div>
                                                    <button
                                                        className={`
                                                            px-4 py-2 rounded-md text-white font-medium
                                                            ${
                                                                funds >=
                                                                bar.basePrice
                                                                    ? "bg-[color:var(--color-principalRed)] hover:bg-[color:var(--color-principalRed-light)]"
                                                                    : "bg-gray-400 cursor-not-allowed"
                                                            }
                                                            transition-colors
                                                        `}
                                                        onClick={() =>
                                                            funds >=
                                                                bar.basePrice &&
                                                            handleBuyRestaurant(
                                                                selectedSlot,
                                                                bar
                                                            )
                                                        }
                                                        disabled={
                                                            funds <
                                                            bar.basePrice
                                                        }
                                                    >
                                                        {funds >= bar.basePrice
                                                            ? "Purchase"
                                                            : "Not Enough Funds"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setShowRestaurantMenu(false)}
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
                show={
                    confirmationModal.show &&
                    (confirmationModal.action === "buy" ||
                        confirmationModal.action === "sell")
                }
                onCancel={() =>
                    setConfirmationModal({
                        show: false,
                        action: null,
                        slot: null,
                        bar: null,
                        cost: 0,
                        sellPrice: 0,
                    })
                }
                onConfirm={handleConfirmAction}
                title={
                    confirmationModal.action === "buy"
                        ? "Confirm Purchase"
                        : "Confirm Sale"
                }
                buySellDetails={getBuySellDetails()}
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

NoodleBarBuySell.propTypes = {
    onBack: PropTypes.func.isRequired,
    playerRank: PropTypes.number,
};

export default NoodleBarBuySell;

