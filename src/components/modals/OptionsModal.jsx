import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { EventBus } from "../../game/EventBus";
import { useSound } from "../../hooks/useSound";

function OptionsModal({ isOpen, onClose, isMainMenu = false }) {
    // State for volume controls
    const [masterVolume, setMasterVolume] = useState(100);
    const [musicVolume, setMusicVolume] = useState(100);
    const [sfxVolume, setSfxVolume] = useState(100);

    // State for display settings
    const [windowSize, setWindowSize] = useState("fit");
    const [isFullscreen, setIsFullscreen] = useState(false);

    // State for mute
    const [isMuted, setIsMuted] = useState(false);

    // Use our sound hook for main menu context
    const { toggleMute, playClickSound, playBackSound } = useSound();

    // Load saved settings on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem("noodleBalanceSettings");
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setMasterVolume(settings.masterVolume ?? 100);
            setMusicVolume(settings.musicVolume ?? 100);
            setSfxVolume(settings.sfxVolume ?? 100);
            setWindowSize(settings.windowSize ?? "fit");
            setIsFullscreen(settings.isFullscreen ?? false);
            setIsMuted(settings.isMuted ?? false);
        }

        // Listen for mute state changes from the game
        const handleMuteStateChanged = (muted) => {
            setIsMuted(muted);
        };

        EventBus.on("muteStateChanged", handleMuteStateChanged);

        return () => {
            EventBus.off("muteStateChanged", handleMuteStateChanged);
        };
    }, []);

    // Save settings whenever they change
    useEffect(() => {
        const settings = {
            masterVolume,
            musicVolume,
            sfxVolume,
            windowSize,
            isFullscreen,
            isMuted,
        };
        localStorage.setItem("noodleBalanceSettings", JSON.stringify(settings));
    }, [
        masterVolume,
        musicVolume,
        sfxVolume,
        windowSize,
        isFullscreen,
        isMuted,
    ]);

    // Update volume in the AudioManager when sliders change
    useEffect(() => {
        // Send master volume to AudioManager
        EventBus.emit("setMasterVolume", masterVolume);
    }, [masterVolume]);

    useEffect(() => {
        // Send music volume to AudioManager
        EventBus.emit("setMusicVolume", musicVolume);
    }, [musicVolume]);

    useEffect(() => {
        // Send SFX volume to AudioManager
        EventBus.emit("setSfxVolume", sfxVolume);
    }, [sfxVolume]);

    const handleClearData = () => {
        if (
            window.confirm(
                "Are you sure you want to clear all save data? This cannot be undone."
            )
        ) {
            // Play sound effect
            EventBus.emit("playSound", "back");

            localStorage.removeItem("noodleBalanceSave");
            localStorage.removeItem("noodleBalanceSettings");
            window.location.reload();
        }
    };

    const handleManualSave = () => {
        // Play sound effect
        EventBus.emit("playSound", "click");

        // TODO: Implement manual save functionality
        console.log("Manual save triggered");
    };

    const handleLoadLastSave = () => {
        if (
            window.confirm(
                "Are you sure you want to load the last save? Current progress will be lost."
            )
        ) {
            // Play sound effect
            EventBus.emit("playSound", "click");

            // TODO: Implement load functionality
            console.log("Loading last save...");
        }
    };

    const handleToggleMute = () => {
        // Use different mute toggle methods based on context
        if (isMainMenu) {
            // Use the hook for main menu context
            toggleMute();
            setIsMuted(!isMuted); // Manually update state since we're not using the event listener

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

