import { useState, useEffect } from "react";
import {
    useGameState,
    useGamePeriod,
    usePlayerStats,
    useFinances,
    useSocial,
    useRestaurants,
    useEmployees,
    useNoodleBarOperations,
} from "../store/gameStateHooks";
import { useSound } from "../hooks/useSound";
import { EventBus } from "../game/EventBus";
import NoodleBarBuySell from "./noodleBars/NoodleBarBuySell";
import EmployeeActions from "./employee/EmployeeActions";
import EmployeeManagement from "./employee/EmployeeManagement";
import EmployeeRecruitment from "./employee/EmployeeRecruitment";
import SocialManagement from "./social/SocialManagement";
import DebtsManagement from "./debts/DebtsManagement";
import NoodleBarActions from "./noodleBars/NoodleBarActions";
import NoodleBarAssign from "./noodleBars/NoodleBarAssign";
import NoodleBarUpgrade from "./noodleBars/NoodleBarUpgrade";
import OptionsModal from "./modals/OptionsModal";
import BuffsModal from "./modals/BuffsModal";
import HelpModal from "./modals/HelpModal";
import BusinessRankDisplay from "./common/BusinessRankDisplay";
import WarningIcons from "./common/WarningIcons";
import GameOverModal from "./modals/GameOverModal";

