import type { EssenceDocument, MemoryExtended } from "@/lib/types"
import { MEMORY_TYPE_COLOR } from "@/lib/brain-logic"

/**
 * Mock essence document — the "soul" of the patient.
 * In production this would be co-authored by the primary caregiver
 * with input from family members, and refined over time.
 */
export const mockEssence: EssenceDocument = {
  patientName: "Elena",
  identityAffirmation:
    "Sos Elena Méndez. Naciste en Paraná, en 1948. Fuiste maestra de primaria durante 38 años. Querés a tus hijas más que a nada en el mundo. Te encanta el aroma del jazmín y cantar tangos.",
  keyPeople: [
    {
      name: "Marina",
      relation: "Tu hija mayor",
      description: "Vive en Rosario con Marcos y tus dos nietos, Joaco y Camila.",
      avatarColor: "#F472B6",
    },
    {
      name: "Lucía",
      relation: "Tu hija menor",
      description: "Médica pediatra en Buenos Aires. Te llama todos los domingos.",
      avatarColor: "#A78BFA",
    },
    {
      name: "Joaco",
      relation: "Tu nieto",
      description: "Tiene 9 años. Le encantan los dinosaurios y vos le contás cuentos de cuando eras chica.",
      avatarColor: "#FCD34D",
    },
    {
      name: "Camila",
      relation: "Tu nieta",
      description: "Tiene 6 años. Le pusieron tu segundo nombre.",
      avatarColor: "#FB923C",
    },
    {
      name: "Roberto",
      relation: "Tu esposo",
      description: "Estuvieron 52 años casados. Falleció en 2022. Lo conociste bailando un vals en el club.",
      avatarColor: "#7C3AED",
    },
  ],
  lifeline: [
    { year: 1948, event: "Naciste en Paraná, Entre Ríos." },
    { year: 1968, event: "Te recibiste de maestra normal." },
    { year: 1971, event: "Conociste a Roberto en un baile." },
    { year: 1973, event: "Se casaron un 12 de octubre.", linkedMemoryId: "donor-3" },
    { year: 1975, event: "Nació Marina, tu hija mayor." },
    { year: 1979, event: "Nació Lucía." },
    { year: 1985, event: "Te mudaste a Buenos Aires con la familia." },
    { year: 2006, event: "Te jubilaste después de 38 años enseñando." },
    { year: 2014, event: "Nació Joaco, tu primer nieto.", linkedMemoryId: "donor-1" },
    { year: 2017, event: "Nació Camila, tu nieta." },
    { year: 2022, event: "Falleció Roberto." },
    { year: 2024, event: "Empezaste a usar Antovel con ayuda de Marina." },
  ],
  dailyAnchors: [
    "Café con leche y tostadas a las 8 de la mañana",
    "Llamada con Lucía los domingos al mediodía",
    "Caminata por la plaza después del almuerzo",
    "El noticiero de las 8 de la noche",
    "Una galletita y manzanilla antes de dormir",
  ],
  reminiscencePrompts: [
    {
      prompt: "¿Te acordás cuando viste a Joaco por primera vez en el hospital?",
      linkedMemoryId: "donor-1",
      therapeuticGoal: "Reforzar el vínculo abuela-nieto y el rol de cuidadora.",
    },
    {
      prompt:
        "¿Te acordás del aula de tercer grado en la escuela 12, con las paredes pintadas de celeste?",
      linkedMemoryId: "donor-2",
      therapeuticGoal: "Activar la identidad profesional y el sentido de propósito.",
    },
    {
      prompt: "¿Te acordás del vestido amarillo que usaste el día que te casaste con Roberto?",
      linkedMemoryId: "donor-3",
      therapeuticGoal: "Reactivar la memoria emocional positiva del vínculo de pareja.",
    },
    {
      prompt: "¿Te acordás de las empanadas que hacía tu mamá los domingos en Paraná?",
      linkedMemoryId: "donor-4",
      therapeuticGoal: "Anclar al lugar de origen mediante memoria sensorial.",
    },
  ],
  emergencyContact: {
    name: "Marina (hija)",
    phone: "+54 9 341 555 4321",
    relation: "Hija mayor",
  },
  lastUpdatedBy: "Marina",
  lastUpdatedAt: "2025-01-15T14:32:00Z",
}

