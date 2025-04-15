import { useRef, useState } from "react";

// Remove unused Phaser import
// import Phaser from "phaser";
import { PhaserGame } from "./game/PhaserGame";
// Update import path
import MainMenuComponent from "./components/MainMenuComponent";

function App() {
    // References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef();
    const [currentSceneKey, setCurrentSceneKey] = useState(null);

    // Event emitted from the PhaserGame component
    const currentScene = (scene) => {
        if (scene && scene.scene) {
            setCurrentSceneKey(scene.scene.key);
        } else {
            setCurrentSceneKey(null);
        }
    };

    // --- Button handlers for MainMenuComponent ---
    const handleStartNewGame = () => {
        console.log("App: Start New Game");
        const scene = phaserRef.current?.scene;
        if (scene?.scene.key === "MainMenu") {
            console.log("Triggering scene change from App...");
            scene.scene.start("Game"); // Example: Start the 'Game' scene
        }
    };

    const handleContinueGame = () => {
        console.log("App: Continue Game");
        const scene = phaserRef.current?.scene;
        if (scene?.scene.key === "MainMenu") {
            console.log("Triggering scene change from App...");
            scene.scene.start("Game"); // Example: Start 'Game' scene
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

            {/* Example: Conditionally render other components based on scene key */}
            {/* {currentSceneKey === 'HubScreen' && <HubComponent />} */}
            {/* {currentSceneKey === 'Game' && <GameOverlayComponent />} */}
        </div>
    );
}

export default App;

