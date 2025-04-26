import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { EventBus } from "../../game/EventBus";
import MenuContainer from "../common/MenuContainer";
import employeesData from "../../data/employees.json";
import buffsData from "../../data/buffs.json";
import { useEmployees } from "../../store/gameStateHooks";
import gameState from "../../game/GameState";

const EmployeeRecruitment = ({ onBack, funds }) => {
    const { rosterWithDetails: currentEmployees, hireEmployee } =
        useEmployees();
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [recruitmentDone, setRecruitmentDone] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredCandidate, setHoveredCandidate] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
    const [showDetails, setShowDetails] = useState(false);
    const [currentPeriod, setCurrentPeriod] = useState(1);
    const [hoveredTooltip, setHoveredTooltip] = useState(false);

    const RECRUITMENT_COST = 30000;

    // Create a map of existing employee IDs for quick lookup
    const existingEmployeeIds = new Set(
        currentEmployees.map((emp) =>
            emp.employeeId ? emp.employeeId.toString() : ""
        )
    );

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("fr-FR").format(value) + " ¥";
    };

    // Check if recruitment has been done for the current period and load saved candidates
    useEffect(() => {
        // Get the current period from window.gameRef if available
        let period = 1;
        if (window.gameRef && window.gameRef.getGameState) {
            const gameState = window.gameRef.getGameState();
            period = gameState.gameProgress?.currentPeriod || 1;
            setCurrentPeriod(period);
        }

        // Check if recruitment has been done in the current period
        const recruitmentDoneInPeriod =
            gameState.isRecruitmentDoneInCurrentPeriod();
        setRecruitmentDone(recruitmentDoneInPeriod);

        if (recruitmentDoneInPeriod) {
            // Load saved candidates if available
            const savedCandidates = gameState.getRecruitmentCandidates();
            setCandidates(savedCandidates);
        } else {
            setCandidates([]);
        }

        // Listen for period changes
        const handleGameStateUpdate = (updatedState) => {
            if (
                updatedState &&
                updatedState.gameProgress &&
                updatedState.gameProgress.currentPeriod !== currentPeriod
            ) {
                setCurrentPeriod(updatedState.gameProgress.currentPeriod);
                // Reset recruitment status for new period
                const recruitmentDoneInNewPeriod =
                    gameState.isRecruitmentDoneInCurrentPeriod();
                setRecruitmentDone(recruitmentDoneInNewPeriod);

                if (recruitmentDoneInNewPeriod) {
                    setCandidates(gameState.getRecruitmentCandidates());
                } else {
                    setCandidates([]);
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

        // Get available employees (exclude ones the player already has)
        const availableEmployees = employeesData.filter(
            (emp) => !existingEmployeeIds.has(emp.id.toString())
        );

        if (availableEmployees.length === 0) {
            console.warn("No more available employees to recruit!");
            return;
        }

        // Fetch the Recruitment Guru buff level from GameState
        const buffLevel = gameState.getBuffLevel("recruitmentGuru");
        let buffValue = 0;

        // Find the corresponding buff value from buffs.json if level > 0
        if (buffLevel > 0) {
            const buffDetails = buffsData.socialBuffs.recruitmentGuru;
            const levelEffect = buffDetails?.levels.find(
                (lvl) => lvl.level === buffLevel
            );
            if (levelEffect) {
                buffValue = levelEffect.value || 0; // Use the percentage value
            }
        }

        // Randomly select candidates based on rarity
        for (
            let i = 0;
            i < candidateCount && availableEmployees.length > 0;
            i++
        ) {
            // Determine rarity based on drop chances, adjusted by buff
            // The buff increases the chance of higher rarity, so we add its value to the roll.
            const baseRoll = Math.random() * 100;
            const rarityRoll = Math.min(100, baseRoll + buffValue); // Cap at 100
            let targetRarity;
            console.log(buffValue);
            // Rarity thresholds remain the same, but the adjusted roll makes higher rarities more likely
            if (rarityRoll < 50) {
                targetRarity = "D";
            } else if (rarityRoll < 75) {
                targetRarity = "C";
            } else if (rarityRoll < 90) {
                targetRarity = "B";
            } else if (rarityRoll < 98) {
                targetRarity = "A";
            } else {
                targetRarity = "S";
            }

            // Filter available employees by target rarity
            const rarityEmployees = availableEmployees.filter(
                (emp) => emp.rarity === targetRarity
            );

            // If no employees of target rarity, try to get any available employee
            const employeePool =
                rarityEmployees.length > 0
                    ? rarityEmployees
                    : availableEmployees;

            if (employeePool.length === 0) continue;

            // Select a random employee from the pool
            const randomIndex = Math.floor(Math.random() * employeePool.length);
            const selectedEmployee = employeePool[randomIndex];

            // Remove this employee from available pool to avoid duplicates
            const employeeIndex = availableEmployees.findIndex(
                (emp) => emp.id === selectedEmployee.id
            );
            if (employeeIndex !== -1) {
                availableEmployees.splice(employeeIndex, 1);
            }

            // Contract fee is now 50% of salary
            const contractFee = Math.floor(selectedEmployee.salary * 0.5);

            // Create the candidate with relevant info
            const candidate = {
                ...selectedEmployee,
                mood: 3, // Start with happy mood
                contractFee,
            };

            newCandidates.push(candidate);
        }

        setCandidates(newCandidates);

        // Save candidates to game state
        gameState.saveRecruitmentCandidates(newCandidates);
    };

    const handleStartRecruitment = () => {
        if (funds < RECRUITMENT_COST || recruitmentDone) return;

        setIsLoading(true);

        // Deduct the recruitment cost directly via gameState
        gameState.updateFunds(
            -RECRUITMENT_COST,
            "Employee Recruitment",
            "recruitment"
        );

        // Trigger fairy animation through event bus
        EventBus.emit("startRecruitment");

        // Recruitment now marked as done for this period
        setRecruitmentDone(true);

        // Mark recruitment as done in game state
        gameState.markEmployeeRecruitmentDone();
    };

    const handleHireEmployee = (candidate) => {
        const contractFee = candidate.contractFee;

        // Check if funds cover the *total* cost (salary + fee)
        const totalCost = candidate.salary + contractFee;
        if (funds < totalCost) {
            console.error("Insufficient funds");
            return;
        }

        // Prepare employee data for hiring
        const employeeData = {
            id: candidate.id,
            salary: candidate.salary,
        };

        // Hire the employee through the game state
        // This function in GameState.js will handle the total cost deduction
        hireEmployee(employeeData);

        // Remove from candidates
        const updatedCandidates = candidates.filter(
            (c) => c.id !== candidate.id
        );
        setCandidates(updatedCandidates);

        // Update the candidates in game state
        gameState.saveRecruitmentCandidates(updatedCandidates);

        // Close details if this was the selected candidate
        if (selectedCandidate && selectedCandidate.id === candidate.id) {
            setSelectedCandidate(null);
            setShowDetails(false);
        }
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
        tooltip: {
            position: "absolute",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.375rem",
            zIndex: 100,
            maxWidth: "250px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            fontSize: "0.75rem",
            lineHeight: "1.3",
            top: "calc(100% + 5px)",
            left: "50%",
            transform: "translateX(-50%)",
            opacity: hoveredTooltip ? 1 : 0,
            visibility: hoveredTooltip ? "visible" : "hidden",
            transition: "opacity 0.2s, visibility 0.2s",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>Employee Recruitment</h2>
                <p style={styles.headerSubtitle}>
                    Find and hire talented staff for your restaurants
                </p>
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

                        <div className="grid grid-cols-3 gap-1">
                            {candidates.map((candidate) => {
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
                                            <span>
                                                Lv.{candidate.level || 1}
                                            </span>
                                        </div>

                                        {/* Rarity badge in top right */}
                                        <div
                                            style={styles.rarityBadge(
                                                candidate.rarity
                                            )}
                                        >
                                            {candidate.rarity}
                                        </div>

                                        {/* Content with centered layout */}
                                        <div className="mt-9 flex flex-col items-center">
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
                                                            Contract Fee:
                                                        </span>
                                                        <span className="font-medium text-red-500">
                                                            {formatCurrency(
                                                                candidate.contractFee
                                                            )}
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
                        title={`${selectedCandidate.name} - ${selectedCandidate.rarity}`}
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
                                                        {selectedCandidate.level ||
                                                            1}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-[color:var(--color-principalBrown)]">
                                        <div className="flex justify-between items-center p-2 bg-[color:var(--color-yellowWhite)] rounded-lg relative">
                                            <span className="font-medium flex items-center">
                                                Morale :
                                                <div
                                                    className="ml-1 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-xs cursor-help"
                                                    onMouseEnter={() =>
                                                        setHoveredTooltip(true)
                                                    }
                                                    onMouseLeave={() =>
                                                        setHoveredTooltip(false)
                                                    }
                                                >
                                                    ?
                                                </div>
                                                {hoveredTooltip && (
                                                    <div style={styles.tooltip}>
                                                        <p>
                                                            <strong>
                                                                Morale Impact:
                                                            </strong>
                                                        </p>
                                                        <p className="mt-1">
                                                            • High (≥80):
                                                            Performance boost
                                                        </p>
                                                        <p>
                                                            • Low (≤30):
                                                            Performance penalty
                                                        </p>
                                                    </div>
                                                )}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {
                                                        getMoodEmoji(
                                                            selectedCandidate.mood ||
                                                                3
                                                        ).label
                                                    }
                                                </span>
                                                <span
                                                    className="text-2xl"
                                                    style={{
                                                        color: getMoodEmoji(
                                                            selectedCandidate.mood ||
                                                                3
                                                        ).color,
                                                    }}
                                                >
                                                    {
                                                        getMoodEmoji(
                                                            selectedCandidate.mood ||
                                                                3
                                                        ).emoji
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
                                                Contract Fee (50% of Salary):
                                            </span>
                                            <span className="text-red-500 font-medium">
                                                {formatCurrency(
                                                    selectedCandidate.contractFee
                                                )}
                                            </span>
                                        </div>
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
                                            Hire {selectedCandidate.name} for{" "}
                                            {formatCurrency(
                                                selectedCandidate.salary +
                                                    selectedCandidate.contractFee
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column - Restaurant Skills */}
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
                                                        🍳 Cuisine
                                                    </span>
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        {
                                                            selectedCandidate.cuisine
                                                        }
                                                        /100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedCandidate.cuisine,
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
                                                            selectedCandidate.service
                                                        }
                                                        /100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedCandidate.service,
                                                            "#0EA5E9"
                                                        )}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        🎭 Ambiance
                                                    </span>
                                                    <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                                        {
                                                            selectedCandidate.ambiance
                                                        }
                                                        /100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedCandidate.ambiance,
                                                            "#8B5CF6"
                                                        )}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Level Information */}
                                    <div className="bg-[color:var(--color-yellowWhite)] rounded-lg p-3 mb-4">
                                        <h4 className="font-bold mb-3 text-[color:var(--color-principalBrown)]">
                                            📈 Employee Growth
                                        </h4>

                                        <div className="flex justify-between items-center p-2 bg-white rounded-lg mb-2">
                                            <span className="font-medium text-sm text-[color:var(--color-principalBrown)]">
                                                Current Level:
                                            </span>
                                            <span className="text-[color:var(--color-principalBrown)] font-semibold px-2 py-0.5 bg-gray-100 rounded">
                                                {selectedCandidate.level || 1}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                            <span className="font-medium text-sm text-[color:var(--color-principalBrown)]">
                                                Level Cap:
                                            </span>
                                            <span className="text-[color:var(--color-principalRed)] font-semibold px-2 py-0.5 bg-gray-100 rounded">
                                                {selectedCandidate.levelCap ||
                                                    5}
                                            </span>
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

