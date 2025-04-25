import PropTypes from "prop-types";
import {
    useGamePeriod,
    usePlayerStats,
    useFinances,
    useRestaurants,
    useEmployees,
} from "../../store/gameStateHooks";

const GameOverModal = ({ isOpen, reason }) => {
    // Use hooks at the top level
    const { currentPeriod = 0 } = useGamePeriod();
    const { playerRank = 200 } = usePlayerStats();
    const { totalBalance = 0 } = useFinances();
    const { bars: restaurants = [] } = useRestaurants();
    const { rosterWithDetails: employees = [] } = useEmployees();

    if (!isOpen) return null;

    // Helper function to safely format numbers
    const formatNumber = (number = 0) => {
        return (number || 0).toLocaleString();
    };

    // Calculate stats directly from state
    const stats = {
        periods: currentPeriod || 0,
        totalRevenue: totalBalance || 0,
        peakRank: playerRank || 200,
        restaurantsOwned: restaurants?.length || 0,
        totalEmployees: employees?.length || 0,
        highestSalary:
            employees?.length > 0
                ? Math.max(...employees.map((emp) => emp?.salary || 0), 0)
                : 0,
        totalTraining:
            employees?.reduce(
                (total, emp) => total + (emp?.training || 0),
                0
            ) || 0,
        averageMorale:
            employees?.length > 0
                ? Math.round(
                      employees.reduce(
                          (sum, emp) => sum + (emp?.morale || 0),
                          0
                      ) / employees.length
                  )
                : 0,
    };

    const handleReturnToMainMenu = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    const getGameOverMessage = () => {
        switch (reason) {
            case "financial":
                return "You've lost your financial balance. Your noodle empire has gone bankrupt after struggling with negative funds for too long.";
            case "burnout":
                return "You've completely burned out. The stress of managing your noodle empire has taken its toll on your personal well-being.";
            case "both":
                return "You've lost both your financial and personal balance. Managing a business requires maintaining both aspects in harmony.";
            default:
                return "Your noodle empire journey has come to an end.";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-whiteCream p-8 rounded-2xl max-w-2xl w-full mx-4 relative overflow-hidden">
                {/* Red banner at top */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-principalRed"></div>

                {/* Game Over Title */}
                <h2 className="text-4xl font-bold text-principalRed mb-6 text-center">
                    Game Over
                </h2>

                {/* Message */}
                <p className="text-lg text-principalBrown mb-8 text-center">
                    {getGameOverMessage()}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-yellowWhite p-4 rounded-lg">
                        <h3 className="font-bold text-principalBrown mb-2">
                            Business Stats
                        </h3>
                        <ul className="space-y-2 text-principalBrown/80 text-sm">
                            <li>Periods Survived: {stats.periods}</li>
                            <li>
                                Total Revenue: $
                                {formatNumber(stats.totalRevenue)}
                            </li>
                            <li>Peak Rank: {stats.peakRank}</li>
                            <li>Restaurants Owned: {stats.restaurantsOwned}</li>
                        </ul>
                    </div>
                    <div className="bg-yellowWhite p-4 rounded-lg">
                        <h3 className="font-bold text-principalBrown mb-2">
                            Employee Stats
                        </h3>
                        <ul className="space-y-2 text-principalBrown/80 text-sm">
                            <li>Total Employees: {stats.totalEmployees}</li>
                            <li>
                                Highest Paid: $
                                {formatNumber(stats.highestSalary)}/period
                            </li>
                            <li>Total Training: {stats.totalTraining}</li>
                            <li>Average Morale: {stats.averageMorale}%</li>
                        </ul>
                    </div>
                </div>

                {/* Return to Main Menu Button */}
                <button
                    onClick={handleReturnToMainMenu}
                    className="w-full bg-principalRed hover:bg-principalRed-light text-white font-bold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    <span>Return to Main Menu</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

GameOverModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    reason: PropTypes.oneOf(["financial", "burnout", "both"]).isRequired,
};

export default GameOverModal;

