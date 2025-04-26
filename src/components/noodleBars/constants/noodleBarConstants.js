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
    if (level >= 1 && level <= 1) return 100000;
    if (level >= 2 && level <= 2) return 200000;
    if (level >= 3 && level <= 3) return 300000;
    if (level >= 4 && level <= 4) return 400000;
    if (level >= 5 && level <= 5) return 500000;
    if (level >= 6 && level <= 6) return 600000;
    if (level >= 7 && level <= 7) return 700000;
    if (level >= 8 && level <= 8) return 800000;
    if (level >= 9 && level <= 9) return 900000;
    if (level >= 10 && level <= 10) return 1000000;
    if (level >= 11 && level <= 11) return 1100000;
    if (level >= 12 && level <= 12) return 1200000;
    if (level >= 13 && level <= 13) return 1300000;
    if (level >= 14 && level <= 14) return 1400000;
    if (level >= 15 && level <= 15) return 1500000;
    if (level >= 16 && level <= 16) return 1600000;
    if (level >= 17 && level <= 17) return 1700000;
    if (level >= 18 && level <= 18) return 1800000;
    if (level >= 19 && level <= 19) return 1900000;
    if (level >= 20 && level <= 20) return 2000000;
    return 2000000; // fallback for levels > 20
};

// Cap increase per upgrade level
export const CAP_INCREASE_PER_LEVEL = 20;

