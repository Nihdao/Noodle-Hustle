import { useState } from "react";
import PropTypes from "prop-types";

const HelpModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState("basics");

    if (!isOpen) return null;

    const tabs = [
        { id: "basics", label: "Game Basics" },
        { id: "balance", label: "Balancing Act" },
        { id: "screens", label: "Gameplay Screens" },
        { id: "progression", label: "Progression" },
        { id: "tips", label: "Tips & Tricks" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "basics":
                return (
                    <>
                        <h3 className="text-xl font-bold mb-4 text-principalRed">
                            Game Basics
                        </h3>
                        <div className="space-y-4 text-principalBrown">
                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Noodle Balance
                                </h4>
                                <p>
                                    You&apos;re running an artisanal noodle
                                    business in a competitive market. As a
                                    former office worker who quit to pursue your
                                    culinary dreams, you must build a thriving
                                    business while keeping yourself mentally
                                    healthy.
                                </p>
                            </div>

                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Key Goals
                                </h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        Build and manage multiple noodle stands
                                    </li>
                                    <li>Hire and assign skilled employees</li>
                                    <li>Maintain positive cash flow</li>
                                    <li>Manage your mental health (burnout)</li>
                                    <li>Improve your business ranking</li>
                                    <li>
                                        Develop relationships with key figures
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Game Structure
                                </h4>
                                <p>
                                    The game progresses in periods. Each period,
                                    you make strategic decisions in the hub,
                                    then see the results during the delivery
                                    run.
                                </p>
                            </div>
                        </div>
                    </>
                );

            case "balance":
                return (
                    <>
                        <h3 className="text-xl font-bold mb-4 text-principalRed">
                            Balancing Act
                        </h3>
                        <div className="space-y-4 text-principalBrown">
                            <div className="bg-red-100 p-3 rounded-lg border-l-4 border-red-500">
                                <h4 className="font-bold text-lg mb-2">
                                    Game Over Conditions
                                </h4>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li className="font-bold">
                                        Burnout reaches 100% (mental health)
                                    </li>
                                    <li className="font-bold">
                                        Negative balance for 2 consecutive
                                        periods (bankruptcy)
                                    </li>
                                </ul>
                                <p className="mt-2 italic text-sm">
                                    The game requires balancing these two
                                    aspects carefully!
                                </p>
                            </div>

                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Burnout System
                                </h4>
                                <p className="mb-2">
                                    Your burnout increases from:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        Poor business performance (+30 when
                                        losing money)
                                    </li>
                                    <li>
                                        Normal business operations (+10 each
                                        period)
                                    </li>
                                    <li>Overwork and stress</li>
                                </ul>
                                <p className="mt-2">
                                    Reduce burnout through personal time
                                    activities and social interactions. Keep an
                                    eye on the burnout meter in the top right of
                                    the hub screen!
                                </p>
                            </div>

                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Financial Balance
                                </h4>
                                <p className="mb-2">
                                    Your business needs to generate profit to
                                    survive:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        Restaurant revenue depends on staff
                                        skills
                                    </li>
                                    <li>
                                        Employee salaries are a major expense
                                    </li>
                                    <li>
                                        Unassigned employees still cost money
                                    </li>
                                    <li>
                                        Restaurant maintenance costs are ongoing
                                    </li>
                                    <li>Debt payments must be managed</li>
                                </ul>
                                <p className="mt-2">
                                    Your business rank improves as your total
                                    balance increases.
                                </p>
                            </div>

                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Employee Morale
                                </h4>
                                <p>
                                    Employees in unprofitable restaurants lose
                                    20 morale. If your business has an overall
                                    loss, ALL employees lose 20 morale. Low
                                    morale impacts employee performance!
                                </p>
                            </div>
                        </div>
                    </>
                );

            case "screens":
                return (
                    <>
                        <h3 className="text-xl font-bold mb-4 text-principalRed">
                            Gameplay Screens
                        </h3>
                        <div className="space-y-4 text-principalBrown">
                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Hub Screen
                                </h4>
                                <p className="mb-2">
                                    This is your main control center with
                                    sections for:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        <strong>Noodle Bars</strong> - Manage
                                        your restaurants
                                    </li>
                                    <li>
                                        <strong>Employees</strong> - Hire, fire,
                                        and train staff
                                    </li>
                                    <li>
                                        <strong>Debts</strong> - Handle loans
                                        and repayments
                                    </li>
                                    <li>
                                        <strong>Personal Time</strong> - Manage
                                        burnout
                                    </li>
                                </ul>
                                <p className="mt-2">
                                    Click &quot;Start Period&quot; when
                                    you&apos;re ready to run your business and
                                    see results.
                                </p>
                            </div>

                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Noodle Bars Management
                                </h4>
                                <p className="mb-2">Three main sections:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        <strong>Assign</strong> - Place
                                        employees in restaurants
                                    </li>
                                    <li>
                                        <strong>Upgrade</strong> - Improve
                                        restaurant capabilities
                                    </li>
                                    <li>
                                        <strong>Buy/Sell</strong> - Acquire new
                                        locations or sell underperforming ones
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Employee Management
                                </h4>
                                <p className="mb-2">Two main sections:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        <strong>Management</strong> - Train,
                                        gift, or fire current employees
                                    </li>
                                    <li>
                                        <strong>Recruitment</strong> - Find and
                                        hire new talent
                                    </li>
                                </ul>
                                <p className="mt-2">
                                    Balance employee skills (cuisine, service,
                                    ambiance) with their salary costs.
                                </p>
                            </div>

                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Delivery Run
                                </h4>
                                <p>
                                    This passive animation shows the results of
                                    your period&apos;s business operations.
                                    After the animation, you&apos;ll see a
                                    detailed breakdown of profits and losses,
                                    along with rank progress.
                                </p>
                            </div>
                        </div>
                    </>
                );

            case "progression":
                return (
                    <>
                        <h3 className="text-xl font-bold mb-4 text-principalRed">
                            Progression
                        </h3>
                        <div className="space-y-4 text-principalBrown">
                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Business Ranking
                                </h4>
                                <p className="mb-2">
                                    Your business rank improves as your total
                                    balance increases:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Rank 101+: Street Noodle Stand</li>
                                    <li>Rank 61–100: Newcomer</li>
                                    <li>Rank 31–60: Promising Business</li>
                                    <li>Rank 11–30: Good Reputation</li>
                                    <li>Rank 2–10: Recognized Artisan</li>
                                    <li>Rank 1: Legendary Noodle Shop</li>
                                </ul>
                                <p className="mt-2">
                                    Reaching Rank 1 is your ultimate goal!
                                </p>
                            </div>

                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Social System
                                </h4>
                                <p>
                                    Build relationships with 5 key characters by
                                    meeting them during personal time. Higher
                                    relationship levels unlock buffs that
                                    provide various benefits to your business.
                                </p>
                            </div>
                        </div>
                    </>
                );

            case "tips":
                return (
                    <>
                        <h3 className="text-xl font-bold mb-4 text-principalRed">
                            Tips & Tricks
                        </h3>
                        <div className="space-y-4 text-principalBrown">
                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Starting Tips
                                </h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        Begin by understanding your existing
                                        restaurants and staff
                                    </li>
                                    <li>
                                        Make sure every employee is assigned to
                                        a restaurant
                                    </li>
                                    <li>
                                        Ensure each restaurant meets its
                                        cuisine, service, and ambiance targets
                                    </li>
                                    <li>
                                        Take personal time regularly to manage
                                        burnout
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Maximizing Profit
                                </h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        Match employee skills to restaurant
                                        needs
                                    </li>
                                    <li>
                                        Upgrade profitable restaurants first
                                    </li>
                                    <li>
                                        Sell underperforming restaurants that
                                        drain resources
                                    </li>
                                    <li>
                                        Keep unused employee costs low by
                                        assigning or firing
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Managing Burnout
                                </h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        Schedule personal time before burnout
                                        gets too high
                                    </li>
                                    <li>
                                        Invest in social relationships for
                                        burnout-reduction buffs
                                    </li>
                                    <li>
                                        Don&apos;t overexpand too quickly -
                                        growth increases stress
                                    </li>
                                    <li>
                                        Maintain a comfortable profit margin to
                                        avoid loss-related burnout
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-yellowWhite/30 p-3 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">
                                    Employee Happiness
                                </h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        Give gifts to boost morale when it drops
                                    </li>
                                    <li>
                                        Train employees to improve their skills
                                        and efficiency
                                    </li>
                                    <li>
                                        Assign employees to profitable
                                        restaurants to keep morale high
                                    </li>
                                    <li>
                                        Consider replacing low-performing
                                        employees when needed
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </>
                );

            default:
                return <div>Select a tab to see help content.</div>;
        }
    };

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            <div
                className="absolute inset-0 backdrop-blur-sm bg-black/30"
                onClick={onClose}
            />
            <div
                className={`bg-whiteCream rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative transition-all duration-300 ${
                    isOpen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                }`}
            >
                {/* Header */}
                <div className="bg-principalRed text-whiteCream p-4 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-2xl font-bold">
                        Noodle Balance Help Guide
                    </h2>
                    <button
                        onClick={onClose}
                        className="bg-white text-principalBrown bg-opacity-20 rounded-full p-2 hover:bg-opacity-30 transition-all"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
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

                {/* Tabs */}
                <div className="flex overflow-x-auto p-2 bg-principalBrown/10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`px-4 py-2 mx-1 rounded-lg font-medium whitespace-nowrap ${
                                activeTab === tab.id
                                    ? "bg-principalRed text-whiteCream"
                                    : "bg-whiteCream text-principalBrown hover:bg-principalRed/10"
                            } transition-colors`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {renderTabContent()}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-principalBrown/20 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-principalRed text-whiteCream rounded-lg hover:bg-principalRed-light transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

HelpModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default HelpModal;

