import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import Modal from "../common/Modal";

function OptionsModal({ isOpen, onClose, isMainMenu = false }) {
    // State for volume controls
    const [masterVolume, setMasterVolume] = useState(100);
    const [musicVolume, setMusicVolume] = useState(100);
    const [sfxVolume, setSfxVolume] = useState(100);

    // State for display settings
    const [windowSize, setWindowSize] = useState("fit");
    const [isFullscreen, setIsFullscreen] = useState(false);

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
        }
    }, []);

    // Save settings whenever they change
    useEffect(() => {
        const settings = {
            masterVolume,
            musicVolume,
            sfxVolume,
            windowSize,
            isFullscreen,
        };
        localStorage.setItem("noodleBalanceSettings", JSON.stringify(settings));

        // TODO: Apply settings to Phaser game instance
        // This will need to be implemented when we have access to the Phaser game object
    }, [masterVolume, musicVolume, sfxVolume, windowSize, isFullscreen]);

    const handleClearData = () => {
        if (
            window.confirm(
                "Are you sure you want to clear all save data? This cannot be undone."
            )
        ) {
            localStorage.removeItem("noodleBalanceSave");
            localStorage.removeItem("noodleBalanceSettings");
            window.location.reload();
        }
    };

    const handleManualSave = () => {
        // TODO: Implement manual save functionality
        console.log("Manual save triggered");
    };

    const handleLoadLastSave = () => {
        if (
            window.confirm(
                "Are you sure you want to load the last save? Current progress will be lost."
            )
        ) {
            // TODO: Implement load functionality
            console.log("Loading last save...");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Options"
            className="options-modal"
        >
            <div className="space-y-8">
                <section className="bg-[#f9f3e5]/70 rounded-lg p-6 border border-[#e1d1b3]">
                    <h3 className="text-xl font-bold text-[#c17a0f] border-b border-[#c17a0f]/30 pb-2 mb-4">
                        Audio
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
                                        setMasterVolume(Number(e.target.value))
                                    }
                                    className="flex-1 h-2 rounded bg-gradient-to-r from-[#c17a0f] to-[#e1d1b3] appearance-none cursor-pointer"
                                />
                                <span className="text-[#8b5d33] font-medium w-14 text-right">
                                    {masterVolume}%
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

