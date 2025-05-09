import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import OptionsModal from "./modals/OptionsModal";
import CreditsModal from "./modals/CreditsModal";
import MenuButton from "./common/MenuButton";
import MenuContainer from "./common/MenuContainer";
import { useSound } from "../hooks/useSound";
import { hasSaveGame } from "../localStorage/storageManager";
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
    // Check if save data exists using the storage manager
    const saveExists = hasSaveGame();
    // Son
    const { playClickSound, playBackSound } = useSound();

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
        playClickSound();
        if (onStartNewGame) onStartNewGame();
    };

    const handleContinueClick = () => {
        console.log("Continuing game...");
        playClickSound();
        if (onContinueGame) onContinueGame();
    };

    const handleOptionsClick = () => {
        console.log("Opening options...");
        playClickSound();
        setIsOptionsModalOpen(true);
        if (onOptions) onOptions();
    };

    const handleCreditsClick = () => {
        console.log("Showing credits...");
        playClickSound();
        setIsCreditsModalOpen(true);
        if (onCredits) onCredits();
    };

    const handleCloseOptions = () => {
        console.log("Closing options...");
        playBackSound();
        setIsOptionsModalOpen(false);
    };

    const handleCloseCredits = () => {
        console.log("Closing credits...");
        playBackSound();
        setIsCreditsModalOpen(false);
    };

    return (
        <div className="main-menu-overlay">
            <MenuContainer
                animationState={animationState}
                className=" min-w-[450px]"
            >
                <h1 className="menu-title text-principalBrown">
                    Noodle Hustle
                    <span className="menu-subtitle text-principalBrown">
                        The Balance of Noodles
                    </span>
                </h1>

                <div className="menu-buttons">
                    {!saveExists && (
                        <MenuButton
                            onClick={handleNewGameClick}
                            className="bg-principalRed hover:bg-principalRed-light"
                        >
                            New Game
                        </MenuButton>
                    )}

                    {saveExists && (
                        <MenuButton
                            onClick={handleContinueClick}
                            className="bg-principalRed hover:bg-principalRed-light"
                        >
                            Continue
                        </MenuButton>
                    )}

                    <MenuButton
                        onClick={handleOptionsClick}
                        className="bg-principalRed hover:bg-principalRed-light"
                    >
                        Options
                    </MenuButton>

                    <MenuButton
                        onClick={handleCreditsClick}
                        className="bg-principalRed hover:bg-principalRed-light"
                    >
                        Credits
                    </MenuButton>
                </div>
            </MenuContainer>

            {isOptionsModalOpen && (
                <OptionsModal
                    isOpen={true}
                    onClose={handleCloseOptions}
                    isMainMenu={true}
                />
            )}

            {isCreditsModalOpen && (
                <CreditsModal isOpen={true} onClose={handleCloseCredits} />
            )}
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

