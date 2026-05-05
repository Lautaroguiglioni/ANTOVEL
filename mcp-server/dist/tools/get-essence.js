export function getEssence(db, params) {
    const { patientId } = params;
    const row = db
        .prepare(`SELECT * FROM essence_documents WHERE patient_id = ? ORDER BY updated_at DESC LIMIT 1`)
        .get(patientId);
    if (!row) {
        return { found: false, essence: null };
    }
    return {
        found: true,
        essence: {
            patientName: row.patient_name || "",
            identityAffirmation: row.identity_affirmation || "",
            keyPeople: JSON.parse(row.key_people || "[]"),
            lifeline: JSON.parse(row.lifeline || "[]"),
            dailyAnchors: JSON.parse(row.daily_anchors || "[]"),
            reminiscencePrompts: JSON.parse(row.reminiscence_prompts || "[]"),
            emergencyContact: row.emergency_contact ? JSON.parse(row.emergency_contact) : null,
            lastUpdatedBy: row.updated_by || "",
            lastUpdatedAt: row.updated_at || "",
        },
    };
}
//# sourceMappingURL=get-essence.js.map