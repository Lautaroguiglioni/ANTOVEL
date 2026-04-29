/**
 * Top 50 mock cities used by the StepPersonalData city autocomplete.
 * Includes the explicit picks from the brief (Buenos Aires, Paraná,
 * Córdoba, Madrid, Ciudad de México) plus a balanced global spread.
 *
 * Data is intentionally lightweight — name + country only — because the
 * autocomplete only needs to render a label like "Buenos Aires, Argentina"
 * after selection.
 */
export type City = {
  name: string
  country: string
}

export const CITIES: City[] = [
  // Argentina (explicit picks)
  { name: "Buenos Aires", country: "Argentina" },
  { name: "Paraná", country: "Argentina" },
  { name: "Córdoba", country: "Argentina" },
  { name: "Rosario", country: "Argentina" },
  { name: "Mendoza", country: "Argentina" },
  // LatAm
  { name: "Ciudad de México", country: "México" },
  { name: "Guadalajara", country: "México" },
  { name: "Monterrey", country: "México" },
  { name: "São Paulo", country: "Brasil" },
  { name: "Río de Janeiro", country: "Brasil" },
  { name: "Brasilia", country: "Brasil" },
  { name: "Lima", country: "Perú" },
  { name: "Santiago", country: "Chile" },
  { name: "Bogotá", country: "Colombia" },
  { name: "Medellín", country: "Colombia" },
  { name: "Caracas", country: "Venezuela" },
  { name: "Quito", country: "Ecuador" },
  { name: "Montevideo", country: "Uruguay" },
  { name: "Asunción", country: "Paraguay" },
  { name: "La Paz", country: "Bolivia" },
  // Europe
  { name: "Madrid", country: "España" },
  { name: "Barcelona", country: "España" },
  { name: "Lisboa", country: "Portugal" },
  { name: "París", country: "Francia" },
  { name: "Londres", country: "Reino Unido" },
  { name: "Berlín", country: "Alemania" },
  { name: "Roma", country: "Italia" },
  { name: "Milán", country: "Italia" },
  { name: "Ámsterdam", country: "Países Bajos" },
  { name: "Bruselas", country: "Bélgica" },
  { name: "Viena", country: "Austria" },
  { name: "Zúrich", country: "Suiza" },
  { name: "Estocolmo", country: "Suecia" },
  { name: "Copenhague", country: "Dinamarca" },
  { name: "Dublín", country: "Irlanda" },
  // North America
  { name: "Nueva York", country: "Estados Unidos" },
  { name: "Los Ángeles", country: "Estados Unidos" },
  { name: "Chicago", country: "Estados Unidos" },
  { name: "Miami", country: "Estados Unidos" },
  { name: "San Francisco", country: "Estados Unidos" },
  { name: "Toronto", country: "Canadá" },
  { name: "Vancouver", country: "Canadá" },
  // Asia & Oceania
  { name: "Tokio", country: "Japón" },
  { name: "Seúl", country: "Corea del Sur" },
  { name: "Shanghái", country: "China" },
  { name: "Hong Kong", country: "China" },
  { name: "Singapur", country: "Singapur" },
  { name: "Bangkok", country: "Tailandia" },
  { name: "Bombay", country: "India" },
  { name: "Dubái", country: "Emiratos Árabes Unidos" },
  { name: "Estambul", country: "Turquía" },
  { name: "Sídney", country: "Australia" },
]
