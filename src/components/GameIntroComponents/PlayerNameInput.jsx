import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "../../styles/intro.css";

function PlayerNameInput({ onNameConfirmed, visible }) {
    const [playerName, setPlayerName] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);
    const [error, setError] = useState("");

    // Reset animation state when visibility changes
    useEffect(() => {
        if (visible) {
            setIsAnimating(false);
        }
    }, [visible]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate input
        if (!playerName || playerName.trim() === "") {
            setError("Please enter your name");
            return;
        }

        // Clear any errors
        setError("");

        // Start exit animation
        setIsAnimating(true);

        // Store player name in localStorage
        localStorage.setItem("playerName", playerName.trim());

        // Wait for animation to complete before proceeding
        setTimeout(() => {
            onNameConfirmed(playerName.trim());
        }, 500);
    };

    // If not visible, don't render
    if (!visible) return null;

    return (
        <div
            className={`name-input-container ${
                isAnimating ? "fade-out" : "fade-in"
            }`}
        >
            <div className="name-input-box">
                <h2 className="input-title">What&apos;s your name?</h2>
                <p className="input-subtitle">
                    Your name will be saved locally
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="name-input"
                        placeholder="Enter your name"
                        maxLength={25}
                        autoFocus
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="name-submit-button">
                        Confirm
                    </button>
                </form>
            </div>
        </div>
    );
}

PlayerNameInput.propTypes = {
    onNameConfirmed: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
};

export default PlayerNameInput;

