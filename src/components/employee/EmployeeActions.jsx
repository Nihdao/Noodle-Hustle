import { useState } from "react";
import PropTypes from "prop-types";

const EmployeeActions = ({ onActionSelect, onBack, laborCost }) => {
    const [hoveredAction, setHoveredAction] = useState(null);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("fr-FR").format(value) + " ¥";
    };

    // Using Tailwind classes with the same styling as NoodleBarActions
    return (
        <div className="flex flex-col h-full p-4 pb-20 overflow-auto animate-fade-in relative">
            <div className="mb-6 ml-2 animate-slide-in-left">
                <h2 className="text-2xl font-bold text-[color:var(--color-principalBrown)]">
                    Employee Management
                </h2>
                <div
                    className="text-[color:var(--color-principalBrown)] flex items-center mt-1 font-medium animate-slide-in-left"
                    style={{ animationDelay: "30ms" }}
                >
                    <span>Labor Cost: </span>
                    <span className="ml-2 text-lg font-semibold text-red-500">
                        {formatCurrency(laborCost)}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={() => onActionSelect("Management")}
                    onMouseEnter={() => setHoveredAction("Management")}
                    onMouseLeave={() => setHoveredAction(null)}
                    className={`
                        flex items-center justify-center p-6 rounded-lg
                        transition-all duration-300 cursor-pointer animate-slide-in-left
                        font-bold text-xl shadow-md
                        ${
                            hoveredAction === "Management"
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    Management
                </button>

                <button
                    onClick={() => onActionSelect("Recruitment")}
                    onMouseEnter={() => setHoveredAction("Recruitment")}
                    onMouseLeave={() => setHoveredAction(null)}
                    className={`
                        flex items-center justify-center p-6 rounded-lg
                        transition-all duration-300 cursor-pointer animate-slide-in-left
                        font-bold text-xl shadow-md
                        ${
                            hoveredAction === "Recruitment"
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
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                    </svg>
                    Recruitment
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

EmployeeActions.propTypes = {
    onActionSelect: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    laborCost: PropTypes.number.isRequired,
};

export default EmployeeActions;

