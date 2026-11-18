"use client";

import { useState, type FormEvent } from "react";
import * as service from "@/features/evaluations/service";
import type { EvaluationCandidate, EvaluationPosition, RequiredCompetency, ConfirmedEvaluation } from "@/features/evaluations/types";
import { useAction } from "@/shared/hooks/use-action";
import { Button, DataTable, ErrorMessage, Field, Notice, PageHeader, Panel, SelectField, ValidationSummary } from "@/shared/ui";

export default function NewEvaluationPage() {
  const [criteria, setCriteria] = useState({ apellido: "", nombre: "", numeroCandidato: "" });
  const [criteriaError, setCriteriaError] = useState<string[]>([]);
  const [matches, setMatches] = useState<EvaluationCandidate[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectionChecked, setSelectionChecked] = useState(false);
  const [positions, setPositions] = useState<EvaluationPosition[]>([]);
  const [positionId, setPositionId] = useState("");
  const [competencies, setCompetencies] = useState<RequiredCompetency[] | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedEvaluation[] | null>(null);
  const action = useAction();

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hasCriteria = Object.values(criteria).some((value) => value.trim().length > 0);
    if (!hasCriteria) {
      setCriteriaError(["Completá al menos un criterio de búsqueda."]);
      return;
    }

    setCriteriaError([]);
    setSearched(true);
    setMatches([]);
    setSelected([]);
    setPositions([]);
    setSelectionChecked(false);
    setPositionId("");
    setCompetencies(null);
    setConfirmed(null);
    action.clear();

    const result = await action.run(() => service.searchCandidatesForEvaluation(criteria));
    if (result) setMatches(result);
  }

  async function continueSelection() {
    action.clear();
    const result = await action.run(
      () => service.validateSelectionAndListPositions({ idsCandidatos: selected }),
      "Selección validada.",
    );
    if (result) {
      setPositions(result);
      setSelectionChecked(true);
      setPositionId("");
      setCompetencies(null);
      setConfirmed(null);
    }
  }

  async function verifyPosition() {
    if (!positionId) return;
    action.clear();
    const result = await action.run(
      () => service.verifyEvaluationPosition({ idPuesto: Number(positionId) }),
    );
    if (result) setCompetencies(result);
  }

  async function confirm() {
    if (!positionId || selected.length === 0) return;
    if (!window.confirm("¿Confirmar la evaluación para los candidatos y el puesto seleccionados?")) return;
    action.clear();
    const result = await action.run(
      () => service.confirmEvaluation({ idsCandidatos: selected, idPuesto: Number(positionId) }),
    );
    if (result) setConfirmed(result);
  }

  function toggleCandidate(id: number) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setPositions([]);
    setSelectionChecked(false);
    setPositionId("");
    setCompetencies(null);
    setConfirmed(null);
  }

  return <>
    <PageHeader
      eyebrow="Perfil consultor"
      title="Evaluar candidatos"
      description="Buscá y seleccioná candidatos, elegí un puesto y confirmá la generación de sus cuestionarios."
    />

    <div className="space-y-6">
      <Panel title="1. Buscar candidatos" description="Ingresá al menos un criterio. Nombre y apellido admiten coincidencias parciales.">
        <form noValidate onSubmit={search} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Número de candidato"
              value={criteria.numeroCandidato}
              onChange={(event) => { setCriteria({ ...criteria, numeroCandidato: event.target.value }); setCriteriaError([]); }}
            />
            <Field
              label="Apellido"
              value={criteria.apellido}
              onChange={(event) => { setCriteria({ ...criteria, apellido: event.target.value }); setCriteriaError([]); }}
            />
            <Field
              label="Nombre"
              value={criteria.nombre}
              onChange={(event) => { setCriteria({ ...criteria, nombre: event.target.value }); setCriteriaError([]); }}
            />
          </div>
          <ValidationSummary errors={criteriaError} />
          <div><Button type="submit" disabled={action.isPending}>Buscar candidatos</Button></div>
        </form>
      </Panel>

      {searched && <Panel
        title="Resultados de la búsqueda"
        description="Marcá uno o varios candidatos para continuar."
        actions={<span className="text-sm text-slate-600">Seleccionados: {selected.length}</span>}
      >
        <DataTable
          rows={matches}
          rowKey={(row) => row.id}
          emptyTitle="No se encontraron candidatos"
          emptyDescription="Probá con otros criterios de búsqueda."
          columns={[
            {
              key: "select",
              header: "Seleccionar",
              render: (row) => <input
                type="checkbox"
                checked={selected.includes(row.id)}
                onChange={() => toggleCandidate(row.id)}
                aria-label={"Seleccionar a " + row.nombre + " " + row.apellido}
              />,
            },
            { key: "numero", header: "N.º candidato", render: (row) => row.numeroCandidato },
            { key: "apellido", header: "Apellido", render: (row) => row.apellido },
            { key: "nombre", header: "Nombre", render: (row) => row.nombre },
          ]}
        />
        {matches.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button disabled={selected.length === 0 || action.isPending} onClick={continueSelection}>
            Validar selección y elegir puesto
          </Button>
          {selected.length === 0 && <span className="text-sm text-slate-500">Seleccioná al menos un candidato.</span>}
        </div>}
      </Panel>}

      {selectionChecked && positions.length === 0 && <Panel title="2. Elegir puesto">
        <Notice tone="warning">La selección se validó, pero el backend no encontró puestos activos y evaluables para esos candidatos.</Notice>
      </Panel>}

      {selectionChecked && positions.length > 0 && <Panel
        title="2. Elegir puesto"
        description="El backend solo ofrece puestos activos con condiciones para generar cuestionarios."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <SelectField
            className="flex-1"
            label="Puesto"
            value={positionId}
            onChange={(event) => { setPositionId(event.target.value); setCompetencies(null); setConfirmed(null); }}
          >
            <option value="">Seleccionar…</option>
            {positions.map((item) => <option key={item.idPuesto} value={item.idPuesto}>
              {item.nombrePuesto}{item.nombreEmpresa ? " · " + item.nombreEmpresa : ""}
            </option>)}
          </SelectField>
          <Button disabled={!positionId || action.isPending} onClick={verifyPosition}>Verificar puesto</Button>
        </div>
      </Panel>}

      {competencies !== null && <Panel title="3. Competencias requeridas">
        {competencies.length > 0
          ? <DataTable
              rows={competencies}
              rowKey={(row) => row.nombreCompetencia}
              columns={[
                { key: "competencia", header: "Competencia", render: (row) => row.nombreCompetencia },
                { key: "ponderacion", header: "Ponderación", render: (row) => row.ponderacion },
              ]}
            />
          : <Notice tone="warning">El backend no devolvió competencias para el puesto seleccionado.</Notice>}
        {competencies.length > 0 && <div className="mt-4">
          <Button disabled={action.isPending} onClick={confirm}>Confirmar evaluación</Button>
        </div>}
      </Panel>}

      {confirmed !== null && <Panel title="4. Evaluaciones generadas">
        <Notice tone="success" title="Evaluación confirmada">
          Guardá las claves de ingreso y compartí cada una con su candidato.
        </Notice>
        <DataTable
          rows={confirmed}
          rowKey={(row) => row.numeroDocumento + "-" + row.claveIngreso}
          emptyTitle="No se generaron evaluaciones"
          columns={[
            { key: "candidate", header: "Candidato", render: (row) => row.apellido + ", " + row.nombre },
            { key: "document", header: "Documento", render: (row) => row.tipoDocumento + " " + row.numeroDocumento },
            { key: "key", header: "Clave de ingreso", render: (row) => <strong className="font-mono">{row.claveIngreso}</strong> },
          ]}
        />
      </Panel>}

      <ErrorMessage error={action.error} />
    </div>
  </>;
}