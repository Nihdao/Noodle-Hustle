import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import RestaurantSlot from "./components/RestaurantSlot";
import RestaurantPreview from "./components/RestaurantPreview";
import ConfirmationModal from "./components/ConfirmationModal";
import EmployeeManagementModal from "./components/EmployeeManagementModal";
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
            <div className=" p-4">
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

            {/* Employee management modal */}
            {showDetails && selectedBar && (
                <EmployeeManagementModal
                    selectedBar={selectedBar}
                    showDetails={showDetails}
                    detailsPosition={detailsPosition}
                    allEmployees={allEmployees}
                    onCloseDetails={handleCloseDetails}
                    onRemoveEmployee={handleRemoveEmployee}
                    onAssignEmployee={handleAssignEmployee}
                />
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

