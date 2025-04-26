import PropTypes from "prop-types";
import { useState } from "react";
import PlayerNameInput from "./GameIntroComponents/PlayerNameInput";
import IntroDialogBox from "./GameIntroComponents/IntroDialogBox";
import HoldToSkipButton from "./GameIntroComponents/HoldToSkipButton";
import "../styles/intro.css";
import { EventBus } from "../game/EventBus";
import gameState from "../game/GameState";

// Intro slide data from the 3-GameIntro.mdc specification
const introSlides = [
    {
        image: "intro1.png",
        lines: [
            "Every day was the same. Emails. Meetings. Deadlines.",
            "Friends stopped calling. Family dinners became unread emails.",
            "I even missed my cat's birthday. Again.",
        ],
    },
    {
        image: "intro2.png",
        lines: [
            "One morning, I just couldn't get up. Nothing made sense anymore.",
            "What is goal in life? Do I really need 17 productivity apps to feel alive?",
            "I resigned.",
        ],
    },
    {
        image: "intro3.png",
        lines: [
            "Then... this note. A dream I had buried long ago.",
            "A ramen shop? Seriously? I used to sketch noodle bowls during accounting class...",
        ],
    },
    {
        image: "intro4.png",
        lines: [
            "No money. No skills. Just a stubborn dream… and a strange man with a little ramen shop.",
            "He said I looked like someone who needed a fresh start and a new goal.",
        ],
    },
    {
        image: "intro5.png",
        lines: [
            "Okay… why did I even take that ramen shop by the way?",
            "Maybe this time, I'll find balance… That is the jam's theme, right?",
        ],
    },
];

function GameIntroComponent({ onCompleteIntro }) {
    const [currentStage, setCurrentStage] = useState("name"); // name, intro, completed
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Function to initialize save data
    const initializeSaveData = () => {
        // Initialize a new game state with the player's name
        // The playerName is retrieved from localStorage in the gameState.initialize method
        gameState.initialize(true); // Force new game creation

        // Save the initialized state
        gameState.saveGameState();

        console.log("Game state initialized:", gameState.getGameState());
    };

    // Handle player name confirmation
    const handleNameConfirmed = () => {
        setTimeout(() => {
            setCurrentStage("intro");
        }, 500);
    };

    // Handle dialog completion for current slide
    const handleDialogComplete = () => {
        const nextSlide = currentSlide + 1;

        if (nextSlide < introSlides.length) {
            // Start transition animation
            setIsTransitioning(true);

            // Wait for the transition animation to complete before changing slide
            setTimeout(() => {
                setCurrentSlide(nextSlide);
                setIsTransitioning(false);
            }, 500);
        } else {
            // Intro completed - don't show dialog again, just start transition
            setCurrentStage("completed");

            // Initialize save data before transitioning
            initializeSaveData();

            setTimeout(() => {
                // Use the EventBus to call scene methods
                EventBus.callSceneMethod("goToHubScreen");
                if (onCompleteIntro) onCompleteIntro();
            }, 1000);
        }
    };

    // Handle skip request
    const handleSkip = () => {
        setCurrentStage("completed");

        // Initialize save data before transitioning
        initializeSaveData();

        setTimeout(() => {
            // Use the EventBus to call scene methods
            EventBus.callSceneMethod("goToHubScreen");
            if (onCompleteIntro) onCompleteIntro();
        }, 300);
    };

    return (
        <div className="game-intro-overlay">
            {/* Player name input screen */}
            <PlayerNameInput
                onNameConfirmed={handleNameConfirmed}
                visible={currentStage === "name"}
            />

            {/* Intro image display (only visible during intro) */}
            {currentStage === "intro" && (
                <div
                    className={`intro-image-container ${
                        isTransitioning ? "fade-out" : "fade-in"
                    }`}
                >
                    <div className="intro-image-box">
                        <img
                            src={`assets/intro/${introSlides[currentSlide].image}`}
                            alt={`Intro slide ${currentSlide + 1}`}
                            className="intro-image"
                        />
                    </div>
                </div>
            )}

            {/* Hold to Skip button (only visible during intro) */}
            <HoldToSkipButton
                onSkip={handleSkip}
                visible={currentStage === "intro"}
            />

            {/* Dialog boxes for current slide */}
            {currentStage === "intro" &&
                currentSlide < introSlides.length &&
                !isTransitioning && (
                    <IntroDialogBox
                        lines={introSlides[currentSlide].lines}
                        onComplete={handleDialogComplete}
                        visible={true}
                    />
                )}
        </div>
    );
}

GameIntroComponent.propTypes = {
    onCompleteIntro: PropTypes.func,
};

export default GameIntroComponent;

