/**
 * SafetyAdvisor — calls POST /analyze-mistake with fallback explanations.
 */

const API_URL = 'http://localhost:8000/analyze-mistake';

// Local fallback explanations
const FALLBACK_ADVICE = {
    same_chemical: {
        explanation: 'A substance cannot react with itself under normal conditions.',
        advice: 'Choose two different chemicals to observe a reaction.',
        severity: 'warning',
    },
    no_reaction: {
        explanation: 'These chemicals do not have a known reaction in our database.',
        advice: 'Try pairing with a more reactive partner. Check the Reaction Guide for valid pairs.',
        severity: 'warning',
    },
    fast_movement: {
        explanation: 'Rapid hand movement can cause spills and splashing in a real lab.',
        advice: 'Move hands slowly and deliberately for safe mixing.',
        severity: 'warning',
    },
    shaking: {
        explanation: 'Shaking chemicals can cause violent splattering, especially with volatile reagents.',
        advice: 'Keep hands steady. In a real lab, use a magnetic stirrer instead.',
        severity: 'warning',
    },
    incomplete_setup: {
        explanation: 'Both hands must hold chemicals before mixing can occur.',
        advice: 'Assign a chemical to each hand using the sidebar selectors.',
        severity: 'info',
    },
    repeated_danger: {
        explanation: 'Repeatedly triggering dangerous reactions can cause cumulative harm.',
        advice: 'Review safety protocols. Try safer reaction pairs to learn fundamentals first.',
        severity: 'danger',
    },
    one_hand_missing: {
        explanation: 'Two hands are required to simulate mixing two chemicals.',
        advice: 'Ensure both hands are visible to the camera.',
        severity: 'info',
    },
};

/**
 * Get AI safety advice for a detected mistake.
 * Tries backend, falls back to local.
 */
export async function getAdvice(mistakeType, context = {}) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mistake_type: mistakeType,
                chem1: context.chem1 || '',
                chem2: context.chem2 || '',
                gesture_data: context.gestureData || null,
                detected_issue: mistakeType,
            }),
        });
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return FALLBACK_ADVICE[mistakeType] || {
            explanation: 'An issue was detected with your setup.',
            advice: 'Please review your chemical selections and hand positioning.',
            severity: 'warning',
        };
    }
}
