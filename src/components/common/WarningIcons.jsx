import PropTypes from "prop-types";

const WarningIcons = ({ funds, burnout }) => {
    const showFundsWarning = funds <= 0;
    const showBurnoutWarning = burnout >= 65;

    if (!showFundsWarning && !showBurnoutWarning) return null;

    return (
        <div className="fixed top-24 right-8 flex flex-col gap-2 z-50">
            {showFundsWarning && (
                <div className="relative group">
                    <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
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
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-bold">Financial Crisis!</span>
                    </div>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-red-500/95 text-white p-3 rounded-lg shadow-lg text-sm z-50 invisible group-hover:visible">
                        <strong>Warning:</strong> If your funds remain at or
                        below zero for another period, your business will go
                        bankrupt, resulting in game over!
                    </div>
                </div>
            )}
            {showBurnoutWarning && (
                <div className="relative group">
                    <div className="bg-orange-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
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
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                        <span className="font-bold">Burnout Warning!</span>
                    </div>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-orange-500/95 text-white p-3 rounded-lg shadow-lg text-sm z-50 invisible group-hover:visible">
                        <strong>Warning:</strong> Your burnout level is
                        dangerously high. If it reaches 100, you&apos;ll
                        experience complete burnout, resulting in game over!
                    </div>
                </div>
            )}
        </div>
    );
};

WarningIcons.propTypes = {
    funds: PropTypes.number.isRequired,
    burnout: PropTypes.number.isRequired,
};

export default WarningIcons;

