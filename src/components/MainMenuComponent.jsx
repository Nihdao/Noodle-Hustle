import PropTypes from "prop-types";
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
        if (onOptions) onOptions();
        // TODO: Implement Options Modal logic
    };

    const handleCreditsClick = () => {
        console.log("Showing credits...");
        if (onCredits) onCredits();
        // TODO: Implement Credits Modal/Page logic
    };

    return (
        <div className="main-menu-overlay">
            {/* Logo placeholder - Style applied via CSS */}
            <h1>Noodle Balance</h1>
            {/* Menu Buttons - Vertical layout centered */}
            <div className="menu-buttons">
                <button onClick={handleNewGameClick}>New Game</button>
                {/* Conditionally render Continue button */}
                {hasSaveData && (
                    <button onClick={handleContinueClick}>Continue</button>
                )}
                <button onClick={handleOptionsClick}>Options</button>
                <button onClick={handleCreditsClick}>Credits</button>
            </div>
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

