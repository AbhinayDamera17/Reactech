/**
 * GestureAnalyzer — detects unsafe hand movements during mixing.
 * Tracks velocity and stability using a history buffer.
 *
 * IMPORTANT: Only flags extreme movements — normal convergence should NOT block.
 */

const HISTORY_SIZE = 20;       // frames of history (wider window = less sensitive)
const SPEED_THRESHOLD = 0.15;  // normalized units per frame (raised to avoid false blocks during convergence)
const SHAKE_THRESHOLD = 10;    // direction changes in history = shaking (raised threshold)

class HandHistory {
    constructor() { this.positions = []; }

    push(cx, cy) {
        this.positions.push({ cx, cy, ts: performance.now() });
        if (this.positions.length > HISTORY_SIZE) this.positions.shift();
    }

    /** Average speed over recent frames */
    getSpeed() {
        const p = this.positions;
        if (p.length < 2) return 0;
        let totalDist = 0;
        for (let i = 1; i < p.length; i++) {
            const dx = p[i].cx - p[i - 1].cx;
            const dy = p[i].cy - p[i - 1].cy;
            totalDist += Math.sqrt(dx * dx + dy * dy);
        }
        return totalDist / (p.length - 1);
    }

    /** Count direction reversals (shaking indicator) */
    getShakeScore() {
        const p = this.positions;
        if (p.length < 3) return 0;
        let reversals = 0;
        for (let i = 2; i < p.length; i++) {
            const dx1 = p[i - 1].cx - p[i - 2].cx;
            const dx2 = p[i].cx - p[i - 1].cx;
            const dy1 = p[i - 1].cy - p[i - 2].cy;
            const dy2 = p[i].cy - p[i - 1].cy;
            if ((dx1 > 0 && dx2 < 0) || (dx1 < 0 && dx2 > 0)) reversals++;
            if ((dy1 > 0 && dy2 < 0) || (dy1 < 0 && dy2 > 0)) reversals++;
        }
        return reversals;
    }

    clear() { this.positions = []; }
}

const histories = { left: new HandHistory(), right: new HandHistory() };

/**
 * Analyze hand movement for safety.
 * Returns { warnings[] } — only flags EXTREME movements.
 * Normal convergence or gentle movement will NOT trigger warnings.
 */
export function analyzeGestures(hands) {
    const warnings = [];

    hands.forEach(hand => {
        const h = histories[hand.side];
        if (!h) return;
        h.push(hand.cx, hand.cy);

        const speed = h.getSpeed();
        const shake = h.getShakeScore();

        if (speed > SPEED_THRESHOLD) {
            warnings.push({
                type: 'fast_movement',
                message: 'Unstable mixing motion detected.',
                advice: 'Move hands slowly for safe reaction.',
                severity: 'warning',
                hand: hand.side,
            });
        }

        if (shake > SHAKE_THRESHOLD) {
            warnings.push({
                type: 'shaking',
                message: `Rapid shaking detected (${hand.side} hand).`,
                advice: 'Keep hands steady during reaction.',
                severity: 'warning',
                hand: hand.side,
            });
        }
    });

    return warnings;
}

/** Reset histories when leaving live lab */
export function resetGestureHistory() {
    histories.left.clear();
    histories.right.clear();
}
