import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MenuContainer from "../common/MenuContainer";

// Mock data for locations
const mockLocations = [
    {
        id: "home",
        name: "Home",
        icon: "🏡",
        description:
            "Relax at home after work. Does not trigger a meeting, but reduces burnout at the end of the period.",
        burnoutReduction: 15,
        time: 4,
    },
    {
        id: "park",
        name: "Park",
        icon: "🌳",
        description:
            "Take a walk in the park to clear your mind and enjoy nature. May encounter people exercising or relaxing.",
        burnoutReduction: 20,
        time: 3,
    },
    {
        id: "lake",
        name: "Lake",
        icon: "🌊",
        description:
            "Visit the scenic lake for fishing or meditation. The serene atmosphere is perfect for reflection.",
        burnoutReduction: 25,
        time: 5,
    },
    {
        id: "downtown",
        name: "Downtown",
        icon: "🏙️",
        description:
            "Explore the bustling downtown area with shops, restaurants, and entertainment venues.",
        burnoutReduction: 18,
        time: 4,
    },
    {
        id: "hypermarket",
        name: "Hypermarket",
        icon: "🏬",
        description:
            "Browse the hypermarket for daily necessities or just window shop. An easy way to pass time.",
        burnoutReduction: 12,
        time: 2,
    },
];

// Mock data for confidants
const mockConfidants = [
    {
        id: 1,
        name: "Hiroshi Tanaka",
        title: "Bank Manager",
        portrait: "👨‍💼",
        linkLevel: 3,
        maxLevel: 5,
        buff: "Loan Interest -5%",
        description:
            "A shrewd banker who can offer financial advice and potentially better loan terms.",
        unlocked: true,
    },
    {
        id: 2,
        name: "Yuki Sato",
        title: "Food Critic",
        portrait: "👩‍🍳",
        linkLevel: 2,
        maxLevel: 5,
        buff: "Customer Satisfaction +10%",
        description:
            "An influential food critic whose favor can boost your restaurant's reputation.",
        unlocked: true,
    },
    {
        id: 3,
        name: "Kenji Watanabe",
        title: "City Council Member",
        portrait: "👨‍⚖️",
        linkLevel: 1,
        maxLevel: 5,
        buff: "Permit Processing Time -20%",
        description:
            "A city official who can help navigate bureaucracy and speed up permit approvals.",
        unlocked: true,
    },
    {
        id: 4,
        name: "???",
        title: "???",
        portrait: "❓",
        linkLevel: 0,
        maxLevel: 5,
        buff: "???",
        description: "You haven't met this person yet.",
        unlocked: false,
    },
    {
        id: 5,
        name: "???",
        title: "???",
        portrait: "❓",
        linkLevel: 0,
        maxLevel: 5,
        buff: "???",
        description: "You haven't met this person yet.",
        unlocked: false,
    },
];

