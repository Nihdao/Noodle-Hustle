import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { formatCurrency, formatPercent } from "../../utils/formatters";

const DebtsManagement = ({ loans = [], funds = 0, onRepayEarly, onBack }) => {
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

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

    // Select a loan to view details
    const handleSelectLoan = (loan) => {
        setSelectedLoan(loan);
    };

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

    return (
        <div className="flex h-full w-full">
            {/* Active Loans Summary - Left Column */}
            <div className="w-1/3 p-2 flex flex-col h-full">
                {/* Total Debt Summary Box */}
                <div className="bg-white rounded-md p-3 shadow-sm mb-2">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                        Debt Summary
                    </h3>
                    <div className="flex flex-col space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Debt:</span>
                            <span className="font-semibold">
                                {formatCurrency(totalDebt)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                Monthly Payment:
                            </span>
                            <span className="font-semibold">
                                {formatCurrency(totalMonthlyPayment)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* List of Active Loans - Scrollable */}
                <div className="flex-1 overflow-y-auto mb-2 bg-gray-50 rounded-md p-2">
                    <h3 className="font-bold text-gray-800 mb-1 sticky top-0 bg-gray-50 py-1">
                        Active Loans
                    </h3>
                    <div className="space-y-1 max-h-[calc(100%-2rem)] overflow-y-auto">
                        {loans.map((loan) => (
                            <div
                                key={loan.id}
                                onClick={() => handleSelectLoan(loan)}
                                className={`rounded-md p-2 cursor-pointer transition-all ${
                                    selectedLoan && selectedLoan.id === loan.id
                                        ? "bg-[color:var(--color-principalRed)]"
                                        : "bg-white hover:bg-gray-100"
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span
                                        className={`font-medium ${
                                            selectedLoan &&
                                            selectedLoan.id === loan.id
                                                ? "text-white"
                                                : "text-gray-800"
                                        }`}
                                    >
                                        {loan.name}
                                    </span>
                                    <span
                                        className={`text-sm ${
                                            selectedLoan &&
                                            selectedLoan.id === loan.id
                                                ? "text-white"
                                                : "text-gray-800"
                                        }`}
                                    >
                                        {formatCurrency(loan.remainingAmount)}
                                    </span>
                                </div>
                                <div className="mt-1">
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
                                    <div className="flex justify-between mt-0.5 text-xs">
                                        <span
                                            className={
                                                selectedLoan &&
                                                selectedLoan.id === loan.id
                                                    ? "text-white"
                                                    : "text-gray-600"
                                            }
                                        >
                                            {calculateRepaymentProgress(loan)}%
                                            repaid
                                        </span>
                                        <span
                                            className={
                                                selectedLoan &&
                                                selectedLoan.id === loan.id
                                                    ? "text-white"
                                                    : "text-gray-600"
                                            }
                                        >
                                            {loan.periodsRemaining} payments
                                            left
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Back button */}
                <button
                    onClick={onBack}
                    className="bg-[color:var(--color-yellowWhite)] hover:bg-[color:var(--color-principalBrown)] text-[color:var(--color-principalBrown)] hover:text-white py-2 px-4 rounded-md font-bold transition-colors"
                >
                    Back
                </button>
            </div>

            {/* Loan Details - Right Column */}
            <div className="w-2/3 p-3 bg-white overflow-y-auto">
                {selectedLoan ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-2xl text-gray-800">
                                {selectedLoan.name}
                            </h2>
                            <div
                                className={`px-2 py-1 rounded text-white text-sm ${
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
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-gray-600 text-sm">
                                    Remaining Balance
                                </p>
                                <p className="font-bold text-xl">
                                    {formatCurrency(
                                        selectedLoan.remainingAmount
                                    )}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-gray-600 text-sm">
                                    Monthly Payment
                                </p>
                                <p className="font-bold text-xl">
                                    {formatCurrency(selectedLoan.periodPayment)}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-gray-600 text-sm">
                                    Interest Rate
                                </p>
                                <p className="font-bold text-xl">
                                    {formatPercent(selectedLoan.interestRate)}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-gray-600 text-sm">
                                    Remaining Payments
                                </p>
                                <p className="font-bold text-xl">
                                    {selectedLoan.periodsRemaining}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-bold text-gray-800 mb-2">
                                Repayment Progress
                            </h3>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                        width: `${calculateRepaymentProgress(
                                            selectedLoan
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-1 text-sm text-gray-600">
                                <span>
                                    Original:{" "}
                                    {formatCurrency(selectedLoan.totalAmount)}
                                </span>
                                <span>
                                    {calculateRepaymentProgress(selectedLoan)}%
                                    repaid (
                                    {formatCurrency(
                                        selectedLoan.totalAmount -
                                            selectedLoan.remainingAmount
                                    )}{" "}
                                    of{" "}
                                    {formatCurrency(selectedLoan.totalAmount)})
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col space-y-3">
                            <button
                                onClick={handleRepayEarly}
                                className="bg-[color:var(--color-principalRed)] text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors w-full flex items-center justify-center"
                                disabled={funds < selectedLoan.remainingAmount}
                            >
                                <span className="mr-2">Pay Off Loan Early</span>
                                <span className="font-bold">
                                    {formatCurrency(
                                        selectedLoan.remainingAmount
                                    )}
                                </span>
                            </button>
                            {funds < selectedLoan.remainingAmount && (
                                <p className="text-red-600 text-sm text-center">
                                    You cannot afford to repay this loan early.
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 mb-4"
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
                        <p className="text-lg">Select a loan to view details</p>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && selectedLoan && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            Confirm Early Repayment
                        </h3>
                        <p className="mb-4">
                            Are you sure you want to pay off your{" "}
                            {selectedLoan.name} early? This will cost{" "}
                            <strong>
                                {formatCurrency(selectedLoan.remainingAmount)}
                            </strong>
                            .
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmEarlyRepayment}
                                className="px-4 py-2 bg-[color:var(--color-principalRed)] text-white rounded-md hover:bg-red-700"
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

