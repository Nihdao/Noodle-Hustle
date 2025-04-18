import PropTypes from "prop-types";
import MenuContainer from "../../common/MenuContainer";

const RestaurantPreview = ({
    restaurant,
    position,
    formatCurrency,
    getTotalStat,
}) => {
    if (!restaurant) return null;

    return (
        <div
            className="fixed z-40 transition-all duration-300"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                opacity: 1,
                pointerEvents: "none",
            }}
        >
            <MenuContainer animationState="visible" className="w-[300px]">
                <div className="p-3">
                    <div className="flex justify-between">
                        <h3
                            className="text-lg font-bold"
                            style={{
                                color: "var(--color-principalBrown)",
                            }}
                        >
                            {restaurant.name}
                        </h3>
                    </div>
                    <p
                        className="text-sm italic mb-2"
                        style={{
                            color: "var(--color-principalBrown)",
                            opacity: 0.7,
                        }}
                    >
                        {restaurant.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div
                            className="text-xs"
                            style={{
                                color: "var(--color-principalBrown)",
                            }}
                        >
                            <span>🍜 Cuisine: </span>
                            <span
                                className={
                                    getTotalStat(
                                        restaurant.currentStaff,
                                        "cuisine"
                                    ) >= 40
                                        ? "text-emerald-600"
                                        : "text-red-500"
                                }
                            >
                                {getTotalStat(
                                    restaurant.currentStaff,
                                    "cuisine"
                                )}
                                /40
                            </span>
                        </div>
                        <div
                            className="text-xs"
                            style={{
                                color: "var(--color-principalBrown)",
                            }}
                        >
                            <span>💖 Service: </span>
                            <span
                                className={
                                    getTotalStat(
                                        restaurant.currentStaff,
                                        "service"
                                    ) >= 20
                                        ? "text-emerald-600"
                                        : "text-red-500"
                                }
                            >
                                {getTotalStat(
                                    restaurant.currentStaff,
                                    "service"
                                )}
                                /20
                            </span>
                        </div>
                        <div
                            className="text-xs"
                            style={{
                                color: "var(--color-principalBrown)",
                            }}
                        >
                            <span>🎭 Ambiance: </span>
                            <span
                                className={
                                    getTotalStat(
                                        restaurant.currentStaff,
                                        "ambiance"
                                    ) >= 10
                                        ? "text-emerald-600"
                                        : "text-red-500"
                                }
                            >
                                {getTotalStat(
                                    restaurant.currentStaff,
                                    "ambiance"
                                )}
                                /10
                            </span>
                        </div>
                        <div
                            className="text-xs"
                            style={{
                                color: "var(--color-principalBrown)",
                            }}
                        >
                            <span>💴 Profit: </span>
                            <span className="text-emerald-600">
                                {formatCurrency(restaurant.forecastedProfit)}
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[color:var(--color-principalBrown)] border-opacity-20">
                        <div
                            className="text-xs text-center"
                            style={{ color: "var(--color-principalRed)" }}
                        >
                            Click to manage staff
                        </div>
                    </div>
                </div>
            </MenuContainer>
        </div>
    );
};

RestaurantPreview.propTypes = {
    restaurant: PropTypes.object,
    position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    formatCurrency: PropTypes.func.isRequired,
    getTotalStat: PropTypes.func.isRequired,
};

export default RestaurantPreview;

