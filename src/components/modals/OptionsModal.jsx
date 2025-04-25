import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { EventBus } from "../../game/EventBus";
import { useSound } from "../../hooks/useSound";
import { useGameSettings } from "../../store/gameStateHooks";
import { clearAllData } from "../../localStorage/storageManager";
// import gameState from "../../game/GameState";

function OptionsModal({ isOpen, onClose, isMainMenu = false }) {
    const { settings, updateSettings } = useGameSettings();
    const [isInitialized, setIsInitialized] = useState(false);
    const [masterVolume, setMasterVolume] = useState(100);
    const [musicVolume, setMusicVolume] = useState(100);
    const [sfxVolume, setSfxVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const { toggleMute, playClickSound, playBackSound } = useSound();

    useEffect(() => {
        if (settings && !isInitialized) {
            setMasterVolume(settings.audio?.masterVolume || 100);
            setMusicVolume(settings.audio?.musicVolume || 100);
            setSfxVolume(settings.audio?.sfxVolume || 100);
            setIsMuted(settings.audio?.isMuted || false);
            setIsInitialized(true);
        }
    }, [settings, isInitialized]);

    useEffect(() => {
        const handleMuteStateChanged = (muted) => {
            setIsMuted(muted);
        };

        EventBus.on("muteStateChanged", handleMuteStateChanged);
        return () => {
            EventBus.off("muteStateChanged", handleMuteStateChanged);
        };
    }, []);

    const handleVolumeChange = (setter, value) => {
        if (!isMuted && value > 0) {
            if (isMainMenu) {
                playClickSound();
            } else {
                EventBus.emit("playSound", "click");
            }
        }

        setter(value);

        if (isInitialized && settings) {
            if (setter === setMasterVolume) {
                updateSettings({
                    audio: {
                        ...(settings.audio || {}),
                        masterVolume: value,
                    },
                });
                EventBus.emit("setMasterVolume", value);
            } else if (setter === setMusicVolume) {
                updateSettings({
                    audio: {
                        ...(settings.audio || {}),
                        musicVolume: value,
                    },
                });
                EventBus.emit("setMusicVolume", value);
            } else if (setter === setSfxVolume) {
                updateSettings({
                    audio: {
                        ...(settings.audio || {}),
                        sfxVolume: value,
                    },
                });
                EventBus.emit("setSfxVolume", value);
            }
        }
    };

    const handleToggleMute = () => {
        if (isMainMenu) {
            toggleMute();
            const newMuteState = !isMuted;
            setIsMuted(newMuteState);

            if (isInitialized && settings) {
                updateSettings({
                    audio: {
                        ...(settings.audio || {}),
                        isMuted: newMuteState,
                    },
                });
            }

            if (newMuteState === false) {
                playClickSound();
            }
        } else {
            EventBus.emit("toggleMute");
        }
    };

    const handleClearData = () => {
        if (
            window.confirm(
                "Are you sure you want to clear all save data? This cannot be undone."
            )
        ) {
            EventBus.emit("playSound", "back");
            clearAllData();
            window.location.reload();
        }
    };

    // const handleManualSave = () => {
    //     EventBus.emit("playSound", "click");
    //     gameState.saveGameState(true);
    //     alert("Game saved successfully!");
    // };

    // const handleLoadLastSave = () => {
    //     if (
    //         window.confirm(
    //             "Are you sure you want to load the last save? Current progress will be lost."
    //         )
    //     ) {
    //         EventBus.emit("playSound", "click");
    //         gameState.initialize(false);
    //         onClose();
    //     }
    // };

    const handleClose = () => {
        if (isMainMenu) {
            playBackSound();
        } else {
            EventBus.emit("playSound", "back");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            <div
                className="absolute inset-0 backdrop-blur-sm bg-black/30"
                onClick={handleClose}
            />
            <div
                className={`bg-[color:var(--color-whiteCream)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative transition-all duration-300 ${
                    isOpen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                }`}
            >
                {/* Header */}
                <div className="p-4 bg-[color:var(--color-principalBrown)] text-[color:var(--color-whiteCream)] flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Options</h2>
                    <button
                        onClick={handleClose}
                        className="p-1 rounded-full hover:bg-[color:var(--color-principalBrown-light)] transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="space-y-6">
                        <section className="bg-[#f9f3e5]/70 rounded-lg p-6 border border-[#e1d1b3]">
                            <h3 className="text-xl font-bold text-[#c17a0f] border-b border-[#c17a0f]/30 pb-2 mb-4 flex justify-between items-center">
                                <span>Audio</span>
                                {!isMainMenu && (
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
                                )}
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

                        {/* {!isMainMenu && (
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
                        )} */}

                        <section className="bg-[#f9f3e5]/70 rounded-lg p-6 border border-[#e1d1b3] text-left">
                            <h3 className="text-xl font-bold text-[#c17a0f] border-b border-[#c17a0f]/30 pb-2 mb-4">
                                Reset
                            </h3>
                            <button
                                onClick={handleClearData}
                                className="bg-principalRed hover:bg-principalRed-light text-white px-6 py-3 rounded-lg font-medium uppercase tracking-wide text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                Clear Save Data
                            </button>
                        </section>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-[color:var(--color-principalRed)] text-white rounded-lg font-medium hover:bg-[color:var(--color-principalRed-light)] transition-all duration-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

OptionsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isMainMenu: PropTypes.bool,
};

export default OptionsModal;

