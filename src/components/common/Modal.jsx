import PropTypes from "prop-types";
import { useState, useEffect } from "react";

/**
 * A reusable modal component with smooth transitions
 */
function Modal({ isOpen, onClose, title, children, className = "" }) {
    const [animationState, setAnimationState] = useState("closed");

    useEffect(() => {
        let timer;
        if (isOpen && animationState !== "open") {
            // First set to "opening" immediately when prop changes
            setAnimationState("opening");
            // Then set to "open" after a small delay to allow transition
            timer = setTimeout(() => {
                setAnimationState("open");
            }, 50);
        } else if (!isOpen && animationState !== "closed") {
            // First set to "closing" when modal is requested to close
            setAnimationState("closing");
            // Then set to fully "closed" after animation completes
            timer = setTimeout(() => {
                setAnimationState("closed");
            }, 300); // Match this with the CSS transition duration
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isOpen, animationState]);

    // Don't render anything if modal is fully closed
    if (animationState === "closed" && !isOpen) return null;

    // Styles based on animation state
    const overlayStyle = {
        opacity:
            animationState === "open"
                ? 1
                : animationState === "opening"
                ? 0
                : 0.5,
        transition: "opacity 300ms ease-in-out",
    };

    const modalStyle = {
        opacity:
            animationState === "open"
                ? 1
                : animationState === "opening"
                ? 0
                : 0.7,
        transform:
            animationState === "open"
                ? "translateY(0) scale(1)"
                : animationState === "opening"
                ? "translateY(20px) scale(0.95)"
                : "translateY(0) scale(0.98)",
        transition:
            "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease-out",
    };

    const handleOverlayClick = (e) => {
        // Only close if clicking directly on the overlay, not on its children
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            style={overlayStyle}
            onClick={handleOverlayClick}
        >
            <div
                className={`
                bg-gradient-to-br from-[#f9f3e5] to-[#eee5d3]
                text-[#8b5d33] rounded-xl
                w-full max-w-xl
                shadow-lg shadow-[#c17a0f]/20
                border border-[#e1d1b3]
                relative
                flex flex-col
                ${className}
                `}
                style={modalStyle}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-center text-[#8b5d33] tracking-wide drop-shadow-[0_0_10px_rgba(193,122,15,0.2)] px-6 pt-6 pb-3">
                    {title}
                </h2>

                <div className="flex-grow max-h-[75vh] overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar">
                    {children}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute top-2 right-2 text-[#c17a0f] hover:text-[#a36508] w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-[#c17a0f]/10 hover:rotate-90 text-2xl leading-none"
                >
                    &times;
                </button>
            </div>
        </div>
    );
}

Modal.propTypes = {
    /** Controls whether the modal is displayed */
    isOpen: PropTypes.bool.isRequired,
    /** Function to call when modal should close */
    onClose: PropTypes.func.isRequired,
    /** Modal title */
    title: PropTypes.string.isRequired,
    /** Modal content */
    children: PropTypes.node.isRequired,
    /** Additional CSS class */
    className: PropTypes.string,
};

export default Modal;

