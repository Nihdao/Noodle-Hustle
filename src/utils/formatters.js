/**
 * Format a numeric value as currency (Japanese Yen)
 * @param {number} value - The numeric value to format
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (value) => {
    return "¥" + new Intl.NumberFormat("en-US").format(value);
};

/**
 * Format a numeric value as a percentage
 * @param {number} value - The numeric value to format (0-1 or 0-100)
 * @returns {string} The formatted percentage string
 */
export const formatPercent = (value) => {
    // Check if the value is in decimal form (0-1) and convert to percentage if needed
    const percentValue = value > 1 ? value : value * 100;
    return percentValue.toFixed(1) + "%";
};

/**
 * Format a date value
 * @param {Date|number|string} date - The date to format
 * @returns {string} The formatted date string
 */
export const formatDate = (date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

