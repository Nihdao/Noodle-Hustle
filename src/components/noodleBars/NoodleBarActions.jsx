import { useState } from "react";
import PropTypes from "prop-types";

const NoodleBarActions = ({ onActionSelect, onBack, forecastedProfit }) => {
    const [hoveredAction, setHoveredAction] = useState(null);

    const formatCurrency = (value) => {
        return "¥" + new Intl.NumberFormat("en-US").format(value);
    };

    // Using more Tailwind classes instead of inline styles
    return (
        <div className="flex flex-col h-full p-4 pb-20 overflow-auto animate-fade-in relative">
            <div className="mb-6 ml-2 animate-slide-in-left">
                <h2 className="text-2xl font-bold text-[color:var(--color-principalBrown)]">
                    Noodle Bars Management
                </h2>
                <div
                    className="text-[color:var(--color-principalBrown)] flex items-center mt-1 font-medium animate-slide-in-left"
                    style={{ animationDelay: "30ms" }}
                >
                    <span>Forecasted profit: </span>
                    <span
                        className={`ml-2 text-lg font-semibold ${
                            forecastedProfit < 0
                                ? "text-red-500"
                                : "text-emerald-600"
                        }`}
                    >
                        {formatCurrency(forecastedProfit)}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={() => onActionSelect("Assign")}
                    onMouseEnter={() => setHoveredAction("Assign")}
                    onMouseLeave={() => setHoveredAction(null)}
                    className={`
                        flex items-center justify-center p-6 rounded-lg
                        transition-all duration-300 cursor-pointer animate-slide-in-left
                        font-bold text-xl shadow-md
                        ${
                            hoveredAction === "Assign"
                                ? "bg-[color:var(--color-principalRed)] text-[color:var(--color-whiteCream)] translate-x-1 shadow-lg"
                                : "bg-[color:var(--color-whiteCream)] text-[color:var(--color-principalBrown)]"
                        }
                    `}
                    style={{ animationDelay: "50ms" }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Assign
                </button>

                <button
                    onClick={() => onActionSelect("Upgrade")}
                    onMouseEnter={() => setHoveredAction("Upgrade")}
                    onMouseLeave={() => setHoveredAction(null)}
                    className={`
                        flex items-center justify-center p-6 rounded-lg
                        transition-all duration-300 cursor-pointer animate-slide-in-left
                        font-bold text-xl shadow-md
                        ${
                            hoveredAction === "Upgrade"
                                ? "bg-[color:var(--color-principalRed)] text-[color:var(--color-whiteCream)] translate-x-1 shadow-lg"
                                : "bg-[color:var(--color-whiteCream)] text-[color:var(--color-principalBrown)]"
                        }
                    `}
                    style={{ animationDelay: "100ms" }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                    </svg>
                    Upgrade
                </button>

                <button
                    onClick={() => onActionSelect("BuySell")}
                    onMouseEnter={() => setHoveredAction("BuySell")}
                    onMouseLeave={() => setHoveredAction(null)}
                    className={`
                        flex items-center justify-center p-6 rounded-lg
                        transition-all duration-300 cursor-pointer animate-slide-in-left
                        font-bold text-xl shadow-md
                        ${
                            hoveredAction === "BuySell"
                                ? "bg-[color:var(--color-principalRed)] text-[color:var(--color-whiteCream)] translate-x-1 shadow-lg"
                                : "bg-[color:var(--color-whiteCream)] text-[color:var(--color-principalBrown)]"
                        }
                    `}
                    style={{ animationDelay: "150ms" }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                    Buy/Sell
                </button>
            </div>

            {/* Fixed back button at the bottom */}
            <div className="fixed bottom-0 left-0 w-full p-4 border-t border-[color:var(--color-principalBrown)] border-opacity-20 bg-[color:var(--color-yellowWhite)] flex justify-between z-10">
                <button
                    onClick={onBack}
                    onMouseEnter={() => setHoveredAction("Back")}
                    onMouseLeave={() => setHoveredAction(null)}
                    className={`
                        px-4 py-2 rounded-md font-bold transition-all duration-300 transform
                        ${
                            hoveredAction === "Back"
                                ? "bg-[color:var(--color-principalBrown)] text-[color:var(--color-whiteCream)] scale-105"
                                : "bg-[color:var(--color-yellowWhite)] text-[color:var(--color-principalBrown)]"
                        }
                    `}
                >
                    <div className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back
                    </div>
                </button>
            </div>
        </div>
    );
};

NoodleBarActions.propTypes = {
    onActionSelect: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    forecastedProfit: PropTypes.number.isRequired,
};

export default NoodleBarActions;

