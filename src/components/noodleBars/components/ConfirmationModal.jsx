import PropTypes from "prop-types";
import { formatCurrency } from "../utils/restaurantUtils";

const ConfirmationModal = ({
    show,
    onCancel,
    onConfirm,
    employeeToReassign,
    upgradeDetails,
    buySellDetails,
    title,
}) => {
    if (!show) return null;

    const styles = {
        overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(5px)",
            zIndex: 90,
        },
    };

    // Handle button clicks with event prevention
    const handleCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
    };

    const handleConfirm = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onConfirm();
    };

    // Determine what content to show based on props
    const renderContent = () => {
        if (employeeToReassign) {
            return (
                <>
                    <h3
                        className="text-xl font-bold mb-3"
                        style={{ color: "var(--color-principalBrown)" }}
                    >
                        Reassign Employee?
                    </h3>
                    <p
                        className="mb-4"
                        style={{ color: "var(--color-principalBrown)" }}
                    >
                        <span className="font-semibold">
                            {employeeToReassign.employee.name}
                        </span>{" "}
                        is already working at{" "}
                        <span className="font-semibold">
                            {employeeToReassign.employee.assigned}
                        </span>
                        . Reassigning to{" "}
                        <span className="font-semibold">
                            {employeeToReassign.targetBar}
                        </span>{" "}
                        will remove them from their current position.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition-colors"
                            onClick={handleCancel}
                            style={{ color: "var(--color-principalBrown)" }}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-[color:var(--color-principalRed)] hover:bg-[color:var(--color-principalRed-light)] text-white rounded-md font-medium transition-colors"
                            onClick={handleConfirm}
                        >
                            Reassign
                        </button>
                    </div>
                </>
            );
        } else if (upgradeDetails) {
            return (
                <>
                    <h3 className="text-xl font-bold text-[color:var(--color-principalBrown)] mb-3">
                        {title || "Confirm Upgrade"}
                    </h3>
                    <p className="text-[color:var(--color-principalBrown)] mb-4">
                        Are you sure you want to upgrade{" "}
                        <span className="font-bold">
                            {upgradeDetails.categoryName}
                        </span>{" "}
                        from level {upgradeDetails.currentLevel} to level{" "}
                        {upgradeDetails.newLevel}?
                    </p>
                    <div className="text-sm text-[color:var(--color-principalBrown)] mb-6">
                        <div className="flex justify-between border-b pb-2 mb-2">
                            <span>Cost:</span>
                            <span className="font-bold text-red-500">
                                {formatCurrency(upgradeDetails.cost)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Remaining funds:</span>
                            <span className="font-bold text-emerald-600">
                                {formatCurrency(
                                    upgradeDetails.currentFunds -
                                        upgradeDetails.cost
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition-colors"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-[color:var(--color-principalRed)] hover:bg-[color:var(--color-principalRed-light)] text-white rounded-md font-medium transition-colors"
                            onClick={handleConfirm}
                        >
                            Confirm
                        </button>
                    </div>
                </>
            );
        } else if (buySellDetails) {
            const { barName, price, action, currentFunds } = buySellDetails;
            const isBuy = action === "buy";
            const resultingFunds = isBuy
                ? currentFunds - price
                : currentFunds + price;

            return (
                <>
                    <h3 className="text-xl font-bold text-[color:var(--color-principalBrown)] mb-3">
                        {title || (isBuy ? "Confirm Purchase" : "Confirm Sale")}
                    </h3>
                    <p className="text-[color:var(--color-principalBrown)] mb-4">
                        Are you sure you want to {isBuy ? "purchase" : "sell"}{" "}
                        <span className="font-bold">{barName}</span>?
                    </p>
                    <div className="text-sm text-[color:var(--color-principalBrown)] mb-6">
                        <div className="flex justify-between border-b pb-2 mb-2">
                            <span>{isBuy ? "Cost" : "Sell price"}:</span>
                            <span
                                className={`font-bold ${
                                    isBuy ? "text-red-500" : "text-emerald-600"
                                }`}
                            >
                                {formatCurrency(price)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Funds after transaction:</span>
                            <span className="font-bold text-emerald-600">
                                {formatCurrency(resultingFunds)}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition-colors"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-[color:var(--color-principalRed)] hover:bg-[color:var(--color-principalRed-light)] text-white rounded-md font-medium transition-colors"
                            onClick={handleConfirm}
                        >
                            {isBuy ? "Purchase" : "Sell"}
                        </button>
                    </div>
                </>
            );
        }
    };

    return (
        <>
            <div style={styles.overlay} onClick={handleCancel}></div>
            <div className="fixed inset-0 z-100 flex items-center justify-center pointer-events-none">
                <div
                    className="bg-white rounded-lg p-6 max-w-md w-full animate-fade-in pointer-events-auto shadow-xl"
                    style={{
                        backgroundColor: "var(--color-whiteCream)",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                    }}
                >
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

ConfirmationModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string,
    employeeToReassign: PropTypes.shape({
        employee: PropTypes.shape({
            name: PropTypes.string.isRequired,
            assigned: PropTypes.string,
        }).isRequired,
        targetBar: PropTypes.string.isRequired,
    }),
    upgradeDetails: PropTypes.shape({
        categoryName: PropTypes.string.isRequired,
        currentLevel: PropTypes.number.isRequired,
        newLevel: PropTypes.number.isRequired,
        cost: PropTypes.number.isRequired,
        currentFunds: PropTypes.number.isRequired,
    }),
    buySellDetails: PropTypes.shape({
        barName: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        action: PropTypes.oneOf(["buy", "sell"]).isRequired,
        currentFunds: PropTypes.number.isRequired,
    }),
};

export default ConfirmationModal;

