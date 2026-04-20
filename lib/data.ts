import questionBank from './question-bank.json'

export type UserRole = 'admin' | 'driver'

export interface User {
  id: string
  username: string
  password: string
  name: string
  role: UserRole
  email: string
}

export interface Unit {
  id: number
  title: string
  description: string
  topics: string[]
  guideFile: string
  presentationFile: string
  syncClassDate: string | null
  syncClassLink: string | null
}

export interface Question {
  pregunta: string
  a: string
  b: string
  c: string
  d: string
  correcta: 'a' | 'b' | 'c' | 'd'
}

export const USERS: User[] = [
  {
    id: 'admin-001',
    username: 'admin',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
    email: 'admin@linde.com',
  },
  {
    id: 'driver-001',
    username: 'chofer1',
    password: 'linde2024',
    name: 'Juan García',
    role: 'driver',
    email: 'j.garcia@linde.com',
  },
  {
    id: 'driver-002',
    username: 'chofer2',
    password: 'linde2024',
    name: 'Carlos López',
    role: 'driver',
    email: 'c.lopez@linde.com',
  },
  {
    id: 'driver-003',
    username: 'chofer3',
    password: 'linde2024',
    name: 'Roberto Martínez',
    role: 'driver',
    email: 'r.martinez@linde.com',
  },
  {
    id: 'driver-004',
    username: 'chofer.jesus',
    password: 'jesus',
    name: 'Jesús',
    role: 'driver',
    email: 'jesus@linde.com',
  },
  {
    id: 'driver-005',
    username: 'chofer.fidel',
    password: 'fidel',
    name: 'Fidel',
    role: 'driver',
    email: 'fidel@linde.com',
  },
  {
    id: 'driver-006',
    username: 'chofer.diego',
    password: 'diego',
    name: 'Diego',
    role: 'driver',
    email: 'diego@linde.com',
  },
]

