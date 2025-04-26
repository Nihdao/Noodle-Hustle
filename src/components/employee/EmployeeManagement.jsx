import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MenuContainer from "../common/MenuContainer";
import { useEmployees, useFinances } from "../../store/gameStateHooks";

const EmployeeManagement = ({ onBack }) => {
    const {
        rosterWithDetails: employees,
        laborCost,
        trainEmployee,
        giftEmployee,
        fireEmployee,
        getEmployeeById,
    } = useEmployees();
    const { funds, formatCurrency } = useFinances();

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [hoveredTooltip, setHoveredTooltip] = useState(false);
    const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
    const [showDetails, setShowDetails] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Mood emojis mapping
    const getMoodEmoji = (morale) => {
        if (morale >= 80)
            return { emoji: "😄", label: "Happy", color: "#4ADE80" };
        if (morale >= 50)
            return { emoji: "🙂", label: "Okay", color: "#FBBF24" };
        if (morale >= 30)
            return { emoji: "😒", label: "Dissatisfied", color: "#F87171" };
        return { emoji: "😣", label: "Unhappy", color: "#EF4444" };
    };

    // Calcul des coûts d'action basés sur l'employé
    const getGiftCost = (rarity) => {
        const costsMap = {
            D: 50000,
            C: 100000,
            B: 150000,
            A: 200000,
            S: 300000,
        };
        return costsMap[rarity] || 1000;
    };

    const getTrainingCost = (rarity) => {
        const rarityMultiplier = {
            D: 50000,
            C: 80000,
            B: 120000,
            A: 180000,
            S: 250000,
        };
        return rarityMultiplier[rarity] || 1000;
    };

    const getFireCost = (salary) => {
        return Math.round(salary * 0.25);
    };

    // Update the selected employee when employees data changes
    useEffect(() => {
        if (selectedEmployee && showDetails) {
            const updatedEmployee = employees.find(
                (emp) => emp.id === selectedEmployee.id
            );
            if (updatedEmployee) {
                setSelectedEmployee(updatedEmployee);
            }
        }
    }, [employees, selectedEmployee, showDetails]);

    // Gérer la sélection d'un employé
    const handleSelectEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowDetails(true);

        // Positionner le menu de détails
        const sidebarWidth = window.innerWidth * 0.333; // 33.333% de la largeur
        const mainAreaWidth = window.innerWidth * 0.667; // 66.667% de la largeur

        setDetailsPosition({
            x: sidebarWidth + mainAreaWidth / 2,
            y: window.innerHeight / 2,
        });
    };

    // Redimensionnement de la fenêtre
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

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [showDetails]);

    // Actions sur les employés
    const handleGift = (employee) => {
        if (employee.morale >= 100) return;
        if (employee.management.giftedThisPeriod) {
            setErrorMessage(
                "This employee has already had a management action performed this period."
            );
            setTimeout(() => setErrorMessage(""), 3000);
            return;
        }

        const cost = getGiftCost(employee.rarity);
        if (cost > funds) {
            setErrorMessage("Insufficient funds for this action.");
            setTimeout(() => setErrorMessage(""), 3000);
            return;
        }

        giftEmployee(employee.id, cost);

        // Update the selected employee with fresh data
        setTimeout(() => {
            const updatedEmployee = getEmployeeById(employee.id);
            if (updatedEmployee) {
                setSelectedEmployee(updatedEmployee);
            }
        }, 100);
    };

    const handleTraining = (employee) => {
        if (employee.management.trainedThisPeriod) {
            setErrorMessage(
                "This employee has already had a management action performed this period."
            );
            setTimeout(() => setErrorMessage(""), 3000);
            return;
        }

        const cost = getTrainingCost(employee.rarity);
        if (cost > funds) {
            setErrorMessage("Insufficient funds for this action.");
            setTimeout(() => setErrorMessage(""), 3000);
            return;
        }

        trainEmployee(employee.id, cost);

        // Update the selected employee with fresh data
        setTimeout(() => {
            const updatedEmployee = getEmployeeById(employee.id);
            if (updatedEmployee) {
                setSelectedEmployee(updatedEmployee);
            }
        }, 100);
    };

    const handleFire = (employee) => {
        // Check if employee is protected (initial employees)
        if (employee.id === 74 || employee.id === 75) {
            setErrorMessage(
                "This employee cannot be fired. They are part of your initial team."
            );
            setTimeout(() => setErrorMessage(""), 3000); // Clear message after 3 seconds
            return;
        }

        const cost = getFireCost(employee.salary);
        if (cost > funds) {
            setErrorMessage("Insufficient funds for severance payment.");
            setTimeout(() => setErrorMessage(""), 3000);
            return;
        }

        fireEmployee(employee.id, cost);
        setSelectedEmployee(null);
        setShowDetails(false);
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
        employeeCard: (isSelected, level) => {
            // Create a gradient background based on employee level
            const getLevelGradient = (level) => {
                if (level >= 5)
                    return "linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(255,215,0,0.1) 100%)";
                if (level >= 4)
                    return "linear-gradient(135deg, rgba(147,112,219,0.05) 0%, rgba(147,112,219,0.1) 100%)";
                if (level >= 3)
                    return "linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(59,130,246,0.1) 100%)";
                if (level >= 2)
                    return "linear-gradient(135deg, rgba(52,211,153,0.05) 0%, rgba(52,211,153,0.1) 100%)";
                return "linear-gradient(135deg, rgba(156,163,175,0.05) 0%, rgba(156,163,175,0.1) 100%)";
            };

            return {
                backgroundColor: isSelected
                    ? "rgba(var(--color-principalRed-rgb), 0.1)"
                    : "var(--color-whiteCream)",
                backgroundImage: !isSelected ? getLevelGradient(level) : "none",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                cursor: "pointer",
                border: isSelected
                    ? "2px solid var(--color-principalRed)"
                    : "1px solid rgba(49, 34, 24, 0.1)",
                transition: "all 0.2s ease",
                boxShadow: isSelected
                    ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                    : "0 2px 4px rgba(0, 0, 0, 0.05)",
                position: "relative",
                overflow: "hidden",
            };
        },
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
            width: `${value / 2}%`,
            backgroundColor: color || "var(--color-principalRed)",
            height: "0.5rem",
            borderRadius: "9999px",
            transition: "width 0.5s ease-in-out",
        }),
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
                <h2 style={styles.headerTitle}>Employee Management</h2>
                <p style={styles.headerSubtitle}>
                    Manage your staff and optimize performance
                </p>
                <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="font-medium text-[color:var(--color-principalBrown)]">
                            Labor Cost:{" "}
                        </span>
                        <span className="ml-2 text-lg font-semibold text-red-500">
                            {formatCurrency(laborCost)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Employee Grid */}
            <div className="p-4 flex-1 overflow-auto">
                <h3 className="text-lg font-semibold mb-4 text-[color:var(--color-principalBrown)]">
                    Your Employees
                </h3>

                <div className="grid grid-cols-3 gap-4">
                    {employees.map((employee) => {
                        const moodInfo = getMoodEmoji(employee.morale || 90);
                        return (
                            <div
                                key={employee.id}
                                style={styles.employeeCard(
                                    selectedEmployee?.id === employee.id,
                                    employee.level
                                )}
                                className="relative hover:shadow-md hover:scale-[1.02] transition-transform"
                                onClick={() => handleSelectEmployee(employee)}
                            >
                                {/* Level badge in top left - simplified without stars */}
                                <div style={styles.levelBadge}>
                                    <span>Lv.{employee.level}</span>
                                </div>

                                {/* Rarity badge stays in top right */}
                                <div
                                    style={styles.rarityBadge(employee.rarity)}
                                >
                                    {employee.rarity}
                                </div>
                                {/* Content with horizontal layout - simplified */}
                                <div className="mt-8 flex flex-col items-center">
                                    {/* Placeholder for future sprite */}
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                                        <span className="text-xl">👤</span>
                                    </div>

                                    <div className="flex-grow">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold mt-2 text-[color:var(--color-principalBrown)]">
                                                {employee.name}
                                            </h4>
                                        </div>

                                        {/* Simplified bottom row with just mood and assignment */}
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

                {employees.length === 0 && (
                    <div className="text-center py-8 text-[color:var(--color-principalBrown)] italic">
                        No employees yet. Visit the Recruitment section to hire
                        staff.
                    </div>
                )}
            </div>

            {/* Employee Details Modal */}
            {showDetails && selectedEmployee && (
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
                        title={`${selectedEmployee.name} - Rarity ${selectedEmployee.rarity}`}
                    >
                        <div className="p-5">
                            <div className="flex mb-6">
                                {/* Left Column - Employee Basic Info */}
                                <div className="w-1/2 pr-4">
                                    <div className="flex items-center mb-4">
                                        {/* Placeholder for future sprite */}
                                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mr-4 border-4 border-white shadow-lg">
                                            <span className="text-3xl">👤</span>
                                        </div>

                                        <div>
                                            <div className="flex items-center">
                                                <h3 className="text-xl font-bold text-[color:var(--color-principalBrown)]">
                                                    {selectedEmployee.name}
                                                </h3>
                                                <div className="ml-2 px-2 py-1 bg-[color:var(--color-principalRed)] text-white text-sm font-bold rounded">
                                                    <span>
                                                        Lv.
                                                        {selectedEmployee.level}
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className="mt-1 inline-block"
                                                style={styles.traitBadge(
                                                    selectedEmployee.trait
                                                )}
                                            >
                                                {selectedEmployee.trait}
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
                                                            selectedEmployee.morale ||
                                                                50
                                                        ).label
                                                    }
                                                </span>
                                                <span className="text-sm">
                                                    ({selectedEmployee.morale}
                                                    /100)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center p-2 bg-[color:var(--color-yellowWhite)] rounded-lg">
                                            <span className="font-medium">
                                                Salary:
                                            </span>
                                            <span className="text-red-500 font-medium">
                                                {formatCurrency(
                                                    selectedEmployee.salary
                                                )}
                                            </span>
                                        </div>
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
                                                            selectedEmployee.cuisine
                                                        }
                                                        /200
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedEmployee.cuisine,
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
                                                            selectedEmployee.service
                                                        }
                                                        /200
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedEmployee.service,
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
                                                            selectedEmployee.ambiance
                                                        }
                                                        /200
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedEmployee.ambiance,
                                                            "#8B5CF6"
                                                        )}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Employee Actions - pleine largeur */}
                            <div className="w-full mt-4">
                                <div className="bg-[color:var(--color-yellowWhite)] rounded-lg p-3">
                                    <h4 className="font-bold mb-1 text-[color:var(--color-principalBrown)]">
                                        Available Actions
                                    </h4>
                                    <div className="text-xs text-gray-500 mb-3 italic">
                                        Limited to 1 per employee per period
                                    </div>

                                    <div className="space-y-3">
                                        {/* Gift Action */}
                                        <div className="flex justify-between items-center p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center">
                                                <div className="text-2xl mr-2">
                                                    🎁
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[color:var(--color-principalBrown)]">
                                                        Gift
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        +30 Morale (max 100)
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="mr-2 text-red-500 font-medium">
                                                    {formatCurrency(
                                                        getGiftCost(
                                                            selectedEmployee.rarity
                                                        )
                                                    )}
                                                </span>
                                                <button
                                                    className={`px-3 py-1 rounded text-white font-medium transform transition-transform ${
                                                        (selectedEmployee.morale ||
                                                            0) < 100 &&
                                                        !selectedEmployee
                                                            ?.management
                                                            ?.giftedThisPeriod &&
                                                        funds >=
                                                            getGiftCost(
                                                                selectedEmployee.rarity
                                                            )
                                                            ? "bg-emerald-500 hover:bg-emerald-600 hover:scale-105 active:scale-95"
                                                            : "bg-gray-400 cursor-not-allowed"
                                                    }`}
                                                    onClick={() =>
                                                        handleGift(
                                                            selectedEmployee
                                                        )
                                                    }
                                                    disabled={
                                                        (selectedEmployee.morale ||
                                                            0) >= 100 ||
                                                        selectedEmployee
                                                            ?.management
                                                            ?.giftedThisPeriod ||
                                                        funds <
                                                            getGiftCost(
                                                                selectedEmployee.rarity
                                                            )
                                                    }
                                                >
                                                    Give
                                                </button>
                                            </div>
                                        </div>

                                        {/* Training Action */}
                                        <div className="flex flex-col p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <div className="text-2xl mr-2">
                                                        🧠
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-[color:var(--color-principalBrown)]">
                                                            Training
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Level{" "}
                                                            {
                                                                selectedEmployee.level
                                                            }{" "}
                                                            →{" "}
                                                            {selectedEmployee.level +
                                                                1}{" "}
                                                            (+5 to all skills)
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="mr-2 text-red-500 font-medium">
                                                        {formatCurrency(
                                                            getTrainingCost(
                                                                selectedEmployee.rarity
                                                            )
                                                        )}
                                                    </span>
                                                    <button
                                                        className={`px-3 py-1 rounded text-white font-medium transform transition-transform ${
                                                            !selectedEmployee
                                                                ?.management
                                                                ?.trainedThisPeriod &&
                                                            funds >=
                                                                getTrainingCost(
                                                                    selectedEmployee.rarity
                                                                )
                                                                ? "bg-blue-500 hover:bg-blue-600 hover:scale-105 active:scale-95"
                                                                : "bg-gray-400 cursor-not-allowed"
                                                        }`}
                                                        onClick={() =>
                                                            handleTraining(
                                                                selectedEmployee
                                                            )
                                                        }
                                                        disabled={
                                                            selectedEmployee
                                                                ?.management
                                                                ?.trainedThisPeriod ||
                                                            funds <
                                                                getTrainingCost(
                                                                    selectedEmployee.rarity
                                                                )
                                                        }
                                                    >
                                                        Train
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fire Action */}
                                        <div className="flex justify-between items-center p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center">
                                                <div className="text-2xl mr-2">
                                                    ❌
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[color:var(--color-principalBrown)]">
                                                        Fire
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        25% of salary as
                                                        severance
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="mr-2 text-red-500 font-medium">
                                                    {formatCurrency(
                                                        getFireCost(
                                                            selectedEmployee.salary
                                                        )
                                                    )}
                                                </span>
                                                <button
                                                    className={`px-3 py-1 rounded text-white font-medium transform transition-transform ${
                                                        selectedEmployee.id !==
                                                            74 &&
                                                        selectedEmployee.id !==
                                                            75 &&
                                                        funds >=
                                                            getFireCost(
                                                                selectedEmployee.salary
                                                            )
                                                            ? "bg-red-500 hover:bg-red-600 hover:scale-105 active:scale-95"
                                                            : "bg-gray-400 cursor-not-allowed"
                                                    }`}
                                                    onClick={() =>
                                                        handleFire(
                                                            selectedEmployee
                                                        )
                                                    }
                                                    disabled={
                                                        selectedEmployee.id ===
                                                            74 ||
                                                        selectedEmployee.id ===
                                                            75 ||
                                                        funds <
                                                            getFireCost(
                                                                selectedEmployee.salary
                                                            )
                                                    }
                                                >
                                                    {selectedEmployee.id ===
                                                        74 ||
                                                    selectedEmployee.id === 75
                                                        ? "Protected"
                                                        : "Fire"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* {(selectedEmployee?.management?.trainedThisPeriod ||
                                selectedEmployee?.management
                                    ?.giftedThisPeriod) && (
                                <div className="mt-2 text-center">
                                    <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded">
                                        ⚠️ You have already performed an action
                                        on this employee during this period.
                                    </div>
                                </div>
                            )} */}

                            {errorMessage && (
                                <div className="mt-2 text-center">
                                    <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded">
                                        ⚠️ {errorMessage}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={() => {
                                        setShowDetails(false);
                                        setSelectedEmployee(null);
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

EmployeeManagement.propTypes = {
    onBack: PropTypes.func.isRequired,
};

export default EmployeeManagement;

