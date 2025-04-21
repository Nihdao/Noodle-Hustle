import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { EventBus } from "../../game/EventBus";
import { useSound } from "../../hooks/useSound";
import { useGameSettings } from "../../store/gameStateHooks";
import { clearAllData } from "../../localStorage/storageManager";
import gameState from "../../game/GameState";

function OptionsModal({ isOpen, onClose, isMainMenu = false }) {
    // Use the settings hook to get and update game settings
    const { settings, updateSettings } = useGameSettings();

    // Ajouter un flag pour suivre si c'est la première initialisation
    const [isInitialized, setIsInitialized] = useState(false);

    // State for volume controls - initialized from settings
    const [masterVolume, setMasterVolume] = useState(100);
    const [musicVolume, setMusicVolume] = useState(100);
    const [sfxVolume, setSfxVolume] = useState(100);

    // State for display settings - we'll gérer les modifications de ces états plus tard
    const [windowSize, setWindowSize] = useState("fit");
    const [isFullscreen, setIsFullscreen] = useState(false);

    // State for mute
    const [isMuted, setIsMuted] = useState(false);

    // Use our sound hook for main menu context
    const { toggleMute, playClickSound, playBackSound } = useSound();

    // Load settings when component mounts
    useEffect(() => {
        if (settings && !isInitialized) {
            // Initialize state from settings
            setMasterVolume(settings.audio?.masterVolume || 100);
            setMusicVolume(settings.audio?.musicVolume || 100);
            setSfxVolume(settings.audio?.sfxVolume || 100);
            setWindowSize(settings.display?.windowSize || "fit");
            setIsFullscreen(settings.display?.isFullscreen || false);
            setIsMuted(settings.audio?.isMuted || false);

            // Marquer comme initialisé pour éviter de réinitialiser en boucle
            setIsInitialized(true);
        }
    }, [settings, isInitialized]);

    // Listen for mute state changes
    useEffect(() => {
        const handleMuteStateChanged = (muted) => {
            setIsMuted(muted);
        };

        EventBus.on("muteStateChanged", handleMuteStateChanged);

        return () => {
            EventBus.off("muteStateChanged", handleMuteStateChanged);
        };
    }, []);

    // Manual handler functions for settings changes
    const handleVolumeChange = (setter, value) => {
        // Play sound effect for feedback when changing volume
        if (!isMuted && value > 0) {
            if (isMainMenu) {
                playClickSound();
            } else {
                EventBus.emit("playSound", "click");
            }
        }

        setter(value);

        // Only update settings after user interaction, not during initialization
        if (isInitialized && settings) {
            // Determine which volume is being updated
            if (setter === setMasterVolume) {
                updateSettings({
                    audio: {
                        ...(settings.audio || {}),
                        masterVolume: value,
                    },
                });
                // Send master volume to AudioManager
                EventBus.emit("setMasterVolume", value);
            } else if (setter === setMusicVolume) {
                updateSettings({
                    audio: {
                        ...(settings.audio || {}),
                        musicVolume: value,
                    },
                });
                // Send music volume to AudioManager
                EventBus.emit("setMusicVolume", value);
            } else if (setter === setSfxVolume) {
                updateSettings({
                    audio: {
                        ...(settings.audio || {}),
                        sfxVolume: value,
                    },
                });
                // Send SFX volume to AudioManager
                EventBus.emit("setSfxVolume", value);
            }
        }
    };

    const handleToggleMute = () => {
        // Use different mute toggle methods based on context
        if (isMainMenu) {
            // Use the hook for main menu context
            toggleMute();
            const newMuteState = !isMuted;
            setIsMuted(newMuteState); // Manually update state since we're not using the event listener

            // Update settings
            if (isInitialized && settings) {
                updateSettings({
                    audio: {
                        ...(settings.audio || {}),
                        isMuted: newMuteState,
                    },
                });
            }

            // Play sound effect if unmuting
            if (isMuted) {
                setTimeout(() => {
                    playClickSound();
                }, 100);
            }
        } else {
            // Use EventBus for in-game context
            EventBus.emit("toggleMute");

            // Play sound effect if unmuting
            if (isMuted) {
                setTimeout(() => {
                    EventBus.emit("playSound", "click");
                }, 100);
            }
        }
    };

    const handleClearData = () => {
        if (
            window.confirm(
                "Are you sure you want to clear all save data? This cannot be undone."
            )
        ) {
            // Play sound effect
            EventBus.emit("playSound", "back");

            // Clear all data using the storage manager
            clearAllData();
            window.location.reload();
        }
    };

    const handleManualSave = () => {
        // Play sound effect
        EventBus.emit("playSound", "click");

        // Save the game state
        gameState.saveGameState(true); // Create a backup

        // Show some feedback (could be enhanced)
        alert("Game saved successfully!");
    };

    const handleLoadLastSave = () => {
        if (
            window.confirm(
                "Are you sure you want to load the last save? Current progress will be lost."
            )
        ) {
            // Play sound effect
            EventBus.emit("playSound", "click");

            // Reload the game state
            gameState.initialize(false);

            // Close the modal
            onClose();
        }
    };

    const handleClose = () => {
        // Play back sound
        if (isMainMenu) {
            // Use the hook properly
            playBackSound();
        } else {
            EventBus.emit("playSound", "back");
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Options"
            className="options-modal"
        >
            <div className="space-y-8">
                <section className="bg-[#f9f3e5]/70 rounded-lg p-6 border border-[#e1d1b3]">
                    <h3 className="text-xl font-bold text-[#c17a0f] border-b border-[#c17a0f]/30 pb-2 mb-4 flex justify-between items-center">
                        <span>Audio</span>
                        <button
                            onClick={handleToggleMute}
                            className={`px-3 py-1 rounded text-sm font-medium flex items-center ${
                                isMuted
                                    ? "bg-red-500 text-white"
                                    : "bg-[#e1d1b3] text-[#8b5d33]"
                            }`}
                        >
                            {isMuted ? "Unmute" : "Mute"}
                        </button>
                    </h3>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-[#8b5d33] uppercase tracking-wide block mb-2">
                                Master Volume
                            </span>
                            <div className="flex items-center gap-4 mt-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={masterVolume}
                                    onChange={(e) =>
                                        handleVolumeChange(
                                            setMasterVolume,
                                            Number(e.target.value)
                                        )
                                    }
                                    className="flex-1 h-2 rounded bg-gradient-to-r from-[#c17a0f] to-[#e1d1b3] appearance-none cursor-pointer"
                                />
                                <span className="text-[#8b5d33] font-medium w-14 text-right">
                                    {masterVolume}%
                                </span>
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-[#8b5d33] uppercase tracking-wide block mb-2">
                                Music Volume
                            </span>
                            <div className="flex items-center gap-4 mt-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={musicVolume}
                                    onChange={(e) =>
                                        handleVolumeChange(
                                            setMusicVolume,
                                            Number(e.target.value)
                                        )
                                    }
                                    className="flex-1 h-2 rounded bg-gradient-to-r from-[#c17a0f] to-[#e1d1b3] appearance-none cursor-pointer"
                                />
                                <span className="text-[#8b5d33] font-medium w-14 text-right">
                                    {musicVolume}%
                                </span>
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-[#8b5d33] uppercase tracking-wide block mb-2">
                                Sound Effects
                            </span>
                            <div className="flex items-center gap-4 mt-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sfxVolume}
                                    onChange={(e) =>
                                        handleVolumeChange(
                                            setSfxVolume,
                                            Number(e.target.value)
                                        )
                                    }
                                    className="flex-1 h-2 rounded bg-gradient-to-r from-[#c17a0f] to-[#e1d1b3] appearance-none cursor-pointer"
                                />
                                <span className="text-[#8b5d33] font-medium w-14 text-right">
                                    {sfxVolume}%
                                </span>
                            </div>
                        </label>
                    </div>
                </section>

                {!isMainMenu && (
                    <section className="bg-[#f9f3e5]/70 rounded-lg p-6 border border-[#e1d1b3]">
                        <h3 className="text-xl font-bold text-[#c17a0f] border-b border-[#c17a0f]/30 pb-2 mb-4">
                            Save & Load
                        </h3>
                        <div className="flex gap-4 flex-wrap">
                            <button
                                onClick={handleManualSave}
                                className="bg-gradient-to-br from-[#c17a0f] to-[#8b5d33] text-white px-6 py-3 rounded-lg font-medium uppercase tracking-wide text-sm hover:from-[#d68c18] hover:to-[#c17a0f] transition-all hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                Manual Save
                            </button>
                            <button
                                onClick={handleLoadLastSave}
                                className="bg-gradient-to-br from-[#c17a0f] to-[#8b5d33] text-white px-6 py-3 rounded-lg font-medium uppercase tracking-wide text-sm hover:from-[#d68c18] hover:to-[#c17a0f] transition-all hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                Load Last Save
                            </button>
                        </div>
                    </section>
                )}

                <section className="bg-[#f9f3e5]/70 rounded-lg p-6 border border-[#e1d1b3]">
                    <h3 className="text-xl font-bold text-[#c17a0f] border-b border-[#c17a0f]/30 pb-2 mb-4">
                        Reset
                    </h3>
                    <button
                        onClick={handleClearData}
                        className="bg-gradient-to-br from-[#d63031] to-[#e84393] text-white px-6 py-3 rounded-lg font-medium uppercase tracking-wide text-sm hover:from-[#ff7675] hover:to-[#fd79a8] transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        Clear Save Data
                    </button>
                </section>
            </div>
        </Modal>
    );
}

OptionsModal.propTypes = {
    /** Controls whether the modal is displayed */
    isOpen: PropTypes.bool.isRequired,
    /** Function to call when modal should close */
    onClose: PropTypes.func.isRequired,
    /** Whether this is shown from the main menu */
    isMainMenu: PropTypes.bool,
};

export default OptionsModal;

