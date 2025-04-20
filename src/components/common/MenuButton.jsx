import PropTypes from "prop-types";
import { useState } from "react";
import { useSound } from "../../hooks/useSound";

/**
 * A stylized button component used in menu interfaces
 */
function MenuButton({
    onClick,
    children,
    isBack = false,
    disabled = false,
    className = "",
    ...props
}) {
    const [isHovered, setIsHovered] = useState(false);
    const { playClickSound, playBackSound } = useSound();

    const handleClick = (e) => {
        // Play appropriate sound effect
        if (!disabled) {
            if (isBack) {
                playBackSound();
            } else {
                playClickSound();
            }

            // Call the original onClick handler
            if (onClick) {
                onClick(e);
            }
        }
    };

    const buttonStyle = {
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: isHovered && !disabled ? "scale(1.05)" : "scale(1)",
        backgroundColor: isBack
            ? isHovered && !disabled
                ? "#b7813f"
                : "#CD7F32"
            : isHovered && !disabled
            ? "#e67e22"
            : "#d35400",
        color: "white",
        padding: "0.75rem 1.5rem",
        margin: "0.5rem 0",
        border: "none",
        borderRadius: "0.375rem",
        fontWeight: "bold",
        transition: "all 0.3s ease",
        width: "100%",
        textAlign: "center",
        fontSize: "1.125rem",
    };

    return (
        <button
            style={buttonStyle}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={disabled}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
}

MenuButton.propTypes = {
    /** Click handler function */
    onClick: PropTypes.func,
    /** Button content/label */
    children: PropTypes.node.isRequired,
    /** Whether the button is a back button */
    isBack: PropTypes.bool,
    /** Whether the button is disabled */
    disabled: PropTypes.bool,
    /** Additional CSS classes */
    className: PropTypes.string,
};

export default MenuButton;

