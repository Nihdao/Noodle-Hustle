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
    const startHolding = (e) => {
        // Prevent default behavior for touch events to avoid scrolling
        if (e.type === "touchstart") {
            e.preventDefault();
        }
        setIsHolding(true);
        startTimeRef.current = Date.now();

        // Start animation frame loop
        cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(updateProgress);
    };

    // Update progress based on how long button has been held
    const updateProgress = () => {
        if (!isHolding) return;

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

    // Effect to handle updating progress when isHolding changes
    useEffect(() => {
        if (isHolding) {
            requestRef.current = requestAnimationFrame(updateProgress);
        } else {
            cancelAnimationFrame(requestRef.current);
            setProgress(0);
        }

        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, [isHolding]);

    // Clean up animation frame on unmount
    useEffect(() => {
        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="hold-to-skip-container">
            <div
                className={`hold-to-skip-button ${isHolding ? "active" : ""}`}
                onMouseDown={startHolding}
                onMouseUp={stopHolding}
                onMouseLeave={stopHolding}
                onTouchStart={startHolding}
                onTouchEnd={stopHolding}
                onTouchCancel={stopHolding}
            >
                <div className="skip-button-text">
                    {isHolding ? "Skipping..." : "Hold to Skip"}
                </div>
                <div className="skip-progress-container">
                    <div
                        className="skip-progress-bar"
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

