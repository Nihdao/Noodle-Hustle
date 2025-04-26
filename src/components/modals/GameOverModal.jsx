import PropTypes from "prop-types";
import {
    useGamePeriod,
    usePlayerStats,
    useFinances,
    useRestaurants,
    useEmployees,
} from "../../store/gameStateHooks"; // Adjust path as needed

const GameOverModal = ({ isOpen, reason }) => {
    // Use hooks at the top level
    const { currentPeriod = 0 } = useGamePeriod();
    const { businessRank = 200 } = usePlayerStats(); // Use businessRank
    const { totalBalance = 0 } = useFinances();
    const { bars: restaurants = [] } = useRestaurants();
    const { rosterWithDetails: employees = [] } = useEmployees();

    if (!isOpen) return null;

    // Helper function to safely format numbers
    const formatNumber = (number = 0) => {
        return (number || 0).toLocaleString();
    };

    // Calculate stats directly from state (matching GameState.js update)
    const stats = {
        periods: currentPeriod || 0,
        totalRevenue: totalBalance || 0,
        peakRank: businessRank || 200,
        restaurantsOwned: restaurants?.length || 0,
        totalEmployees: employees?.length || 0,
        highestSalary:
            employees?.length > 0
                ? Math.max(...employees.map((emp) => emp?.salary || 0), 0)
                : 0,
        // totalTraining: // Not available in current state structure
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
        console.log("Clearing game data and returning to main menu...");
        localStorage.clear(); // Clear all local storage
        window.location.href = "/"; // Redirect to the root (MainMenu)
    };

    const getGameOverMessage = () => {
        switch (reason) {
            case "financial":
                return "You've lost your financial balance. Your noodle empire has gone bankrupt due to negative funds.";
            case "burnout":
                return "You've completely burned out. The stress of managing your noodle empire has taken its toll on your personal well-being.";
            case "both":
                return "You've lost both your financial and personal balance. Managing a business requires maintaining both aspects in harmony.";
            default:
                return "Your noodle empire journey has come to an end.";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
            {" "}
            {/* Ensure high z-index */}
            <div className="bg-whiteCream p-8 rounded-2xl max-w-2xl w-full mx-4 relative overflow-hidden shadow-2xl animate-fade-in">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-yellowWhite p-4 rounded-lg shadow-inner">
                        <h3 className="font-bold text-principalBrown mb-2">
                            Business Stats
                        </h3>
                        <ul className="space-y-2 text-principalBrown/80 text-sm">
                            <li>Periods Survived: {stats.periods}</li>
                            <li>
                                Final Net Worth: ¥
                                {formatNumber(stats.totalRevenue)}
                            </li>
                            <li>Final Rank: #{stats.peakRank}</li>
                            <li>Restaurants Owned: {stats.restaurantsOwned}</li>
                        </ul>
                    </div>
                    <div className="bg-yellowWhite p-4 rounded-lg shadow-inner">
                        <h3 className="font-bold text-principalBrown mb-2">
                            Employee Stats
                        </h3>
                        <ul className="space-y-2 text-principalBrown/80 text-sm">
                            <li>Total Employees: {stats.totalEmployees}</li>
                            <li>
                                Highest Salary: ¥
                                {formatNumber(stats.highestSalary)}/period
                            </li>
                            {/* <li>Total Training Sessions: {stats.totalTraining}</li> */}
                            {/* Omitted as data not available */}
                            <li>Average Morale: {stats.averageMorale}%</li>
                        </ul>
                    </div>
                </div>

                {/* Return to Main Menu Button */}
                <button
                    onClick={handleReturnToMainMenu}
                    className="w-full bg-principalRed hover:bg-principalRed-light text-white font-bold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
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
    reason: PropTypes.oneOf(["financial", "burnout", "both", null]), // Allow null initially
};

export default GameOverModal;

