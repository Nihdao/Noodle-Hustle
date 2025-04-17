import PropTypes from "prop-types";
import { useState } from "react";

/**
 * A stylized button component used in menu interfaces
 */
function MenuButton({ onClick, children, className = "", disabled = false }) {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        if (!disabled) {
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (!disabled) {
            setIsHovered(false);
        }
    };

    const baseStyle = {
        backgroundColor: disabled
            ? "#adadad"
            : isHovered
            ? "#e69426"
            : "#c17a0f",
        color: "white",
        border: "none",
        padding: "10px 20px",
        fontSize: "1rem",
        borderRadius: "4px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        textShadow: "1px 1px 1px rgba(0,0,0,0.3)",
        boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.2)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        opacity: disabled ? 0.7 : 1,
    };

    return (
        <button
            style={baseStyle}
            onClick={disabled ? undefined : onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={className}
        >
            {children}
        </button>
    );
}

MenuButton.propTypes = {
    /** Click handler function */
    onClick: PropTypes.func.isRequired,
    /** Button content/label */
    children: PropTypes.node.isRequired,
    /** Additional CSS classes */
    className: PropTypes.string,
    /** Whether the button is disabled */
    disabled: PropTypes.bool,
};

export default MenuButton;

