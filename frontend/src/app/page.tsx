import Link from "next/link";
import { PageHeader, Panel } from "@/shared/ui";

const roles = [
  { title: "Ingresar como consultor", description: "Administrar puestos, candidatos, preguntas, competencias, factores, empresas y reportes.", href: "/consultor", action: "Continuar como consultor" },
  { title: "Realizar cuestionario", description: "Ver el ejemplo de cuestionario para candidatos. El acceso y guardado todavía requieren endpoints del backend.", href: "/cuestionario", action: "Ir al cuestionario" },
];

export default function HomePage() {
  return <>
    <PageHeader eyebrow="miApp · Selección de perfil" title="¿Cómo querés ingresar?" description="Elegí el recorrido que querés probar. Esta selección solo navega por el prototipo: la autenticación todavía no está conectada." />
    <div className="grid gap-5 md:grid-cols-2">{roles.map((role) => <Panel key={role.href} title={role.title} description={role.description}>
      <Link className="mt-2 inline-flex min-h-10 items-center rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)]" href={role.href}>{role.action} →</Link>
    </Panel>)}</div>
  </>;
}
