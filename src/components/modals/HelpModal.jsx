import PropTypes from "prop-types";
import { useState, useEffect } from "react";

const HelpModal = ({
    isOpen,
    onClose,
    isOnboarding = false,
    onCompleteOnboarding,
}) => {
    const [activeTab, setActiveTab] = useState("basics");
    const [onboardingStep, setOnboardingStep] = useState(0);

    useEffect(() => {
        if (isOnboarding) {
            setActiveTab("basics");
            setOnboardingStep(0);
        }
    }, [isOnboarding]);

    if (!isOpen) return null;

    const tabs = [
        { id: "basics", label: "Game Basics" },
        { id: "gameplay", label: "Gameplay" },
        { id: "tips", label: "Tips" },
    ];

    const handleNextStep = () => {
        if (!isOnboarding) {
            onClose();
            return;
        }

        if (onboardingStep < 2) {
            setOnboardingStep(onboardingStep + 1);
            setActiveTab(tabs[onboardingStep + 1].id);
        } else {
            onCompleteOnboarding?.();
            onClose();
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "basics":
                return (
                    <div className="space-y-4 text-principalBrown">
                        {isOnboarding && (
                            <div className="bg-principalRed/10 p-4 rounded-lg border border-principalRed/20 mb-4">
                                <h3 className="font-bold text-xl mb-2 text-principalRed">
                                    Welcome to Noodle Balance!
                                </h3>
                                <p className="text-principalBrown">
                                    Let&apos;s start your journey as a noodle
                                    shop owner. We&apos;ll guide you through the
                                    basics of running your business while
                                    maintaining a healthy work-life balance.
                                </p>
                            </div>
                        )}
                        <div className="bg-[#f9f3e5]/70 p-4 rounded-lg border border-[#e1d1b3]">
                            <h4 className="font-bold text-lg mb-2">About</h4>
                            <p>
                                Run your artisanal noodle business while
                                balancing personal well-being. Manage multiple
                                stands, employees, and build relationships to
                                become the top noodle chain.
                            </p>
                        </div>

                        <div className="bg-[#f9f3e5]/70 p-4 rounded-lg border border-[#e1d1b3]">
                            <h4 className="font-bold text-lg mb-2">
                                Game Over Conditions
                            </h4>
                            <ul className="list-disc pl-5">
                                <li>Burnout reaches 100%</li>
                                <li>Bankruptcy (negative balance)</li>
                            </ul>
                        </div>

                        <div className="bg-[#f9f3e5]/70 p-4 rounded-lg border border-[#e1d1b3]">
                            <h4 className="font-bold text-lg mb-2">Goal</h4>
                            <p>Reach Rank 1 (Legendary Noodle Shop) by:</p>
                            <ul className="list-disc pl-5">
                                <li>Growing your business</li>
                                <li>Managing finances</li>
                                <li>Building relationships</li>
                                <li>Maintaining mental health</li>
                            </ul>
                        </div>
                    </div>
                );

            case "gameplay":
                return (
                    <div className="space-y-4 text-principalBrown">
                        {isOnboarding && (
                            <div className="bg-principalRed/10 p-4 rounded-lg border border-principalRed/20 mb-4">
                                <h3 className="font-bold text-xl mb-2 text-principalRed">
                                    Understanding the Game Flow
                                </h3>
                                <p className="text-principalBrown">
                                    Here&apos;s how you&apos;ll manage your
                                    noodle empire. Each action you take affects
                                    your business and personal well-being.
                                </p>
                            </div>
                        )}
                        <div className="bg-[#f9f3e5]/70 p-4 rounded-lg border border-[#e1d1b3]">
                            <h4 className="font-bold text-lg mb-2">
                                Main Actions
                            </h4>
                            <ul className="list-disc pl-5">
                                <li>
                                    <strong>Noodle Bars:</strong> Manage
                                    restaurants, assign staff
                                </li>
                                <li>
                                    <strong>Employees:</strong> Hire, train,
                                    manage morale
                                </li>
                                <li>
                                    <strong>Personal Time:</strong> Reduce
                                    burnout, build relationships
                                </li>
                                <li>
                                    <strong>Finances:</strong> Handle loans and
                                    expenses
                                </li>
                            </ul>
                        </div>

                        <div className="bg-[#f9f3e5]/70 p-4 rounded-lg border border-[#e1d1b3]">
                            <h4 className="font-bold text-lg mb-2">
                                Game Flow
                            </h4>
                            <ol className="list-decimal pl-5">
                                <li>Make decisions in the hub</li>
                                <li>Start period to see results</li>
                                <li>Manage consequences</li>
                                <li>Take personal time when needed</li>
                            </ol>
                        </div>
                    </div>
                );

            case "tips":
                return (
                    <div className="space-y-4 text-principalBrown">
                        {isOnboarding && (
                            <div className="bg-principalRed/10 p-4 rounded-lg border border-principalRed/20 mb-4">
                                <h3 className="font-bold text-xl mb-2 text-principalRed">
                                    Ready to Start!
                                </h3>
                                <p className="text-principalBrown">
                                    Here are some key tips to help you succeed.
                                    Remember, balance is key - don&apos;t focus
                                    only on business growth!
                                </p>
                            </div>
                        )}
                        <div className="bg-[#f9f3e5]/70 p-4 rounded-lg border border-[#e1d1b3]">
                            <h4 className="font-bold text-lg mb-2">
                                Quick Tips
                            </h4>
                            <ul className="list-disc pl-5">
                                <li>
                                    Take personal time before burnout gets too
                                    high
                                </li>
                                <li>
                                    Match employee skills to restaurant needs
                                </li>
                                <li>Build relationships for helpful buffs</li>
                                <li>Don&apos;t expand too quickly</li>
                                <li>
                                    Keep employee morale high for better
                                    performance
                                </li>
                            </ul>
                        </div>
                    </div>
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
                onClick={isOnboarding ? undefined : onClose}
            />
            <div
                className={`bg-whiteCream rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative transition-all duration-300 ${
                    isOpen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                }`}
            >
                {/* Header */}
                <div className="bg-principalRed text-whiteCream p-4 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-2xl font-bold">
                        {isOnboarding
                            ? "Welcome to Noodle Balance!"
                            : "Quick Help Guide"}
                    </h2>
                    {!isOnboarding && (
                        <button
                            onClick={onClose}
                            className="bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors"
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
                    )}
                </div>

                {/* Tabs */}
                <div className="flex p-2 bg-principalBrown/10">
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            className={`px-4 py-2 mx-1 rounded-lg font-medium whitespace-nowrap ${
                                activeTab === tab.id
                                    ? "bg-principalRed text-whiteCream"
                                    : "bg-whiteCream text-principalBrown hover:bg-principalRed/10"
                            } transition-colors ${
                                isOnboarding ? "cursor-default" : ""
                            }`}
                            onClick={() =>
                                !isOnboarding && setActiveTab(tab.id)
                            }
                            disabled={isOnboarding}
                        >
                            {isOnboarding && (
                                <span className="mr-2">{index + 1}.</span>
                            )}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">{renderTabContent()}</div>

                {/* Footer */}
                <div className="p-4 border-t border-principalBrown/20 flex justify-end">
                    <button
                        onClick={handleNextStep}
                        className="px-6 py-2 bg-principalRed text-whiteCream rounded-lg hover:bg-principalRed-light transition-colors"
                    >
                        {isOnboarding
                            ? onboardingStep < 2
                                ? "Next Step"
                                : "Start Playing!"
                            : "Got it!"}
                    </button>
                </div>
            </div>
        </div>
    );
};

HelpModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isOnboarding: PropTypes.bool,
    onCompleteOnboarding: PropTypes.func,
};

export default HelpModal;

