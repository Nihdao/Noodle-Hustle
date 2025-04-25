import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

/**
 * Toast notification component
 * @param {Object} props Component props
 * @param {string} props.message - Message to display
 * @param {string} props.type - Toast type: success, warning, info, error
 * @param {number} props.duration - Duration in ms before the toast disappears
 * @param {boolean} props.isVisible - Whether the toast is visible
 * @param {Function} props.onClose - Function to call when the toast closes
 */
const Toast = ({
    message,
    type = "info",
    duration = 5000,
    isVisible,
    onClose,
}) => {
    const [visible, setVisible] = useState(false);
    const [animationClass, setAnimationClass] = useState("animate-fadeInDown");
    const timerRef = useRef(null);

    // Set up colors based on type
    const bgColors = {
        success: "bg-green-500",
        warning: "bg-orange-400",
        info: "bg-blue-500",
        error: "bg-red-500",
        milestone: "bg-purple-600",
    };

    const iconMap = {
        success: (
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
                    d="M5 13l4 4L19 7"
                />
            </svg>
        ),
        warning: (
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
        ),
        info: (
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        error: (
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
        ),
        milestone: (
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
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
            </svg>
        ),
    };

    const bgColor = bgColors[type] || bgColors.info;
    const icon = iconMap[type] || iconMap.info;

    useEffect(() => {
        // Clear any existing timers
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (isVisible) {
            setVisible(true);
            setAnimationClass("animate-fadeInDown");

            // Setup timer to close toast
            timerRef.current = setTimeout(() => {
                closeToast();
            }, duration);
        }

        // Cleanup on unmount
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isVisible, duration]);

    const closeToast = () => {
        setAnimationClass("animate-fadeOut");

        // Wait for animation to complete before removing the toast
        setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, 300); // Match the animation duration
    };

    if (!visible) return null;

    return (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
            <div
                className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${animationClass} max-w-md`}
            >
                <div className="flex-shrink-0">{icon}</div>
                <p className="flex-1">{message}</p>
                <button
                    onClick={closeToast}
                    className="flex-shrink-0 ml-3 text-white hover:text-gray-200"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
        </div>
    );
};

Toast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["success", "warning", "info", "error", "milestone"]),
    duration: PropTypes.number,
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
};

export default Toast;

