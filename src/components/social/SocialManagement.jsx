import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MenuContainer from "../common/MenuContainer";
import locationsData from "../../data/locations.json";
import confidantsData from "../../data/confidants.json";
import buffsData from "../../data/buffs.json";
import { useSocial } from "../../store/gameStateHooks";
import gameState from "../../game/GameState";

const SocialManagement = ({
    onBack,
    onLocationSelect,
    currentPlanned = "Home",
}) => {
    const { personalTime, schedulePesonalTime } = useSocial();
    const [locations] = useState(locationsData.locations);
    const [confidants] = useState(confidantsData.confidants);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
    const [actionPerformed, setActionPerformed] = useState(false);
    const [currentPeriod, setCurrentPeriod] = useState(1);

    // États pour la conversation avec un confident
    const [showConversation, setShowConversation] = useState(false);
    const [currentConfidant, setCurrentConfidant] = useState(null);
    const [conversationStage, setConversationStage] = useState("dialogue"); // Simplifié à "dialogue" et "conclusion"
    const [visibleLines, setVisibleLines] = useState(0);
    const [isTyping, setIsTyping] = useState(false);

    // États pour afficher le buff obtenu
    const [showBuff, setShowBuff] = useState(false);
    const [obtainedBuff, setObtainedBuff] = useState(null);

    // État pour message générique si pas de rencontre
    const [genericMessage, setGenericMessage] = useState("");
    const [showGenericMessage, setShowGenericMessage] = useState(false);

    // Burnout state - will be implemented in future iterations
    // const burnout = 33; // Using a constant instead of state until implementation

    const [plannedLocation, setPlannedLocation] = useState(
        personalTime?.planned || currentPlanned
    );

    // Vérifier si une action a déjà été effectuée cette période
    useEffect(() => {
        // Récupérer la période actuelle du gameState
        if (gameState && gameState.getGameState) {
            const state = gameState.getGameState();
            setCurrentPeriod(state.gameProgress?.currentPeriod || 1);

            // Vérifier si une action a déjà été effectuée cette période en utilisant gameState
            if (state.social?.socialActionDoneInPeriod) {
                setActionPerformed(true);
            } else {
                setActionPerformed(false);
            }
        }

        // Écouter les changements de période
        const handleGameStateUpdate = (updatedState) => {
            if (
                updatedState &&
                updatedState.gameProgress?.currentPeriod !== currentPeriod
            ) {
                setCurrentPeriod(updatedState.gameProgress.currentPeriod);
                // Réinitialiser l'état d'action pour la nouvelle période
                setActionPerformed(
                    updatedState.social?.socialActionDoneInPeriod || false
                );
            }
        };

        if (gameState && gameState.events) {
            gameState.events.on("gameStateUpdated", handleGameStateUpdate);
            return () => {
                gameState.events.off("gameStateUpdated", handleGameStateUpdate);
            };
        }
    }, [currentPeriod]);

    // Set initial selected location based on currentPlanned
    useEffect(() => {
        const initialPlanned = personalTime?.planned || currentPlanned;
        const currentLocation = locations.find(
            (loc) => loc.name === initialPlanned
        );
        if (currentLocation) {
            setSelectedLocation(currentLocation);
            setPlannedLocation(initialPlanned);
        }
    }, [currentPlanned, locations, personalTime]);

    // Handle window resize for the menu container position
    useEffect(() => {
        const handleResize = () => {
            if (showDetails) {
                const sidebarWidth = window.innerWidth * 0.333;
                const mainAreaWidth = window.innerWidth * 0.667;

                setDetailsPosition({
                    x: sidebarWidth + mainAreaWidth / 2,
                    y: window.innerHeight / 2,
                });
            }
        };

        // Initial position calculation
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [showDetails]);

    // Display a section for confidants in the location details
    const getLocationConfidants = (locationName) => {
        return confidants.filter(
            (confidant) => confidant.location === locationName
        );
    };

    // Handler to select a location
    const handleSelectLocation = (location) => {
        setSelectedLocation(location);
        setPlannedLocation(location.name);

        // Update the game state via hook
        schedulePesonalTime(location.name);

        // Show details when a location is selected
        setShowDetails(true);

        // Notify parent component about the location change
        if (onLocationSelect) {
            onLocationSelect(location.name);
        }
    };

    // Handle spending time at location
    const handleSpendTimeAtLocation = () => {
        if (!selectedLocation || actionPerformed) return;

        // Close the details panel
        setShowDetails(false);

        // Apply burnout reduction based on location
        const currentState = gameState.getGameState();
        const currentBurnout = currentState.playerStats?.burnout || 0;
        let newBurnout;

        if (selectedLocation.name === "Home") {
            // 25% reduction for Home
            newBurnout = Math.max(0, Math.floor(currentBurnout * 0.75));
        } else {
            // 10% reduction for other locations
            newBurnout = Math.max(0, Math.floor(currentBurnout * 0.9));
        }

        // Update burnout in game state
        if (currentBurnout !== newBurnout) {
            gameState.updateGameState((state) => ({
                ...state,
                playerStats: {
                    ...state.playerStats,
                    burnout: newBurnout,
                },
            }));
        }

        // Vérifier s'il peut y avoir une rencontre avec un confident
        const possibleConfidants = checkPossibleConfidantEncounters(
            selectedLocation.name
        );

        // Marquer l'action comme effectuée pour cette période dans le gameState
        gameState.updateGameState((state) => ({
            ...state,
            social: {
                ...state.social,
                socialActionDoneInPeriod: true,
            },
        }));

        // Update local state
        setActionPerformed(true);

        // Si des confidants peuvent être rencontrés, 50% de chance d'en rencontrer un
        if (possibleConfidants.length > 0 && Math.random() > 0.5) {
            // Sélectionner un confident aléatoire parmi les possibles
            const randomIndex = Math.floor(
                Math.random() * possibleConfidants.length
            );
            const selectedConfidant = possibleConfidants[randomIndex];

            // Déterminer le niveau de relation actuel
            const relationshipLevel = getCurrentRelationshipLevel(
                selectedConfidant.id
            );

            // Si déjà au niveau max, afficher un message générique
            if (relationshipLevel >= selectedConfidant.maxLevel) {
                showGenericLocationMessage(selectedLocation.name, newBurnout);
                return;
            }

            // Démarrer la conversation
            startConfidantConversation(selectedConfidant, relationshipLevel);
        } else {
            // Pas de rencontre, afficher un message générique
            showGenericLocationMessage(selectedLocation.name, newBurnout);
        }
    };

    // Vérifier quels confidants peuvent apparaître à cet endroit
    const checkPossibleConfidantEncounters = (locationName) => {
        // Trouver les confidants associés à ce lieu qui peuvent apparaître en fonction de la période
        console.log(locationName);
        console.log(currentPeriod);
        return confidants.filter(
            (confidant) =>
                confidant.location === locationName &&
                currentPeriod >= confidant.firstAppearance &&
                (currentPeriod - confidant.firstAppearance) %
                    confidant.frequency ===
                    0
        );
    };

    // Obtenir le niveau de relation actuel avec un confident
    const getCurrentRelationshipLevel = (confidantId) => {
        // Obtenir les relations du gameState
        const state = gameState.getGameState();
        const relationship = state.social?.relationships?.find(
            (rel) => rel.id === confidantId
        );

        // Si la relation existe, retourner le niveau, sinon 0
        return relationship ? relationship.level : 0;
    };

    // Démarrer une conversation avec un confident
    const startConfidantConversation = (confidant, currentLevel) => {
        // Le niveau à utiliser est soit le niveau actuel + 1 pour une nouvelle discussion,
        // soit le niveau 1 pour un nouveau confident
        const targetLevel = currentLevel === 0 ? 1 : currentLevel + 1;

        // Trouver le dialogue correspondant au niveau
        const dialogue = confidant.dialogues.find(
            (d) => d.level === targetLevel
        );

        if (dialogue) {
            setCurrentConfidant({
                ...confidant,
                currentLevel,
                targetLevel,
                dialogue,
            });
            setConversationStage("dialogue");
            setVisibleLines(0);
            setIsTyping(true);
            setShowConversation(true);

            // Démarrer l'animation progressive des dialogues
            startProgressiveDialogue(dialogue.responses.length);
        }
    };

    // Fonction pour animer progressivement les dialogues
    const startProgressiveDialogue = (totalLines) => {
        let currentLine = 0;

        const showNextLine = () => {
            if (currentLine < totalLines) {
                currentLine++;
                setVisibleLines(currentLine);

                // Calculer le délai en fonction de la longueur du texte
                // Plus le texte est court, plus le délai est court (min 300ms, max 700ms)
                const baseDelay = 300; // ms
                const delay =
                    currentLine % 2 === 0 ? baseDelay : baseDelay + 100;

                setTimeout(showNextLine, delay);
            } else {
                setIsTyping(false);
            }
        };

        // Démarrer l'animation avec un petit délai initial
        setTimeout(showNextLine, 100);
    };

    // Afficher un message générique pour le lieu
    const showGenericLocationMessage = (locationName, newBurnout) => {
        // Messages génériques par lieu
        const messages = {
            Home: [
                "You relax at home, away from the hustle and bustle of work.",
                "A moment of calm at home helps you recharge your batteries.",
                "You spend time reflecting on your future projects in the comfort of your house.",
            ],
            Park: [
                "The gentle breeze and peaceful atmosphere of the park soothe you.",
                "You watch people enjoying nature at the park.",
                "A walk in the park helps you clear your mind.",
            ],
            Lake: [
                "The calm surface of the lake reflects your thoughts and eases your stress.",
                "You meditate by the lake, listening to the gentle lapping of the water.",
                "The serenity of the lake reminds you of the importance of taking time for yourself.",
            ],
            Downtown: [
                "The energy of downtown stimulates and inspires you.",
                "You watch urban life while sipping coffee at a small bistro.",
                "The shop windows downtown give you new ideas.",
            ],
            Hypermarket: [
                "You stroll through the supermarket aisles, noting new ingredient ideas.",
                "The variety of products inspires you for new dishes.",
                "You buy some essentials while observing current trends.",
            ],
        };

        // Get current and previous burnout
        const currentState = gameState.getGameState();
        const currentBurnout = currentState.playerStats?.burnout || 0;
        const burnoutReduction = locationName === "Home" ? "25%" : "10%";

        // Sélectionner un message aléatoire pour ce lieu
        const locationMessages = messages[locationName] || [
            "You spend a pleasant moment.",
        ];
        const randomIndex = Math.floor(Math.random() * locationMessages.length);

        setGenericMessage(locationMessages[randomIndex]);
        setShowGenericMessage(true);
    };

    // Gérer les étapes de la conversation
    const handleConversationProgress = () => {
        if (!currentConfidant) return;

        // Terminer directement la conversation
        completeConversation();
    };

    // Terminer la conversation et accorder le buff
    const completeConversation = () => {
        if (!currentConfidant) return;

        // Fermer la conversation
        setShowConversation(false);

        // Mettre à jour la relation dans le gameState
        if (currentConfidant.currentLevel === 0) {
            // Nouveau confident
            gameState.addNewConfidant(currentConfidant.id);
        } else {
            // Augmenter le niveau
            gameState.updateConfidantLevel(
                currentConfidant.id,
                currentConfidant.targetLevel
            );
        }

        // Trouver le buff correspondant
        const buff = buffsData.socialBuffs[currentConfidant.buff];
        if (buff) {
            const levelBuff = buff.levels.find(
                (b) => b.level === currentConfidant.targetLevel
            );
            if (levelBuff) {
                setObtainedBuff({
                    name: buff.name,
                    description: levelBuff.effect,
                    level: currentConfidant.targetLevel,
                    confidant: currentConfidant.name,
                });
                setShowBuff(true);
            }
        }
    };

    // Style for the component
    const styles = {
        container: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
        },
        header: {
            padding: "1rem",
            borderBottom: "1px solid rgba(49, 34, 24, 0.2)",
        },
        headerTitle: {
            fontSize: "2rem",
            fontWeight: "bold",
            color: "var(--color-principalBrown)",
        },
        headerSubtitle: {
            color: "var(--color-principalBrown)",
            opacity: 0.8,
        },
        backButton: (isHovered) => ({
            padding: "0.75rem 1.5rem",
            backgroundColor: isHovered
                ? "var(--color-principalBrown)"
                : "var(--color-yellowWhite)",
            color: isHovered
                ? "var(--color-whiteCream)"
                : "var(--color-principalBrown)",
            borderRadius: "0.375rem",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
        }),
        locationCard: (isSelected, isPlanned) => ({
            backgroundColor: isSelected
                ? "rgba(var(--color-principalRed-rgb), 0.1)"
                : isPlanned
                ? "rgba(59, 130, 246, 0.1)"
                : "var(--color-whiteCream)",
            borderRadius: "0.5rem",
            padding: "0.75rem",
            cursor: "pointer",
            border: isSelected
                ? "2px solid var(--color-principalRed)"
                : isPlanned
                ? "2px solid #3B82F6"
                : "1px solid rgba(49, 34, 24, 0.1)",
            transition: "all 0.2s ease",
            boxShadow:
                isSelected || isPlanned
                    ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                    : "0 2px 4px rgba(0, 0, 0, 0.05)",
        }),
        confidantCard: (level, maxLevel) => {
            // Create a gradient based on link level
            const getLevelColor = (level, maxLevel) => {
                const percentage = (level / maxLevel) * 100;
                if (percentage >= 80) return "#4ADE80"; // Green for high levels
                if (percentage >= 60) return "#FBBF24"; // Yellow for medium-high
                if (percentage >= 40) return "#FB923C"; // Orange for medium
                if (percentage >= 20) return "#F87171"; // Light red for medium-low
                return "#9CA3AF"; // Gray for low or no relationship
            };

            return {
                backgroundColor: "var(--color-whiteCream)",
                backgroundImage:
                    level > 0
                        ? `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${getLevelColor(
                              level,
                              maxLevel
                          )}22 100%)`
                        : "none",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                cursor: "pointer",
                border: "1px solid rgba(49, 34, 24, 0.1)",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            };
        },
        linkLevelBadge: (level, maxLevel) => {
            const getColor = (level, maxLevel) => {
                const percentage = (level / maxLevel) * 100;
                if (percentage >= 80) return { bg: "#4ADE80", text: "#FFFFFF" }; // Green
                if (percentage >= 60) return { bg: "#FBBF24", text: "#FFFFFF" }; // Yellow
                if (percentage >= 40) return { bg: "#FB923C", text: "#FFFFFF" }; // Orange
                if (percentage >= 20) return { bg: "#F87171", text: "#FFFFFF" }; // Light red
                return { bg: "#9CA3AF", text: "#FFFFFF" }; // Gray
            };

            const colors = getColor(level, maxLevel);

            return {
                backgroundColor: colors.bg,
                color: colors.text,
                borderRadius: "9999px",
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
            };
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>Social Activities</h2>
                <p style={styles.headerSubtitle}>
                    Plan personal activities and build relationships
                </p>
            </div>

            {/* Main content area */}
            <div className="h-full overflow-hidden">
                {/* Left sidebar - Locations list */}
                <div className="h-full overflow-y-auto border-r border-[color:var(--color-principalBrown)] border-opacity-20">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4 text-[color:var(--color-principalBrown)]">
                            Available Locations
                        </h3>

                        <div className="space-y-3">
                            {locations.map((location) => (
                                <div
                                    key={location.id}
                                    style={styles.locationCard(
                                        selectedLocation?.id === location.id,
                                        plannedLocation === location.name &&
                                            selectedLocation?.id !== location.id
                                    )}
                                    className="hover:shadow-md transition-all"
                                    onClick={() =>
                                        handleSelectLocation(location)
                                    }
                                >
                                    <div className="flex items-center">
                                        <div className="text-3xl mr-3">
                                            {location.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[color:var(--color-principalBrown)]">
                                                {location.name}
                                            </h4>
                                            {/* Show number of confidants at this location */}
                                            {getLocationConfidants(
                                                location.name
                                            ).length > 0 && (
                                                <p className="text-xs text-[color:var(--color-principalRed)]">
                                                    {
                                                        getLocationConfidants(
                                                            location.name
                                                        ).length
                                                    }{" "}
                                                    possible{" "}
                                                    {getLocationConfidants(
                                                        location.name
                                                    ).length === 1
                                                        ? "encounter"
                                                        : "encounters"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Location details menu - Now positioned absolutely */}
            {showDetails && selectedLocation && (
                <div
                    className="fixed z-50 transition-all duration-500"
                    style={{
                        left: `${detailsPosition.x}px`,
                        top: `${detailsPosition.y}px`,
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <MenuContainer
                        title={selectedLocation.name}
                        onClose={() => setShowDetails(false)}
                        className="w-[700px] max-h-[80vh]"
                        scrollable={true}
                        maxHeight="80vh"
                    >
                        <div className="p-4 flex flex-col items-center">
                            <img
                                src={`/assets/locations/${selectedLocation.name}.png`}
                                alt={selectedLocation.name}
                                className="w-full max-w-xs rounded-lg shadow-md mb-4"
                            />

                            <div className="mt-2 mb-4 text-[color:var(--color-principalBrown)]">
                                <p>{selectedLocation.description}</p>

                                {/* Display confidants that can be found here */}
                                {getLocationConfidants(selectedLocation.name)
                                    .length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2">
                                            Possible Encounters:
                                        </h4>
                                        <p className="text-xs text-gray-500 mb-2">
                                            50% chance to meet a confidant
                                        </p>
                                        <div className="space-y-2">
                                            {getLocationConfidants(
                                                selectedLocation.name
                                            ).map((confidant) => (
                                                <div
                                                    key={confidant.id}
                                                    className="flex items-center p-2 bg-gray-50 rounded"
                                                >
                                                    {getCurrentRelationshipLevel(
                                                        confidant.id
                                                    ) > 0 ? (
                                                        <>
                                                            <div className="w-8 h-8 flex-shrink-0 mr-3 bg-gray-200 rounded-full overflow-hidden">
                                                                <img
                                                                    src={
                                                                        confidant.portrait
                                                                    }
                                                                    alt={
                                                                        confidant.name
                                                                    }
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {
                                                                        confidant.name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {
                                                                        confidant.role
                                                                    }
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-8 h-8 flex-shrink-0 mr-3 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                                                ?
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">
                                                                    Mystery
                                                                    Person
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    You might
                                                                    meet someone
                                                                    here
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSpendTimeAtLocation}
                                className={`mt-4 w-full py-3 px-4 rounded-lg font-bold shadow-md transition-all ${
                                    actionPerformed
                                        ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                                        : "bg-gradient-to-r from-principalRed to-principalRed-light text-whiteCream hover:shadow-lg hover:scale-105 active:scale-95"
                                }`}
                                disabled={actionPerformed}
                            >
                                {actionPerformed
                                    ? "Already visited a location this period"
                                    : `Spend time at ${selectedLocation.name}`}
                            </button>

                            {actionPerformed && (
                                <div className="mt-3 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                    You can only visit one location per period.
                                </div>
                            )}
                        </div>
                    </MenuContainer>
                </div>
            )}

            {/* Conversation Modal */}
            {showConversation && currentConfidant && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-[color:var(--color-whiteCream)] rounded-lg shadow-xl w-[800px] max-h-[90vh] overflow-hidden">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[color:var(--color-principalBrown)]">
                                Conversation with {currentConfidant.name}
                            </h3>
                        </div>

                        <div className="p-6 flex">
                            {/* Portrait du confident */}
                            <div className="w-1/3 pr-6 flex flex-col items-center">
                                <div className="w-48 h-48 rounded-full bg-gray-200 overflow-hidden mb-4">
                                    <img
                                        src={currentConfidant.portrait}
                                        alt={currentConfidant.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h4 className="text-lg font-bold text-[color:var(--color-principalBrown)]">
                                    {currentConfidant.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {currentConfidant.role}
                                </p>

                                {/* Niveau de relation */}
                                <div className="mt-4 flex items-center">
                                    <span className="text-sm text-gray-600 mr-2">
                                        Relationship:
                                    </span>
                                    <div className="flex">
                                        {Array.from({ length: 5 }).map(
                                            (_, index) => (
                                                <span
                                                    key={index}
                                                    className={`w-4 h-4 mx-0.5 rounded-full ${
                                                        index <
                                                        currentConfidant.currentLevel
                                                            ? "bg-yellow-500"
                                                            : "bg-gray-300"
                                                    }`}
                                                />
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Buff associé */}
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-700">
                                        {currentConfidant.buffName}
                                    </p>
                                </div>
                            </div>

                            {/* Contenu de la conversation */}
                            <div className="w-2/3 pl-6 border-l border-gray-200">
                                <div className="bg-gray-100 rounded-lg p-4 mb-4 max-h-[400px] overflow-y-auto">
                                    {conversationStage === "dialogue" &&
                                        currentConfidant.dialogue.responses && (
                                            <div className="space-y-3">
                                                {currentConfidant.dialogue.responses
                                                    .slice(0, visibleLines)
                                                    .map((line, index) => {
                                                        const isConfidant =
                                                            index % 2 === 0;
                                                        return (
                                                            <div
                                                                key={index}
                                                                className={`flex ${
                                                                    isConfidant
                                                                        ? "justify-start"
                                                                        : "justify-end"
                                                                } animate-fadeInUp`}
                                                                style={{
                                                                    animation: `fadeInUp 3s ease-out ${
                                                                        index *
                                                                        0.3
                                                                    }s both`,
                                                                    opacity: 0,
                                                                }}
                                                            >
                                                                <div
                                                                    className={`max-w-[80%] p-3 rounded-lg ${
                                                                        isConfidant
                                                                            ? "bg-white border border-gray-200 text-[color:var(--color-principalBrown)]"
                                                                            : "bg-blue-500 text-white"
                                                                    }`}
                                                                >
                                                                    <p className="mb-1">
                                                                        <span className="font-medium">
                                                                            {isConfidant
                                                                                ? currentConfidant.name
                                                                                : "You"}
                                                                            :
                                                                        </span>
                                                                    </p>
                                                                    <p>
                                                                        {line}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    {isTyping && (
                                        <div className="flex justify-start mt-2">
                                            <div className="bg-white border border-gray-200 text-[color:var(--color-principalBrown)] max-w-[80%] p-3 rounded-lg">
                                                <div className="flex items-center gap-1">
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                "0ms",
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                "150ms",
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                "300ms",
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleConversationProgress}
                                        className={`px-4 py-2 bg-[color:var(--color-principalRed)] text-white rounded-md font-medium transition-all duration-300 ${
                                            isTyping
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-[color:var(--color-principalRed-light)]"
                                        }`}
                                        disabled={isTyping}
                                    >
                                        {isTyping
                                            ? "Please wait..."
                                            : "End Conversation"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Buff obtenu PopOver */}
            {showBuff && obtainedBuff && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-[color:var(--color-whiteCream)] rounded-lg shadow-xl w-[500px] overflow-hidden animate-fadeIn">
                        <div className="p-5 border-b border-gray-200 bg-blue-50">
                            <h3 className="text-xl font-bold text-center text-blue-700">
                                <span className="text-2xl mr-2">✨</span> New
                                Buff Unlocked!
                            </h3>
                        </div>

                        <div className="p-6 text-center">
                            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-3xl">🎁</span>
                            </div>

                            <h4 className="text-lg font-bold text-[color:var(--color-principalBrown)] mb-2">
                                {obtainedBuff.name} (Level {obtainedBuff.level})
                            </h4>

                            <p className="text-[color:var(--color-principalBrown)] mb-4">
                                {obtainedBuff.description}
                            </p>

                            <p className="text-sm text-gray-600 italic mb-6">
                                Obtained from your relationship with{" "}
                                {obtainedBuff.confidant}
                            </p>

                            <button
                                onClick={() => setShowBuff(false)}
                                className="px-6 py-2 bg-[color:var(--color-principalRed)] text-white rounded-md font-medium hover:bg-[color:var(--color-principalRed-light)] transition-all duration-300"
                            >
                                Great!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message générique PopOver */}
            {showGenericMessage && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-[color:var(--color-whiteCream)] rounded-lg shadow-xl w-[500px] overflow-hidden animate-fadeIn">
                        <div className="p-5 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-center text-[color:var(--color-principalBrown)]">
                                Visit Complete
                            </h3>
                        </div>

                        <div className="p-6 text-center">
                            <p className="text-[color:var(--color-principalBrown)] mb-6">
                                {genericMessage}
                            </p>

                            <div className="bg-green-50 p-3 rounded-lg mb-6">
                                <p className="text-green-700 font-medium">
                                    Your burnout has been reduced by{" "}
                                    {selectedLocation &&
                                    selectedLocation.name === "Home"
                                        ? "25%"
                                        : "10%"}
                                    !
                                </p>
                                <p className="text-sm text-green-600 mt-1">
                                    Taking personal time helps maintain your
                                    mental health.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowGenericMessage(false)}
                                className="px-6 py-2 bg-[color:var(--color-principalRed)] text-white rounded-md font-medium hover:bg-[color:var(--color-principalRed-light)] transition-all duration-300"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Back Button */}
            <div className="fixed bottom-0 left-0 w-1/3 p-4 border-t border-[color:var(--color-principalBrown)] border-opacity-20 bg-[color:var(--color-yellowWhite)] flex justify-between z-10">
                <button
                    onClick={onBack}
                    onMouseEnter={() => setHoveredMenuItem("Back")}
                    onMouseLeave={() => setHoveredMenuItem(null)}
                    style={styles.backButton(hoveredMenuItem === "Back")}
                >
                    Back
                </button>
            </div>

            {/* Add keyframes for fadeInUp animation at the end of the file */}
            <style global={true}>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

SocialManagement.propTypes = {
    onBack: PropTypes.func.isRequired,
    onLocationSelect: PropTypes.func,
    currentPlanned: PropTypes.string,
};

export default SocialManagement;

