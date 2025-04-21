import { useEffect, useState } from "react";
import { EventBus } from "../../game/EventBus";
import { useGameState, useFinances } from "../../store/gameStateHooks";
import { useSound } from "../../hooks/useSound";

const DeliveryRunComponent = () => {
    const gameState = useGameState();
    const { formatCurrency } = useFinances();
    const { playClickSound } = useSound();

    // State for delivery results data and UI control
    const [resultsData, setResultsData] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [showRankDisplay, setShowRankDisplay] = useState(false);
    const [animationPhase, setAnimationPhase] = useState("running"); // "running", "results", "rank", "complete"

    // Get business rank from gameState
    const businessRank = gameState?.gameProgress?.businessRank || 200;

    useEffect(() => {
        // Listen for results ready event from Phaser scene
        const handleResultsReady = (data) => {
            console.log("Delivery results ready:", data);
            setResultsData(data);

            // If we're not already in results view (from skip button)
            if (animationPhase === "running") {
                // Show results after a short delay
                setTimeout(() => {
                    setAnimationPhase("results");
                    setShowResults(true);
                }, 500);
            }
        };

        EventBus.on("deliveryResultsReady", handleResultsReady);

        // Cleanup
        return () => {
            EventBus.off("deliveryResultsReady", handleResultsReady);
        };
    }, [animationPhase]);

    // Handle showing rank display
    const handleShowRank = () => {
        playClickSound();
        setShowRankDisplay(true);
        setAnimationPhase("rank");
    };

    // Handle returning to hub
    const handleReturnToHub = () => {
        playClickSound();
        setAnimationPhase("complete");

        // Emit event to tell Phaser scene to return to hub
        EventBus.emit("returnToHub");
    };

    // Get noodle-themed rank name based on rank number
    const getNoodleRankName = (rank) => {
        if (rank <= 10) return { name: "Ramen Temple", color: "#EF4444" };
        if (rank <= 20)
            return { name: "Heavenly Noodle Chain", color: "#F97316" };
        if (rank <= 50) return { name: "Master Noodle Bar", color: "#FBBF24" };
        if (rank <= 100) return { name: "Local Noodle Spot", color: "#4ADE80" };
        if (rank <= 150) return { name: "Street Stand", color: "#0EA5E9" };
        return { name: "Back-Alley Broth Shack", color: "#8B5CF6" };
    };

    // Function to summarize events impact for a restaurant
    const getEventsSummary = (restaurant) => {
        if (!restaurant.events || restaurant.events.length === 0) {
            return { positive: 0, negative: 0, total: 0, count: 0 };
        }

        let positive = 0;
        let negative = 0;

        restaurant.events?.forEach((event) => {
            if (event.impact > 0) {
                positive += event.impact * restaurant.forecastedProfit;
            } else {
                negative += event.impact * restaurant.forecastedProfit;
            }
        });

        return {
            positive: Math.round(positive),
            negative: Math.round(negative),
            total: Math.round(positive + negative),
            count: restaurant.events.length,
        };
    };

    // Render business performance results table
    const renderResultsTable = () => {
        if (!resultsData || !resultsData.restaurants) return null;

        return (
            <div className="bg-whiteCream shadow-2xl rounded-xl p-6 w-full max-w-5xl mx-auto transition-discrete duration-500 animate-fade-in">
                <h2 className="text-2xl font-bold text-principalBrown mb-4 text-center">
                    Business Performance Results
                </h2>

                <div className="overflow-x-auto bg-white rounded-xl shadow-inner">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-yellowWhite bg-opacity-20 text-principalBrown uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">#</th>
                                <th className="py-3 px-6 text-left">
                                    Restaurant
                                </th>
                                <th className="py-3 px-6 text-right">Sales</th>
                                <th className="py-3 px-6 text-right">
                                    Property Costs
                                </th>
                                <th className="py-3 px-6 text-right">
                                    Labor Costs
                                </th>
                                <th className="py-3 px-6 text-right">
                                    Events Impact
                                </th>
                                <th className="py-3 px-6 text-right">Profit</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {resultsData.restaurants.map(
                                (restaurant, index) => {
                                    // Demo values - in production these would come from the backend calculation
                                    const maintenance =
                                        restaurant.maintenance ||
                                        Math.round(
                                            restaurant.forecastedProfit * 0.1
                                        );
                                    const laborCost =
                                        restaurant.staffCost ||
                                        Math.round(
                                            restaurant.forecastedProfit * 0.15
                                        );

                                    // Calculate events impact
                                    const eventsSummary =
                                        getEventsSummary(restaurant);

                                    // Calculate total sales including adjustments
                                    const sales =
                                        restaurant.actualProfit +
                                        maintenance +
                                        laborCost;
                                    const profit = restaurant.actualProfit;

                                    return (
                                        <tr
                                            key={restaurant.id}
                                            className="border-b border-gray-200 hover:bg-yellowWhite hover:bg-opacity-20 transition-discrete"
                                        >
                                            <td className="py-3 px-6 text-left">
                                                {index + 1}
                                            </td>
                                            <td className="py-3 px-6 text-left font-medium">
                                                {restaurant.name}
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                {formatCurrency(sales)}
                                            </td>
                                            <td className="py-3 px-6 text-right text-principalRed">
                                                {formatCurrency(maintenance)}
                                            </td>
                                            <td className="py-3 px-6 text-right text-principalRed">
                                                {formatCurrency(laborCost)}
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                {eventsSummary.count > 0 ? (
                                                    <div className="flex flex-col items-end">
                                                        {eventsSummary.positive >
                                                            0 && (
                                                            <span className="text-emerald-600">
                                                                +
                                                                {formatCurrency(
                                                                    eventsSummary.positive
                                                                )}
                                                            </span>
                                                        )}
                                                        {eventsSummary.negative <
                                                            0 && (
                                                            <span className="text-principalRed">
                                                                {formatCurrency(
                                                                    eventsSummary.negative
                                                                )}
                                                            </span>
                                                        )}
                                                        <span
                                                            className={`font-bold ${
                                                                eventsSummary.total >=
                                                                0
                                                                    ? "text-emerald-600"
                                                                    : "text-principalRed"
                                                            }`}
                                                        >
                                                            {formatCurrency(
                                                                eventsSummary.total
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">
                                                        No events
                                                    </span>
                                                )}
                                            </td>
                                            <td
                                                className="py-3 px-6 text-right font-bold"
                                                style={{
                                                    color:
                                                        profit >= 0
                                                            ? "#10B981"
                                                            : "#a02515",
                                                }}
                                            >
                                                {formatCurrency(profit)}
                                            </td>
                                        </tr>
                                    );
                                }
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-yellowWhite bg-opacity-10 text-principalBrown font-bold">
                                <td className="py-3 px-6 text-left" colSpan={6}>
                                    Overall Profit
                                </td>
                                <td
                                    className="py-3 px-6 text-right"
                                    style={{
                                        color:
                                            resultsData.totalProfit >= 0
                                                ? "#10B981"
                                                : "#a02515",
                                    }}
                                >
                                    {formatCurrency(resultsData.totalProfit)}
                                </td>
                            </tr>
                            <tr className="bg-yellowWhite bg-opacity-10 text-principalBrown font-bold">
                                <td className="py-3 px-6 text-left" colSpan={6}>
                                    Management Funds
                                </td>
                                <td className="py-3 px-6 text-right text-emerald-600">
                                    {formatCurrency(
                                        gameState?.finances?.funds || 0
                                    )}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {animationPhase === "results" && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleShowRank}
                            className="bg-gradient-to-r from-principalRed to-principalRed-light text-whiteCream font-bold py-3 px-8 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
                        >
                            <span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </span>
                            View Noodle Rank Progression
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Render business rank display with horizontal rank ladder
    const renderRankDisplay = () => {
        const newRank = resultsData?.rankChange
            ? businessRank + resultsData.rankChange
            : businessRank;

        // Improved rank is represented by a lower number
        const isImproved = newRank < businessRank;

        // Get rank details for the new rank
        const newRankDetails = getNoodleRankName(newRank);

        return (
            <div className="bg-yellowWhite shadow-2xl rounded-xl p-6 w-full max-w-5xl mx-auto mt-4 transition-discrete duration-500 animate-fade-in">
                <h2 className="text-3xl font-bold text-principalRed text-center mb-6">
                    Noodle Empire Ranking
                </h2>

                {/* Horizontal Rank Progression Bar */}
                <div className="bg-whiteCream rounded-lg p-6 shadow-inner relative overflow-hidden">
                    {/* Noodle pattern background */}
                    <div className="absolute inset-0 bg-[url('/assets/deliveryrun/noodle_pattern.png')] bg-repeat opacity-5"></div>

                    {/* Main progress bar container */}
                    <div className="relative mt-8 mb-16">
                        {/* Progress bar background */}
                        <div className="h-6 bg-principalBrown/10 rounded-full shadow-inner overflow-hidden">
                            {/* Filled progress portion */}
                            <div
                                className="h-full bg-gradient-to-r from-principalRed to-principalRed-light rounded-full transition-all duration-700 ease-out-circ"
                                style={{
                                    width: `${((200 - newRank) / 199) * 100}%`,
                                }}
                            ></div>
                        </div>

                        {/* Rank ticks on bar */}
                        <div className="absolute top-0 left-0 right-0 h-6 flex justify-between px-1 pointer-events-none">
                            <div className="h-full w-0.5 bg-white/30"></div>
                            <div className="h-full w-0.5 bg-white/30"></div>
                            <div className="h-full w-0.5 bg-white/30"></div>
                            <div className="h-full w-0.5 bg-white/30"></div>
                            <div className="h-full w-0.5 bg-white/30"></div>
                            <div className="h-full w-0.5 bg-white/30"></div>
                        </div>

                        {/* Player marker overlay */}
                        <div
                            className="absolute top-0 -translate-y-5 transition-all duration-700 ease-out-circ"
                            style={{
                                left: `calc(${
                                    ((200 - newRank) / 199) * 100
                                }% - 12px)`,
                            }}
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-white border-2 border-principalRed shadow-lg flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-principalRed">
                                        #{newRank}
                                    </span>
                                </div>
                                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-principalRed"></div>
                            </div>
                        </div>
                    </div>

                    {/* Rank labels */}
                    <div className="flex justify-between mt-2 px-1 mb-8">
                        <div className="flex flex-col items-center">
                            <div className="text-xs font-bold mb-1 text-center text-purple-600">
                                #200
                            </div>
                            <div className="py-1 px-2 bg-purple-600 text-white text-xs rounded-md font-bold shadow-sm whitespace-nowrap">
                                Back-Alley
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-xs font-bold mb-1 text-center text-blue-500">
                                #150
                            </div>
                            <div className="py-1 px-2 bg-blue-500 text-white text-xs rounded-md font-bold shadow-sm whitespace-nowrap">
                                Street Stand
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-xs font-bold mb-1 text-center text-green-500">
                                #100
                            </div>
                            <div className="py-1 px-2 bg-green-500 text-white text-xs rounded-md font-bold shadow-sm whitespace-nowrap">
                                Local Spot
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-xs font-bold mb-1 text-center text-amber-500">
                                #50
                            </div>
                            <div className="py-1 px-2 bg-amber-500 text-black text-xs rounded-md font-bold shadow-sm whitespace-nowrap">
                                Master Bar
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-xs font-bold mb-1 text-center text-orange-500">
                                #20
                            </div>
                            <div className="py-1 px-2 bg-orange-500 text-white text-xs rounded-md font-bold shadow-sm whitespace-nowrap">
                                Heavenly
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-xs font-bold mb-1 text-center text-red-500">
                                #1
                            </div>
                            <div className="py-1 px-2 bg-red-500 text-white text-xs rounded-md font-bold shadow-sm whitespace-nowrap">
                                Ramen Temple
                            </div>
                        </div>
                    </div>

                    {/* Progress bar legend */}
                    <div className="mt-6 grid grid-cols-2 gap-4 max-w-3xl mx-auto text-center bg-principalRed-light/60 p-4 rounded-lg">
                        <div className="flex flex-col items-center">
                            <div className="text-sm text-white font-medium">
                                Your Current Rank
                            </div>
                            <div className="text-2xl text-white font-bold">
                                #{newRank}
                            </div>
                            <div className="text-sm font-medium text-white">
                                {newRankDetails.name}
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-sm text-white font-medium">
                                Improvement
                            </div>
                            <div className="text-2xl text-white font-bold">
                                {isImproved ? (
                                    <span className="text-green-400">
                                        +{businessRank - newRank}
                                    </span>
                                ) : (
                                    <span className="text-red-400">0</span>
                                )}
                            </div>
                            <div className="text-sm text-white font-medium">
                                Ranks
                            </div>
                        </div>
                    </div>
                </div>

                {animationPhase === "rank" && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleReturnToHub}
                            className="bg-gradient-to-r from-amber-600 to-amber-500 text-whiteCream font-bold py-3 px-8 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Return to Noodle Business Hub
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Render HUD elements
    const renderHUD = () => {
        return (
            <div className="fixed inset-0 pointer-events-none z-10">
                {/* Top HUD Bar */}
                <div className="bg-gradient-to-r from-principalBrown to-principalBrown/90 text-yellowWhite p-4 flex justify-between items-center shadow-lg border-b border-principalRed/50">
                    <div className="flex items-center gap-4">
                        <img
                            src="/noodles.png"
                            alt="Logo"
                            className="h-10 w-10"
                        />
                        <h1 className="text-2xl font-bold">
                            Business Performance Report
                        </h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs opacity-70">Period:</span>
                            <span className="text-xl font-bold">
                                {gameState?.gameProgress?.currentPeriod || 1}
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs opacity-70">Funds:</span>
                            <span className="text-xl font-bold">
                                ¥
                                {(
                                    gameState?.finances?.funds || 5000000
                                ).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className={`absolute inset-0 overflow-auto transition-colors duration-500 ${
                showResults || showRankDisplay ? "bg-principalBrown/80" : ""
            }`}
        >
            {/* HUD overlay */}
            {renderHUD()}

            {/* Content area with results */}
            <div className="container mx-auto mt-20 mb-8 flex flex-col items-center justify-start p-4 md:p-8 max-w-6xl">
                {/* Results Table */}
                {showResults && renderResultsTable()}

                {/* Rank Display */}
                {showRankDisplay && renderRankDisplay()}
            </div>
        </div>
    );
};

export default DeliveryRunComponent;