export const UNITS: Unit[] = [
  {
    id: 1,
    title: 'Condiciones de trabajo en campo',
    description: 'Riesgos más comunes al intervenir cisternas, uso correcto del EPP y procedimientos previos a cualquier intervención.',
    topics: [
      'Riesgos: presión, bajas temperaturas, atmósferas asfixiantes',
      'Uso correcto de elementos de protección personal (EPP)',
      'Procedimientos previos a cualquier intervención',
      'Bloqueo, señalización y trabajo seguro (LOTO)',
      'Análisis de incidentes reales y lecciones aprendidas',
    ],
    guideFile: '/guias/Clase_01_Guia_de_Estudio.pdf',
    presentationFile: '/presentaciones/Clase_01_Presentacion.pdf',
    syncClassDate: '2025-05-15T10:00:00',
    syncClassLink: null,
  },
  {
    id: 2,
    title: 'Posibles fallas – Enfoque práctico',
    description: 'Fallas más habituales en cisternas de CO₂, cómo detectarlas directamente en campo y criterios para priorizar reparaciones.',
    topics: [
      'Fallas más habituales en cisternas de CO₂',
      'Pérdidas, sobrepresión, válvulas, carga y descarga',
      'Cómo detectar síntomas directamente en campo',
      'Criterios prácticos para evaluar riesgos',
      'Priorización de reparaciones',
    ],
    guideFile: '/guias/Clase_02_Guia_de_Estudio.pdf',
    presentationFile: '/presentaciones/Clase_02_Presentacion.pdf',
    syncClassDate: '2025-05-22T10:00:00',
    syncClassLink: null,
  },
  {
    id: 3,
    title: 'Cuadro de válvulas de cisterna de CO₂',
    description: 'Identificación del cuadro de válvulas en campo, función de cada válvula y maniobras correctas de operación.',
    topics: [
      'Identificación del cuadro de válvulas en campo',
      'Función de cada válvula: líquido, gas y seguridad',
      'Sentido de flujo y maniobras correctas',
      'Errores frecuentes de operación y cómo evitarlos',
    ],
    guideFile: '/guias/Clase_03_Guia_de_Estudio.pdf',
    presentationFile: '/presentaciones/Clase_03_Presentacion.pdf',
    syncClassDate: '2025-05-29T10:00:00',
    syncClassLink: null,
  },
  {
    id: 4,
    title: 'Tanque de almacenamiento (cisterna)',
    description: 'Estructura general del tanque, comportamiento de presión y temperatura en operación normal e inspecciones rutinarias.',
    topics: [
      'Estructura general del tanque y su funcionamiento interno',
      'Comportamiento de presión y temperatura en operación normal',
      'Inspecciones rutinarias recomendadas',
      'Puntos críticos donde suelen aparecer fallas',
    ],
    guideFile: '/guias/Clase_04_Guia_de_Estudio.pdf',
    presentationFile: '/presentaciones/Clase_04_Presentacion.pdf',
    syncClassDate: '2025-06-05T10:00:00',
    syncClassLink: null,
  },
  {
    id: 5,
    title: 'Tablero eléctrico',
    description: 'Componentes eléctricos que influyen en la operación de la cisterna, alarmas comunes y diagnóstico básico en campo.',
    topics: [
      'Componentes eléctricos que influyen en la operación',
      'Alarmas y señales más comunes',
      'Fallas eléctricas típicas en campo',
      'Diagnóstico básico sin conocimientos avanzados',
    ],
    guideFile: '/guias/Clase_05_Guia_de_Estudio.pdf',
    presentationFile: '/presentaciones/Clase_05_Presentacion.pdf',
    syncClassDate: '2025-06-12T10:00:00',
    syncClassLink: null,
  },
  {
    id: 6,
    title: 'Manómetros',
    description: 'Lectura correcta de manómetros en condiciones reales, identificación de valores normales y detección de fallas de presión.',
    topics: [
      'Lectura correcta de manómetros en operación real',
      'Identificación de valores normales y fuera de rango',
      'Detección de fallas asociadas a presión',
      'Criterios para calibración o reemplazo',
    ],
    guideFile: '/guias/Clase_06_Guia_de_Estudio.pdf',
    presentationFile: '/presentaciones/Clase_06_Presentacion.pdf',
    syncClassDate: '2025-06-19T10:00:00',
    syncClassLink: null,
  },
  {
    id: 7,
    title: 'Sistema de consumo y automatización',
    description: 'Cómo interactúa la cisterna con el sistema del cliente, regulación de presión y principios básicos de automatización.',
    topics: [
      'Cómo interactúa la cisterna con el sistema del cliente',
      'Regulación de presión en el punto de entrega',
      'Principios básicos de automatización',
      'Problemas más comunes asociados al consumo',
    ],
    guideFile: '/guias/Clase_07_Guia_de_Estudio.pdf',
    presentationFile: '/presentaciones/Clase_07_Presentacion.pdf',
    syncClassDate: '2025-06-26T10:00:00',
    syncClassLink: null,
  },
  {
    id: 8,
    title: 'Unidad condensadora',
    description: 'Función de la unidad condensadora dentro del sistema, fallas típicas y pautas de mantenimiento preventivo.',
    topics: [
      'Función de la unidad condensadora dentro del sistema',
      'Fallas típicas: falta de enfriamiento, sobrepresión',
      'Pautas de mantenimiento preventivo',
      'Indicadores de mal funcionamiento',
    ],
    guideFile: '/guias/Clase_08_Guia_de_Estudio.pdf',
    presentationFile: '/presentaciones/Clase_08_Presentacion.pdf',
    syncClassDate: '2025-07-03T10:00:00',
    syncClassLink: null,
  },
  {
    id: 9,
    title: 'Sistema de seguridad',
    description: 'Válvulas de alivio, discos de ruptura, protocolos de emergencia ante sobrepresión y errores críticos a evitar.',
    topics: [
      'Válvulas de alivio y discos de ruptura',
      'Qué hacer ante eventos de sobrepresión',
      'Protocolos de emergencia en campo',
      'Errores críticos que deben evitarse',
    ],
    guideFile: '/guias/Clase_09_Guia_de_Estudio.pdf',
    presentationFile: '/presentaciones/Clase_09_Presentacion.pdf',
    syncClassDate: '2025-07-10T10:00:00',
    syncClassLink: null,
  },
  {
    id: 10,
    title: 'Indicador de contenido',
    description: 'Funcionamiento del indicador de nivel, cómo validar si la medición es confiable y fallas más comunes del sistema.',
    topics: [
      'Funcionamiento del indicador de nivel',
      'Cómo validar si la medición es confiable',
      'Diferencias entre nivel real y nivel indicado',
      'Fallas más comunes del sistema de medición',
    ],
    guideFile: '/guias/Clase_10_Guia_de_Estudio.pdf',
    presentationFile: '/presentaciones/Clase_10_Presentacion.pdf',
    syncClassDate: '2025-07-17T10:00:00',
    syncClassLink: null,
  },
  {
    id: 11,
    title: 'Emplazamiento del tanque',
    description: 'Problemas generados por instalaciones deficientes, importancia de la accesibilidad y condiciones de seguridad del entorno.',
    topics: [
      'Problemas generados por instalaciones deficientes',
      'Importancia de la accesibilidad para mantenimiento',
      'Condiciones de seguridad del entorno del tanque',
      'Requisitos normativos de emplazamiento',
    ],
    guideFile: '/guias/Clase_11_Guia_de_Estudio.pdf',
    presentationFile: '/presentaciones/Clase_11_Presentacion.pdf',
    syncClassDate: '2025-07-24T10:00:00',
    syncClassLink: null,
  },
  {
    id: 12,
    title: 'Sistema de almacenamiento y suministro – Visión integral',
    description: 'Funcionamiento completo del sistema, relación entre todos los componentes y cómo una falla puntual puede generar problemas en cadena.',
    topics: [
      'Funcionamiento completo del sistema de suministro',
      'Relación entre todos los componentes',
      'Cómo una falla puntual genera problemas en cadena',
      'Integración de todos los conocimientos del curso',
    ],
    guideFile: '/guias/Clase_12_Guia_de_Estudio.pdf',
    presentationFile: '/presentaciones/Clase_12_Presentacion.pdf',
    syncClassDate: '2025-07-31T10:00:00',
    syncClassLink: null,
  },
]

