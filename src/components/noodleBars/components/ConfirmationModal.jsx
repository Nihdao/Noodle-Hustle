import PropTypes from "prop-types";

const ConfirmationModal = ({
    show,
    onCancel,
    onConfirm,
    employeeToReassign,
}) => {
    if (!show || !employeeToReassign) return null;

    const styles = {
        confirmationModal: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 100,
            backgroundColor: "var(--color-whiteCream)",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
            width: "26rem",
            textAlign: "center",
        },
        overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 90,
        },
    };

    return (
        <>
            <div style={styles.overlay} onClick={onCancel}></div>
            <div style={styles.confirmationModal} className="animate-fade-in">
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
                        onClick={onCancel}
                        style={{ color: "var(--color-principalBrown)" }}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-[color:var(--color-principalRed)] hover:bg-[color:var(--color-principalRed-light)] text-white rounded-md font-medium transition-colors"
                        onClick={onConfirm}
                    >
                        Reassign
                    </button>
                </div>
            </div>
        </>
    );
};

ConfirmationModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    employeeToReassign: PropTypes.shape({
        employee: PropTypes.shape({
            name: PropTypes.string.isRequired,
            assigned: PropTypes.string,
        }).isRequired,
        targetBar: PropTypes.string.isRequired,
    }),
};

export default ConfirmationModal;

