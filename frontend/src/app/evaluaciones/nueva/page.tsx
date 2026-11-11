"use client";

import { useState, type FormEvent } from "react";
import * as service from "@/features/evaluations/service";
import type { EvaluationCandidate, EvaluationPosition, RequiredCompetency, ConfirmedEvaluation } from "@/features/evaluations/types";
import { useAction } from "@/shared/hooks/use-action";
import { Button, DataTable, ErrorMessage, Field, Notice, PageHeader, Panel, SelectField, StatusBadge } from "@/shared/ui";

export default function NewEvaluationPage() {
  const [criteria, setCriteria] = useState({ apellido: "", nombre: "", numeroCandidato: "" });
  const [matches, setMatches] = useState<EvaluationCandidate[]>([]); const [selected, setSelected] = useState<number[]>([]);
  const [positions, setPositions] = useState<EvaluationPosition[]>([]); const [positionId, setPositionId] = useState("");
  const [selectionChecked, setSelectionChecked] = useState(false);
  const [competencies, setCompetencies] = useState<RequiredCompetency[] | null>(null); const [confirmed, setConfirmed] = useState<ConfirmedEvaluation[] | null>(null);
  const [searched, setSearched] = useState(false); const action = useAction();
  async function search(event: FormEvent) { event.preventDefault(); setSearched(true); const result = await action.run(() => service.searchCandidatesForEvaluation(criteria)); if (result) { setMatches(result); setSelected([]); setPositions([]); setSelectionChecked(false); setCompetencies(null); setConfirmed(null); } }
  async function continueSelection() { const result = await action.run(() => service.validateSelectionAndListPositions({ idsCandidatos: selected }), "Selección validada."); if (result) { setPositions(result); setSelectionChecked(true); setPositionId(""); setCompetencies(null); } }
  async function verifyPosition() { const result = await action.run(() => service.verifyEvaluationPosition({ idPuesto: Number(positionId) })); if (result) setCompetencies(result); }
  async function confirm() { if (!window.confirm("¿Confirmar la evaluación para los candidatos y el puesto seleccionados?")) return; const result = await action.run(() => service.confirmEvaluation({ idsCandidatos: selected, idPuesto: Number(positionId) }), "Evaluación creada."); if (result) setConfirmed(result); }
  function toggleCandidate(id: number) { setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  return <><PageHeader eyebrow="Evaluaciones" title="Nueva evaluación" description="El flujo busca candidatos, valida la selección, verifica el puesto y confirma la creación." />
    <div className="space-y-6">
      {positions.length > 0 && <Panel title="2. Elegir puesto" description="El backend solo devuelve puestos activos y evaluables."><div className="flex flex-col gap-4 sm:flex-row sm:items-end"><SelectField className="flex-1" label="Puesto" value={positionId} onChange={(e) => { setPositionId(e.target.value); setCompetencies(null); }}><option value="">Seleccionar…</option>{positions.map((item) => <option key={item.idPuesto} value={item.idPuesto}>{item.nombrePuesto}{item.nombreEmpresa ? ` · ${item.nombreEmpresa}` : ""}</option>)}</SelectField><Button disabled={!positionId || action.isPending} onClick={verifyPosition}>Verificar puesto</Button></div></Panel>}
      {selectionChecked && positions.length === 0 && <Panel title="2. Elegir puesto"><Notice tone="warning">La selección se validó, pero el backend no devolvió puestos activos y evaluables para estos candidatos.</Notice></Panel>}
      {competencies && <Panel title="3. Competencias requeridas"><DataTable rows={competencies} rowKey={(row) => row.nombreCompetencia} columns={[{ key: "name", header: "Competencia", render: (row) => row.nombreCompetencia }, { key: "weight", header: "Ponderación", render: (row) => row.ponderacion }]} /><div className="mt-4"><Button disabled={action.isPending} onClick={confirm}>Confirmar evaluación</Button></div></Panel>}
      {confirmed && <Panel title="4. Evaluaciones generadas"><Notice tone="success" title="El backend confirmó la operación">Guardá las claves de ingreso para compartirlas con cada candidato.</Notice><DataTable rows={confirmed} rowKey={(row) => `${row.numeroDocumento}-${row.claveIngreso}`} columns={[{ key: "candidate", header: "Candidato", render: (row) => `${row.apellido}, ${row.nombre}` }, { key: "document", header: "Documento", render: (row) => `${row.tipoDocumento} ${row.numeroDocumento}` }, { key: "key", header: "Clave de ingreso", render: (row) => <strong className="font-mono">{row.claveIngreso}</strong> }]} /></Panel>}
      <ErrorMessage error={action.error} />{action.success && !confirmed && <Notice tone="success">{action.success}</Notice>}
    </div>
  </>;
}
