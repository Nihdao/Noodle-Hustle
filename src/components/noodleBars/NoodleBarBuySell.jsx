import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import RestaurantSlot from "./components/RestaurantSlot";
import ConfirmationModal from "./components/ConfirmationModal";
import MenuContainer from "../common/MenuContainer";
import {
    mockNoodleBars,
    mockRestaurantSlots,
} from "./constants/noodleBarConstants";
import {
    formatCurrency,
    getAvailableSlots,
    getSlotStatus,
    getNextRankUnlock,
} from "./utils/restaurantUtils";

const NoodleBarBuySell = ({ onBack, playerRank = 200, funds = 500000 }) => {
    const [noodleBars] = useState([...mockNoodleBars]);
    const [restaurantSlots, setRestaurantSlots] = useState([
        ...mockRestaurantSlots,
    ]);
    const [hoveredBar, setHoveredBar] = useState(null);
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState({
        show: false,
        action: null, // "buy" or "sell"
        bar: null,
    });
    const [showRestaurantMenu, setShowRestaurantMenu] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

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
    const availableSlots = getAvailableSlots(playerRank);
    const nextRankUnlock = getNextRankUnlock(playerRank);

    const handleMouseEnter = (bar) => {
        setHoveredBar(bar);
    };

    const handleMouseLeave = () => {
        setHoveredBar(null);
    };

    // Handle buy restaurant
    const handleBuyRestaurant = (slot, bar) => {
        // Check if player has enough funds
        if (funds < bar.purchasePrice) {
            return; // Not enough funds
        }

        setConfirmationModal({
            show: true,
            action: "buy",
            slot,
            bar,
            cost: bar.purchasePrice,
        });
        setShowRestaurantMenu(false);
    };

    // Handle sell restaurant
    const handleSellRestaurant = (slot, bar) => {
        // Prevent selling Noodles Original
        if (bar.name === "Noodles Original") {
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
            // Update restaurant slots to mark as purchased and assign bar ID
            const updatedSlots = restaurantSlots.map((s) => {
                if (s.id === slot.id) {
                    return {
                        ...s,
                        purchased: true,
                        barId: bar.id,
                        name: bar.name,
                    };
                }
                return s;
            });

            setRestaurantSlots(updatedSlots);
        } else if (action === "sell") {
            // Update restaurant slots to mark as not purchased and remove bar ID
            const updatedSlots = restaurantSlots.map((s) => {
                if (s.id === slot.id) {
                    return {
                        ...s,
                        purchased: false,
                        barId: null,
                        name: null,
                    };
                }
                return s;
            });

            setRestaurantSlots(updatedSlots);
        }

        // Close confirmation modal
        setConfirmationModal({
            show: false,
            action: null,
            bar: null,
        });
    };

    // Handle available restaurants to buy
    const getAvailableRestaurants = () => {
        // Get bars that are not already purchased
        const purchasedBarIds = restaurantSlots
            .filter((slot) => slot.purchased && slot.barId)
            .map((slot) => slot.barId);

        return noodleBars.filter((bar) => !purchasedBarIds.includes(bar.id));
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
                                    onClick={() =>
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
                                                    bar.name ===
                                                    "Noodles Original"
                                                        ? "bg-gray-300 cursor-not-allowed opacity-50"
                                                        : "bg-red-500 hover:bg-red-600 text-white"
                                                }
                                            `}
                                            onClick={() =>
                                                bar.name !==
                                                    "Noodles Original" &&
                                                handleSellRestaurant(slot, bar)
                                            }
                                            disabled={
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
                                {getAvailableRestaurants().length === 0 ? (
                                    <p className="text-center text-[color:var(--color-principalBrown)] py-8">
                                        You already own all available
                                        restaurants!
                                    </p>
                                ) : (
                                    getAvailableRestaurants().map((bar) => (
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
                                                                bar.baseProfit
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="text-2xl font-bold text-[color:var(--color-principalBrown)] mb-2">
                                                        {formatCurrency(
                                                            bar.purchasePrice
                                                        )}
                                                    </div>
                                                    <button
                                                        className={`
                                                            px-4 py-2 rounded-md text-white font-medium
                                                            ${
                                                                funds >=
                                                                bar.purchasePrice
                                                                    ? "bg-[color:var(--color-principalRed)] hover:bg-[color:var(--color-principalRed-light)]"
                                                                    : "bg-gray-400 cursor-not-allowed"
                                                            }
                                                            transition-colors
                                                        `}
                                                        onClick={() =>
                                                            funds >=
                                                                bar.purchasePrice &&
                                                            handleBuyRestaurant(
                                                                selectedSlot,
                                                                bar
                                                            )
                                                        }
                                                        disabled={
                                                            funds <
                                                            bar.purchasePrice
                                                        }
                                                    >
                                                        {funds >=
                                                        bar.purchasePrice
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
                        bar: null,
                    })
                }
                onConfirm={handleConfirmAction}
                title={
                    confirmationModal.action === "buy"
                        ? "Confirm Purchase"
                        : "Confirm Sale"
                }
                buySellDetails={
                    confirmationModal.action === "buy"
                        ? {
                              barName: confirmationModal.bar?.name,
                              price: confirmationModal.cost,
                              action: "buy",
                              currentFunds: funds,
                          }
                        : {
                              barName: confirmationModal.bar?.name,
                              price: confirmationModal.sellPrice,
                              action: "sell",
                              currentFunds: funds,
                          }
                }
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
    funds: PropTypes.number,
};

export default NoodleBarBuySell;

