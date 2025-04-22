import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSound } from "../../hooks/useSound";

/**
 * Modal component that displays personal time results and confidant dialogues
 */
const PersonalTimeModal = ({ isOpen, onClose, personalTimeResult }) => {
    const { playClickSound } = useSound();

    // Dialog state
    const [dialogPhase, setDialogPhase] = useState("location"); // 'location', 'intro', 'response', 'followUp', 'conclusion', 'buff'
    const [selectedResponse, setSelectedResponse] = useState(null);

    // Reset dialog phase when modal opens
    useEffect(() => {
        if (isOpen) {
            setDialogPhase("location");
            setSelectedResponse(null);
        }
    }, [isOpen]);

    // Early return if modal is not open or no result
    if (!isOpen || !personalTimeResult) return null;

    const { location, encounter } = personalTimeResult;
    const isHome = location === "Home";
    const hasEncounter = encounter !== null;

    // Get the appropriate dialogue based on the encounter
    const getDialogue = () => {
        if (!hasEncounter) return null;

        const { confidant, newLevel } = encounter;
        // Find dialogue for this level
        return confidant.dialogues.find((d) => d.level === newLevel) || null;
    };

    const dialogue = getDialogue();

    // Handle advancing the dialogue
    const advanceDialog = () => {
        playClickSound();

        switch (dialogPhase) {
            case "location":
                // If at home or no encounter, close modal
                if (isHome || !hasEncounter) {
                    onClose();
                } else {
                    setDialogPhase("intro");
                }
                break;

            case "intro":
                setDialogPhase("response");
                break;

            case "response":
                setDialogPhase("followUp");
                break;

            case "followUp":
                setDialogPhase("conclusion");
                break;

            case "conclusion":
                setDialogPhase("buff");
                break;

            case "buff":
            default:
                onClose();
                break;
        }
    };

    // Handle selecting a response
    const handleResponseSelect = (response) => {
        playClickSound();
        setSelectedResponse(response);
        setDialogPhase("followUp");
    };

    // Home location view
    const renderHomeLocation = () => (
        <div className="text-center p-4">
            <h3 className="text-xl text-principalBrown font-bold mb-6">
                Rest at Home
            </h3>
            <p className="text-principalBrown mb-8">
                You spent time resting at home. Taking time for yourself has
                reduced your burnout by 10%.
            </p>
            <div className="flex justify-center">
                <div className="relative w-24 h-24 mb-8">
                    <img
                        src="/assets/social/home_rest.png"
                        alt="Resting at home"
                        className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-md">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
            </div>
            <button
                onClick={advanceDialog}
                className="px-6 py-3 bg-principalRed text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
                Return to Business
            </button>
        </div>
    );

    // No encounter view (when visiting a location but no one appears)
    const renderNoEncounter = () => (
        <div className="text-center p-4">
            <h3 className="text-xl text-principalBrown font-bold mb-6">
                Visit to {location}
            </h3>
            <p className="text-principalBrown mb-8">
                You spent some time at {location}, but didn&apos;t meet anyone
                of note today.
                <br />
                <br />
                The change of scenery was refreshing nonetheless.
            </p>
            <div className="flex justify-center">
                <div className="w-24 h-24 mb-8 bg-gray-200 rounded-full flex items-center justify-center shadow-inner">
                    <img
                        src={`/assets/social/${location.toLowerCase()}.png`}
                        alt={location}
                        className="w-16 h-16 object-contain opacity-50"
                    />
                </div>
            </div>
            <button
                onClick={advanceDialog}
                className="px-6 py-3 bg-principalRed text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
                Return to Business
            </button>
        </div>
    );

    // Confidant encounter views based on dialogue phase
    const renderEncounterIntro = () => {
        if (!dialogue) return null;

        const { confidant } = encounter;

        return (
            <div className="text-center p-4">
                <h3 className="text-xl text-principalBrown font-bold mb-6">
                    Encounter at {location}
                </h3>
                <div className="flex justify-center mb-6">
                    <div className="relative w-24 h-24">
                        <img
                            src={confidant.portrait}
                            alt={confidant.name}
                            className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                        />
                        {encounter.isNew && (
                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1 shadow-md">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-principalBrown">
                        {confidant.name}
                    </h2>
                    <p className="text-sm text-gray-600 italic">
                        {confidant.role}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-inner mb-6">
                    <p className="text-principalBrown">
                        &ldquo;{dialogue.intro}&rdquo;
                    </p>
                </div>
                <button
                    onClick={advanceDialog}
                    className="px-6 py-3 bg-principalRed text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                    Continue
                </button>
            </div>
        );
    };

    const renderResponseOptions = () => {
        if (!dialogue) return null;

        return (
            <div className="text-center p-4">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16">
                        <img
                            src={encounter.confidant.portrait}
                            alt={encounter.confidant.name}
                            className="w-full h-full object-cover rounded-full border-2 border-white shadow-md"
                        />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-inner mb-8">
                    <p className="text-principalBrown">
                        &ldquo;{dialogue.intro}&rdquo;
                    </p>
                </div>
                <h3 className="text-lg font-semibold text-principalBrown mb-4">
                    How will you respond?
                </h3>
                <div className="space-y-4">
                    {dialogue.responses.map((response, index) => (
                        <button
                            key={index}
                            onClick={() => handleResponseSelect(response)}
                            className="w-full px-6 py-3 bg-principalBrown/10 hover:bg-principalBrown/20 text-principalBrown rounded-lg shadow transition-all duration-300 text-left"
                        >
                            &ldquo;{response.text}&rdquo;
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderResponse = () => {
        if (!dialogue || !selectedResponse) return null;

        return (
            <div className="text-center p-4">
                <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 invisible">{/* Spacer */}</div>
                    <div className="bg-principalBrown/10 p-3 rounded-lg shadow max-w-xs">
                        <p className="text-principalBrown text-sm">
                            &ldquo;{selectedResponse.text}&rdquo;
                        </p>
                    </div>
                    <div className="w-12 h-12">
                        <img
                            src="/assets/social/player_avatar.png"
                            alt="You"
                            className="w-full h-full object-cover rounded-full border-2 border-white shadow-md"
                        />
                    </div>
                </div>
                <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12">
                        <img
                            src={encounter.confidant.portrait}
                            alt={encounter.confidant.name}
                            className="w-full h-full object-cover rounded-full border-2 border-white shadow-md"
                        />
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow max-w-xs">
                        <p className="text-principalBrown text-sm">
                            &ldquo;{selectedResponse.response}&rdquo;
                        </p>
                    </div>
                    <div className="w-12 h-12 invisible">{/* Spacer */}</div>
                </div>
                <button
                    onClick={advanceDialog}
                    className="px-6 py-3 bg-principalRed text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                    Continue
                </button>
            </div>
        );
    };

    const renderFollowUp = () => {
        if (!dialogue) return null;

        return (
            <div className="text-center p-4">
                <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 invisible">{/* Spacer */}</div>
                    <div className="bg-principalBrown/10 p-3 rounded-lg shadow max-w-xs">
                        <p className="text-principalBrown text-sm">
                            &ldquo;{dialogue.followUp}&rdquo;
                        </p>
                    </div>
                    <div className="w-12 h-12">
                        <img
                            src="/assets/social/player_avatar.png"
                            alt="You"
                            className="w-full h-full object-cover rounded-full border-2 border-white shadow-md"
                        />
                    </div>
                </div>
                <button
                    onClick={advanceDialog}
                    className="px-6 py-3 bg-principalRed text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                    Continue
                </button>
            </div>
        );
    };

    const renderConclusion = () => {
        if (!dialogue) return null;

        return (
            <div className="text-center p-4">
                <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12">
                        <img
                            src={encounter.confidant.portrait}
                            alt={encounter.confidant.name}
                            className="w-full h-full object-cover rounded-full border-2 border-white shadow-md"
                        />
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow max-w-xs">
                        <p className="text-principalBrown text-sm">
                            &ldquo;{dialogue.conclusion}&rdquo;
                        </p>
                    </div>
                    <div className="w-12 h-12 invisible">{/* Spacer */}</div>
                </div>
                <button
                    onClick={advanceDialog}
                    className="px-6 py-3 bg-principalRed text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                    Continue
                </button>
            </div>
        );
    };

    // Show buff gained notification
    const renderBuffNotification = () => {
        if (!encounter || encounter.isMaxed) return null;

        // Import buffs data
        const buffsData = encounter.confidant.buff;
        const isNewRelationship = encounter.isNew;
        const newLevel = encounter.newLevel;

        return (
            <div className="text-center p-4">
                <h3 className="text-xl text-principalBrown font-bold mb-4">
                    {isNewRelationship
                        ? "New Relationship Established!"
                        : "Relationship Level Up!"}
                </h3>
                <div className="flex justify-center items-center mb-6 space-x-4">
                    <div className="relative">
                        <img
                            src={encounter.confidant.portrait}
                            alt={encounter.confidant.name}
                            className="w-16 h-16 object-cover rounded-full border-2 border-white shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white rounded-full p-1 shadow-md text-xs font-bold">
                            Lv.{newLevel}
                        </div>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-lg font-bold text-principalBrown">
                            {encounter.confidant.name}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="inline-block w-16">Rank:</span>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-4 w-4 ${
                                            i < newLevel
                                                ? "text-yellow-500"
                                                : "text-gray-300"
                                        }`}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 mb-6 text-white shadow-lg">
                    <div className="flex items-center mb-4">
                        <div className="bg-white rounded-full p-2 mr-3">
                            <img
                                src={`/assets/buffs/${buffsData}.png`}
                                alt="Buff"
                                className="w-8 h-8"
                            />
                        </div>
                        <h4 className="text-lg font-bold">
                            {encounter.confidant.buffName}
                        </h4>
                    </div>
                    <p className="mb-2">
                        Your relationship with {encounter.confidant.name} has
                        improved!
                    </p>
                    <p className="font-semibold bg-white/20 p-2 rounded">
                        {encounter.confidant.buffName} Level {newLevel} Unlocked
                    </p>
                </div>
                <button
                    onClick={advanceDialog}
                    className="px-6 py-3 bg-principalRed text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                    Return to Business
                </button>
            </div>
        );
    };

    // Render appropriate content based on state
    const renderContent = () => {
        // Show home location view
        if (isHome && dialogPhase === "location") {
            return renderHomeLocation();
        }

        // Show no encounter view
        if (!hasEncounter && dialogPhase === "location") {
            return renderNoEncounter();
        }

        // Show encounter dialogue flow
        switch (dialogPhase) {
            case "intro":
                return renderEncounterIntro();
            case "response":
                return renderResponseOptions();
            case "followUp":
                if (selectedResponse) {
                    return renderResponse();
                }
                return renderFollowUp();
            case "conclusion":
                return renderConclusion();
            case "buff":
                return renderBuffNotification();
            default:
                return renderEncounterIntro();
        }
    };

    // Modal backdrop with content
    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            <div
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
            ></div>
            <div className="bg-[color:var(--color-yellowWhite)] rounded-xl shadow-2xl p-6 max-w-md w-full z-10 relative">
                <div className="absolute top-3 right-3">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
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
                    </button>
                </div>
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-center text-principalRed">
                        Your Personal Time
                    </h2>
                </div>
                <div className="mt-4">{renderContent()}</div>
            </div>
        </div>
    );
};

PersonalTimeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    personalTimeResult: PropTypes.shape({
        location: PropTypes.string.isRequired,
        encounter: PropTypes.object,
    }),
};

export default PersonalTimeModal;

