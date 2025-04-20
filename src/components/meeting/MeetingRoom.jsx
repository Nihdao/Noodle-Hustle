import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MenuContainer from "../common/MenuContainer";

// Mock data for shareholders
const mockShareholders = [
    {
        id: 1,
        name: "Akio Tanaka",
        title: "Lead Investor",
        portrait: "👨‍💼",
        investmentSize: 2500000,
        trait: "Analytical",
        traitColor: "#3B82F6", // Blue
        description:
            "A data-driven investor who values logical arguments and evidence-based reasoning.",
        nextMeeting: 2, // Periods until next meeting
    },
    {
        id: 2,
        name: "Mei Wong",
        title: "Angel Investor",
        portrait: "👩‍💼",
        investmentSize: 1200000,
        trait: "Authoritative",
        traitColor: "#EF4444", // Red
        description:
            "Expects clear leadership and decisive action. Responds well to confident presentations.",
        nextMeeting: 3,
    },
    {
        id: 3,
        name: "Haruto Sato",
        title: "Venture Capitalist",
        portrait: "👨‍💼",
        investmentSize: 3500000,
        trait: "Empathetic",
        traitColor: "#10B981", // Green
        description:
            "Values the human element in business. Cares about company culture and employee satisfaction.",
        nextMeeting: 1,
    },
    {
        id: 4,
        name: "Yuki Nakamura",
        title: "Corporate Investor",
        portrait: "👩‍💼",
        investmentSize: 5000000,
        trait: "Analytical",
        traitColor: "#3B82F6", // Blue
        description:
            "Focuses on numbers and market trends. Will scrutinize your financial projections carefully.",
        nextMeeting: 4,
    },
];

// Mock data for available employees
const mockAvailableEmployees = [
    {
        id: 1,
        name: "Hiroshi Tanaka",
        level: 3,
        mood: 2,
        trait: "Authoritative",
        traitColor: "#EF4444", // Red
        rarity: "B",
        debateSkill: 65,
        assigned: false,
    },
    {
        id: 2,
        name: "Yuki Sato",
        level: 2,
        mood: 3,
        trait: "Empathetic",
        traitColor: "#10B981", // Green
        rarity: "C",
        debateSkill: 55,
        assigned: false,
    },
    {
        id: 3,
        name: "Kenji Watanabe",
        level: 4,
        mood: 1,
        trait: "Analytical",
        traitColor: "#3B82F6", // Blue
        rarity: "A",
        debateSkill: 85,
        assigned: false,
    },
    {
        id: 4,
        name: "Aiko Yamamoto",
        level: 1,
        mood: 3,
        trait: "Empathetic",
        traitColor: "#10B981", // Green
        rarity: "D",
        debateSkill: 40,
        assigned: false,
    },
    {
        id: 5,
        name: "Takeshi Nakamura",
        level: 5,
        mood: 2,
        trait: "Authoritative",
        traitColor: "#EF4444", // Red
        rarity: "S",
        debateSkill: 90,
        assigned: false,
    },
];

