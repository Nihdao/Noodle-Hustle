// Rank threshold constants for restaurant unlocks
export const RANK_THRESHOLDS = [
    { rank: 200, slots: 1 }, // Default - 1 slot
    { rank: 175, slots: 2 }, // First unlock
    { rank: 125, slots: 3 }, // Second unlock
    { rank: 75, slots: 4 }, // Third unlock
    { rank: 25, slots: 5 }, // Final unlock
];

// Mock data for noodle bars
export const mockNoodleBars = [
    {
        id: 1,
        name: "Noodles Original",
        description: "Where it all began.",
        sellable: false,
        maxSales: 5,
        maxProduct: 5,
        maxService: 5,
        maxAmbiance: 5,
        maintenance: 100,
        forecastedProfit: 12657,
        staffCost: 8985,
        staffSlots: 3,
        unlocked: true,
        currentStaff: [
            {
                id: "e1",
                name: "Carl Ramen",
                type: "C",
                level: 3,
                service: 38,
                cuisine: 53,
                ambiance: 53,
            },
            {
                id: "e2",
                name: "Lucie Pho",
                type: "D",
                level: 3,
                service: 30,
                cuisine: 31,
                ambiance: 34,
            },
        ],
        currentUpgrades: {
            cuisine: 1,
            service: 1,
            ambiance: 1,
            salesVolume: 1,
        },
    },
];

// Mock data for available employees
export const mockEmployees = [
    {
        id: "e3",
        name: "Miso Master",
        type: "B",
        level: 4,
        service: 42,
        cuisine: 56,
        ambiance: 22,
        assigned: null,
    },
    {
        id: "e4",
        name: "Soba Specialist",
        type: "C",
        level: 2,
        service: 28,
        cuisine: 47,
        ambiance: 18,
        assigned: null,
    },
    {
        id: "e5",
        name: "Pho Phenom",
        type: "A",
        level: 5,
        service: 58,
        cuisine: 65,
        ambiance: 45,
        assigned: "Ramen Rodeo",
    },
    {
        id: "e6",
        name: "Wasabi Worker",
        type: "D",
        level: 1,
        service: 15,
        cuisine: 25,
        ambiance: 10,
        assigned: null,
    },
    {
        id: "e7",
        name: "Nori Ninja",
        type: "B",
        level: 3,
        service: 38,
        cuisine: 41,
        ambiance: 26,
        assigned: null,
    },
];

// Mock data for available restaurant slots (purchased or not)
export const mockRestaurantSlots = [
    { id: 1, purchased: true, name: "Noodles Original", barId: 1 },
    { id: 2, purchased: false, name: null, barId: null },
    { id: 3, purchased: false, name: null, barId: null },
    { id: 4, purchased: false, name: null, barId: null },
    { id: 5, purchased: false, name: null, barId: null },
];

// Upgrade categories and options for Noodle Bars
export const UPGRADE_CATEGORIES = [
    {
        id: "cuisine",
        name: "Cuisine Quality",
        description:
            "Improve your food quality to attract more customers and charge higher prices.",
        icon: "🍜",
        maxLevel: 5,
        baseMultiplier: 1.2, // Each level increases profit by 20%
    },
    {
        id: "service",
        name: "Customer Service",
        description:
            "Better service means happier customers and more repeat business.",
        icon: "💖",
        maxLevel: 5,
        baseMultiplier: 1.15, // Each level increases profit by 15%
    },
    {
        id: "ambiance",
        name: "Restaurant Ambiance",
        description:
            "Improve the atmosphere to enhance customer experience and satisfaction.",
        icon: "🎭",
        maxLevel: 5,
        baseMultiplier: 1.1, // Each level increases profit by 10%
    },
    {
        id: "salesVolume",
        name: "Sales Volume",
        description:
            "Expand your restaurant's capacity to serve more customers per period.",
        icon: "💹",
        maxLevel: 5,
        baseMultiplier: 1.25, // Each level increases profit by 25%
    },
];

// Cost scaling for upgrades (increases with level)
export const UPGRADE_COST_MULTIPLIER = {
    1: 1, // Level 1 to 2: Base cost
    2: 1.5, // Level 2 to 3: 1.5x base cost
    3: 2.25, // Level 3 to 4: 2.25x base cost
    4: 3.5, // Level 4 to 5: 3.5x base cost
};

// Base costs for each upgrade category
export const UPGRADE_BASE_COSTS = {
    cuisine: 15000,
    service: 10000,
    ambiance: 8000,
    salesVolume: 20000,
};

