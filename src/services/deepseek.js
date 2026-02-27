/**
 * DeepSeek AI Integration for Lab Assistant
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

const SYSTEM_PROMPT = `You are a helpful chemistry lab assistant for Reactech, a virtual chemistry lab application. Your role is to:

1. Help students understand chemical reactions and their properties
2. Explain safety precautions and risk levels (safe, moderate, danger)
3. Provide educational insights about acids, bases, metals, salts, and other chemical categories
4. Answer questions about chemical equations and reaction types
5. Be encouraging and supportive while maintaining scientific accuracy

Keep responses concise, clear, and educational. Use emojis occasionally to make learning fun. When discussing reactions, always mention safety considerations.`;

/**
 * Send a message to DeepSeek AI
 * @param {string} userMessage - The user's question
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} - AI response
 */
export async function askDeepSeek(userMessage, conversationHistory = []) {
    if (!API_KEY) {
        console.warn('DeepSeek API key not configured');
        return 'AI assistant is not configured. Please add your DeepSeek API key to use this feature.';
    }

    try {
        // Build messages array with system prompt and conversation history
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory.slice(-10).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.text || msg.html?.replace(/<[^>]*>/g, '') || '' // Strip HTML tags
            })),
            { role: 'user', content: userMessage }
        ];

        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
                stream: false
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('DeepSeek API error:', error);
            throw new Error(error.error?.message || 'Failed to get AI response');
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
        console.error('Error calling DeepSeek API:', error);
        return `Sorry, I encountered an error: ${error.message}. Please try again.`;
    }
}

/**
 * Check if DeepSeek API is configured
 * @returns {boolean}
 */
export function isDeepSeekConfigured() {
    return !!API_KEY;
}
