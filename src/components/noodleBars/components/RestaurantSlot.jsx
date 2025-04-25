import PropTypes from "prop-types";

const RestaurantSlot = ({
    slot,
    status,
    index,
    bar,
    isHovered = false,
    onSelect,
    onMouseEnter,
    onMouseLeave,
    hideArrow = false,
}) => {
    console.log(bar);
    // Get staff count safely by checking currentStaff array
    const getStaffCount = () => {
        if (!bar) return 0;
        return Array.isArray(bar.staff) ? bar.staff.length : 0;
    };

    // Get max staff slots safely
    const getMaxStaffSlots = () => {
        return bar?.staffSlots || 3;
    };

    return (
        <div
            className={`
                rounded-lg p-3 border-2 flex items-center
                ${
                    status === "locked"
                        ? "bg-gray-200 border-gray-300 cursor-not-allowed"
                        : status === "available"
                        ? "bg-[color:var(--color-yellowWhite)] bg-opacity-30 border-dashed border-[color:var(--color-principalBrown)] border-opacity-50 cursor-pointer hover:bg-opacity-50"
                        : isHovered
                        ? "bg-[color:var(--color-principalRed)] bg-opacity-80 border-[color:var(--color-principalRed)] text-white transform translate-x-2"
                        : "bg-[color:var(--color-yellowWhite)] bg-opacity-40 border-[color:var(--color-principalBrown)] cursor-pointer hover:bg-opacity-60"
                }
                transition-all duration-300
            `}
            onClick={() => {
                if (status === "available") {
                    onSelect(slot);
                } else if (status === "purchased" && slot.barId) {
                    onSelect(bar);
                }
            }}
            onMouseEnter={(e) => {
                if (status === "purchased" && bar) {
                    onMouseEnter(bar, e);
                }
            }}
            onMouseLeave={onMouseLeave}
        >
            <div className="mr-4 text-2xl">
                {status === "locked"
                    ? "🔒"
                    : status === "available"
                    ? "🏯"
                    : "🍜"}
            </div>

            <div className="flex-1">
                {status === "locked" ? (
                    <div>
                        <p
                            className="font-bold"
                            style={{
                                color: "var(--color-principalBrown)",
                            }}
                        >
                            Locked Restaurant Slot
                        </p>
                        <p className="text-sm text-gray-500">
                            Unlocks at rank{" "}
                            {index === 1
                                ? 170
                                : index === 2
                                ? 120
                                : index === 3
                                ? 70
                                : 30}
                        </p>
                    </div>
                ) : status === "available" ? (
                    <div>
                        <p
                            className="font-bold"
                            style={{
                                color: "var(--color-principalBrown)",
                            }}
                        >
                            Available Restaurant Slot
                        </p>
                        <p className="text-sm text-[color:var(--color-principalRed)]">
                            Go to Buy/Sell menu to fill this slot
                        </p>
                    </div>
                ) : (
                    <div>
                        <p
                            className={`font-bold ${
                                isHovered ? "text-white" : ""
                            }`}
                            style={{
                                color: isHovered
                                    ? "white"
                                    : "var(--color-principalBrown)",
                            }}
                        >
                            {slot.name}
                        </p>
                        {bar && (
                            <p
                                className="text-sm"
                                style={{
                                    color: isHovered
                                        ? "white"
                                        : "var(--color-principalBrown)",
                                    opacity: isHovered ? 0.9 : 0.7,
                                }}
                            >
                                <span className="font-bold">{bar.name}</span>
                                <br />
                                Staff: {getStaffCount()}/{getMaxStaffSlots()}
                            </p>
                        )}
                        {bar && (
                            <p
                                className="text-sm"
                                style={{
                                    color: isHovered
                                        ? "white"
                                        : "var(--color-principalBrown)",
                                    opacity: isHovered ? 0.9 : 0.7,
                                }}
                            ></p>
                        )}
                    </div>
                )}
            </div>

            {status === "purchased" && !hideArrow && (
                <div
                    className={`ml-auto flex items-center justify-center h-8 w-8 rounded-full ${
                        isHovered
                            ? "bg-white text-[color:var(--color-principalRed)]"
                            : "bg-[color:var(--color-principalRed)] text-white"
                    } transform ${isHovered ? "scale-110" : ""} transition-all`}
                >
                    <span className="text-sm">→</span>
                </div>
            )}
        </div>
    );
};

RestaurantSlot.propTypes = {
    slot: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
            .isRequired,
        purchased: PropTypes.bool.isRequired,
        name: PropTypes.string,
        barId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }).isRequired,
    status: PropTypes.oneOf(["locked", "available", "purchased"]).isRequired,
    index: PropTypes.number.isRequired,
    bar: PropTypes.object,
    employees: PropTypes.array,
    formatCurrency: PropTypes.func.isRequired,
    isHovered: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    onMouseEnter: PropTypes.func.isRequired,
    onMouseLeave: PropTypes.func.isRequired,
    hideArrow: PropTypes.bool,
};

export default RestaurantSlot;

