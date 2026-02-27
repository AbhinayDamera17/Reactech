const API_URL = 'http://localhost:8000/mix';

export async function mixChemicals(chem1, chem2) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chem1, chem2 }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json(); // { risk, effect, message, explanation, teacher_notes }
}
