"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCompetencies } from "@/features/competencies/hooks";
import type { Competency } from "@/features/competencies/types";
import { useFactors } from "@/features/factors/hooks";
import type { Factor } from "@/features/factors/types";
import {
  useConfirmGeneratedQuestion,
  useGenerateQuestionWithAi,
} from "@/features/questions/hooks";
import type {
  GeneratedQuestionPreview,
  GeneratedQuestionSaved,
} from "@/features/questions/types";
import {
  Button,
  DataTable,
  ErrorMessage,
  LoadingState,
  Notice,
  PageHeader,
  Panel,
  SelectField,
  TextAreaField,
} from "@/shared/ui";

export function AiQuestionGeneration() {
  const competencyAction = useCompetencies();
  const factorAction = useFactors();
  const generateAction = useGenerateQuestionWithAi();
  const confirmAction = useConfirmGeneratedQuestion();

  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(true);
  const [competencyId, setCompetencyId] = useState("");
  const [factorId, setFactorId] = useState("");
  const [indicaciones, setIndicaciones] = useState("");
  const [preview, setPreview] = useState<GeneratedQuestionPreview | null>(null);
  const [saved, setSaved] = useState<GeneratedQuestionSaved | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadReferences() {
      const [competencyRows, factorRows] = await Promise.all([
        competencyAction.execute(undefined),
        factorAction.execute(undefined),
      ]);

      if (!mounted) return;
      if (competencyRows) setCompetencies(competencyRows);
      if (factorRows) setFactors(factorRows);
      setLoadingReferences(false);
    }

    void loadReferences();
    return () => {
      mounted = false;
    };
  }, [competencyAction.execute, factorAction.execute]);

  const activeCompetencies = competencies.filter(
    (competency) => competency.estaActivo !== false,
  );

  const activeFactors = useMemo(
    () => factors.filter(
      (factor) => factor.estaActivo
        && factor.competenciaId === Number(competencyId),
    ),
    [factors, competencyId],
  );

  async function generate() {
    if (!factorId) return;

    const generated = await generateAction.execute({
      idFactor: Number(factorId),
      indicaciones: indicaciones.trim() || undefined,
    });

    if (generated) {
      setPreview(generated);
      setSaved(null);
      confirmAction.clear();
    }
  }

  async function confirm() {
    if (!preview) return;

    const result = await confirmAction.execute({
      idFactor: preview.idFactor,
      borrador: preview.borrador,
    });

    if (result) {
      setSaved(result);
      setPreview(null);
    }
  }

  function startAgain() {
    setSaved(null);
    setPreview(null);
    generateAction.clear();
    confirmAction.clear();
  }

  if (loadingReferences) {
    return <LoadingState label="Cargando competencias y factores…" />;
  }

  if (saved) {
    return (
      <>
        <PageHeader
          eyebrow="CU033 · Pregunta guardada"
          title="La pregunta quedó cargada"
          description={`Se creó la pregunta ${saved.idPregunta} para el factor ${saved.nombreFactor}.`}
        />
        <Panel title={saved.borrador.nombre}>
          <Notice tone="success">
            Se guardaron la pregunta, la escala de respuesta, los cinco detalles
            y sus ponderaciones.
          </Notice>
          <p className="font-semibold">{saved.borrador.textoPregunta}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={startAgain}>Generar otra pregunta</Button>
            <Link
              className="inline-flex min-h-10 items-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold"
              href="/administracion/preguntas"
            >
              Volver a gestionar preguntas
            </Link>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="CU033 · Asistencia de contenido"
        title="Generar pregunta con IA"
        description="Elegí competencia y factor. La IA prepara la pregunta y su escala; nada se guarda hasta que la aceptes."
      />

      <Panel title="Qué querés evaluar">
        <div className="grid gap-4">
          <SelectField
            label="Competencia"
            value={competencyId}
            onChange={(event) => {
              setCompetencyId(event.target.value);
              setFactorId("");
              setPreview(null);
            }}
          >
            <option value="">Seleccionar competencia…</option>
            {activeCompetencies.map((item) => (
              <option key={item.id} value={item.id}>{item.nombre}</option>
            ))}
          </SelectField>

          <SelectField
            label="Factor"
            value={factorId}
            disabled={!competencyId}
            onChange={(event) => {
              setFactorId(event.target.value);
              setPreview(null);
            }}
          >
            <option value="">Seleccionar factor…</option>
            {activeFactors.map((item) => (
              <option key={item.id} value={item.id}>{item.nombre}</option>
            ))}
          </SelectField>

          <TextAreaField
            label="Indicaciones para la pregunta (opcional)"
            maxLength={500}
            value={indicaciones}
            onChange={(event) => setIndicaciones(event.target.value)}
            placeholder="Ejemplo: que evalúe cómo organiza prioridades ante cambios."
          />

          <ErrorMessage error={competencyAction.error} />
          <ErrorMessage error={factorAction.error} />
          <ErrorMessage error={generateAction.error} />

          <div>
            <Button
              disabled={!factorId || generateAction.isPending || confirmAction.isPending}
              onClick={generate}
            >
              {generateAction.isPending
                ? "Generando…"
                : preview
                  ? "Generar otra propuesta"
                  : "Generar pregunta"}
            </Button>
          </div>
        </div>
      </Panel>

      {preview && (
        <Panel
          className="mt-6"
          title="Propuesta generada"
          description={`${preview.nombreCompetencia} · ${preview.nombreFactor}`}
        >
          <Notice tone="info">
            Revisá la pregunta y cada respuesta con su puntaje. Solo se guardará
            si elegís «Sí, guardar esta pregunta».
          </Notice>

          <dl className="grid gap-4">
            <div>
              <dt className="text-sm font-semibold">Nombre</dt>
              <dd>{preview.borrador.nombre}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Pregunta</dt>
              <dd>{preview.borrador.textoPregunta}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Descripción</dt>
              <dd>{preview.borrador.descripcion || "—"}</dd>
            </div>
          </dl>

          <Panel
            className="mt-5"
            title={preview.borrador.nombreOpcionRespuesta}
            description={preview.borrador.descripcionOpcionRespuesta}
          >
            <DataTable
              rows={preview.borrador.detalles}
              rowKey={(row) => row.ordenVisualizacion}
              columns={[
                {
                  key: "orden",
                  header: "Orden",
                  render: (row) => row.ordenVisualizacion,
                },
                {
                  key: "detalle",
                  header: "Respuesta",
                  render: (row) => row.descripcion,
                },
                {
                  key: "ponderacion",
                  header: "Ponderación",
                  render: (row) => row.ponderacion,
                },
              ]}
            />
            <p className="mt-3 text-sm font-semibold">
              Total: {preview.borrador.detalles.reduce(
                (total, item) => total + item.ponderacion,
                0,
              )} de 10
            </p>
          </Panel>

          <ErrorMessage error={confirmAction.error} />
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              disabled={confirmAction.isPending || generateAction.isPending}
              onClick={confirm}
            >
              {confirmAction.isPending
                ? "Guardando…"
                : "Sí, guardar esta pregunta"}
            </Button>
            <Button
              variant="secondary"
              disabled={generateAction.isPending || confirmAction.isPending}
              onClick={generate}
            >
              No, generar otra
            </Button>
          </div>
        </Panel>
      )}
    </>
  );
}
