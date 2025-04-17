import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import "../../styles/intro.css";

function HoldToSkipButton({ onSkip, visible }) {
    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isSkipTriggered, setIsSkipTriggered] = useState(false);
    const holdTimeoutRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const holdDuration = 1500; // ms to hold to skip
    const progressIncrement = 10; // update progress every X ms

    // Reset when visibility changes
    useEffect(() => {
        if (!visible) {
            resetState();
        }
    }, [visible]);

    // Handle progress updates when holding
    useEffect(() => {
        if (isHolding) {
            // Define triggerSkip inside useEffect to avoid dependency issues
            const triggerSkip = () => {
                if (!isSkipTriggered) {
                    setIsSkipTriggered(true);
                    setIsHolding(false);
                    setProgress(100);
                    console.log("Skip triggered!");
                    // Add a small delay to ensure visual feedback before skipping
                    setTimeout(() => {
                        onSkip();
                    }, 50);
                }
            };

            // Set up progress interval
            progressIntervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    const newProgress =
                        prev + (progressIncrement / holdDuration) * 100;

                    // If progress reaches or exceeds 100%, trigger skip
                    if (newProgress >= 100 && !isSkipTriggered) {
                        triggerSkip();
                    }

                    return Math.min(newProgress, 100); // Cap at 100%
                });
            }, progressIncrement);

            // Set up completion timeout
            holdTimeoutRef.current = setTimeout(() => {
                triggerSkip();
            }, holdDuration);

            return () => {
                clearInterval(progressIntervalRef.current);
                clearTimeout(holdTimeoutRef.current);
            };
        } else {
            // Reset progress when not holding
            if (progress !== 0 && progress !== 100) {
                const fadeTimeout = setTimeout(() => {
                    setProgress(0);
                }, 300);

                return () => clearTimeout(fadeTimeout);
            }
        }
    }, [isHolding, onSkip, progress, isSkipTriggered, holdDuration]);

    const handleMouseDown = () => {
        setIsHolding(true);
        setIsSkipTriggered(false);
    };

    const handleMouseUp = () => {
        resetState();
    };

    const handleTouchStart = (e) => {
        e.preventDefault(); // Prevent default touch behavior
        setIsHolding(true);
        setIsSkipTriggered(false);
    };

    const handleTouchEnd = () => {
        resetState();
    };

    const resetState = () => {
        setIsHolding(false);
        setIsSkipTriggered(false);
        clearInterval(progressIntervalRef.current);
        clearTimeout(holdTimeoutRef.current);
        setProgress(0); // Ensure progress is reset to zero
    };

    if (!visible) return null;

    return (
        <div
            className={`hold-to-skip-button ${isHolding ? "active" : ""}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="skip-button-text">Hold to Skip</div>
            <div className="skip-progress-container">
                <div
                    className="skip-progress-bar"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}

HoldToSkipButton.propTypes = {
    onSkip: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
};

export default HoldToSkipButton;

