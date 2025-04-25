// Rank threshold constants for restaurant unlocks
export const RANK_THRESHOLDS = [
    { rank: 200, slots: 1 }, // Default - 1 slot
    { rank: 170, slots: 2 }, // First unlock
    { rank: 120, slots: 3 }, // Second unlock
    { rank: 70, slots: 4 }, // Third unlock
    { rank: 30, slots: 5 }, // Final unlock
];

// Upgrade categories and options for Noodle Bars
export const UPGRADE_CATEGORIES = [
    {
        id: "product",
        name: "Cuisine Quality",
        description:
            "Improve your food quality to attract more customers and charge higher prices.",
        icon: "🍜",
        statCap: "productCap",
        statMax: "maxProduct",
        salesVolumeBonus: 0.1, // 10% sales volume increase per level
    },
    {
        id: "service",
        name: "Customer Service",
        description:
            "Better service means happier customers and more repeat business.",
        icon: "💖",
        statCap: "serviceCap",
        statMax: "maxService",
        salesVolumeBonus: 0.1, // 10% sales volume increase per level
    },
    {
        id: "ambiance",
        name: "Restaurant Ambiance",
        description:
            "Improve the atmosphere to enhance customer experience and satisfaction.",
        icon: "🎭",
        statCap: "ambianceCap",
        statMax: "maxAmbiance",
        salesVolumeBonus: 0.1, // 10% sales volume increase per level
    },
];

// Cost scaling for upgrades based on level range
export const UPGRADE_COST_BY_LEVEL = (level) => {
    if (level >= 1 && level <= 5) return 50000;
    if (level >= 6 && level <= 10) return 100000;
    if (level >= 11 && level <= 15) return 150000;
    if (level >= 16 && level <= 20) return 200000;
    return 250000; // fallback for levels > 20
};

// Cap increase per upgrade level
export const CAP_INCREASE_PER_LEVEL = 20;

