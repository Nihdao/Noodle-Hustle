import React, { useEffect, useState } from "react";
import NoodleBarActions from "./noodleBars/NoodleBarActions";
import NoodleBarAssign from "./noodleBars/NoodleBarAssign";

const HubComponent = () => {
    const [gameData, setGameData] = React.useState({
        playerName: localStorage.getItem("playerName") || "{name}",
        rank: 200,
        funds: 500000,
        burnout: 33,
        period: 1,
        investorClashIn: 3,
        noddleBars: {
            forecastedProfit: 12657,
        },
        employees: {
            laborCost: 8985,
        },
        debts: {
            repayment: 1500,
        },
        personalTime: {
            planned: "Home",
        },
        forecastProfit: 2172,
    });

    // State for the selected submenu in the sidebar
    const [activeSubmenu, setActiveSubmenu] = useState("Home");
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [activeNoodleBarSection, setActiveNoodleBarSection] = useState(null);

    useEffect(() => {
        if (window.gameRef) {
            const gameState = window.gameRef.getGameState();
            if (gameState) {
                setGameData(gameState);
            }

            const handleGameStateUpdate = (updatedState) => {
                setGameData(updatedState);
            };

            window.gameRef.events.on("gameStateUpdated", handleGameStateUpdate);

            return () => {
                window.gameRef.events.off(
                    "gameStateUpdated",
                    handleGameStateUpdate
                );
            };
        }
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-US").format(value) + " ¥";
    };

    const handleStartPeriod = () => {
        if (window.gameRef && window.gameRef.startPeriod) {
            window.gameRef.startPeriod();
        } else {
            console.error(
                "Cannot start period: gameRef.startPeriod is not available"
            );
        }
    };

    const handleBuffs = () => {
        if (window.gameRef && window.gameRef.openBuffsPanel) {
            window.gameRef.openBuffsPanel();
        } else {
            console.error(
                "Cannot open buffs: gameRef.openBuffsPanel is not available"
            );
        }
    };

    const handleOptions = () => {
        if (window.gameRef && window.gameRef.openOptionsPanel) {
            window.gameRef.openOptionsPanel();
        } else {
            console.error(
                "Cannot open options: gameRef.openOptionsPanel is not available"
            );
        }
    };

    // Handle main menu clicks
    const handleMenuClick = (menu) => {
        setActiveSubmenu(menu);
    };

    // Handle noodle bar actions
    const handleNoodleBarAction = (action) => {
        if (action === "Assign") {
            setActiveNoodleBarSection("assign");
        }
    };

    // Handle noodle bar back button
    const handleNoodleBarBack = () => {
        setActiveNoodleBarSection(null);
    };

    // Styles communs pour réutilisation
    const styles = {
        container: {
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
        },
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
        header: {
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            width: "100%",
        },
        periodIndicator: {
            backgroundColor: "var(--color-principalRed)",
            color: "var(--color-whiteCream)",
            padding: "0.5rem",
            display: "flex",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            zIndex: 10,
            width: "100%",
        },
        sidebar: {
            width: "33.333%",
            backgroundColor: "var(--color-yellowWhite)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            zIndex: 30,
        },
        menuItem: (isHovered) => ({
            display: "flex",
            alignItems: "center",
            padding: "1.25rem 1.5rem",
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
        menuItemWrapper: {
            backgroundColor: "var(--color-whiteCream)",
            margin: "10px 0",
        },
        menuItemIcon: (isHovered) => ({
            width: "4rem",
            height: "4rem",
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
        menuItemTitle: {
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "var(--color-principalBrown)",
        },
        menuItemText: {
            color: "var(--color-principalBrown)",
        },
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
        },
        startPeriodTop: {
            width: "100%",
            padding: "1.5rem 0",
            fontSize: "2rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            transition: "background-color 0.2s",
            position: "relative",
            zIndex: 2,
        },
        startPeriodBottom: {
            fontSize: "1rem",
            padding: "0.75rem",
            width: "100%",
            textAlign: "center",
            backgroundColor: "rgba(49, 34, 24, 0.3)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        },
        forecastProfit: {
            fontSize: "1rem",
            fontWeight: "600",
            color: "var(--color-whiteCream)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        forecastNumber: {
            marginLeft: "8px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            color: "#10B981",
        },
        statsBox: {
            backgroundColor: "var(--color-yellowWhite)",
            color: "var(--color-principalBrown)",
            padding: "0.5rem 1.25rem",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        },
        statsPanelTopRight: {
            position: "absolute",
            top: "1rem",
            right: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            zIndex: 20,
            alignItems: "flex-end",
        },
        statsRow: {
            display: "flex",
            gap: "1rem",
        },
        actionButton: {
            backgroundColor: "var(--color-yellowWhite)",
            color: "var(--color-principalBrown)",
            padding: "0.75rem 2rem",
            borderRadius: "0.375rem",
            fontWeight: "bold",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.2s",
            border: "none",
            cursor: "pointer",
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
            <div className="flex flex-col h-full py-4 pb-40 overflow-auto">
                {/* Noddle Bars */}
                <div style={styles.menuItemWrapper}>
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
                                style={{
                                    width: "2rem",
                                    height: "2rem",
                                    filter:
                                        hoveredMenuItem === "NoodleBars"
                                            ? "brightness(2)"
                                            : "none",
                                }}
                            />
                        </div>
                        <div>
                            <h2 style={styles.menuItemTitle}>Noddle Bars</h2>
                            <p style={styles.menuItemText}>
                                Forecasted profit:{" "}
                                <span
                                    style={{
                                        color: "#10B981",
                                        fontWeight: "600",
                                    }}
                                >
                                    {formatCurrency(
                                        gameData.noddleBars.forecastedProfit
                                    )}
                                </span>
                            </p>
                        </div>
                    </button>
                </div>

                {/* Employees */}
                <div style={styles.menuItemWrapper}>
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
                                style={{
                                    width: "2rem",
                                    height: "2rem",
                                    filter:
                                        hoveredMenuItem === "Employees"
                                            ? "brightness(2)"
                                            : "none",
                                }}
                            />
                        </div>
                        <div>
                            <h2 style={styles.menuItemTitle}>Employees</h2>
                            <p style={styles.menuItemText}>
                                Labor Cost:{" "}
                                <span
                                    style={{
                                        color: "#EF4444",
                                        fontWeight: "600",
                                    }}
                                >
                                    {formatCurrency(
                                        gameData.employees.laborCost
                                    )}
                                </span>
                            </p>
                        </div>
                    </button>
                </div>

                {/* Debts */}
                <div style={styles.menuItemWrapper}>
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
                                style={{
                                    width: "2rem",
                                    height: "2rem",
                                    filter:
                                        hoveredMenuItem === "Debts"
                                            ? "brightness(2)"
                                            : "none",
                                }}
                            />
                        </div>
                        <div>
                            <h2 style={styles.menuItemTitle}>Debts</h2>
                            <p style={styles.menuItemText}>
                                Repayment:{" "}
                                <span
                                    style={{
                                        color: "#EF4444",
                                        fontWeight: "600",
                                    }}
                                >
                                    {formatCurrency(gameData.debts.repayment)}
                                </span>
                            </p>
                        </div>
                    </button>
                </div>

                {/* Personal Time */}
                <div style={styles.menuItemWrapper}>
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
                                style={{
                                    width: "2rem",
                                    height: "2rem",
                                    filter:
                                        hoveredMenuItem === "PersonalTime"
                                            ? "brightness(2)"
                                            : "none",
                                }}
                            />
                        </div>
                        <div>
                            <h2 style={styles.menuItemTitle}>Personal Time</h2>
                            <p style={styles.menuItemText}>
                                Planned:{" "}
                                <span
                                    style={{
                                        color: "#3B82F6",
                                        fontWeight: "600",
                                    }}
                                >
                                    {gameData.personalTime.planned}
                                </span>
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        );
    };

    // Staff sidebar content
    const renderStaffSidebar = () => {
        return (
            <div className="flex flex-col h-full p-4 pb-40 overflow-auto animate-fade-in">
                <div className="mb-6 ml-2 animate-slide-in-left">
                    <h2 className="text-2xl font-bold text-[var(--color-principalBrown)]">
                        Staff Management
                    </h2>
                    <div
                        className="text-[var(--color-principalBrown)] flex items-center mt-1 font-medium animate-slide-in-left"
                        style={{ animationDelay: "30ms" }}
                    >
                        <span>Labor Cost: </span>
                        <span className="ml-2 text-lg font-semibold text-red-500">
                            {formatCurrency(gameData.employees.laborCost)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => handleMenuClick("Home")}
                    onMouseEnter={() => setHoveredMenuItem("Back")}
                    onMouseLeave={() => setHoveredMenuItem(null)}
                    className="animate-slide-in-left mt-auto"
                    style={{
                        padding: "1.5rem",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        backgroundColor:
                            hoveredMenuItem === "Back"
                                ? "var(--color-principalBrown)"
                                : "var(--color-yellowWhite)",
                        color:
                            hoveredMenuItem === "Back"
                                ? "var(--color-whiteCream)"
                                : "var(--color-principalBrown)",
                        borderRadius: "0.5rem",
                        margin: "0.5rem",
                        fontWeight: "bold",
                        fontSize: "1.5rem",
                        boxShadow:
                            hoveredMenuItem === "Back"
                                ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                                : "0 2px 4px rgba(0, 0, 0, 0.1)",
                        border: "none",
                        outline: "none",
                        animationDelay: "200ms",
                    }}
                >
                    Back
                </button>
            </div>
        );
    };

    // NoodleBars sidebar content
    const renderNoodleBarsSidebar = () => {
        if (activeNoodleBarSection === "assign") {
            return (
                <NoodleBarAssign
                    onBack={handleNoodleBarBack}
                    playerRank={gameData.rank || 0}
                />
            );
        }

        return (
            <NoodleBarActions
                onActionSelect={handleNoodleBarAction}
                onBack={() => handleMenuClick("Home")}
                forecastedProfit={gameData.noddleBars.forecastedProfit}
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
                return renderPersonalTimeSidebar();
            default:
                return renderHomeSidebar();
        }
    };

    // Placeholder for Debts sidebar
    const renderDebtsSidebar = () => {
        return (
            <div className="flex flex-col h-full p-4 pb-40 overflow-auto animate-fade-in">
                <div className="mb-6 ml-2 animate-slide-in-left">
                    <h2 className="text-2xl font-bold text-[var(--color-principalBrown)]">
                        Debts Management
                    </h2>
                    <div
                        className="text-[var(--color-principalBrown)] flex items-center mt-1 font-medium animate-slide-in-left"
                        style={{ animationDelay: "30ms" }}
                    >
                        <span>Repayment: </span>
                        <span className="ml-2 text-lg font-semibold text-red-500">
                            {formatCurrency(gameData.debts.repayment)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => handleMenuClick("Home")}
                    onMouseEnter={() => setHoveredMenuItem("Back")}
                    onMouseLeave={() => setHoveredMenuItem(null)}
                    className="animate-slide-in-left mt-auto"
                    style={{
                        padding: "1.5rem",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        backgroundColor:
                            hoveredMenuItem === "Back"
                                ? "var(--color-principalBrown)"
                                : "var(--color-yellowWhite)",
                        color:
                            hoveredMenuItem === "Back"
                                ? "var(--color-whiteCream)"
                                : "var(--color-principalBrown)",
                        borderRadius: "0.5rem",
                        margin: "0.5rem",
                        fontWeight: "bold",
                        fontSize: "1.5rem",
                        boxShadow:
                            hoveredMenuItem === "Back"
                                ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                                : "0 2px 4px rgba(0, 0, 0, 0.1)",
                        border: "none",
                        outline: "none",
                        animationDelay: "200ms",
                    }}
                >
                    Back
                </button>
            </div>
        );
    };

    // Placeholder for Personal Time sidebar
    const renderPersonalTimeSidebar = () => {
        return (
            <div className="flex flex-col h-full p-4 pb-40 overflow-auto animate-fade-in">
                <div className="mb-6 ml-2 animate-slide-in-left">
                    <h2 className="text-2xl font-bold text-[var(--color-principalBrown)]">
                        Personal Time
                    </h2>
                    <div
                        className="text-[var(--color-principalBrown)] flex items-center mt-1 font-medium animate-slide-in-left"
                        style={{ animationDelay: "30ms" }}
                    >
                        <span>Planned: </span>
                        <span className="ml-2 text-lg font-semibold text-blue-500">
                            {gameData.personalTime.planned}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => handleMenuClick("Home")}
                    onMouseEnter={() => setHoveredMenuItem("Back")}
                    onMouseLeave={() => setHoveredMenuItem(null)}
                    className="animate-slide-in-left mt-auto"
                    style={{
                        padding: "1.5rem",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        backgroundColor:
                            hoveredMenuItem === "Back"
                                ? "var(--color-principalBrown)"
                                : "var(--color-yellowWhite)",
                        color:
                            hoveredMenuItem === "Back"
                                ? "var(--color-whiteCream)"
                                : "var(--color-principalBrown)",
                        borderRadius: "0.5rem",
                        margin: "0.5rem",
                        fontWeight: "bold",
                        fontSize: "1.5rem",
                        boxShadow:
                            hoveredMenuItem === "Back"
                                ? "0 4px 6px rgba(0, 0, 0, 0.2)"
                                : "0 2px 4px rgba(0, 0, 0, 0.1)",
                        border: "none",
                        outline: "none",
                        animationDelay: "200ms",
                    }}
                >
                    Back
                </button>
            </div>
        );
    };

    return (
        <div style={styles.container}>
            {/* Main Content Area */}
            <div
                style={{
                    display: "flex",
                    flex: "1",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Left Sidebar with header and period indicator inside */}
                <div style={styles.sidebar}>
                    {/* Header moved inside sidebar */}
                    <header style={styles.header}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                maxWidth: "100%",
                            }}
                        >
                            <img
                                src="/noodles.png"
                                alt="Noodle Icon"
                                style={{
                                    height: "2.5rem",
                                    width: "2.5rem",
                                    marginRight: "0.5rem",
                                    flexShrink: 0,
                                }}
                            />
                            <h1 style={styles.headerTitle}>
                                {gameData.playerName}&apos;s Noodles
                            </h1>
                        </div>
                    </header>

                    {/* Period Indicator - inside sidebar */}
                    <div style={styles.periodIndicator}>
                        <div
                            style={{
                                padding: "0.25rem 1.5rem",
                                borderRight:
                                    "1px solid rgba(255, 255, 255, 0.3)",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: "bold",
                                    fontSize: "1.125rem",
                                }}
                            >
                                Period {gameData.period}
                            </span>
                        </div>
                        <div style={{ padding: "0.25rem 1.5rem" }}>
                            <span style={{ fontSize: "1.125rem" }}>
                                Investor Clash in {gameData.investorClashIn}
                            </span>
                        </div>
                    </div>

                    {/* Sidebar Menu Items - conditionally render main menu or NoodleBars submenu */}
                    {renderSidebarContent()}

                    {/* START PERIOD Button at bottom of sidebar but wider than sidebar */}
                    <button
                        style={styles.startPeriodButton}
                        onClick={handleStartPeriod}
                        className={
                            activeSubmenu !== "Home"
                                ? "opacity-0 pointer-events-none transition-opacity duration-300"
                                : "opacity-100 transition-opacity duration-300"
                        }
                    >
                        <div style={styles.startPeriodTop}>
                            <span>START PERIOD</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ height: "2rem", width: "2rem" }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </div>
                        <div style={styles.startPeriodBottom}>
                            <div style={styles.forecastProfit}>
                                Forecast profit:{" "}
                                <span style={styles.forecastNumber}>
                                    {formatCurrency(gameData.forecastProfit)}
                                </span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Game Area - with just the background */}
                <div style={styles.mainContent}></div>

                {/* Rank, Funds and Burnout - Absolute positioned in top right */}
                <div style={styles.statsPanelTopRight}>
                    <div style={styles.statsRow}>
                        <div style={styles.statsBox}>
                            <div style={{ fontWeight: "bold" }}>Rank</div>
                            <div style={{ fontSize: "1.25rem" }}>
                                {gameData.rank}
                            </div>
                        </div>
                        <div style={styles.statsBox}>
                            <div style={{ fontWeight: "bold" }}>Funds</div>
                            <div style={{ fontSize: "1.25rem" }}>
                                {formatCurrency(gameData.funds)}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            ...styles.statsBox,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <span
                            style={{
                                fontWeight: "bold",
                                marginRight: "0.75rem",
                            }}
                        >
                            Burnout
                        </span>
                        <div
                            style={{
                                width: "8rem",
                                height: "1rem",
                                backgroundColor: "#D1D5DB",
                                borderRadius: "9999px",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    backgroundColor:
                                        "var(--color-principalRed)",
                                    borderRadius: "9999px",
                                    width: `${gameData.burnout}%`,
                                }}
                            ></div>
                        </div>
                        <span style={{ marginLeft: "0.75rem" }}>
                            {gameData.burnout}%
                        </span>
                    </div>
                </div>

                {/* Buffs and Options - Absolute positioned in bottom right */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "1rem",
                        right: "1rem",
                        display: "flex",
                        gap: "1rem",
                        zIndex: 20,
                    }}
                >
                    <button style={styles.actionButton} onClick={handleBuffs}>
                        Buffs
                    </button>
                    <button style={styles.actionButton} onClick={handleOptions}>
                        Options
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HubComponent;

