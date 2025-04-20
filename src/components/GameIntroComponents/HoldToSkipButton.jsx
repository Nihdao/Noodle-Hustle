import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import "../../styles/intro.css";
import { useSound } from "../../hooks/useSound";

function HoldToSkipButton({ onSkip, visible = false }) {
    const [progress, setProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const requestRef = useRef(null);
    const startTimeRef = useRef(null);
    const { playBackSound } = useSound();

    // Settings
    const holdDuration = 2000; // Time in ms needed to hold to skip

    // Start the progress animation
    const startHolding = () => {
        setIsHolding(true);
        startTimeRef.current = Date.now();

        // Start animation frame loop
        cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(updateProgress);
    };

    // Update progress based on how long button has been held
    const updateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
        setProgress(newProgress);

        // If we've reached 100%, trigger the skip
        if (newProgress >= 100) {
            // Play the back/skip sound
            playBackSound();

            stopHolding();
            if (onSkip) onSkip();
            return;
        }

        // Continue the animation loop
        requestRef.current = requestAnimationFrame(updateProgress);
    };

    // Stop the progress animation
    const stopHolding = () => {
        setIsHolding(false);
        cancelAnimationFrame(requestRef.current);
        setProgress(0);
    };

    // Clean up animation frame on unmount
    useEffect(() => {
        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            className="hold-to-skip-container"
            onMouseDown={startHolding}
            onMouseUp={stopHolding}
            onMouseLeave={stopHolding}
            onTouchStart={startHolding}
            onTouchEnd={stopHolding}
        >
            <div className="hold-to-skip-button">
                <span className="hold-text">
                    {isHolding ? "Skipping..." : "Hold to Skip"}
                </span>
                <div className="progress-container">
                    <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}

HoldToSkipButton.propTypes = {
    onSkip: PropTypes.func.isRequired,
    visible: PropTypes.bool,
};

export default HoldToSkipButton;

