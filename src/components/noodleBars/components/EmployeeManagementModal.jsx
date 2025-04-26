import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import MenuContainer from "../../common/MenuContainer";
import { formatCurrency, getTotalStat } from "../utils/restaurantUtils";
import {
    useNoodleBarOperations,
    useRestaurants,
} from "../../../store/gameStateHooks";

const EmployeeManagementModal = ({
    selectedBar,
    showDetails,
    detailsPosition,
    allEmployees,
    onCloseDetails,
    onRemoveEmployee,
    onAssignEmployee,
}) => {
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [showMinimumEmployeeWarning, setShowMinimumEmployeeWarning] =
        useState(false);

    const { getRestaurantNameById, getRestaurantStaff } =
        useNoodleBarOperations();
    const { getRestaurantById } = useRestaurants();

    // IMPORTANT: Ne pas utiliser d'état local pour les données du restaurant
    // Utiliser directement les données provenant des props et les hooks de récupération de données

    // Au lieu d'un useEffect, on utilise directement les props et les hooks
    const getCurrentRestaurantData = useCallback(() => {
        if (!selectedBar?.id) return null;

        // Récupérer les données fraîches à la demande
        const freshData = getRestaurantById(selectedBar.id);
        if (!freshData) return selectedBar;

        // Combiner avec les données de staff actuelles
        return {
            ...freshData,
            currentStaff: getRestaurantStaff(selectedBar.id) || [],
        };
    }, [selectedBar, getRestaurantById, getRestaurantStaff]);

    // Utiliser directement la fonction pour obtenir les données actuelles
    const displayedBar = getCurrentRestaurantData();

    if (!displayedBar) return null;

    const getStaffCount = () => {
        return Array.isArray(displayedBar?.currentStaff)
            ? displayedBar.currentStaff.length
            : 0;
    };

    const getStaffSlots = () => {
        return displayedBar?.staffSlots || 3;
    };

    const getCurrentStaff = () => {
        return Array.isArray(displayedBar?.currentStaff)
            ? displayedBar.currentStaff
            : [];
    };

    const safeTotalStat = (stat) => {
        if (!Array.isArray(displayedBar?.currentStaff)) {
            return 0;
        }
        return getTotalStat(displayedBar.currentStaff, stat);
    };

    const getSalesVolume = () => {
        return (
            displayedBar?.salesVolume ||
            displayedBar?.forecastedProfit ||
            displayedBar?.baseProfit ||
            0
        );
    };

    const getCuisineTarget = () =>
        displayedBar?.productCap || displayedBar?.maxProduct || 40;
    const getServiceTarget = () =>
        displayedBar?.serviceCap || displayedBar?.maxService || 20;
    const getAmbianceTarget = () =>
        displayedBar?.ambianceCap || displayedBar?.maxAmbiance || 10;

    const calculateMalus = () => {
        const criteresNonRemplis = [];

        if (safeTotalStat("cuisine") < getCuisineTarget()) {
            criteresNonRemplis.push("cuisine");
        }

        if (safeTotalStat("service") < getServiceTarget()) {
            criteresNonRemplis.push("service");
        }

        if (safeTotalStat("ambiance") < getAmbianceTarget()) {
            criteresNonRemplis.push("ambiance");
        }

        const count = criteresNonRemplis.length;

        let malusPercentage = 0;
        if (count === 1) malusPercentage = 30;
        else if (count === 2) malusPercentage = 60;
        else if (count === 3) malusPercentage = 100;

        const forecastedProfit = getSalesVolume();
        const malusAmount =
            count > 0
                ? Math.round(forecastedProfit * (malusPercentage / 100))
                : 0;

        return {
            count,
            criteresNonRemplis,
            malusPercentage,
            malusAmount,
        };
    };

    const getFilteredEmployees = () => {
        let filtered = [...(allEmployees || [])];

        if (employeeSearchTerm.trim() !== "") {
            filtered = filtered.filter((emp) =>
                emp.name
                    .toLowerCase()
                    .includes(employeeSearchTerm.toLowerCase())
            );
        }

        if (activeTab === "Available") {
            filtered = filtered.filter((emp) => !emp.assigned);
        } else if (activeTab === "Assigned") {
            filtered = filtered.filter((emp) => emp.assigned);
        }

        return filtered;
    };

    const getRestaurantName = (assignedId) => {
        if (!assignedId) return null;
        return getRestaurantNameById(assignedId);
    };

    const canRemoveEmployee = () => {
        const currentStaffCount = getStaffCount();
        return currentStaffCount > 1;
    };

    const handleEmployeeClick = (employee) => {
        onAssignEmployee(employee);
    };

    const handleRemoveEmployeeClick = (employeeId, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!canRemoveEmployee()) {
            setShowMinimumEmployeeWarning(true);
            setTimeout(() => setShowMinimumEmployeeWarning(false), 3000);
            return;
        }

        onRemoveEmployee(employeeId);
    };

    const { malusAmount, count: criteresNonRemplisCount } = calculateMalus();

    const baseProfit = displayedBar.salesVolume || 0;
    const staffCost = displayedBar.staffCost || 0;
    const maintenance = displayedBar.maintenance || 0;
    const netProfit =
        baseProfit -
        staffCost -
        maintenance -
        (criteresNonRemplisCount > 0 ? malusAmount : 0);
    const profitClass = netProfit < 0 ? "text-red-500" : "text-emerald-600";

    return (
        <div
            className="fixed z-50 transition-all duration-500"
            style={{
                left: `${detailsPosition.x}px`,
                top: `${detailsPosition.y}px`,
                transform: "translate(-50%, -50%)",
            }}
        >
            <style>{`
                .tooltip-container {
                    position: relative;
                    cursor: help;
                }
                .tooltip-text {
                    visibility: hidden;
                    position: absolute;
                    bottom: 125%;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #333;
                    color: white;
                    text-align: center;
                    padding: 8px 12px;
                    border-radius: 6px;
                    z-index: 100;
                    opacity: 0;
                    transition: opacity 0.3s;
                    white-space: normal;
                    width: max-content;
                    max-width: 250px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    font-size: 12px;
                }
                .tooltip-text::after {
                    content: "";
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    margin-left: -5px;
                    border-width: 5px;
                    border-style: solid;
                    border-color: #333 transparent transparent transparent;
                }
                .tooltip-container:hover .tooltip-text {
                    visibility: visible;
                    opacity: 1;
                }
                .malus-detail {
                    margin-top: 4px;
                    font-size: 11px;
                    opacity: 0.9;
                }
                .criteria-list {
                    margin-top: 6px;
                    text-align: left;
                }
                .criteria-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 2px;
                }
                .criteria-icon {
                    color: #f87171;
                }
                .minimum-employee-warning {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #f87171;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    z-index: 1000;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    animation: fadeIn 0.3s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>

            {showMinimumEmployeeWarning && (
                <div className="minimum-employee-warning">
                    <strong>
                        At least one employee must remain in the restaurant!
                    </strong>
                </div>
            )}

            <MenuContainer
                animationState={showDetails ? "visible" : "hidden"}
                className="w-[750px] max-h-[80vh]"
                scrollable={true}
                maxHeight="80vh"
                title={displayedBar.name || "Restaurant"}
            >
                <div className="p-4">
                    <div className="flex justify-between mb-4 items-center">
                        <p className="italic text-[color:var(--color-principalBrown)] opacity-70">
                            {displayedBar.description ||
                                "No description available"}
                        </p>
                        <button
                            onClick={onCloseDetails}
                            className="text-[color:var(--color-principalRed)] hover:text-[color:var(--color-principalRed-light)] transition-colors p-1"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Sales Volume, Staff Cost, Net Profit summary - moved to top */}
                    <div className="flex justify-around mb-6 bg-yellowWhite/80 p-4 rounded-lg">
                        <div>
                            <h3
                                className="font-semibold"
                                style={{
                                    color: "var(--color-principalBrown)",
                                }}
                            >
                                Sales Volume
                            </h3>
                            <p className="text-emerald-600 font-bold">
                                {formatCurrency(getSalesVolume())}
                                {criteresNonRemplisCount > 0 && (
                                    <span className="text-red-500 text-xs">
                                        {" "}
                                        ({formatCurrency(-malusAmount)})
                                    </span>
                                )}
                            </p>
                        </div>
                        <div>
                            <h3
                                className="font-semibold"
                                style={{
                                    color: "var(--color-principalBrown)",
                                }}
                            >
                                Staff Cost
                            </h3>
                            <p className="text-red-500 font-bold">
                                {formatCurrency(staffCost)}
                            </p>
                        </div>
                        <div>
                            <h3
                                className="font-semibold"
                                style={{
                                    color: "var(--color-principalBrown)",
                                }}
                            >
                                Maintenance Cost
                            </h3>
                            <p className="text-red-500 font-bold">
                                {formatCurrency(maintenance)}
                            </p>
                        </div>
                        <div>
                            <h3
                                className="font-semibold"
                                style={{
                                    color: "var(--color-principalBrown)",
                                }}
                            >
                                Net Profit
                            </h3>
                            <div className="flex items-center">
                                <p className={`${profitClass} font-bold`}>
                                    {formatCurrency(netProfit)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Left column - Current staff */}
                        <div>
                            <h3
                                className="text-xl font-semibold mb-3"
                                style={{
                                    color: "var(--color-principalBrown)",
                                }}
                            >
                                Current Staff ({getStaffCount()}/
                                {getStaffSlots()})
                            </h3>

                            <div className="grid gap-2 mb-4">
                                {Array.from({
                                    length: getStaffSlots(),
                                }).map((_, index) => {
                                    const employee = getCurrentStaff()[index];
                                    return (
                                        <div
                                            key={index}
                                            className={`
                        rounded-lg p-2 border transition-all duration-200
                        ${
                            employee
                                ? "border-[color:var(--color-principalBrown)] bg-[color:var(--color-yellowWhite)] bg-opacity-30"
                                : "border-dashed border-gray-400 bg-gray-100 flex items-center justify-center h-16"
                        }
                      `}
                                        >
                                            {employee ? (
                                                <div className="relative grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                                                    {/* Employee type badge */}
                                                    <div
                                                        className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                              ${
                                  employee.rarity === "A"
                                      ? "bg-red-500"
                                      : employee.rarity === "B"
                                      ? "bg-blue-500"
                                      : employee.rarity === "C"
                                      ? "bg-green-500"
                                      : employee.rarity === "D"
                                      ? "bg-gray-500"
                                      : "bg-yellow-500"
                              }
                            `}
                                                    >
                                                        {employee.rarity}
                                                    </div>

                                                    {/* Employee info */}
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center">
                                                            <span className="font-bold text-[color:var(--color-principalBrown)]">
                                                                {employee.name}
                                                            </span>
                                                            <span className="ml-2 text-xs text-[color:var(--color-principalBrown)] opacity-70">
                                                                Lv.
                                                                {employee.level}
                                                                /5
                                                            </span>
                                                        </div>

                                                        {/* Stats in a single row */}
                                                        <div className="flex gap-2 text-xs text-[color:var(--color-principalBrown)]">
                                                            <span>
                                                                🍜{" "}
                                                                {
                                                                    employee.cuisine
                                                                }
                                                            </span>
                                                            <span>
                                                                💖{" "}
                                                                {
                                                                    employee.service
                                                                }
                                                            </span>
                                                            <span>
                                                                🎭{" "}
                                                                {
                                                                    employee.ambiance
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Remove button */}
                                                    <button
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={(e) =>
                                                            handleRemoveEmployeeClick(
                                                                employee.id,
                                                                e
                                                            )
                                                        }
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span
                                                    style={{
                                                        color: "var(--color-principalBrown)",
                                                        opacity: 0.5,
                                                    }}
                                                >
                                                    Empty Slot
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6">
                                <h3
                                    className="text-lg font-semibold mb-3"
                                    style={{
                                        color: "var(--color-principalBrown)",
                                    }}
                                >
                                    Performance Stats
                                    {criteresNonRemplisCount > 0 && (
                                        <span className="text-red-500 ml-2 text-sm font-normal tooltip-container">
                                            <span className="tooltip-text">
                                                <strong>
                                                    Warning: Sales penalty!
                                                </strong>
                                                <div className="malus-detail">
                                                    Each unmet stat negatively
                                                    affects your profits:
                                                </div>
                                                <div className="malus-detail">
                                                    • 1 stat: -30% profit
                                                </div>
                                                <div className="malus-detail">
                                                    • 2 stats: -60% profit
                                                </div>
                                                <div className="malus-detail">
                                                    • 3 stats: -100% profit
                                                </div>
                                            </span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 ml-1 inline"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                />
                                            </svg>
                                        </span>
                                    )}
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm">
                                            <span
                                                style={{
                                                    color: "var(--color-principalBrown)",
                                                }}
                                            >
                                                🍱 Cuisine (lv.
                                                {displayedBar.upgrades
                                                    ?.product || 1}
                                                /{displayedBar.maxProduct})
                                            </span>
                                            <span className="flex">
                                                <span
                                                    className={`px-1 ${
                                                        safeTotalStat(
                                                            "cuisine"
                                                        ) >= getCuisineTarget()
                                                            ? "text-emerald-600"
                                                            : "text-red-500"
                                                    }`}
                                                >
                                                    {safeTotalStat("cuisine")}
                                                </span>
                                                <span className="text-gray-500">
                                                    /{getCuisineTarget()}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full mt-1">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    safeTotalStat("cuisine") >=
                                                    getCuisineTarget()
                                                        ? "bg-emerald-500"
                                                        : "bg-red-500"
                                                }`}
                                                style={{
                                                    width: `${Math.min(
                                                        (safeTotalStat(
                                                            "cuisine"
                                                        ) /
                                                            getCuisineTarget()) *
                                                            100,
                                                        100
                                                    )}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm">
                                            <span
                                                style={{
                                                    color: "var(--color-principalBrown)",
                                                }}
                                            >
                                                💖 Service (lv.
                                                {displayedBar.upgrades
                                                    ?.service || 1}
                                                /{displayedBar.maxService})
                                            </span>
                                            <span className="flex">
                                                <span
                                                    className={`px-1 ${
                                                        safeTotalStat(
                                                            "service"
                                                        ) >= getServiceTarget()
                                                            ? "text-emerald-600"
                                                            : "text-red-500"
                                                    }`}
                                                >
                                                    {safeTotalStat("service")}
                                                </span>
                                                <span className="text-gray-500">
                                                    /{getServiceTarget()}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full mt-1">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    safeTotalStat("service") >=
                                                    getServiceTarget()
                                                        ? "bg-emerald-500"
                                                        : "bg-red-500"
                                                }`}
                                                style={{
                                                    width: `${Math.min(
                                                        (safeTotalStat(
                                                            "service"
                                                        ) /
                                                            getServiceTarget()) *
                                                            100,
                                                        100
                                                    )}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm">
                                            <span
                                                style={{
                                                    color: "var(--color-principalBrown)",
                                                }}
                                            >
                                                🎭 Ambiance (lv.
                                                {displayedBar.upgrades
                                                    ?.ambiance || 1}
                                                /{displayedBar.maxAmbiance})
                                            </span>
                                            <span className="flex">
                                                <span
                                                    className={`px-1 ${
                                                        safeTotalStat(
                                                            "ambiance"
                                                        ) >= getAmbianceTarget()
                                                            ? "text-emerald-600"
                                                            : "text-red-500"
                                                    }`}
                                                >
                                                    {safeTotalStat("ambiance")}
                                                </span>
                                                <span className="text-gray-500">
                                                    /{getAmbianceTarget()}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full mt-1">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    safeTotalStat("ambiance") >=
                                                    getAmbianceTarget()
                                                        ? "bg-emerald-500"
                                                        : "bg-red-500"
                                                }`}
                                                style={{
                                                    width: `${Math.min(
                                                        (safeTotalStat(
                                                            "ambiance"
                                                        ) /
                                                            getAmbianceTarget()) *
                                                            100,
                                                        100
                                                    )}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right column - Available employees */}
                        <div>
                            <h3
                                className="text-xl font-semibold mb-3"
                                style={{
                                    color: "var(--color-principalBrown)",
                                }}
                            >
                                Available Employees
                            </h3>

                            {/* Search input */}
                            <div className="mb-3 relative">
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    className="w-full py-2 px-3 rounded border border-[color:var(--color-yellowWhite-dark)] bg-[color:var(--color-whiteCream)] text-[color:var(--color-principalBrown)]"
                                    value={employeeSearchTerm}
                                    onChange={(e) =>
                                        setEmployeeSearchTerm(e.target.value)
                                    }
                                />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 absolute right-3 top-2.5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>

                            {/* Filter tabs */}
                            <div className="flex mb-3 border-b border-[color:var(--color-yellowWhite-dark)]">
                                <button
                                    className={`py-2 px-4 ${
                                        activeTab === "All"
                                            ? "border-b-2 border-[color:var(--color-principalRed)] text-[color:var(--color-principalRed)]"
                                            : "text-gray-500"
                                    } font-medium`}
                                    onClick={() => setActiveTab("All")}
                                >
                                    All
                                </button>
                                <button
                                    className={`py-2 px-4 ${
                                        activeTab === "Available"
                                            ? "border-b-2 border-[color:var(--color-principalRed)] text-[color:var(--color-principalRed)]"
                                            : "text-gray-500"
                                    } font-medium`}
                                    onClick={() => setActiveTab("Available")}
                                >
                                    Available
                                </button>
                                <button
                                    className={`py-2 px-4 ${
                                        activeTab === "Assigned"
                                            ? "border-b-2 border-[color:var(--color-principalRed)] text-[color:var(--color-principalRed)]"
                                            : "text-gray-500"
                                    } font-medium`}
                                    onClick={() => setActiveTab("Assigned")}
                                >
                                    Assigned
                                </button>
                            </div>

                            {/* Compact employee grid */}
                            <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-2 max-h-[300px]">
                                {getFilteredEmployees().map((employee) => (
                                    <div
                                        key={employee.id}
                                        className={`
                      p-2 rounded border transition-all duration-200 
                      hover:shadow-md cursor-pointer
                      grid grid-cols-[auto_1fr_auto] gap-2 items-center
                      ${
                          employee.assigned !== null &&
                          employee.assigned !== displayedBar.id
                              ? "bg-gray-100 border-gray-300"
                              : "bg-[color:var(--color-whiteCream)] border-[color:var(--color-principalBrown)]"
                      }
                    `}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleEmployeeClick(employee);
                                        }}
                                    >
                                        {/* Employee type badge */}
                                        <div
                                            className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                        ${
                            employee.rarity === "A"
                                ? "bg-red-500"
                                : employee.rarity === "B"
                                ? "bg-blue-500"
                                : employee.rarity === "C"
                                ? "bg-green-500"
                                : employee.rarity === "D"
                                ? "bg-gray-500"
                                : "bg-yellow-500"
                        }
                      `}
                                        >
                                            {employee.rarity}
                                        </div>

                                        {/* Employee info */}
                                        <div className="flex flex-col">
                                            <div className="flex items-center">
                                                <span className="font-bold text-[color:var(--color-principalBrown)]">
                                                    {employee.name}
                                                </span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    Lv.{employee.level}/5
                                                </span>
                                            </div>

                                            {/* Stats in a single row */}
                                            <div className="flex gap-2 text-xs text-[color:var(--color-principalBrown)]">
                                                <span>
                                                    🍜 {employee.cuisine}
                                                </span>
                                                <span>
                                                    💖 {employee.service}
                                                </span>
                                                <span>
                                                    🎭 {employee.ambiance}
                                                </span>
                                            </div>

                                            {/* Assignment status - Show restaurant name instead of ID */}
                                            {employee.assigned && (
                                                <div
                                                    className={`text-xs font-medium ${
                                                        employee.assigned ===
                                                        displayedBar.id
                                                            ? "text-emerald-600"
                                                            : "text-amber-600"
                                                    }`}
                                                >
                                                    {employee.assigned ===
                                                    displayedBar.id
                                                        ? "Currently assigned here"
                                                        : `At: ${
                                                              employee.assignedName ||
                                                              getRestaurantName(
                                                                  employee.assigned
                                                              )
                                                          }`}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action button */}
                                        <div>
                                            {employee.assigned ===
                                            displayedBar.id ? (
                                                <button
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={(e) =>
                                                        handleRemoveEmployeeClick(
                                                            employee.id,
                                                            e
                                                        )
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button
                                                    className={`
                            ${
                                employee.assigned
                                    ? "text-gray-400"
                                    : "text-[color:var(--color-principalRed)]"
                            }
                            hover:text-[color:var(--color-principalRed-light)]
                          `}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleEmployeeClick(
                                                            employee
                                                        );
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 4v16m8-8H4"
                                                        />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={onCloseDetails}
                            className="px-6 py-2 bg-[color:var(--color-principalRed)] text-[color:var(--color-whiteCream)] font-bold rounded-md hover:bg-[color:var(--color-principalRed-light)] transition-all duration-300 transform hover:scale-105"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </MenuContainer>
        </div>
    );
};

EmployeeManagementModal.propTypes = {
    selectedBar: PropTypes.object.isRequired,
    showDetails: PropTypes.bool.isRequired,
    detailsPosition: PropTypes.object.isRequired,
    allEmployees: PropTypes.array.isRequired,
    onCloseDetails: PropTypes.func.isRequired,
    onRemoveEmployee: PropTypes.func.isRequired,
    onAssignEmployee: PropTypes.func.isRequired,
};

export default EmployeeManagementModal;

