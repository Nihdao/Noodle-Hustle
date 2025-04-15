import PropTypes from "prop-types";
import { useState } from "react";
import OptionsModal from "./OptionsModal";
import CreditsModal from "./CreditsModal";
import "../styles/OptionsModal.css";
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

    return (
        <div className="main-menu-overlay">
            {/* Logo placeholder - Style applied via CSS */}
            <h1>Noodle Balance</h1>
            {/* Menu Buttons - Vertical layout centered */}
            <div className="menu-buttons">
                <button className="game-button" onClick={handleNewGameClick}>
                    New Game
                </button>
                {/* Conditionally render Continue button */}
                {hasSaveData && (
                    <button
                        className="game-button"
                        onClick={handleContinueClick}
                    >
                        Continue
                    </button>
                )}
                <button className="game-button" onClick={handleOptionsClick}>
                    Options
                </button>
                <button className="game-button" onClick={handleCreditsClick}>
                    Credits
                </button>
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

