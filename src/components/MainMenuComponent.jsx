import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import OptionsModal from "./modals/OptionsModal";
import CreditsModal from "./modals/CreditsModal";
import MenuButton from "./common/MenuButton";
import MenuContainer from "./common/MenuContainer";
import "../styles/menu.css";
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
    // Animation state
    const [animationState, setAnimationState] = useState("hidden");
    // Check if save data exists (placeholder logic, might need refinement)
    const hasSaveData = localStorage.getItem("noodleBalanceSave") !== null;

    // Trigger entrance animation after component mounts
    useEffect(() => {
        // Short delay to ensure animation works properly
        const timer = setTimeout(() => {
            setAnimationState("visible");
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const handleNewGameClick = () => {
        console.log("Starting new game...");
        localStorage.removeItem("noodleBalanceSave");
        if (onStartNewGame) onStartNewGame("Default Company");
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
    };

    return (
        <div className="main-menu-overlay">
            <MenuContainer animationState={animationState}>
                <h1 className="menu-title">
                    Noddle LifeBalance
                    <span className="menu-subtitle">麺類のライフバランス</span>
                </h1>

                <div className="menu-buttons">
                    <MenuButton onClick={handleNewGameClick}>
                        New Game
                    </MenuButton>

                    {hasSaveData && (
                        <MenuButton onClick={handleContinueClick}>
                            Continue
                        </MenuButton>
                    )}

                    <MenuButton onClick={handleOptionsClick}>
                        Options
                    </MenuButton>

                    <MenuButton onClick={handleCreditsClick}>
                        Credits
                    </MenuButton>
                </div>
            </MenuContainer>

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
    onStartNewGame: PropTypes.func.isRequired,
    onContinueGame: PropTypes.func.isRequired,
    onOptions: PropTypes.func.isRequired,
    onCredits: PropTypes.func.isRequired,
};

export default MainMenuComponent;

