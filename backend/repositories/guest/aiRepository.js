const db = require('../../config/db');

/**
 * Retrieve a list of available rooms to provide as context for the AI.
 * We only select necessary fields to save token usage and avoid sending sensitive info.
 */
async function getAvailableRoomsForAI() {
  return await db('rooms')
    .where({ status: 'AVAILABLE' })
    .select(
      'room_id',
      'title',
      'room_description',
      'monthly_rent',
      'deposit_amount',
      'electricity_cost',
      'water_cost',
      'internet_cost',
      'service_fee',
      'detailed_address',
      'room_type',
      'average_rating'
    )
    .limit(50); // Limit to 50 rooms to avoid exceeding OpenAI token limits
}

module.exports = {
  getAvailableRoomsForAI
};
