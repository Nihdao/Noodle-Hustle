import { useState } from "react";
import PropTypes from "prop-types";

const NoodleBarActions = ({ onActionSelect, onBack }) => {
    const [hoveredAction, setHoveredAction] = useState(null);

    const actionButtonStyle = (isHovered) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        transition: "all 0.3s ease",
        cursor: "pointer",
        backgroundColor: isHovered
            ? "var(--color-principalRed)"
            : "var(--color-whiteCream)",
        color: isHovered
            ? "var(--color-whiteCream)"
            : "var(--color-principalBrown)",
        borderRadius: "0.5rem",
        margin: "0.5rem",
        fontWeight: "bold",
        fontSize: "1.5rem",
        boxShadow: isHovered
            ? "0 4px 6px rgba(0, 0, 0, 0.2)"
            : "0 2px 4px rgba(0, 0, 0, 0.1)",
        border: "none",
        outline: "none",
    });

    return (
        <div className="flex flex-col h-full p-4 pb-40 overflow-auto animate-fade-in">
            <div className="text-2xl font-bold text-[var(--color-principalBrown)] mb-6 ml-2 animate-slide-in-left">
                Noodle Bars Management
            </div>

            <button
                onClick={() => onActionSelect("Assign")}
                onMouseEnter={() => setHoveredAction("Assign")}
                onMouseLeave={() => setHoveredAction(null)}
                className="animate-slide-in-left"
                style={{
                    ...actionButtonStyle(hoveredAction === "Assign"),
                    animationDelay: "50ms",
                }}
            >
                Assign
            </button>

            <button
                onClick={() => onActionSelect("Upgrade")}
                onMouseEnter={() => setHoveredAction("Upgrade")}
                onMouseLeave={() => setHoveredAction(null)}
                className="animate-slide-in-left"
                style={{
                    ...actionButtonStyle(hoveredAction === "Upgrade"),
                    animationDelay: "100ms",
                }}
            >
                Upgrade
            </button>

            <button
                onClick={() => onActionSelect("BuySell")}
                onMouseEnter={() => setHoveredAction("BuySell")}
                onMouseLeave={() => setHoveredAction(null)}
                className="animate-slide-in-left"
                style={{
                    ...actionButtonStyle(hoveredAction === "BuySell"),
                    animationDelay: "150ms",
                }}
            >
                Buy/Sell
            </button>

            <button
                onClick={onBack}
                onMouseEnter={() => setHoveredAction("Back")}
                onMouseLeave={() => setHoveredAction(null)}
                className="animate-slide-in-left mt-auto"
                style={{
                    ...actionButtonStyle(hoveredAction === "Back"),
                    backgroundColor:
                        hoveredAction === "Back"
                            ? "var(--color-principalBrown)"
                            : "var(--color-yellowWhite)",
                    animationDelay: "200ms",
                }}
            >
                Back
            </button>
        </div>
    );
};

NoodleBarActions.propTypes = {
    onActionSelect: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
};

export default NoodleBarActions;

