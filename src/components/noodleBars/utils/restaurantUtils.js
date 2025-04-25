import { RANK_THRESHOLDS } from "../constants/noodleBarConstants";

// Helper function to calculate total stat values from the assigned staff
export function getTotalStat(staff, statName) {
    return staff.reduce((total, employee) => total + employee[statName], 0);
}

// Format currency in the Japanese yen format
export function formatCurrency(value) {
    return new Intl.NumberFormat("fr-FR").format(value) + " ¥";
}

// Calculate available slots based on player rank
export function getAvailableSlots(rank) {
    for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
        if (rank <= RANK_THRESHOLDS[i].rank) {
            return RANK_THRESHOLDS[i].slots;
        }
    }
    return 1; // Default minimum
}

// Get slot status (locked, available, purchased)
export function getSlotStatus(slotIndex, availableSlots, slot) {
    if (slotIndex >= availableSlots) {
        return "locked"; // Locked due to rank
    }

    // Vérifier si le slot est acheté en utilisant sa propriété purchased
    return slot && slot.purchased ? "purchased" : "available";
}

// Get next rank to unlock more slots
export function getNextRankUnlock(currentRank) {
    for (let i = 0; i < RANK_THRESHOLDS.length - 1; i++) {
        if (
            currentRank > RANK_THRESHOLDS[i + 1].rank &&
            currentRank <= RANK_THRESHOLDS[i].rank
        ) {
            return RANK_THRESHOLDS[i + 1].rank;
        }
    }
    return null; // No more ranks to unlock
}

