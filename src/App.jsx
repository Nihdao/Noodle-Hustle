import { useRef, useState } from "react";

// Remove unused Phaser import
// import Phaser from "phaser";
import { PhaserGame } from "./game/PhaserGame";
// Update import path
import MainMenuComponent from "./components/MainMenuComponent";
import GameIntroComponent from "./components/GameIntroComponent";
import HubComponent from "./components/HubComponent";
import DeliveryRunComponent from "./components/delivery/DeliveryRunComponent";
import DebugSaveModal from "./utils/DebugSaveModal";

const DEBUG_MODE = true; // Mettre à false pour désactiver le bouton debug

function App() {
    // References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef();
    const [currentSceneKey, setCurrentSceneKey] = useState(null);
    const [showDebugModal, setShowDebugModal] = useState(false);
    const [debugContent, setDebugContent] = useState("");

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

    const openDebugModal = () => {
        const saveData = localStorage.getItem("noodleBalanceSave");
        let content = "";
        try {
            content = saveData
                ? JSON.stringify(JSON.parse(saveData), null, 2)
                : "Aucune sauvegarde trouvée.";
        } catch (e) {
            content = "Erreur de parsing : " + e.message;
        }
        setDebugContent(content);
        setShowDebugModal(true);
    };

    const closeDebugModal = () => setShowDebugModal(false);

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

            {/* Debug Button & Modal */}
            {DEBUG_MODE && (
                <>
                    <button
                        style={{
                            position: "fixed",
                            bottom: 24,
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 1000,
                            opacity: 0.5,
                            background: "#222",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "6px 18px",
                            fontSize: 14,
                            cursor: "pointer",
                        }}
                        onClick={openDebugModal}
                    >
                        Debug Save
                    </button>
                    <DebugSaveModal
                        open={showDebugModal}
                        onClose={closeDebugModal}
                        content={debugContent}
                    />
                </>
            )}
        </div>
    );
}

export default App;

