"use client";

import { useState } from "react";
import { Button, Field, Notice, PageHeader, Panel } from "@/shared/ui";

export default function ComparativeReportPage() {
  const [candidateNumber, setCandidateNumber] = useState("");
  const [position, setPosition] = useState("");
  const [attempted, setAttempted] = useState(false);
  return <>
    <PageHeader eyebrow="Consultor · CU027" title="Emitir reporte comparativo" description="Preparar la comparación entre el resultado de un candidato y los requisitos del puesto." />
    <Notice tone="warning" title="La pantalla no puede emitir el reporte todavía">El backend no implementa el CU027. No existe una operación que calcule la comparación ni una respuesta con el contenido del reporte. Los campos solo permiten visualizar el punto de entrada del flujo.</Notice>
    <Panel title="Datos para la comparación"><form onSubmit={(event) => { event.preventDefault(); setAttempted(true); }} className="grid max-w-2xl gap-4 sm:grid-cols-2"><Field label="Número de candidato" value={candidateNumber} onChange={(event) => setCandidateNumber(event.target.value)} /><Field label="Código o nombre del puesto" value={position} onChange={(event) => setPosition(event.target.value)} /><div className="sm:col-span-2"><Button>Emitir reporte</Button></div></form>
      {attempted && <Notice tone="error" title="Reporte no generado">Falta implementar en el backend el endpoint que valide la evaluación del candidato para el puesto y devuelva el resultado comparativo. No se guardó ni se generó ningún reporte.</Notice>}
    </Panel>
    <Panel className="mt-6" title="Área del reporte"><p className="text-sm leading-6 text-slate-600">Cuando esté implementado, aquí se mostrará la información devuelta por el backend. El formato, los campos comparados y las reglas detalladas quedan sujetos al CU027 completo y al contrato que publique el backend.</p></Panel>
  </>;
}
