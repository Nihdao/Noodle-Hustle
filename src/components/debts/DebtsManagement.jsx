import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { formatCurrency, formatPercent } from "../../utils/formatters";
import MenuContainer from "../common/MenuContainer";

const DebtsManagement = ({ loans = [], funds = 0, onRepayEarly, onBack }) => {
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
    const [showLoanDetails, setShowLoanDetails] = useState(false);
    const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });

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

    useEffect(() => {
        if (loans.length > 0 && !selectedLoan) {
            setSelectedLoan(loans[0]);
        }
    }, [loans, selectedLoan]);

    // Calculate total debt
    const totalDebt = loans.reduce(
        (total, loan) => total + loan.remainingAmount,
        0
    );
    const totalMonthlyPayment = loans.reduce(
        (total, loan) => total + loan.periodPayment,
        0
    );

    // Calculate repayment progress
    const calculateRepaymentProgress = (loan) => {
        const repaid = loan.totalAmount - loan.remainingAmount;
        return Math.round((repaid / loan.totalAmount) * 100);
    };

    // Position the details menu
    const updateDetailsPosition = () => {
        const sidebarWidth = window.innerWidth * 0.333;
        const mainAreaWidth = window.innerWidth * 0.667;

        setDetailsPosition({
            x: sidebarWidth + mainAreaWidth / 2,
            y: window.innerHeight / 2,
        });
    };

    // Select a loan to view details
    const handleSelectLoan = (loan) => {
        setSelectedLoan(loan);
        setShowLoanDetails(true);
        updateDetailsPosition();
    };

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            if (showLoanDetails) {
                updateDetailsPosition();
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [showLoanDetails]);

    // Handle early repayment
    const handleRepayEarly = () => {
        setShowConfirmation(true);
    };

    // Confirm early repayment
    const handleConfirmEarlyRepayment = () => {
        if (selectedLoan && funds >= selectedLoan.remainingAmount) {
            onRepayEarly(selectedLoan.id, selectedLoan.remainingAmount);
            setShowConfirmation(false);
        }
    };

    // Close loan details
    const handleCloseLoanDetails = () => {
        setShowLoanDetails(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>Debt Management</h2>
                <p style={styles.headerSubtitle}>
                    Manage your loans and repayments
                </p>
                <div className="mt-2 flex items-center justify-between">
                    <div className="font-medium text-[color:var(--color-principalBrown)]">
                        Available Funds:{" "}
                        <span className="text-emerald-600 font-bold">
                            {formatCurrency(funds)}
                        </span>
                    </div>
                    <div className="font-medium text-right text-[color:var(--color-principalBrown)]">
                        Total Debt:{" "}
                        <span className="text-red-500 font-bold">
                            {formatCurrency(totalDebt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Debt Summary */}
            <div className="bg-[color:var(--color-whiteCream)] p-4 border-b border-[color:var(--color-principalBrown)] border-opacity-20">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-[color:var(--color-principalBrown)] text-lg">
                        Monthly Summary
                    </h3>
                    <span className="text-red-500 font-bold">
                        {formatCurrency(totalMonthlyPayment)}
                    </span>
                </div>
                <p className="text-sm text-[color:var(--color-principalBrown)] opacity-80">
                    Total monthly payment across all active loans
                </p>
            </div>

            {/* Active Loans Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <h3 className="font-bold text-[color:var(--color-principalBrown)] mb-2">
                    Active Loans
                </h3>

                {loans.length === 0 ? (
                    <div className="text-center py-8 text-[color:var(--color-principalBrown)] opacity-70">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto mb-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="text-lg">No active loans</p>
                    </div>
                ) : (
                    loans.map((loan) => (
                        <div
                            key={loan.id}
                            className="bg-white rounded-md p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                            onClick={() => handleSelectLoan(loan)}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-[color:var(--color-principalBrown)]">
                                        {loan.name}
                                    </h4>
                                    <div className="text-sm text-[color:var(--color-principalBrown)] opacity-80">
                                        {loan.type === "bank"
                                            ? "Bank Loan"
                                            : loan.type === "investor"
                                            ? "Investor Loan"
                                            : loan.type === "loan shark"
                                            ? "Loan Shark"
                                            : "Other"}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-red-500">
                                        {formatCurrency(loan.remainingAmount)}
                                    </div>
                                    <div className="text-sm text-[color:var(--color-principalBrown)]">
                                        {loan.periodsRemaining} payments left
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="bg-green-500 h-1.5 rounded-full"
                                        style={{
                                            width: `${calculateRepaymentProgress(
                                                loan
                                            )}%`,
                                        }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-1 text-xs text-[color:var(--color-principalBrown)]">
                                    <span>
                                        {calculateRepaymentProgress(loan)}%
                                        repaid
                                    </span>
                                    <span>
                                        {formatCurrency(loan.periodPayment)}
                                        /month
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
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

            {/* Loan Details Modal */}
            {showLoanDetails && selectedLoan && (
                <div
                    className="fixed z-50 transition-all duration-500"
                    style={{
                        left: `${detailsPosition.x}px`,
                        top: `${detailsPosition.y}px`,
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <MenuContainer
                        animationState={showLoanDetails ? "visible" : "hidden"}
                        className="w-[650px] max-h-[80vh]"
                        scrollable={true}
                        maxHeight="80vh"
                        title={selectedLoan.name}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-bold text-xl text-[color:var(--color-principalBrown)]">
                                        Loan Details
                                    </h3>
                                </div>
                                <div
                                    className={`px-3 py-1 rounded text-white text-sm ${
                                        selectedLoan.type === "bank"
                                            ? "bg-blue-600"
                                            : selectedLoan.type === "investor"
                                            ? "bg-purple-600"
                                            : selectedLoan.type === "loan shark"
                                            ? "bg-red-600"
                                            : "bg-gray-600"
                                    }`}
                                >
                                    {selectedLoan.type === "bank"
                                        ? "Bank Loan"
                                        : selectedLoan.type === "investor"
                                        ? "Investor Loan"
                                        : selectedLoan.type === "loan shark"
                                        ? "Loan Shark"
                                        : "Other"}
                                </div>
                                <button
                                    onClick={handleCloseLoanDetails}
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

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-[color:var(--color-yellowWhite)] p-3 rounded-md">
                                    <p className="text-[color:var(--color-principalBrown)] text-sm opacity-80">
                                        Remaining Balance
                                    </p>
                                    <p className="font-bold text-xl text-[color:var(--color-principalBrown)]">
                                        {formatCurrency(
                                            selectedLoan.remainingAmount
                                        )}
                                    </p>
                                </div>
                                <div className="bg-[color:var(--color-yellowWhite)] p-3 rounded-md">
                                    <p className="text-[color:var(--color-principalBrown)] text-sm opacity-80">
                                        Monthly Payment
                                    </p>
                                    <p className="font-bold text-xl text-[color:var(--color-principalBrown)]">
                                        {formatCurrency(
                                            selectedLoan.periodPayment
                                        )}
                                    </p>
                                </div>
                                <div className="bg-[color:var(--color-yellowWhite)] p-3 rounded-md">
                                    <p className="text-[color:var(--color-principalBrown)] text-sm opacity-80">
                                        Interest Rate
                                    </p>
                                    <p className="font-bold text-xl text-[color:var(--color-principalBrown)]">
                                        {formatPercent(
                                            selectedLoan.interestRate
                                        )}
                                    </p>
                                </div>
                                <div className="bg-[color:var(--color-yellowWhite)] p-3 rounded-md">
                                    <p className="text-[color:var(--color-principalBrown)] text-sm opacity-80">
                                        Remaining Payments
                                    </p>
                                    <p className="font-bold text-xl text-[color:var(--color-principalBrown)]">
                                        {selectedLoan.periodsRemaining}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-bold text-[color:var(--color-principalBrown)] mb-2">
                                    Repayment Progress
                                </h3>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-green-500 h-2.5 rounded-full"
                                        style={{
                                            width: `${calculateRepaymentProgress(
                                                selectedLoan
                                            )}%`,
                                        }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-2 text-sm text-[color:var(--color-principalBrown)]">
                                    <span>
                                        Original:{" "}
                                        {formatCurrency(
                                            selectedLoan.totalAmount
                                        )}
                                    </span>
                                    <span>
                                        {calculateRepaymentProgress(
                                            selectedLoan
                                        )}
                                        % repaid (
                                        {formatCurrency(
                                            selectedLoan.totalAmount -
                                                selectedLoan.remainingAmount
                                        )}{" "}
                                        of{" "}
                                        {formatCurrency(
                                            selectedLoan.totalAmount
                                        )}
                                        )
                                    </span>
                                </div>
                            </div>

                            <div className="text-sm text-[color:var(--color-principalBrown)] mb-6">
                                <p className="mb-2">
                                    You have{" "}
                                    <strong>
                                        {selectedLoan.periodsRemaining}
                                    </strong>{" "}
                                    periods remaining on this loan. Paying it
                                    off early will save you interest costs in
                                    the long run.
                                </p>
                            </div>

                            <div className="mt-6 flex flex-col space-y-3">
                                <button
                                    onClick={handleRepayEarly}
                                    className={`
                                        py-3 px-4 rounded-md text-white font-bold text-center
                                        ${
                                            funds >=
                                            selectedLoan.remainingAmount
                                                ? "bg-[color:var(--color-principalRed)] hover:bg-[color:var(--color-principalRed-light)]"
                                                : "bg-gray-400 cursor-not-allowed"
                                        }
                                        transition-colors flex items-center justify-center
                                    `}
                                    disabled={
                                        funds < selectedLoan.remainingAmount
                                    }
                                >
                                    <span className="mr-2">
                                        Pay Off Loan Early
                                    </span>
                                    <span>
                                        {formatCurrency(
                                            selectedLoan.remainingAmount
                                        )}
                                    </span>
                                </button>
                                {funds < selectedLoan.remainingAmount && (
                                    <p className="text-red-600 text-sm text-center">
                                        You cannot afford to repay this loan
                                        early.
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleCloseLoanDetails}
                                    className="px-6 py-2 bg-[color:var(--color-principalBrown)] text-[color:var(--color-whiteCream)] font-bold rounded-md hover:bg-[color:var(--color-principalBrown-light)] transition-all duration-300 transform hover:scale-105"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </MenuContainer>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && selectedLoan && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-[color:var(--color-principalBrown)] mb-4">
                            Confirm Early Repayment
                        </h3>
                        <p className="mb-4 text-[color:var(--color-principalBrown)]">
                            Are you sure you want to pay off your{" "}
                            {selectedLoan.name} early? This will cost{" "}
                            <strong>
                                {formatCurrency(selectedLoan.remainingAmount)}
                            </strong>
                            .
                        </p>
                        <p className="mb-4 text-sm text-[color:var(--color-principalBrown)] opacity-80">
                            Your funds after payment:{" "}
                            {formatCurrency(
                                funds - selectedLoan.remainingAmount
                            )}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-[color:var(--color-principalBrown)] hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmEarlyRepayment}
                                className="px-4 py-2 bg-[color:var(--color-principalRed)] text-white rounded-md hover:bg-[color:var(--color-principalRed-light)]"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

DebtsManagement.propTypes = {
    loans: PropTypes.array.isRequired,
    funds: PropTypes.number,
    onRepayEarly: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
};

export default DebtsManagement;

