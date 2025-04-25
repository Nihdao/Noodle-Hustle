import PropTypes from "prop-types";
import { useSound } from "../../hooks/useSound";

const GameOverModal = ({ isOpen, onClose, reason }) => {
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
                className={`bg-[color:var(--color-whiteCream)] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden relative transition-all duration-300 ${
                    isOpen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                }`}
            >
                {/* Header */}
                <div className="p-4 bg-red-600 text-white flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Game Over</h2>
                    <button
                        onClick={handleClose}
                        className="p-1 rounded-full hover:bg-red-500 transition-colors"
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
                <div className="p-6">
                    <div className="text-center space-y-6">
                        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                            <h3 className="text-xl font-bold text-red-600 mb-4">
                                {reason === "burnout"
                                    ? "Total Burnout!"
                                    : "Bankruptcy!"}
                            </h3>
                            <p className="text-gray-700">
                                {reason === "burnout"
                                    ? "The stress of running your noodle business has become overwhelming. You need to take better care of your mental health!"
                                    : "Your business has gone bankrupt. Better financial management is needed to succeed!"}
                            </p>
                        </div>

                        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                            <h3 className="text-lg font-bold text-amber-600 mb-2">
                                Don&apos;t Give Up!
                            </h3>
                            <p className="text-gray-700">
                                Every failure is a chance to learn and grow. You
                                can restart from your last checkpoint and try a
                                different approach.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-500 transition-all duration-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

GameOverModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    reason: PropTypes.oneOf(["burnout", "bankruptcy"]).isRequired,
};

export default GameOverModal;

