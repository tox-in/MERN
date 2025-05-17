/**
 * Pricing utility for parking fee calculations
 */

/**
 * Base prices per hour by vehicle category (in RWF)
 */
const BASE_PRICES = {
    SMALL: 500,
    MINIBUS: 1000,
    BUS: 1500
};


/**
 * Calculate the duration of a parking session in minutes
 * @param {Date} entryTime - The entry time
 * @param {Date} exitTime - The exit time
 * @returns {number} - Duration in minutes
 */
const calculateDuration = (entryTime, exitTime) => {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);

    const diffMs = exit - entry;

    return Math.ceil(diffMs / (1000 * 60)); // Convert milliseconds to minutes
};


/**
 * Calculate the price for a parking session
 * @param {string} category - Vehicle category (SMALL, MINIBUS, BUS)
 * @param {number} durationMinutes - Duration in minutes
 * @returns {number} - Price in RWF
 */
const calculatePrice = (category, durationMinutes) => {
    const basePrice = BASE_PRICES[category] || BASE_PRICES.SMALL;
    const hours = Math.ceil(durationMinutes / 60);

    return basePrice * hours;
};


/**
 * Apply late payment penalties if applicable
 * @param {number} basePrice - The base price
 * @param {number} durationHours - Duration in hours
 * @param {boolean} isLatePayment - Whether this is a late payment
 * @returns {number} - Final price with penalties if applicable
 */
const applyPenalties = (basePrice, durationHours, isLatePayment) => {
    if(!isLatePayment) {
        return basePrice;
    }
    const penaltyRate = 0.7; // 70% penalty
    const penalty = basePrice * penaltyRate;

    return basePrice + penalty;
};

module.exports = {
    calculateDuration,
    calculatePrice,
    applyPenalties,
    BASE_PRICES
};