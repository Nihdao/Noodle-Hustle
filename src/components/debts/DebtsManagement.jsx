import { useState } from "react";
import PropTypes from "prop-types";
import { formatCurrency } from "../../utils/formatters";

const DebtsManagement = ({ onBack, debts }) => {
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);

    const debtRepayment = debts;

    // Styles for consistency with other components
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
                <h2 style={styles.headerTitle}>Debt Management</h2>
                <p style={styles.headerSubtitle}>
                    Overview of your business debts
                </p>
            </div>

            {/* Debt Summary */}
            <div className="bg-[color:var(--color-whiteCream)] p-4 border-b border-[color:var(--color-principalBrown)] border-opacity-20">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-[color:var(--color-principalBrown)] text-lg">
                        Period Repayment
                    </h3>
                    <span className="text-red-500 font-bold">
                        {formatCurrency(debtRepayment)}
                    </span>
                </div>
                <p className="text-sm text-[color:var(--color-principalBrown)] opacity-80">
                    This amount is automatically deducted at the end of each
                    period based on your current rank.
                </p>
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

DebtsManagement.propTypes = {
    onBack: PropTypes.func.isRequired,
    debts: PropTypes.number.isRequired,
};

export default DebtsManagement;