const SocialManagement = ({
    onBack,
    onLocationSelect,
    currentPlanned = "Home",
}) => {
    const [locations] = useState(mockLocations);
    const [confidants] = useState(mockConfidants);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedConfidant, setSelectedConfidant] = useState(null);
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
    const [showDetails, setShowDetails] = useState(false);
    const [burnout, setBurnout] = useState(33);
    const [plannedLocation, setPlannedLocation] = useState(currentPlanned);
    // Reference to store the location to use at period end
    const [pendingLocation, setPendingLocation] = useState(null);

    // Set initial selected location based on currentPlanned
    useEffect(() => {
        const currentLocation = locations.find(
            (loc) => loc.name === currentPlanned
        );
        if (currentLocation) {
            setSelectedLocation(currentLocation);
        }
    }, [currentPlanned]);

    // Function that would be called at end of period
    const applyBurnoutReduction = (location) => {
        if (location) {
            const newBurnout = Math.max(0, burnout - location.burnoutReduction);
            setBurnout(newBurnout);
        }
    };

    // Simulate period end effect for demo purposes
    useEffect(() => {
        // This effect would be triggered by a game event
        // in the real implementation, not automatically
        if (pendingLocation) {
            // Find the location data by name
            const locationData = locations.find(
                (loc) => loc.name === pendingLocation
            );
            if (locationData) {
                // We're not actually reducing burnout, just showing it could be done
                // applyBurnoutReduction(locationData);
            }
            setPendingLocation(null);
        }
    }, [pendingLocation, locations, burnout]);

    // Handle window resize for the menu container position
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
        // Trigger menu display
        setShowDetails(true);

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty dependency array to run only on mount

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

    // Handler to select a location
    const handleSelectLocation = (location) => {
        setSelectedLocation(location);
        setPlannedLocation(location.name);
        setPendingLocation(location.name);
        // Notify parent component about the location change
        if (onLocationSelect) {
            onLocationSelect(location.name);
        }
    };

    // Handler to select a confidant
    const handleSelectConfidant = (confidant) => {
        if (!confidant.unlocked) return;
        setSelectedConfidant(confidant);
        setShowDetails(true);

        // Calculate position for the confidant details modal
        const sidebarWidth = window.innerWidth * 0.333;
        const mainAreaWidth = window.innerWidth * 0.667;

        setDetailsPosition({
            x: sidebarWidth + mainAreaWidth / 2,
            y: window.innerHeight / 2,
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>Social Activities</h2>
                <p style={styles.headerSubtitle}>
                    Plan personal activities and build relationships
                </p>
                <div className="mt-2 flex items-center justify-between">
                    <div className="font-medium flex items-center">
                        <span className="text-[color:var(--color-principalBrown)]">
                            Planned:{" "}
                        </span>
                        <span className="ml-2 text-blue-500 font-semibold">
                            {plannedLocation}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main content area */}
            <div className="h-full overflow-hidden">
                {/* Left sidebar - Locations list */}
                <div className=" h-full overflow-y-auto border-r border-[color:var(--color-principalBrown)] border-opacity-20">
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
                                        </div>
                                    </div>

                                    {/* Description appears when selected */}
                                    {selectedLocation?.id === location.id && (
                                        <div className="mt-2 text-sm text-[color:var(--color-principalBrown)]">
                                            {location.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div
                    className="fixed z-50  w-[450px]" // Added width class
                    style={{
                        left: `${detailsPosition.x}px`,
                        top: `${detailsPosition.y}px`,
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <MenuContainer
                        animationState="visible"
                        className="w-full h-full"
                        scrollable={true}
                        title="Your Confidants"
                    >
                        <div className="p-4">
                            <div className="grid grid-cols-1 gap-4">
                                {confidants.map((confidant) => (
                                    <div
                                        key={confidant.id}
                                        style={styles.confidantCard(
                                            confidant.linkLevel,
                                            confidant.maxLevel
                                        )}
                                        className={`hover:shadow-md transition-all ${
                                            confidant.unlocked
                                                ? "cursor-pointer"
                                                : "opacity-70 cursor-not-allowed"
                                        }`}
                                        onClick={() =>
                                            handleSelectConfidant(confidant)
                                        }
                                    >
                                        <div className="flex items-center">
                                            <div className="text-3xl mr-3 bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center">
                                                {confidant.portrait}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <h4 className="font-bold text-[color:var(--color-principalBrown)]">
                                                        {confidant.name}
                                                    </h4>
                                                    {confidant.unlocked && (
                                                        <div
                                                            className="ml-2"
                                                            style={styles.linkLevelBadge(
                                                                confidant.linkLevel,
                                                                confidant.maxLevel
                                                            )}
                                                        >
                                                            <span>
                                                                Lv.
                                                                {
                                                                    confidant.linkLevel
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm text-[color:var(--color-principalBrown)] opacity-80">
                                                    {confidant.title}
                                                </div>
                                                <div className="text-sm text-[color:var(--color-principalBrown)] font-medium mt-1">
                                                    {confidant.buff}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </MenuContainer>
                </div>
            </div>

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

SocialManagement.propTypes = {
    onBack: PropTypes.func.isRequired,
    onLocationSelect: PropTypes.func,
    currentPlanned: PropTypes.string,
};

export default SocialManagement;

