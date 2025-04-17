import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import "../../styles/intro.css";

function IntroDialogBox({ lines, onComplete, visible }) {
    const [currentLine, setCurrentLine] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const timeoutRef = useRef(null);
    const typingSpeed = 30; // milliseconds per character

    // Reset when new lines are provided
    useEffect(() => {
        setCurrentLine(0);
        setCurrentText("");
        setIsCompleted(false);
    }, [lines]);

    // Handle typing animation for current line
    useEffect(() => {
        if (!visible || currentLine >= lines.length) return;

        const targetText = lines[currentLine];

        if (currentText.length < targetText.length) {
            setIsTyping(true);
            timeoutRef.current = setTimeout(() => {
                setCurrentText(targetText.substring(0, currentText.length + 1));
            }, typingSpeed);

            return () => clearTimeout(timeoutRef.current);
        } else {
            setIsTyping(false);
        }
    }, [currentText, currentLine, lines, visible]);

    // Handle click to advance to next line
    const handleAdvance = () => {
        // If dialog is already completed, don't do anything
        if (isCompleted) {
            return;
        }

        if (isTyping) {
            // If still typing, complete the current line immediately
            clearTimeout(timeoutRef.current);
            setCurrentText(lines[currentLine]);
            setIsTyping(false);
            return;
        }

        // Move to next line
        const nextLine = currentLine + 1;

        if (nextLine < lines.length) {
            setCurrentLine(nextLine);
            setCurrentText("");
        } else {
            // All lines have been displayed
            setIsCompleted(true);
            setTimeout(() => {
                onComplete();
            }, 500);
        }
    };

    if (!visible) return null;

    return (
        <div className="intro-dialog-container">
            <div className="intro-dialog-box" onClick={handleAdvance}>
                <div className="dialog-text">
                    {!isCompleted && (
                        <p className="dialog-line current">
                            {currentText}
                            <span
                                className={
                                    isTyping ? "cursor" : "cursor hidden"
                                }
                            >
                                |
                            </span>
                        </p>
                    )}
                </div>

                {!isTyping && !isCompleted && (
                    <div className="dialog-continue-indicator">
                        <span className="continue-arrow">→</span>
                        <span className="continue-text">Click to continue</span>
                    </div>
                )}

                {isCompleted && (
                    <div className="dialog-continue-indicator">
                        <span className="continue-arrow">→</span>
                        <span className="continue-text">Continuing...</span>
                    </div>
                )}
            </div>
        </div>
    );
}

IntroDialogBox.propTypes = {
    lines: PropTypes.arrayOf(PropTypes.string).isRequired,
    onComplete: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
};

export default IntroDialogBox;