/**
 * Family-donated memories — these would be injected into the patient's brain
 * after caregiver approval. Each carries metadata about who donated and why.
 */
export const mockDonations: MemoryExtended[] = [
  {
    id: "donor-1",
    type: "photo",
    date: "2014-08-22",
    title: "Joaco recién nacido en tus brazos",
    tags: ["Familia", "Nietos"],
    location: { lat: -32.95, lng: -60.66, name: "Rosario, AR" },
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    description: "El día que conociste a tu primer nieto.",
    color: MEMORY_TYPE_COLOR.photo,
    source: "family",
    injectionStatus: "active",
    donorName: "Marina",
    donorRelation: "Hija mayor",
    injectionNote: "Mamá, este día no se olvida. Lo mirabas y llorabas de felicidad.",
    therapeuticTag: "family_bond",
    isFamilyDonation: true,
  },
  {
    id: "donor-2",
    type: "photo",
    date: "1995-03-08",
    title: "El aula de tercer grado",
    tags: ["Trabajo", "Escuela"],
    location: { lat: -34.6, lng: -58.4, name: "Buenos Aires, AR" },
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    description: "Vos al frente de la clase, con el guardapolvo y el delantal celeste.",
    color: MEMORY_TYPE_COLOR.photo,
    source: "family",
    injectionStatus: "active",
    donorName: "Lucía",
    donorRelation: "Hija menor",
    injectionNote: "La encontré entre las cosas de papá. Te amaban tus alumnos.",
    therapeuticTag: "identity",
    isFamilyDonation: true,
  },
  {
    id: "donor-3",
    type: "photo",
    date: "1973-10-12",
    title: "El día que te casaste con Roberto",
    tags: ["Familia", "Roberto"],
    location: { lat: -31.74, lng: -60.52, name: "Paraná, AR" },
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    description: "Vestido amarillo, ramo de jazmines, sonrisa enorme.",
    color: MEMORY_TYPE_COLOR.photo,
    source: "family",
    injectionStatus: "active",
    donorName: "Marina",
    donorRelation: "Hija mayor",
    injectionNote: "Tu día más feliz. Lo decías siempre.",
    therapeuticTag: "life_milestone",
    isFamilyDonation: true,
  },
  {
    id: "donor-4",
    type: "audio",
    date: "2020-05-10",
    title: "Receta de empanadas de la abuela",
    tags: ["Familia", "Cocina", "Paraná"],
    location: null,
    duration: "4:18",
    description: "Le dictaste la receta a Marina por teléfono durante la cuarentena.",
    color: MEMORY_TYPE_COLOR.audio,
    source: "family",
    injectionStatus: "pending",
    donorName: "Marina",
    donorRelation: "Hija mayor",
    injectionNote: "Tu voz acá vale oro. Se la quiero pasar a Camila cuando sea grande.",
    therapeuticTag: "sensory",
    isFamilyDonation: true,
  },
  {
    id: "donor-5",
    type: "photo",
    date: "2024-11-03",
    title: "Camila aprendiendo a andar en bici",
    tags: ["Familia", "Nietos"],
    location: { lat: -32.95, lng: -60.66, name: "Rosario, AR" },
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    description: "Su primera vez sin rueditas. Vos aplaudías desde el banco.",
    color: MEMORY_TYPE_COLOR.photo,
    source: "family",
    injectionStatus: "pending",
    donorName: "Marcos",
    donorRelation: "Yerno",
    injectionNote: "Te grabamos riéndote. Quiero que la veas siempre.",
    therapeuticTag: "family_bond",
    isFamilyDonation: true,
  },
]