const MeetingRoom = ({ onBack }) => {
    const [shareholders] = useState(mockShareholders);
    const [availableEmployees, setAvailableEmployees] = useState(
        mockAvailableEmployees
    );
    const [selectedTeam, setSelectedTeam] = useState([]);
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
    const [supportGauge] = useState(50); // Default support at 50%
    const [revenueModifier] = useState(5); // Example value between -15 and +15
    const [employeeSatisfaction] = useState(8); // Example value between -15 and +15
    const [juryMood] = useState(12); // Example value between -25 and +25
    const [showTeamModal, setShowTeamModal] = useState(false);

    // Calculate position for the menu container
    useEffect(() => {
        const handleResize = () => {
            const sidebarWidth = window.innerWidth * 0.333;
            const mainAreaWidth = window.innerWidth * 0.667;

            setDetailsPosition({
                x: sidebarWidth + mainAreaWidth / 2,
                y: window.innerHeight / 2,
            });
        };

        // Initial position calculation
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
        kpiCard: {
            padding: "1.5rem",
            backgroundColor: "var(--color-whiteCream)",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            transition: "transform 0.2s ease",
            cursor: "default",
            "&:hover": {
                transform: "translateY(-2px)",
            },
        },
        secretBadge: {
            backgroundColor: "#6B7280",
            color: "white",
            borderRadius: "0.375rem",
            padding: "0.25rem 0.75rem",
            fontSize: "0.875rem",
            fontWeight: "bold",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
        },
        gauge: (value, min, max, color = "#3B82F6") => {
            // Normalize value to 0-100% range
            const normalizedValue = ((value - min) / (max - min)) * 100;
            return {
                width: `${normalizedValue}%`,
                backgroundColor: color,
                height: "0.75rem",
                borderRadius: "9999px",
                transition: "width 0.5s ease",
            };
        },
        employeeCard: (isSelected, trait) => ({
            backgroundColor: isSelected
                ? "rgba(var(--color-principalRed-rgb), 0.1)"
                : "var(--color-whiteCream)",
            borderRadius: "0.5rem",
            padding: "0.75rem",
            cursor: "pointer",
            border: isSelected
                ? "2px solid var(--color-principalRed)"
                : `1px solid ${trait}22`,
            transition: "all 0.2s ease",
            boxShadow: isSelected
                ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                : "0 2px 4px rgba(0, 0, 0, 0.05)",
        }),
        traitBadge: (color) => ({
            backgroundColor: color,
            color: "white",
            borderRadius: "0.25rem",
            padding: "0.125rem 0.375rem",
            fontSize: "0.75rem",
            fontWeight: "bold",
            display: "inline-block",
        }),
        rarityBadge: (rarity) => {
            const colors = {
                S: { bg: "#F59E0B", text: "#FFFFFF" },
                A: { bg: "#8B5CF6", text: "#FFFFFF" },
                B: { bg: "#3B82F6", text: "#FFFFFF" },
                C: { bg: "#10B981", text: "#FFFFFF" },
                D: { bg: "#6B7280", text: "#FFFFFF" },
            };
            return {
                backgroundColor: colors[rarity]?.bg || "#6B7280",
                color: colors[rarity]?.text || "#FFFFFF",
                borderRadius: "0.25rem",
                padding: "0.125rem 0.375rem",
                fontSize: "0.75rem",
                fontWeight: "bold",
                marginLeft: "0.5rem",
            };
        },
        nextMeetingBadge: (periods) => {
            // Color based on urgency
            const getColor = (p) => {
                if (p <= 1) return "#EF4444"; // Red for immediate
                if (p <= 2) return "#F59E0B"; // Orange for soon
                if (p <= 3) return "#10B981"; // Green for later
                return "#6B7280"; // Gray for far future
            };

            return {
                backgroundColor: getColor(periods),
                color: "white",
                borderRadius: "9999px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "auto",
            };
        },
        actionButton: {
            padding: "0.75rem 1.5rem",
            backgroundColor: "var(--color-principalRed)",
            color: "white",
            fontWeight: "bold",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 6px rgba(var(--color-principalRed-rgb), 0.2)",
            "&:hover": {
                backgroundColor: "var(--color-principalRed-light)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 8px rgba(var(--color-principalRed-rgb), 0.3)",
            },
        },
    };

    // Handle selecting an employee for the team
    const handleSelectEmployee = (employee) => {
        // Check if already in team
        if (selectedTeam.some((e) => e.id === employee.id)) {
            // Remove from team
            setSelectedTeam(selectedTeam.filter((e) => e.id !== employee.id));

            // Update available employees
            setAvailableEmployees(
                availableEmployees.map((e) =>
                    e.id === employee.id ? { ...e, assigned: false } : e
                )
            );
        } else if (selectedTeam.length < 3) {
            // Add to team if less than 3 employees selected
            setSelectedTeam([...selectedTeam, employee]);

            // Update available employees
            setAvailableEmployees(
                availableEmployees.map((e) =>
                    e.id === employee.id ? { ...e, assigned: true } : e
                )
            );
        }
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("fr-FR").format(value) + " ¥";
    };

    // Get upcoming shareholders (next meeting)
    const upcomingShareholders = shareholders
        .filter((s) => s.nextMeeting <= 3)
        .sort((a, b) => a.nextMeeting - b.nextMeeting);

    // Get next meeting shareholder (only the first one)
    const nextMeetingShareholder = upcomingShareholders.find(
        (s) => s.nextMeeting === 1
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>Meeting Room</h2>
                <p style={styles.headerSubtitle}>
                    Prepare for Shareholder Showdowns
                </p>
            </div>

            {/* Main content area */}
            <div className="h-full overflow-hidden">
                {/* Left sidebar - Support metrics */}
                <div className="h-full overflow-y-auto border-r border-[color:var(--color-principalBrown)] border-opacity-20 p-4">
                    <h3 className="text-lg font-semibold mb-4 text-[color:var(--color-principalBrown)]">
                        Support Analysis
                    </h3>

                    {/* Overall Support as a large KPI */}
                    <div className="bg-[color:var(--color-whiteCream)] rounded-xl shadow-lg p-5 mb-5 border border-gray-100">
                        <div className="flex items-center mb-2">
                            <div className="text-xl mr-3 bg-blue-100 p-2 rounded-full">
                                📊
                            </div>
                            <h4 className="font-semibold text-[color:var(--color-principalBrown)]">
                                Overall Support
                            </h4>
                        </div>
                        <div className="flex items-end">
                            <div
                                className="text-5xl font-bold mr-2"
                                style={{
                                    color:
                                        supportGauge < 30
                                            ? "#EF4444"
                                            : supportGauge < 60
                                            ? "#F59E0B"
                                            : "#10B981",
                                }}
                            >
                                {supportGauge}%
                            </div>
                            <div className="text-sm text-gray-500 pb-1.5">
                                Base level
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-[color:var(--color-principalBrown)] opacity-70">
                            Base support level is 50%. Influenced by revenue,
                            employee satisfaction, and jury mood.
                        </p>
                    </div>

                    {/* Compact metrics grid */}
                    <div className="grid grid-cols-1 gap-3 mb-5">
                        {/* Revenue Impact */}
                        <div className="bg-[color:var(--color-whiteCream)] rounded-lg shadow-sm p-3 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="text-lg mr-2 bg-green-100 p-1.5 rounded-full">
                                        💰
                                    </div>
                                    <h4 className="font-medium text-sm text-[color:var(--color-principalBrown)]">
                                        Revenue Impact
                                    </h4>
                                </div>
                                <span
                                    className={`text-lg font-bold ${
                                        revenueModifier >= 0
                                            ? "text-emerald-600"
                                            : "text-red-500"
                                    }`}
                                >
                                    {revenueModifier > 0 ? "+" : ""}
                                    {revenueModifier}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 relative overflow-hidden">
                                <div className="absolute top-0 left-1/2 w-0.5 h-1.5 bg-gray-400 -translate-x-1/2 z-10"></div>
                                <div
                                    style={styles.gauge(
                                        revenueModifier,
                                        -15,
                                        15,
                                        revenueModifier >= 0
                                            ? "#10B981"
                                            : "#EF4444"
                                    )}
                                ></div>
                            </div>
                        </div>

                        {/* Employee Satisfaction */}
                        <div className="bg-[color:var(--color-whiteCream)] rounded-lg shadow-sm p-3 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="text-lg mr-2 bg-blue-100 p-1.5 rounded-full">
                                        👥
                                    </div>
                                    <h4 className="font-medium text-sm text-[color:var(--color-principalBrown)]">
                                        Employee Satisfaction
                                    </h4>
                                </div>
                                <span
                                    className={`text-lg font-bold ${
                                        employeeSatisfaction >= 0
                                            ? "text-emerald-600"
                                            : "text-red-500"
                                    }`}
                                >
                                    {employeeSatisfaction > 0 ? "+" : ""}
                                    {employeeSatisfaction}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 relative overflow-hidden">
                                <div className="absolute top-0 left-1/2 w-0.5 h-1.5 bg-gray-400 -translate-x-1/2 z-10"></div>
                                <div
                                    style={styles.gauge(
                                        employeeSatisfaction,
                                        -15,
                                        15,
                                        employeeSatisfaction >= 0
                                            ? "#10B981"
                                            : "#EF4444"
                                    )}
                                ></div>
                            </div>
                        </div>

                        {/* Jury Mood - Secret */}
                        <div className="bg-gray-100 rounded-lg shadow-sm p-3 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="text-lg mr-2 bg-purple-100 p-1.5 rounded-full">
                                        🎭
                                    </div>
                                    <h4 className="font-medium text-sm text-[color:var(--color-principalBrown)]">
                                        Jury Mood
                                    </h4>
                                </div>
                                <div
                                    style={{
                                        ...styles.secretBadge,
                                        padding: "0.15rem 0.5rem",
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="3"
                                            y="11"
                                            width="18"
                                            height="11"
                                            rx="2"
                                            ry="2"
                                        ></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    <span className="text-xs">Secret</span>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-[color:var(--color-principalBrown)] opacity-70">
                                Random factor during Showdowns. Range: -25% to
                                +25%.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Floating MenuContainer for Shareholders */}
                <div
                    className="fixed z-50 w-[450px]"
                    style={{
                        left: `${detailsPosition.x}px`,
                        top: `${detailsPosition.y}px`,
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <MenuContainer
                        animationState="visible"
                        className="w-full"
                        scrollable={true}
                        title="Shareholder Showdown Preparation"
                    >
                        <div className="p-4">
                            {/* Next Meeting Shareholder */}
                            <div className="mb-6">
                                <h3 className="text-[color:var(--color-principalBrown)] font-semibold mb-3 flex items-center">
                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full mr-2">
                                        NEXT PERIOD
                                    </span>
                                    <span>Upcoming Shareholder</span>
                                </h3>

                                {nextMeetingShareholder ? (
                                    <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                                        <div className="flex items-start">
                                            <div className="text-3xl mr-3 bg-gray-100 rounded-full h-14 w-14 flex items-center justify-center">
                                                {
                                                    nextMeetingShareholder.portrait
                                                }
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <span className="font-semibold text-[color:var(--color-principalBrown)]">
                                                        {
                                                            nextMeetingShareholder.name
                                                        }
                                                    </span>
                                                    <span
                                                        style={styles.traitBadge(
                                                            nextMeetingShareholder.traitColor
                                                        )}
                                                        className="ml-2"
                                                    >
                                                        {
                                                            nextMeetingShareholder.trait
                                                        }
                                                    </span>
                                                </div>
                                                <div className="text-sm text-[color:var(--color-principalBrown)] opacity-80 mt-1">
                                                    {
                                                        nextMeetingShareholder.title
                                                    }{" "}
                                                    •{" "}
                                                    {formatCurrency(
                                                        nextMeetingShareholder.investmentSize
                                                    )}
                                                </div>
                                                <p className="mt-2 text-sm text-[color:var(--color-principalBrown)]">
                                                    {
                                                        nextMeetingShareholder.description
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 italic text-gray-500 bg-gray-50 rounded-lg">
                                        No upcoming meetings for the next period
                                    </div>
                                )}
                            </div>

                            {/* Current Team Section */}
                            <div className="mb-6">
                                <h3 className="text-[color:var(--color-principalBrown)] font-semibold mb-3 flex justify-between items-center">
                                    <span>Your Debate Team</span>
                                    <span className="text-sm text-gray-500">
                                        {selectedTeam.length}/3
                                    </span>
                                </h3>

                                {selectedTeam.length > 0 ? (
                                    <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm">
                                        {selectedTeam.map((employee) => (
                                            <div
                                                key={employee.id}
                                                className="flex items-center p-2 bg-gray-50 rounded-md"
                                            >
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                                    <span className="text-base">
                                                        👤
                                                    </span>
                                                </div>
                                                <div className="ml-2 flex-1">
                                                    <div className="flex items-center">
                                                        <span
                                                            className="font-medium text-sm"
                                                            style={{
                                                                color: employee.traitColor,
                                                            }}
                                                        >
                                                            {employee.name}
                                                        </span>
                                                        <span
                                                            style={{
                                                                ...styles.traitBadge(
                                                                    employee.traitColor
                                                                ),
                                                                fontSize:
                                                                    "0.65rem",
                                                                padding:
                                                                    "0.1rem 0.25rem",
                                                            }}
                                                            className="ml-1"
                                                        >
                                                            {employee.trait}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-md">
                                                    Lv.{employee.level}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-3 italic text-gray-500 bg-gray-50 rounded-lg">
                                        No team members selected yet
                                    </div>
                                )}
                            </div>

                            {/* Team selection button */}
                            <button
                                className="w-full py-3 px-4 bg-[color:var(--color-principalRed)] text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:bg-[color:var(--color-principalRed-light)] transition-all"
                                onClick={() => setShowTeamModal(true)}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                {selectedTeam.length > 0
                                    ? "Edit Debate Team"
                                    : "Get Your Team"}
                            </button>
                        </div>
                    </MenuContainer>
                </div>
            </div>

            {/* Team Selection Modal */}
            {showTeamModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                    <div className="bg-[color:var(--color-yellowWhite)] rounded-xl shadow-xl w-[700px] max-h-[80vh] overflow-hidden">
                        <div className="p-4 bg-[color:var(--color-principalBrown)] text-white flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                                Select Your Debate Team
                            </h3>
                            <button
                                className="text-white hover:text-gray-200"
                                onClick={() => setShowTeamModal(false)}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
                            <div className="p-4">
                                {/* Condensed Trait Relationship Diagram */}
                                <div className="bg-white p-3 rounded-lg mb-4 shadow-sm">
                                    <h4 className="font-semibold mb-2 text-[color:var(--color-principalBrown)] text-sm">
                                        Shareholder Psychology
                                    </h4>
                                    <div className="flex items-center justify-center">
                                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg text-xs">
                                            <span className="px-2 py-1 bg-[#3B82F6] text-white rounded font-medium">
                                                Analytical
                                            </span>
                                            <span>→</span>
                                            <span className="px-2 py-1 bg-[#10B981] text-white rounded font-medium">
                                                Empathetic
                                            </span>
                                            <span>→</span>
                                            <span className="px-2 py-1 bg-[#EF4444] text-white rounded font-medium">
                                                Authoritative
                                            </span>
                                            <span>→</span>
                                            <span className="px-2 py-1 bg-[#3B82F6] text-white rounded font-medium">
                                                Analytical
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Team selection */}
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-[color:var(--color-principalBrown)]">
                                            Available Employees
                                        </h4>
                                        <span className="text-sm font-medium text-[color:var(--color-principalBrown)]">
                                            {selectedTeam.length}/3 Selected
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {selectedTeam.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md">
                                                {selectedTeam.map(
                                                    (employee) => (
                                                        <div
                                                            key={employee.id}
                                                            className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm"
                                                        >
                                                            <span
                                                                className="mr-1 text-sm font-medium"
                                                                style={{
                                                                    color: employee.traitColor,
                                                                }}
                                                            >
                                                                {employee.name}
                                                            </span>
                                                            <button
                                                                className="text-gray-500 hover:text-red-500 transition-colors"
                                                                onClick={() =>
                                                                    handleSelectEmployee(
                                                                        employee
                                                                    )
                                                                }
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center p-2 bg-gray-50 rounded-md text-gray-500 italic text-sm">
                                                No team members selected yet
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {availableEmployees.map((employee) => (
                                            <div
                                                key={employee.id}
                                                style={styles.employeeCard(
                                                    employee.assigned,
                                                    employee.traitColor
                                                )}
                                                className={`relative hover:shadow-md transition-all ${
                                                    selectedTeam.length >= 3 &&
                                                    !employee.assigned
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : "cursor-pointer"
                                                }`}
                                                onClick={() =>
                                                    selectedTeam.length < 3 ||
                                                    employee.assigned
                                                        ? handleSelectEmployee(
                                                              employee
                                                          )
                                                        : null
                                                }
                                            >
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                                        <span className="text-xl">
                                                            👤
                                                        </span>
                                                    </div>
                                                    <div className="ml-2">
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-[color:var(--color-principalBrown)]">
                                                                {employee.name}
                                                            </span>
                                                            <span
                                                                style={styles.rarityBadge(
                                                                    employee.rarity
                                                                )}
                                                            >
                                                                {
                                                                    employee.rarity
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center mt-1">
                                                            <span
                                                                style={styles.traitBadge(
                                                                    employee.traitColor
                                                                )}
                                                                className="text-xs"
                                                            >
                                                                {employee.trait}
                                                            </span>
                                                            <span className="ml-2 text-xs text-[color:var(--color-principalBrown)]">
                                                                Debate:{" "}
                                                                {
                                                                    employee.debateSkill
                                                                }
                                                                /100
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t flex justify-end">
                            <button
                                className="mr-3 px-4 py-2 border border-gray-300 rounded text-[color:var(--color-principalBrown)] bg-white hover:bg-gray-50"
                                onClick={() => setShowTeamModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-[color:var(--color-principalRed)] text-white rounded font-medium hover:bg-[color:var(--color-principalRed-light)]"
                                onClick={() => setShowTeamModal(false)}
                            >
                                Confirm Team
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
        </div>
    );
};

MeetingRoom.propTypes = {
    onBack: PropTypes.func.isRequired,
};

export default MeetingRoom;

