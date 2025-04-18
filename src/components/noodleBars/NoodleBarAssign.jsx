import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MenuContainer from "../common/MenuContainer";
import RestaurantSlot from "./components/RestaurantSlot";
import RestaurantPreview from "./components/RestaurantPreview";
import ConfirmationModal from "./components/ConfirmationModal";
import {
    mockNoodleBars,
    mockEmployees,
    mockRestaurantSlots,
} from "./constants/noodleBarConstants";
import {
    formatCurrency,
    getTotalStat,
    getAvailableSlots,
    getSlotStatus,
    getNextRankUnlock,
} from "./utils/restaurantUtils";

const NoodleBarAssign = ({ onBack, playerRank = 200 }) => {
    const [selectedBar, setSelectedBar] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
    const [hoveredBar, setHoveredBar] = useState(null);
    const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
    const [allEmployees, setAllEmployees] = useState([...mockEmployees]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [employeeToReassign, setEmployeeToReassign] = useState(null);
    const [noodleBars, setNoodleBars] = useState([...mockNoodleBars]);
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [restaurantSlots, setRestaurantSlots] = useState([
        ...mockRestaurantSlots,
    ]);

    // Styles similar to HubComponent for consistency
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
        employeeCard: (isAssigned) => ({
            padding: "0.75rem",
            borderRadius: "0.375rem",
            backgroundColor: isAssigned
                ? "rgba(209, 213, 219, 0.5)"
                : "var(--color-whiteCream)",
            border: isAssigned
                ? "1px solid #9CA3AF"
                : "1px solid var(--color-principalBrown)",
            opacity: isAssigned ? 0.7 : 1,
            transition: "all 0.2s ease",
        }),
        employeeType: (type) => {
            const colors = {
                S: { bg: "#F59E0B", text: "#FFFFFF" },
                A: { bg: "#EF4444", text: "#FFFFFF" },
                B: { bg: "#3B82F6", text: "#FFFFFF" },
                C: { bg: "#10B981", text: "#FFFFFF" },
                D: { bg: "#6B7280", text: "#FFFFFF" },
            };

            return {
                backgroundColor: colors[type]?.bg || "#6B7280",
                color: colors[type]?.text || "#FFFFFF",
                padding: "0 0.375rem",
                borderRadius: "0.25rem",
                fontSize: "0.75rem",
                fontWeight: "bold",
            };
        },
    };

    const handleMouseEnter = (bar, event) => {
        if (!bar.unlocked) return;

        setHoveredBar(bar);
        const rect = event.currentTarget.getBoundingClientRect();
        setPreviewPosition({
            x: rect.right + 20,
            y: rect.top + window.scrollY,
        });
    };

    const handleMouseLeave = () => {
        setHoveredBar(null);
    };

    const handleSelectBar = (bar) => {
        if (!bar.unlocked) return;

        setSelectedBar(bar);
        setShowDetails(true);

        // Calculate the position for the modal to appear in the right side
        const sidebarWidth = window.innerWidth * 0.333; // 33.333% of the window width
        const mainAreaWidth = window.innerWidth * 0.667; // 66.667% of the window width

        setDetailsPosition({
            x: sidebarWidth + mainAreaWidth / 2,
            y: window.innerHeight / 2,
        });
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
        setTimeout(() => setSelectedBar(null), 500);
    };

    // Add event listener for window resize
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

    const handleAssignEmployee = (employee) => {
        // Since we have just one restaurant, we'll assign to "Noodles Original"
        const targetBar = noodleBars[0].name;

        // If the restaurant's staff is already full, don't proceed
        if (noodleBars[0].currentStaff.length >= noodleBars[0].staffSlots) {
            return;
        }

        if (employee.assigned && employee.assigned !== targetBar) {
            // Show confirmation modal if employee is already assigned elsewhere
            setEmployeeToReassign({
                employee,
                targetBar: targetBar,
            });
            setShowConfirmation(true);
            return;
        }

        // If employee is not assigned or already assigned to this restaurant, proceed
        if (!employee.assigned || employee.assigned === targetBar) {
            assignEmployee(employee, targetBar);
        }
    };

    const assignEmployee = (employee, barName) => {
        // Update the employee's assignment
        const updatedEmployees = allEmployees.map((emp) =>
            emp.id === employee.id ? { ...emp, assigned: barName } : emp
        );

        // Update the shop's staff
        const updatedBars = noodleBars.map((bar) => {
            if (bar.name === barName) {
                // Don't add if staff is already full
                if (bar.currentStaff.length >= bar.staffSlots) {
                    return bar;
                }

                // Check if employee is already in this bar
                if (
                    bar.currentStaff.some((staff) => staff.id === employee.id)
                ) {
                    return bar;
                }

                return {
                    ...bar,
                    currentStaff: [...bar.currentStaff, employee],
                    forecastedProfit:
                        bar.forecastedProfit + employee.cuisine * 100,
                };
            }

            return bar;
        });

        // Update restaurant slots to reflect changes
        const updatedSlots = restaurantSlots.map((slot) => {
            if (
                slot.barId &&
                updatedBars.find((bar) => bar.id === slot.barId)
            ) {
                const bar = updatedBars.find((bar) => bar.id === slot.barId);
                return {
                    ...slot,
                    name: bar.name,
                };
            }
            return slot;
        });

        setAllEmployees(updatedEmployees);
        setNoodleBars(updatedBars);
        setRestaurantSlots(updatedSlots);

        // Update the selected bar to reflect changes
        if (selectedBar) {
            const updatedSelectedBar = updatedBars.find(
                (bar) => bar.id === selectedBar.id
            );
            setSelectedBar(updatedSelectedBar);
        }

        // Clear confirmation modal
        setShowConfirmation(false);
        setEmployeeToReassign(null);
    };

    const handleRemoveEmployee = (employeeId) => {
        // Find the employee
        const employee = allEmployees.find((emp) => emp.id === employeeId);

        if (!employee) return;

        // Update employee's assignment
        const updatedEmployees = allEmployees.map((emp) =>
            emp.id === employeeId ? { ...emp, assigned: null } : emp
        );

        // Update the shop's staff
        const updatedBars = noodleBars.map((bar) => {
            if (bar.name === selectedBar.name) {
                return {
                    ...bar,
                    currentStaff: bar.currentStaff.filter(
                        (staff) => staff.id !== employeeId
                    ),
                    forecastedProfit: Math.max(
                        0,
                        bar.forecastedProfit - employee.cuisine * 80
                    ),
                };
            }
            return bar;
        });

        // Update restaurant slots to reflect changes
        const updatedSlots = restaurantSlots.map((slot) => {
            if (
                slot.barId &&
                updatedBars.find((bar) => bar.id === slot.barId)
            ) {
                const bar = updatedBars.find((bar) => bar.id === slot.barId);
                return {
                    ...slot,
                    name: bar.name,
                };
            }
            return slot;
        });

        setAllEmployees(updatedEmployees);
        setNoodleBars(updatedBars);
        setRestaurantSlots(updatedSlots);

        // Update the selected bar to reflect changes
        const updatedSelectedBar = updatedBars.find(
            (bar) => bar.id === selectedBar.id
        );
        setSelectedBar(updatedSelectedBar);
    };

    // Calculate number of available slots
    const availableSlots = getAvailableSlots(playerRank);
    const nextRankUnlock = getNextRankUnlock(playerRank);

    // Handle confirmation actions
    const handleConfirmReassignment = () => {
        if (employeeToReassign) {
            assignEmployee(
                employeeToReassign.employee,
                employeeToReassign.targetBar
            );
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>Assign Employee</h2>
                <p style={styles.headerSubtitle}>
                    Select a noodle bar to manage staff assignments
                </p>
            </div>

            {/* Restaurant Slots Section */}
            <div className="border-b border-[color:var(--color-principalBrown)] border-opacity-20 p-4">
                <h3
                    className="text-lg font-semibold mb-3"
                    style={{ color: "var(--color-principalBrown)" }}
                >
                    Restaurant Slots (
                    {restaurantSlots.filter((slot) => slot.purchased).length}/
                    {availableSlots})
                </h3>

                <div className="flex flex-col gap-3">
                    {restaurantSlots.map((slot, index) => {
                        const status = getSlotStatus(index, availableSlots);
                        const bar = slot.barId
                            ? noodleBars.find((b) => b.id === slot.barId)
                            : null;
                        const isHovered =
                            hoveredBar && bar && hoveredBar.id === bar.id;

                        return (
                            <RestaurantSlot
                                key={slot.id}
                                slot={slot}
                                status={status}
                                index={index}
                                bar={bar}
                                isHovered={isHovered}
                                formatCurrency={formatCurrency}
                                onSelect={handleSelectBar}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            />
                        );
                    })}
                </div>

                {nextRankUnlock && (
                    <p
                        className="mt-3 text-sm italic"
                        style={{
                            color: "var(--color-principalBrown)",
                            opacity: 0.8,
                        }}
                    >
                        Reach rank {nextRankUnlock} to unlock your next
                        restaurant slot!
                    </p>
                )}
            </div>

            {/* Hover preview */}
            <RestaurantPreview
                restaurant={hoveredBar}
                position={previewPosition}
                formatCurrency={formatCurrency}
                getTotalStat={getTotalStat}
            />

            {/* Full employee management modal */}
            {showDetails && selectedBar && (
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
                        className="w-[750px] max-h-[80vh]"
                        scrollable={true}
                        maxHeight="80vh"
                        title={selectedBar.name}
                    >
                        <div className="p-4">
                            <div className="flex justify-between mb-4 items-center">
                                <p className="italic text-[color:var(--color-principalBrown)] opacity-70">
                                    {selectedBar.description}
                                </p>
                                <button
                                    onClick={handleCloseDetails}
                                    className="text-[color:var(--color-principalRed)] hover:text-[color:var(--color-principalRed-light)] transition-colors p-1"
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
                                        <line
                                            x1="18"
                                            y1="6"
                                            x2="6"
                                            y2="18"
                                        ></line>
                                        <line
                                            x1="6"
                                            y1="6"
                                            x2="18"
                                            y2="18"
                                        ></line>
                                    </svg>
                                </button>
                            </div>

                            {/* Two-column layout */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Left column - Current staff */}
                                <div>
                                    <h3
                                        className="text-xl font-semibold mb-3"
                                        style={{
                                            color: "var(--color-principalBrown)",
                                        }}
                                    >
                                        Current Staff (
                                        {selectedBar.currentStaff.length}/
                                        {selectedBar.staffSlots})
                                    </h3>

                                    <div className="grid gap-2 mb-4">
                                        {Array.from({
                                            length: selectedBar.staffSlots,
                                        }).map((_, index) => {
                                            const employee =
                                                selectedBar.currentStaff[index];
                                            return (
                                                <div
                                                    key={index}
                                                    className={`
                                                        rounded-lg p-2 border transition-all duration-200
                                                        ${
                                                            employee
                                                                ? "border-[color:var(--color-principalBrown)] bg-[color:var(--color-yellowWhite)] bg-opacity-30"
                                                                : "border-dashed border-gray-400 bg-gray-100 flex items-center justify-center h-16"
                                                        }
                                                    `}
                                                >
                                                    {employee ? (
                                                        <div className="relative grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                                                            {/* Employee type badge */}
                                                            <div
                                                                className={`
                                                                w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                                                                ${
                                                                    employee.type ===
                                                                    "A"
                                                                        ? "bg-red-500"
                                                                        : employee.type ===
                                                                          "B"
                                                                        ? "bg-blue-500"
                                                                        : employee.type ===
                                                                          "C"
                                                                        ? "bg-green-500"
                                                                        : employee.type ===
                                                                          "D"
                                                                        ? "bg-gray-500"
                                                                        : "bg-yellow-500"
                                                                }
                                                            `}
                                                            >
                                                                {employee.type}
                                                            </div>

                                                            {/* Employee info */}
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center">
                                                                    <span className="font-bold text-[color:var(--color-principalBrown)]">
                                                                        {
                                                                            employee.name
                                                                        }
                                                                    </span>
                                                                    <span className="ml-2 text-xs text-[color:var(--color-principalBrown)] opacity-70">
                                                                        Lv.
                                                                        {
                                                                            employee.level
                                                                        }
                                                                        /5
                                                                    </span>
                                                                </div>

                                                                {/* Stats in a single row */}
                                                                <div className="flex gap-2 text-xs text-[color:var(--color-principalBrown)]">
                                                                    <span>
                                                                        🍜{" "}
                                                                        {
                                                                            employee.cuisine
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        💖{" "}
                                                                        {
                                                                            employee.service
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        🎭{" "}
                                                                        {
                                                                            employee.ambiance
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Remove button */}
                                                            <button
                                                                className="text-red-500 hover:text-red-700"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveEmployee(
                                                                        employee.id
                                                                    );
                                                                }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-5 w-5"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                color: "var(--color-principalBrown)",
                                                                opacity: 0.5,
                                                            }}
                                                        >
                                                            Empty Slot
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-6">
                                        <h3
                                            className="text-lg font-semibold mb-3"
                                            style={{
                                                color: "var(--color-principalBrown)",
                                            }}
                                        >
                                            Performance Stats
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-sm">
                                                    <span
                                                        style={{
                                                            color: "var(--color-principalBrown)",
                                                        }}
                                                    >
                                                        💴 Sales Volume (lv.
                                                        1/10)
                                                    </span>
                                                    <span className="text-emerald-600 font-semibold">
                                                        {formatCurrency(
                                                            selectedBar.forecastedProfit
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full mt-1">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${
                                                                (1 /
                                                                    selectedBar.maxSales) *
                                                                100
                                                            }%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-sm">
                                                    <span
                                                        style={{
                                                            color: "var(--color-principalBrown)",
                                                        }}
                                                    >
                                                        🍱 Cuisine (lv. 1/10)
                                                    </span>
                                                    <span className="flex">
                                                        <span
                                                            className={`px-1 ${
                                                                getTotalStat(
                                                                    selectedBar.currentStaff,
                                                                    "cuisine"
                                                                ) >= 40
                                                                    ? "text-emerald-600"
                                                                    : "text-red-500"
                                                            }`}
                                                        >
                                                            {getTotalStat(
                                                                selectedBar.currentStaff,
                                                                "cuisine"
                                                            )}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            /40
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full mt-1">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            getTotalStat(
                                                                selectedBar.currentStaff,
                                                                "cuisine"
                                                            ) >= 40
                                                                ? "bg-emerald-500"
                                                                : "bg-red-500"
                                                        }`}
                                                        style={{
                                                            width: `${Math.min(
                                                                (getTotalStat(
                                                                    selectedBar.currentStaff,
                                                                    "cuisine"
                                                                ) /
                                                                    40) *
                                                                    100,
                                                                100
                                                            )}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-sm">
                                                    <span
                                                        style={{
                                                            color: "var(--color-principalBrown)",
                                                        }}
                                                    >
                                                        💖 Service (lv. 1/10)
                                                    </span>
                                                    <span className="flex">
                                                        <span
                                                            className={`px-1 ${
                                                                getTotalStat(
                                                                    selectedBar.currentStaff,
                                                                    "service"
                                                                ) >= 20
                                                                    ? "text-emerald-600"
                                                                    : "text-red-500"
                                                            }`}
                                                        >
                                                            {getTotalStat(
                                                                selectedBar.currentStaff,
                                                                "service"
                                                            )}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            /20
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full mt-1">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            getTotalStat(
                                                                selectedBar.currentStaff,
                                                                "service"
                                                            ) >= 20
                                                                ? "bg-emerald-500"
                                                                : "bg-red-500"
                                                        }`}
                                                        style={{
                                                            width: `${Math.min(
                                                                (getTotalStat(
                                                                    selectedBar.currentStaff,
                                                                    "service"
                                                                ) /
                                                                    20) *
                                                                    100,
                                                                100
                                                            )}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-sm">
                                                    <span
                                                        style={{
                                                            color: "var(--color-principalBrown)",
                                                        }}
                                                    >
                                                        🎭 Ambiance (lv. 1/10)
                                                    </span>
                                                    <span className="flex">
                                                        <span
                                                            className={`px-1 ${
                                                                getTotalStat(
                                                                    selectedBar.currentStaff,
                                                                    "ambiance"
                                                                ) >= 10
                                                                    ? "text-emerald-600"
                                                                    : "text-red-500"
                                                            }`}
                                                        >
                                                            {getTotalStat(
                                                                selectedBar.currentStaff,
                                                                "ambiance"
                                                            )}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            /10
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full mt-1">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            getTotalStat(
                                                                selectedBar.currentStaff,
                                                                "ambiance"
                                                            ) >= 10
                                                                ? "bg-emerald-500"
                                                                : "bg-red-500"
                                                        }`}
                                                        style={{
                                                            width: `${Math.min(
                                                                (getTotalStat(
                                                                    selectedBar.currentStaff,
                                                                    "ambiance"
                                                                ) /
                                                                    10) *
                                                                    100,
                                                                100
                                                            )}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right column - Available employees */}
                                <div>
                                    <h3
                                        className="text-xl font-semibold mb-3"
                                        style={{
                                            color: "var(--color-principalBrown)",
                                        }}
                                    >
                                        Available Employees
                                    </h3>

                                    {/* Search input */}
                                    <div className="mb-3 relative">
                                        <input
                                            type="text"
                                            placeholder="Search employees..."
                                            className="w-full py-2 px-3 rounded border border-[color:var(--color-yellowWhite-dark)] bg-[color:var(--color-whiteCream)] text-[color:var(--color-principalBrown)]"
                                            onChange={(e) => {
                                                // In real implementation, you'd filter employees here
                                                console.log(
                                                    "Search:",
                                                    e.target.value
                                                );
                                            }}
                                        />
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 absolute right-3 top-2.5 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>

                                    {/* Filter tabs */}
                                    <div className="flex mb-3 border-b border-[color:var(--color-yellowWhite-dark)]">
                                        <button className="py-2 px-4 border-b-2 border-[color:var(--color-principalRed)] text-[color:var(--color-principalRed)] font-medium">
                                            All
                                        </button>
                                        <button className="py-2 px-4 text-gray-500 hover:text-[color:var(--color-principalBrown)]">
                                            Available
                                        </button>
                                        <button className="py-2 px-4 text-gray-500 hover:text-[color:var(--color-principalBrown)]">
                                            Assigned
                                        </button>
                                    </div>

                                    {/* Compact employee grid */}
                                    <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-2 max-h-[300px]">
                                        {allEmployees.map((employee) => (
                                            <div
                                                key={employee.id}
                                                className={`
                                                    p-2 rounded border transition-all duration-200 
                                                    hover:shadow-md cursor-pointer
                                                    grid grid-cols-[auto_1fr_auto] gap-2 items-center
                                                    ${
                                                        employee.assigned !==
                                                            null &&
                                                        employee.assigned !==
                                                            noodleBars[0].name
                                                            ? "bg-gray-100 border-gray-300"
                                                            : "bg-[color:var(--color-whiteCream)] border-[color:var(--color-principalBrown)]"
                                                    }
                                                `}
                                                onClick={() =>
                                                    handleAssignEmployee(
                                                        employee
                                                    )
                                                }
                                            >
                                                {/* Employee type badge */}
                                                <div
                                                    className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                                                    ${
                                                        employee.type === "A"
                                                            ? "bg-red-500"
                                                            : employee.type ===
                                                              "B"
                                                            ? "bg-blue-500"
                                                            : employee.type ===
                                                              "C"
                                                            ? "bg-green-500"
                                                            : employee.type ===
                                                              "D"
                                                            ? "bg-gray-500"
                                                            : "bg-yellow-500"
                                                    }
                                                `}
                                                >
                                                    {employee.type}
                                                </div>

                                                {/* Employee info */}
                                                <div className="flex flex-col">
                                                    <div className="flex items-center">
                                                        <span className="font-bold text-[color:var(--color-principalBrown)]">
                                                            {employee.name}
                                                        </span>
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            Lv.{employee.level}
                                                            /5
                                                        </span>
                                                    </div>

                                                    {/* Stats in a single row */}
                                                    <div className="flex gap-2 text-xs text-[color:var(--color-principalBrown)]">
                                                        <span>
                                                            🍜{" "}
                                                            {employee.cuisine}
                                                        </span>
                                                        <span>
                                                            💖{" "}
                                                            {employee.service}
                                                        </span>
                                                        <span>
                                                            🎭{" "}
                                                            {employee.ambiance}
                                                        </span>
                                                    </div>

                                                    {/* Assignment status */}
                                                    {employee.assigned && (
                                                        <div
                                                            className={`text-xs font-medium ${
                                                                employee.assigned ===
                                                                noodleBars[0]
                                                                    .name
                                                                    ? "text-emerald-600"
                                                                    : "text-amber-600"
                                                            }`}
                                                        >
                                                            {employee.assigned ===
                                                            noodleBars[0].name
                                                                ? "Currently assigned here"
                                                                : `At: ${employee.assigned}`}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action button */}
                                                <div>
                                                    {employee.assigned ===
                                                    noodleBars[0].name ? (
                                                        <button
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveEmployee(
                                                                    employee.id
                                                                );
                                                            }}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-5 w-5"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className={`
                                                            ${
                                                                employee.assigned
                                                                    ? "text-gray-400"
                                                                    : "text-[color:var(--color-principalRed)]"
                                                            }
                                                            hover:text-[color:var(--color-principalRed-light)]
                                                        `}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-5 w-5"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M12 4v16m8-8H4"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between mt-6">
                                        <div>
                                            <h3
                                                className="font-semibold"
                                                style={{
                                                    color: "var(--color-principalBrown)",
                                                }}
                                            >
                                                Staff Cost
                                            </h3>
                                            <p className="text-red-500 font-bold">
                                                {formatCurrency(
                                                    selectedBar.staffCost
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <h3
                                                className="font-semibold"
                                                style={{
                                                    color: "var(--color-principalBrown)",
                                                }}
                                            >
                                                Net Profit
                                            </h3>
                                            <p className="text-emerald-600 font-bold">
                                                {formatCurrency(
                                                    selectedBar.forecastedProfit -
                                                        selectedBar.staffCost -
                                                        selectedBar.maintenance
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleCloseDetails}
                                    className="px-6 py-2 bg-[color:var(--color-principalRed)] text-[color:var(--color-whiteCream)] font-bold rounded-md hover:bg-[color:var(--color-principalRed-light)] transition-all duration-300 transform hover:scale-105"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </MenuContainer>
                </div>
            )}

            {/* Confirmation modal */}
            <ConfirmationModal
                show={showConfirmation}
                onCancel={() => setShowConfirmation(false)}
                onConfirm={handleConfirmReassignment}
                employeeToReassign={employeeToReassign}
            />

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

NoodleBarAssign.propTypes = {
    onBack: PropTypes.func.isRequired,
    playerRank: PropTypes.number,
};

export default NoodleBarAssign;

