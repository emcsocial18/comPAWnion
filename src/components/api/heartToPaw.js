import axios from 'axios';

const API_URL = 'https://api.hearttopaw.ai/v1/respond'; // Heart to Paw AI endpoint
const API_KEY = process.env.REACT_APP_HEART_TO_PAW_API_KEY || '';

/**
 * Get AI response from Heart to Paw API, with pet and history context if supported.
 * @param {string} userMessage
 * @param {object} pet
 * @param {array} history
 */
export const getAIResponse = async (userMessage, pet = null, history = null) => {
  try {
    // Send pet and history if API supports it, else just message
    const payload = { message: userMessage };
    if (pet) payload.pet = pet;
    if (history) payload.history = history;
    const response = await axios.post(
      API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    console.log('Heart to Paw API raw response:', response.data);
    // Assuming API returns { response: "..." }
    return response.data.response;
  } catch (error) {
    console.error('Heart to Paw AI error:', error.response || error.message);
    return 'Sorry, something went wrong with Heart to Paw AI.';
  }
};
