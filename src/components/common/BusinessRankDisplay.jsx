import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import gameState from "../../game/GameState";
import rankData from "../../data/rank.json";

/**
 * Component to display business rank information and progress
 */
const BusinessRankDisplay = ({ showDetails = false, className = "" }) => {
    const [rank, setRank] = useState(200);
    const [category, setCategory] = useState("");
    const [totalBalance, setTotalBalance] = useState(0);
    const [nextRank, setNextRank] = useState(null);
    const [rankTitle, setRankTitle] = useState("");

    useEffect(() => {
        // Get initial state
        const state = gameState.getGameState();
        if (state) {
            updateRankInfo(state);
        }

        // Subscribe to state updates
        const handleGameStateUpdate = (newState) => {
            updateRankInfo(newState);
        };

        gameState.events.on("gameStateUpdated", handleGameStateUpdate);

        return () => {
            gameState.events.off("gameStateUpdated", handleGameStateUpdate);
        };
    }, []);

    // Update rank information from game state
    const updateRankInfo = (state) => {
        const currentRank = state.gameProgress?.businessRank || 200;
        const currentCategory =
            state.gameProgress?.businessCategory ||
            gameState.getBusinessCategoryFromRank(currentRank);
        const currentTotalBalance = state.finances?.totalBalance || 0;

        // Get rank details including title
        const details = gameState.getRankDetails(currentRank);

        // Get next rank threshold
        const nextRankInfo = gameState.getNextRankThreshold();

        setRank(currentRank);
        setCategory(currentCategory);
        setTotalBalance(currentTotalBalance);
        setNextRank(nextRankInfo);
        setRankTitle(details?.title || "");
    };

    // Calculate progress to next rank
    const calculateProgress = () => {
        if (!nextRank) return 100; // Already at highest rank

        const currentBalance = totalBalance;
        const targetBalance = nextRank.balanceRequired;
        const prevRankBalance = findPreviousRankBalance(nextRank.rank);

        // Calculate progress percentage
        const totalRange = targetBalance - prevRankBalance;
        const currentProgress = currentBalance - prevRankBalance;

        if (totalRange <= 0) return 100;
        return Math.min(100, Math.max(0, (currentProgress / totalRange) * 100));
    };

    // Find the balance threshold of the previous rank
    const findPreviousRankBalance = (targetRank) => {
        const prevRanks = rankData.rankDetails
            .filter((r) => r.rank > targetRank)
            .sort((a, b) => a.rank - b.rank);

        if (prevRanks.length > 0) {
            return prevRanks[0].balanceRequired;
        }

        return 0;
    };

    const progressPercentage = calculateProgress();

    // Basic display for minimal mode
    if (!showDetails) {
        return (
            <div className={`flex items-center text-sm ${className}`}>
                <span className="font-bold mr-1">Rank:</span>
                <span>{rank}</span>
                <span className="mx-1">•</span>
                <span className="text-principalRed">{category}</span>
            </div>
        );
    }

    // Detailed display with progress
    return (
        <div
            className={`bg-whiteCream border border-yellowWhite-dark rounded-lg p-4 shadow-lg ${className}`}
        >
            {/* Header with rank and title */}
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-yellowWhite-dark">
                <div>
                    <h3 className="font-bold text-lg text-principalBrown">
                        Business Rank
                    </h3>
                    <p className="text-sm text-principalBrown">
                        Total Earnings:{" "}
                        <span className="font-semibold">
                            ¥{totalBalance.toLocaleString()}
                        </span>
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold text-principalRed">
                        {rank}
                    </div>
                    <div className="text-sm font-medium text-principalBrown">
                        {rankTitle}
                    </div>
                </div>
            </div>

            {/* Category and progress */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-md font-semibold text-principalBrown px-2 py-1 bg-yellowWhite rounded-md inline-block">
                        {category}
                    </div>
                    {nextRank && (
                        <div className="text-xs text-gray-600 flex items-center">
                            <span className="mr-1">Next:</span>
                            <span className="font-medium">{nextRank.rank}</span>
                            <span className="mx-1 opacity-50">•</span>
                            <span className="italic">{nextRank.title}</span>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                        className="bg-gradient-to-r from-principalRed to-principalRed-light h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>

                {/* Progress details */}
                {nextRank && (
                    <div className="text-xs text-gray-700 bg-yellowWhite px-3 py-2 rounded-md">
                        <span className="font-semibold">
                            ¥{totalBalance.toLocaleString()}
                        </span>{" "}
                        /
                        <span className="font-semibold">
                            {" "}
                            ¥{nextRank.balanceRequired.toLocaleString()}
                        </span>{" "}
                        to reach rank{" "}
                        <span className="font-semibold text-principalRed">
                            {nextRank.rank}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

BusinessRankDisplay.propTypes = {
    showDetails: PropTypes.bool,
    className: PropTypes.string,
};

export default BusinessRankDisplay;

