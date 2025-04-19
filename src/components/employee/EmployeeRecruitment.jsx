import { useState } from "react";
import PropTypes from "prop-types";

const EmployeeRecruitment = ({ onBack, funds }) => {
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("fr-FR").format(value) + " ¥";
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
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>Employee Recruitment</h2>
                <p style={styles.headerSubtitle}>
                    Find and hire talented staff for your restaurants
                </p>
                <div className="mt-2 flex items-center">
                    <span className="font-medium">Available Funds: </span>
                    <span className="ml-2 text-lg font-semibold text-emerald-600">
                        {formatCurrency(funds)}
                    </span>
                </div>
            </div>

            {/* Contenu principal - à compléter plus tard */}
            <div className="p-4 flex-1 overflow-auto">
                <div className="bg-[color:var(--color-whiteCream)] p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-[color:var(--color-principalBrown)]">
                        Available Candidates
                    </h3>
                    <p className="text-[color:var(--color-principalBrown)] italic">
                        This section will display potential employees that you
                        can hire.
                    </p>
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

EmployeeRecruitment.propTypes = {
    onBack: PropTypes.func.isRequired,
    funds: PropTypes.number.isRequired,
};

export default EmployeeRecruitment;
