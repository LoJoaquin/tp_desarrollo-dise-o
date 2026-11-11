import { PageHeader, Notice, Panel } from "@/shared/ui";

export function UnavailablePage({ title, useCase, reason, nextStep }: { title: string; useCase: string; reason: string; nextStep?: string }) {
  return <>
    <PageHeader eyebrow={useCase} title={title} description="La pantalla está preparada como referencia del flujo previsto." />
    <Panel title="Estado del caso de uso"><Notice tone="warning" title="Todavía no se puede probar con datos reales">{reason}</Notice>{nextStep && <p className="mt-4 text-sm leading-6 text-slate-600"><strong>Qué falta:</strong> {nextStep}</p>}</Panel>
  </>;
}
