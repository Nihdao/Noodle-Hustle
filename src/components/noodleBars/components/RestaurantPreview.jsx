// This component is no longer needed as mentioned by the user.
// It will be kept for reference but won't be used in the application.

import PropTypes from "prop-types";
import MenuContainer from "../../common/MenuContainer";

const RestaurantPreview = ({
    restaurant,
    position,
    formatCurrency,
    getTotalStat,
}) => {
    if (!restaurant) return null;

    // Safely get profit value with fallbacks
    const getProfit = () => {
        const forecastedProfit = restaurant.forecastedProfit || 0;
        const staffCost = restaurant.staffCost || 0;
        const maintenance = restaurant.maintenance || 0;
        return forecastedProfit - staffCost - maintenance;
    };

    // Safely calculate staff stats - handle cases where currentStaff might be undefined
    const safeGetTotalStat = (stat) => {
        if (!Array.isArray(restaurant.currentStaff)) {
            return 0;
        }
        return getTotalStat(restaurant.currentStaff, stat);
    };

    // Get the target values for each stat
    const getCuisineTarget = () => restaurant.productCap || 40;
    const getServiceTarget = () => restaurant.serviceCap || 20;
    const getAmbianceTarget = () => restaurant.ambianceCap || 10;

    // Determine if stat meets target
    const isStatSufficient = (stat, value) => {
        const targets = {
            cuisine: getCuisineTarget(),
            service: getServiceTarget(),
            ambiance: getAmbianceTarget(),
        };
        return value >= targets[stat];
    };

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
                                    isStatSufficient(
                                        "cuisine",
                                        safeGetTotalStat("cuisine")
                                    )
                                        ? "text-emerald-600"
                                        : "text-red-500"
                                }
                            >
                                {safeGetTotalStat("cuisine")}/
                                {getCuisineTarget()}
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
                                    isStatSufficient(
                                        "service",
                                        safeGetTotalStat("service")
                                    )
                                        ? "text-emerald-600"
                                        : "text-red-500"
                                }
                            >
                                {safeGetTotalStat("service")}/
                                {getServiceTarget()}
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
                                    isStatSufficient(
                                        "ambiance",
                                        safeGetTotalStat("ambiance")
                                    )
                                        ? "text-emerald-600"
                                        : "text-red-500"
                                }
                            >
                                {safeGetTotalStat("ambiance")}/
                                {getAmbianceTarget()}
                            </span>
                        </div>
                        <div
                            className="text-xs"
                            style={{
                                color: "var(--color-principalBrown)",
                            }}
                        >
                            <span>💴 Profit: </span>
                            <span
                                className={
                                    getProfit() < 0
                                        ? "text-orange-500"
                                        : "text-emerald-600"
                                }
                            >
                                {formatCurrency(getProfit())}
                            </span>
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

