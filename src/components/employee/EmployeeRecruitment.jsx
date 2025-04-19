import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { EventBus } from "../../game/EventBus";
import MenuContainer from "../common/MenuContainer";

const EmployeeRecruitment = ({ onBack, funds }) => {
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [recruitmentDone, setRecruitmentDone] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredCandidate, setHoveredCandidate] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
    const [showDetails, setShowDetails] = useState(false);
    const [currentPeriod, setCurrentPeriod] = useState(1);

    const RECRUITMENT_COST = 5000;
    const STORAGE_KEY_CANDIDATES = "periodRecruitmentCandidates";

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("fr-FR").format(value) + " ¥";
    };

    // Check if recruitment has been done for the current period and load saved candidates
    useEffect(() => {
        // Get the current period from window.gameRef if available
        let period = 1;
        if (window.gameRef && window.gameRef.getGameState) {
            const gameState = window.gameRef.getGameState();
            period = gameState.period || 1;
            setCurrentPeriod(period);
        }

        // Check localStorage for recruitment status
        const recruitmentPeriod = localStorage.getItem(
            "recruitmentDoneInPeriod"
        );
        if (recruitmentPeriod && parseInt(recruitmentPeriod) === period) {
            setRecruitmentDone(true);

            // Load saved candidates if available
            const savedCandidatesData = localStorage.getItem(
                STORAGE_KEY_CANDIDATES
            );
            if (savedCandidatesData) {
                try {
                    const savedCandidates = JSON.parse(savedCandidatesData);
                    // Check if the saved candidates are for the current period
                    if (savedCandidates.period === period) {
                        setCandidates(savedCandidates.candidates);
                    }
                } catch (error) {
                    console.error("Error parsing saved candidates:", error);
                }
            }
        } else {
            setRecruitmentDone(false);
            setCandidates([]);
        }

        // Listen for period changes
        const handleGameStateUpdate = (updatedState) => {
            if (updatedState && updatedState.period !== currentPeriod) {
                setCurrentPeriod(updatedState.period);
                // Reset recruitment status for new period
                const storedPeriod = localStorage.getItem(
                    "recruitmentDoneInPeriod"
                );
                if (
                    !storedPeriod ||
                    parseInt(storedPeriod) !== updatedState.period
                ) {
                    setRecruitmentDone(false);
                    setCandidates([]);
                    // Clear saved candidates when period changes
                    localStorage.removeItem(STORAGE_KEY_CANDIDATES);
                }
            }
        };

        if (window.gameRef && window.gameRef.events) {
            window.gameRef.events.on("gameStateUpdated", handleGameStateUpdate);

            return () => {
                window.gameRef.events.off(
                    "gameStateUpdated",
                    handleGameStateUpdate
                );
            };
        }
    }, [currentPeriod]);

    // Listen for recruitment complete event from HubScreen/fairy animation
    useEffect(() => {
        const handleRecruitmentComplete = () => {
            setIsLoading(false);
            generateCandidates();
        };

        EventBus.on("recruitmentAnimationComplete", handleRecruitmentComplete);

        return () => {
            EventBus.off(
                "recruitmentAnimationComplete",
                handleRecruitmentComplete
            );
        };
    });

    // Position details modal when candidate is selected
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

        if (selectedCandidate) {
            const sidebarWidth = window.innerWidth * 0.333;
            const mainAreaWidth = window.innerWidth * 0.667;

            setDetailsPosition({
                x: sidebarWidth + mainAreaWidth / 2,
                y: window.innerHeight / 2,
            });
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [selectedCandidate, showDetails]);

    const generateCandidates = () => {
        // Clear previous candidates
        const newCandidates = [];

        // Determine how many candidates to generate (up to 5)
        const candidateCount = Math.floor(Math.random() * 3) + 3; // 3-5 candidates

        // Generate random candidates based on rarity drop chances
        for (let i = 0; i < candidateCount; i++) {
            const candidate = generateRandomEmployee();
            newCandidates.push(candidate);
        }

        setCandidates(newCandidates);

        // Save candidates to localStorage for persistence
        const candidatesData = {
            period: currentPeriod,
            candidates: newCandidates,
        };
        localStorage.setItem(
            STORAGE_KEY_CANDIDATES,
            JSON.stringify(candidatesData)
        );
    };

    const generateRandomEmployee = () => {
        // Determine rarity based on drop chances
        const rarityRoll = Math.random() * 100;
        let rarity;

        if (rarityRoll < 50) {
            rarity = "D";
        } else if (rarityRoll < 75) {
            rarity = "C";
        } else if (rarityRoll < 90) {
            rarity = "B";
        } else if (rarityRoll < 98) {
            rarity = "A";
        } else {
            rarity = "S";
        }

        // Random name generation (simplified)
        const firstNames = [
            "Hiroshi",
            "Yuki",
            "Kenji",
            "Aiko",
            "Takeshi",
            "Sakura",
            "Ryu",
            "Hana",
            "Daiki",
            "Mai",
        ];
        const lastNames = [
            "Tanaka",
            "Sato",
            "Watanabe",
            "Yamamoto",
            "Nakamura",
            "Ito",
            "Kobayashi",
            "Suzuki",
            "Kato",
            "Takahashi",
        ];

        const firstName =
            firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName =
            lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;

        // Generate base stats based on rarity
        const rarityMultiplier = {
            D: 0.6,
            C: 0.8,
            B: 1.0,
            A: 1.3,
            S: 1.6,
        };

        const baseSkill = Math.floor(Math.random() * 30) + 20; // Base skill between 20-50
        const multiplier = rarityMultiplier[rarity];

        // Generate traits
        const traits = ["Empathetic", "Analytical", "Authoritative"];
        const trait = traits[Math.floor(Math.random() * traits.length)];

        // Generate debate traits
        const debateTraits = [
            "Diplomatic",
            "Logical",
            "Assertive",
            "Commanding",
            "Sympathetic",
            "Strategic",
            "Reflective",
        ];
        const debateTrait =
            debateTraits[Math.floor(Math.random() * debateTraits.length)];

        // Calculate salary based on rarity and skills
        const baseSalary = {
            D: 2500,
            C: 3500,
            B: 5000,
            A: 7000,
            S: 10000,
        };

        const salary = Math.floor(
            baseSalary[rarity] * (0.9 + Math.random() * 0.3)
        ); // ±15% variation

        // Calculate contract fee (generally 30% of salary)
        const contractFee = Math.floor(salary * 0.3);

        return {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name,
            level: 1,
            mood: 3, // Start with happy mood
            trait,
            rarity,
            salary,
            contractFee,
            skills: {
                cooking: Math.floor(
                    baseSkill * multiplier * (0.7 + Math.random() * 0.6)
                ),
                service: Math.floor(
                    baseSkill * multiplier * (0.7 + Math.random() * 0.6)
                ),
                management: Math.floor(
                    baseSkill * multiplier * (0.7 + Math.random() * 0.6)
                ),
                debate: Math.floor(
                    baseSkill * multiplier * (0.7 + Math.random() * 0.6)
                ),
            },
            debateStats: {
                trait: debateTrait,
                interventionCost: Math.floor(
                    20 + 50 * rarityMultiplier[rarity] * Math.random()
                ),
                relevance: Math.floor(
                    30 + 60 * rarityMultiplier[rarity] * Math.random()
                ),
                repartee: Math.floor(
                    30 + 60 * rarityMultiplier[rarity] * Math.random()
                ),
            },
            description: generateDescription(trait, rarity),
            assigned: null,
        };
    };

    const generateDescription = (trait, rarity) => {
        const traitDescriptions = {
            Empathetic:
                "Connects well with customers and staff. Creates a positive atmosphere.",
            Analytical:
                "Excels at optimizing operations and spotting inefficiencies.",
            Authoritative:
                "Natural leader who maintains high standards and discipline.",
        };

        const rarityDescriptions = {
            D: "A novice with basic training. Shows some potential with proper guidance.",
            C: "Reliable worker with some experience in the restaurant industry.",
            B: "Experienced professional with solid skills and industry knowledge.",
            A: "Exceptional talent with impressive credentials and expertise.",
            S: "Legendary in the industry. Their reputation alone attracts customers.",
        };

        return `${traitDescriptions[trait]} ${rarityDescriptions[rarity]}`;
    };

    const handleStartRecruitment = () => {
        if (funds < RECRUITMENT_COST || recruitmentDone) return;

        setIsLoading(true);

        // Trigger fairy animation through event bus
        EventBus.emit("startRecruitment");

        // Recruitment now marked as done for this period
        setRecruitmentDone(true);

        // Store in localStorage which period recruitment was done
        localStorage.setItem(
            "recruitmentDoneInPeriod",
            currentPeriod.toString()
        );
    };

    const handleHireEmployee = (candidate) => {
        const totalCost = candidate.salary + candidate.contractFee;

        if (funds < totalCost) return;

        // Remove from candidates
        const updatedCandidates = candidates.filter(
            (c) => c.id !== candidate.id
        );
        setCandidates(updatedCandidates);

        // Update localStorage with remaining candidates
        const candidatesData = {
            period: currentPeriod,
            candidates: updatedCandidates,
        };
        localStorage.setItem(
            STORAGE_KEY_CANDIDATES,
            JSON.stringify(candidatesData)
        );

        // Close details if this was the selected candidate
        if (selectedCandidate && selectedCandidate.id === candidate.id) {
            setSelectedCandidate(null);
            setShowDetails(false);
        }

        // In a real implementation, we would:
        // 1. Deduct funds
        // 2. Add employee to the player's roster
        // 3. Update game state
        console.log(`Hired ${candidate.name} for ${formatCurrency(totalCost)}`);
    };

    const handleSelectCandidate = (candidate) => {
        setSelectedCandidate(candidate);
        setShowDetails(true);
    };

    const getMoodEmoji = (mood) => {
        switch (mood) {
            case 3:
                return { emoji: "😄", label: "Happy", color: "#4ADE80" };
            case 2:
                return { emoji: "🙂", label: "Content", color: "#FBBF24" };
            case 1:
                return { emoji: "😒", label: "Dissatisfied", color: "#F87171" };
            default:
                return { emoji: "😐", label: "Neutral", color: "#9CA3AF" };
        }
    };

    // Style du bouton back (similaire aux autres composants)
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
        recruitButton: (isDisabled, isHovered) => ({
            padding: "1rem 2rem",
            backgroundColor: isDisabled
                ? "rgba(156, 163, 175, 0.5)"
                : isHovered
                ? "var(--color-principalRed-light)"
                : "var(--color-principalRed)",
            color: "var(--color-whiteCream)",
            borderRadius: "0.5rem",
            fontWeight: "bold",
            fontSize: "1.25rem",
            border: "none",
            cursor: isDisabled ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            transform: !isDisabled && isHovered ? "scale(1.05)" : "scale(1)",
            boxShadow:
                !isDisabled && isHovered
                    ? "0 4px 12px rgba(0, 0, 0, 0.2)"
                    : "0 2px 4px rgba(0, 0, 0, 0.1)",
            opacity: isDisabled ? 0.7 : 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        }),
        candidateCard: (isSelected, isHovered) => ({
            backgroundColor: isSelected
                ? "rgba(var(--color-principalRed-rgb), 0.1)"
                : isHovered
                ? "rgba(var(--color-principalRed-rgb), 0.05)"
                : "var(--color-whiteCream)",
            borderRadius: "0.5rem",
            padding: "0.75rem",
            cursor: "pointer",
            border: isSelected
                ? "2px solid var(--color-principalRed)"
                : isHovered
                ? "1px solid var(--color-principalRed)"
                : "1px solid rgba(49, 34, 24, 0.1)",
            transition: "all 0.2s ease",
            boxShadow:
                isSelected || isHovered
                    ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                    : "0 2px 4px rgba(0, 0, 0, 0.05)",
            position: "relative",
            overflow: "hidden",
        }),
        rarityBadge: (rarity) => {
            const colors = {
                D: { bg: "#9CA3AF", text: "#FFFFFF" },
                C: { bg: "#34D399", text: "#FFFFFF" },
                B: { bg: "#3B82F6", text: "#FFFFFF" },
                A: { bg: "#8B5CF6", text: "#FFFFFF" },
                S: { bg: "#F59E0B", text: "#FFFFFF" },
            };
            return {
                backgroundColor: colors[rarity]?.bg || "#9CA3AF",
                color: colors[rarity]?.text || "#FFFFFF",
                borderRadius: "0.25rem",
                padding: "0.125rem 0.375rem",
                fontSize: "0.75rem",
                fontWeight: "bold",
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                zIndex: 2,
            };
        },
        levelBadge: {
            backgroundColor: "var(--color-principalRed)",
            color: "white",
            borderRadius: "0.375rem",
            padding: "0.25rem 0.5rem",
            fontSize: "0.8rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            position: "absolute",
            top: "0.5rem",
            left: "0.5rem",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            zIndex: 3,
        },
        traitBadge: (trait) => {
            const colors = {
                Authoritative: { bg: "#FEE2E2", text: "#991B1B" },
                Empathetic: { bg: "#DBEAFE", text: "#1E40AF" },
                Analytical: { bg: "#E0E7FF", text: "#4338CA" },
            };
            return {
                backgroundColor: colors[trait]?.bg || "#E5E7EB",
                color: colors[trait]?.text || "#374151",
                borderRadius: "9999px",
                padding: "0.125rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: "600",
                display: "inline-block",
                position: "absolute",
                top: "0.5rem",
                left: "0.5rem",
            };
        },
        skillBar: (value, color) => ({
            width: `${value}%`,
            backgroundColor: color || "var(--color-principalRed)",
            height: "0.5rem",
            borderRadius: "9999px",
            transition: "width 0.5s ease-in-out",
        }),
        hireButton: (enabled) => ({
            backgroundColor: enabled ? "#10B981" : "#9CA3AF",
            color: "#FFFFFF",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            fontWeight: "bold",
            cursor: enabled ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
            opacity: enabled ? 1 : 0.7,
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
        }),
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>Employee Recruitment</h2>
                <p style={styles.headerSubtitle}>
                    Find and hire talented staff for your restaurants
                </p>
                <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="font-medium">Recruitment Cost: </span>
                        <span className="ml-2 text-lg font-semibold text-red-500">
                            {formatCurrency(RECRUITMENT_COST)}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-medium">Available Funds: </span>
                        <span className="ml-2 text-lg font-semibold text-emerald-600">
                            {formatCurrency(funds)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Contenu principal - Recruitment button or candidates */}
            <div className="p-4 flex-1 overflow-auto">
                {candidates.length === 0 ? (
                    <div className="bg-[color:var(--color-whiteCream)] p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 text-[color:var(--color-principalBrown)]">
                            Start Recruitment
                        </h3>
                        <p className="text-[color:var(--color-principalBrown)] mb-6">
                            Begin the search for new employees to join your
                            team. The recruitment process costs{" "}
                            {formatCurrency(RECRUITMENT_COST)} and can only be
                            done once per period.
                        </p>

                        <button
                            onClick={handleStartRecruitment}
                            onMouseEnter={() => setHoveredMenuItem("recruit")}
                            onMouseLeave={() => setHoveredMenuItem(null)}
                            disabled={
                                funds < RECRUITMENT_COST ||
                                recruitmentDone ||
                                isLoading
                            }
                            style={styles.recruitButton(
                                funds < RECRUITMENT_COST ||
                                    recruitmentDone ||
                                    isLoading,
                                hoveredMenuItem === "recruit"
                            )}
                            className="relative"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Searching for candidates...
                                </div>
                            ) : (
                                <>
                                    Start Recruitment
                                    <span className="text-sm mt-1 font-normal">
                                        Cost: {formatCurrency(RECRUITMENT_COST)}
                                    </span>
                                </>
                            )}
                        </button>

                        {recruitmentDone && !isLoading && (
                            <div className="mt-4 p-2 bg-amber-100 text-amber-800 rounded text-center">
                                You&apos;ve already conducted recruitment this
                                period.
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-[color:var(--color-principalBrown)]">
                            Available Candidates ({candidates.length})
                        </h3>

                        <div className="grid grid-cols-3 gap-4">
                            {candidates.map((candidate) => {
                                const moodInfo = getMoodEmoji(candidate.mood);
                                return (
                                    <div
                                        key={candidate.id}
                                        onClick={() =>
                                            handleSelectCandidate(candidate)
                                        }
                                        onMouseEnter={() =>
                                            setHoveredCandidate(candidate.id)
                                        }
                                        onMouseLeave={() =>
                                            setHoveredCandidate(null)
                                        }
                                        style={styles.candidateCard(
                                            selectedCandidate?.id ===
                                                candidate.id,
                                            hoveredCandidate === candidate.id
                                        )}
                                        className="relative hover:shadow-md hover:scale-[1.02] transition-transform"
                                    >
                                        {/* Level badge in top left */}
                                        <div style={styles.levelBadge}>
                                            <span>Lv.{candidate.level}</span>
                                        </div>

                                        {/* Rarity badge in top right */}
                                        <div
                                            style={styles.rarityBadge(
                                                candidate.rarity
                                            )}
                                        >
                                            {candidate.rarity}
                                        </div>

                                        {/* Trait badge */}
                                        <div
                                            style={{
                                                ...styles.traitBadge(
                                                    candidate.trait
                                                ),
                                                top: "3rem",
                                                left: "0.5rem",
                                            }}
                                        >
                                            {candidate.trait}
                                        </div>

                                        {/* Content with centered layout */}
                                        <div className="mt-16 flex flex-col items-center">
                                            {/* Placeholder for future sprite */}
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                <span className="text-xl">
                                                    👤
                                                </span>
                                            </div>

                                            <div className="flex-grow text-center">
                                                <h4 className="font-bold mt-2 text-[color:var(--color-principalBrown)]">
                                                    {candidate.name}
                                                </h4>

                                                {/* Cost info at bottom */}
                                                <div className="mt-2 text-xs">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-500">
                                                            Salary:
                                                        </span>
                                                        <span className="font-medium text-red-500">
                                                            {formatCurrency(
                                                                candidate.salary
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-gray-500">
                                                            Contract:
                                                        </span>
                                                        <span className="font-medium text-red-500">
                                                            {formatCurrency(
                                                                candidate.contractFee
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Mood at bottom */}
                                                <div className="mt-2 flex justify-center items-center text-xs">
                                                    <div className="flex items-center">
                                                        <span
                                                            className="text-xl"
                                                            style={{
                                                                color: moodInfo.color,
                                                            }}
                                                        >
                                                            {moodInfo.emoji}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Candidate Details Modal */}
            {showDetails && selectedCandidate && (
                <div
                    className="fixed z-50 transition-all duration-500"
                    style={{
                        left: `${detailsPosition.x}px`,
                        top: `${detailsPosition.y}px`,
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <MenuContainer
                        animationState={showDetails ? "visible" : "hidden"}
                        className="w-[700px] max-h-[80vh]"
                        scrollable={true}
                        maxHeight="80vh"
                        title={`${selectedCandidate.name} - ${selectedCandidate.trait} ${selectedCandidate.rarity}`}
                    >
                        <div className="p-5">
                            <div className="flex mb-6">
                                {/* Left Column - Candidate Basic Info */}
                                <div className="w-1/2 pr-4">
                                    <div className="flex items-center mb-4">
                                        {/* Placeholder for future sprite */}
                                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mr-4 border-4 border-white shadow-lg">
                                            <span className="text-3xl">👤</span>
                                        </div>

                                        <div>
                                            <div className="flex items-center">
                                                <h3 className="text-xl font-bold text-[color:var(--color-principalBrown)]">
                                                    {selectedCandidate.name}
                                                </h3>
                                                <div className="ml-2 px-2 py-1 bg-[color:var(--color-principalRed)] text-white text-sm font-bold rounded">
                                                    <span>
                                                        Lv.
                                                        {
                                                            selectedCandidate.level
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className="mt-1 inline-block"
                                                style={styles.traitBadge(
                                                    selectedCandidate.trait
                                                )}
                                            >
                                                {selectedCandidate.trait}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-[color:var(--color-principalBrown)]">
                                        <div className="flex justify-between items-center p-2 bg-[color:var(--color-yellowWhite)] rounded-lg">
                                            <span className="font-medium">
                                                Mood:
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-2xl"
                                                    style={{
                                                        color: getMoodEmoji(
                                                            selectedCandidate.mood
                                                        ).color,
                                                    }}
                                                >
                                                    {
                                                        getMoodEmoji(
                                                            selectedCandidate.mood
                                                        ).emoji
                                                    }
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {
                                                        getMoodEmoji(
                                                            selectedCandidate.mood
                                                        ).label
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center p-2 bg-[color:var(--color-yellowWhite)] rounded-lg">
                                            <span className="font-medium">
                                                Salary:
                                            </span>
                                            <span className="text-red-500 font-medium">
                                                {formatCurrency(
                                                    selectedCandidate.salary
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center p-2 bg-[color:var(--color-yellowWhite)] rounded-lg">
                                            <span className="font-medium">
                                                Contract Fee:
                                            </span>
                                            <span className="text-red-500 font-medium">
                                                {formatCurrency(
                                                    selectedCandidate.contractFee
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center p-2 bg-[color:var(--color-yellowWhite)] rounded-lg">
                                            <span className="font-medium">
                                                Total Hire Cost:
                                            </span>
                                            <span className="text-red-500 font-bold">
                                                {formatCurrency(
                                                    selectedCandidate.salary +
                                                        selectedCandidate.contractFee
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 bg-[color:var(--color-yellowWhite)] rounded-lg">
                                        <p className="text-sm italic text-[color:var(--color-principalBrown)]">
                                            {selectedCandidate.description}
                                        </p>
                                    </div>

                                    {/* Hire Action */}
                                    <div className="mt-4 bg-[color:var(--color-yellowWhite)] rounded-lg p-3">
                                        <h4 className="font-bold mb-3 text-[color:var(--color-principalBrown)]">
                                            Hiring Decision
                                        </h4>

                                        <button
                                            onClick={() =>
                                                handleHireEmployee(
                                                    selectedCandidate
                                                )
                                            }
                                            style={styles.hireButton(
                                                funds >=
                                                    selectedCandidate.salary +
                                                        selectedCandidate.contractFee
                                            )}
                                            disabled={
                                                funds <
                                                selectedCandidate.salary +
                                                    selectedCandidate.contractFee
                                            }
                                            className="w-full py-2 rounded hover:opacity-90 transition-opacity"
                                        >
                                            Hire {selectedCandidate.name} (
                                            {formatCurrency(
                                                selectedCandidate.salary +
                                                    selectedCandidate.contractFee
                                            )}
                                            )
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column - Restaurant Skills and Debate Stats */}
                                <div className="w-1/2 pl-4 border-l border-gray-200">
                                    {/* Restaurant Skills Section */}
                                    <div className="bg-[color:var(--color-yellowWhite)] rounded-lg p-3 mb-4">
                                        <h4 className="font-bold mb-3 text-[color:var(--color-principalBrown)]">
                                            🍜 Restaurant Skills
                                        </h4>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        🍳 Cooking
                                                    </span>
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        {
                                                            selectedCandidate
                                                                .skills.cooking
                                                        }
                                                        /100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedCandidate
                                                                .skills.cooking,
                                                            "#F97316"
                                                        )}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        🤝 Service
                                                    </span>
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        {
                                                            selectedCandidate
                                                                .skills.service
                                                        }
                                                        /100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedCandidate
                                                                .skills.service,
                                                            "#0EA5E9"
                                                        )}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        📊 Management
                                                    </span>
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        {
                                                            selectedCandidate
                                                                .skills
                                                                .management
                                                        }
                                                        /100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedCandidate
                                                                .skills
                                                                .management,
                                                            "#8B5CF6"
                                                        )}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Debate Stats Section */}
                                    <div className="bg-[color:var(--color-yellowWhite)] rounded-lg p-3 mb-4">
                                        <h4 className="font-bold mb-3 text-[color:var(--color-principalBrown)]">
                                            🗣️ Debate Skills
                                        </h4>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                                <span className="font-medium text-sm text-[color:var(--color-principalBrown)]">
                                                    Debate Trait:
                                                </span>
                                                <span className="text-[color:var(--color-principalBrown)] font-semibold px-2 py-0.5 bg-gray-100 rounded">
                                                    {
                                                        selectedCandidate
                                                            .debateStats.trait
                                                    }
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                                <span className="font-medium text-sm text-[color:var(--color-principalBrown)]">
                                                    Intervention Cost:
                                                </span>
                                                <span className="text-red-500 font-medium">
                                                    {
                                                        selectedCandidate
                                                            .debateStats
                                                            .interventionCost
                                                    }{" "}
                                                    pts
                                                </span>
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        Relevance
                                                    </span>
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        {
                                                            selectedCandidate
                                                                .debateStats
                                                                .relevance
                                                        }
                                                        /100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedCandidate
                                                                .debateStats
                                                                .relevance,
                                                            "#EC4899"
                                                        )}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        Repartee
                                                    </span>
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        {
                                                            selectedCandidate
                                                                .debateStats
                                                                .repartee
                                                        }
                                                        /100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedCandidate
                                                                .debateStats
                                                                .repartee,
                                                            "#10B981"
                                                        )}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        Overall Debate
                                                    </span>
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        {
                                                            selectedCandidate
                                                                .skills.debate
                                                        }
                                                        /100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedCandidate
                                                                .skills.debate,
                                                            "#6366F1"
                                                        )}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={() => {
                                        setShowDetails(false);
                                        setSelectedCandidate(null);
                                    }}
                                    className="px-4 py-2 bg-[color:var(--color-principalRed)] text-white rounded-md font-medium hover:bg-[color:var(--color-principalRed-light)] transition-all duration-300 transform hover:scale-105 active:scale-95"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </MenuContainer>
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
        </div>
    );
};

EmployeeRecruitment.propTypes = {
    onBack: PropTypes.func.isRequired,
    funds: PropTypes.number.isRequired,
};

export default EmployeeRecruitment;

