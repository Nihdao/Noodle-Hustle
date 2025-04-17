import PropTypes from "prop-types";
import { useState } from "react";
import OptionsModal from "./OptionsModal";
import CreditsModal from "./CreditsModal";
// import "../styles/OptionsModal.css";
// Import the styles - make sure the path is correct
// If style.css is in the public folder, it's linked via index.html, no direct import needed here.
// If you move it to src/styles/MainMenu.css, then use:
// import '../styles/MainMenu.css';

function MainMenuComponent({
    onStartNewGame,
    onContinueGame,
    onOptions,
    onCredits,
}) {
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
    // Check if save data exists (placeholder logic, might need refinement)
    const hasSaveData = localStorage.getItem("noodleBalanceSave") !== null;

    const handleNewGameClick = () => {
        // TODO: Prompt for company name (implement modal or input later)
        console.log("Starting new game...");
        // Clear previous save data as per rules
        localStorage.removeItem("noodleBalanceSave"); // Example, adjust key if needed
        if (onStartNewGame) onStartNewGame("Default Company"); // Pass default name for now
    };

    const handleContinueClick = () => {
        console.log("Continuing game...");
        if (onContinueGame) onContinueGame();
    };

    const handleOptionsClick = () => {
        console.log("Opening options...");
        setIsOptionsModalOpen(true);
        if (onOptions) onOptions();
    };

    const handleCreditsClick = () => {
        console.log("Showing credits...");
        setIsCreditsModalOpen(true);
        if (onCredits) onCredits();
        // TODO: Implement Credits Modal/Page logic
    };

    const japaneseSlateStyle = {
        backgroundColor: "#f9f3e5", // Light cream color
        border: "8px solid #ecdbc5", // Light wood color
        borderRadius: "8px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        padding: "6px",
        position: "relative",
        maxWidth: "400px",
        margin: "0 auto",
        transform: "rotate(-1deg)",
    };

    const beforeSlateStyle = {
        content: "",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23a78b6b' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        opacity: 0.5,
        pointerEvents: "none",
    };

    const slateInnerStyle = {
        backgroundColor: "#f9f3e5",
        border: "2px solid #e1d1b3",
        borderRadius: "4px",
        padding: "20px",
        position: "relative",
        textAlign: "center",
    };

    const slateInnerBeforeStyle = {
        content: "",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
            "linear-gradient(45deg, rgba(167,139,107,0.05) 25%, transparent 25%, transparent 50%, rgba(167,139,107,0.05) 50%, rgba(167,139,107,0.05) 75%, transparent 75%, transparent)",
        backgroundSize: "4px 4px",
        pointerEvents: "none",
    };

    const restaurantTitleStyle = {
        color: "#8b5d33", // Brown color for the title
        fontFamily: "'Brush Script MT', cursive",
        fontSize: "2.8rem",
        marginBottom: "2rem",
        textShadow:
            "1px 1px 0 #f9f3e5, -1px -1px 0 #f9f3e5, 1px -1px 0 #f9f3e5, -1px 1px 0 #f9f3e5",
        letterSpacing: "2px",
        position: "relative",
    };

    const menuButtonsStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    };

    const gameButtonStyle = {
        backgroundColor: "#c17a0f", // More orange-brown
        color: "white",
        border: "none",
        padding: "10px 20px",
        fontSize: "1rem",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "'Arial', sans-serif",
        letterSpacing: "1px",
        textShadow: "1px 1px 1px rgba(0,0,0,0.3)",
        boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.2)",
    };

    return (
        <div className="main-menu-overlay">
            <div style={japaneseSlateStyle}>
                <div style={{ ...beforeSlateStyle }} />
                <div style={slateInnerStyle}>
                    <div style={{ ...slateInnerBeforeStyle }} />
                    {/* Logo placeholder - Style applied via CSS */}
                    <h1 style={restaurantTitleStyle}>
                        Noddle LifeBalance
                        <span
                            style={{
                                display: "block",
                                fontSize: "0.9rem",
                                fontFamily: "sans-serif",
                                marginTop: "0.5rem",
                                color: "#c17a0f",
                                letterSpacing: "1px",
                            }}
                        >
                            麺類のライフバランス
                        </span>
                    </h1>
                    {/* Menu Buttons - Vertical layout centered */}
                    <div style={menuButtonsStyle}>
                        <button
                            style={gameButtonStyle}
                            onClick={handleNewGameClick}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#e69426";
                                e.currentTarget.style.transform =
                                    "translateY(-2px)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#c17a0f";
                                e.currentTarget.style.transform =
                                    "translateY(0)";
                            }}
                        >
                            New Game
                        </button>
                        {/* Conditionally render Continue button */}
                        {hasSaveData && (
                            <button
                                style={gameButtonStyle}
                                onClick={handleContinueClick}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#e69426";
                                    e.currentTarget.style.transform =
                                        "translateY(-2px)";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#c17a0f";
                                    e.currentTarget.style.transform =
                                        "translateY(0)";
                                }}
                            >
                                Continue
                            </button>
                        )}
                        <button
                            style={gameButtonStyle}
                            onClick={handleOptionsClick}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#e69426";
                                e.currentTarget.style.transform =
                                    "translateY(-2px)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#c17a0f";
                                e.currentTarget.style.transform =
                                    "translateY(0)";
                            }}
                        >
                            Options
                        </button>
                        <button
                            style={gameButtonStyle}
                            onClick={handleCreditsClick}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#e69426";
                                e.currentTarget.style.transform =
                                    "translateY(-2px)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#c17a0f";
                                e.currentTarget.style.transform =
                                    "translateY(0)";
                            }}
                        >
                            Credits
                        </button>
                    </div>
                </div>
            </div>
            {/* Options Modal */}
            <OptionsModal
                isOpen={isOptionsModalOpen}
                onClose={() => setIsOptionsModalOpen(false)}
                isMainMenu={true}
            />
            <CreditsModal
                isOpen={isCreditsModalOpen}
                onClose={() => setIsCreditsModalOpen(false)}
            />
            {/* Phaser background will be visible behind this overlay */}
        </div>
    );
}

MainMenuComponent.propTypes = {
    onStartNewGame: PropTypes.func.isRequired, // Make required if essential
    onContinueGame: PropTypes.func.isRequired,
    onOptions: PropTypes.func.isRequired,
    onCredits: PropTypes.func.isRequired,
};

export default MainMenuComponent;

