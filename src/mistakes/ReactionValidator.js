/**
 * ReactionValidator — validates chemical pairs and blocks unsafe combos.
 */
import { REACTIONS, reactionKey, CHEMICALS } from '../chemicals';

/** Check if a chemical pair has a known reaction */
export function hasKnownReaction(chem1, chem2) {
    if (!chem1 || !chem2) return false;
    const key = reactionKey(chem1, chem2);
    return !!REACTIONS[key];
}

/** Get the reaction data for a pair (null if unknown) */
export function getReaction(chem1, chem2) {
    if (!chem1 || !chem2) return null;
    return REACTIONS[reactionKey(chem1, chem2)] || null;
}

/** Suggest valid reacting partners for a given chemical */
export function suggestPartners(chemId) {
    if (!chemId) return [];
    const suggestions = [];
    for (const key of Object.keys(REACTIONS)) {
        const [a, b] = key.split('__');
        if (a === chemId) suggestions.push(b);
        else if (b === chemId) suggestions.push(a);
    }
    return suggestions.map(id => {
        const ch = CHEMICALS.find(c => c.id === id);
        return ch ? { id, name: ch.name, formula: ch.formula } : { id, name: id, formula: id };
    });
}

/**
 * Validate a chemical selection pair.
 * Returns { valid, errors[] } where each error has { type, message, severity, suggestions? }
 */
export function validateSelection(chem1, chem2) {
    const errors = [];

    if (!chem1 || !chem2) {
        errors.push({
            type: 'incomplete_setup',
            message: 'Two chemicals required for mixing.',
            severity: 'warning',
        });
        return { valid: false, errors };
    }

    if (chem1 === chem2) {
        errors.push({
            type: 'same_chemical',
            message: 'Same chemical selected for both hands.',
            severity: 'warning',
            suggestions: suggestPartners(chem1),
        });
        return { valid: false, errors };
    }

    if (!hasKnownReaction(chem1, chem2)) {
        const name1 = CHEMICALS.find(c => c.id === chem1)?.formula || chem1;
        const name2 = CHEMICALS.find(c => c.id === chem2)?.formula || chem2;
        const sugg1 = suggestPartners(chem1);
        const sugg2 = suggestPartners(chem2);
        errors.push({
            type: 'no_reaction',
            message: `No reaction possible between ${name1} and ${name2}.`,
            severity: 'warning',
            suggestions: [...sugg1.slice(0, 2), ...sugg2.slice(0, 2)],
        });
        return { valid: false, errors };
    }

    // Check if reaction is high severity and should be blocked on repeat
    const rxn = getReaction(chem1, chem2);
    return { valid: true, errors, reaction: rxn };
}

/**
 * Determine if a reaction should be blocked based on severity and history.
 * Returns true if the reaction should proceed.
 */
export function shouldAllowReaction(chem1, chem2, dangerCount = 0) {
    const rxn = getReaction(chem1, chem2);
    if (!rxn) return false;
    // Block after 3+ consecutive danger triggers
    if (rxn.risk === 'danger' && dangerCount >= 3) return false;
    return true;
}
