const PROMPT_TEMPLATES = {
    identity: () => "¿Cómo te llamás vos? ¿Cuál es tu nombre completo?",
    family_bond: (m) => `¿Te acordás de ${m.donor_name || "alguien de tu familia"}? ¿Quién es?`,
    life_milestone: (m) => `¿Recordás algo importante que pasó en el año ${new Date(m.date).getFullYear()}?`,
    happy_place: () => "¿Cuál es un lugar que siempre te gustó? ¿Un lugar que te da paz?",
    daily_anchor: () => "¿Qué es lo primero que hacés cuando te levantás por la mañana?",
    sensory: () => "¿Hay alguna música o aroma que te recuerde algo especial?",
};
function getDefaultPrompt() {
    return {
        prompt: "¿Cómo te sentís hoy? Contame algo que te haga feliz.",
        memoryId: "",
        memoryTitle: "",
        expectedAnswer: "",
        therapeuticGoal: "Evaluación general del estado",
        brainNodeHighlight: "",
    };
}
export function generateDailyPrompt(db, params) {
    const { patientId, currentState = "calm" } = params;
    // 1. Get memories with the least recent training, prioritized by therapeutic tag
    const leastRecalled = db
        .prepare(`SELECT m.*,
              COUNT(t.id) as training_count,
              SUM(CASE WHEN t.recalled = 1 THEN 1 ELSE 0 END) as recall_count
       FROM memories m
       LEFT JOIN memory_training t ON m.id = t.memory_id
       WHERE m.user_id = ? AND m.therapeutic_tag IS NOT NULL
       GROUP BY m.id
       ORDER BY
         CASE m.therapeutic_tag
           WHEN 'identity' THEN 1
           WHEN 'family_bond' THEN 2
           WHEN 'life_milestone' THEN 3
           WHEN 'daily_anchor' THEN 4
           WHEN 'happy_place' THEN 5
           ELSE 6
         END,
         training_count ASC
       LIMIT 5`)
        .all(patientId);
    if (leastRecalled.length === 0) {
        return getDefaultPrompt();
    }
    // 2. Select based on emotional state
    let selected = leastRecalled[0];
    if (currentState === "agitated" || currentState === "confused") {
        // When agitated: only identity or daily anchors (safest)
        const safe = leastRecalled.find((m) => m.therapeutic_tag === "identity" || m.therapeutic_tag === "daily_anchor");
        if (safe)
            selected = safe;
    }
    else if (currentState === "happy") {
        // When happy: try happy places or life milestones
        const joyful = leastRecalled.find((m) => m.therapeutic_tag === "happy_place" || m.therapeutic_tag === "life_milestone");
        if (joyful)
            selected = joyful;
    }
    // 3. Generate natural language prompt
    const template = PROMPT_TEMPLATES[selected.therapeutic_tag] || PROMPT_TEMPLATES.identity;
    return {
        prompt: template(selected),
        memoryId: selected.id,
        memoryTitle: selected.title,
        expectedAnswer: selected.title,
        therapeuticGoal: `Reforzar: ${selected.therapeutic_tag}`,
        hint: selected.injection_note || `Este recuerdo es: "${selected.title}"`,
        brainNodeHighlight: selected.id,
    };
}
//# sourceMappingURL=daily-prompt.js.map