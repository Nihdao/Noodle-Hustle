import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import { useSound } from "../../hooks/useSound";

/**
 * A reusable modal component with smooth transitions
 */
function Modal({
    isOpen,
    onClose,
    title,
    children,
    className = "",
    closeOnOutsideClick = true,
}) {
    const [animationState, setAnimationState] = useState("closed");
    const modalRef = useRef(null);
    const { playBackSound } = useSound();

    // Cette useEffect gère l'animation d'ouverture/fermeture
    useEffect(() => {
        if (isOpen && animationState !== "open") {
            setAnimationState("opening");
            const timer = setTimeout(() => {
                setAnimationState("open");
            }, 10);
            return () => clearTimeout(timer);
        } else if (!isOpen && animationState !== "closed") {
            setAnimationState("closing");
            const timer = setTimeout(() => {
                setAnimationState("closed");
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, animationState]);

    // Handle clicks outside the modal
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                closeOnOutsideClick &&
                modalRef.current &&
                !modalRef.current.contains(event.target)
            ) {
                playBackSound();
                onClose();
            }
        }

        // Add event listener if modal is open
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Clean up event listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, closeOnOutsideClick, playBackSound]);

    // Handle escape key press
    useEffect(() => {
        function handleEscapeKey(event) {
            if (event.key === "Escape" && isOpen) {
                playBackSound();
                onClose();
            }
        }

        // Add event listener if modal is open
        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey);
        }

        // Clean up event listener
        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [isOpen, onClose, playBackSound]);

    // Don't render anything if modal is fully closed
    if (animationState === "closed" && !isOpen) {
        return null;
    }

    // Set styling based on animation state
    const overlayStyle = {
        opacity:
            animationState === "open"
                ? 1
                : animationState === "opening"
                ? 0
                : animationState === "closing"
                ? 0
                : 0,
    };

    const modalStyle = {
        transform:
            animationState === "open"
                ? "scale(1)"
                : animationState === "opening"
                ? "scale(0.9)"
                : animationState === "closing"
                ? "scale(0.9)"
                : "scale(0.9)",
        opacity:
            animationState === "open"
                ? 1
                : animationState === "opening"
                ? 0
                : animationState === "closing"
                ? 0
                : 0,
    };

    const handleCloseClick = (e) => {
        e.stopPropagation(); // Empêcher la propagation pour éviter les déclenchements multiples
        playBackSound();
        onClose();
    };

    const handleOverlayClick = (e) => {
        // Uniquement si nous cliquons directement sur l'overlay (pas sur ses enfants)
        if (e.target === e.currentTarget && closeOnOutsideClick) {
            playBackSound();
            onClose();
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300`}
            style={overlayStyle}
            onClick={handleOverlayClick}
        >
            <div
                ref={modalRef}
                className={`
                bg-gradient-to-br from-[#f9f3e5] to-[#eee5d3]
                rounded-xl shadow-xl overflow-hidden
                max-w-4xl w-full max-h-[90vh] 
                flex flex-col relative
                transition-all duration-300
                ${className}
                `}
                style={modalStyle}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <h2
                    id="modal-title"
                    className="text-2xl font-bold text-center text-[#8b5d33] tracking-wide drop-shadow-[0_0_10px_rgba(193,122,15,0.2)] px-6 pt-6 pb-3"
                >
                    {title}
                </h2>

                <div className="flex-grow max-h-[75vh] overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar">
                    {children}
                </div>

                <button
                    onClick={handleCloseClick}
                    className="absolute top-2 right-2 text-[#c17a0f] hover:text-[#a36508] w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-[#c17a0f]/10 hover:rotate-90 text-2xl leading-none"
                    aria-label="Close"
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
    /** Modal title displayed in the header */
    title: PropTypes.string.isRequired,
    /** Modal content */
    children: PropTypes.node.isRequired,
    /** Additional CSS class */
    className: PropTypes.string,
    /** Whether clicking outside the modal should close it */
    closeOnOutsideClick: PropTypes.bool,
};

export default Modal;

