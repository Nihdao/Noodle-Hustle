import { useState } from "react";
import PropTypes from "prop-types";
import { useGameState } from "../../store/gameStateHooks";

const BuffsModal = ({ isOpen, onClose }) => {
    const gameState = useGameState();
    const activeBuffs = gameState?.buffs?.active || [];
    const [selectedBuff, setSelectedBuff] = useState(null);

    // Regrouper les buffs par source (confidant)
    const buffsBySource = activeBuffs.reduce((acc, buff) => {
        if (!acc[buff.source]) {
            acc[buff.source] = [];
        }
        acc[buff.source].push(buff);
        return acc;
    }, {});

    // Fonction pour obtenir la couleur associée au type de buff
    const getBuffTypeColor = (type) => {
        const buffColors = {
            recruitmentGuru: {
                bg: "bg-green-500",
                text: "text-green-600",
                light: "bg-green-100",
            },
            deliveryFlow: {
                bg: "bg-blue-500",
                text: "text-blue-600",
                light: "bg-blue-100",
            },
            investorWhisperer: {
                bg: "bg-purple-500",
                text: "text-purple-600",
                light: "bg-purple-100",
            },
            mentalClarity: {
                bg: "bg-yellow-500",
                text: "text-yellow-600",
                light: "bg-yellow-100",
            },
            smartSpending: {
                bg: "bg-red-500",
                text: "text-red-600",
                light: "bg-red-100",
            },
        };

        return (
            buffColors[type] || {
                bg: "bg-gray-500",
                text: "text-gray-600",
                light: "bg-gray-100",
            }
        );
    };

    // Gestionnaire de clic sur un buff pour afficher les détails
    const handleBuffClick = (buff) => {
        setSelectedBuff(buff);
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
                onClick={onClose}
            />
            <div
                className={`bg-[color:var(--color-whiteCream)] rounded-xl shadow-2xl w-[800px] max-h-[90vh] overflow-hidden relative transition-all duration-300 ${
                    isOpen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                }`}
            >
                {/* Header */}
                <div className="p-4 bg-[color:var(--color-principalBrown)] text-[color:var(--color-whiteCream)] flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Active Buffs</h2>
                    <button
                        onClick={onClose}
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
                <div className="flex h-[500px]">
                    {/* Left panel - Buff list */}
                    <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-4">
                        {Object.keys(buffsBySource).length > 0 ? (
                            <div className="space-y-6">
                                {Object.entries(buffsBySource).map(
                                    ([source, buffs]) => (
                                        <div key={source} className="mb-4">
                                            <h3 className="text-lg font-semibold text-[color:var(--color-principalBrown)] mb-2">
                                                {source}
                                            </h3>
                                            <div className="space-y-2">
                                                {buffs.map((buff) => {
                                                    const colors =
                                                        getBuffTypeColor(
                                                            buff.type
                                                        );
                                                    return (
                                                        <div
                                                            key={buff.id}
                                                            className={`p-3 rounded-lg cursor-pointer transition-all ${
                                                                selectedBuff?.id ===
                                                                buff.id
                                                                    ? `${colors.light} border-2 border-${colors.bg}`
                                                                    : "bg-white hover:bg-gray-50 border border-gray-200"
                                                            }`}
                                                            onClick={() =>
                                                                handleBuffClick(
                                                                    buff
                                                                )
                                                            }
                                                        >
                                                            <div className="flex items-center">
                                                                <div
                                                                    className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center text-white font-bold mr-3`}
                                                                >
                                                                    {buff.level}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-[color:var(--color-principalBrown)]">
                                                                        {
                                                                            buff.name
                                                                        }
                                                                    </p>
                                                                    <p
                                                                        className={`text-xs ${colors.text}`}
                                                                    >
                                                                        Level{" "}
                                                                        {
                                                                            buff.level
                                                                        }
                                                                        /5
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 mb-4 opacity-50"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="text-center">
                                    No active buffs yet. Visit locations and
                                    build relationships to gain buffs!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right panel - Buff details */}
                    <div className="w-2/3 p-6 overflow-y-auto">
                        {selectedBuff ? (
                            <div className="h-full flex flex-col">
                                <div className="flex items-center mb-6">
                                    <div
                                        className={`w-14 h-14 rounded-full ${
                                            getBuffTypeColor(selectedBuff.type)
                                                .bg
                                        } flex items-center justify-center text-white text-2xl font-bold mr-4`}
                                    >
                                        {selectedBuff.level}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[color:var(--color-principalBrown)]">
                                            {selectedBuff.name}
                                        </h3>
                                        <p className="text-gray-600">
                                            Obtained from {selectedBuff.source}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className={`p-4 ${
                                        getBuffTypeColor(selectedBuff.type)
                                            .light
                                    } rounded-lg mb-6`}
                                >
                                    <h4 className="font-semibold text-principalBrown mb-2">
                                        Effect
                                    </h4>
                                    <p className="text-principalBrown">
                                        {selectedBuff.description}
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg mb-6">
                                    <h4 className="font-semibold text-principalBrown mb-2">
                                        Buff Stats
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Type
                                            </p>
                                            <p className="font-medium text-[color:var(--color-principalBrown)]">
                                                {selectedBuff.type
                                                    .replace(/([A-Z])/g, " $1")
                                                    .trim()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Level
                                            </p>
                                            <p className="font-medium text-[color:var(--color-principalBrown)]">
                                                {selectedBuff.level}/5
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-lg">
                                    <h4 className="font-semibold text-principalBrown mb-2">
                                        How to improve
                                    </h4>
                                    <p className="text-principalBrown">
                                        Continue building your relationship with{" "}
                                        {selectedBuff.source} to enhance this
                                        buff. Visit them regularly at their
                                        location.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-24 w-24 mb-4 opacity-30"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                                <p className="text-center text-lg">
                                    Select a buff to view its details
                                </p>
                                <p className="text-center text-sm mt-2 max-w-md">
                                    Buffs provide you with powerful bonuses that
                                    affect various aspects of your noodle
                                    business
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {activeBuffs.length}{" "}
                        {activeBuffs.length === 1 ? "buff" : "buffs"} active
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[color:var(--color-principalRed)] text-white rounded-md font-medium hover:bg-[color:var(--color-principalRed-light)] transition-all duration-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

BuffsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default BuffsModal;

