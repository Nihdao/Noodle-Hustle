import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import RestaurantSlot from "./components/RestaurantSlot";
// import RestaurantPreview from "./components/RestaurantPreview";
import ConfirmationModal from "./components/ConfirmationModal";
import EmployeeManagementModal from "./components/EmployeeManagementModal";
import {
    formatCurrency,
    getAvailableSlots,
    getSlotStatus,
    getNextRankUnlock,
} from "./utils/restaurantUtils";
import {
    useRestaurants,
    useEmployees,
    useNoodleBarOperations,
} from "../../store/gameStateHooks";

const NoodleBarAssign = ({ onBack, playerRank }) => {
    const {
        slots: restaurantSlots,
        bars: noodleBars,
        getRestaurantById,
    } = useRestaurants();
    const { rosterWithDetails: allEmployees } = useEmployees();
    const {
        playerRank: statePlayerRank,
        getRestaurantStaff,
        handleAssignEmployee,
        removeEmployeeFromRestaurant,
    } = useNoodleBarOperations();

    // Use player rank from props or state
    const actualPlayerRank = playerRank || statePlayerRank;

    const [selectedBar, setSelectedBar] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
    const [hoveredBar, setHoveredBar] = useState(null);
    const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [employeeToReassign, setEmployeeToReassign] = useState(null);
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);

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

    // Get full restaurant data for a given bar
    const getCompleteBarData = (barId) => {
        if (!barId) return null;
        return getRestaurantById(barId);
    };

    const handleMouseEnter = (bar, event) => {
        if (!bar.unlocked) return;

        // Get complete bar data with all necessary fields
        const completeBarData = getCompleteBarData(bar.id);
        if (completeBarData) {
            // Enhance with currentStaff for stats calculation
            const enhancedBar = {
                ...completeBarData,
                currentStaff: getRestaurantStaff(bar.id),
            };
            setHoveredBar(enhancedBar);

            const rect = event.currentTarget.getBoundingClientRect();
            setPreviewPosition({
                x: rect.right + 20,
                y: rect.top + window.scrollY,
            });
        }
    };

    const handleMouseLeave = () => {
        setHoveredBar(null);
    };

    const handleSelectBar = (bar) => {
        if (!bar.unlocked) return;

        // Get complete bar data with all necessary fields
        const completeBarData = getCompleteBarData(bar.id);
        if (completeBarData) {
            setSelectedBar(completeBarData);
            setShowDetails(true);

            // Calculate the position for the modal to appear in the right side
            const sidebarWidth = window.innerWidth * 0.333; // 33.333% of the window width
            const mainAreaWidth = window.innerWidth * 0.667; // 66.667% of the window width

            setDetailsPosition({
                x: sidebarWidth + mainAreaWidth / 2,
                y: window.innerHeight / 2,
            });
        }
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

    // Handle employee assignment with confirmation if needed
    const onAssignEmployee = (employee) => {
        if (!selectedBar) return;

        const result = handleAssignEmployee(
            employee,
            selectedBar.id,
            selectedBar.name
        );

        // If result is an object with needsConfirmation=true, show confirmation modal
        if (result && typeof result === "object" && result.needsConfirmation) {
            setEmployeeToReassign(result);
            setShowConfirmation(true);
        }
    };

    // Handle employee removal
    const onRemoveEmployee = (employeeId) => {
        removeEmployeeFromRestaurant(employeeId);
    };

    // Calculate number of available slots
    const availableSlots = getAvailableSlots(actualPlayerRank);
    const nextRankUnlock = getNextRankUnlock(actualPlayerRank);

    // Handle confirmation actions
    const handleConfirmReassignment = () => {
        if (employeeToReassign) {
            // Use the centralized function from the hook
            handleAssignEmployee(
                employeeToReassign.employee,
                employeeToReassign.targetBarId,
                employeeToReassign.targetBar
            );

            // Clear confirmation modal after action
            setShowConfirmation(false);
            setEmployeeToReassign(null);
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
            {/* <RestaurantPreview
                restaurant={hoveredBar}
                position={previewPosition}
                formatCurrency={formatCurrency}
                getTotalStat={getTotalStat}
            /> */}

            {/* Employee management modal */}
            {showDetails && selectedBar && (
                <EmployeeManagementModal
                    selectedBar={{
                        ...selectedBar,
                        currentStaff: getRestaurantStaff(selectedBar.id),
                        upgrades: selectedBar.upgrades || {},
                    }}
                    showDetails={showDetails}
                    detailsPosition={detailsPosition}
                    allEmployees={allEmployees}
                    onCloseDetails={handleCloseDetails}
                    onRemoveEmployee={onRemoveEmployee}
                    onAssignEmployee={onAssignEmployee}
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

