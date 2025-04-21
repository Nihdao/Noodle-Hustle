import { useRef, useState } from "react";

// Remove unused Phaser import
// import Phaser from "phaser";
import { PhaserGame } from "./game/PhaserGame";
// Update import path
import MainMenuComponent from "./components/MainMenuComponent";
import GameIntroComponent from "./components/GameIntroComponent";
import HubComponent from "./components/HubComponent";
import DeliveryRunComponent from "./components/delivery/DeliveryRunComponent";

function App() {
    // References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef();
    const [currentSceneKey, setCurrentSceneKey] = useState(null);

    // Event emitted from the PhaserGame component
    const currentScene = (scene) => {
        console.log("App received scene:", scene);
        if (scene) {
            console.log(
                "Scene methods:",
                Object.getOwnPropertyNames(Object.getPrototypeOf(scene))
            );
        }

        if (scene && scene.scene) {
            setCurrentSceneKey(scene.scene.key);

            // Store scene reference in window to allow components to access it
            window.gameRef = scene;
            console.log("Set window.gameRef with scene key:", scene.scene.key);
        } else {
            setCurrentSceneKey(null);
            window.gameRef = null;
        }
    };

    // --- Button handlers for MainMenuComponent ---
    const handleStartNewGame = (companyName) => {
        console.log("App: Start New Game, Company:", companyName);
        const scene = phaserRef.current?.scene;
        if (scene?.scene.key === "MainMenu") {
            console.log("Starting GameIntro scene...");
            scene.scene.start("GameIntro"); // Start the GameIntro scene
        }
    };

    const handleContinueGame = () => {
        console.log("App: Continue Game");

        // Get save data from localStorage
        const saveData = localStorage.getItem("noodleBalanceSave");
        if (saveData) {
            try {
                // Parse the save data
                const parsedSaveData = JSON.parse(saveData);
                console.log("Loaded save data:", parsedSaveData);

                // Set the player name in localStorage to maintain consistency
                if (parsedSaveData.playerName) {
                    localStorage.setItem(
                        "playerName",
                        parsedSaveData.playerName
                    );
                }
            } catch (error) {
                console.error("Error parsing save data:", error);
            }
        }

        const scene = phaserRef.current?.scene;
        if (scene?.scene.key === "MainMenu") {
            console.log("Directly to HubScreen...");
            scene.scene.start("HubScreen"); // Skip intro and go to HubScreen
        }
    };

    const handleOptions = () => {
        console.log("App: Open Options");
        // TODO: Show options modal
    };

    const handleCredits = () => {
        console.log("App: Show Credits");
        // TODO: Show credits modal/page
    };
    // --- End Handlers ---

    // Handler for intro completion
    const handleCompleteIntro = () => {
        console.log("Intro sequence completed");
    };

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

            {/* Conditionally render the MainMenuComponent */}
            {currentSceneKey === "MainMenu" && (
                <MainMenuComponent
                    onStartNewGame={handleStartNewGame}
                    onContinueGame={handleContinueGame}
                    onOptions={handleOptions}
                    onCredits={handleCredits}
                />
            )}

            {/* Conditionally render the GameIntroComponent */}
            {currentSceneKey === "GameIntro" && (
                <GameIntroComponent onCompleteIntro={handleCompleteIntro} />
            )}

            {/* Conditionally render the HubComponent */}
            {currentSceneKey === "HubScreen" && <HubComponent />}

            {/* Conditionally render the DeliveryRunComponent */}
            {currentSceneKey === "DeliveryRun" && <DeliveryRunComponent />}

            {/* Example: Conditionally render other components based on scene key */}
            {/* {currentSceneKey === 'Game' && <GameOverlayComponent />} */}
        </div>
    );
}

export default App;