/**
 * Full question bank: 50 questions per class, loaded from JSON.
 * The evaluation page picks 10 random questions per attempt.
 */
type RawQ = { pregunta: string; a: string; b: string; c: string; d: string; correcta: string }
const bank = questionBank as Record<string, RawQ[]>

export const QUESTIONS: Record<number, Question[]> = Object.fromEntries(
  Object.entries(bank).map(([key, qs]) => {
    const unitId = parseInt(key.replace('clase_', ''), 10)
    const typed: Question[] = qs.map((q) => ({
      pregunta: q.pregunta,
      a: q.a, b: q.b, c: q.c, d: q.d,
      correcta: q.correcta as 'a' | 'b' | 'c' | 'd',
    }))
    return [unitId, typed]
  })
)

/**
 * Construye la URL del video por convención: `clase-NN.mp4`.
 * Local dev: lee de `/videos/`; producción: usa NEXT_PUBLIC_VIDEOS_BASE_URL (R2).
 * Si el archivo no existe, el componente Video muestra el fallback "próximamente".
 */
export function getVideoUrl(unitId: number): string {
  const base = process.env.NEXT_PUBLIC_VIDEOS_BASE_URL || '/videos'
  const padded = String(unitId).padStart(2, '0')
  return `${base.replace(/\/$/, '')}/clase-${padded}.mp4`
}

/** Pick `count` unique random items from `arr` (Fisher–Yates partial shuffle). */
export function pickRandomQuestions(unitId: number, count: number): Question[] {
  const all = QUESTIONS[unitId] || []
  if (all.length <= count) return [...all]
  const copy = [...all]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}
