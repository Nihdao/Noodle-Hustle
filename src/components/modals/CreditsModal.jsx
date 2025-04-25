import PropTypes from "prop-types";
import { useSound } from "../../hooks/useSound";

/**
 * Modal showing game credits and attribution
 */
function CreditsModal({ isOpen, onClose }) {
    const { playBackSound } = useSound();

    const handleClose = () => {
        playBackSound();
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
                    <h2 className="text-2xl font-bold">Credits</h2>
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
                            <h3 className="text-xl font-bold text-[#c17a0f] border-b border-[#c17a0f]/30 pb-2 mb-4">
                                Game Information
                            </h3>
                            <p className="text-[#8b5d33] text-lg leading-relaxed">
                                Created for GameDevJS 2025 Game Jam
                            </p>
                        </section>

                        <section className="bg-[#f9f3e5]/70 rounded-lg p-6 border border-[#e1d1b3]">
                            <h3 className="text-xl font-bold text-[#c17a0f] border-b border-[#c17a0f]/30 pb-2 mb-4">
                                Development Team
                            </h3>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-[#8b5d33] uppercase tracking-wide">
                                        Game Design & Development
                                    </span>
                                    <span className="text-xl font-semibold text-[#8b5d33]">
                                        <a
                                            href="https://x.com/nihdao"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline hover:text-[color:var(--color-principalRed)] transition-colors"
                                        >
                                            @Nihdao
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section className="bg-[#f9f3e5]/70 rounded-lg p-6 border border-[#e1d1b3]">
                            <h3 className="text-xl font-bold text-[#c17a0f] border-b border-[#c17a0f]/30 pb-2 mb-4">
                                Special Thanks
                            </h3>
                            <p className="text-[#8b5d33] text-lg leading-relaxed">
                                GameDevJS 2025 organizers and community
                            </p>
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

CreditsModal.propTypes = {
    /** Controls whether the modal is displayed */
    isOpen: PropTypes.bool.isRequired,
    /** Function to call when modal should close */
    onClose: PropTypes.func.isRequired,
};

export default CreditsModal;

