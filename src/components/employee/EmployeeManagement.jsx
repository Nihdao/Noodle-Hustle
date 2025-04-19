import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MenuContainer from "../common/MenuContainer";

// Mock data - à remplacer par des données réelles plus tard
const mockEmployees = [
    {
        id: 1,
        name: "Hiroshi Tanaka",
        level: 3,
        mood: 2,
        trait: "Authoritative",
        rarity: "B",
        salary: 4500,
        skills: {
            cooking: 78,
            service: 45,
            management: 65,
            debate: 60,
        },
        debateStats: {
            trait: "Assertive",
            interventionCost: 35,
            relevance: 72,
            repartee: 68,
        },
        description:
            "Experienced chef with good management skills. Specializes in traditional ramen.",
        assigned: "Noodles Original",
    },
    {
        id: 2,
        name: "Yuki Sato",
        level: 2,
        mood: 3,
        trait: "Empathetic",
        rarity: "C",
        salary: 3200,
        skills: {
            cooking: 35,
            service: 80,
            management: 40,
            debate: 55,
        },
        debateStats: {
            trait: "Diplomatic",
            interventionCost: 25,
            relevance: 65,
            repartee: 42,
        },
        description:
            "Friendly service staff with excellent customer relation skills.",
        assigned: "Noodles Original",
    },
    {
        id: 3,
        name: "Kenji Watanabe",
        level: 4,
        mood: 1,
        trait: "Analytical",
        rarity: "A",
        salary: 6800,
        skills: {
            cooking: 50,
            service: 65,
            management: 90,
            debate: 85,
        },
        debateStats: {
            trait: "Logical",
            interventionCost: 45,
            relevance: 88,
            repartee: 79,
        },
        description:
            "Top-tier manager who can increase the efficiency of the entire restaurant.",
        assigned: "Ramen Haven",
    },
    {
        id: 4,
        name: "Aiko Yamamoto",
        level: 1,
        mood: 3,
        trait: "Empathetic",
        rarity: "D",
        salary: 2500,
        skills: {
            cooking: 60,
            service: 30,
            management: 20,
            debate: 40,
        },
        debateStats: {
            trait: "Reflective",
            interventionCost: 20,
            relevance: 35,
            repartee: 30,
        },
        description: "Novice chef with potential. Eager to learn and improve.",
        assigned: "Ramen Haven",
    },
    {
        id: 5,
        name: "Takeshi Nakamura",
        level: 5,
        mood: 2,
        trait: "Authoritative",
        rarity: "S",
        salary: 9500,
        skills: {
            cooking: 95,
            service: 70,
            management: 85,
            debate: 75,
        },
        debateStats: {
            trait: "Commanding",
            interventionCost: 60,
            relevance: 82,
            repartee: 77,
        },
        description:
            "Legendary chef whose ramen recipes are sought across Japan.",
        assigned: "Ramen Royale",
    },
    {
        id: 6,
        name: "Sakura Ito",
        level: 2,
        mood: 2,
        trait: "Empathetic",
        rarity: "C",
        salary: 3000,
        skills: {
            cooking: 25,
            service: 75,
            management: 35,
            debate: 50,
        },
        debateStats: {
            trait: "Sympathetic",
            interventionCost: 22,
            relevance: 58,
            repartee: 45,
        },
        description:
            "Attentive service staff who ensures customers have a pleasant experience.",
        assigned: null,
    },
    {
        id: 7,
        name: "Ryu Kobayashi",
        level: 3,
        mood: 1,
        trait: "Analytical",
        rarity: "B",
        salary: 5200,
        skills: {
            cooking: 30,
            service: 60,
            management: 80,
            debate: 70,
        },
        debateStats: {
            trait: "Strategic",
            interventionCost: 40,
            relevance: 75,
            repartee: 65,
        },
        description:
            "Efficient manager who excels at optimizing restaurant operations.",
        assigned: null,
    },
];

