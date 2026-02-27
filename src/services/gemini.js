/**
 * Google Gemini AI Integration for Lab Assistant
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const SYSTEM_PROMPT = `You are a helpful chemistry lab assistant for Reactech, a virtual chemistry lab application. Your role is to:

1. Help students understand chemical reactions and their properties
2. Explain safety precautions and risk levels (safe, moderate, danger)
3. Provide educational insights about acids, bases, metals, salts, and other chemical categories
4. Answer questions about chemical equations and reaction types
5. Be encouraging and supportive while maintaining scientific accuracy

Keep responses concise (2-3 paragraphs max), clear, and educational. Use emojis occasionally to make learning fun. When discussing reactions, always mention safety considerations.

Format your responses in plain text with simple HTML tags like <strong>, <em>, and <br> for formatting.`;

/**
 * Send a message to Gemini AI
 * @param {string} userMessage - The user's question
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} - AI response
 */
export async function askGemini(userMessage, conversationHistory = []) {
    if (!API_KEY) {
        console.warn('Gemini API key not configured');
        return 'AI assistant is not configured. Please add your Gemini API key to use this feature.';
    }

    try {
        // Build conversation context
        let contextText = SYSTEM_PROMPT + '\n\n';
        
        // Add recent conversation history (last 6 messages for context)
        const recentHistory = conversationHistory.slice(-6);
        if (recentHistory.length > 0) {
            contextText += 'Previous conversation:\n';
            recentHistory.forEach(msg => {
                const role = msg.role === 'user' ? 'Student' : 'Assistant';
                const text = msg.text || msg.html?.replace(/<[^>]*>/g, '') || '';
                contextText += `${role}: ${text}\n`;
            });
            contextText += '\n';
        }
        
        contextText += `Student: ${userMessage}\nAssistant:`;

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: contextText
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 500,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_ONLY_HIGH"
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Gemini API error:', error);
            throw new Error(error.error?.message || 'Failed to get AI response');
        }

        const data = await response.json();
        
        // Extract the response text
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiResponse) {
            throw new Error('No response generated');
        }

        return aiResponse;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return `Sorry, I encountered an error: ${error.message}. Please try again.`;
    }
}

/**
 * Check if Gemini API is configured
 * @returns {boolean}
 */
export function isGeminiConfigured() {
    return !!API_KEY;
}
