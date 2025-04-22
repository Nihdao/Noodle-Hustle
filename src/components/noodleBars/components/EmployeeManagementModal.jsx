import { useState } from "react";
import PropTypes from "prop-types";
import MenuContainer from "../../common/MenuContainer";
import { formatCurrency, getTotalStat } from "../utils/restaurantUtils";
import { useNoodleBarOperations } from "../../../store/gameStateHooks";

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

    // Utiliser les fonctions centralisées du hook
    const { getRestaurantNameById } = useNoodleBarOperations();

    // Safety functions to handle potentially undefined values
    const getStaffCount = () => {
        return Array.isArray(selectedBar?.currentStaff)
            ? selectedBar.currentStaff.length
            : 0;
    };

    const getStaffSlots = () => {
        return selectedBar?.staffSlots || 3;
    };

    const getCurrentStaff = () => {
        return Array.isArray(selectedBar?.currentStaff)
            ? selectedBar.currentStaff
            : [];
    };

    const safeTotalStat = (stat) => {
        if (!Array.isArray(selectedBar?.currentStaff)) {
            return 0;
        }
        return getTotalStat(selectedBar.currentStaff, stat);
    };

    // Get proper profit and sales values with fallbacks
    const getSalesVolume = () => {
        return (
            selectedBar?.salesVolume ||
            selectedBar?.forecastedProfit ||
            selectedBar?.baseProfit ||
            0
        );
    };

    // Get target values for each stat with fallbacks
    const getCuisineTarget = () =>
        selectedBar?.productCap || selectedBar?.maxProduct || 40;
    const getServiceTarget = () => selectedBar?.serviceCap || 20;
    const getAmbianceTarget = () => selectedBar?.ambianceCap || 10;

    // Filter employees based on search and tab
    const getFilteredEmployees = () => {
        let filtered = [...(allEmployees || [])];

        // Apply search term filter
        if (employeeSearchTerm.trim() !== "") {
            filtered = filtered.filter((emp) =>
                emp.name
                    .toLowerCase()
                    .includes(employeeSearchTerm.toLowerCase())
            );
        }

        // Apply tab filter
        if (activeTab === "Available") {
            filtered = filtered.filter((emp) => !emp.assigned);
        } else if (activeTab === "Assigned") {
            filtered = filtered.filter((emp) => emp.assigned);
        }

        return filtered;
    };

    // Récupérer le nom du restaurant à partir de son ID en utilisant le hook
    const getRestaurantName = (assignedId) => {
        if (!assignedId) return null;
        return getRestaurantNameById(assignedId);
    };

    const handleEmployeeClick = (employee) => {
        onAssignEmployee(employee);
    };

    const handleRemoveEmployeeClick = (employeeId, e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemoveEmployee(employeeId);
    };

    if (!selectedBar) return null;

    return (
        <div
            className="fixed z-50 transition-all duration-500"
            style={{
                left: `${detailsPosition.x}px`,
                top: `${detailsPosition.y}px`,
                transform: "translate(-50%, -50%)",
            }}
        >
            <MenuContainer
                animationState={showDetails ? "visible" : "hidden"}
                className="w-[750px] max-h-[80vh]"
                scrollable={true}
                maxHeight="80vh"
                title={selectedBar.name || "Restaurant"}
            >
                <div className="p-4">
                    <div className="flex justify-between mb-4 items-center">
                        <p className="italic text-[color:var(--color-principalBrown)] opacity-70">
                            {selectedBar.description ||
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
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm">
                                            <span
                                                style={{
                                                    color: "var(--color-principalBrown)",
                                                }}
                                            >
                                                💴 Sales Volume (lv.1/10)
                                            </span>
                                            <span className="text-emerald-600 font-semibold">
                                                {formatCurrency(
                                                    getSalesVolume()
                                                )}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full mt-1">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${
                                                        (getSalesVolume() /
                                                            10000) *
                                                        100
                                                    }%`,
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
                                                🍱 Cuisine (lv.1/10)
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
                                                💖 Service (lv.1/10)
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
                                                🎭 Ambiance (lv.1/10)
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
                          employee.assigned !== selectedBar.id
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
                                                        selectedBar.id
                                                            ? "text-emerald-600"
                                                            : "text-amber-600"
                                                    }`}
                                                >
                                                    {employee.assigned ===
                                                    selectedBar.id
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
                                            selectedBar.id ? (
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

                            <div className="flex justify-between mt-6">
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
                                        {formatCurrency(
                                            selectedBar.staffCost || 0
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
                                        Net Profit
                                    </h3>
                                    {(() => {
                                        const netProfit =
                                            (selectedBar.forecastedProfit ||
                                                0) -
                                            (selectedBar.staffCost || 0) -
                                            (selectedBar.maintenance || 0);
                                        const profitClass =
                                            netProfit < 0
                                                ? "text-orange-500"
                                                : "text-emerald-600";
                                        return (
                                            <p
                                                className={`${profitClass} font-bold`}
                                            >
                                                {formatCurrency(netProfit)}
                                            </p>
                                        );
                                    })()}
                                </div>
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

