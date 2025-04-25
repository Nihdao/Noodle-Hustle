import { useState, useEffect } from "react";
import { EventBus } from "../../game/EventBus";
import Toast from "./Toast";

/**
 * ToastManager component to handle multiple toast notifications
 * Can be used directly by importing and mounting it at the app root
 * Also serves as a global toast service via EventBus
 */
const ToastManager = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        // Listen for toast events via EventBus
        const handleShowToast = ({ message, type, duration }) => {
            addToast(message, type, duration);
        };

        // Listen for milestone events and convert to toasts
        const handleMilestone = (milestoneData) => {
            const message = `Rank Milestone: Rank ${milestoneData.rank} - ${
                milestoneData.description
            }${
                milestoneData.reward ? ` - Reward: ${milestoneData.reward}` : ""
            }`;
            addToast(message, "milestone", 8000);
        };

        EventBus.on("showToast", handleShowToast);
        EventBus.on("rankMilestoneReached", handleMilestone);

        return () => {
            EventBus.off("showToast", handleShowToast);
            EventBus.off("rankMilestoneReached", handleMilestone);
        };
    }, []);

    // Add a new toast to the stack
    const addToast = (message, type = "info", duration = 5000) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    };

    // Remove a toast by id
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <div className="toast-container">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{ marginTop: `${index * 5}px` }}
                    className="toast-item"
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        isVisible={true}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default ToastManager;