const HubComponent = () => {
    // Utiliser uniquement les hooks spécifiques
    const state = useGameState(); // Uniquement pour les propriétés qui n'ont pas de hook dédié
    const { currentPeriod, startPeriod } = useGamePeriod();
    const { burnout, burnoutSeverity } = usePlayerStats();
    const { funds, debt, formatCurrency } = useFinances();
    const { personalTime } = useSocial();
    const { bars: noodleBars } = useRestaurants();
    const { rosterWithDetails } = useEmployees();
    const { playerRank, getForcastedTotalProfit } = useNoodleBarOperations();

    // Données dérivées des hooks ou du state général
    const playerName = state?.playerStats?.playerName || "Player";
    const businessRank = playerRank || 200;

    // Calculate unused employee cost (employees not assigned to any restaurant)
    const unusedEmployeeCost = rosterWithDetails
        .filter((emp) => !emp.assigned)
        .reduce((total, emp) => total + (emp.salary || 0), 0);

    // Use the forecasted profit calculation that includes maluses
    const forecastProfit = getForcastedTotalProfit();

    // State for the selected submenu in the sidebar - these are UI states, not game state
    const [activeSubmenu, setActiveSubmenu] = useState("Home");
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [activeNoodleBarSection, setActiveNoodleBarSection] = useState(null);
    const [activeEmployeeSection, setActiveEmployeeSection] = useState(null);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isBuffsModalOpen, setIsBuffsModalOpen] = useState(false);
    const [isRankDetailsOpen, setIsRankDetailsOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    // Sons
    const { playClickSound, playBackSound } = useSound();

    // Add state for game over
    const [gameOverData, setGameOverData] = useState(null);

    // Add state for onboarding
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Check if this is a new game when the component mounts
    useEffect(() => {
        if (state?.playerStats?.completedIntro === false) {
            setShowOnboarding(true);
            setIsHelpModalOpen(true);
        }
    }, [state?.playerStats?.completedIntro]);

    // Handle onboarding completion
    const handleCompleteOnboarding = () => {
        // Update the completedIntro status in the game state
        if (window.gameRef) {
            window.gameRef.events.emit("updatePlayerStats", {
                completedIntro: true,
            });
        }
        setShowOnboarding(false);
    };

    // Handle menu changes for fairy interaction via EventBus
    useEffect(() => {
        if (activeSubmenu && window.gameRef) {
            EventBus.emit("menuChanged", activeSubmenu);
        }
    }, [activeSubmenu]);

    // Listen for game over events
    useEffect(() => {
        const handleGameOver = (data) => {
            console.log("Game Over triggered:", data);
            setGameOverData(data);
        };

        EventBus.on("gameOver", handleGameOver);

        return () => {
            EventBus.off("gameOver", handleGameOver);
        };
    }, []);

    const handleStartPeriod = () => {
        playClickSound();

        // Start the DeliveryRun scene with complete game data from hooks
        if (window.gameRef) {
            // Arrêter la scène HubScreen avant de démarrer DeliveryRun
            window.gameRef.scene.stop("HubScreen");

            // Préparer les données complètes pour DeliveryRun
            const deliveryRunData = {
                restaurants: noodleBars.map((bar) => ({
                    ...bar,
                    // Ensure all required properties are included
                    salesVolume: bar.salesVolume,
                    maintenance: bar.maintenance,
                    staff: bar.staff || [],
                    staffCost: bar.staffCost || 0,
                    // Add any other required properties
                })),
                playerStats: {
                    burnout,
                    burnoutSeverity,
                    currentRank: businessRank,
                    totalBalance: state.finances?.totalBalance || 0,
                },
                finances: {
                    funds,
                    debt: debt.amount || 0,
                    totalBalance: state.finances?.totalBalance || 0,
                },
                currentPeriod,
                employees: rosterWithDetails,
            };

            console.log("Starting DeliveryRun with data:", deliveryRunData);
            window.gameRef.scene.start("DeliveryRun", deliveryRunData);
        } else {
            console.error("Game reference not found");
            // Fallback to normal period start
            startPeriod();
        }
    };

    const handleBuffs = () => {
        playClickSound();
        setIsBuffsModalOpen(true);
    };

    const handleOptions = () => {
        playClickSound();
        setIsOptionsModalOpen(true);
    };

    const handleHelp = () => {
        playClickSound();
        setIsHelpModalOpen(true);
    };

    // Handle main menu clicks
    const handleMenuClick = (menu) => {
        playClickSound();
        setActiveSubmenu(menu);
    };

    // Handle noodle bar actions
    const handleNoodleBarAction = (action) => {
        playClickSound();
        if (action === "Assign") {
            setActiveNoodleBarSection("assign");
        } else if (action === "Upgrade") {
            setActiveNoodleBarSection("upgrade");
        } else if (action === "BuySell") {
            setActiveNoodleBarSection("buysell");
        }
    };

    // Handle noodle bar back button
    const handleNoodleBarBack = () => {
        playBackSound();
        setActiveNoodleBarSection(null);
    };

    // Handle employee actions
    const handleEmployeeAction = (action) => {
        playClickSound();
        if (action === "Management") {
            setActiveEmployeeSection("management");
        } else if (action === "Recruitment") {
            setActiveEmployeeSection("recruitment");
        }
    };

    // Handle employee back button
    const handleEmployeeBack = () => {
        playBackSound();
        setActiveEmployeeSection(null);
    };

    const handleCloseOptions = () => {
        playBackSound();
        setIsOptionsModalOpen(false);
    };

    // Styles communs pour réutilisation
    const styles = {
        headerTitle: {
            fontSize: "2.5rem",
            fontWeight: "bold",
            backgroundImage:
                "linear-gradient(to top, var(--color-principalRed), var(--color-principalRed-light))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        },
        menuItem: (isHovered) => ({
            display: "flex",
            alignItems: "center",
            padding: "1rem 1.5rem",
            paddingLeft: "2.5rem",
            borderBottom: "1px solid rgba(49, 34, 24, 0.1)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            backgroundColor: isHovered
                ? "var(--color-whiteCream)"
                : "transparent",
            marginLeft: isHovered ? "-10px" : "-30px",
            marginRight: isHovered ? "-20px" : "0",
            position: "relative",
            outline: "none",
            border: "none",
            textAlign: "left",
            width: "calc(100% + 20px)",
        }),
        menuItemIcon: (isHovered) => ({
            width: "3.5rem",
            height: "3.5rem",
            backgroundColor: isHovered
                ? "var(--color-principalRed)"
                : "var(--color-principalBrown)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9999px",
            marginRight: "1rem",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.3s ease",
        }),
        startPeriodButton: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "var(--color-principalRed)",
            color: "var(--color-whiteCream)",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            padding: "0",
            position: "absolute",
            bottom: 0,
            left: "-15px",
            width: "calc(100% + 50px)",
            borderTopRightRadius: "40px",
            overflow: "hidden",
            transform: "perspective(500px) rotateX(5deg)",
            transformOrigin: "bottom",
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            cursor: "pointer",
        },
        startPeriodTop: {
            width: "100%",
            padding: "1.25rem 0",
            fontSize: "1.75rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            transition: "all 0.3s ease",
            position: "relative",
            zIndex: 2,
            "&:after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)",
                transform: "translateX(-100%)",
                transition: "transform 0.5s ease",
            },
        },
        startPeriodBottom: {
            fontSize: "0.9rem",
            padding: "0.5rem",
            width: "100%",
            textAlign: "center",
            backgroundColor: "rgba(49, 34, 24, 0.3)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "all 0.3s ease",
        },
        forecastProfit: {
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "var(--color-whiteCream)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        forecastNumber: {
            marginLeft: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            color: "#10B981",
        },
        statsPanelTopRight: {
            position: "absolute",
            top: "1rem",
            right: "1rem",
            display: "flex",
            flexDirection: "row",
            gap: "0.75rem",
            zIndex: 20,
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(8px)",
            borderRadius: "1rem",
            padding: "0.5rem 1rem",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            transition: "all 0.3s ease",
            transform: "translateY(0)",
            animation: "float 5s ease-in-out infinite",
        },
        statsItem: {
            display: "flex",
            alignItems: "center",
            padding: "0.25rem 0.75rem",
            borderRadius: "0.75rem",
            position: "relative",
            transition: "all 0.3s ease",
            transform: "scale(1)",
            cursor: "default",
            "&:hover": {
                transform: "scale(1.05)",
            },
        },
        statsLabel: {
            fontSize: "0.75rem",
            fontWeight: "bold",
            color: "var(--color-principalBrown)",
            marginRight: "0.5rem",
            opacity: 0.8,
        },
        statsValue: {
            fontSize: "1.15rem",
            fontWeight: "bold",
            color: "var(--color-principalBrown)",
        },
        fundsValue: {
            fontSize: "1.15rem",
            fontWeight: "bold",
        },
        divider: {
            width: "1px",
            height: "2rem",
            background: "rgba(49, 34, 24, 0.2)",
            margin: "0 0.25rem",
        },
        actionButtonsContainer: {
            position: "absolute",
            bottom: "1.5rem",
            right: "1.5rem",
            display: "flex",
            gap: "1rem",
            zIndex: 20,
        },
        actionButton: (isHovered) => ({
            backgroundColor: isHovered
                ? "var(--color-principalRed)"
                : "var(--color-whiteCream)",
            color: isHovered
                ? "var(--color-whiteCream)"
                : "var(--color-principalBrown)",
            padding: "0.85rem 1.5rem",
            borderRadius: "1rem",
            fontWeight: "bold",
            boxShadow: isHovered
                ? "0 4px 15px rgba(0, 0, 0, 0.25)"
                : "0 4px 15px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            transition: "all 0.3s ease",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.3rem",
            cursor: "pointer",
            transform: isHovered ? "scale(1.05)" : "translateY(0)",
            fontSize: "1rem",
        }),
        actionButtonStyled: {
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            color: "var(--color-principalBrown)",
            padding: "0.85rem 1.5rem",
            borderRadius: "1rem",
            fontWeight: "bold",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            transition: "all 0.3s ease",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            cursor: "pointer",
            transform: "translateY(0)",
            fontSize: "1rem",
        },
        buffsButton: {
            background: "linear-gradient(135deg, #74EBD5 0%, #9FACE6 100%)",
            color: "#fff",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
        },
        optionsButton: {
            background: "linear-gradient(135deg, #FFD1FF 0%, #FAD0C4 100%)",
            color: "#8B5D33",
            textShadow: "0 1px 2px rgba(255, 255, 255, 0.3)",
        },
        mainContent: {
            flex: 1,
            position: "relative",
            backgroundImage: "url('/assets/hub/noodles-pattern.png')",
            backgroundSize: "repeat",
        },
    };

    // Main sidebar rendering function
    const renderHomeSidebar = () => {
        return (
            <div className="flex flex-col h-full py-3 pb-40 overflow-y-auto">
                {/* Noddle Bars */}
                <div className="bg-[color:var(--color-whiteCream)] my-2">
                    <button
                        onClick={() => handleMenuClick("NoodleBars")}
                        onMouseEnter={() => setHoveredMenuItem("NoodleBars")}
                        onMouseLeave={() => setHoveredMenuItem(null)}
                        style={styles.menuItem(
                            hoveredMenuItem === "NoodleBars"
                        )}
                    >
                        <div
                            style={styles.menuItemIcon(
                                hoveredMenuItem === "NoodleBars"
                            )}
                        >
                            <img
                                src="/assets/hub/NoodleIcon.svg"
                                alt="Noodle Icon"
                                className="w-6 h-6"
                                style={{
                                    filter:
                                        hoveredMenuItem === "NoodleBars"
                                            ? "brightness(2)"
                                            : "none",
                                }}
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[color:var(--color-principalBrown)]">
                                Noodle Bars
                            </h2>
                            <p className="text-sm text-[color:var(--color-principalBrown)]">
                                Profit:{" "}
                                <span
                                    className={`${
                                        forecastProfit < 0
                                            ? "text-red-500"
                                            : "text-emerald-600"
                                    } font-semibold`}
                                >
                                    {formatCurrency(forecastProfit)}
                                </span>
                            </p>
                        </div>
                    </button>
                </div>

                {/* Employees */}
                <div className="bg-[color:var(--color-whiteCream)] my-2">
                    <button
                        onClick={() => handleMenuClick("Employees")}
                        onMouseEnter={() => setHoveredMenuItem("Employees")}
                        onMouseLeave={() => setHoveredMenuItem(null)}
                        style={styles.menuItem(hoveredMenuItem === "Employees")}
                    >
                        <div
                            style={styles.menuItemIcon(
                                hoveredMenuItem === "Employees"
                            )}
                        >
                            <img
                                src="/assets/hub/EmployeeIcon.svg"
                                alt="Employee Icon"
                                className="w-6 h-6"
                                style={{
                                    filter:
                                        hoveredMenuItem === "Employees"
                                            ? "brightness(2)"
                                            : "none",
                                }}
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[color:var(--color-principalBrown)]">
                                Employees
                            </h2>
                            <p className="text-sm text-[color:var(--color-principalBrown)]">
                                Unused cost:{" "}
                                <span className="text-red-500 font-semibold">
                                    {formatCurrency(unusedEmployeeCost)}
                                </span>
                            </p>
                        </div>
                    </button>
                </div>

                {/* Debts */}
                <div className="bg-[color:var(--color-whiteCream)] my-2">
                    <button
                        onClick={() => handleMenuClick("Debts")}
                        onMouseEnter={() => setHoveredMenuItem("Debts")}
                        onMouseLeave={() => setHoveredMenuItem(null)}
                        style={styles.menuItem(hoveredMenuItem === "Debts")}
                    >
                        <div
                            style={styles.menuItemIcon(
                                hoveredMenuItem === "Debts"
                            )}
                        >
                            <img
                                src="/assets/hub/DebtIcon.svg"
                                alt="Debt Icon"
                                className="w-6 h-6"
                                style={{
                                    filter:
                                        hoveredMenuItem === "Debts"
                                            ? "brightness(2)"
                                            : "none",
                                }}
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[color:var(--color-principalBrown)]">
                                Debts
                            </h2>
                            <p className="text-sm text-[color:var(--color-principalBrown)]">
                                Due this period:{" "}
                                <span className="text-red-500 font-semibold">
                                    {formatCurrency(debt.amount || 0)}
                                </span>
                            </p>
                        </div>
                    </button>
                </div>

                {/* Personal Time */}
                <div className="bg-[color:var(--color-whiteCream)] my-2">
                    <button
                        onClick={() => handleMenuClick("PersonalTime")}
                        onMouseEnter={() => setHoveredMenuItem("PersonalTime")}
                        onMouseLeave={() => setHoveredMenuItem(null)}
                        style={styles.menuItem(
                            hoveredMenuItem === "PersonalTime"
                        )}
                    >
                        <div
                            style={styles.menuItemIcon(
                                hoveredMenuItem === "PersonalTime"
                            )}
                        >
                            <img
                                src="/assets/hub/PersonalIcon.svg"
                                alt="Personal Time Icon"
                                className="w-6 h-6"
                                style={{
                                    filter:
                                        hoveredMenuItem === "PersonalTime"
                                            ? "brightness(2)"
                                            : "none",
                                }}
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[color:var(--color-principalBrown)]">
                                Personal Time
                            </h2>
                        </div>
                    </button>
                </div>
            </div>
        );
    };

    // Staff sidebar content
    const renderStaffSidebar = () => {
        if (activeEmployeeSection === "management") {
            return (
                <EmployeeManagement
                    onBack={handleEmployeeBack}
                    laborCost={unusedEmployeeCost}
                />
            );
        } else if (activeEmployeeSection === "recruitment") {
            return (
                <EmployeeRecruitment
                    onBack={handleEmployeeBack}
                    funds={funds}
                />
            );
        }

        return (
            <EmployeeActions
                onActionSelect={handleEmployeeAction}
                onBack={() => handleMenuClick("Home")}
                laborCost={unusedEmployeeCost}
            />
        );
    };

    // NoodleBars sidebar content
    const renderNoodleBarsSidebar = () => {
        if (activeNoodleBarSection === "assign") {
            return (
                <NoodleBarAssign
                    onBack={handleNoodleBarBack}
                    playerRank={businessRank}
                />
            );
        } else if (activeNoodleBarSection === "upgrade") {
            return (
                <NoodleBarUpgrade
                    onBack={handleNoodleBarBack}
                    playerRank={businessRank}
                    funds={funds}
                />
            );
        } else if (activeNoodleBarSection === "buysell") {
            return (
                <NoodleBarBuySell
                    onBack={handleNoodleBarBack}
                    playerRank={businessRank}
                    funds={funds}
                />
            );
        }

        return (
            <NoodleBarActions
                onActionSelect={handleNoodleBarAction}
                onBack={() => handleMenuClick("Home")}
                forecastedProfit={forecastProfit}
            />
        );
    };

    // Determine sidebar content based on activeSection
    const renderSidebarContent = () => {
        switch (activeSubmenu) {
            case "Home":
                return renderHomeSidebar();
            case "NoodleBars":
                return renderNoodleBarsSidebar();
            case "Employees":
                return renderStaffSidebar();
            case "Debts":
                return renderDebtsSidebar();
            case "PersonalTime":
                return (
                    <SocialManagement
                        onBack={() => handleMenuClick("Home")}
                        currentPlanned={personalTime.planned}
                    />
                );
            default:
                return renderHomeSidebar();
        }
    };

    // Placeholder for Debts sidebar - replaced with the new DebtsManagement component
    const renderDebtsSidebar = () => {
        return (
            <DebtsManagement
                onBack={() => handleMenuClick("Home")}
                debts={debt.amount}
            />
        );
    };

    return (
        <div className="absolute inset-0 flex flex-col overflow-hidden">
            {/* Warning Icons */}
            <WarningIcons
                funds={funds}
                burnout={burnout}
                businessRank={businessRank}
            />

            {/* Game Over Modal */}
            <GameOverModal
                isOpen={gameOverData !== null}
                onClose={() => setGameOverData(null)}
                reason={gameOverData?.reason || "bankruptcy"}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 relative overflow-hidden">
                {/* Left Sidebar with header and period indicator inside */}
                <div className="w-1/3 bg-[color:var(--color-yellowWhite)] shadow-md relative z-30 flex flex-col">
                    {/* Header moved inside sidebar */}
                    <header className="p-3 flex items-center w-full">
                        <div className="flex items-center max-w-full">
                            <img
                                src="/noodles.png"
                                alt="Noodle Icon"
                                className="h-10 w-10 mr-2 flex-shrink-0"
                            />
                            <h1 style={styles.headerTitle}>
                                {playerName}&apos;s Noodles
                            </h1>
                        </div>
                    </header>

                    {/* Period Indicator - inside sidebar */}
                    <div className="bg-[color:var(--color-principalRed)] text-[color:var(--color-whiteCream)] p-2 flex shadow-md z-10 w-full">
                        <div className="px-6">
                            <span className="font-bold text-base">
                                Period {currentPeriod}
                            </span>
                        </div>
                    </div>

                    {/* Sidebar Menu Items - with overflow-y-auto */}
                    <div className="flex-1 overflow-y-auto">
                        {renderSidebarContent()}
                    </div>

                    {/* START PERIOD Button at bottom of sidebar but wider than sidebar */}
                    <button
                        style={{
                            ...styles.startPeriodButton,
                            transform:
                                hoveredMenuItem === "Start"
                                    ? "perspective(500px) rotateX(5deg) translateX(5px) scale(1.02)"
                                    : "perspective(500px) rotateX(5deg)",
                            boxShadow:
                                hoveredMenuItem === "Start"
                                    ? "0 10px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 59, 48, 0.5)"
                                    : "0 4px 8px rgba(0, 0, 0, 0.2)",
                            backgroundColor:
                                hoveredMenuItem === "Start"
                                    ? "var(--color-principalRed-light)" // Slightly brighter red on hover
                                    : "var(--color-principalRed)",
                        }}
                        onClick={handleStartPeriod}
                        onMouseEnter={() => setHoveredMenuItem("Start")}
                        onMouseLeave={() => setHoveredMenuItem(null)}
                        className={
                            activeSubmenu !== "Home"
                                ? "opacity-0 pointer-events-none transition-opacity duration-300"
                                : "opacity-100 transition-opacity duration-300"
                        }
                    >
                        <div
                            style={{
                                ...styles.startPeriodTop,
                                padding:
                                    hoveredMenuItem === "Start"
                                        ? "1.35rem 0"
                                        : "1.25rem 0",
                            }}
                        >
                            <span
                                style={{
                                    transform:
                                        hoveredMenuItem === "Start"
                                            ? "scale(1.05)"
                                            : "scale(1)",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                START PERIOD
                            </span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-7 w-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                style={{
                                    transform:
                                        hoveredMenuItem === "Start"
                                            ? "translateX(3px) scale(1.1)"
                                            : "translateX(0)",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </div>
                        <div
                            style={{
                                ...styles.startPeriodBottom,
                                backgroundColor:
                                    hoveredMenuItem === "Start"
                                        ? "rgba(0, 0, 0, 0.4)"
                                        : "rgba(0, 0, 0, 0.5)",
                            }}
                        >
                            <div style={styles.forecastProfit}>
                                Forecasted profit:{" "}
                                <span
                                    style={{
                                        ...styles.forecastNumber,
                                        transform:
                                            hoveredMenuItem === "Start"
                                                ? "scale(1.05)"
                                                : "scale(1)",
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    <span
                                        className={
                                            forecastProfit -
                                                unusedEmployeeCost -
                                                debt.amount >=
                                            0
                                                ? "text-green-500 font-bold ml-2"
                                                : "text-red-500 font-bold ml-2"
                                        }
                                    >
                                        {formatCurrency(
                                            forecastProfit -
                                                unusedEmployeeCost -
                                                debt.amount
                                        )}
                                        {forecastProfit -
                                            unusedEmployeeCost -
                                            debt.amount >=
                                        0
                                            ? " ▲"
                                            : " ▼"}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Game Area - with just the background */}
                <div style={styles.mainContent}>
                    {/* Rank details popup */}
                    {isRankDetailsOpen && (
                        <div className="fixed top-20 right-8 z-50 transition-all duration-300 ease-in-out animate-fadeIn">
                            <div className="relative">
                                <button
                                    onClick={() => setIsRankDetailsOpen(false)}
                                    className="absolute -top-3 -right-3 bg-principalRed text-whiteCream rounded-full w-8 h-8 flex items-center justify-center hover:bg-principalRed-light transition-colors z-10 shadow-md"
                                >
                                    ✕
                                </button>
                                <BusinessRankDisplay
                                    showDetails
                                    className="w-96 shadow-xl"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Rank, Funds and Burnout - Absolute positioned in top right */}
                <div style={styles.statsPanelTopRight}>
                    <div
                        style={{ ...styles.statsItem, cursor: "pointer" }}
                        onClick={() => {
                            playClickSound();
                            setIsRankDetailsOpen(!isRankDetailsOpen);
                        }}
                        className="hover:bg-yellowWhite/70 transition-colors rounded-md group relative"
                    >
                        <span style={styles.statsLabel}>RANK</span>
                        <span style={styles.statsValue}>
                            {businessRank}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4 ml-1 inline-block text-principalRed/70 group-hover:text-principalRed transition-colors group-hover:translate-y-[1px] transform duration-300"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </span>
                        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-principalRed scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </div>

                    <div style={styles.divider}></div>

                    <div style={styles.statsItem}>
                        <span style={styles.statsLabel}>FUNDS</span>
                        <span
                            style={styles.fundsValue}
                            className={
                                funds < 0 ? "text-red-500" : "text-green-500"
                            }
                        >
                            {formatCurrency(funds)}
                        </span>
                    </div>

                    <div style={styles.divider}></div>

                    <div style={{ ...styles.statsItem, marginRight: "0.5rem" }}>
                        <span style={styles.statsLabel}>BURNOUT</span>
                        <div
                            style={{
                                width: "5rem",
                                height: "0.65rem",
                                backgroundColor: "#F3F4F6",
                                borderRadius: "9999px",
                                overflow: "hidden",
                                border: "1px solid rgba(49, 34, 24, 0.1)",
                                marginLeft: "0.5rem",
                                position: "relative",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    backgroundColor:
                                        burnoutSeverity === "critical"
                                            ? "#EF4444"
                                            : burnoutSeverity === "high" ||
                                              burnoutSeverity === "medium"
                                            ? "#F59E0B"
                                            : "#10B981",
                                    borderRadius: "9999px",
                                    width: `${burnout}%`,
                                    transition:
                                        "width 0.5s ease-in-out, background-color 0.5s ease-in-out",
                                }}
                            ></div>
                        </div>
                        <span
                            style={{
                                marginLeft: "0.5rem",
                                fontWeight: "bold",
                                fontSize: "1.1rem",
                                color:
                                    burnoutSeverity === "critical"
                                        ? "#EF4444"
                                        : burnoutSeverity === "high" ||
                                          burnoutSeverity === "medium"
                                        ? "#F59E0B"
                                        : "#10B981",
                            }}
                        >
                            {burnout}%
                        </span>
                    </div>
                </div>

                {/* Action buttons on the bottom */}
                <div style={styles.actionButtonsContainer}>
                    <div className="flex space-x-3">
                        <button
                            style={styles.actionButton(
                                hoveredMenuItem === "Help"
                            )}
                            onMouseEnter={() => setHoveredMenuItem("Help")}
                            onMouseLeave={() => setHoveredMenuItem(null)}
                            onClick={handleHelp}
                            className="hover:scale-105 hover:shadow-xl active:scale-95 transition-all"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            How to play
                        </button>

                        <button
                            style={styles.actionButton(
                                hoveredMenuItem === "Buffs"
                            )}
                            onMouseEnter={() => setHoveredMenuItem("Buffs")}
                            onMouseLeave={() => setHoveredMenuItem(null)}
                            onClick={handleBuffs}
                            className="hover:scale-105 hover:shadow-xl active:scale-95 transition-all"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                            Buffs
                        </button>

                        <button
                            style={styles.actionButton(
                                hoveredMenuItem === "Options"
                            )}
                            onMouseEnter={() => setHoveredMenuItem("Options")}
                            onMouseLeave={() => setHoveredMenuItem(null)}
                            onClick={handleOptions}
                            className="hover:scale-105 hover:shadow-xl active:scale-95 transition-all"
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
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                            Options
                        </button>
                    </div>
                </div>
            </div>

            {/* Options Modal */}
            <OptionsModal
                isOpen={isOptionsModalOpen}
                onClose={handleCloseOptions}
            />

            {/* Buffs Modal */}
            <BuffsModal
                isOpen={isBuffsModalOpen}
                onClose={() => setIsBuffsModalOpen(false)}
            />

            {/* Help Modal - updated with onboarding props */}
            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
                isOnboarding={showOnboarding}
                onCompleteOnboarding={handleCompleteOnboarding}
            />

            {/* Add fadeIn animation for the rank details panel */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `,
                }}
            />
        </div>
    );
};

export default HubComponent;

