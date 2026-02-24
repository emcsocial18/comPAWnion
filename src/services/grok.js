// Grok API integration for xAI's LLM
// This module provides a function to call Grok's API for chat completions.
// You must provide your Grok API key (see https://grok.x.ai/ for details)

import axios from 'axios';

const GROK_API_KEY = 'YOUR_GROK_API_KEY_HERE'; // Replace with your Grok API key
const GROK_API_URL = 'https://api.grok.x.ai/v1/chat/completions';

/**
 * Calls Grok's chat completion API
 * @param {string} prompt - The prompt or user message
 * @param {Array} history - Conversation history (optional)
 * @returns {Promise<string>} - Grok's response
 */
export async function generateGrokResponse(prompt, history = []) {
  if (!GROK_API_KEY || GROK_API_KEY === 'YOUR_GROK_API_KEY_HERE') {
    throw new Error('Grok API key not set');
  }
  try {
    const messages = [
      ...history.slice(-10).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: prompt }
    ];
    const response = await axios.post(
      GROK_API_URL,
      {
        model: 'grok-1',
        messages,
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (
      response.data &&
      Array.isArray(response.data.choices) &&
      response.data.choices[0] &&
      response.data.choices[0].message &&
      response.data.choices[0].message.content
    ) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Unexpected Grok API response');
    }
  } catch (err) {
    console.error('Grok API error:', err);
    throw new Error('Grok API error');
  }
}
