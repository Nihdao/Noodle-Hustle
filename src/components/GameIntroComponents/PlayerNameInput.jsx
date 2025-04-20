import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import "../../styles/intro.css";
import { useSound } from "../../hooks/useSound";

function PlayerNameInput({ onNameConfirmed, visible }) {
    const [playerName, setPlayerName] = useState(
        localStorage.getItem("playerName") || ""
    );
    const [animationState, setAnimationState] = useState("hidden");
    const inputRef = useRef(null);
    const { playClickSound } = useSound();

    // Trigger entrance animation when visible
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setAnimationState("visible");
                // Focus input after animation
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setAnimationState("hidden");
        }
    }, [visible]);

    const handleNameChange = (e) => {
        setPlayerName(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Play click sound
        playClickSound();

        // Save name to localStorage
        if (playerName.trim()) {
            localStorage.setItem("playerName", playerName.trim());
            // Call the callback
            if (onNameConfirmed) {
                onNameConfirmed(playerName.trim());
            }
        }
    };

    return (
        <div
            className={`name-input-container ${
                visible ? "" : "hidden-name-input"
            } ${animationState === "visible" ? "fade-in" : "fade-out"}`}
        >
            <div className="name-input-box">
                <h2 className="name-input-title">Welcome to Tokyo</h2>
                <p className="name-input-subtitle">What is your name?</p>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="name-input-field"
                        value={playerName}
                        onChange={handleNameChange}
                        placeholder="Enter your name"
                        maxLength={15}
                    />
                    <button
                        type="submit"
                        className="name-input-button"
                        disabled={!playerName.trim()}
                    >
                        Let&apos;s Begin
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