const EmployeeManagement = ({ onBack, laborCost, funds = 50000 }) => {
    const [employees, setEmployees] = useState(mockEmployees);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
    const [showDetails, setShowDetails] = useState(false);
    const [actionPerformed, setActionPerformed] = useState(false);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("fr-FR").format(value) + " ¥";
    };

    // Mood emojis mapping
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

    // Calcul des coûts d'action basés sur l'employé
    const getGiftCost = (rarity) => {
        const costsMap = {
            D: 500,
            C: 1000,
            B: 1500,
            A: 2000,
            S: 3000,
        };
        return costsMap[rarity] || 1000;
    };

    const getTrainingCost = (rarity, level) => {
        const rarityMultiplier = {
            D: 500,
            C: 800,
            B: 1200,
            A: 1800,
            S: 2500,
        };
        return (rarityMultiplier[rarity] || 1000) * level;
    };

    const getFireCost = (salary) => {
        return Math.round(salary * 0.25);
    };

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
        if (employee.mood >= 3 || actionPerformed) return;

        const cost = getGiftCost(employee.rarity);
        if (cost > funds) return;

        // Update employee mood
        const updatedEmployees = employees.map((emp) =>
            emp.id === employee.id
                ? { ...emp, mood: Math.min(emp.mood + 1, 3) }
                : emp
        );

        setEmployees(updatedEmployees);
        setSelectedEmployee({
            ...employee,
            mood: Math.min(employee.mood + 1, 3),
        });
        setActionPerformed(true);
    };

    const handleTraining = (employee) => {
        if (actionPerformed) return;

        const cost = getTrainingCost(employee.rarity, employee.level);
        if (cost > funds) return;

        // Update employee level
        const updatedEmployees = employees.map((emp) =>
            emp.id === employee.id ? { ...emp, level: emp.level + 1 } : emp
        );

        setEmployees(updatedEmployees);
        setSelectedEmployee({ ...employee, level: employee.level + 1 });
        setActionPerformed(true);
    };

    const handleFire = (employee) => {
        if (actionPerformed) return;

        const cost = getFireCost(employee.salary);
        if (cost > funds) return;

        // Remove employee
        const updatedEmployees = employees.filter(
            (emp) => emp.id !== employee.id
        );

        setEmployees(updatedEmployees);
        setSelectedEmployee(null);
        setShowDetails(false);
        setActionPerformed(true);
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
        actionButton: (enabled, type) => {
            const colors = {
                gift: { bg: "#10B981", hoverBg: "#059669" },
                training: { bg: "#3B82F6", hoverBg: "#2563EB" },
                fire: { bg: "#EF4444", hoverBg: "#DC2626" },
            };
            return {
                backgroundColor: enabled ? colors[type]?.bg : "#9CA3AF",
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
                ":hover": {
                    backgroundColor: enabled
                        ? colors[type]?.hoverBg
                        : "#9CA3AF",
                },
            };
        },
        skillBar: (value, color) => ({
            width: `${value}%`,
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
                    <div className="flex items-center">
                        <span className="font-medium text-[color:var(--color-principalBrown)]">
                            Available Funds:{" "}
                        </span>
                        <span className="ml-2 text-lg font-semibold text-emerald-600">
                            {formatCurrency(funds)}
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
                        const moodInfo = getMoodEmoji(employee.mood);
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
                                        <div className="mt-2 flex  justify-center items-center text-xs">
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
                        title={`${selectedEmployee.name} - ${selectedEmployee.trait} ${selectedEmployee.rarity}`}
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
                                        <div className="flex justify-between items-center p-2 bg-[color:var(--color-yellowWhite)] rounded-lg">
                                            <span className="font-medium">
                                                Mood:
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-2xl"
                                                    style={{
                                                        color: getMoodEmoji(
                                                            selectedEmployee.mood
                                                        ).color,
                                                    }}
                                                >
                                                    {
                                                        getMoodEmoji(
                                                            selectedEmployee.mood
                                                        ).emoji
                                                    }
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {
                                                        getMoodEmoji(
                                                            selectedEmployee.mood
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
                                                    selectedEmployee.salary
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Employee Actions */}
                                    <div className="mt-4 bg-[color:var(--color-yellowWhite)] rounded-lg p-3">
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
                                                            +1 Mood (max 3)
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
                                                            selectedEmployee.mood <
                                                                3 &&
                                                            !actionPerformed &&
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
                                                            selectedEmployee.mood >=
                                                                3 ||
                                                            actionPerformed ||
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
                                                                    1}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="mr-2 text-red-500 font-medium">
                                                            {formatCurrency(
                                                                getTrainingCost(
                                                                    selectedEmployee.rarity,
                                                                    selectedEmployee.level
                                                                )
                                                            )}
                                                        </span>
                                                        <button
                                                            className={`px-3 py-1 rounded text-white font-medium transform transition-transform ${
                                                                !actionPerformed &&
                                                                funds >=
                                                                    getTrainingCost(
                                                                        selectedEmployee.rarity,
                                                                        selectedEmployee.level
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
                                                                actionPerformed ||
                                                                funds <
                                                                    getTrainingCost(
                                                                        selectedEmployee.rarity,
                                                                        selectedEmployee.level
                                                                    )
                                                            }
                                                        >
                                                            Train
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Training Progress Bar */}
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{
                                                                width: "100%",
                                                                backgroundColor:
                                                                    "var(--color-principalRed)",
                                                                opacity: 0.7,
                                                            }}
                                                        ></div>
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
                                                            !actionPerformed &&
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
                                                            actionPerformed ||
                                                            funds <
                                                                getFireCost(
                                                                    selectedEmployee.salary
                                                                )
                                                        }
                                                    >
                                                        Fire
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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
                                                            selectedEmployee
                                                                .skills.cooking
                                                        }
                                                        /100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedEmployee
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
                                                            selectedEmployee
                                                                .skills.service
                                                        }
                                                        /100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedEmployee
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
                                                            selectedEmployee
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
                                                            selectedEmployee
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
                                                        selectedEmployee
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
                                                        selectedEmployee
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
                                                            selectedEmployee
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
                                                            selectedEmployee
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
                                                            selectedEmployee
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
                                                            selectedEmployee
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
                                                            selectedEmployee
                                                                .skills.debate
                                                        }
                                                        /100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={styles.skillBar(
                                                            selectedEmployee
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

                            {actionPerformed && (
                                <div className="mt-2 text-center">
                                    <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded">
                                        ⚠️ You have already performed an action
                                        on this employee during this period.
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
    laborCost: PropTypes.number.isRequired,
    funds: PropTypes.number,
};

export default EmployeeManagement;

