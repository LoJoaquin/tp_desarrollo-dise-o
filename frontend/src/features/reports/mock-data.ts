import type { ComparativeCandidate, ComparativeReport } from "./types";

// Datos de muestra para recorrer las pantallas hasta que el backend publique los endpoints del CU027.
export const comparativeCandidatesExample: ComparativeCandidate[] = [
  {
    idCuestionario: 8701,
    idCandidato: 401,
    nombre: "Lucía",
    apellido: "Gómez",
    tipoDocumento: "DNI",
    numeroDocumento: "30123456",
    numeroCandidato: "CAND-00401",
    fechaFinalizacion: "2026-11-18T14:30:00",
  },
  {
    idCuestionario: 8702,
    idCandidato: 402,
    nombre: "Mateo",
    apellido: "Fernández",
    tipoDocumento: "DNI",
    numeroDocumento: "32876543",
    numeroCandidato: "CAND-00402",
    fechaFinalizacion: "2026-11-17T10:15:00",
  },
];

export const comparativeReportExample: ComparativeReport = {
  idPuesto: 12,
  codigoPuesto: "PUE-012",
  nombrePuesto: "Analista de sistemas",
  empresa: "Empresa Norte",
  candidato: comparativeCandidatesExample[0],
  competencias: [
    { idCompetencia: 1, nombreCompetencia: "Gestión de proyectos", valorRequerido: 4.5, valorObtenido: 4.6 },
    { idCompetencia: 2, nombreCompetencia: "Liderazgo", valorRequerido: 4, valorObtenido: 3.6 },
    { idCompetencia: 3, nombreCompetencia: "Comunicación", valorRequerido: 4, valorObtenido: 4.2 },
    { idCompetencia: 4, nombreCompetencia: "Técnico", valorRequerido: 4.5, valorObtenido: 4.8 },
    { idCompetencia: 5, nombreCompetencia: "Trabajo en equipo", valorRequerido: 4, valorObtenido: 4.1 },
  ],
};
